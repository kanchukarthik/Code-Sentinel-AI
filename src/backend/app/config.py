"""Configuration settings for CodeSentinel AI backend."""

import os
from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment or defaults."""

    # Project directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    PROJECTS_DIR: Path = DATA_DIR / "projects"
    SANDBOXES_DIR: Path = DATA_DIR / "sandboxes"
    UPLOADS_DIR: Path = DATA_DIR / "uploads"

    # API & Server
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "CodeSentinel AI"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = f"sqlite:///{Path(__file__).resolve().parent.parent / 'codesentinel.db'}"
    ASYNC_DATABASE_URL: str = f"sqlite+aiosqlite:///{Path(__file__).resolve().parent.parent / 'codesentinel.db'}"

    # LLM Settings
    LLM_PROVIDER: Literal["mock", "gemini", "openai", "anthropic", "ollama"] = "mock"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "claude-3-7-sonnet"

    # Autonomous Orchestration defaults
    DEFAULT_MAX_REPAIR_ITERATIONS: int = 3
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.85
    DEFAULT_AUTO_HEAL_POLICY: str = "human_review"  # 'human_review', 'auto_approve_high_confidence', 'autonomous'

    # Sandbox Safety Limits
    SANDBOX_TIMEOUT_SEC: int = 30
    SANDBOX_MAX_MEMORY_MB: int = 512

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()

# Ensure runtime directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
settings.SANDBOXES_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
