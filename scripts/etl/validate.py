"""
validate.py — OSINT Hub ETL Step 3
------------------------------------
Validates a raw_tools.json file against the raw_tool JSON Schema and
performs additional business-logic checks beyond what the schema enforces.

Exit codes:
    0  All records pass validation.
    1  One or more records fail; details are written to stderr / log.

Usage:
    python scripts/etl/validate.py [--input data/processed/raw_tools.json]
    python scripts/etl/validate.py --input data/processed/raw_tools.json --strict
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import urllib.parse
from pathlib import Path
from typing import Any

try:
    import jsonschema
    from jsonschema import Draft7Validator
except ImportError:
    print(
        "ERROR: 'jsonschema' is not installed. Run: pip install jsonschema",
        file=sys.stderr,
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("osint_hub.validate")


# ---------------------------------------------------------------------------
# Schema path
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCHEMA_PATH = REPO_ROOT / "schemas" / "raw_tool.schema.json"


# ---------------------------------------------------------------------------
# Business-logic checks
# ---------------------------------------------------------------------------


class ValidationError(Exception):
    pass


def check_id_format(tool: dict) -> list[str]:
    import re

    errors = []
    tid = tool.get("id", "")
    if not re.match(r"^[a-z0-9-]+$", tid):
        errors.append(f"id '{tid}' contains invalid characters (only a-z 0-9 - allowed).")
    return errors


def check_url_reachable_format(tool: dict) -> list[str]:
    errors = []
    url = tool.get("url", "")
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            errors.append(f"url scheme is not http/https: {url!r}")
        if not parsed.netloc:
            errors.append(f"url has no host: {url!r}")
    except Exception as exc:
        errors.append(f"url could not be parsed: {exc}")
    return errors


def check_description_quality(tool: dict) -> list[str]:
    warnings = []
    desc = tool.get("raw_description", "")
    if len(desc) < 5:
        warnings.append(
            f"raw_description is very short ({len(desc)} chars) — "
            "may be a parse artefact."
        )
    return warnings


BUSINESS_CHECKS = [
    check_id_format,
    check_url_reachable_format,
    check_description_quality,
]


# ---------------------------------------------------------------------------
# Core validation
# ---------------------------------------------------------------------------


def load_schema(schema_path: Path) -> dict:
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found at {schema_path}")
    return json.loads(schema_path.read_text(encoding="utf-8"))


def validate_record(
    tool: dict, validator: Draft7Validator, strict: bool = False
) -> tuple[list[str], list[str]]:
    """
    Validate a single tool record.

    Returns (errors, warnings).
    """
    errors: list[str] = []
    warnings: list[str] = []

    # JSON Schema validation
    for error in sorted(validator.iter_errors(tool), key=lambda e: list(e.path)):
        errors.append(f"[schema] {error.path}: {error.message}")

    # Business-logic checks
    for check in BUSINESS_CHECKS:
        results = check(tool)
        for msg in results:
            if strict:
                errors.append(f"[logic] {msg}")
            else:
                warnings.append(f"[logic] {msg}")

    return errors, warnings


def validate_file(
    input_path: Path, schema_path: Path = SCHEMA_PATH, strict: bool = False
) -> tuple[int, int, int]:
    """
    Validate all records in a JSON array file.

    Returns (total, error_count, warning_count).
    """
    if not input_path.exists():
        log.error("Input file not found: %s", input_path)
        return 0, 1, 0

    raw = json.loads(input_path.read_text(encoding="utf-8"))

    if not isinstance(raw, list):
        log.error("Expected a JSON array at top level, got %s.", type(raw).__name__)
        return 0, 1, 0

    schema = load_schema(schema_path)
    validator = Draft7Validator(schema)

    total = len(raw)
    total_errors = 0
    total_warnings = 0

    log.info("Validating %d records from %s …", total, input_path)

    for i, tool in enumerate(raw):
        name = tool.get("name", f"<record #{i}>")
        errors, warnings = validate_record(tool, validator, strict=strict)

        for err in errors:
            log.error("  [%s] %s", name, err)
        for warn in warnings:
            log.warning("  [%s] %s", name, warn)

        total_errors += len(errors)
        total_warnings += len(warnings)

    # Summary
    log.info("─" * 60)
    log.info("Records  : %d", total)
    log.info("Errors   : %d", total_errors)
    log.info("Warnings : %d", total_warnings)

    if total_errors == 0:
        log.info("✓ All records passed validation.")
    else:
        log.error("✗ %d error(s) found. Fix them before proceeding.", total_errors)

    return total, total_errors, total_warnings


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate raw_tools.json against the OSINT Hub schema.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/processed/raw_tools.json"),
        help="Path to the JSON file to validate.",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=SCHEMA_PATH,
        help="Path to the JSON Schema file.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        default=False,
        help="Treat business-logic warnings as errors (non-zero exit).",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    _, errors, _ = validate_file(args.input, args.schema, args.strict)
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
