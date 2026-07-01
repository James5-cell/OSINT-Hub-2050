"""
cache.py — Enrichment cache
----------------------------
A lightweight, file-backed JSON cache that prevents duplicate LLM calls.

Cache key (compound):
    SHA-256 of (raw_content_hash + ":" + prompt_hash + ":" + schema_version)

A cache HIT requires ALL THREE components to match:
  - raw_content_hash  → the tool's name/url/description haven't changed
  - prompt_hash       → the prompt template hasn't changed
  - schema_version    → the output schema hasn't changed

If ANY of the three changes, the compound key changes and the entry is a MISS,
forcing a fresh LLM call.  Old entries are orphaned in the file (they do no
harm and are cleaned up on next flush after re-enrichment).

Cache store: data/cache/enrichment/cache.json
    {
      "<compound_key>": {
        <EnrichmentPayload fields>,
        "_cached_at":     "ISO-8601",
        "_raw_hash":      "<raw_content_hash>",
        "_prompt_hash":   "<prompt_hash>",
        "_schema_version": "<schema_version>"
      }
    }

The cache is read once at startup and flushed to disk after every write.
No locking — designed for single-process sequential use.
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

log = logging.getLogger("osint_hub.cache")

# Fields stored inside a cache entry that are NOT part of the enrichment payload.
_CACHE_META_FIELDS = {"_cached_at", "_raw_hash", "_prompt_hash", "_schema_version"}

DEFAULT_CACHE_PATH = Path("data/cache/enrichment/cache.json")


# ---------------------------------------------------------------------------
# Hash helpers
# ---------------------------------------------------------------------------


def raw_content_hash(name: str, url: str, raw_description: str) -> str:
    """Return a stable SHA-256 hex string for the given raw tool content."""
    fingerprint = f"{name.strip()}|{url.strip()}|{raw_description.strip()}"
    return hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()


def compound_cache_key(
    content_hash: str,
    p_hash: str,
    schema_version: str,
) -> str:
    """Return a single compound cache key from the three invalidation axes."""
    combined = f"{content_hash}:{p_hash}:{schema_version}"
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# Cache class
# ---------------------------------------------------------------------------


class EnrichmentCache:
    """File-backed enrichment cache with compound key invalidation.

    Parameters
    ----------
    path:
        Path to the JSON cache file.  Created (with parent dirs) if absent.
    """

    def __init__(self, path: Path = DEFAULT_CACHE_PATH) -> None:
        self.path = path
        self._store: dict[str, dict[str, Any]] = {}
        self._load()

    # ── persistence ─────────────────────────────────────────────────────────

    def _load(self) -> None:
        if self.path.exists():
            try:
                self._store = json.loads(self.path.read_text(encoding="utf-8"))
                log.info("Cache loaded: %d entries from %s", len(self._store), self.path)
            except (json.JSONDecodeError, OSError) as exc:
                log.warning("Cache file unreadable (%s); starting fresh.", exc)
                self._store = {}
        else:
            log.info("No cache file found at %s; starting fresh.", self.path)

    def flush(self) -> None:
        """Write the in-memory store to disk atomically (write-then-rename)."""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(".json.tmp")
        tmp.write_text(
            json.dumps(self._store, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        tmp.replace(self.path)
        log.debug("Cache flushed: %d entries → %s", len(self._store), self.path)

    # ── compound-key helpers ─────────────────────────────────────────────────

    def _make_key(
        self, content_hash: str, p_hash: str, schema_version: str
    ) -> str:
        return compound_cache_key(content_hash, p_hash, schema_version)

    # ── public API ───────────────────────────────────────────────────────────

    def get(
        self,
        content_hash: str,
        p_hash: str,
        schema_version: str,
    ) -> dict[str, Any] | None:
        """Return the cached enrichment payload, or None if not cached.

        All three components must match for a hit.
        """
        key = self._make_key(content_hash, p_hash, schema_version)
        entry = self._store.get(key)
        if entry is None:
            return None
        # Strip internal meta fields before returning to callers.
        return {k: v for k, v in entry.items() if k not in _CACHE_META_FIELDS}

    def set(
        self,
        content_hash: str,
        p_hash: str,
        schema_version: str,
        payload: dict[str, Any],
    ) -> None:
        """Store *payload* under the compound key and flush to disk."""
        key = self._make_key(content_hash, p_hash, schema_version)
        self._store[key] = {
            **payload,
            "_cached_at": datetime.now(tz=timezone.utc).isoformat(),
            "_raw_hash": content_hash,
            "_prompt_hash": p_hash,
            "_schema_version": schema_version,
        }
        self.flush()

    def has(
        self,
        content_hash: str,
        p_hash: str,
        schema_version: str,
    ) -> bool:
        """Return True iff the compound key exists in the store."""
        return self._make_key(content_hash, p_hash, schema_version) in self._store

    def invalidate(
        self,
        content_hash: str,
        p_hash: str,
        schema_version: str,
    ) -> None:
        """Remove a single entry by compound key (used by --force)."""
        key = self._make_key(content_hash, p_hash, schema_version)
        if key in self._store:
            del self._store[key]
            self.flush()

    def __len__(self) -> int:
        return len(self._store)

    def __repr__(self) -> str:
        return f"EnrichmentCache(path={self.path!r}, entries={len(self)})"
