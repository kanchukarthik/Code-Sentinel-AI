"""Pydantic schemas for Project."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    git_url: Optional[str] = None
    default_branch: str = "main"
    language: str = "python"


class ProjectCreate(ProjectBase):
    source_type: str = "zip"  # 'zip', 'git', 'sample'


class ProjectResponse(ProjectBase):
    id: str
    source_type: str
    source_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    total_runs: int = 0
    latest_coverage: Optional[float] = None
    open_bugs_count: int = 0

    model_config = ConfigDict(from_attributes=True)
