"""Pydantic schemas for Metrics, Coverage, and Feedback."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class CoverageSnapshotResponse(BaseModel):
    id: str
    run_id: str
    statement_coverage_pct: float
    branch_coverage_pct: float
    uncovered_lines_count: int
    file_coverage_json: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricSnapshotResponse(BaseModel):
    id: str
    run_id: str
    code_coverage_pct: float
    branch_coverage_pct: float
    mutation_score: float
    defect_detection_rate: float
    fault_localization_top1_acc: float
    fault_localization_top3_acc: float
    false_positive_rate: float
    patch_success_rate: float
    execution_duration_sec: float
    total_tokens_used: int
    cost_usd: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricTrendPoint(BaseModel):
    run_id: str
    run_number: int
    commit_short: str
    timestamp: str
    code_coverage_pct: float
    mutation_score: float
    defect_detection_rate: float
    fault_localization_top1_acc: float
    false_positive_rate: float
    patch_success_rate: float
    execution_duration_sec: float
    total_tokens_used: int


class MetricSummaryResponse(BaseModel):
    total_runs: int
    average_coverage_pct: float
    average_mutation_score: float
    total_defects_found: int
    total_patches_applied: int
    trends: List[MetricTrendPoint] = []


class FeedbackRecordResponse(BaseModel):
    id: str
    project_id: str
    run_id: str
    bug_category: str
    repair_strategy: str
    success: bool
    iterations_needed: int
    tests_synthesized_count: int
    mutation_delta: float
    tuning_parameters_json: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
