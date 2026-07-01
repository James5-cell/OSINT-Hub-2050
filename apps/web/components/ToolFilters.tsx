"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type {
  FilterState,
  Pricing,
  Difficulty,
  TargetType,
  Platform,
} from "@/lib/types";
import { EMPTY_FILTERS } from "@/lib/types";
import { toggleFilterValue, countActiveFilters } from "@/lib/filters";
import { useLocale } from "@/lib/locale-context";

/* ─── Sub-group ──────────────────────────────────────────────── */
function FilterGroup<T extends string>({
  label,
  options,
  selected,
  labels,
  onToggle,
}: {
  label: string;
  options: T[];
  selected: T[];
  labels: Record<string, string>;
  onToggle: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p
        className="text-xs"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--muted)",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt)}
              className="rounded px-2 py-0.5 text-xs transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: active ? "var(--accent-faint)" : "var(--surface)",
                color:      active ? "var(--accent)"       : "var(--muted)",
                border:     active
                  ? "1px solid var(--accent-dim)"
                  : "1px solid var(--border)",
                fontSize: "0.65rem",
              }}
            >
              {labels[opt]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
interface ToolFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  availableTags: string[];
  availableTargetTypes: TargetType[];
  availablePlatforms: Platform[];
}

const PRICING_OPTIONS: Pricing[] = [
  "free", "open-source", "freemium", "paid", "unknown",
];
const DIFFICULTY_OPTIONS: Difficulty[] = [
  "beginner", "intermediate", "advanced", "unknown",
];

export default function ToolFilters({
  filters,
  onChange,
  availableTags,
  availableTargetTypes,
  availablePlatforms,
}: ToolFiltersProps) {
  const { dict } = useLocale();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function update<K extends keyof FilterState>(
    key: K,
    value: FilterState[K][number]
  ) {
    onChange({
      ...filters,
      [key]: toggleFilterValue(filters[key] as string[], value as string),
    } as FilterState);
  }

  return (
    <div className="relative">
      {/* Toggle */}
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded px-3 py-2 text-xs transition-all"
        style={{
          fontFamily: "var(--font-mono)",
          background:   open || activeCount > 0 ? "var(--accent-faint)" : "var(--surface)",
          color:        open || activeCount > 0 ? "var(--accent)"       : "var(--muted)",
          border:       open || activeCount > 0
            ? "1px solid var(--accent-dim)"
            : "1px solid var(--border)",
        }}
      >
        <SlidersHorizontal size={12} aria-hidden="true" />
        {dict.search.filters}
        {activeCount > 0 && (
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              fontSize: "0.55rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-80 rounded-md animate-fade-in"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          }}
          role="dialog"
          aria-label={dict.search.filters}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--muted)",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {dict.search.filters}
            </span>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  type="button"
                  aria-label={dict.search.clearFilters}
                  onClick={() => onChange(EMPTY_FILTERS)}
                  className="text-xs transition-colors"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = "var(--danger)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = "var(--muted)")
                  }
                >
                  {dict.search.clearFilters}
                </button>
              )}
              <button
                type="button"
                aria-label="Close filter panel"
                onClick={() => setOpen(false)}
                style={{ color: "var(--muted)" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "var(--muted)")
                }
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Groups */}
          <div className="space-y-4 p-4">
            <FilterGroup
              label={dict.tool.pricing}
              options={PRICING_OPTIONS}
              selected={filters.pricing}
              labels={dict.labels.pricing}
              onToggle={(v) => update("pricing", v)}
            />
            <FilterGroup
              label={dict.tool.difficulty}
              options={DIFFICULTY_OPTIONS}
              selected={filters.difficulty}
              labels={dict.labels.difficulty}
              onToggle={(v) => update("difficulty", v)}
            />
            <FilterGroup
              label={dict.tool.targets}
              options={availableTargetTypes}
              selected={filters.target_types}
              labels={dict.labels.targets}
              onToggle={(v) => update("target_types", v)}
            />
            <FilterGroup
              label={dict.tool.platforms}
              options={availablePlatforms}
              selected={filters.platforms}
              labels={dict.labels.platforms}
              onToggle={(v) => update("platforms", v)}
            />
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--muted)",
                    fontSize: "0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {dict.tool.tags}
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {availableTags.map((tag) => {
                    const active = filters.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("tags", tag)}
                        className="rounded px-2 py-0.5 transition-all"
                        style={{
                          fontFamily: "var(--font-mono)",
                          background: active ? "var(--accent-faint)" : "var(--surface)",
                          color:      active ? "var(--accent)"       : "var(--muted)",
                          border:     active
                            ? "1px solid var(--accent-dim)"
                            : "1px solid var(--border)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
