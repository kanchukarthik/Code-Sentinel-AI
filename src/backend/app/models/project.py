"""Project model representing target codebases."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer
from sqlalchemy.orm import relationship
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(128), nullable=False, index=True)
    description = Column(Text, nullable=True)
    source_type = Column(String(32), default="zip")  # 'zip', 'git', 'sample'
    source_path = Column(String(512), nullable=True)
    git_url = Column(String(512), nullable=True)
    default_branch = Column(String(128), default="main")
    language = Column(String(64), default="python")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    runs = relationship("Run", back_populates="project", cascade="all, delete-orphan", order_by="desc(Run.run_number)")
    feedback_records = relationship("FeedbackRecord", back_populates="project", cascade="all, delete-orphan")
