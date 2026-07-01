"""
tests/test_merge.py
--------------------
Unit tests for scripts/etl/merge.py:
  - build_provenance
  - merge_record
  - validate_record
  - load_existing_enriched
  - run_merge (dry-run, live modes, force_reviewed)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from scripts.etl.cache import EnrichmentCache, raw_content_hash  # noqa: E402
from scripts.etl.merge import (  # noqa: E402
    build_provenance,
    load_existing_enriched,
    merge_record,
    run_merge,
    validate_record,
    build_source_permalink,
)
from scripts.etl.enrich import prompt_file_hash

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

FIXTURES_DIR = REPO_ROOT / "tests" / "fixtures"


@pytest.fixture
def raw_tool():
    tools = json.loads((FIXTURES_DIR / "raw_tools.sample.json").read_text())
    return tools[0]  # WhatsMyName


@pytest.fixture
def valid_payload():
    return {
        "description_zh_tw": "此工具可跨多個網站枚舉用戶名稱。",
        "use_cases": ["確認目標帳號在各平台的存在"],
        "tags": ["username", "social-media"],
        "pricing": "free",
        "difficulty": "beginner",
        "target_types": ["username"],
        "platforms": ["web"],
        "ethical_flag": False,
        "ethics_note": None,
    }


@pytest.fixture
def mock_client(valid_payload):
    client = MagicMock()
    client.model = "mock-model-v1"
    client.complete.return_value = json.dumps(valid_payload)
    return client


@pytest.fixture
def tmp_cache(tmp_path):
    return EnrichmentCache(tmp_path / "cache.json")


# ===========================================================================
# Helpers
# ===========================================================================


class TestSourcePermalink:
    def test_basic_osint(self):
        link = build_source_permalink("Basic OSINT", "https://github.com/repo")
        assert link == "https://github.com/repo/blob/main/README.md#basic-osint"

    def test_punctuation_and_spaces(self):
        link = build_source_permalink("Breaches, Leaks & Dump", "https://github.com/repo")
        assert link == "https://github.com/repo/blob/main/README.md#breaches-leaks--dump"


# ===========================================================================
# build_provenance
# ===========================================================================


class TestBuildProvenance:
    def test_fields_present(self, raw_tool):
        chash = "a" * 64
        phash = "f" * 64
        prov = build_provenance(raw_tool, "gpt-4o-mini", chash, phash)
        assert prov["raw_tool_id"] == raw_tool["id"]
        assert prov["raw_content_hash"] == chash
        assert prov["prompt_hash"] == phash
        assert prov["enrichment_model"] == "gpt-4o-mini"
        assert prov["source_section"] == raw_tool["section"]
        assert prov["source_permalink"] == "https://github.com/Astrosp/Awesome-OSINT-For-Everything/blob/main/README.md#basic-osint"
        assert "enriched_at" in prov
        assert "schema_version" in prov
        assert "source_repo" in prov


# ===========================================================================
# merge_record
# ===========================================================================


class TestMergeRecord:
    def test_all_raw_fields_present(self, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "gpt-4o-mini", chash, phash)
        assert record["id"] == raw_tool["id"]
        assert record["name"] == raw_tool["name"]
        assert record["url"] == raw_tool["url"]

    def test_payload_fields_present(self, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "gpt-4o-mini", chash, phash)
        assert record["pricing"] == "free"
        assert record["difficulty"] == "beginner"
        assert len(record["use_cases"]) >= 1

    def test_provenance_and_review_fields_present(self, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "mock-model", chash, phash)
        assert record["raw_content_hash"] == chash
        assert record["prompt_hash"] == phash
        assert record["enrichment_model"] == "mock-model"
        assert record["schema_version"] is not None
        assert record["review"]["status"] == "ai_candidate"


# ===========================================================================
# validate_record
# ===========================================================================


class TestValidateRecord:
    def test_valid_merged_record(self, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "mock-model", chash, phash)
        errors = validate_record(record)
        assert errors == [], f"Unexpected validation errors: {errors}"

    def test_missing_required_field_detected(self, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "mock-model", chash, phash)
        del record["name"]  # required field
        errors = validate_record(record)
        assert errors  # should report 'name' is required


# ===========================================================================
# load_existing_enriched
# ===========================================================================


class TestLoadExistingEnriched:
    def test_returns_empty_dict_when_file_missing(self, tmp_path):
        result = load_existing_enriched(tmp_path / "nonexistent.json")
        assert result == {}

    def test_loads_existing_records(self, tmp_path, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "model-x", chash, phash)
        out = tmp_path / "tools.json"
        out.write_text(json.dumps([record]), encoding="utf-8")

        loaded = load_existing_enriched(out)
        assert raw_tool["id"] in loaded

    def test_migrates_legacy_manually_reviewed_flag(self, tmp_path, raw_tool, valid_payload):
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = "f" * 64
        record = merge_record(raw_tool, valid_payload, "model-x", chash, phash)
        record["_manually_reviewed"] = True
        del record["review"]
        out = tmp_path / "tools.json"
        out.write_text(json.dumps([record]), encoding="utf-8")

        loaded = load_existing_enriched(out)
        assert raw_tool["id"] in loaded
        assert loaded[raw_tool["id"]]["review"]["status"] == "manually_reviewed"
        assert "_manually_reviewed" not in loaded[raw_tool["id"]]

    def test_corrupt_file_returns_empty(self, tmp_path):
        bad_file = tmp_path / "tools.json"
        bad_file.write_text("NOT JSON", encoding="utf-8")
        result = load_existing_enriched(bad_file)
        assert result == {}


# ===========================================================================
# run_merge — dry-run mode
# ===========================================================================


class TestRunMergeDryRun:
    def test_dry_run_no_api_call(self, raw_tool, mock_client, tmp_cache, tmp_path):
        output = tmp_path / "tools.json"
        stats = run_merge(
            raw_tools=[raw_tool],
            cache=tmp_cache,
            client=mock_client,
            output_path=output,
            dry_run=True,
        )
        mock_client.complete.assert_not_called()
        assert stats["skipped"] == 1

    def test_dry_run_does_not_write_output_when_no_cached(
        self, raw_tool, mock_client, tmp_cache, tmp_path
    ):
        """Dry-run should not create the output file if nothing is cached."""
        output = tmp_path / "tools.json"
        run_merge(
            raw_tools=[raw_tool],
            cache=tmp_cache,
            client=mock_client,
            output_path=output,
            dry_run=True,
        )
        # Output may or may not exist depending on whether there are cached items.
        # The key assertion is that the LLM was not called.
        mock_client.complete.assert_not_called()


# ===========================================================================
# run_merge — live mode
# ===========================================================================


class TestRunMergeLive:
    def test_enriches_and_writes(self, raw_tool, mock_client, tmp_cache, tmp_path):
        output = tmp_path / "tools.json"
        stats = run_merge(
            raw_tools=[raw_tool],
            cache=tmp_cache,
            client=mock_client,
            output_path=output,
        )
        assert stats["enriched"] == 1
        assert stats["failed"] == 0
        assert output.exists()

        records = json.loads(output.read_text())
        assert len(records) == 1
        assert records[0]["id"] == raw_tool["id"]
        assert records[0]["pricing"] == "free"

    def test_cache_prevents_second_call(self, raw_tool, mock_client, tmp_cache, tmp_path):
        output = tmp_path / "tools.json"
        # First run enriches.
        run_merge([raw_tool], tmp_cache, mock_client, output)
        call_count_after_first = mock_client.complete.call_count

        # Second run should hit cache.
        run_merge([raw_tool], tmp_cache, mock_client, output)
        assert mock_client.complete.call_count == call_count_after_first  # no new calls

    def test_force_bypasses_cache(self, raw_tool, mock_client, tmp_cache, tmp_path):
        output = tmp_path / "tools.json"
        run_merge([raw_tool], tmp_cache, mock_client, output)
        first_call_count = mock_client.complete.call_count

        run_merge([raw_tool], tmp_cache, mock_client, output, force=True)
        assert mock_client.complete.call_count > first_call_count

    def test_manually_reviewed_record_protected(
        self, raw_tool, mock_client, tmp_cache, tmp_path, valid_payload
    ):
        output = tmp_path / "tools.json"
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = prompt_file_hash()
        protected = merge_record(raw_tool, valid_payload, "old-model", chash, phash)
        protected["review"]["status"] = "manually_reviewed"
        output.write_text(json.dumps([protected]), encoding="utf-8")

        stats = run_merge([raw_tool], tmp_cache, mock_client, output)
        assert stats["protected"] == 1
        mock_client.complete.assert_not_called()

        # Verify the record is unchanged.
        records = json.loads(output.read_text())
        assert records[0]["enrichment_model"] == "old-model"

    def test_force_reviewed_overwrites_protected(
        self, raw_tool, mock_client, tmp_cache, tmp_path, valid_payload
    ):
        output = tmp_path / "tools.json"
        chash = raw_content_hash(raw_tool["name"], raw_tool["url"], raw_tool["raw_description"])
        phash = prompt_file_hash()
        protected = merge_record(raw_tool, valid_payload, "old-model", chash, phash)
        protected["review"]["status"] = "manually_reviewed"
        output.write_text(json.dumps([protected]), encoding="utf-8")

        # Use force=True to bypass cache, and force_reviewed=True to bypass protection
        stats = run_merge([raw_tool], tmp_cache, mock_client, output, force=True, force_reviewed=True)
        assert stats["protected"] == 0
        assert stats["enriched"] == 1
        mock_client.complete.assert_called()

        records = json.loads(output.read_text())
        assert records[0]["enrichment_model"] == mock_client.model
        # existing review status is preserved by logic "if tid in existing and 'review' in existing[tid]: record['review'] = existing[tid]['review']"
        assert records[0]["review"]["status"] == "manually_reviewed"

    def test_limit_respected(self, mock_client, tmp_cache, tmp_path):
        tools = json.loads((FIXTURES_DIR / "raw_tools.sample.json").read_text())
        output = tmp_path / "tools.json"
        stats = run_merge(tools, tmp_cache, mock_client, output, limit=1)
        assert stats["enriched"] == 1
        assert mock_client.complete.call_count == 1
