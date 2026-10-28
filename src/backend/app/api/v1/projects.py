"""Project endpoints: upload zip, connect git, list and view projects."""

import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.project import Project
from app.models.run import Run
from app.models.bug_report import BugReport
from app.models.metric import MetricSnapshot
from app.schemas.project import ProjectResponse, ProjectCreate
from app.sandbox.workspace import WorkspaceManager

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all registered projects with summary statistics."""
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        runs_count = db.query(Run).filter(Run.project_id == p.id).count()
        latest_metric = (
            db.query(MetricSnapshot)
            .join(Run, Run.id == MetricSnapshot.run_id)
            .filter(Run.project_id == p.id)
            .order_by(Run.run_number.desc())
            .first()
        )
        open_bugs = (
            db.query(BugReport)
            .join(Run, Run.id == BugReport.run_id)
            .filter(Run.project_id == p.id, BugReport.status.in_(["open", "patch_ready"]))
            .count()
        )

        results.append(
            ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                source_type=p.source_type,
                source_path=p.source_path,
                git_url=p.git_url,
                default_branch=p.default_branch,
                language=p.language,
                created_at=p.created_at,
                updated_at=p.updated_at,
                total_runs=runs_count,
                latest_coverage=latest_metric.code_coverage_pct if latest_metric else None,
                open_bugs_count=open_bugs,
            )
        )
    return results


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    git_url: Optional[str] = Form(None),
    default_branch: str = Form("main"),
    language: str = Form("python"),
    source_type: str = Form("zip"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Register a new project via zip upload or Git URL."""
    project_id = str(uuid.uuid4())
    project_dir = settings.PROJECTS_DIR / f"{name.lower().replace(' ', '_')}_{project_id[:8]}"
    project_dir.mkdir(parents=True, exist_ok=True)

    if file and file.filename.endswith(".zip"):
        temp_zip = settings.UPLOADS_DIR / f"{project_id}_{file.filename}"
        with open(temp_zip, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract with ZipSlip protection
        try:
            WorkspaceManager.safe_extract_zip(temp_zip, project_dir)
        finally:
            if temp_zip.exists():
                temp_zip.unlink()
        source_type = "zip"
    elif git_url:
        source_type = "git"
    else:
        # Create empty template project
        (project_dir / "main.py").write_text("# CodeSentinel project\n", encoding="utf-8")
        source_type = "custom"

    project = Project(
        id=project_id,
        name=name,
        description=description,
        source_type=source_type,
        source_path=str(project_dir),
        git_url=git_url,
        default_branch=default_branch,
        language=language,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        source_type=project.source_type,
        source_path=project.source_path,
        git_url=project.git_url,
        default_branch=project.default_branch,
        language=project.language,
        created_at=project.created_at,
        updated_at=project.updated_at,
        total_runs=0,
        latest_coverage=None,
        open_bugs_count=0,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed project information."""
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

    runs_count = db.query(Run).filter(Run.project_id == p.id).count()
    latest_metric = (
        db.query(MetricSnapshot)
        .join(Run, Run.id == MetricSnapshot.run_id)
        .filter(Run.project_id == p.id)
        .order_by(Run.run_number.desc())
        .first()
    )
    open_bugs = (
        db.query(BugReport)
        .join(Run, Run.id == BugReport.run_id)
        .filter(Run.project_id == p.id, BugReport.status.in_(["open", "patch_ready"]))
        .count()
    )

    return ProjectResponse(
        id=p.id,
        name=p.name,
        description=p.description,
        source_type=p.source_type,
        source_path=p.source_path,
        git_url=p.git_url,
        default_branch=p.default_branch,
        language=p.language,
        created_at=p.created_at,
        updated_at=p.updated_at,
        total_runs=runs_count,
        latest_coverage=latest_metric.code_coverage_pct if latest_metric else None,
        open_bugs_count=open_bugs,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete project and associated file system artifacts."""
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    if p.source_path and Path(p.source_path).exists():
        shutil.rmtree(p.source_path, ignore_errors=True)

    db.delete(p)
    db.commit()
    return None
