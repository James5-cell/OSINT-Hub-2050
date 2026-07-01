"use client";

import type { FilterState } from "@/lib/types";
import { countActiveFilters } from "@/lib/filters";

interface ActiveFiltersProps {
  query?: string;
  filters: FilterState;
  onClearQuery?: () => void;
  onUpdateFilters: (f: FilterState) => void;
}

export default function ActiveFilters({
  query,
  filters,
  onClearQuery,
  onUpdateFilters,
}: ActiveFiltersProps) {
  const activeCount = countActiveFilters(filters);
  const hasQuery = (query ?? "").trim().length > 0;

  if (!hasQuery && activeCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {hasQuery && onClearQuery && (
        <Chip
          label={`"${query}"`}
          onRemove={onClearQuery}
          variant="query"
        />
      )}
      {filters.target_types.map((t) => (
        <Chip
          key={`t-${t}`}
          label={t}
          onRemove={() =>
            onUpdateFilters({
              ...filters,
              target_types: filters.target_types.filter((v) => v !== t),
            })
          }
        />
      ))}
      {filters.pricing.map((p) => (
        <Chip
          key={`p-${p}`}
          label={p}
          onRemove={() =>
            onUpdateFilters({
              ...filters,
              pricing: filters.pricing.filter((v) => v !== p),
            })
          }
        />
      ))}
      {filters.difficulty.map((d) => (
        <Chip
          key={`d-${d}`}
          label={d}
          onRemove={() =>
            onUpdateFilters({
              ...filters,
              difficulty: filters.difficulty.filter((v) => v !== d),
            })
          }
        />
      ))}
      {filters.platforms.map((pl) => (
        <Chip
          key={`pl-${pl}`}
          label={pl}
          onRemove={() =>
            onUpdateFilters({
              ...filters,
              platforms: filters.platforms.filter((v) => v !== pl),
            })
          }
        />
      ))}
      {filters.tags.map((tag) => (
        <Chip
          key={`tag-${tag}`}
          label={tag}
          onRemove={() =>
            onUpdateFilters({
              ...filters,
              tags: filters.tags.filter((v) => v !== tag),
            })
          }
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  onRemove,
  variant = "filter",
}: {
  label: string;
  onRemove: () => void;
  variant?: "filter" | "query";
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${variant === "query" ? "search" : "filter"}: ${label}`}
      className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-all"
      style={{
        fontFamily: "var(--font-mono)",
        background: variant === "query" ? "var(--surface)" : "var(--accent-faint)",
        color:      variant === "query" ? "var(--muted)"  : "var(--accent)",
        border:     variant === "query"
          ? "1px solid var(--border)"
          : "1px solid rgba(125,211,252,0.2)",
        fontSize: "0.65rem",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          variant === "query" ? "var(--danger)" : "var(--accent-dim)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          variant === "query" ? "var(--border)" : "rgba(125,211,252,0.2)";
      }}
    >
      {label}
      <span aria-hidden="true" style={{ opacity: 0.5 }}>×</span>
    </button>
  );
}
