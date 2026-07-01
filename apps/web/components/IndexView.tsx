"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { allTools } from "@/lib/tools";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

import StatsStrip from "./StatsStrip";
import InvestigationIndex from "./InvestigationIndex";
import WorkflowsSection from "./WorkflowsSection";

interface IndexViewProps {
  onCategorySelect: (categoryId: string) => void;
  onToolSearch: (toolName: string) => void;
}

export default function IndexView({ onCategorySelect, onToolSearch }: IndexViewProps) {
  const router       = useRouter();
  const { dict }     = useLocale();
  const [heroQuery, setHeroQuery] = useState("");
  const inputRef   = useRef<HTMLInputElement>(null);

  function submitSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleHeroKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submitSearch(heroQuery);
    if (e.key === "Escape") { setHeroQuery(""); inputRef.current?.blur(); }
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative py-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            opacity: 0.15,
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, var(--bg) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-screen-md px-5 text-center">
          <div className="mb-4 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border"
              style={{
                fontFamily:  "var(--font-mono)",
                background:  "var(--surface)",
                borderColor: "var(--border)",
                color:       "var(--muted)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse-dot"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
              {t(dict.hero.toolsIndexed, { n: allTools.length })}
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4"
            style={{ color: "var(--text)", letterSpacing: "-0.025em" }}
          >
            {dict.hero.titleMain}
            <br />
            <span style={{ color: "var(--accent)" }}>{dict.hero.titleAccent}</span>
          </h1>

          <p
            className="text-base max-w-lg mx-auto mb-8 leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {dict.hero.subtitle}
          </p>

          {/* Command-style search */}
          <div className="relative max-w-xl mx-auto">
            <label htmlFor="hero-search" className="sr-only">
              {dict.nav.search}
            </label>
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 border transition-colors cursor-text"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={() => inputRef.current?.focus()}
            >
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-mono)",
                  color:      "var(--accent)",
                  fontSize:   "0.75rem",
                  userSelect: "none",
                  opacity:    0.6,
                }}
              >
                {">_"}
              </span>
              <input
                ref={inputRef}
                id="hero-search"
                type="search"
                placeholder={dict.hero.searchPlaceholder}
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                onKeyDown={handleHeroKey}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text)", fontFamily: "var(--font-body)" }}
              />
              {heroQuery && (
                <button
                  type="button"
                  aria-label={dict.search.clearSearch}
                  onClick={() => setHeroQuery("")}
                  className="text-xs transition-colors"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  ×
                </button>
              )}
              {heroQuery.trim() && (
                <button
                  type="button"
                  onClick={() => submitSearch(heroQuery)}
                  aria-label="Submit search"
                  className="rounded px-2 py-0.5 text-xs transition-colors"
                  style={{
                    fontFamily:  "var(--font-mono)",
                    background:  "var(--accent)",
                    color:       "var(--bg)",
                    fontSize:    "0.65rem",
                  }}
                >
                  {dict.search.searchAction}
                </button>
              )}
            </div>
            <p
              className="mt-2 text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
            >
              {dict.hero.pressEnter}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <StatsStrip tools={allTools} />

      {/* ── Investigation Index ──────────────────────────────── */}
      <InvestigationIndex tools={allTools} onCategorySelect={onCategorySelect} />

      {/* ── Workflows ────────────────────────────────────────── */}
      <WorkflowsSection onToolSearch={onToolSearch} />
    </>
  );
}
