"""
scripts/etl/llm/base.py — Abstract LLM client interface
---------------------------------------------------------
All provider adapters must implement `BaseLLMClient`.

The only method callers use is `complete(system, user) -> str`.
Provider-specific retry, timeout, and error handling belong inside
the adapter, not in the calling code.
"""

from __future__ import annotations

import hashlib
import logging
import os
from abc import ABC, abstractmethod
from pathlib import Path

log = logging.getLogger("osint_hub.llm")

# ---------------------------------------------------------------------------
# Schema version — bump when tool.schema.json fields change in a
# backward-incompatible way.  Cache entries store this value; a mismatch
# forces re-enrichment.
# ---------------------------------------------------------------------------
SCHEMA_VERSION = "1.1.0"

# ---------------------------------------------------------------------------
# Source repo provenance constant
# ---------------------------------------------------------------------------
SOURCE_REPO = "https://github.com/Astrosp/Awesome-OSINT-For-Everything"

# ---------------------------------------------------------------------------
# Prompt file path (resolved from this file's location)
# ---------------------------------------------------------------------------
_PROMPT_PATH = Path(__file__).resolve().parent.parent.parent.parent / "prompts" / "enrich_tool.prompt.yaml"


def prompt_hash(prompt_path: Path = _PROMPT_PATH) -> str:
    """Return a stable SHA-256 hex digest of the enrichment prompt file.

    This is stored in every cache entry.  If the prompt file changes its
    content, the hash changes and existing cache entries become stale —
    triggering a fresh LLM call on the next run.
    """
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
    content = prompt_path.read_bytes()
    return hashlib.sha256(content).hexdigest()


class BaseLLMClient(ABC):
    """Abstract base for all LLM provider adapters."""

    #: Human-readable provider name, e.g. "openai" or "gemini".
    provider: str = "base"

    #: Model identifier that will be stored in provenance.
    model: str = "unknown"

    @abstractmethod
    def complete(self, system: str, user: str) -> str:
        """Send a system+user prompt and return the raw text response.

        Raises:
            LLMError: on unrecoverable API failure.
        """

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(model={self.model!r})"


class LLMError(Exception):
    """Raised when the LLM provider cannot fulfill a request."""


# ---------------------------------------------------------------------------
# Factory — auto-detect provider from environment
# ---------------------------------------------------------------------------

def get_client() -> BaseLLMClient:
    """
    Instantiate and return the appropriate LLM client based on available
    environment variables.

    Priority:
        1. OPENAI_API_KEY  → OpenAIClient
        2. GEMINI_API_KEY or GOOGLE_API_KEY → GeminiClient

    Raises:
        EnvironmentError: if no recognised API key is found.
    """
    if os.environ.get("OPENAI_API_KEY"):
        from scripts.etl.llm.openai_client import OpenAIClient  # noqa: PLC0415
        log.info("LLM provider: OpenAI")
        return OpenAIClient()

    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        from scripts.etl.llm.gemini_client import GeminiClient  # noqa: PLC0415
        log.info("LLM provider: Gemini")
        return GeminiClient()

    raise EnvironmentError(
        "No LLM API key found. Set OPENAI_API_KEY or GEMINI_API_KEY "
        "before running enrichment."
    )
