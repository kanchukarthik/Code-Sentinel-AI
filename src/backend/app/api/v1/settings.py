"""API endpoints for system settings management."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.settings import SystemSetting
from app.schemas.settings import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


def _mask_key(key: str) -> str:
    if not key or len(key) <= 6:
        return "••••••••"
    return f"{key[:4]}••••••••{key[-4:]}"


def _get_or_create_settings(db: Session) -> SystemSetting:
    setting = db.query(SystemSetting).filter(SystemSetting.id == 1).first()
    if not setting:
        setting = SystemSetting(
            id=1,
            llm_provider="mock",
            active_model="mock-deterministic-v1",
            api_keys_json={},
            auto_heal_policy="human_review",
            confidence_threshold=0.85,
            max_repair_iterations=3,
            sandbox_timeout_sec=30,
            sandbox_max_memory_mb=512,
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


def _to_response(setting: SystemSetting) -> SettingsResponse:
    raw_keys = setting.api_keys_json or {}
    masked_keys = {prov: _mask_key(k) for prov, k in raw_keys.items()}
    return SettingsResponse(
        llm_provider=setting.llm_provider,
        active_model=setting.active_model,
        api_keys_masked=masked_keys,
        auto_heal_policy=setting.auto_heal_policy,
        confidence_threshold=setting.confidence_threshold,
        max_repair_iterations=setting.max_repair_iterations,
        sandbox_timeout_sec=setting.sandbox_timeout_sec,
        sandbox_max_memory_mb=setting.sandbox_max_memory_mb,
        updated_at=setting.updated_at or datetime.now(timezone.utc),
    )


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """Fetch current system configuration settings."""
    setting = _get_or_create_settings(db)
    return _to_response(setting)


@router.put("", response_model=SettingsResponse)
def update_settings(update_data: SettingsUpdate, db: Session = Depends(get_db)):
    """Update runtime settings (LLM provider, auto-heal policy, sandbox boundaries)."""
    setting = _get_or_create_settings(db)

    if update_data.llm_provider is not None:
        setting.llm_provider = update_data.llm_provider
    if update_data.active_model is not None:
        setting.active_model = update_data.active_model
    if update_data.auto_heal_policy is not None:
        setting.auto_heal_policy = update_data.auto_heal_policy
    if update_data.confidence_threshold is not None:
        setting.confidence_threshold = update_data.confidence_threshold
    if update_data.max_repair_iterations is not None:
        setting.max_repair_iterations = update_data.max_repair_iterations
    if update_data.sandbox_timeout_sec is not None:
        setting.sandbox_timeout_sec = update_data.sandbox_timeout_sec
    if update_data.sandbox_max_memory_mb is not None:
        setting.sandbox_max_memory_mb = update_data.sandbox_max_memory_mb

    if update_data.api_keys is not None:
        current_keys = dict(setting.api_keys_json or {})
        for prov, val in update_data.api_keys.items():
            if val and not val.startswith("••••"):
                current_keys[prov] = val
        setting.api_keys_json = current_keys

    setting.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(setting)
    return _to_response(setting)
