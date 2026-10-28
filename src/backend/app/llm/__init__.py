"""LLM client factory and provider routing."""

from typing import Optional
from app.config import settings
from app.llm.client import BaseLLMClient
from app.llm.mock_client import MockLLMClient
from app.llm.adapters import GeminiAdapter, OpenAIAdapter, AnthropicAdapter, OllamaAdapter


def get_llm_client(provider: Optional[str] = None, model: Optional[str] = None) -> BaseLLMClient:
    """Factory creating the appropriate LLM client instance. Defaults to deterministic MockLLMClient if keys are not set."""
    selected_provider = (provider or settings.LLM_PROVIDER).lower()
    selected_model = model or settings.DEFAULT_MODEL

    if selected_provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiAdapter(api_key=settings.GEMINI_API_KEY, model_name=selected_model)
    elif selected_provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIAdapter(api_key=settings.OPENAI_API_KEY, model_name=selected_model)
    elif selected_provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        return AnthropicAdapter(api_key=settings.ANTHROPIC_API_KEY, model_name=selected_model)
    elif selected_provider == "ollama":
        return OllamaAdapter(base_url=settings.OLLAMA_BASE_URL, model_name=selected_model)
    else:
        # Default offline deterministic mock client
        return MockLLMClient(model_name=selected_model)


__all__ = ["BaseLLMClient", "MockLLMClient", "get_llm_client"]
