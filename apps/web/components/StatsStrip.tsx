"use client";

import type { Tool } from "@/lib/types";

interface StatsStripProps {
  tools: Tool[];
}

export default function StatsStrip({ tools }: StatsStripProps) {
  const total       = tools.length;
  const freeCount   = tools.filter(
    (t) => t.pricing === "free" || t.pricing === "open-source"
  ).length;
  const ethicsCount = tools.filter((t) => t.ethical_flag).length;
  const categories  = new Set(
    tools.map((t) => t.source_section).filter(Boolean)
  ).size;

  const stats = [
    { num: total,       label: "tools indexed",      accent: "var(--text)" },
    { num: freeCount,   label: "free / open-source",  accent: "var(--verified)" },
    { num: ethicsCount, label: "ethical cautions",    accent: "var(--warning)" },
    { num: categories,  label: "categories",          accent: "var(--accent)" },
  ];

  return (
    <div
      className="border-b"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-7 px-4 text-center"
              style={{
                /* 2-col borders */
                borderRight:  i % 2 === 0 ? "1px solid var(--border)" : "none",
                borderBottom: i < 2 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                className="leading-none mb-2"
                style={{
                  fontSize:           "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight:         700,
                  fontFamily:         "var(--font-mono)",
                  fontVariantNumeric: "tabular-nums",
                  color:              s.accent,
                }}
              >
                {s.num}
              </span>
              <span
                className="text-xs"
                style={{
                  color:         "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily:    "var(--font-mono)",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
