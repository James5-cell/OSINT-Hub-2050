"""
scripts/etl/llm/openai_client.py — OpenAI adapter
---------------------------------------------------
Uses the `openai` SDK (v1+).

Environment variables:
    OPENAI_API_KEY  (required)

Optional overrides:
    OPENAI_MODEL        (default: gpt-4o-mini)
    OPENAI_BASE_URL     (for custom endpoints / proxies)
"""

from __future__ import annotations

import logging
import os
import time

from scripts.etl.llm.base import BaseLLMClient, LLMError

log = logging.getLogger("osint_hub.llm.openai")

DEFAULT_MODEL = "gpt-4o-mini"
MAX_RETRIES = 3
RETRY_BACKOFF = 2  # seconds, exponential


class OpenAIClient(BaseLLMClient):
    provider = "openai"

    def __init__(self) -> None:
        try:
            import openai
        except ImportError as exc:
            raise ImportError(
                "openai is not installed. Run: pip install openai"
            ) from exc

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise EnvironmentError("OPENAI_API_KEY is required.")

        self.model = os.environ.get("OPENAI_MODEL", DEFAULT_MODEL)
        base_url = os.environ.get("OPENAI_BASE_URL")

        kwargs: dict = {"api_key": api_key}
        if base_url:
            kwargs["base_url"] = base_url

        self._client = openai.OpenAI(**kwargs)
        log.info("OpenAIClient initialised (model=%s)", self.model)

    def complete(self, system: str, user: str) -> str:
        """Send a chat completion request and return the assistant's text."""
        last_exc: Exception | None = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = self._client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    temperature=0.2,
                    max_tokens=1024,
                )
                text = response.choices[0].message.content or ""
                log.debug("OpenAI response (%d chars).", len(text))
                return text.strip()
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                log.warning(
                    "OpenAI attempt %d/%d failed: %s", attempt, MAX_RETRIES, exc
                )
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_BACKOFF ** attempt)

        raise LLMError(f"OpenAI failed after {MAX_RETRIES} attempts: {last_exc}") from last_exc
