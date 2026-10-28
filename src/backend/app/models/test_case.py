"""TestCase and TestResult models for synthesized and baseline tests."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_key = Column(String(32), nullable=False)  # e.g., 'ST-101'
    name = Column(String(256), nullable=False)
    category = Column(String(64), nullable=False)  # functional, boundary, negative, regression, exception_handling
    target_file = Column(String(256), nullable=False)
    target_function = Column(String(128), nullable=False)
    line_start = Column(Integer, default=0)
    line_end = Column(Integer, default=0)
    code_snippet = Column(Text, nullable=False)
    agent_rationale = Column(Text, nullable=True)
    mutation_impact_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    run = relationship("Run", back_populates="test_cases")
    test_results = relationship("TestResult", back_populates="test_case", cascade="all, delete-orphan")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = Column(String(36), ForeignKey("test_cases.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(256), nullable=False)
    status = Column(String(32), default="passed")  # passed, failed, error, skipped
    duration_ms = Column(Integer, default=0)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    failure_message = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    is_synthesized = Column(Boolean, default=True)

    # Relationships
    run = relationship("Run", back_populates="test_results")
    test_case = relationship("TestCase", back_populates="test_results")
