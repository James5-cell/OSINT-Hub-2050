"""
scripts/etl/enrich.py — LLM enrichment engine
-----------------------------------------------
Responsible for:
  1. Loading the prompt template (prompts/enrich_tool.prompt.yaml)
  2. Rendering it for a specific raw tool
  3. Calling the LLM client
  4. Parsing and validating the JSON response
  5. Retrying once with a JSON repair instruction on invalid output
  6. Writing failures to data/enriched/failures.json

The enrichment payload returned by this module contains ONLY the LLM-generated
fields (description_zh_tw, use_cases, tags, pricing, difficulty, target_types,
platforms, ethical_flag, ethics_note).
Provenance fields are attached by merge.py.

Field naming (schema 1.1.0):
  target_types  (was: target_type)
  platforms     (was: platform)
"""

from __future__ import annotations

import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import jsonschema

from scripts.etl.llm.base import BaseLLMClient, LLMError

log = logging.getLogger("osint_hub.enrich")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
PROMPT_PATH = REPO_ROOT / "prompts" / "enrich_tool.prompt.yaml"
FAILURES_PATH = REPO_ROOT / "data" / "enriched" / "failures.json"

# ---------------------------------------------------------------------------
# Prompt loading & hashing
# ---------------------------------------------------------------------------

_PROMPT_CACHE: dict[str, str] | None = None
_PROMPT_HASH_CACHE: str | None = None


def prompt_file_hash(path: Path = PROMPT_PATH) -> str:
    """Return the SHA-256 hex digest of the prompt file. Cached after first call."""
    global _PROMPT_HASH_CACHE  # noqa: PLW0603
    if _PROMPT_HASH_CACHE is None:
        _PROMPT_HASH_CACHE = hashlib.sha256(path.read_bytes()).hexdigest()
    return _PROMPT_HASH_CACHE


def _reset_prompt_cache() -> None:
    """Clear module-level prompt caches (used in tests)."""
    global _PROMPT_CACHE, _PROMPT_HASH_CACHE  # noqa: PLW0603
    _PROMPT_CACHE = None
    _PROMPT_HASH_CACHE = None


def load_prompt(path: Path = PROMPT_PATH) -> dict[str, str]:
    """Load and cache the prompt YAML file.

    Returns a dict with keys 'system' and 'user'.
    Uses a minimal hand-rolled parser to avoid adding PyYAML as a hard dep.
    """
    global _PROMPT_CACHE  # noqa: PLW0603
    if _PROMPT_CACHE is not None:
        return _PROMPT_CACHE

    text = path.read_text(encoding="utf-8")

    system_match = re.search(r"^system:\s*\|\n(.*?)(?=^\w|\Z)", text, re.MULTILINE | re.DOTALL)
    user_match = re.search(r"^user:\s*\|\n(.*?)(?=^\w|\Z)", text, re.MULTILINE | re.DOTALL)

    if not system_match or not user_match:
        raise ValueError(f"Could not parse system/user blocks from prompt: {path}")

    def dedent_block(raw: str) -> str:
        lines = raw.split("\n")
        indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
        min_indent = min(indents) if indents else 0
        return "\n".join(l[min_indent:] if len(l) > min_indent else l for l in lines).rstrip()

    _PROMPT_CACHE = {
        "system": dedent_block(system_match.group(1)),
        "user": dedent_block(user_match.group(1)),
    }
    return _PROMPT_CACHE


def render_prompt(raw_tool: dict[str, Any]) -> tuple[str, str]:
    """Render the prompt template for a specific raw tool.

    Returns (system_text, user_text).
    """
    prompt = load_prompt()
    replacements = {
        "{{tool_name}}": raw_tool.get("name", ""),
        "{{tool_url}}": raw_tool.get("url", ""),
        "{{raw_description}}": raw_tool.get("raw_description", ""),
        "{{section}}": raw_tool.get("section", ""),
    }

    user = prompt["user"]
    for key, value in replacements.items():
        user = user.replace(key, value)

    return prompt["system"], user


# ---------------------------------------------------------------------------
# JSON extraction — strip markdown code fences if the LLM adds them
# ---------------------------------------------------------------------------

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```")
_JSON_OBJ_RE = re.compile(r"\{[\s\S]*\}", re.DOTALL)


def extract_json(text: str) -> str:
    """Return the first JSON object found in *text*, stripping markdown fences."""
    fence_match = _JSON_FENCE_RE.search(text)
    if fence_match:
        return fence_match.group(1).strip()

    obj_match = _JSON_OBJ_RE.search(text)
    if obj_match:
        return obj_match.group(0).strip()

    return text.strip()


# ---------------------------------------------------------------------------
# Enrichment payload schema (subset of tool.schema.json, schema 1.1.0)
# target_types and platforms are the canonical names.
# ---------------------------------------------------------------------------

_ENRICHMENT_SCHEMA = {
    "type": "object",
    "required": [
        "description_zh_tw", "use_cases", "tags",
        "pricing", "difficulty", "target_types", "platforms",
        "ethical_flag", "ethics_note",
    ],
    "properties": {
        "description_zh_tw": {"type": "string", "minLength": 1},
        "use_cases": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 1,
            "maxItems": 5,
        },
        "tags": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 1,
            "maxItems": 8,
        },
        "pricing": {
            "type": "string",
            "enum": ["free", "freemium", "paid", "open-source", "unknown"],
        },
        "difficulty": {
            "type": "string",
            "enum": ["beginner", "intermediate", "advanced", "unknown"],
        },
        "target_types": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "person", "email", "phone", "username", "domain", "ip",
                    "organization", "cryptocurrency", "image", "vehicle",
                    "social-media", "document", "network", "geolocation", "other",
                ],
            },
        },
        "platforms": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["web", "cli", "api", "browser-extension", "desktop", "mobile", "other"],
            },
        },
        "ethical_flag": {"type": "boolean"},
        "ethics_note": {"type": ["string", "null"]},
    },
    "additionalProperties": False,
}


def validate_payload(payload: dict[str, Any]) -> list[str]:
    """Validate *payload* against the enrichment sub-schema.

    Returns a list of error messages; empty list means valid.
    """
    validator = jsonschema.Draft7Validator(_ENRICHMENT_SCHEMA)
    return [
        f"{list(err.path)}: {err.message}"
        for err in sorted(validator.iter_errors(payload), key=lambda e: list(e.path))
    ]


# ---------------------------------------------------------------------------
# Failure log
# ---------------------------------------------------------------------------


def _write_failure(raw_tool: dict[str, Any], reason: str, raw_response: str) -> None:
    FAILURES_PATH.parent.mkdir(parents=True, exist_ok=True)

    failures: list[dict] = []
    if FAILURES_PATH.exists():
        try:
            failures = json.loads(FAILURES_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass

    failures.append(
        {
            "tool_id": raw_tool.get("id"),
            "tool_name": raw_tool.get("name"),
            "reason": reason,
            # Truncate to avoid giant files; never log API keys or secrets.
            "raw_response": raw_response[:2000],
            "failed_at": datetime.now(tz=timezone.utc).isoformat(),
        }
    )

    FAILURES_PATH.write_text(
        json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log.warning("Failure logged to %s (tool: %s)", FAILURES_PATH, raw_tool.get("id"))


# ---------------------------------------------------------------------------
# Repair prompt (in Traditional Chinese to keep LLM in context)
# ---------------------------------------------------------------------------

_REPAIR_SYSTEM = (
    "你是一個 JSON 修復助手。請僅回傳修正後的 JSON 物件，不包含其他文字。"
)

_REPAIR_USER_TEMPLATE = """\
以下是一個無效的 JSON 回應，請將它修正為符合格式的 JSON 物件：

原始回應：
{bad_response}

驗證錯誤：
{errors}

正確格式範例（只需回傳 JSON，不含說明）：
{{
  "description_zh_tw": "...",
  "use_cases": ["...", "..."],
  "tags": ["tag1", "tag2"],
  "pricing": "free",
  "difficulty": "beginner",
  "target_types": ["domain"],
  "platforms": ["web"],
  "ethical_flag": false,
  "ethics_note": null
}}
"""


# ---------------------------------------------------------------------------
# Main enrichment function
# ---------------------------------------------------------------------------


def enrich_tool(
    raw_tool: dict[str, Any],
    client: BaseLLMClient,
) -> dict[str, Any] | None:
    """
    Enrich a single raw tool record using the LLM.

    Returns the enrichment payload dict on success, or None on unrecoverable failure.
    The returned payload does NOT include provenance — that is added by merge.py.
    """
    tool_id = raw_tool.get("id", "<unknown>")
    log.info("Enriching: %s (%s)", raw_tool.get("name"), tool_id)

    system, user = render_prompt(raw_tool)

    # ── First attempt ────────────────────────────────────────────────────────
    try:
        raw_response = client.complete(system, user)
    except LLMError as exc:
        reason = f"LLM call failed: {exc}"
        log.error("[%s] %s", tool_id, reason)
        _write_failure(raw_tool, reason, "")
        return None

    payload = _parse_and_validate(raw_response, tool_id)
    if payload is not None:
        return payload

    # ── Retry with JSON repair prompt ────────────────────────────────────────
    log.info("[%s] First attempt invalid; retrying with repair prompt…", tool_id)
    validation_errors = validate_payload(_try_parse(raw_response) or {})
    repair_user = _REPAIR_USER_TEMPLATE.format(
        bad_response=raw_response[:1000],
        errors="\n".join(validation_errors[:5]),
    )
    try:
        repaired_response = client.complete(_REPAIR_SYSTEM, repair_user)
    except LLMError as exc:
        reason = f"Repair LLM call failed: {exc}"
        log.error("[%s] %s", tool_id, reason)
        _write_failure(raw_tool, reason, raw_response)
        return None

    payload = _parse_and_validate(repaired_response, tool_id)
    if payload is not None:
        log.info("[%s] Repair succeeded.", tool_id)
        return payload

    # ── Unrecoverable ─────────────────────────────────────────────────────────
    reason = "Invalid JSON after repair attempt"
    log.error("[%s] %s", tool_id, reason)
    _write_failure(raw_tool, reason, repaired_response)
    return None


def _try_parse(text: str) -> dict[str, Any] | None:
    """Try to parse JSON from text; return None on failure."""
    try:
        return json.loads(extract_json(text))
    except (json.JSONDecodeError, ValueError):
        return None


def _parse_and_validate(text: str, tool_id: str) -> dict[str, Any] | None:
    """Parse JSON from *text*, validate it, and return the payload or None."""
    parsed = _try_parse(text)
    if parsed is None:
        log.warning("[%s] Response is not valid JSON.", tool_id)
        return None

    errors = validate_payload(parsed)
    if errors:
        log.warning("[%s] Payload validation failed: %s", tool_id, errors[:3])
        return None

    return parsed
