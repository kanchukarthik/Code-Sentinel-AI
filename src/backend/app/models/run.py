"""Run model representing pipeline executions."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Run(Base):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    run_number = Column(Integer, nullable=False, default=1)
    status = Column(String(32), default="queued", index=True)  # queued, running, passed, failed, needs_review, cancelled
    trigger = Column(String(32), default="manual")  # manual, webhook, scheduled, ci
    commit_hash = Column(String(64), nullable=True)
    branch = Column(String(128), default="main")
    commit_message = Column(String(256), nullable=True)
    author = Column(String(128), default="codesentinel-ai")
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    config_json = Column(JSON, nullable=True)  # custom agent toggles, timeout, max_iterations

    # Relationships
    project = relationship("Project", back_populates="runs")
    agent_tasks = relationship("AgentTask", back_populates="run", cascade="all, delete-orphan", order_by="AgentTask.order")
    test_cases = relationship("TestCase", back_populates="run", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="run", cascade="all, delete-orphan")
    bug_reports = relationship("BugReport", back_populates="run", cascade="all, delete-orphan")
    root_cause_results = relationship("RootCauseResult", back_populates="run", cascade="all, delete-orphan")
    patches = relationship("Patch", back_populates="run", cascade="all, delete-orphan")
    coverage_snapshots = relationship("CoverageSnapshot", back_populates="run", cascade="all, delete-orphan")
    metric_snapshots = relationship("MetricSnapshot", back_populates="run", cascade="all, delete-orphan")
    llm_call_logs = relationship("LLMCallLog", back_populates="run", cascade="all, delete-orphan")
