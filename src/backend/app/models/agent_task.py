"""AgentTask model representing an individual agent step within a pipeline run."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(String(64), nullable=False)  # 'code_intelligence', 'test_synthesis', etc.
    agent_name = Column(String(128), nullable=False)
    order = Column(Integer, nullable=False)
    status = Column(String(32), default="idle")  # idle, running, passed, failed, skipped
    progress = Column(Integer, default=0)  # 0 to 100
    current_action = Column(String(256), default="Awaiting dispatch...")
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    cost_estimate_usd = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    logs_json = Column(JSON, default=list)  # list of log events
    artifacts_json = Column(JSON, default=list)  # list of generated artifacts/filenames

    # Relationships
    run = relationship("Run", back_populates="agent_tasks")
