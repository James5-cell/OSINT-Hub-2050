"""
fetch.py — OSINT Hub ETL Step 1
--------------------------------
Downloads the upstream Markdown from the Awesome-OSINT-For-Everything GitHub
repository and saves it to the local data/raw/ directory.

Usage:
    python scripts/etl/fetch.py [--output data/raw/source.md] [--repo-url URL]
"""

from __future__ import annotations

import argparse
import hashlib
import logging
import sys
import time
from pathlib import Path

import httpx

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEFAULT_REPO_URL = (
    "https://raw.githubusercontent.com/Astrosp/Awesome-OSINT-For-Everything/"
    "main/README.md"
)
DEFAULT_OUTPUT = Path("data/raw/source.md")

TIMEOUT_SECONDS = 30
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2  # seconds, exponential

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("osint_hub.fetch")


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------


def fetch_markdown(url: str, timeout: int = TIMEOUT_SECONDS) -> str:
    """Fetch raw Markdown text from *url* with retry logic.

    Returns the decoded text on success; raises on unrecoverable failure.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            log.info("Fetching (attempt %d/%d): %s", attempt, MAX_RETRIES, url)
            response = httpx.get(url, timeout=timeout, follow_redirects=True)
            response.raise_for_status()
            log.info(
                "Fetched %d bytes (status %s)", len(response.content), response.status_code
            )
            return response.text
        except httpx.HTTPStatusError as exc:
            log.error("HTTP error %s from %s", exc.response.status_code, url)
            if exc.response.status_code < 500:
                # Client-side errors are not retryable.
                raise
        except httpx.RequestError as exc:
            log.warning("Network error on attempt %d: %s", attempt, exc)

        if attempt < MAX_RETRIES:
            wait = RETRY_BACKOFF_BASE ** attempt
            log.info("Waiting %ds before retry…", wait)
            time.sleep(wait)

    raise RuntimeError(f"Failed to fetch {url} after {MAX_RETRIES} attempts.")


def write_markdown(content: str, output_path: Path) -> None:
    """Write *content* to *output_path*, creating parent directories as needed."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")

    sha256 = hashlib.sha256(content.encode()).hexdigest()
    log.info("Written to %s (SHA-256: %s…)", output_path, sha256[:16])

    # Write a lightweight checksum sidecar for cache-busting / integrity checks.
    sidecar = output_path.with_suffix(".md.sha256")
    sidecar.write_text(sha256 + "\n", encoding="utf-8")
    log.info("Checksum written to %s", sidecar)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fetch upstream OSINT Awesome-list Markdown.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--repo-url",
        default=DEFAULT_REPO_URL,
        help="Raw GitHub URL of the source Markdown file.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Local path to save the downloaded Markdown.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    try:
        content = fetch_markdown(args.repo_url)
    except Exception as exc:
        log.error("Fetch failed: %s", exc)
        return 1

    write_markdown(content, args.output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
