"use client";

import { ExternalLink, ChevronRight, AlertTriangle, WifiOff } from "lucide-react";
import type { Tool } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";

/*
  Badge hierarchy (visible only for exceptions):
  1. CAUTION  — danger orange  — strongest signal
  2. PAID     — amber/gold
  3. FREEMIUM — dim amber
  4. ADVANCED — accent blue
  5. Dead link — faint grey

  Beginner shows only in the Level metadata row, not as a header badge.
*/

interface ToolCardProps {
  tool: Tool;
  index?: number;
  onDetails: (tool: Tool) => void;
}

export default function ToolCard({ tool, index = 0, onDetails }: ToolCardProps) {
  const { locale, dict } = useLocale();
  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;
  const isInactive   = tool.is_active === false || tool.is_dead_link;

  // Locale-aware description: zh-TW prefers Chinese, en prefers English
  const description =
    locale === "zh-TW"
      ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description ?? dict.tool.noDescription)
      : (tool.description_en    ?? tool.description_zh_tw ?? tool.raw_description ?? dict.tool.noDescription);

  return (
    <article
      className={`group flex flex-col rounded-md border transition-colors animate-slide-up ${staggerClass}`}
      style={{
        background:   "var(--card)",
        borderColor:  isInactive ? "var(--border-subtle)" : "var(--border)",
      }}
      onMouseOver={(e) => {
        if (!isInactive)
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = isInactive
          ? "var(--border-subtle)"
          : "var(--border)";
      }}
      aria-label={`${dict.search.tools}: ${tool.name}`}
    >
      {/* ── Card header ─────────────────────────────────── */}
      <div
        className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="min-w-0 flex-1">
          {tool.source_section && (
            <p
              className="mb-0.5"
              style={{
                fontFamily:    "var(--font-mono)",
                color:         "var(--faint)",
                fontSize:      "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {tool.source_section}
            </p>
          )}
          <h2
            className="text-sm font-semibold leading-snug"
            style={{ color: isInactive ? "var(--muted)" : "var(--text)" }}
          >
            {tool.name}
          </h2>
        </div>

        {/* Exception badges — in priority order */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {tool.ethical_flag && (
            <Badge
              icon={<AlertTriangle size={8} aria-hidden="true" />}
              label={dict.tool.caution}
              bg="var(--danger-faint)"
              color="var(--danger)"
              border="rgba(249,115,22,0.3)"
              title="Ethical caution — use only for authorized research"
            />
          )}
          {tool.pricing === "paid" && (
            <Badge
              label={dict.labels.pricing.paid}
              bg="var(--warning-faint)"
              color="var(--warning)"
              border="rgba(245,158,11,0.25)"
            />
          )}
          {tool.pricing === "freemium" && (
            <Badge
              label={dict.labels.pricing.freemium}
              bg="rgba(245,158,11,0.05)"
              color="rgba(245,158,11,0.6)"
              border="rgba(245,158,11,0.15)"
            />
          )}
          {tool.difficulty === "advanced" &&
            tool.pricing !== "paid" &&
            !tool.ethical_flag && (
              <Badge
                label={dict.labels.difficulty.advanced}
                bg="var(--accent-faint)"
                color="var(--accent-dim)"
                border="rgba(125,211,252,0.2)"
              />
            )}
          {isInactive && (
            <Badge
              icon={<WifiOff size={8} aria-hidden="true" />}
              label={dict.tool.offline}
              bg="var(--surface)"
              color="var(--faint)"
              border="var(--border)"
              title="Link status unconfirmed"
            />
          )}
        </div>
      </div>

      {/* ── Description ─────────────────────────────────── */}
      <div className="px-4 py-3 flex-1">
        <p
          className="text-xs leading-relaxed line-clamp-3"
          style={{ color: "var(--muted)" }}
        >
          {description}
        </p>
      </div>

      {/* ── Structured metadata rows ─────────────────────── */}
      <div
        className="px-4 pb-3 space-y-1.5 border-t"
        style={{ borderColor: "var(--border-subtle)", paddingTop: "10px" }}
      >
        {tool.target_types && tool.target_types.length > 0 && (
          <MetaRow label={dict.tool.targets}>
            <div className="flex flex-wrap gap-1">
              {tool.target_types.slice(0, 5).map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--surface)",
                    color:      "var(--muted)",
                    border:     "1px solid var(--border)",
                    borderRadius: "3px",
                    padding:    "1px 5px",
                    fontSize:   "0.58rem",
                  }}
                >
                  {dict.labels.targets[t] ?? t}
                </span>
              ))}
            </div>
          </MetaRow>
        )}

        {tool.platforms && tool.platforms.length > 0 && (
          <MetaRow label={dict.tool.platforms}>
            <span
              className="text-xs"
              style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}
            >
              {tool.platforms.map((p) => dict.labels.platforms[p] ?? p).join(" · ")}
            </span>
          </MetaRow>
        )}

        {tool.difficulty && tool.difficulty !== "unknown" && (
          <MetaRow label={dict.tool.difficulty}>
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  tool.difficulty === "advanced"
                    ? "var(--accent)"      // blue — not alarming, just informational
                    : tool.difficulty === "beginner"
                    ? "var(--verified)"    // green — welcoming
                    : "var(--muted)",
              }}
            >
              {dict.labels.difficulty[tool.difficulty]}
            </span>
          </MetaRow>
        )}

        {tool.pricing && tool.pricing !== "free" && tool.pricing !== "open-source" && (
          <MetaRow label={dict.tool.pricing}>
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  tool.pricing === "paid"
                    ? "var(--warning)"
                    : "var(--muted)",
              }}
            >
              {dict.labels.pricing[tool.pricing]}
            </span>
          </MetaRow>
        )}
      </div>

      {/* ── Actions — Open (primary) · Inspect (secondary) ── */}
      <div
        className="flex items-center justify-between border-t px-4 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Secondary: Inspect */}
        <button
          type="button"
          aria-label={`${dict.tool.inspect} ${tool.name}`}
          onClick={() => onDetails(tool)}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--faint)")}
        >
          <ChevronRight size={11} aria-hidden="true" />
          {dict.tool.inspect}
        </button>

        {/* Primary: Open tool ↗ */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${dict.tool.openTool} — ${tool.name}`}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            fontFamily:  "var(--font-mono)",
            background:  "var(--accent)",
            color:       "var(--bg)",
            border:      "none",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-dim)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
          }}
        >
          {dict.tool.openTool}
          <ExternalLink size={10} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

/* ── Shared helpers ────────────────────────────────────────── */

function Badge({
  icon,
  label,
  bg,
  color,
  border,
  title,
}: {
  icon?: React.ReactNode;
  label: string;
  bg: string;
  color: string;
  border: string;
  title?: string;
}) {
  return (
    <span
      className="flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{
        fontFamily:    "var(--font-mono)",
        background:    bg,
        color,
        border:        `1px solid ${border}`,
        fontSize:      "0.58rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace:    "nowrap",
      }}
      title={title}
    >
      {icon}
      {label}
    </span>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-14 shrink-0"
        style={{
          fontFamily:    "var(--font-mono)",
          color:         "var(--faint)",
          fontSize:      "0.58rem",
          paddingTop:    "2px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
