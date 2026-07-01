/* ── Primitives ────────────────────────────────────────────── */
export type WorkflowDifficulty = "beginner" | "intermediate" | "advanced";
export type RiskLevel          = "low" | "medium" | "high";
export type SafetyBadge        =
  | "use-with-care"
  | "requires-authorization"
  | "passive-first";

/* ── Step ──────────────────────────────────────────────────── */
export interface WorkflowStep {
  step_number: number;
  title: string;
  objective: string;
  what_to_do: string;
  tools: string[];
  what_to_look_for: string;
  pitfalls: string;
  safety_notes: string | null;
}

/* ── Ethical checkpoint ────────────────────────────────────── */
export interface EthicalCheckpoint {
  summary: string;
  badges: SafetyBadge[];
}

/* ── Full workflow ─────────────────────────────────────────── */
export interface WorkflowDef {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  starting_point: string;
  end_goal: string;
  difficulty: WorkflowDifficulty;
  estimated_time: string;
  user_groups: string[];
  categories: string[];
  target_types: string[];
  signals: string[];
  recommended_tools: string[];
  risk_level: RiskLevel;
  public_safe: boolean;
  requires_authorization: boolean;
  steps: WorkflowStep[];
  ethical_checkpoint: EthicalCheckpoint;
  related_tools: string[];
  related_categories: string[];
}
