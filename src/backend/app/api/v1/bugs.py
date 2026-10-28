"""Bug detection endpoints: list defects and inspect stack traces."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bug_report import BugReport
from app.models.root_cause import RootCauseResult
from app.schemas.bug import BugReportResponse, RootCauseResponse, RootCauseRankingItem

router = APIRouter(tags=["Bugs"])


@router.get("/runs/{run_id}/bugs", response_model=List[BugReportResponse])
def get_run_bugs(
    run_id: str,
    severity: Optional[str] = Query(None, description="Filter by severity (critical, high, medium, low)"),
    status: Optional[str] = Query(None, description="Filter by status (open, patch_ready, resolved)"),
    db: Session = Depends(get_db),
):
    """Retrieve all detected defects for a specific run."""
    query = db.query(BugReport).filter(BugReport.run_id == run_id)
    if severity and severity != "ALL":
        query = query.filter(BugReport.severity == severity)
    if status and status != "ALL":
        query = query.filter(BugReport.status == status)

    bugs = query.order_by(BugReport.created_at.asc()).all()
    results = []
    for b in bugs:
        rc = db.query(RootCauseResult).filter(RootCauseResult.bug_id == b.id).first()
        rc_schema = None
        if rc:
            rankings = [
                RootCauseRankingItem(
                    rank=r.get("rank", idx + 1),
                    file=r.get("file", b.target_file),
                    line=r.get("line", b.target_line),
                    score=r.get("score", 0.0),
                    code=r.get("code", ""),
                    is_suspect=r.get("is_suspect", False),
                )
                for idx, r in enumerate(rc.rankings_json or [])
            ]
            rc_schema = RootCauseResponse(
                id=rc.id,
                run_id=rc.run_id,
                bug_id=rc.bug_id,
                method=rc.method,
                top1_accuracy=rc.top1_accuracy,
                top3_accuracy=rc.top3_accuracy,
                top5_accuracy=rc.top5_accuracy,
                rankings_json=rankings,
                created_at=rc.created_at,
            )

        results.append(
            BugReportResponse(
                id=b.id,
                run_id=b.run_id,
                bug_key=b.bug_key,
                title=b.title,
                severity=b.severity,
                category=b.category,
                target_file=b.target_file,
                target_function=b.target_function,
                target_line=b.target_line,
                detection_confidence=b.detection_confidence,
                static_linter=b.static_linter,
                dynamic_test_id=b.dynamic_test_id,
                stack_trace=b.stack_trace,
                execution_log=b.execution_log,
                root_cause_explanation=b.root_cause_explanation,
                status=b.status,
                created_at=b.created_at,
                root_cause=rc_schema,
            )
        )
    return results


@router.get("/bugs/{bug_id}", response_model=BugReportResponse)
def get_bug(bug_id: str, db: Session = Depends(get_db)):
    """Retrieve full details of a specific bug report."""
    b = db.query(BugReport).filter(BugReport.id == bug_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bug not found")

    rc = db.query(RootCauseResult).filter(RootCauseResult.bug_id == b.id).first()
    rc_schema = None
    if rc:
        rankings = [
            RootCauseRankingItem(
                rank=r.get("rank", idx + 1),
                file=r.get("file", b.target_file),
                line=r.get("line", b.target_line),
                score=r.get("score", 0.0),
                code=r.get("code", ""),
                is_suspect=r.get("is_suspect", False),
            )
            for idx, r in enumerate(rc.rankings_json or [])
        ]
        rc_schema = RootCauseResponse(
            id=rc.id,
            run_id=rc.run_id,
            bug_id=rc.bug_id,
            method=rc.method,
            top1_accuracy=rc.top1_accuracy,
            top3_accuracy=rc.top3_accuracy,
            top5_accuracy=rc.top5_accuracy,
            rankings_json=rankings,
            created_at=rc.created_at,
        )

    return BugReportResponse(
        id=b.id,
        run_id=b.run_id,
        bug_key=b.bug_key,
        title=b.title,
        severity=b.severity,
        category=b.category,
        target_file=b.target_file,
        target_function=b.target_function,
        target_line=b.target_line,
        detection_confidence=b.detection_confidence,
        static_linter=b.static_linter,
        dynamic_test_id=b.dynamic_test_id,
        stack_trace=b.stack_trace,
        execution_log=b.execution_log,
        root_cause_explanation=b.root_cause_explanation,
        status=b.status,
        created_at=b.created_at,
        root_cause=rc_schema,
    )
