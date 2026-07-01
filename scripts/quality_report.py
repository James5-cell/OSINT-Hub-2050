#!/usr/bin/env python3
"""
OSINT Hub — Data Quality Report
Analyzes apps/web/data/tools.json and apps/web/data/workflows.en.json
and prints a structured quality report to stdout.

Usage:
    python scripts/quality_report.py
    python scripts/quality_report.py --json   # machine-readable output
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT   = Path(__file__).resolve().parent.parent
TOOLS_FILE  = REPO_ROOT / "apps" / "web" / "data" / "tools.json"
WF_FILE     = REPO_ROOT / "apps" / "web" / "data" / "workflows.en.json"

# ── ANSI helpers ─────────────────────────────────────────────────────────────
def c(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m"

OK      = c("✓", "32")
WARN    = c("⚠", "33")
ERR     = c("✗", "31")
BOLD    = "1"
DIM     = "2"

def header(title: str) -> None:
    line = "─" * 60
    print(f"\n{c(line, DIM)}")
    print(f"  {c(title.upper(), BOLD)}")
    print(f"{c(line, DIM)}")

def row(label: str, value: object, warn: bool = False, err: bool = False) -> None:
    icon = ERR if err else (WARN if warn else OK)
    print(f"  {icon}  {label:<42}  {c(str(value), BOLD)}")

# ── Loaders ──────────────────────────────────────────────────────────────────
def load_tools() -> list[dict]:
    if not TOOLS_FILE.exists():
        print(f"{ERR}  tools.json not found at {TOOLS_FILE}", file=sys.stderr)
        sys.exit(1)
    with TOOLS_FILE.open() as f:
        return json.load(f)

def load_workflows() -> list[dict]:
    if not WF_FILE.exists():
        print(f"{WARN}  workflows.en.json not found at {WF_FILE}", file=sys.stderr)
        return []
    with WF_FILE.open() as f:
        return json.load(f)

# ── Analysis ─────────────────────────────────────────────────────────────────
def analyse_tools(tools: list[dict]) -> dict:
    total = len(tools)

    # Description coverage
    missing_en    = [t for t in tools if not _nonempty(t.get("description_en"))]
    missing_zh    = [t for t in tools if not _nonempty(t.get("description_zh_tw"))]
    missing_both  = [t for t in tools
                     if not _nonempty(t.get("description_en"))
                     and not _nonempty(t.get("description_zh_tw"))
                     and not _nonempty(t.get("raw_description"))]

    # Use cases
    empty_use_cases = [t for t in tools
                       if not t.get("use_cases") or len(t["use_cases"]) == 0]

    # Pricing / difficulty unknown
    unknown_pricing    = [t for t in tools if t.get("pricing") in (None, "unknown")]
    unknown_difficulty = [t for t in tools if t.get("difficulty") in (None, "unknown")]

    # Ethical flags
    flagged = [t for t in tools if t.get("ethical_flag") is True]

    # Active / dead
    dead   = [t for t in tools if t.get("is_dead_link") is True]
    inactive = [t for t in tools if t.get("is_active") is False]

    # Advanced tools
    advanced = [t for t in tools if t.get("difficulty") == "advanced"]

    # Review status
    review_counts: Counter = Counter()
    for t in tools:
        rev = t.get("review") or {}
        review_counts[rev.get("status", "none")] += 1

    # Duplicate URLs
    url_counts: Counter = Counter(t.get("url", "") for t in tools)
    dup_urls = {url: cnt for url, cnt in url_counts.items() if cnt > 1}

    # Duplicate names
    name_counts: Counter = Counter(t.get("name", "").strip().lower() for t in tools)
    dup_names = {name: cnt for name, cnt in name_counts.items() if cnt > 1}

    # Distributions
    by_section:      Counter = Counter(t.get("source_section", "unknown") for t in tools)
    tag_counter:     Counter = Counter()
    target_counter:  Counter = Counter()
    platform_counter: Counter = Counter()

    for t in tools:
        for tag in t.get("tags") or []:
            tag_counter[tag] += 1
        for tt in t.get("target_types") or []:
            target_counter[tt] += 1
        for p in t.get("platforms") or []:
            platform_counter[p] += 1

    # Pricing / difficulty distributions
    pricing_dist:    Counter = Counter(t.get("pricing", "unknown") for t in tools)
    difficulty_dist: Counter = Counter(t.get("difficulty", "unknown") for t in tools)

    # Curation status
    curation_dist: Counter = Counter(t.get("curation_status", "none") for t in tools)
    missing_curation_reason = [
        t for t in tools
        if t.get("curation_status") and not _nonempty(t.get("curation_reason"))
    ]

    # Maintenance status
    maintenance_dist: Counter = Counter(t.get("maintenance_status", "unknown") for t in tools)

    # Missing last_verified_at
    missing_verified_at = [t for t in tools if not _nonempty(t.get("last_verified_at"))]

    # Ethical flags by source section
    flagged_by_section: Counter = Counter(
        t.get("source_section", "unknown") for t in tools if t.get("ethical_flag") is True
    )

    # Categories with fewer than 5 tools (by source_section proxy)
    thin_sections = {sec: cnt for sec, cnt in by_section.items() if cnt < 5}

    return {
        "total":              total,
        "missing_en":         missing_en,
        "missing_zh":         missing_zh,
        "missing_both":       missing_both,
        "empty_use_cases":    empty_use_cases,
        "unknown_pricing":    unknown_pricing,
        "unknown_difficulty": unknown_difficulty,
        "flagged":            flagged,
        "flagged_by_section": dict(flagged_by_section),
        "dead":               dead,
        "inactive":           inactive,
        "advanced":           advanced,
        "review_counts":      dict(review_counts),
        "dup_urls":           dup_urls,
        "dup_names":          dup_names,
        "by_section":         dict(by_section),
        "thin_sections":      thin_sections,
        "tag_counter":        dict(tag_counter),
        "target_counter":     dict(target_counter),
        "platform_counter":   dict(platform_counter),
        "pricing_dist":       dict(pricing_dist),
        "difficulty_dist":    dict(difficulty_dist),
        "curation_dist":      dict(curation_dist),
        "missing_curation_reason": missing_curation_reason,
        "maintenance_dist":   dict(maintenance_dist),
        "missing_verified_at": missing_verified_at,
    }


def analyse_workflows(workflows: list[dict], tools: list[dict]) -> dict:
    total = len(workflows)

    tool_name_set = {t["name"] for t in tools}
    tool_id_set   = {t["id"]   for t in tools}

    # Workflows with missing linked tools
    wf_missing_tools: dict[str, list[str]] = {}
    for wf in workflows:
        missing = []
        for tn in wf.get("recommended_tools", []):
            if tn not in tool_name_set:
                missing.append(tn)
        for step in wf.get("steps", []):
            for tn in step.get("tools", []):
                if tn not in tool_name_set and tn not in tool_id_set:
                    if tn not in missing:
                        missing.append(tn)
        if missing:
            wf_missing_tools[wf["id"]] = missing

    # Tools without any workflow coverage
    covered_tool_names: set[str] = set()
    for wf in workflows:
        for tn in wf.get("recommended_tools", []):
            covered_tool_names.add(tn)
        for step in wf.get("steps", []):
            for tn in step.get("tools", []):
                covered_tool_names.add(tn)

    uncovered_tools = [t["name"] for t in tools if t["name"] not in covered_tool_names]

    # Difficulty distribution
    diff_dist: Counter = Counter(wf.get("difficulty", "unknown") for wf in workflows)
    risk_dist: Counter = Counter(wf.get("risk_level", "unknown") for wf in workflows)

    return {
        "total":               total,
        "wf_missing_tools":    wf_missing_tools,
        "uncovered_tools":     uncovered_tools,
        "diff_dist":           dict(diff_dist),
        "risk_dist":           dict(risk_dist),
    }


def _nonempty(val: object) -> bool:
    return isinstance(val, str) and val.strip() != ""


# ── Printing ─────────────────────────────────────────────────────────────────
def print_report(tr: dict, wr: dict) -> None:
    # ── Tool summary ─────────────────────────────────────────────────────────
    header("Tool Quality Report")
    row("Total tools",            tr["total"])
    row("Has description_en",     tr["total"] - len(tr["missing_en"]))
    row("Missing description_en", len(tr["missing_en"]),
        warn=len(tr["missing_en"]) > 0)
    row("Missing description_zh_tw", len(tr["missing_zh"]),
        warn=len(tr["missing_zh"]) > 0)
    row("No description at all",  len(tr["missing_both"]),
        err=len(tr["missing_both"]) > 0)
    row("Empty use_cases",        len(tr["empty_use_cases"]),
        warn=len(tr["empty_use_cases"]) > 0)
    row("Unknown pricing",        len(tr["unknown_pricing"]),
        warn=len(tr["unknown_pricing"]) > 0)
    row("Unknown difficulty",     len(tr["unknown_difficulty"]),
        warn=len(tr["unknown_difficulty"]) > 0)
    row("Ethical flag",           len(tr["flagged"]))
    row("Advanced difficulty",    len(tr["advanced"]))
    row("Dead links",             len(tr["dead"]),     err=len(tr["dead"]) > 0)
    row("Inactive tools",         len(tr["inactive"]), warn=len(tr["inactive"]) > 0)
    row("Duplicate URLs",         len(tr["dup_urls"]), err=len(tr["dup_urls"]) > 0)
    row("Duplicate names",        len(tr["dup_names"]), err=len(tr["dup_names"]) > 0)

    if tr["dup_urls"]:
        print()
        print(f"    {c('Duplicate URLs:', BOLD)}")
        for url, cnt in tr["dup_urls"].items():
            print(f"      — {url}  ({cnt}×)")

    if tr["dup_names"]:
        print()
        print(f"    {c('Duplicate names:', BOLD)}")
        for name, cnt in tr["dup_names"].items():
            print(f"      — {name}  ({cnt}×)")

    # ── Review status ─────────────────────────────────────────────────────────
    header("Review Status")
    for status, cnt in sorted(tr["review_counts"].items(), key=lambda x: -x[1]):
        row(status, cnt)

    # ── Pricing & difficulty distribution ────────────────────────────────────
    header("Pricing Distribution")
    for k, v in sorted(tr["pricing_dist"].items(), key=lambda x: -x[1]):
        row(k, v)

    header("Difficulty Distribution")
    for k, v in sorted(tr["difficulty_dist"].items(), key=lambda x: -x[1]):
        row(k, v)

    # ── Curation status ───────────────────────────────────────────────────────
    header("Curation Status")
    for status, cnt in sorted(tr["curation_dist"].items(), key=lambda x: -x[1]):
        row(status, cnt)
    row("Missing curation_reason", len(tr["missing_curation_reason"]),
        warn=len(tr["missing_curation_reason"]) > 0)

    # ── Maintenance status ────────────────────────────────────────────────────
    header("Maintenance Status")
    for status, cnt in sorted(tr["maintenance_dist"].items(), key=lambda x: -x[1]):
        row(status, cnt)
    row("Missing last_verified_at", len(tr["missing_verified_at"]),
        warn=len(tr["missing_verified_at"]) > 5)

    # ── Ethical flags by section ──────────────────────────────────────────────
    header("Ethical Flags by Section")
    if tr["flagged_by_section"]:
        for sec, cnt in sorted(tr["flagged_by_section"].items(), key=lambda x: -x[1]):
            row(sec, cnt, warn=True)
    else:
        print(f"  {OK}  No flagged tools")

    # ── Thin sections (< 5 tools) ─────────────────────────────────────────────
    header("Sections with Fewer than 5 Tools")
    if tr["thin_sections"]:
        for sec, cnt in sorted(tr["thin_sections"].items(), key=lambda x: x[1]):
            row(sec, cnt, warn=True)
    else:
        print(f"  {OK}  All sections have 5+ tools")

    # ── Source sections ───────────────────────────────────────────────────────
    header("Tools by Source Section")
    for section, cnt in sorted(tr["by_section"].items(), key=lambda x: -x[1]):
        row(section, cnt)

    # ── Top target types ─────────────────────────────────────────────────────
    header("Top Target Types")
    for tt, cnt in sorted(tr["target_counter"].items(), key=lambda x: -x[1])[:10]:
        row(tt, cnt)

    # ── Top tags ─────────────────────────────────────────────────────────────
    header("Top Tags (top 15)")
    for tag, cnt in sorted(tr["tag_counter"].items(), key=lambda x: -x[1])[:15]:
        row(tag, cnt)

    # ── Platform distribution ─────────────────────────────────────────────────
    header("Platform Distribution")
    for p, cnt in sorted(tr["platform_counter"].items(), key=lambda x: -x[1]):
        row(p, cnt)

    # ── Workflow summary ─────────────────────────────────────────────────────
    header("Workflow Quality Report")
    row("Total workflows", wr["total"])

    header("Workflow Difficulty Distribution")
    for k, v in sorted(wr["diff_dist"].items(), key=lambda x: -x[1]):
        row(k, v)

    header("Workflow Risk Distribution")
    for k, v in sorted(wr["risk_dist"].items(), key=lambda x: -x[1]):
        row(k, v)

    # ── Workflow ↔ tool linkage ───────────────────────────────────────────────
    header("Workflow Tool Coverage")
    if wr["wf_missing_tools"]:
        print(f"  {WARN}  Workflows referencing tools not in tools.json:")
        for wf_id, missing in wr["wf_missing_tools"].items():
            print(f"      [{wf_id}]")
            for tn in missing:
                print(f"        — {tn}")
    else:
        print(f"  {OK}  All workflow tool references are present in tools.json")

    print()
    uncov = wr["uncovered_tools"]
    row("Tools with no workflow coverage",
        len(uncov), warn=len(uncov) > 0)
    if uncov:
        print()
        for tn in sorted(uncov):
            print(f"      — {tn}")

    print(f"\n{c('─' * 60, DIM)}\n  {c('Report complete.', BOLD)}\n")


def build_json_report(tr: dict, wr: dict) -> dict:
    """Returns a JSON-serializable summary dict."""
    def names(lst: list[dict]) -> list[str]:
        return [t.get("name", t.get("id", "?")) for t in lst]

    return {
        "tools": {
            "total":              tr["total"],
            "missing_description_en":    names(tr["missing_en"]),
            "missing_description_zh_tw": names(tr["missing_zh"]),
            "missing_all_descriptions":  names(tr["missing_both"]),
            "empty_use_cases":   names(tr["empty_use_cases"]),
            "unknown_pricing":   names(tr["unknown_pricing"]),
            "unknown_difficulty": names(tr["unknown_difficulty"]),
            "ethical_flag_count": len(tr["flagged"]),
            "ethical_flags_by_section": tr["flagged_by_section"],
            "dead_links":        names(tr["dead"]),
            "inactive":          names(tr["inactive"]),
            "advanced_count":    len(tr["advanced"]),
            "duplicate_urls":    tr["dup_urls"],
            "duplicate_names":   tr["dup_names"],
            "curation_status":   tr["curation_dist"],
            "missing_curation_reason": names(tr["missing_curation_reason"]),
            "maintenance_status": tr["maintenance_dist"],
            "missing_last_verified_at": names(tr["missing_verified_at"]),
            "thin_sections":     tr["thin_sections"],
            "review_status":     tr["review_counts"],
            "pricing_dist":      tr["pricing_dist"],
            "difficulty_dist":   tr["difficulty_dist"],
            "source_sections":   tr["by_section"],
            "top_target_types":  dict(sorted(tr["target_counter"].items(), key=lambda x: -x[1])[:10]),
            "top_tags":          dict(sorted(tr["tag_counter"].items(), key=lambda x: -x[1])[:15]),
            "platform_dist":     tr["platform_counter"],
        },
        "workflows": {
            "total":             wr["total"],
            "difficulty_dist":   wr["diff_dist"],
            "risk_dist":         wr["risk_dist"],
            "missing_tool_links": wr["wf_missing_tools"],
            "uncovered_tools":   wr["uncovered_tools"],
        },
    }


# ── CLI ───────────────────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(
        description="OSINT Hub data quality report",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")
    args = parser.parse_args()

    tools     = load_tools()
    workflows = load_workflows()

    tr = analyse_tools(tools)
    wr = analyse_workflows(workflows, tools)

    if args.json:
        print(json.dumps(build_json_report(tr, wr), indent=2))
    else:
        print_report(tr, wr)


if __name__ == "__main__":
    main()
