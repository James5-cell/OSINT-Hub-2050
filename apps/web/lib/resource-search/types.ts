import type { Tool } from "../types";
export type LocalText = { en: string; "zh-TW": string };
export interface Intent {
  id: string;
  label: LocalText;
  aliases: string[];
  targets: string[];
  hint: LocalText;
  lesson: LocalText;
  goals: string[];
}
export interface Goal {
  id: string;
  label: LocalText;
  aliases: string[];
}
export interface ResourceGuide {
  source_status?: "documented";
  source_url?: string;
  source_checked_at?: string;
  tool_id: string;
  intents: string[];
  goals: string[];
  regions: string[];
  reason: LocalText;
  start: LocalText;
  limitations: LocalText;
}
export type ResourceRole = "direct" | "pivot" | "analysis" | "support" | "unknown";
export interface Capability {
  tool_id: string;
  accepted_inputs: string[];
  intents: string[];
  goals: string[];
  regions: string[];
  kind: string;
  stage: string;
  output: LocalText;
  verification: "editorial";
  coverage_note?: LocalText;
}
export interface Resource extends Tool {
  capability?: Capability;
  guide?: ResourceGuide;
}
export interface Database {
  version: number;
  resources: Resource[];
  intents: Intent[];
  goals: Goal[];
}
export interface SearchIndex {
  version: number;
  entries: Record<string, { name: string; text: string }>;
}
export interface SearchOptions {
  intent?: string;
  goal?: string;
  region?: string;
  freeOnly?: boolean;
  beginnerOnly?: boolean;
  directOnly?: boolean;
  knownCoverageOnly?: boolean;
}
export interface ResourceMatch {
  resource: Resource;
  score: number;
  role: ResourceRole;
  coverageUnknown: boolean;
  match: "name" | "intent" | "target" | "text";
}
export interface SearchResult {
  intent: Intent | null;
  goal: string | null;
  results: ResourceMatch[];
}
