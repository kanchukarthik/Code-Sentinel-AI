"""RootCauseResult model representing Spectrum-Based Fault Localization rankings."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class RootCauseResult(Base):
    __tablename__ = "root_cause_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    bug_id = Column(String(36), ForeignKey("bug_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    method = Column(String(64), default="sbfl_ochiai")  # sbfl_ochiai, sbfl_tarantula
    top1_accuracy = Column(Boolean, default=True)
    top3_accuracy = Column(Boolean, default=True)
    top5_accuracy = Column(Boolean, default=True)
    rankings_json = Column(JSON, default=list)  # list of ranked lines: file, line, score, code, is_suspect
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="root_cause_results")
    bug = relationship("BugReport", back_populates="root_cause_results")
