"""Pydantic schemas for SystemSettings."""

from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict


class SettingsUpdate(BaseModel):
    llm_provider: Optional[str] = None
    active_model: Optional[str] = None
    api_keys: Optional[Dict[str, str]] = None
    auto_heal_policy: Optional[str] = None
    confidence_threshold: Optional[float] = None
    max_repair_iterations: Optional[int] = None
    sandbox_timeout_sec: Optional[int] = None
    sandbox_max_memory_mb: Optional[int] = None


class SettingsResponse(BaseModel):
    llm_provider: str
    active_model: str
    api_keys_masked: Dict[str, str]
    auto_heal_policy: str
    confidence_threshold: float
    max_repair_iterations: int
    sandbox_timeout_sec: int
    sandbox_max_memory_mb: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
