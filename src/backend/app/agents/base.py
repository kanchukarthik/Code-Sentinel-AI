"""Base agent interface and agent execution context."""

import time
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.llm.client import BaseLLMClient
from app.sandbox.runner import ExecutionSandbox
from app.core.event_bus import event_bus, EventBus


class AgentLogEntry(BaseModel):
    timestamp: str
    level: str  # INFO, AGENT, DEBUG, WARN, ERROR
    agent_id: str
    message: str


class AgentContext:
    """Shared execution context passed across the 7 agents."""

    def __init__(
        self,
        run_id: str,
        project_id: str,
        workspace_dir: Path,
        db: Session,
        llm_client: BaseLLMClient,
        bus: Optional[EventBus] = None,
        config: Optional[Dict[str, Any]] = None,
    ):
        self.run_id = run_id
        self.project_id = project_id
        self.workspace_dir = workspace_dir
        self.db = db
        self.llm_client = llm_client
        self.event_bus = bus or event_bus
        self.sandbox = ExecutionSandbox(workspace_dir)
        self.config = config or {}

        # Shared blackboard dictionary for passing data between agent stages
        self.data: Dict[str, Any] = {
            "ast_summary": {},
            "complexity_map": {},
            "dependencies": {},
            "synthesized_tests": [],
            "test_results": [],
            "bugs": [],
            "root_causes": [],
            "patches": [],
            "validation_outcomes": [],
            "feedback": {},
            "metrics": {},
        }
        self.logs: List[AgentLogEntry] = []
        self.cancelled: bool = False

    async def emit_log(self, agent_id: str, level: str, message: str) -> None:
        """Emit a log message, record it, and broadcast to WebSockets."""
        from datetime import datetime, timezone
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
        entry = AgentLogEntry(timestamp=ts, level=level, agent_id=agent_id, message=message)
        self.logs.append(entry)
        await self.event_bus.publish(
            self.run_id,
            "agent_log",
            {
                "timestamp": ts,
                "level": level,
                "agent_id": agent_id,
                "message": message,
            },
        )

    async def emit_progress(self, agent_id: str, progress: int, action: str) -> None:
        """Update live agent progress and notify subscribers."""
        await self.event_bus.publish(
            self.run_id,
            "agent_progress",
            {
                "agent_id": agent_id,
                "progress": progress,
                "current_action": action,
            },
        )


class AgentResult(BaseModel):
    agent_id: str
    status: str = "passed"  # passed, failed, warning, skipped
    summary: str = ""
    duration_ms: int = 0
    tokens_used: int = 0
    cost_usd: float = 0.0
    artifacts: List[str] = Field(default_factory=list)
    error_message: Optional[str] = None


class BaseAgent(ABC):
    """Abstract base class for all 7 cognitive agents."""

    def __init__(self, agent_id: str, agent_name: str, order: int, role: str):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.order = order
        self.role = role

    @abstractmethod
    async def run(self, context: AgentContext) -> AgentResult:
        """Execute the agent's cognitive stage."""
        pass
