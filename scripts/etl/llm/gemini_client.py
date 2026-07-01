"""
scripts/etl/llm/gemini_client.py — Google Gemini adapter
----------------------------------------------------------
Uses the `google-generativeai` SDK.

Environment variables:
    GEMINI_API_KEY  (preferred)
    GOOGLE_API_KEY  (fallback)

Optional overrides:
    GEMINI_MODEL    (default: gemini-2.0-flash)
"""

from __future__ import annotations

import logging
import os
import time

from scripts.etl.llm.base import BaseLLMClient, LLMError

log = logging.getLogger("osint_hub.llm.gemini")

DEFAULT_MODEL = "gemini-2.0-flash"
MAX_RETRIES = 3
RETRY_BACKOFF = 2  # seconds, exponential


class GeminiClient(BaseLLMClient):
    provider = "gemini"

    def __init__(self) -> None:
        try:
            import google.generativeai as genai
        except ImportError as exc:
            raise ImportError(
                "google-generativeai is not installed. "
                "Run: pip install google-generativeai"
            ) from exc

        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY or GOOGLE_API_KEY is required.")

        genai.configure(api_key=api_key)
        self.model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)
        self._genai = genai
        self._model_obj = genai.GenerativeModel(self.model)
        log.info("GeminiClient initialised (model=%s)", self.model)

    def complete(self, system: str, user: str) -> str:
        """Send a system+user prompt to Gemini and return the text response."""
        # Gemini's Python SDK combines system and user into a single prompt
        # when using GenerativeModel.generate_content with a list of parts.
        combined_prompt = f"{system}\n\n---\n\n{user}"

        last_exc: Exception | None = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = self._model_obj.generate_content(
                    combined_prompt,
                    generation_config={
                        "temperature": 0.2,
                        "max_output_tokens": 1024,
                    },
                )
                text = response.text.strip()
                log.debug("Gemini response (%d chars).", len(text))
                return text
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                log.warning(
                    "Gemini attempt %d/%d failed: %s", attempt, MAX_RETRIES, exc
                )
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_BACKOFF ** attempt)

        raise LLMError(f"Gemini failed after {MAX_RETRIES} attempts: {last_exc}") from last_exc
