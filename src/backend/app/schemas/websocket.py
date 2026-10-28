"""Pydantic schemas for WebSocket events."""

from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel


class WebSocketEvent(BaseModel):
    event: str  # agent_started, agent_progress, agent_log, test_synthesized, bug_detected, patch_validated, agent_completed, run_finished
    timestamp: str
    run_id: str
    payload: Dict[str, Any]
