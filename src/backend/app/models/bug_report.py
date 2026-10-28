"""BugReport model representing defects flagged by Bug Detection Agent."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class BugReport(Base):
    __tablename__ = "bug_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    bug_key = Column(String(32), nullable=False)  # e.g., 'BUG-401'
    title = Column(String(256), nullable=False)
    severity = Column(String(32), default="medium")  # critical, high, medium, low
    category = Column(String(64), default="logic_error")  # null_dereference, off_by_one, zero_division, etc.
    target_file = Column(String(256), nullable=False)
    target_function = Column(String(128), nullable=False)
    target_line = Column(Integer, default=1)
    detection_confidence = Column(Float, default=90.0)  # 0 to 100
    static_linter = Column(String(64), nullable=True)  # ruff, bandit, pylint
    dynamic_test_id = Column(String(36), nullable=True)
    stack_trace = Column(Text, nullable=True)
    execution_log = Column(Text, nullable=True)
    root_cause_explanation = Column(Text, nullable=True)
    status = Column(String(32), default="open")  # open, investigating, patch_ready, resolved, dismissed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="bug_reports")
    root_cause_results = relationship("RootCauseResult", back_populates="bug", cascade="all, delete-orphan")
    patches = relationship("Patch", back_populates="bug", cascade="all, delete-orphan")
