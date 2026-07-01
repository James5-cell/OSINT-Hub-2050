"""
parse.py — OSINT Hub ETL Step 2
---------------------------------
Parses the raw Markdown downloaded by fetch.py and extracts structured tool
records from one or more Markdown sections.

Design decisions
~~~~~~~~~~~~~~~~
- Uses a line-by-line state machine instead of a full Markdown AST to keep
  dependencies minimal and parsing logic transparent.
- Section detection is heading-level-agnostic (## and #### are both matched)
  to handle the inconsistent formatting of the upstream source.
- Each tool entry is expected to follow the canonical awesome-list pattern:
      - [Name](url) - Description text
- Entries that cannot be parsed to a URL are skipped with a warning.
- Dead-link markers (~~text~~) are recognised and the tool is flagged inactive.

Usage:
    python scripts/etl/parse.py \\
        --input  data/raw/source.md \\
        --output data/processed/raw_tools.json \\
        --sections "Basic OSINT" "Breaches and Leaks"
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("osint_hub.parse")


# ---------------------------------------------------------------------------
# Data model (raw record — no LLM enrichment yet)
# ---------------------------------------------------------------------------


@dataclass
class RawTool:
    id: str
    name: str
    url: str
    raw_description: str
    section: str
    source_file: str
    fetched_at: str  # ISO-8601
    is_dead_link: bool = False

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Regex constants
# ---------------------------------------------------------------------------

# Matches any heading level: ## Title, ### Title, #### Title, etc.
HEADING_RE = re.compile(r"^#{1,6}\s+(.*)", re.MULTILINE)

# Canonical list item: - [Name](url) - Description
# Also handles: - ~~[Name](url)~~ (dead link)
LIST_ITEM_RE = re.compile(r"^\s*-\s+(.+)")

# Markdown link: [text](url)
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

# Dead-link strikethrough: ~~...~~
DEAD_LINK_RE = re.compile(r"~~(.+?)~~")

# HTML color tag used to mark dead sites: <font color=red>Dead!</font>
DEAD_MARKER_RE = re.compile(r"<font[^>]*>.*?Dead.*?</font>", re.IGNORECASE)

# Strip HTML tags
HTML_TAG_RE = re.compile(r"<[^>]+>")

# Strip markdown bold/italic
MD_EMPHASIS_RE = re.compile(r"[*_]{1,3}([^*_]+)[*_]{1,3}")

# Normalise whitespace
WHITESPACE_RE = re.compile(r"\s+")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def slugify(name: str) -> str:
    """Convert a tool name to a stable, URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = slug.strip("-")
    return slug or "unknown"


def clean_text(raw: str) -> str:
    """Strip HTML, Markdown emphasis, and normalise whitespace."""
    text = HTML_TAG_RE.sub("", raw)
    text = MD_EMPHASIS_RE.sub(r"\1", text)
    text = WHITESPACE_RE.sub(" ", text)
    return text.strip()


def is_valid_url(url: str) -> bool:
    return url.startswith(("http://", "https://"))


# ---------------------------------------------------------------------------
# Section extraction
# ---------------------------------------------------------------------------


def normalise_heading(heading: str) -> str:
    """Normalise a Markdown heading for comparison (lower, strip HTML/anchors)."""
    text = HTML_TAG_RE.sub("", heading)
    text = clean_text(text)
    return text.lower()


def extract_sections(content: str) -> dict[str, list[str]]:
    """
    Split Markdown content into sections keyed by normalised heading text.

    Returns a dict of { normalised_heading: [lines] }.
    """
    sections: dict[str, list[str]] = {}
    current_heading: str | None = None
    current_lines: list[str] = []

    for line in content.splitlines():
        heading_match = HEADING_RE.match(line)
        if heading_match:
            if current_heading is not None:
                sections[current_heading] = current_lines
            current_heading = normalise_heading(heading_match.group(1))
            current_lines = []
        elif current_heading is not None:
            current_lines.append(line)

    if current_heading is not None:
        sections[current_heading] = current_lines

    log.info("Detected %d sections in source Markdown.", len(sections))
    return sections


# ---------------------------------------------------------------------------
# Tool entry parsing
# ---------------------------------------------------------------------------


def parse_tool_entry(
    line: str, section: str, source_file: str, fetched_at: str
) -> RawTool | None:
    """
    Parse a single Markdown list-item line into a RawTool.

    Returns None if the line does not describe a linkable tool.
    """
    is_dead = bool(DEAD_LINK_RE.search(line)) or bool(DEAD_MARKER_RE.search(line))

    # Strip dead-link strikethrough so we can still extract name/url.
    cleaned = DEAD_LINK_RE.sub(r"\1", line)

    link_match = LINK_RE.search(cleaned)
    if not link_match:
        return None  # No hyperlink → not a tool entry.

    name = clean_text(link_match.group(1))
    url = link_match.group(2).strip()

    if not is_valid_url(url):
        log.debug("Skipping non-HTTP URL: %s", url)
        return None

    # Extract description: everything after the link match, strip leading " - ".
    after_link = cleaned[link_match.end():]
    description = re.sub(r"^\s*[-–—]\s*", "", after_link)
    description = clean_text(description)

    # Remove any remaining inline Markdown links from description.
    description = LINK_RE.sub(lambda m: clean_text(m.group(1)), description)

    tool_id = slugify(name)

    return RawTool(
        id=tool_id,
        name=name,
        url=url,
        raw_description=description,
        section=section,
        source_file=source_file,
        fetched_at=fetched_at,
        is_dead_link=is_dead,
    )


def parse_tools_from_section(
    lines: list[str],
    section_display_name: str,
    source_file: str,
    fetched_at: str,
) -> Iterator[RawTool]:
    """Yield RawTool records from the lines of a single section."""
    for line in lines:
        if not LIST_ITEM_RE.match(line):
            continue

        tool = parse_tool_entry(line, section_display_name, source_file, fetched_at)
        if tool is None:
            continue

        log.debug("Parsed: %s (%s)", tool.name, tool.url)
        yield tool


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------


def deduplicate(tools: list[RawTool]) -> list[RawTool]:
    """
    Remove duplicate tool records.

    Deduplication key: (url). When duplicates are found, the first occurrence
    (lowest section index) is kept, but all section names are merged into the
    id for traceability via a log message.
    """
    seen: dict[str, RawTool] = {}
    dupes = 0
    for tool in tools:
        key = tool.url.rstrip("/")
        if key in seen:
            log.debug("Duplicate URL skipped (%s): %s", tool.section, tool.url)
            dupes += 1
        else:
            seen[key] = tool
    if dupes:
        log.info("Removed %d duplicate tool entries.", dupes)
    return list(seen.values())


# ---------------------------------------------------------------------------
# ID collision resolution
# ---------------------------------------------------------------------------


def resolve_id_collisions(tools: list[RawTool]) -> list[RawTool]:
    """
    Ensure every tool has a unique `id` field.

    When two tools share the same slug, append a numeric suffix (-2, -3…).
    """
    seen_ids: dict[str, int] = {}
    for tool in tools:
        base_id = tool.id
        count = seen_ids.get(base_id, 0)
        if count > 0:
            tool.id = f"{base_id}-{count + 1}"
        seen_ids[base_id] = count + 1
    return tools


# ---------------------------------------------------------------------------
# Main parse pipeline
# ---------------------------------------------------------------------------


def parse(
    content: str,
    sections_to_parse: list[str],
    source_file: str,
    fetched_at: str,
) -> list[RawTool]:
    """
    Full parse pipeline: section split → tool extraction → dedup → id resolution.

    Parameters
    ----------
    content:
        Raw Markdown text.
    sections_to_parse:
        List of section display names to include (case-insensitive).
        Pass an empty list to include ALL sections.
    source_file:
        Relative path identifier for provenance (stored in each record).
    fetched_at:
        ISO-8601 timestamp of fetch time.
    """
    all_sections = extract_sections(content)
    normalised_targets = {s.lower() for s in sections_to_parse}

    tools: list[RawTool] = []

    for norm_heading, lines in all_sections.items():
        if normalised_targets and norm_heading not in normalised_targets:
            continue

        # Use the original display name if available, else the normalised key.
        display_name = next(
            (s for s in sections_to_parse if s.lower() == norm_heading),
            norm_heading.title(),
        )

        section_tools = list(
            parse_tools_from_section(lines, display_name, source_file, fetched_at)
        )
        log.info(
            "Section '%s': %d tools extracted.", display_name, len(section_tools)
        )
        tools.extend(section_tools)

    if not tools:
        log.warning(
            "No tools extracted. Requested sections: %s. "
            "Available sections (normalised): %s",
            sections_to_parse,
            sorted(all_sections.keys()),
        )

    tools = deduplicate(tools)
    tools = resolve_id_collisions(tools)

    log.info("Total tools after deduplication: %d", len(tools))
    return tools


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

DEFAULT_SECTIONS = ["Basic OSINT"]
DEFAULT_INPUT = Path("data/raw/source.md")
DEFAULT_OUTPUT = Path("data/processed/raw_tools.json")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Parse upstream OSINT Markdown into structured JSON.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help="Path to the raw Markdown file produced by fetch.py.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Destination path for the normalised JSON output.",
    )
    parser.add_argument(
        "--sections",
        nargs="+",
        default=DEFAULT_SECTIONS,
        metavar="SECTION",
        help=(
            "One or more section names to parse (case-insensitive). "
            "Pass 'ALL' to include every section."
        ),
    )
    parser.add_argument(
        "--source-file",
        default="data/raw/source.md",
        help="Provenance label stored inside each record.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if not args.input.exists():
        log.error("Input file not found: %s", args.input)
        return 1

    content = args.input.read_text(encoding="utf-8")
    fetched_at = datetime.now(tz=timezone.utc).isoformat()

    sections = [] if "ALL" in [s.upper() for s in args.sections] else args.sections

    tools = parse(content, sections, args.source_file, fetched_at)

    if not tools:
        log.warning("Nothing to write — output file will be empty array.")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    records = [t.to_dict() for t in tools]
    args.output.write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log.info("Wrote %d records to %s", len(records), args.output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
