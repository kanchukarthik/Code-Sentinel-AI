"""Pydantic schemas for BugReport and RootCause."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class RootCauseRankingItem(BaseModel):
    rank: int
    file: str
    line: int
    score: float
    code: str
    is_suspect: bool


class RootCauseResponse(BaseModel):
    id: str
    run_id: str
    bug_id: str
    method: str
    top1_accuracy: bool
    top3_accuracy: bool
    top5_accuracy: bool
    rankings_json: List[RootCauseRankingItem] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BugReportResponse(BaseModel):
    id: str
    run_id: str
    bug_key: str
    title: str
    severity: str
    category: str
    target_file: str
    target_function: str
    target_line: int
    detection_confidence: float
    static_linter: Optional[str] = None
    dynamic_test_id: Optional[str] = None
    stack_trace: Optional[str] = None
    execution_log: Optional[str] = None
    root_cause_explanation: Optional[str] = None
    status: str
    created_at: datetime
    root_cause: Optional[RootCauseResponse] = None

    model_config = ConfigDict(from_attributes=True)
