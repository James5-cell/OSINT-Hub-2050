/**
 * lib/workflows.ts
 *
 * Canonical workflow loader.
 * English (workflows.en.json) is the authoritative source.
 * zh-TW overlay (workflows.zh-TW.json) can override presentational
 * fields (title, subtitle, summary) for locale-aware rendering.
 */

import type { WorkflowDef } from "./workflow-types";
import type { Locale } from "./i18n";
import enWorkflows    from "@/data/workflows.en.json";
import zhTWWorkflows  from "@/data/workflows.zh-TW.json";

export const WORKFLOWS: WorkflowDef[] = enWorkflows as WorkflowDef[];

export function getWorkflows(locale: Locale): WorkflowDef[] {
  return locale === "zh-TW"
    ? (zhTWWorkflows as WorkflowDef[])
    : (enWorkflows as WorkflowDef[]);
}

/** Convenience: get workflow by id for a given locale. */
export function getWorkflowById(
  id:     string,
  locale: Locale = "en"
): WorkflowDef | undefined {
  const list = getWorkflows(locale);
  return list.find((w) => w.id === id);
}

// Re-export types so consumers don't need two imports
export type {
  WorkflowDef,
  WorkflowStep,
  EthicalCheckpoint,
  SafetyBadge,
  WorkflowDifficulty,
  RiskLevel,
} from "./workflow-types";
