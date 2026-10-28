"""Base LLMClient interface and token accounting."""

import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel


class LLMResponse(BaseModel):
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    latency_ms: int = 0
    cost_usd: float = 0.0
    model: str = "mock"
    provider: str = "mock"


class BaseLLMClient(ABC):
    """Abstract interface for LLM provider adapters."""

    def __init__(self, model_name: str = "claude-3-7-sonnet"):
        self.model_name = model_name

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> LLMResponse:
        """Generate text completion from LLM."""
        pass

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
    ) -> Dict[str, Any]:
        """Generate and parse structured JSON from LLM."""
        import json
        response = await self.generate(system_prompt, user_prompt, temperature=temperature, json_mode=True)
        text = response.content.strip()
        # Clean markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
