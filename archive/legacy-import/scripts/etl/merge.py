"""
scripts/etl/merge.py — Merge raw tool + enrichment payload → final record
--------------------------------------------------------------------------
Assembles the complete enriched record by combining:
  - The raw tool fields (from raw_tools.json)
  - The LLM enrichment payload (from enrich.py or cache)
  - Provenance metadata (prompt_hash, schema_version, source_permalink, …)

Also handles:
  - Formalized review metadata (review.status: ai_candidate | manually_reviewed | rejected)
  - Migration from legacy `_manually_reviewed: true` → review.status = "manually_reviewed"
  - Protection of manually_reviewed records unless --force-reviewed is passed
  - Compound cache key invalidation (raw_content_hash + prompt_hash + schema_version)
  - Atomic output writes
"""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import jsonschema

from scripts.etl.cache import EnrichmentCache, raw_content_hash
from scripts.etl.llm.base import SCHEMA_VERSION, SOURCE_REPO

log = logging.getLogger("osint_hub.merge")

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCHEMA_PATH = REPO_ROOT / "schemas" / "tool.schema.json"

# Prompt version tag embedded in the YAML header (e.g. "# version: 1.1.0")
_PROMPT_VERSION_RE = re.compile(r"^#\s*version:\s*(\S+)", re.MULTILINE)
_PROMPT_PATH = REPO_ROOT / "prompts" / "enrich_tool.prompt.yaml"


# ---------------------------------------------------------------------------
# Schema loader (cached)
# ---------------------------------------------------------------------------

_SCHEMA_CACHE: dict | None = None


def _load_schema() -> dict:
    global _SCHEMA_CACHE  # noqa: PLW0603
    if _SCHEMA_CACHE is None:
        _SCHEMA_CACHE = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    return _SCHEMA_CACHE


# ---------------------------------------------------------------------------
# Prompt-version extractor
# ---------------------------------------------------------------------------


def _prompt_version_tag(prompt_path: Path = _PROMPT_PATH) -> str | None:
    """Extract the human-readable version tag from the prompt YAML header."""
    try:
        text = prompt_path.read_text(encoding="utf-8")
        m = _PROMPT_VERSION_RE.search(text)
        return m.group(1) if m else None
    except OSError:
        return None


# ---------------------------------------------------------------------------
# Source permalink builder
# ---------------------------------------------------------------------------




def build_source_permalink(section: str, repo_url: str = SOURCE_REPO) -> str:
    """Construct a section-level GitHub anchor permalink for the tool entry.

    GitHub derives heading anchors by lowercasing, replacing spaces with hyphens,
    and stripping remaining punctuation.

    Example:
        "Basic OSINT" → "{repo}/blob/main/README.md#basic-osint"
        "Breaches, Leaks & Dump" → "{repo}/blob/main/README.md#breaches-leaks--dump"
    """
    slug = section.lower().replace(" ", "-")
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    return f"{repo_url}/blob/main/README.md#{slug}"


# ---------------------------------------------------------------------------
# Review block helpers
# ---------------------------------------------------------------------------

_DEFAULT_REVIEW: dict[str, Any] = {
    "status": "ai_candidate",
    "reviewed_by": None,
    "reviewed_at": None,
    "notes": None,
}


def migrate_review(record: dict[str, Any]) -> dict[str, Any]:
    """Migrate legacy `_manually_reviewed: true` to the formalized review block.

    Modifies *record* in-place and returns it.
    """
    if record.get("_manually_reviewed"):
        if "review" not in record or not isinstance(record.get("review"), dict):
            record["review"] = {
                "status": "manually_reviewed",
                "reviewed_by": None,
                "reviewed_at": None,
                "notes": "Migrated from _manually_reviewed flag.",
            }
        del record["_manually_reviewed"]
        log.debug("Migrated legacy _manually_reviewed flag for record: %s", record.get("id"))
    return record


def is_protected(record: dict[str, Any]) -> bool:
    """Return True if the record must not be overwritten without --force-reviewed."""
    review = record.get("review", {})
    if isinstance(review, dict):
        return review.get("status") == "manually_reviewed"
    return False


# ---------------------------------------------------------------------------
# Provenance helpers
# ---------------------------------------------------------------------------


def build_provenance(
    raw_tool: dict[str, Any],
    model: str,
    content_hash: str,
    p_hash: str,
) -> dict[str, Any]:
    """Return provenance fields to attach to a merged record."""
    return {
        "raw_tool_id": raw_tool["id"],
        "raw_content_hash": content_hash,
        "prompt_hash": p_hash,
        "schema_version": SCHEMA_VERSION,
        "source_repo": SOURCE_REPO,
        "source_section": raw_tool.get("section", ""),
        "source_permalink": build_source_permalink(raw_tool.get("section", "")),
        "prompt_version": _prompt_version_tag(),
        "enrichment_model": model,
        "enriched_at": datetime.now(tz=timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Record merge
# ---------------------------------------------------------------------------


def merge_record(
    raw_tool: dict[str, Any],
    payload: dict[str, Any],
    model: str,
    content_hash: str,
    p_hash: str,
) -> dict[str, Any]:
    """Assemble a complete enriched tool record.

    Field priority (later wins for overlapping keys):
        raw_tool → payload → provenance → review (always ai_candidate for new)
    """
    record = {**raw_tool}
    record.update(payload)
    record.update(build_provenance(raw_tool, model, content_hash, p_hash))
    # Every newly-enriched record starts as ai_candidate.
    record.setdefault("review", dict(_DEFAULT_REVIEW))
    return record


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def validate_record(record: dict[str, Any]) -> list[str]:
    """Validate a merged record against tool.schema.json.

    Returns list of error messages; empty → valid.
    """
    # tool.schema.json uses additionalProperties: false, so _manually_reviewed
    # (a legacy ops key) must be stripped before validating.
    clean = {k: v for k, v in record.items() if k != "_manually_reviewed"}
    schema = _load_schema()
    validator = jsonschema.Draft7Validator(schema)
    return [
        f"{list(err.path)}: {err.message}"
        for err in sorted(validator.iter_errors(clean), key=lambda e: list(e.path))
    ]


# ---------------------------------------------------------------------------
# Output file management
# ---------------------------------------------------------------------------


def load_existing_enriched(output_path: Path) -> dict[str, dict[str, Any]]:
    """Load existing enriched records from *output_path* (keyed by id).

    Runs migration logic on every loaded record so `_manually_reviewed`
    entries are transparently upgraded to the review block.
    Returns an empty dict if the file does not exist.
    """
    if not output_path.exists():
        return {}

    try:
        records = json.loads(output_path.read_text(encoding="utf-8"))
        migrated = {}
        for r in records:
            if not isinstance(r, dict) or "id" not in r:
                continue
            migrated[r["id"]] = migrate_review(r)
        return migrated
    except (json.JSONDecodeError, KeyError) as exc:
        log.warning("Could not parse existing enriched file (%s); treating as empty.", exc)
        return {}


def write_enriched(records: list[dict[str, Any]], output_path: Path) -> None:
    """Write enriched records to *output_path* (atomic write-then-rename)."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = output_path.with_suffix(".json.tmp")
    tmp.write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    tmp.replace(output_path)
    log.info("Wrote %d enriched records to %s", len(records), output_path)


# ---------------------------------------------------------------------------
# Main merge pipeline
# ---------------------------------------------------------------------------


def run_merge(
    raw_tools: list[dict[str, Any]],
    cache: EnrichmentCache,
    client,  # BaseLLMClient
    output_path: Path,
    *,
    limit: int | None = None,
    dry_run: bool = False,
    force: bool = False,
    force_reviewed: bool = False,
) -> dict[str, int]:
    """
    Full merge pipeline: for each raw tool, check cache → enrich if needed →
    merge → validate → write.

    Parameters
    ----------
    force_reviewed:
        If True, manually_reviewed records are overwritten just like any other.
        Requires explicit opt-in from the caller (CLI flag --force-reviewed).

    Returns stats dict: {enriched, cached, skipped, failed, protected}.
    """
    from scripts.etl.enrich import enrich_tool, prompt_file_hash  # avoid circular at module level

    # Compute the current prompt hash once for this run.
    p_hash = prompt_file_hash()
    log.debug("Prompt hash for this run: %s…", p_hash[:12])

    # Load existing output so we can protect manually reviewed records.
    existing = load_existing_enriched(output_path)

    stats = {"enriched": 0, "cached": 0, "skipped": 0, "failed": 0, "protected": 0}

    tools_to_process = raw_tools[:limit] if limit else raw_tools
    final_records: dict[str, dict[str, Any]] = dict(existing)  # copy; will be updated

    # Determine which tools need enrichment.
    pending = []
    for raw_tool in tools_to_process:
        tid = raw_tool["id"]
        chash = raw_content_hash(
            raw_tool["name"], raw_tool["url"], raw_tool.get("raw_description", "")
        )

        # Guard: protect manually_reviewed records unless --force-reviewed.
        if tid in existing and is_protected(existing[tid]) and not force_reviewed:
            log.info("[%s] Protected (review.status=manually_reviewed). Skipping.", tid)
            stats["protected"] += 1
            continue

        # Check compound cache: raw content + prompt + schema must all match.
        if not force and cache.has(chash, p_hash, SCHEMA_VERSION):
            log.info("[%s] Cache hit (content+prompt+schema match). Skipping LLM call.", tid)
            stats["cached"] += 1
            cached_payload = cache.get(chash, p_hash, SCHEMA_VERSION)
            record = merge_record(raw_tool, cached_payload, client.model, chash, p_hash)
            # Preserve existing review block if present.
            if tid in existing and "review" in existing[tid]:
                record["review"] = existing[tid]["review"]
            errors = validate_record(record)
            if errors:
                log.warning("[%s] Cached record fails validation: %s", tid, errors[:2])
                stats["failed"] += 1
            else:
                final_records[tid] = record
            continue

        pending.append((raw_tool, chash))

    # Dry-run: just report what would happen.
    if dry_run:
        log.info("─── DRY RUN ─── would enrich %d tool(s):", len(pending))
        for raw_tool, chash in pending:
            log.info(
                "  [%s] %s  (hash: %s…)",
                raw_tool["id"],
                raw_tool["name"],
                chash[:12],
            )
        stats["skipped"] = len(pending)
        # Still write any cache-served records gathered above.
        if final_records:
            write_enriched(list(final_records.values()), output_path)
        return stats

    # Live enrichment.
    for raw_tool, chash in pending:
        tid = raw_tool["id"]
        payload = enrich_tool(raw_tool, client)

        if payload is None:
            stats["failed"] += 1
            continue

        # Cache the payload with compound key.
        cache.set(chash, p_hash, SCHEMA_VERSION, payload)

        # Assemble final record.
        record = merge_record(raw_tool, payload, client.model, chash, p_hash)
        # Preserve existing review block if the record already existed.
        if tid in existing and "review" in existing[tid]:
            record["review"] = existing[tid]["review"]

        errors = validate_record(record)
        if errors:
            log.warning("[%s] Merged record fails schema: %s", tid, errors[:3])
            stats["failed"] += 1
            continue

        final_records[tid] = record
        stats["enriched"] += 1

    # Preserve all non-processed existing records.
    for tid, rec in existing.items():
        if tid not in final_records:
            final_records[tid] = rec

    write_enriched(list(final_records.values()), output_path)

    log.info(
        "Merge complete — enriched=%d cached=%d skipped=%d failed=%d protected=%d",
        stats["enriched"],
        stats["cached"],
        stats["skipped"],
        stats["failed"],
        stats["protected"],
    )
    return stats
