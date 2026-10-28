"""Pydantic schemas for Patch."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class PatchValidationReport(BaseModel):
    baseline_passed: int
    baseline_total: int
    synthesized_passed: int
    synthesized_total: int
    regressions_introduced: int
    mutation_score_delta_pct: float
    false_positive_risk: float
    verdict: str
    verifier_notes: Optional[str] = None


class PatchActionRequest(BaseModel):
    notes: Optional[str] = None
    rollback_reason: Optional[str] = None


class PatchResponse(BaseModel):
    id: str
    run_id: str
    bug_id: str
    patch_key: str
    iteration: int
    strategy: str
    target_file: str
    diff_content: str
    status: str
    confidence_score: float
    explanation: Optional[str] = None
    author_agent: str
    validation_result_json: Optional[Dict[str, Any]] = None
    reviewer_notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    rolled_back_at: Optional[datetime] = None
    rollback_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
