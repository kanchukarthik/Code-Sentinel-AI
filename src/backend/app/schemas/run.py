"""Pydantic schemas for Run and AgentTask."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class AgentTaskResponse(BaseModel):
    id: str
    run_id: str
    agent_id: str
    agent_name: str
    order: int
    status: str
    progress: int
    current_action: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: int = 0
    tokens_used: int = 0
    cost_estimate_usd: float = 0.0
    error_message: Optional[str] = None
    artifacts_json: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class RunCreate(BaseModel):
    branch: Optional[str] = None
    commit_hash: Optional[str] = None
    trigger: str = "manual"
    agents: Optional[List[str]] = None  # None means all 7 agents
    max_repair_iterations: Optional[int] = None
    timeout_sec: Optional[int] = None
    llm_provider: Optional[str] = None


class RunSummary(BaseModel):
    coverage_pct: float = 0.0
    mutation_score: float = 0.0
    bugs_detected: int = 0
    patches_synthesized: int = 0
    patches_validated: int = 0
    tests_generated: int = 0


class RunResponse(BaseModel):
    id: str
    project_id: str
    run_number: int
    status: str
    trigger: str
    commit_hash: Optional[str] = None
    branch: str
    commit_message: Optional[str] = None
    author: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: float = 0.0
    config_json: Optional[Dict[str, Any]] = None
    summary: Optional[RunSummary] = None
    agent_tasks: List[AgentTaskResponse] = []

    model_config = ConfigDict(from_attributes=True)
