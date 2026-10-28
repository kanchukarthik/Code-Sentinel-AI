"""FeedbackRecord model capturing learning feedback loops across runs."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class FeedbackRecord(Base):
    __tablename__ = "feedback_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id = Column(String(36), nullable=False)
    bug_category = Column(String(64), nullable=False)
    repair_strategy = Column(String(128), nullable=False)
    success = Column(Boolean, default=True)
    iterations_needed = Column(Integer, default=1)
    tests_synthesized_count = Column(Integer, default=0)
    mutation_delta = Column(Float, default=0.0)
    tuning_parameters_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="feedback_records")
