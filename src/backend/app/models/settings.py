"""Settings model for storing runtime engine configurations."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from app.database import Base


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, default=1)
    llm_provider = Column(String(32), default="mock")  # mock, gemini, openai, anthropic, ollama
    active_model = Column(String(64), default="claude-3-7-sonnet")
    api_keys_json = Column(JSON, default=dict)  # masked keys stored
    auto_heal_policy = Column(String(32), default="human_review")
    confidence_threshold = Column(Float, default=0.85)
    max_repair_iterations = Column(Integer, default=3)
    sandbox_timeout_sec = Column(Integer, default=30)
    sandbox_max_memory_mb = Column(Integer, default=512)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
