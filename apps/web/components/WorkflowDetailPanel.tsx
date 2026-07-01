"use client";

import { useEffect } from "react";
import {
  X,
  Target,
  Flag,
  Clock,
  Users,
  BarChart2,
  Shield,
  AlertTriangle,
  Eye,
  Wrench,
  Info,
} from "lucide-react";
import type {
  WorkflowDef,
  WorkflowStep,
  SafetyBadge,
  RiskLevel,
  WorkflowDifficulty,
} from "@/lib/workflows";
import { useLocale } from "@/lib/locale-context";
import { t, DICT } from "@/lib/i18n";
import { allTools } from "@/lib/tools";

/* ── Tool existence lookup ─────────────────────────────────── */
const toolNameSet = new Set(allTools.map((t) => t.name.toLowerCase()));

/** Static reverse map: EN category display name (lowercase) → category ID */
const EN_CAT_NAME_TO_ID: Map<string, string> = new Map(
  Object.entries(DICT["en"].categories).map(([id, v]) => [v.name.toLowerCase(), id])
);


/* ── Palette ───────────────────────────────────────────────── */
const DIFF_STYLE: Record<WorkflowDifficulty, { color: string }> = {
  beginner:     { color: "var(--verified)" },
  intermediate: { color: "var(--warning)"  },
  advanced:     { color: "var(--danger)"   },
};

const RISK_STYLE: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  low:    { color: "var(--verified)", bg: "var(--verified-faint)", border: "rgba(167,243,208,0.2)" },
  medium: { color: "var(--warning)",  bg: "var(--warning-faint)",  border: "rgba(245,158,11,0.2)"  },
  high:   { color: "var(--danger)",   bg: "var(--danger-faint)",   border: "rgba(249,115,22,0.25)" },
};

const BADGE_STYLE: Record<SafetyBadge, { color: string }> = {
  "passive-first":          { color: "var(--accent)"   },
  "use-with-care":          { color: "var(--warning)"  },
  "requires-authorization": { color: "var(--danger)"   },
};

function ToolChip({
  name,
  onSearch,
}: {
  name: string;
  onSearch: (n: string) => void;
}) {
  const { locale, dict } = useLocale();
  const exists = toolNameSet.has(name.toLowerCase());
  const tool = exists
    ? allTools.find((t) => t.name.toLowerCase() === name.toLowerCase())
    : null;

  if (!exists || !tool) {
    return (
      <span
        className="rounded-full px-2 py-0.5 border text-xs cursor-default select-none inline-block"
        style={{
          fontFamily:  "var(--font-mono)",
          background:  "var(--surface)",
          color:       "var(--faint)",
          borderColor: "var(--border-subtle)",
          fontSize:    "0.65rem",
        }}
        title={`${name} — ${dict.common.notIndexed}`}
      >
        {name}
        <span style={{ marginLeft: 3, opacity: 0.5, fontSize: "0.55rem" }}>
          ({dict.common.notIndexed})
        </span>
      </span>
    );
  }

  const description = locale === "zh-TW"
    ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description)
    : (tool.description_en ?? tool.description_zh_tw ?? tool.raw_description);

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        aria-label={`${dict.search.searchAction} ${name}`}
        onClick={() => onSearch(name)}
        className="rounded-full px-2 py-0.5 border transition-all text-xs"
        style={{
          fontFamily:  "var(--font-mono)",
          background:  "var(--card)",
          color:       "var(--muted)",
          borderColor: "var(--border)",
          fontSize:    "0.65rem",
          cursor:      "pointer",
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--accent-dim)";
          el.style.color = "var(--accent)";
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border)";
          el.style.color = "var(--muted)";
        }}
      >
        {name}
      </button>

      {/* Tooltip Popover */}
      <div
        className="pointer-events-none opacity-0 scale-95 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-50 rounded border p-3 text-left"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Popover Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-semibold text-xs" style={{ color: "var(--text)" }}>
            {tool.name}
          </span>
          {tool.pricing && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono border"
              style={{
                background: tool.pricing === "free" || tool.pricing === "open-source" ? "var(--verified-faint)" : "var(--warning-faint)",
                color: tool.pricing === "free" || tool.pricing === "open-source" ? "var(--verified)" : "var(--warning)",
                borderColor: tool.pricing === "free" || tool.pricing === "open-source" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                fontSize: "0.5rem"
              }}
            >
              {dict.labels.pricing[tool.pricing] ?? tool.pricing}
            </span>
          )}
        </div>

        {/* Popover Body */}
        <p className="text-[11px] leading-normal mb-2 text-zinc-400" style={{ color: "var(--muted)" }}>
          {description}
        </p>

        {/* Popover Footer */}
        <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
          {tool.platforms && tool.platforms.length > 0 && (
            <span className="text-[9px] font-mono" style={{ color: "var(--faint)" }}>
              {tool.platforms.map((p) => dict.labels.platforms[p] ?? p).join(" · ")}
            </span>
          )}
          <span className="text-[9px] font-mono inline-flex items-center gap-0.5" style={{ color: "var(--accent)" }}>
            {dict.search.searchAction} 🔍
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Row label ─────────────────────────────────────────────── */
function RowLabel({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  color?: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 mb-1.5 text-xs"
      style={{
        fontFamily: "var(--font-mono)",
        color: color ?? "var(--muted)",
        fontSize: "0.62rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      <Icon size={10} aria-hidden="true" />
      {label}
    </div>
  );
}

/* ── Individual step ───────────────────────────────────────── */
function StepCard({
  step,
  onToolSearch,
}: {
  step: WorkflowStep;
  onToolSearch: (n: string) => void;
}) {
  const { dict } = useLocale();
  return (
    <div
      className="rounded-md border"
      style={{
        background:  "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Step header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span
          className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-xs font-bold"
          style={{
            background:  "var(--accent-faint)",
            color:       "var(--accent)",
            border:      "1px solid rgba(125,211,252,0.25)",
            fontFamily:  "var(--font-mono)",
            fontSize:    "0.65rem",
          }}
        >
          {String(step.step_number).padStart(2, "0")}
        </span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {step.title}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {step.objective}
          </p>
        </div>
      </div>

      {/* Step body */}
      <div className="px-4 py-3 space-y-4">
        {/* What to do */}
        <div>
          <RowLabel icon={Info} label={dict.workflow.whatToDo} />
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.what_to_do}
          </p>
        </div>

        {/* Tools */}
        {step.tools.length > 0 && (
          <div>
            <RowLabel icon={Wrench} label={dict.workflow.tools} />
            <div className="flex flex-wrap gap-1.5">
              {step.tools.map((t) => (
                <ToolChip key={t} name={t} onSearch={onToolSearch} />
              ))}
            </div>
          </div>
        )}

        {/* What to look for */}
        <div>
          <RowLabel icon={Eye} label={dict.workflow.whatToLookFor} color="var(--accent)" />
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.what_to_look_for}
          </p>
        </div>

        {/* Pitfalls */}
        <div>
          <RowLabel icon={AlertTriangle} label={dict.workflow.commonPitfall} color="var(--warning)" />
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.pitfalls}
          </p>
        </div>

        {/* Safety notes */}
        {step.safety_notes && (
          <div
            className="rounded p-3 border-l-2"
            style={{
              background:   "var(--danger-faint)",
              borderColor:  "var(--danger)",
            }}
          >
            <RowLabel icon={Shield} label={dict.workflow.safetyNote} color="var(--danger)" />
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {step.safety_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main panel ────────────────────────────────────────────── */
interface WorkflowDetailPanelProps {
  workflow: WorkflowDef | null;
  onClose: () => void;
  onToolSearch: (toolName: string) => void;
}

export default function WorkflowDetailPanel({
  workflow,
  onClose,
  onToolSearch,
}: WorkflowDetailPanelProps) {
  const { dict } = useLocale();
  // ESC to close
  useEffect(() => {
    if (!workflow) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [workflow, onClose]);

  if (!workflow) return null;

  const diff = DIFF_STYLE[workflow.difficulty];
  const risk = RISK_STYLE[workflow.risk_level];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: "rgba(7,9,12,0.75)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-label={dict.common.closePanel}
        role="button"
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label={`${dict.nav.workflows}: ${workflow.title}`}
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden animate-panel-in"
        style={{
          width:      "min(640px, 95vw)",
          background: "var(--panel)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* ── Panel header ─────────────────────────────────── */}
        <div
          className="shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0">
            <p
              className="text-xs mb-1"
              style={{
                fontFamily:    "var(--font-mono)",
                color:         "var(--faint)",
                fontSize:      "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {dict.workflow.guidedWorkflows}
            </p>
            <h2 className="text-xl font-semibold mb-0.5" style={{ color: "var(--text)" }}>
              {workflow.title}
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {workflow.subtitle}
            </p>
          </div>
          <button
            type="button"
            aria-label={dict.common.closePanel}
            onClick={onClose}
            className="shrink-0 mt-0.5 transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Meta strip */}
            <div
              className="rounded-md p-4 grid gap-y-3"
              style={{
                background:  "var(--card)",
                border:      "1px solid var(--border)",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              {/* Difficulty */}
              <div>
                <p className="text-xs mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", textTransform: "uppercase" }}>
                  {dict.workflow.difficulty}
                </p>
                <p className="text-xs font-medium" style={{ color: diff.color }}>
                  <BarChart2 size={10} style={{ display: "inline", marginRight: 3 }} aria-hidden="true" />
                  {dict.labels.difficulty[workflow.difficulty] ?? workflow.difficulty}
                </p>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", textTransform: "uppercase" }}>
                  {dict.workflow.estimatedTime}
                </p>
                <p className="text-xs font-medium" style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                  <Clock size={10} style={{ display: "inline", marginRight: 3 }} aria-hidden="true" />
                  {workflow.estimated_time}
                </p>
              </div>

              {/* Risk */}
              <div>
                <p className="text-xs mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", textTransform: "uppercase" }}>
                  {dict.workflow.riskLevel}
                </p>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    fontFamily:  "var(--font-mono)",
                    background:  risk.bg,
                    color:       risk.color,
                    border:      `1px solid ${risk.border}`,
                    fontSize:    "0.6rem",
                  }}
                >
                  {dict.labels.riskLevel[workflow.risk_level] ?? workflow.risk_level}
                </span>
              </div>

              {/* Steps */}
              <div>
                <p className="text-xs mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem", textTransform: "uppercase" }}>
                  {dict.workflow.stepsCount.replace(" {n}", "")}
                </p>
                <p className="text-xs font-medium" style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                  {t(dict.workflow.stepsCount, { n: workflow.steps.length })}
                </p>
              </div>
            </div>

            {/* Starting point → End goal */}
            <div className="flex items-stretch gap-0">
              <div
                className="flex-1 rounded-l-md px-4 py-3 border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <RowLabel icon={Target} label={dict.workflow.startingPoint} />
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {workflow.starting_point}
                </p>
              </div>
              <div
                className="flex items-center px-2"
                style={{ color: "var(--faint)" }}
                aria-hidden="true"
              >
                →
              </div>
              <div
                className="flex-1 rounded-r-md px-4 py-3 border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <RowLabel icon={Flag} label={dict.workflow.endGoal} />
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {workflow.end_goal}
                </p>
              </div>
            </div>

            {/* User groups */}
            <div>
              <RowLabel icon={Users} label={dict.workflow.forGroups} />
              <div className="flex flex-wrap gap-1.5">
                {workflow.user_groups.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      fontFamily:  "var(--font-mono)",
                      background:  "var(--surface)",
                      color:       "var(--muted)",
                      border:      "1px solid var(--border)",
                      fontSize:    "0.6rem",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Ethical checkpoint */}
            <div
              className="rounded-md p-4 border-l-2"
              style={{
                background:  "var(--surface)",
                border:      "1px solid var(--border)",
                borderLeft:  `2px solid var(--danger)`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield size={13} style={{ color: "var(--danger)" }} aria-hidden="true" />
                <p
                  className="text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--danger)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  {dict.workflow.ethicalCheckpoint}
                </p>
              </div>
              {/* Safety badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {workflow.ethical_checkpoint.badges.map((b) => (
                  <span
                    key={b}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      fontFamily:    "var(--font-mono)",
                      background:    "var(--card)",
                      color:         BADGE_STYLE[b].color,
                      border:        `1px solid ${BADGE_STYLE[b].color}40`,
                      fontSize:      "0.6rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {dict.labels.safetyBadge[b] ?? b}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                {workflow.ethical_checkpoint.summary}
              </p>
            </div>

            {/* Steps */}
            <div>
              <p
                className="text-xs mb-3"
                style={{
                  fontFamily:    "var(--font-mono)",
                  color:         "var(--faint)",
                  fontSize:      "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {"// " + dict.workflow.investigationSteps.toLowerCase()}
              </p>
              <div className="space-y-3">
                {workflow.steps.map((step) => (
                  <StepCard key={step.step_number} step={step} onToolSearch={onToolSearch} />
                ))}
              </div>
            </div>

            {/* Related tools */}
            {workflow.related_tools.length > 0 && (
              <div>
                <RowLabel icon={Wrench} label={dict.workflow.relatedTools} />
                <div className="flex flex-wrap gap-1.5">
                  {workflow.related_tools.map((t) => (
                    <ToolChip key={t} name={t} onSearch={onToolSearch} />
                  ))}
                </div>
              </div>
            )}

            {/* Related categories */}
            {workflow.related_categories.length > 0 && (
              <div>
                <RowLabel icon={Info} label={dict.search.categories} />
                <div className="flex flex-wrap gap-1.5">
                  {workflow.related_categories.map((c) => {
                    // Use static EN map: works regardless of active locale
                    const categoryId = EN_CAT_NAME_TO_ID.get(c.toLowerCase()) ?? null;

                    const displayName = categoryId
                      ? (dict.categories[categoryId]?.name ?? c)
                      : c;

                    if (!categoryId) {
                      return (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-full text-xs border"
                          style={{
                            fontFamily:  "var(--font-mono)",
                            background:  "var(--surface)",
                            color:       "var(--faint)",
                            borderColor: "var(--border-subtle)",
                            fontSize:    "0.6rem",
                          }}
                        >
                          {displayName}
                        </span>
                      );
                    }

                    return (
                      <a
                        key={c}
                        href={`/?category=${encodeURIComponent(categoryId)}`}
                        className="px-2 py-0.5 rounded-full text-xs border no-underline transition-colors"
                        style={{
                          fontFamily:  "var(--font-mono)",
                          background:  "var(--accent-faint)",
                          color:       "var(--accent-dim)",
                          borderColor: "rgba(125,211,252,0.15)",
                          fontSize:    "0.6rem",
                          cursor:      "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = "var(--accent)";
                          e.currentTarget.style.borderColor = "rgba(125,211,252,0.35)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = "var(--accent-dim)";
                          e.currentTarget.style.borderColor = "rgba(125,211,252,0.15)";
                        }}
                      >
                        {displayName}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom pad */}
            <div className="h-4" />
          </div>
        </div>

        {/* ── Footer CTA ─────────────────────────────────────── */}
        <div
          className="shrink-0 px-6 py-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
          >
            {dict.tool.legalNote}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded border transition-colors"
            style={{
              fontFamily:  "var(--font-mono)",
              background:  "var(--card)",
              color:       "var(--muted)",
              borderColor: "var(--border)",
            }}
            onMouseOver={(e) => {
              const el = e.currentTarget;
              el.style.color = "var(--text)";
              el.style.borderColor = "var(--accent-dim)";
            }}
            onMouseOut={(e) => {
              const el = e.currentTarget;
              el.style.color = "var(--muted)";
              el.style.borderColor = "var(--border)";
            }}
          >
            {dict.settings.close}
          </button>
        </div>
      </div>
    </>
  );
}
