"""Pydantic schemas for TestCase and TestResult."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class TestCaseResponse(BaseModel):
    id: str
    run_id: str
    test_key: str
    name: str
    category: str
    target_file: str
    target_function: str
    line_start: int
    line_end: int
    code_snippet: str
    agent_rationale: Optional[str] = None
    mutation_impact_pct: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TestResultResponse(BaseModel):
    id: str
    run_id: str
    test_case_id: Optional[str] = None
    name: str
    status: str
    duration_ms: int
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    failure_message: Optional[str] = None
    stack_trace: Optional[str] = None
    is_synthesized: bool

    model_config = ConfigDict(from_attributes=True)
