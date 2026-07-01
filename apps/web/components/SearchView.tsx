"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Tool, FilterState } from "@/lib/types";
import { EMPTY_FILTERS } from "@/lib/types";
import { allTools, allTags, allTargetTypes, allPlatforms } from "@/lib/tools";
import { searchTools, buildSearchIndex } from "@/lib/search";
import { applyFilters, countActiveFilters } from "@/lib/filters";

import ToolSearch from "./ToolSearch";
import ToolFilters from "./ToolFilters";
import ToolGrid from "./ToolGrid";
import ActiveFilters from "./ActiveFilters";

interface SearchViewProps {
  initialQuery: string;
  initialFilters: FilterState;
  onBack: () => void;
  onDetails: (tool: Tool) => void;
}

export default function SearchView({
  initialQuery,
  initialFilters,
  onBack,
  onDetails,
}: SearchViewProps) {
  const [query, setQuery]     = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    buildSearchIndex(allTools);
  }, []);

  const filteredTools = useMemo(() => {
    const searched = searchTools(query, allTools);
    return applyFilters(searched, filters);
  }, [query, filters]);

  const activeCount = countActiveFilters(filters);
  const hasQuery    = query.trim().length > 0;

  const isFilteredOnly  = !hasQuery && activeCount > 0;
  const resultHeading   = hasQuery
    ? `Results for "${query}"`
    : isFilteredOnly
    ? "Filtered tools"
    : "All tools";

  return (
    <main className="flex-1 animate-fade-in">
      {/* ── Breadcrumb ────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="mx-auto max-w-screen-xl px-5 py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to Index"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Index
          </button>
          <span style={{ color: "var(--faint)" }}>/</span>
          <span
            className="text-xs"
            style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}
          >
            {hasQuery ? `Search` : "Browse"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-5 py-10">
        {/* ── Section header ───────────────────────────────── */}
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--text)" }}
            >
              {resultHeading}
            </h1>
            {isFilteredOnly && (
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {activeCount} filter{activeCount !== 1 ? "s" : ""} active
              </p>
            )}
          </div>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
            aria-live="polite"
            aria-atomic="true"
          >
            <span style={{ color: "var(--accent)" }}>{filteredTools.length}</span>
            {" / "}
            {allTools.length} tools
          </p>
        </div>

        {/* ── Search + Filters ─────────────────────────────── */}
        <div className="flex items-start gap-2 mb-4">
          <ToolSearch value={query} onChange={setQuery} />
          <ToolFilters
            filters={filters}
            onChange={setFilters}
            availableTags={allTags}
            availableTargetTypes={allTargetTypes}
            availablePlatforms={allPlatforms}
          />
        </div>

        {/* Active filter chips */}
        <ActiveFilters
          query={query}
          filters={filters}
          onClearQuery={() => setQuery("")}
          onUpdateFilters={setFilters}
        />

        {/* Clear all */}
        {(hasQuery || activeCount > 0) && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => { setQuery(""); setFilters(EMPTY_FILTERS); }}
              className="text-xs transition-colors"
              style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--danger)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              clear all
            </button>
          </div>
        )}

        {/* Tool grid */}
        <ToolGrid tools={filteredTools} onDetails={onDetails} />
      </div>
    </main>
  );
}
