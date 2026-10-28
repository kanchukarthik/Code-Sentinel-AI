"""CoverageSnapshot, MetricSnapshot, and LLMCallLog models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class CoverageSnapshot(Base):
    __tablename__ = "coverage_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    statement_coverage_pct = Column(Float, default=0.0)
    branch_coverage_pct = Column(Float, default=0.0)
    uncovered_lines_count = Column(Integer, default=0)
    file_coverage_json = Column(JSON, default=dict)  # {"file_path": {"stmts": 100, "miss": 15, "pct": 85.0, "lines": [...]}}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="coverage_snapshots")


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    # The 7 Core System Evaluation Metrics
    code_coverage_pct = Column(Float, default=0.0)
    branch_coverage_pct = Column(Float, default=0.0)
    mutation_score = Column(Float, default=0.0)
    defect_detection_rate = Column(Float, default=0.0)
    fault_localization_top1_acc = Column(Float, default=0.0)
    fault_localization_top3_acc = Column(Float, default=0.0)
    false_positive_rate = Column(Float, default=0.0)
    patch_success_rate = Column(Float, default=0.0)
    execution_duration_sec = Column(Float, default=0.0)
    total_tokens_used = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="metric_snapshots")


class LLMCallLog(Base):
    __tablename__ = "llm_call_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(String(64), nullable=False)
    provider = Column(String(32), default="mock")
    model = Column(String(64), nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    system_prompt_excerpt = Column(Text, nullable=True)
    response_excerpt = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="llm_call_logs")
