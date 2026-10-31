"use client";

import type { FilterState } from "@/lib/types";
import { countActiveFilters } from "@/lib/filters";
import { useLocale } from "@/lib/locale-context";

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
  const { dict } = useLocale();
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
          label={dict.labels.targets[t] ?? t}
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
          label={dict.labels.pricing[p] ?? p}
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
          label={dict.labels.difficulty[d] ?? d}
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
          label={dict.labels.platforms[pl] ?? pl}
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
  const { locale } = useLocale();
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={locale === "zh-TW" ? `移除${variant === "query" ? "搜尋" : "篩選"}：${label}` : `Remove ${variant === "query" ? "search" : "filter"}: ${label}`}
      className="flex items-center gap-1.5 rounded px-3 min-h-11 transition-all"
      style={{
        fontFamily: "var(--font-mono)",
        background: variant === "query" ? "var(--surface)" : "var(--accent-faint)",
        color:      variant === "query" ? "var(--muted)"  : "var(--accent)",
        border:     variant === "query"
          ? "1px solid var(--border)"
          : "1px solid rgba(125,211,252,0.2)",
        fontSize: "0.9rem",
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
