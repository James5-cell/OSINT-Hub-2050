"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Globe, Network, Share2, MapPin, Building2,
  ShieldAlert, Bitcoin, Radar, FileText, AlertCircle,
  ChevronRight, X, SlidersHorizontal, Clock, RotateCcw,
  ExternalLink, Landmark, Bot, Bug, EyeOff, Lock, Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { allTools } from "@/lib/tools";
import { searchToolsScored, buildSearchIndex } from "@/lib/search";
import { getWorkflows } from "@/lib/workflows";
import { CATEGORIES, countCategoryTools } from "@/lib/categories";
import type { Tool } from "@/lib/types";
import type { WorkflowDef } from "@/lib/workflows";
import type { CategoryDef } from "@/lib/categories";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import ToolDetailPanel from "@/components/ToolDetailPanel";

/* ── Constants ───────────────────────────────────────────────── */
const RECENT_KEY        = "osint-hub-recent-searches";
const MAX_RECENT        = 5;
const TOP_MATCH_SCORE   = 0.18; // Fuse score ≤ this → show as Top Match

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  people:     User,
  usernames:  User,
  emails:     Mail,
  domains:    Globe,
  ips:        Network,
  social:     Share2,
  images:     MapPin,
  companies:  Building2,
  leaks:      ShieldAlert,
  crypto:     Bitcoin,
  threat:     Radar,
  documents:  FileText,
  phones:     Phone,
  government: Landmark,
  "ai-osint": Bot,
  malware:    Bug,
  darkweb:    EyeOff,
  opsec:      Lock,
};


/* ── Filter types ─────────────────────────────────────────────── */
type LevelFilter  = "beginner" | "intermediate" | "advanced";
type ModeFilter   = "free" | "freemium" | "paid";
type AccessFilter = "web" | "api" | "cli" | "desktop";

interface Filters {
  levels: LevelFilter[];
  modes:  ModeFilter[];
  access: AccessFilter[];
}

const EMPTY_FILTERS: Filters = { levels: [], modes: [], access: [] };

/* ── localStorage helpers ─────────────────────────────────────── */
function saveRecent(q: string): void {
  if (typeof window === "undefined" || !q.trim()) return;
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    const next = [q.trim(), ...prev.filter((s) => s !== q.trim())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function clearRecentStorage(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}

/* ── Filter / match helpers ───────────────────────────────────── */
function applyFilters(tools: Tool[], f: Filters): Tool[] {
  return tools.filter((tool) => {
    if (f.levels.length > 0 && !f.levels.includes(tool.difficulty as LevelFilter))
      return false;
    if (f.modes.length > 0) {
      const p = tool.pricing;
      const match = f.modes.some(
        (m) => m === p || (m === "free" && p === "open-source")
      );
      if (!match) return false;
    }
    if (
      f.access.length > 0 &&
      !tool.platforms?.some((p) => f.access.includes(p as AccessFilter))
    )
      return false;
    return true;
  });
}

function matchesWorkflow(q: string, wf: WorkflowDef): boolean {
  const lq   = q.toLowerCase();
  const text = [
    wf.title, wf.subtitle, wf.summary,
    ...wf.categories, ...wf.target_types, ...wf.signals,
    wf.difficulty, ...(wf.recommended_tools ?? []),
  ].join(" ").toLowerCase();
  return lq.split(/\s+/).some((w) => text.includes(w));
}

function matchesCategory(
  q: string,
  cat: CategoryDef,
  dict: { categories: Record<string, { name: string; description: string; detail: string }> }
): boolean {
  const lq   = q.toLowerCase();
  const cDict = dict.categories[cat.id] ?? { name: "", description: "", detail: "" };
  const text = [
    cDict.name, cDict.description, cDict.detail,
    ...cat.targetTypes, ...(cat.tags ?? []),
  ].join(" ").toLowerCase();
  return lq.split(/\s+/).some((w) => text.includes(w));
}

function activeFilterCount(f: Filters): number {
  return f.levels.length + f.modes.length + f.access.length;
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS (defined outside main to stay stable)
   ════════════════════════════════════════════════════════════════ */

/* ── MonoLabel — small uppercase section label ──────────────── */
function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-3"
      style={{
        fontFamily:    "var(--font-mono)",
        color:         "var(--faint)",
        fontSize:      "0.6rem",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
      }}
    >
      {children}
    </p>
  );
}

/* ── FilterCheck ────────────────────────────────────────────── */
function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <span
        className="h-3.5 w-3.5 shrink-0 rounded flex items-center justify-center border transition-all"
        style={{
          background:  checked ? "var(--accent)" : "transparent",
          borderColor: checked ? "var(--accent)" : "var(--border)",
        }}
        aria-hidden="true"
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
            <path
              d="M1 3L3 5L7 1"
              stroke="var(--bg)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span
        className="text-xs transition-colors"
        style={{
          fontFamily: "var(--font-mono)",
          color:      checked ? "var(--text)" : "var(--muted)",
          fontSize:   "0.7rem",
        }}
      >
        {label}
      </span>
    </label>
  );
}

/* ── FilterPanelContent ─────────────────────────────────────── */
interface FilterPanelProps {
  filters:        Filters;
  onToggleLevel:  (l: LevelFilter)  => void;
  onToggleMode:   (m: ModeFilter)   => void;
  onToggleAccess: (a: AccessFilter) => void;
  onClear:        () => void;
  filterLevel:    string;
  filterMode:     string;
  filterAccess:   string;
  clearFilters:   string;
}

function FilterPanelContent({
  filters,
  onToggleLevel,
  onToggleMode,
  onToggleAccess,
  onClear,
  filterLevel,
  filterMode,
  filterAccess,
  clearFilters,
}: FilterPanelProps) {
  const count = activeFilterCount(filters);

  const groupLabel = (label: string) => (
    <p
      className="mb-2"
      style={{
        fontFamily:    "var(--font-mono)",
        color:         "var(--faint)",
        fontSize:      "0.58rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {label}
    </p>
  );

  return (
    <div className="space-y-4">
      {/* Level */}
      <div>
        {groupLabel(filterLevel)}
        <div className="space-y-2">
          {(["beginner", "intermediate", "advanced"] as LevelFilter[]).map((l) => (
            <FilterCheck
              key={l}
              label={l.charAt(0).toUpperCase() + l.slice(1)}
              checked={filters.levels.includes(l)}
              onChange={() => onToggleLevel(l)}
            />
          ))}
        </div>
      </div>

      {/* Mode */}
      <div>
        {groupLabel(filterMode)}
        <div className="space-y-2">
          {(["free", "freemium", "paid"] as ModeFilter[]).map((m) => (
            <FilterCheck
              key={m}
              label={m.charAt(0).toUpperCase() + m.slice(1)}
              checked={filters.modes.includes(m)}
              onChange={() => onToggleMode(m)}
            />
          ))}
        </div>
      </div>

      {/* Access */}
      <div>
        {groupLabel(filterAccess)}
        <div className="space-y-2">
          {(["web", "api", "cli", "desktop"] as AccessFilter[]).map((a) => (
            <FilterCheck
              key={a}
              label={a.toUpperCase()}
              checked={filters.access.includes(a)}
              onChange={() => onToggleAccess(a)}
            />
          ))}
        </div>
      </div>

      {/* Clear */}
      {count > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="w-full rounded border py-1.5 text-xs transition-colors"
          style={{
            fontFamily:  "var(--font-mono)",
            color:       "var(--muted)",
            borderColor: "var(--border)",
            background:  "transparent",
            fontSize:    "0.65rem",
            cursor:      "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-dim)";
            e.currentTarget.style.color       = "var(--text)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color       = "var(--muted)";
          }}
        >
          {clearFilters}
        </button>
      )}
    </div>
  );
}

/* ── ToolRow — compact tool result for State B ──────────────── */
function ToolRow({
  tool,
  onDetails,
  inspectLabel,
  locale,
}: {
  tool:         Tool;
  onDetails:    (t: Tool) => void;
  inspectLabel: string;
  locale:       string;
}) {
  const desc =
    locale === "zh-TW"
      ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description)
      : (tool.description_en    ?? tool.description_zh_tw ?? tool.raw_description);

  return (
    <div
      className="group flex flex-col gap-1.5 rounded-lg border px-4 py-3 transition-all cursor-pointer animate-fade-in"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
      onClick={() => onDetails(tool)}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent-dim)")}
      onMouseOut={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onDetails(tool)}
      aria-label={`View details for ${tool.name}`}
    >
      {/* Row 1: name + badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {tool.name}
        </span>

        {tool.source_section && (
          <span
            style={{
              fontFamily:  "var(--font-mono)",
              background:  "var(--surface)",
              color:       "var(--faint)",
              border:      "1px solid var(--border)",
              borderRadius: "3px",
              padding:     "1px 5px",
              fontSize:    "0.55rem",
              textTransform: "uppercase",
            }}
          >
            {tool.source_section}
          </span>
        )}

        {tool.pricing === "paid" && (
          <span style={{ fontFamily: "var(--font-mono)", background: "var(--warning-faint)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.55rem" }}>
            Paid
          </span>
        )}
        {tool.pricing === "freemium" && (
          <span style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.05)", color: "rgba(245,158,11,0.55)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.55rem" }}>
            Freemium
          </span>
        )}
        {tool.ethical_flag && (
          <span style={{ fontFamily: "var(--font-mono)", background: "var(--danger-faint)", color: "var(--danger)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.55rem" }}>
            ⚠
          </span>
        )}
      </div>

      {/* Row 2: description */}
      {desc && (
        <p
          className="text-xs truncate"
          style={{ color: "var(--muted)", lineHeight: 1.5 }}
        >
          {desc}
        </p>
      )}

      {/* Row 3: signals + action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-wrap min-w-0">
          {tool.target_types?.slice(0, 4).map((tt) => (
            <span
              key={tt}
              style={{
                fontFamily:  "var(--font-mono)",
                background:  "var(--surface)",
                color:       "var(--faint)",
                border:      "1px solid var(--border-subtle)",
                borderRadius: "3px",
                padding:     "1px 4px",
                fontSize:    "0.52rem",
              }}
            >
              {tt}
            </span>
          ))}
        </div>
        <span
          className="shrink-0 flex items-center gap-0.5 transition-colors group-hover:opacity-100"
          style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.62rem", opacity: 0.7 }}
        >
          {inspectLabel} <ChevronRight size={9} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

/* ── WorkflowRow — compact workflow result for State B ──────── */
function WorkflowRow({ wf }: { wf: WorkflowDef }) {
  const DIFF_COLOR: Record<string, string> = {
    beginner:     "var(--verified)",
    intermediate: "var(--warning)",
    advanced:     "var(--danger)",
  };
  const RISK_COLOR: Record<string, string> = {
    low:    "var(--verified)",
    medium: "var(--warning)",
    high:   "var(--danger)",
  };

  return (
    <Link
      href={`/workflows/${wf.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 no-underline transition-all group animate-fade-in"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent-dim)")}
      onMouseOut={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {wf.title}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", color: DIFF_COLOR[wf.difficulty], background: "var(--surface)", border: `1px solid ${DIFF_COLOR[wf.difficulty]}35`, borderRadius: "3px", padding: "1px 5px", fontSize: "0.55rem" }}>
            {wf.difficulty}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", color: RISK_COLOR[wf.risk_level], background: "var(--surface)", border: `1px solid ${RISK_COLOR[wf.risk_level]}35`, borderRadius: "3px", padding: "1px 5px", fontSize: "0.55rem" }}>
            {wf.risk_level} risk
          </span>
        </div>
        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
          {wf.subtitle}
        </p>
      </div>
      <ChevronRight
        size={14}
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--faint)" }}
        aria-hidden="true"
      />
    </Link>
  );
}

/* ── TopMatchCard — full card for the single best result ──────── */
function TopMatchCard({
  tool,
  onDetails,
  locale,
  dict,
}: {
  tool:     Tool;
  onDetails: (t: Tool) => void;
  locale:   string;
  dict:     { tool: { inspect: string; openTool: string; noDescription: string } };
}) {
  const desc =
    locale === "zh-TW"
      ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description)
      : (tool.description_en    ?? tool.description_zh_tw ?? tool.raw_description);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background:  "var(--card)",
        border:      "1px solid var(--accent-dim)",
        boxShadow:   "0 0 0 1px var(--accent-faint), 0 4px 16px rgba(125,211,252,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="min-w-0">
          {tool.source_section && (
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
              {tool.source_section}
            </p>
          )}
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {tool.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {tool.ethical_flag && (
            <span style={{ fontFamily: "var(--font-mono)", background: "var(--danger-faint)", color: "var(--danger)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "3px", padding: "2px 6px", fontSize: "0.55rem", textTransform: "uppercase" }}>
              ⚠ Caution
            </span>
          )}
          {tool.pricing === "paid" && (
            <span style={{ fontFamily: "var(--font-mono)", background: "var(--warning-faint)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "3px", padding: "2px 6px", fontSize: "0.55rem" }}>
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-3">
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          {desc ?? dict.tool.noDescription}
        </p>
        {tool.target_types && tool.target_types.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {tool.target_types.slice(0, 5).map((tt) => (
              <span
                key={tt}
                style={{ fontFamily: "var(--font-mono)", background: "var(--surface)", color: "var(--faint)", border: "1px solid var(--border)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.55rem" }}
              >
                {tt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-between border-t px-4 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <button
          type="button"
          onClick={() => onDetails(tool)}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", cursor: "pointer" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
          onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
        >
          <ChevronRight size={11} aria-hidden="true" />
          {dict.tool.inspect}
        </button>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all"
          style={{ fontFamily: "var(--font-mono)", background: "var(--accent)", color: "var(--bg)", border: "none" }}
          onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-dim)")}
          onMouseOut={(e)  => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)")}
          aria-label={`${dict.tool.openTool} — ${tool.name}`}
        >
          {dict.tool.openTool}
          <ExternalLink size={10} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

/* ── CategoryCard — for State A browse grid ─────────────────── */
function CategoryCard({
  cat,
  toolCount,
}: {
  cat:       CategoryDef;
  toolCount: number;
}) {
  const { dict } = useLocale();
  const Icon     = CATEGORY_ICONS[cat.id] ?? FileText;
  const hasTools = toolCount > 0;

  return (
    <Link
      href={hasTools ? `/?category=${encodeURIComponent(cat.id)}` : "#"}
      className="flex items-start gap-3 rounded-lg border px-4 py-4 no-underline transition-all"
      style={{
        background:  "var(--card)",
        borderColor: "var(--border)",
        opacity:     hasTools ? 1 : 0.55,
        pointerEvents: hasTools ? "auto" : "none",
        boxShadow:   "none",
        transition:  "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseOver={
        hasTools
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--accent-dim)";
              e.currentTarget.style.boxShadow   = "inset 3px 0 0 var(--accent)";
            }
          : undefined
      }
      onMouseOut={
        hasTools
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow   = "none";
            }
          : undefined
      }
      aria-disabled={!hasTools}
      tabIndex={hasTools ? 0 : -1}
    >
      {/* Icon badge */}
      <span
        className="mt-0.5 shrink-0 rounded p-1.5"
        style={{
          background: "var(--surface)",
          color:      hasTools ? "var(--accent)" : "var(--faint)",
        }}
      >
        <Icon size={13} aria-hidden="true" />
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-sm font-semibold leading-snug"
            style={{ color: hasTools ? "var(--text)" : "var(--muted)" }}
          >
            {dict.categories[cat.id]?.name ?? cat.id}
          </span>
          <span
            style={{
              fontFamily:  "var(--font-mono)",
              background:  hasTools ? "var(--accent-faint)" : "var(--surface)",
              color:       hasTools ? "var(--accent)" : "var(--faint)",
              border:      hasTools
                ? "1px solid rgba(125,211,252,0.22)"
                : "1px solid var(--border-subtle)",
              borderRadius: "3px",
              padding:      "1px 5px",
              fontSize:     "0.55rem",
              flexShrink:   0,
            }}
          >
            {hasTools ? toolCount : "soon"}
          </span>
        </div>
        <p
          className="leading-relaxed"
          style={{ color: "var(--muted)", fontSize: "0.7rem" }}
        >
          {dict.categories[cat.id]?.description ?? ""}
        </p>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function SearchClient() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { dict, locale } = useLocale();
  const inputRef      = useRef<HTMLInputElement>(null);

  const initialQ = searchParams.get("q") ?? "";

  const [query,         setQuery]         = useState(initialQ);
  const [filters,       setFilters]       = useState<Filters>(EMPTY_FILTERS);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedTool,  setSelectedTool]  = useState<Tool | null>(null);
  const [filtersOpen,   setFiltersOpen]   = useState(false); // mobile only

  /* ── Initialise ─────────────────────────────────────────────── */
  useEffect(() => { buildSearchIndex(allTools); }, []);
  useEffect(() => { setRecentSearches(loadRecent()); }, []);
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
  }, [searchParams]);

  /* ── Actions ─────────────────────────────────────────────────── */
  const commitSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (trimmed) {
        saveRecent(trimmed);
        setRecentSearches(loadRecent());
      }
      router.replace(
        trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
        { scroll: false }
      );
    },
    [router]
  );

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitSearch(query);
    if (e.key === "Escape") { setQuery(""); commitSearch(""); inputRef.current?.blur(); }
  }

  function selectQuery(q: string) {
    setQuery(q);
    commitSearch(q);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function clearQuery() {
    setQuery("");
    commitSearch("");
  }

  /* ── Filter toggles ──────────────────────────────────────────── */
  const toggleLevel  = (l: LevelFilter)  => setFilters((f) => ({ ...f, levels:  f.levels.includes(l)  ? f.levels.filter((x)  => x !== l)  : [...f.levels,  l]  }));
  const toggleMode   = (m: ModeFilter)   => setFilters((f) => ({ ...f, modes:   f.modes.includes(m)   ? f.modes.filter((x)   => x !== m)  : [...f.modes,   m]  }));
  const toggleAccess = (a: AccessFilter) => setFilters((f) => ({ ...f, access:  f.access.includes(a)  ? f.access.filter((x)  => x !== a)  : [...f.access,  a]  }));

  /* ── Derived state ───────────────────────────────────────────── */
  const isSearching = query.trim().length > 0;

  const rawScored = useMemo(
    () => isSearching ? searchToolsScored(query, allTools) : [],
    [query, isSearching]
  );

  const topMatch = useMemo(() => {
    if (!isSearching || rawScored.length === 0) return null;
    const best = rawScored[0];
    return best.score <= TOP_MATCH_SCORE ? best.tool : null;
  }, [rawScored, isSearching]);

  const filteredTools = useMemo(
    () => applyFilters(rawScored.map((r) => r.tool), filters),
    [rawScored, filters]
  );

  const toolsWithoutTop = useMemo(
    () => (topMatch ? filteredTools.filter((t) => t.id !== topMatch.id) : filteredTools),
    [filteredTools, topMatch]
  );

  const workflowResults = useMemo(
    () => (isSearching ? getWorkflows(locale).filter((w) => matchesWorkflow(query, w)) : []),
    [query, isSearching, locale]
  );

  const categoryResults = useMemo(
    () => (isSearching ? CATEGORIES.filter((c) => matchesCategory(query, c, dict)) : []),
    [query, isSearching, dict]
  );

  const hasResults =
    filteredTools.length > 0 || workflowResults.length > 0 || categoryResults.length > 0;

  const catFilterCount = activeFilterCount(filters);

  /* ── Pre-compute category tool counts (stable) ───────────────── */
  const catCounts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, countCategoryTools(allTools, c)])),
    []
  );

  /* ── Common search input ──────────────────────────────────────── */
  const SearchInput = (
    <div
      className="flex items-center gap-2 rounded-lg border px-4 py-3 transition-colors"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      onClick={() => inputRef.current?.focus()}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-mono)",
          color:      "var(--accent)",
          fontSize:   isSearching ? "0.75rem" : "1rem",
          opacity:    0.7,
          userSelect: "none",
          flexShrink: 0,
          transition: "font-size 0.2s",
        }}
      >
        {">_"}
      </span>
      <input
        ref={inputRef}
        type="search"
        id="search-input"
        autoFocus={!isSearching}
        placeholder={dict.hero.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
        className="flex-1 bg-transparent outline-none"
        style={{
          color:      "var(--text)",
          fontFamily: "var(--font-body)",
          fontSize:   isSearching ? "0.875rem" : "1rem",
        }}
        aria-label={locale === "zh-TW" ? "搜尋工具、流程與分類" : "Search tools, workflows, and categories"}
      />
      {query && (
        <button
          type="button"
          onClick={clearQuery}
          aria-label="Clear search"
          className="transition-colors shrink-0"
          style={{ color: "var(--faint)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
          onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
      {query.trim() && (
        <button
          type="button"
          onClick={() => commitSearch(query)}
          className="shrink-0 rounded px-2 py-0.5 transition-colors"
          style={{ fontFamily: "var(--font-mono)", background: "var(--accent)", color: "var(--bg)", fontSize: "0.62rem", cursor: "pointer" }}
        >
          {locale === "zh-TW" ? "搜尋" : "Search"}
        </button>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     RENDER — STATE A: EMPTY
     ════════════════════════════════════════════════════════════════ */
  if (!isSearching) {
    return (
      <main className="flex-1 flex flex-col">
        {/* ── Hero search area ──────────────────────────────────── */}
        <div className="border-b py-16" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-2xl px-5">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-2 mb-8 text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
              aria-label="Breadcrumb"
            >
              <Link href="/" style={{ color: "var(--faint)", textDecoration: "none" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
                onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
              >
                {dict.nav.index}
              </Link>
              <span aria-hidden="true">/</span>
              <span style={{ color: "var(--muted)" }}>{dict.search.title}</span>
            </nav>

            {/* Search box */}
            {SearchInput}

            {/* Hint */}
            <p
              className="mt-3 text-center text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
            >
              {dict.hero.pressEnter}
            </p>

            {/* Quick chips */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {dict.search.commonSearches.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => selectQuery(chip)}
                  className="rounded-full border px-3 py-1 text-xs transition-colors"
                  style={{
                    fontFamily:  "var(--font-mono)",
                    background:  "var(--surface)",
                    color:       "var(--muted)",
                    borderColor: "var(--border)",
                    fontSize:    "0.65rem",
                    cursor:      "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-dim)";
                    e.currentTarget.style.color       = "var(--accent)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color       = "var(--muted)";
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mt-7">
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    <Clock size={9} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                    {dict.search.recentSearches}
                  </p>
                  <button
                    type="button"
                    onClick={() => { clearRecentStorage(); setRecentSearches([]); }}
                    className="text-xs transition-colors"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", cursor: "pointer" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
                  >
                    {dict.search.clearHistory}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => selectQuery(s)}
                      className="rounded border px-2.5 py-1 text-xs transition-colors"
                      style={{ fontFamily: "var(--font-mono)", background: "var(--card)", color: "var(--muted)", borderColor: "var(--border)", fontSize: "0.62rem", cursor: "pointer" }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseOut={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                    >
                      <Clock size={8} style={{ display: "inline", marginRight: 3, opacity: 0.5 }} aria-hidden="true" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Category browse grid ──────────────────────────────── */}
        <div className="mx-auto max-w-screen-xl px-5 py-10 w-full">
          <div className="mb-6">
            <p
              className="mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.16em" }}
            >
              {"// categories"}
            </p>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
              {dict.search.browse}
            </h2>
          </div>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} toolCount={catCounts[cat.id] ?? 0} />
            ))}
          </div>
        </div>

        <ToolDetailPanel tool={selectedTool} onClose={() => setSelectedTool(null)} />
      </main>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER — STATE B: ACTIVE SEARCH
     ════════════════════════════════════════════════════════════════ */
  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto max-w-screen-xl px-5 py-8 w-full flex gap-8 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Search input + breadcrumb */}
          <div>
            <nav
              className="flex items-center gap-2 mb-4 text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
              aria-label="Breadcrumb"
            >
              <Link href="/" style={{ color: "var(--faint)", textDecoration: "none" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
                onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
              >
                {dict.nav.index}
              </Link>
              <span aria-hidden="true">/</span>
              <span style={{ color: "var(--muted)" }}>{dict.search.title}</span>
              <span aria-hidden="true">/</span>
              <span style={{ color: "var(--text)" }}>&ldquo;{query}&rdquo;</span>
            </nav>

            {SearchInput}

            {/* Mobile: filter toggle bar */}
            <div className="flex items-center justify-between mt-3 lg:hidden">
              <p
                className="text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.62rem" }}
              >
                {filteredTools.length} {dict.search.tools.toLowerCase()}
                {catFilterCount > 0 && (
                  <span style={{ color: "var(--accent)" }}>
                    {" "}· {catFilterCount} filter{catFilterCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors"
                style={{
                  fontFamily:  "var(--font-mono)",
                  background:  "var(--surface)",
                  borderColor: catFilterCount > 0 ? "var(--accent-dim)" : "var(--border)",
                  color:       catFilterCount > 0 ? "var(--accent)"    : "var(--muted)",
                  fontSize:    "0.65rem",
                  cursor:      "pointer",
                }}
                aria-expanded={filtersOpen}
                aria-controls="mobile-filter-panel"
              >
                <SlidersHorizontal size={11} aria-hidden="true" />
                {dict.search.filters}
                {catFilterCount > 0 && (
                  <span
                    className="rounded px-1"
                    style={{ background: "var(--accent)", color: "var(--bg)", fontSize: "0.55rem" }}
                  >
                    {catFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile: collapsible filter panel */}
            {filtersOpen && (
              <div
                id="mobile-filter-panel"
                className="mt-3 rounded-lg border p-4 animate-fade-in lg:hidden"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <FilterPanelContent
                  filters={filters}
                  onToggleLevel={toggleLevel}
                  onToggleMode={toggleMode}
                  onToggleAccess={toggleAccess}
                  onClear={() => setFilters(EMPTY_FILTERS)}
                  filterLevel={dict.search.filterLevel}
                  filterMode={dict.search.filterMode}
                  filterAccess={dict.search.filterAccess}
                  clearFilters={dict.search.clearFilters}
                />
              </div>
            )}
          </div>

          {/* ── Empty state ──────────────────────────────────── */}
          {!hasResults && (
            <div className="py-14 text-center animate-fade-in">
              <AlertCircle
                size={28}
                className="mx-auto mb-4"
                style={{ color: "var(--faint)" }}
                aria-hidden="true"
              />
              <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
                {t(dict.search.noResults, { q: query })}
              </p>
              <p
                className="text-xs mb-6"
                style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
              >
                {dict.search.noResultsHint}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {dict.search.commonSearches.slice(0, 3).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => selectQuery(chip)}
                    className="rounded-full border px-3 py-1 text-xs transition-colors"
                    style={{ fontFamily: "var(--font-mono)", background: "var(--surface)", color: "var(--muted)", borderColor: "var(--border)", fontSize: "0.65rem", cursor: "pointer" }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseOut={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Top Match ───────────────────────────────────── */}
          {topMatch && (
            <section aria-label={dict.search.topMatch}>
              <MonoLabel>▸ {dict.search.topMatch}</MonoLabel>
              <TopMatchCard
                tool={topMatch}
                onDetails={setSelectedTool}
                locale={locale}
                dict={dict}
              />
            </section>
          )}

          {/* ── Tools ───────────────────────────────────────── */}
          {toolsWithoutTop.length > 0 && (
            <section aria-label="Tool results">
              <MonoLabel>
                {dict.search.tools}{" "}
                <span style={{ color: "var(--border)" }}>·</span>{" "}
                {filteredTools.length}
                {catFilterCount > 0 && rawScored.length !== filteredTools.length && (
                  <span style={{ color: "var(--faint)", fontSize: "0.55rem" }}>
                    {" "}/ {rawScored.length} total
                  </span>
                )}
              </MonoLabel>
              <div className="space-y-2">
                {toolsWithoutTop.slice(0, 15).map((tool) => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    onDetails={setSelectedTool}
                    inspectLabel={dict.tool.inspect}
                    locale={locale}
                  />
                ))}
              </div>
              {toolsWithoutTop.length > 15 && (
                <p
                  className="mt-3 text-center text-xs"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.6rem" }}
                >
                  {t(dict.search.moreResults, { n: toolsWithoutTop.length - 15 })}
                </p>
              )}
            </section>
          )}

          {/* ── Workflows ───────────────────────────────────── */}
          {workflowResults.length > 0 && (
            <section aria-label="Workflow results">
              <MonoLabel>
                {dict.search.workflows}{" "}
                <span style={{ color: "var(--border)" }}>·</span>{" "}
                {workflowResults.length}
              </MonoLabel>
              <div className="space-y-2">
                {workflowResults.map((wf) => (
                  <WorkflowRow key={wf.id} wf={wf} />
                ))}
              </div>
            </section>
          )}

          {/* ── Categories (chips) ──────────────────────────── */}
          {categoryResults.length > 0 && (
            <section aria-label="Category results">
              <MonoLabel>
                {dict.search.categories}{" "}
                <span style={{ color: "var(--border)" }}>·</span>{" "}
                {categoryResults.length}
              </MonoLabel>
              <div className="flex flex-wrap gap-2">
                {categoryResults.map((cat) => {
                  const Icon  = CATEGORY_ICONS[cat.id] ?? FileText;
                  const count = catCounts[cat.id] ?? 0;
                  const catName = dict.categories[cat.id]?.name ?? cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/?category=${encodeURIComponent(cat.id)}`}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 no-underline transition-all animate-fade-in"
                      style={{ background: "var(--card)", borderColor: "var(--border)" }}
                      onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent-dim)")}
                      onMouseOut={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                      <Icon size={12} style={{ color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
                      <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                        {catName}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", background: "var(--surface)", color: "var(--faint)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "1px 4px", fontSize: "0.52rem" }}>
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT COLUMN — desktop only ──────────────────── */}
        <aside
          className="hidden lg:flex flex-col gap-4 w-56 xl:w-64 shrink-0 sticky top-20"
          aria-label="Search filters and history"
        >
          {/* Filter panel */}
          <div
            className="rounded-lg border px-4 py-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-xs font-semibold"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                <SlidersHorizontal
                  size={10}
                  style={{ display: "inline", marginRight: 5 }}
                  aria-hidden="true"
                />
                {dict.search.filters}
                {catFilterCount > 0 && (
                  <span
                    className="ml-2 rounded px-1.5"
                    style={{ background: "var(--accent)", color: "var(--bg)", fontSize: "0.55rem" }}
                  >
                    {catFilterCount}
                  </span>
                )}
              </p>
              {catFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  aria-label="Clear all filters"
                  style={{ color: "var(--faint)", cursor: "pointer" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
                  onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
                >
                  <RotateCcw size={11} aria-hidden="true" />
                </button>
              )}
            </div>

            <FilterPanelContent
              filters={filters}
              onToggleLevel={toggleLevel}
              onToggleMode={toggleMode}
              onToggleAccess={toggleAccess}
              onClear={() => setFilters(EMPTY_FILTERS)}
              filterLevel={dict.search.filterLevel}
              filterMode={dict.search.filterMode}
              filterAccess={dict.search.filterAccess}
              clearFilters={dict.search.clearFilters}
            />
          </div>

          {/* Recent searches panel */}
          {recentSearches.length > 0 && (
            <div
              className="rounded-lg border px-4 py-4"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  <Clock size={9} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                  {dict.search.recentSearches}
                </p>
                <button
                  type="button"
                  onClick={() => { clearRecentStorage(); setRecentSearches([]); }}
                  className="text-xs transition-colors"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", cursor: "pointer" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
                  onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
                >
                  {dict.search.clearHistory}
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectQuery(s)}
                    className="rounded px-2 py-1.5 text-left text-xs truncate transition-colors"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", background: "transparent", fontSize: "0.65rem", cursor: "pointer" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseOut={(e)  => { e.currentTarget.style.background = "transparent";   e.currentTarget.style.color = "var(--muted)"; }}
                  >
                    <Clock size={8} style={{ display: "inline", marginRight: 4, opacity: 0.5 }} aria-hidden="true" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <ToolDetailPanel tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </main>
  );
}
