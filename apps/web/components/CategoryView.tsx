"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Tool, FilterState } from "@/lib/types";
import { EMPTY_FILTERS } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { allTools, allTags, allPlatforms } from "@/lib/tools";
import { searchTools, buildSearchIndex } from "@/lib/search";
import { applyFilters, countActiveFilters } from "@/lib/filters";
import { getCategoryById, filterCategoryTools } from "@/lib/categories";

import ToolSearch from "./ToolSearch";
import ToolFilters from "./ToolFilters";
import ToolGrid from "./ToolGrid";
import ActiveFilters from "./ActiveFilters";

/* ── Props ─────────────────────────────────────────────────── */
interface CategoryViewProps {
  mode: "target";
  categoryId: string;
  onBack: () => void;
  onDetails: (tool: Tool) => void;
}

export default function CategoryView({ categoryId, onBack, onDetails }: CategoryViewProps) {
  const { dict } = useLocale();
  const category = getCategoryById(categoryId);
  const categoryName = dict.categories[categoryId]?.name ?? "Unknown";
  const categoryDetail = dict.categories[categoryId]?.detail ?? "";

  const [query, setQuery]     = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const baseTools = useMemo(
    () => (category ? filterCategoryTools(allTools, category) : []),
    [category]
  );

  useEffect(() => { buildSearchIndex(baseTools); }, [baseTools]);

  const filteredTools = useMemo(() => {
    const searched = searchTools(query, baseTools);
    return applyFilters(searched, filters);
  }, [query, filters, baseTools]);

  const activeCount = countActiveFilters(filters);
  const hasQuery    = query.trim().length > 0;

  const recommended = useMemo(() => {
    const reviewed = baseTools.filter(
      (t) => t.review?.status === "manually_reviewed"
    );
    return (reviewed.length >= 2 ? reviewed : baseTools).slice(0, 3);
  }, [baseTools]);

  if (!category) {
    return (
      <ViewShell onBack={onBack} breadcrumb="Unknown">
        <EmptyMessage title={dict.common.categoryNotFound} message={dict.common.categoryNotFoundDesc} />
      </ViewShell>
    );
  }

  if (baseTools.length === 0) {
    return (
      <ViewShell onBack={onBack} breadcrumb={categoryName}>
        <EmptyMessage title={categoryName} message={dict.common.categoryIndexing} />
      </ViewShell>
    );
  }

  return (
    <ViewShell onBack={onBack} breadcrumb={categoryName}>
      {/* Category header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: "var(--text)" }}>
          {categoryName}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {categoryDetail}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
            {t(dict.common.toolsCountInCategory, { n: baseTools.length })}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {category.targetTypes.map((t) => (
              <Chip key={t} label={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommended tools */}
      {recommended.length > 0 && (
        <div className="mb-8 rounded-md p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-3" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {dict.common.recommendedStarts}
          </p>
          <div className="flex flex-wrap gap-2">
            {recommended.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => onDetails(tool)}
                aria-label={`${dict.tool.inspect} ${tool.name}`}
                className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all"
                style={{ fontFamily: "var(--font-mono)", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
                onMouseOver={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "var(--accent-dim)"; el.style.color = "var(--accent)"; }}
                onMouseOut={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text)"; }}
              >
                {tool.name}
                <span style={{ color: "var(--faint)", fontSize: "0.65rem" }} aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex items-start gap-2 mb-4">
        <ToolSearch value={query} onChange={setQuery} />
        <ToolFilters filters={filters} onChange={setFilters} availableTags={allTags} availableTargetTypes={category.targetTypes} availablePlatforms={allPlatforms} />
      </div>

      <ActiveFilters query={query} filters={filters} onClearQuery={() => setQuery("")} onUpdateFilters={setFilters} />

      <div className="mb-5 flex items-center justify-between" aria-live="polite" aria-atomic="true">
        <p className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
          <span style={{ color: "var(--accent)" }}>{filteredTools.length}</span> / {baseTools.length} {dict.search.tools.toLowerCase()}
          {(hasQuery || activeCount > 0) && (
            <button type="button" onClick={() => { setQuery(""); setFilters(EMPTY_FILTERS); }} className="ml-3 transition-colors" style={{ color: "var(--muted)" }} onMouseOver={(e) => (e.currentTarget.style.color = "var(--danger)")} onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}>
              {dict.common.clear}
            </button>
          )}
        </p>
      </div>

      <ToolGrid tools={filteredTools} onDetails={onDetails} />
    </ViewShell>
  );
}

/* ── Shared layout shell ────────────────────────────────────── */
function ViewShell({
  onBack,
  breadcrumb,
  children,
}: {
  onBack: () => void;
  breadcrumb: string;
  children: React.ReactNode;
}) {
  const { dict } = useLocale();

  return (
    <main className="flex-1 animate-fade-in">
      <div className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="mx-auto max-w-screen-xl px-5 py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label={dict.common.backToIndex}
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <ArrowLeft size={12} aria-hidden="true" />
            {dict.nav.index}
          </button>
          <span style={{ color: "var(--faint)" }}>/</span>
          <span className="text-xs" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>
            {breadcrumb}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-5 py-10">{children}</div>
    </main>
  );
}

function EmptyMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>{title}</p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{message}</p>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-xs"
      style={{
        fontFamily:  "var(--font-mono)",
        background:  "var(--accent-faint)",
        color:       "var(--accent-dim)",
        border:      "1px solid rgba(125,211,252,0.12)",
        fontSize:    "0.6rem",
      }}
    >
      {label}
    </span>
  );
}
