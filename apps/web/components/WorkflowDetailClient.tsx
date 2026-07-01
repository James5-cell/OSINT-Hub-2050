"use client";

import Link from "next/link";
import {
  Clock, BarChart2, Shield, CheckCircle2, AlertTriangle,
  Info, Target, Flag, Users, ChevronRight,
} from "lucide-react";
import type { WorkflowDef, WorkflowStep, RiskLevel, WorkflowDifficulty, SafetyBadge, EthicalCheckpoint } from "@/lib/workflows";
import { getWorkflowById } from "@/lib/workflows";
import { allTools } from "@/lib/tools";
import { useLocale } from "@/lib/locale-context";
import { t, DICT } from "@/lib/i18n";

/* ── Color palette (unchanged from server version) ─────────── */
const DIFF_COLOR: Record<WorkflowDifficulty, string> = {
  beginner:     "var(--verified)",
  intermediate: "var(--warning)",
  advanced:     "var(--danger)",
};

const RISK_STYLE: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  low:    { color: "var(--verified)", bg: "var(--verified-faint)", border: "rgba(167,243,208,0.2)" },
  medium: { color: "var(--warning)",  bg: "var(--warning-faint)",  border: "rgba(245,158,11,0.2)"  },
  high:   { color: "var(--danger)",   bg: "var(--danger-faint)",   border: "rgba(249,115,22,0.25)" },
};

const BADGE_COLOR: Record<SafetyBadge, string> = {
  "passive-first":          "var(--accent)",
  "use-with-care":          "var(--warning)",
  "requires-authorization": "var(--danger)",
};

/* ── Tool chip ─────────────────────────────────────────────── */
const toolNameSet = new Set(allTools.map((t) => t.name.toLowerCase()));

/** Static reverse map: EN category display name (lowercase) → category ID.
 *  Built once from the EN dict so it works regardless of the active locale. */
const EN_CAT_NAME_TO_ID: Map<string, string> = new Map(
  Object.entries(DICT["en"].categories).map(([id, v]) => [v.name.toLowerCase(), id])
);

function ToolChip({ name }: { name: string }) {
  const { locale, dict } = useLocale();
  const exists = toolNameSet.has(name.toLowerCase());
  const tool = exists
    ? allTools.find((t) => t.name.toLowerCase() === name.toLowerCase())
    : null;

  if (!exists || !tool) {
    return (
      <span
        className="rounded-full px-2 py-0.5 border text-xs cursor-default select-none"
        style={{
          fontFamily:  "var(--font-mono)",
          background:  "var(--surface)",
          color:       "var(--faint)",
          borderColor: "var(--border-subtle)",
          fontSize:    "0.6rem",
        }}
        title={`${name} — ${dict.common.notIndexed}`}
      >
        {name}
      </span>
    );
  }

  const description = locale === "zh-TW"
    ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description)
    : (tool.description_en ?? tool.description_zh_tw ?? tool.raw_description);

  return (
    <div className="relative group inline-block">
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-xs no-underline transition-all"
        style={{
          fontFamily:  "var(--font-mono)",
          background:  "var(--surface)",
          color:       "var(--accent)",
          borderColor: "rgba(125,211,252,0.25)",
          fontSize:    "0.6rem",
          cursor:      "pointer",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-dim)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "rgba(125,211,252,0.25)";
        }}
      >
        <span>{name}</span>
        <span className="opacity-60" style={{ fontSize: "0.55rem" }}>↗</span>
      </a>

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
            {dict.tool.openTool} ↗
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Ethical checkpoint block ──────────────────────────────── */
function EthicalBlock({ checkpoint }: { checkpoint: EthicalCheckpoint }) {
  const { dict } = useLocale();
  return (
    <div
      className="rounded-lg border px-5 py-4"
      style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={13} style={{ color: "var(--warning)", flexShrink: 0 }} aria-hidden="true" />
        <p
          className="text-xs font-semibold"
          style={{
            fontFamily:    "var(--font-mono)",
            color:         "var(--warning)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {dict.workflow.ethicalCheckpoint}
        </p>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
        {checkpoint.summary}
      </p>
      {checkpoint.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {checkpoint.badges.map((b) => (
            <span
              key={b}
              className="px-2 py-0.5 rounded text-xs border"
              style={{
                fontFamily:    "var(--font-mono)",
                color:         BADGE_COLOR[b],
                borderColor:   `${BADGE_COLOR[b]}40`,
                background:    `${BADGE_COLOR[b]}10`,
                fontSize:      "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {dict.labels.safetyBadge[b] ?? b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step card ─────────────────────────────────────────────── */
function StepCard({ step, index }: { step: WorkflowStep; index: number }) {
  const { dict } = useLocale();
  const num = String(index + 1).padStart(2, "0");

  const SectionLabel = ({ label, icon }: { label: string; icon?: React.ReactNode }) => (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-1.5"
      style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem" }}
    >
      {icon}
      {label}
    </p>
  );

  return (
    <div
      className="rounded-lg border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Step header */}
      <div
        className="flex items-start gap-4 px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span
          className="text-xl font-semibold mt-0.5 shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            color:      "var(--accent)",
            opacity:    0.6,
            minWidth:   "1.8rem",
          }}
          aria-label={`${dict.workflow.step} ${index + 1}`}
        >
          {num}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
            {step.title}
          </h3>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.objective}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* What to do */}
        <div>
          <SectionLabel label={dict.workflow.whatToDo} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.what_to_do}
          </p>
        </div>

        {/* Tools */}
        {step.tools.length > 0 && (
          <div>
            <SectionLabel label={dict.workflow.tools} />
            <div className="flex flex-wrap gap-1.5">
              {step.tools.map((toolName) => <ToolChip key={toolName} name={toolName} />)}
            </div>
          </div>
        )}

        {/* What to look for */}
        <div>
          <SectionLabel
            label={dict.workflow.whatToLookFor}
            icon={
              <CheckCircle2
                size={9}
                style={{ display: "inline", marginRight: 3, color: "var(--verified)" }}
                aria-hidden="true"
              />
            }
          />
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.what_to_look_for}
          </p>
        </div>

        {/* Pitfalls */}
        <div>
          <SectionLabel
            label={dict.workflow.commonPitfall}
            icon={
              <Info
                size={9}
                style={{ display: "inline", marginRight: 3, color: "var(--warning)" }}
                aria-hidden="true"
              />
            }
          />
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {step.pitfalls}
          </p>
        </div>

        {/* Safety notes */}
        {step.safety_notes && (
          <div
            className="rounded px-3 py-2.5"
            style={{ background: "rgba(249,115,22,0.06)", borderLeft: "2px solid var(--danger)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--danger)", fontSize: "0.55rem" }}
            >
              {dict.workflow.safetyNote}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {step.safety_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main client component ─────────────────────────────────── */
interface WorkflowDetailClientProps {
  /** Canonical EN workflow from server. Client merges zh-TW overlay if needed. */
  workflow: WorkflowDef;
}

export default function WorkflowDetailClient({ workflow: baseWorkflow }: WorkflowDetailClientProps) {
  const { dict, locale } = useLocale();
  const wf = getWorkflowById(baseWorkflow.id, locale) ?? baseWorkflow;

  const diffColor = DIFF_COLOR[wf.difficulty];
  const risk      = RISK_STYLE[wf.risk_level];
  const diffLabel = dict.labels.difficulty[wf.difficulty] ?? wf.difficulty;
  const riskLabel = dict.labels.riskLevel[wf.risk_level]  ?? wf.risk_level;

  return (
    <main className="flex-1 flex flex-col">
      {/* ── Page header ────────────────────────────────── */}
      <div className="border-b py-10" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-screen-xl px-5">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 mb-5 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="transition-colors no-underline"
              style={{ color: "var(--faint)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
              onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
            >
              {dict.nav.index}
            </Link>
            <ChevronRight size={10} aria-hidden="true" />
            <Link
              href="/workflows"
              className="transition-colors no-underline"
              style={{ color: "var(--faint)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
              onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
            >
              {dict.workflow.allWorkflows}
            </Link>
            <ChevronRight size={10} aria-hidden="true" />
            <span style={{ color: "var(--muted)" }}>{wf.title}</span>
          </nav>

          <p
            className="text-xs mb-2"
            style={{
              fontFamily:    "var(--font-mono)",
              color:         "var(--faint)",
              fontSize:      "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {"// workflow"}
          </p>
          <h1 className="text-3xl font-semibold mb-1" style={{ color: "var(--text)" }}>
            {wf.title}
          </h1>
          <p
            className="text-base mb-4"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            {wf.subtitle}
          </p>
          <p className="text-sm max-w-2xl leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
            {wf.summary}
          </p>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color:      diffColor,
                borderColor: `${diffColor}40`,
                background: `${diffColor}10`,
                fontSize:   "0.65rem",
              }}
            >
              <BarChart2 size={10} aria-hidden="true" />
              {diffLabel}
            </span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
              style={{
                fontFamily:  "var(--font-mono)",
                color:       "var(--muted)",
                borderColor: "var(--border)",
                background:  "var(--surface)",
                fontSize:    "0.65rem",
              }}
            >
              <Clock size={10} aria-hidden="true" />
              {wf.estimated_time}
            </span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
              style={{
                fontFamily:  "var(--font-mono)",
                color:       "var(--muted)",
                borderColor: "var(--border)",
                background:  "var(--surface)",
                fontSize:    "0.65rem",
              }}
            >
              {t(dict.workflow.stepsCount, { n: wf.steps.length })}
            </span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
              style={{
                fontFamily:  "var(--font-mono)",
                color:       risk.color,
                borderColor: risk.border,
                background:  risk.bg,
                fontSize:    "0.65rem",
              }}
            >
              <Shield size={10} aria-hidden="true" />
              {riskLabel}
            </span>
            {wf.ethical_checkpoint.badges.map((b) => (
              <span
                key={b}
                className="px-2.5 py-1 rounded-full border text-xs"
                style={{
                  fontFamily:    "var(--font-mono)",
                  color:         BADGE_COLOR[b],
                  borderColor:   `${BADGE_COLOR[b]}40`,
                  background:    `${BADGE_COLOR[b]}10`,
                  fontSize:      "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {dict.labels.safetyBadge[b] ?? b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: two-column on desktop ────────────────── */}
      <div className="mx-auto max-w-screen-xl px-5 py-10 w-full flex gap-10 items-start">

        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Starting point / End goal */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="rounded-lg border px-4 py-4"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Target size={11} style={{ color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem" }}
                >
                  {dict.workflow.startingPoint}
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {wf.starting_point}
              </p>
            </div>
            <div
              className="rounded-lg border px-4 py-4"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Flag size={11} style={{ color: "var(--verified)", flexShrink: 0 }} aria-hidden="true" />
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem" }}
                >
                  {dict.workflow.endGoal}
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {wf.end_goal}
              </p>
            </div>
          </div>

          {/* Ethical checkpoint */}
          <EthicalBlock checkpoint={wf.ethical_checkpoint} />

          {/* Steps */}
          <div>
            <p
              className="text-xs mb-4"
              style={{
                fontFamily:    "var(--font-mono)",
                color:         "var(--faint)",
                fontSize:      "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {dict.workflow.investigationSteps}
            </p>
            <div className="space-y-4">
              {wf.steps.map((step, i) => (
                <StepCard key={step.step_number} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* Related tools */}
          {wf.related_tools.length > 0 && (
            <div>
              <p
                className="text-xs mb-3"
                style={{
                  fontFamily:    "var(--font-mono)",
                  color:         "var(--faint)",
                  fontSize:      "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                {dict.workflow.relatedTools}
              </p>
              <div className="flex flex-wrap gap-2">
                {wf.related_tools.map((toolName) => (
                  <ToolChip key={toolName} name={toolName} />
                ))}
              </div>
            </div>
          )}

          {/* Related categories */}
          {wf.related_categories.length > 0 && (
            <div>
              <p
                className="text-xs mb-3"
                style={{
                  fontFamily:    "var(--font-mono)",
                  color:         "var(--faint)",
                  fontSize:      "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                {dict.workflow.relatedCategories}
              </p>
              <div className="flex flex-wrap gap-2">
                {wf.related_categories.map((c) => {
                  // Use static EN map to resolve display name → ID
                  // workflows.en.json always stores EN names regardless of active locale
                  const categoryId = EN_CAT_NAME_TO_ID.get(c.toLowerCase()) ?? null;

                  if (!categoryId) {
                    // Fallback: render unlinked plain text
                    return (
                      <span
                        key={c}
                        className="rounded-full px-2.5 py-1 border text-xs"
                        style={{
                          fontFamily:  "var(--font-mono)",
                          background:  "var(--surface)",
                          color:       "var(--faint)",
                          borderColor: "var(--border-subtle)",
                          fontSize:    "0.6rem",
                        }}
                      >
                        {c}
                      </span>
                    );
                  }

                  // Determine display name from dict (respects current locale)
                  const displayName = dict.categories[categoryId]?.name ?? c;

                  return (
                    <Link
                      key={c}
                      href={`/?category=${encodeURIComponent(categoryId)}`}
                      className="rounded-full px-2.5 py-1 border text-xs no-underline transition-colors"
                      style={{
                        fontFamily:  "var(--font-mono)",
                        background:  "var(--surface)",
                        color:       "var(--muted)",
                        borderColor: "var(--border)",
                        fontSize:    "0.6rem",
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
                      {displayName}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────── */}
        <aside
          className="hidden lg:block w-64 shrink-0 sticky top-20 space-y-4"
          aria-label="Workflow metadata"
        >
          {/* Metadata card */}
          <div
            className="rounded-lg border px-4 py-4 space-y-3"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem" }}
            >
              {dict.workflow.metadata}
            </p>
            <dl className="space-y-2">
              {[
                {
                  label: dict.workflow.difficulty,
                  value: diffLabel,
                  color: diffColor,
                },
                {
                  label: dict.workflow.estimatedTime,
                  value: wf.estimated_time,
                  color: "var(--muted)",
                },
                {
                  label: t(dict.workflow.stepsCount, { n: wf.steps.length }),
                  value: String(wf.steps.length),
                  color: "var(--muted)",
                },
                {
                  label: dict.workflow.riskLevel,
                  value: riskLabel,
                  color: risk.color,
                },
                {
                  label: dict.workflow.publicSafe,
                  value: wf.public_safe ? dict.workflow.yes : dict.workflow.no,
                  color: wf.public_safe ? "var(--verified)" : "var(--warning)",
                },
                {
                  label: dict.workflow.authNeeded,
                  value: wf.requires_authorization
                    ? dict.workflow.yes
                    : dict.workflow.no,
                  color: wf.requires_authorization
                    ? "var(--warning)"
                    : "var(--verified)",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt
                    className="text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.6rem" }}
                  >
                    {label}
                  </dt>
                  <dd
                    className="text-xs font-medium"
                    style={{ fontFamily: "var(--font-mono)", color, fontSize: "0.6rem" }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* User groups */}
          {wf.user_groups.length > 0 && (
            <div
              className="rounded-lg border px-4 py-4"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={10} style={{ color: "var(--faint)" }} aria-hidden="true" />
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem" }}
                >
                  {dict.workflow.forGroups}
                </p>
              </div>
              <ul className="space-y-1">
                {wf.user_groups.map((g) => (
                  <li
                    key={g}
                    className="text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.6rem" }}
                  >
                    — {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Signals */}
          {wf.signals.length > 0 && (
            <div
              className="rounded-lg border px-4 py-4"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.58rem" }}
              >
                {dict.workflow.signals}
              </p>
              <ul className="space-y-1">
                {wf.signals.map((s) => (
                  <li
                    key={s}
                    className="text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.6rem" }}
                  >
                    — {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Back link */}
          <Link
            href="/workflows"
            className="flex items-center gap-1.5 text-xs no-underline transition-colors"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.6rem" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            {dict.workflow.backToWorkflows}
          </Link>
        </aside>
      </div>
    </main>
  );
}
