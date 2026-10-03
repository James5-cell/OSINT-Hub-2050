"""
tests/test_enrich_cache.py
---------------------------
Unit tests for:
  - scripts/etl/cache.py (EnrichmentCache, raw_content_hash, compound_cache_key)
  - scripts/etl/enrich.py (render_prompt, extract_json, validate_payload,
                            _parse_and_validate, enrich_tool, prompt_file_hash)

All LLM calls are mocked — no real API keys needed.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Path setup so we can import from scripts/ without installing the package.
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from scripts.etl.cache import EnrichmentCache, raw_content_hash, compound_cache_key  # noqa: E402
from scripts.etl.enrich import (  # noqa: E402
    extract_json,
    render_prompt,
    validate_payload,
    enrich_tool,
    _reset_prompt_cache,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

FIXTURES_DIR = REPO_ROOT / "tests" / "fixtures"


@pytest.fixture
def sample_raw_tool():
    tools = json.loads((FIXTURES_DIR / "raw_tools.sample.json").read_text())
    return tools[0]  # WhatsMyName


@pytest.fixture
def valid_payload():
    return {
        "description_zh_tw": "此工具可跨多個網站枚舉用戶名稱，協助研究人員確認目標在各平台的帳號存在情況。",
        "use_cases": [
            "調查某用戶名稱在 GitHub、Twitter 等平台的存在",
            "驗證社群媒體帳號一致性",
        ],
        "tags": ["username", "social-media", "passive-recon"],
        "pricing": "free",
        "difficulty": "beginner",
        "target_types": ["username"],
        "platforms": ["web"],
        "ethical_flag": False,
        "ethics_note": None,
    }


@pytest.fixture
def tmp_cache(tmp_path):
    return EnrichmentCache(tmp_path / "cache.json")


# ===========================================================================
# cache.py tests
# ===========================================================================


class TestRawContentHash:
    def test_deterministic(self):
        h1 = raw_content_hash("Tool", "https://example.com", "desc")
        h2 = raw_content_hash("Tool", "https://example.com", "desc")
        assert h1 == h2

    def test_different_inputs_differ(self):
        h1 = raw_content_hash("Tool A", "https://a.com", "desc")
        h2 = raw_content_hash("Tool B", "https://b.com", "desc")
        assert h1 != h2

    def test_length(self):
        h = raw_content_hash("x", "https://x.com", "y")
        assert len(h) == 64  # SHA-256 hex

    def test_whitespace_stripped(self):
        h1 = raw_content_hash("Tool", "https://example.com", "desc")
        h2 = raw_content_hash("  Tool  ", "  https://example.com  ", "  desc  ")
        assert h1 == h2


class TestCompoundCacheKey:
    def test_deterministic(self):
        k1 = compound_cache_key("a", "b", "c")
        k2 = compound_cache_key("a", "b", "c")
        assert k1 == k2

    def test_any_change_invalidates(self):
        base = compound_cache_key("content1", "prompt1", "1.0.0")
        assert compound_cache_key("content2", "prompt1", "1.0.0") != base
        assert compound_cache_key("content1", "prompt2", "1.0.0") != base
        assert compound_cache_key("content1", "prompt1", "1.1.0") != base


class TestEnrichmentCache:
    def test_empty_cache_miss(self, tmp_cache):
        assert tmp_cache.get("chash", "phash", "1.0") is None
        assert not tmp_cache.has("chash", "phash", "1.0")

    def test_set_and_get(self, tmp_cache, valid_payload):
        chash, phash, sversion = "c"*64, "p"*64, "1.1.0"
        tmp_cache.set(chash, phash, sversion, valid_payload)
        result = tmp_cache.get(chash, phash, sversion)
        assert result is not None
        assert result["pricing"] == "free"
        assert "_cached_at" not in result  # meta fields stripped
        assert "_raw_hash" not in result

    def test_has(self, tmp_cache, valid_payload):
        chash, phash, sversion = "c"*64, "p"*64, "1.1.0"
        assert not tmp_cache.has(chash, phash, sversion)
        tmp_cache.set(chash, phash, sversion, valid_payload)
        assert tmp_cache.has(chash, phash, sversion)

    def test_invalidate(self, tmp_cache, valid_payload):
        chash, phash, sversion = "c"*64, "p"*64, "1.1.0"
        tmp_cache.set(chash, phash, sversion, valid_payload)
        tmp_cache.invalidate(chash, phash, sversion)
        assert not tmp_cache.has(chash, phash, sversion)

    def test_persistence(self, tmp_path, valid_payload):
        """Cache should survive across instances (written to disk)."""
        cache_path = tmp_path / "cache.json"
        chash, phash, sversion = "d"*64, "p"*64, "1.1.0"

        c1 = EnrichmentCache(cache_path)
        c1.set(chash, phash, sversion, valid_payload)

        c2 = EnrichmentCache(cache_path)
        assert c2.has(chash, phash, sversion)
        assert c2.get(chash, phash, sversion)["pricing"] == "free"

    def test_prompt_change_invalidates(self, tmp_cache, valid_payload):
        """Tests proving prompt changes invalidate cache."""
        chash = "c"*64
        old_phash = "p1"*32
        new_phash = "p2"*32
        sversion = "1.1.0"

        tmp_cache.set(chash, old_phash, sversion, valid_payload)
        
        # Hit with old prompt hash
        assert tmp_cache.has(chash, old_phash, sversion)
        
        # Miss with new prompt hash (invalidated)
        assert not tmp_cache.has(chash, new_phash, sversion)

    def test_len(self, tmp_cache, valid_payload):
        assert len(tmp_cache) == 0
        tmp_cache.set("c"*64, "p"*64, "1.1.0", valid_payload)
        assert len(tmp_cache) == 1

    def test_corrupt_cache_file_handled(self, tmp_path):
        cache_path = tmp_path / "cache.json"
        cache_path.write_text("NOT JSON", encoding="utf-8")
        # Should not raise; should start fresh.
        c = EnrichmentCache(cache_path)
        assert len(c) == 0


# ===========================================================================
# enrich.py tests
# ===========================================================================


class TestExtractJson:
    def test_plain_json(self):
        text = '{"key": "value"}'
        assert json.loads(extract_json(text)) == {"key": "value"}

    def test_json_in_fence(self):
        text = '```json\n{"key": "value"}\n```'
        assert json.loads(extract_json(text)) == {"key": "value"}

    def test_json_in_unmarked_fence(self):
        text = '```\n{"key": 1}\n```'
        assert json.loads(extract_json(text)) == {"key": 1}

    def test_json_with_surrounding_text(self):
        text = 'Here is your answer:\n{"key": "v"}\nDone.'
        assert json.loads(extract_json(text)) == {"key": "v"}


class TestValidatePayload:
    def test_valid_payload_passes(self, valid_payload):
        errors = validate_payload(valid_payload)
        assert errors == []

    def test_missing_required_field(self, valid_payload):
        del valid_payload["description_zh_tw"]
        errors = validate_payload(valid_payload)
        assert any("description_zh_tw" in e for e in errors)

    def test_invalid_pricing_enum(self, valid_payload):
        valid_payload["pricing"] = "banana"
        errors = validate_payload(valid_payload)
        assert any("pricing" in e or "banana" in e for e in errors)

    def test_invalid_target_type(self, valid_payload):
        valid_payload["target_types"] = ["unicorn"]
        errors = validate_payload(valid_payload)
        assert errors  # "unicorn" not in enum

    def test_empty_use_cases(self, valid_payload):
        valid_payload["use_cases"] = []
        errors = validate_payload(valid_payload)
        assert errors  # minItems: 1

    def test_too_many_tags(self, valid_payload):
        valid_payload["tags"] = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"]
        errors = validate_payload(valid_payload)
        assert errors  # maxItems: 8


class TestRenderPrompt:
    def test_substitution(self, sample_raw_tool):
        _reset_prompt_cache()
        system, user = render_prompt(sample_raw_tool)
        assert sample_raw_tool["name"] in user
        assert sample_raw_tool["url"] in user
        assert "{{tool_name}}" not in user
        assert "{{tool_url}}" not in user

    def test_system_not_empty(self, sample_raw_tool):
        _reset_prompt_cache()
        system, _ = render_prompt(sample_raw_tool)
        assert len(system) > 20


class TestEnrichTool:
    def _mock_client(self, response_text: str):
        client = MagicMock()
        client.model = "mock-model"
        client.complete.return_value = response_text
        return client

    def test_successful_enrichment(self, sample_raw_tool, valid_payload):
        client = self._mock_client(json.dumps(valid_payload))
        result = enrich_tool(sample_raw_tool, client)
        assert result is not None
        assert result["pricing"] == "free"
        assert result["description_zh_tw"] == valid_payload["description_zh_tw"]
        client.complete.assert_called_once()  # no repair needed

    def test_json_in_fence_accepted(self, sample_raw_tool, valid_payload):
        fenced = f"```json\n{json.dumps(valid_payload)}\n```"
        client = self._mock_client(fenced)
        result = enrich_tool(sample_raw_tool, client)
        assert result is not None

    def test_invalid_json_triggers_repair(self, sample_raw_tool, valid_payload):
        """First call returns bad JSON; second (repair) call returns valid."""
        client = MagicMock()
        client.model = "mock-model"
        client.complete.side_effect = [
            "INVALID JSON",
            json.dumps(valid_payload),
        ]
        result = enrich_tool(sample_raw_tool, client)
        assert result is not None
        assert client.complete.call_count == 2  # original + repair

    def test_both_attempts_fail_returns_none(self, sample_raw_tool, tmp_path):
        """When both attempts return invalid JSON, enrich_tool returns None."""
        client = MagicMock()
        client.model = "mock-model"
        client.complete.return_value = "NOT JSON AT ALL"

        # Patch failures path so we don't write to real data/ during tests.
        with patch("scripts.etl.enrich.FAILURES_PATH", tmp_path / "failures.json"):
            result = enrich_tool(sample_raw_tool, client)

        assert result is None
        assert client.complete.call_count == 2
        failures = json.loads((tmp_path / "failures.json").read_text())
        assert len(failures) == 1
        assert failures[0]["tool_id"] == sample_raw_tool["id"]

    def test_llm_error_writes_failure(self, sample_raw_tool, tmp_path):
        from scripts.etl.llm.base import LLMError

        client = MagicMock()
        client.model = "mock-model"
        client.complete.side_effect = LLMError("timeout")

        with patch("scripts.etl.enrich.FAILURES_PATH", tmp_path / "failures.json"):
            result = enrich_tool(sample_raw_tool, client)

        assert result is None
        failures = json.loads((tmp_path / "failures.json").read_text())
        assert "timeout" in failures[0]["reason"]
