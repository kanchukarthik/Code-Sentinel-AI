"""Patch model representing candidate and validated patches."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Patch(Base):
    __tablename__ = "patches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    bug_id = Column(String(36), ForeignKey("bug_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    patch_key = Column(String(32), nullable=False)  # e.g., 'PATCH-801'
    iteration = Column(Integer, default=1)
    strategy = Column(String(128), default="AST Guard Synthesis")
    target_file = Column(String(256), nullable=False)
    diff_content = Column(Text, nullable=False)  # standard unified diff format
    status = Column(String(32), default="candidate")  # candidate, approved, rejected, applied, rolled_back
    confidence_score = Column(Float, default=95.0)
    explanation = Column(Text, nullable=True)
    author_agent = Column(String(128), default="Self-Healing / Repair Agent")
    validation_result_json = Column(JSON, nullable=True)  # baseline_passed, synth_passed, regressions, mutation_delta, fp_risk
    reviewer_notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, nullable=True)
    rolled_back_at = Column(DateTime, nullable=True)
    rollback_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="patches")
    bug = relationship("BugReport", back_populates="patches")
