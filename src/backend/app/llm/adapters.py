"""Live API adapters for Gemini, OpenAI, Anthropic, and Ollama."""

import os
import time
from typing import Dict, Any, Optional
import httpx
from app.llm.client import BaseLLMClient, LLMResponse


class GeminiAdapter(BaseLLMClient):
    """Google Gemini API adapter."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-pro"):
        super().__init__(model_name=model_name)
        self.api_key = api_key

    async def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.2, json_mode: bool = False) -> LLMResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\nUser query:\n{user_prompt}"}]}
            ],
            "generationConfig": {"temperature": temperature}
        }
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        latency = int((time.time() - start_time) * 1000)
        return LLMResponse(content=text, prompt_tokens=500, completion_tokens=300, total_tokens=800, latency_ms=latency, model=self.model_name, provider="gemini")


class OpenAIAdapter(BaseLLMClient):
    """OpenAI API adapter."""

    def __init__(self, api_key: str, model_name: str = "gpt-4o"):
        super().__init__(model_name=model_name)
        self.api_key = api_key

    async def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.2, json_mode: bool = False) -> LLMResponse:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        text = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        latency = int((time.time() - start_time) * 1000)
        return LLMResponse(
            content=text,
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            total_tokens=usage.get("total_tokens", 0),
            latency_ms=latency,
            model=self.model_name,
            provider="openai"
        )


class AnthropicAdapter(BaseLLMClient):
    """Anthropic Claude API adapter."""

    def __init__(self, api_key: str, model_name: str = "claude-3-7-sonnet-20250219"):
        super().__init__(model_name=model_name)
        self.api_key = api_key

    async def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.2, json_mode: bool = False) -> LLMResponse:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
            "max_tokens": 4096,
            "temperature": temperature
        }

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        text = data["content"][0]["text"]
        usage = data.get("usage", {})
        latency = int((time.time() - start_time) * 1000)
        return LLMResponse(
            content=text,
            prompt_tokens=usage.get("input_tokens", 0),
            completion_tokens=usage.get("output_tokens", 0),
            total_tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
            latency_ms=latency,
            model=self.model_name,
            provider="anthropic"
        )


class OllamaAdapter(BaseLLMClient):
    """Local Ollama instance adapter."""

    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "deepseek-coder:6.7b"):
        super().__init__(model_name=model_name)
        self.base_url = base_url.rstrip("/")

    async def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.2, json_mode: bool = False) -> LLMResponse:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "options": {"temperature": temperature},
            "stream": False
        }
        if json_mode:
            payload["format"] = "json"

        start_time = time.time()
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()

        text = data.get("message", {}).get("content", "")
        latency = int((time.time() - start_time) * 1000)
        return LLMResponse(content=text, prompt_tokens=300, completion_tokens=200, total_tokens=500, latency_ms=latency, model=self.model_name, provider="ollama")
