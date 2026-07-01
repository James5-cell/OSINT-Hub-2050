"use client";

import Link from "next/link";
import { ChevronRight, Clock, BarChart2, Shield } from "lucide-react";
import type { WorkflowDef, RiskLevel, WorkflowDifficulty, SafetyBadge } from "@/lib/workflows";
import { allTools } from "@/lib/tools";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

/* ── Visual palette (color refs only, no hardcoded labels) ─── */
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

const toolNameSet = new Set(allTools.map((tool) => tool.name.toLowerCase()));

/* ── Individual card ───────────────────────────────────────── */
function WorkflowCard({
  workflow,
  onToolSearch,
}: {
  workflow:      WorkflowDef;
  onToolSearch?: (name: string) => void;
}) {
  const { dict } = useLocale();

  const diffColor = DIFF_COLOR[workflow.difficulty];
  const risk      = RISK_STYLE[workflow.risk_level];
  const diffLabel = dict.labels.difficulty[workflow.difficulty] ?? workflow.difficulty;
  const riskLabel = dict.labels.riskLevel[workflow.risk_level]  ?? workflow.risk_level;

  const displayTools = workflow.recommended_tools.slice(0, 4);
  const extraCount   = workflow.recommended_tools.length - displayTools.length;

  return (
    <div
      className="rounded-lg border flex flex-col transition-colors group"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
      onMouseOver={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)")
      }
      onMouseOut={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")
      }
    >
      {/* Clickable header → canonical route */}
      <Link
        href={`/workflows/${workflow.id}`}
        className="flex-1 px-5 py-4 no-underline block"
        aria-label={`Open workflow: ${workflow.title}`}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
              {workflow.title}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {workflow.subtitle}
            </p>
          </div>
          <span
            className="shrink-0 transition-transform group-hover:translate-x-0.5 mt-0.5"
            style={{ color: "var(--faint)" }}
          >
            <ChevronRight size={14} aria-hidden="true" />
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
          {workflow.summary}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: diffColor, fontSize: "0.62rem" }}
          >
            <BarChart2 size={9} style={{ display: "inline", marginRight: 3 }} aria-hidden="true" />
            {diffLabel}
          </span>
          <span style={{ color: "var(--faint)", fontSize: "0.5rem" }}>·</span>
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.62rem" }}
          >
            <Clock size={9} style={{ display: "inline", marginRight: 3 }} aria-hidden="true" />
            {workflow.estimated_time}
          </span>
          <span style={{ color: "var(--faint)", fontSize: "0.5rem" }}>·</span>
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.62rem" }}
          >
            {t(dict.workflow.stepsCount, { n: workflow.steps.length })}
          </span>
          <span
            className="ml-auto px-1.5 py-0.5 rounded text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              background: risk.bg,
              color:      risk.color,
              border:     `1px solid ${risk.border}`,
              fontSize:   "0.58rem",
            }}
          >
            <Shield size={8} style={{ display: "inline", marginRight: 3 }} aria-hidden="true" />
            {riskLabel}
          </span>
        </div>

        {/* Safety badges */}
        {workflow.ethical_checkpoint.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {workflow.ethical_checkpoint.badges.map((b) => (
              <span
                key={b}
                className="px-1.5 py-0.5 rounded text-xs"
                style={{
                  fontFamily:    "var(--font-mono)",
                  background:    "var(--surface)",
                  color:         BADGE_COLOR[b],
                  border:        `1px solid ${BADGE_COLOR[b]}30`,
                  fontSize:      "0.58rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {dict.labels.safetyBadge[b] ?? b}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Recommended tools row */}
      <div
        className="px-5 py-3 border-t flex flex-wrap items-center gap-1.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span
          className="text-xs mr-1"
          style={{
            fontFamily:    "var(--font-mono)",
            color:         "var(--faint)",
            fontSize:      "0.58rem",
            textTransform: "uppercase",
          }}
        >
          {dict.workflow.tools}
        </span>
        {displayTools.map((toolName) => {
          const exists = toolNameSet.has(toolName.toLowerCase());
          return exists ? (
            <button
              key={toolName}
              type="button"
              aria-label={`${dict.search.searchAction} ${toolName}`}
              onClick={() => onToolSearch?.(toolName)}
              className="rounded-full px-2 py-0.5 border transition-all text-xs"
              style={{
                fontFamily:  "var(--font-mono)",
                background:  "var(--surface)",
                color:       "var(--muted)",
                borderColor: "var(--border)",
                fontSize:    "0.6rem",
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
              {toolName}
            </button>
          ) : (
            <span
              key={toolName}
              title={dict.common.notIndexed}
              className="rounded-full px-2 py-0.5 border text-xs"
              style={{
                fontFamily:  "var(--font-mono)",
                background:  "var(--surface)",
                color:       "var(--faint)",
                borderColor: "var(--border-subtle)",
                fontSize:    "0.6rem",
              }}
            >
              {toolName}
            </span>
          );
        })}
        {extraCount > 0 && (
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.6rem" }}
          >
            {t(dict.workflow.moreTools, { n: extraCount })}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── List ──────────────────────────────────────────────────── */
interface WorkflowListProps {
  workflows:    WorkflowDef[];
  onToolSearch?: (toolName: string) => void;
}

export default function WorkflowList({ workflows, onToolSearch }: WorkflowListProps) {
  const { dict } = useLocale();

  if (workflows.length === 0) {
    return (
      <p
        className="text-sm py-12 text-center"
        style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
      >
        {dict.workflow.noWorkflows}
      </p>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
    >
      {workflows.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onToolSearch={onToolSearch} />
      ))}
    </div>
  );
}
