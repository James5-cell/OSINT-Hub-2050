"""
scripts/enrich_tools.py — OSINT Hub Phase 2 CLI
-------------------------------------------------
Enrich raw tool records with LLM-generated Traditional Chinese metadata.

Usage examples:
    # Full enrichment run (requires API key in environment)
    python scripts/enrich_tools.py \\
        --input  data/processed/raw_tools.json \\
        --output data/enriched/tools.json

    # Safe test: enrich first 5 tools only
    python scripts/enrich_tools.py --limit 5

    # Dry run: see what would be enriched without calling the API
    python scripts/enrich_tools.py --dry-run --limit 10

    # Force re-enrichment (ignores cache)
    python scripts/enrich_tools.py --force --limit 3

Environment variables:
    OPENAI_API_KEY   — use OpenAI (gpt-4o-mini by default)
    GEMINI_API_KEY   — use Gemini (gemini-2.0-flash by default)
    OPENAI_MODEL     — override OpenAI model name
    GEMINI_MODEL     — override Gemini model name
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Path setup: allow running from repo root
# ---------------------------------------------------------------------------

_REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_REPO_ROOT))

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("osint_hub.enrich_tools")

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------

DEFAULT_INPUT = Path("data/processed/raw_tools.json")
DEFAULT_OUTPUT = Path("data/enriched/tools.json")
DEFAULT_CACHE = Path("data/cache/enrichment/cache.json")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Enrich OSINT tool records with LLM-generated Traditional Chinese metadata.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help="Path to raw_tools.json (Phase 1 output).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Destination path for enriched tools.json.",
    )
    parser.add_argument(
        "--cache",
        type=Path,
        default=DEFAULT_CACHE,
        help="Path to the enrichment cache JSON file.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Process at most N tools (for safe testing).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Show which tools would be enriched without calling the API.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        default=False,
        help="Ignore cache and re-enrich all tools.",
    )
    parser.add_argument(
        "--force-reviewed",
        action="store_true",
        default=False,
        help="Allow overwriting manually_reviewed records. Requires explicit opt-in.",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.getLogger().setLevel(args.log_level)

    log.info("╔════════════════════════════════════════╗")
    log.info("║   OSINT Hub — Phase 2 Enrichment Run   ║")
    log.info("╚════════════════════════════════════════╝")
    if args.dry_run:
        log.info("Mode: DRY RUN (no API calls will be made)")
    if args.force:
        log.info("Mode: FORCE (cache will be bypassed)")
    if args.limit:
        log.info("Limit: %d tools", args.limit)

    # ── Load raw tools ────────────────────────────────────────────────────────
    if not args.input.exists():
        log.error("Input file not found: %s", args.input)
        return 1

    raw_tools: list[dict] = json.loads(args.input.read_text(encoding="utf-8"))
    log.info("Loaded %d raw tool(s) from %s", len(raw_tools), args.input)

    # ── Load cache ────────────────────────────────────────────────────────────
    from scripts.etl.cache import EnrichmentCache
    cache = EnrichmentCache(args.cache)

    # ── Initialise LLM client ────────────────────────────────────────────────
    if args.dry_run:
        # Dry-run: use a stub client so no imports / API keys are needed.
        from scripts.etl.llm.base import BaseLLMClient

        class _StubClient(BaseLLMClient):
            provider = "stub"
            model = "dry-run"

            def complete(self, system: str, user: str) -> str:
                return "{}"

        client = _StubClient()
    else:
        try:
            from scripts.etl.llm.base import get_client
            client = get_client()
        except EnvironmentError as exc:
            log.error("%s", exc)
            return 1

    # ── Run merge pipeline ────────────────────────────────────────────────────
    from scripts.etl.merge import run_merge

    stats = run_merge(
        raw_tools=raw_tools,
        cache=cache,
        client=client,
        output_path=args.output,
        limit=args.limit,
        dry_run=args.dry_run,
        force=args.force,
        force_reviewed=args.force_reviewed,
    )

    # ── Summary ───────────────────────────────────────────────────────────────
    log.info("╔════════════════════════════════════════╗")
    log.info("║           Enrichment Summary           ║")
    log.info("╠════════════════════════════════════════╣")
    for key, val in stats.items():
        log.info("║  %-16s : %-20d ║", key.capitalize(), val)
    log.info("╚════════════════════════════════════════╝")

    return 0 if stats["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
