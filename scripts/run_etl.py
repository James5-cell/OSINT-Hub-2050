"""
run_etl.py — OSINT Hub ETL orchestrator
-----------------------------------------
Runs the full Phase-1 ETL pipeline in sequence:
    1. fetch.py  — download upstream Markdown
    2. parse.py  — extract tool records into raw JSON
    3. validate.py — validate the output

This is a convenience wrapper; each step can also be run independently.

Usage:
    python scripts/run_etl.py
    python scripts/run_etl.py --sections "Basic OSINT" "Breaches and Leaks"
    python scripts/run_etl.py --skip-fetch   # use cached source.md
    python scripts/run_etl.py --strict       # fail on warnings too
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("osint_hub.run_etl")


# ---------------------------------------------------------------------------
# Step runners
# ---------------------------------------------------------------------------

# Add scripts/ to path so sibling modules resolve correctly when run from repo root.
sys.path.insert(0, str(Path(__file__).parent))

from etl.fetch import main as fetch_main  # noqa: E402
from etl.parse import main as parse_main  # noqa: E402
from etl.validate import main as validate_main  # noqa: E402


def run_fetch(repo_url: str, output: Path) -> bool:
    log.info("━━━ Step 1: Fetch ━━━")
    code = fetch_main(["--repo-url", repo_url, "--output", str(output)])
    if code != 0:
        log.error("Fetch step failed (exit %d).", code)
    return code == 0


def run_parse(input_path: Path, output_path: Path, sections: list[str]) -> bool:
    log.info("━━━ Step 2: Parse ━━━")
    argv = ["--input", str(input_path), "--output", str(output_path)]
    if sections:
        argv += ["--sections"] + sections
    else:
        argv += ["--sections", "ALL"]
    code = parse_main(argv)
    if code != 0:
        log.error("Parse step failed (exit %d).", code)
    return code == 0


def run_validate(input_path: Path, strict: bool) -> bool:
    log.info("━━━ Step 3: Validate ━━━")
    argv = ["--input", str(input_path)]
    if strict:
        argv.append("--strict")
    code = validate_main(argv)
    if code != 0:
        log.error("Validate step failed (exit %d).", code)
    return code == 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

DEFAULT_REPO_URL = (
    "https://raw.githubusercontent.com/Astrosp/Awesome-OSINT-For-Everything/"
    "main/README.md"
)
DEFAULT_RAW_PATH = Path("data/raw/source.md")
DEFAULT_PROCESSED_PATH = Path("data/processed/raw_tools.json")
DEFAULT_SECTIONS = ["Basic OSINT"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run the full OSINT Hub Phase-1 ETL pipeline.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--repo-url",
        default=DEFAULT_REPO_URL,
        help="Raw GitHub URL of the upstream Markdown file.",
    )
    parser.add_argument(
        "--raw-output",
        type=Path,
        default=DEFAULT_RAW_PATH,
        help="Where to save the downloaded Markdown.",
    )
    parser.add_argument(
        "--processed-output",
        type=Path,
        default=DEFAULT_PROCESSED_PATH,
        help="Where to save the parsed JSON.",
    )
    parser.add_argument(
        "--sections",
        nargs="+",
        default=DEFAULT_SECTIONS,
        metavar="SECTION",
        help="Sections to parse. Pass 'ALL' to include all sections.",
    )
    parser.add_argument(
        "--skip-fetch",
        action="store_true",
        default=False,
        help="Skip the fetch step and use an already-downloaded source.md.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        default=False,
        help="Treat validation warnings as errors.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    log.info("╔══════════════════════════════════════╗")
    log.info("║     OSINT Hub ETL — Phase 1 Run      ║")
    log.info("╚══════════════════════════════════════╝")

    if not args.skip_fetch:
        if not run_fetch(args.repo_url, args.raw_output):
            return 1
    else:
        log.info("Skipping fetch (--skip-fetch set). Using: %s", args.raw_output)
        if not args.raw_output.exists():
            log.error("Source file not found: %s", args.raw_output)
            return 1

    if not run_parse(args.raw_output, args.processed_output, args.sections):
        return 1

    if not run_validate(args.processed_output, args.strict):
        return 1

    log.info("╔══════════════════════════════════════╗")
    log.info("║  ETL complete. Output: %-16s  ║", str(args.processed_output)[-16:])
    log.info("╚══════════════════════════════════════╝")
    return 0


if __name__ == "__main__":
    sys.exit(main())
