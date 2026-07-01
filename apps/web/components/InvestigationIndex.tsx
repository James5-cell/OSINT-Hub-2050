"use client";

import type { Tool } from "@/lib/types";
import { CATEGORIES, countCategoryTools } from "@/lib/categories";
import { useLocale } from "@/lib/locale-context";

interface InvestigationIndexProps {
  tools: Tool[];
  onCategorySelect: (categoryId: string) => void;
}

export default function InvestigationIndex({
  tools,
  onCategorySelect,
}: InvestigationIndexProps) {
  const { dict } = useLocale();

  return (
    <section
      id="investigation-index"
      className="py-14 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-screen-xl px-5">
        {/* Section header */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-xs mb-1.5"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              01 — Investigation Index
            </p>
            <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
              {dict.common.investigatingTitle}
            </h2>
          </div>
          <p className="text-sm hidden sm:block" style={{ color: "var(--muted)" }}>
            {dict.common.investigatingSubtitle}
          </p>
        </div>

        {/* Unified category grid — active + planned together */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const count   = countCategoryTools(tools, cat);
            const planned = count === 0;

            const catName = dict.categories[cat.id]?.name ?? "Unknown";
            const catDesc = dict.categories[cat.id]?.description ?? "";

            if (planned) {
              return (
                <div
                  key={cat.id}
                  className="rounded-md p-4 border select-none"
                  style={{
                    background:  "var(--card)",
                    borderColor: "var(--border-subtle)",
                    opacity:     0.45,
                    cursor:      "not-allowed",
                  }}
                  aria-disabled="true"
                  title={catDesc}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className="text-sm font-medium leading-snug"
                      style={{ color: "var(--muted)" }}
                    >
                      {catName}
                    </span>
                    {/* SOON pill */}
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] border"
                      style={{
                        fontFamily:  "var(--font-mono)",
                        background:  "transparent",
                        color:       "var(--faint)",
                        borderColor: "var(--border)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {dict.common.soonBadge}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--faint)" }}
                  >
                    {catDesc}
                  </p>
                </div>
              );
            }

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategorySelect(cat.id)}
                className={`text-left rounded-md p-4 border transition-all animate-slide-up stagger-${Math.min(i + 1, 8)}`}
                style={{
                  background:  "var(--card)",
                  borderColor: "var(--border)",
                  cursor:      "pointer",
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--accent-dim)")
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--border)")
                }
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="text-sm font-medium leading-snug"
                    style={{ color: "var(--text)" }}
                  >
                    {catName}
                  </span>
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded text-xs tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--surface)",
                      color:      "var(--muted)",
                      border:     "1px solid var(--border)",
                    }}
                  >
                    {count}
                  </span>
                </div>

                <p
                  className="text-xs leading-relaxed mb-2.5"
                  style={{ color: "var(--muted)" }}
                >
                  {catDesc}
                </p>

                <div className="flex flex-wrap gap-1">
                  {cat.targetTypes.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily:   "var(--font-mono)",
                        background:   "var(--surface)",
                        color:        "var(--faint)",
                        border:       "1px solid var(--border-subtle)",
                        borderRadius: "3px",
                        padding:      "1px 5px",
                        fontSize:     "0.58rem",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
