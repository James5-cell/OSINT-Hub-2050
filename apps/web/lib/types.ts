export type Pricing = "free" | "freemium" | "paid" | "open-source" | "unknown";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "unknown";
export type CurationStatus = "curated" | "candidate" | "rejected";
export type MaintenanceStatus = "active" | "stale" | "unknown";
export type TargetType =
  | "person"
  | "email"
  | "phone"
  | "username"
  | "domain"
  | "ip"
  | "organization"
  | "cryptocurrency"
  | "image"
  | "vehicle"
  | "social-media"
  | "document"
  | "network"
  | "geolocation"
  | "other";
export type Platform =
  | "web"
  | "cli"
  | "api"
  | "browser-extension"
  | "desktop"
  | "mobile"
  | "other";
export type ReviewStatus = "ai_candidate" | "manually_reviewed" | "rejected";

export interface ToolReview {
  status: ReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
}

/** Canonical shape used throughout the frontend. */
export interface Tool {
  id: string;
  name: string;
  url: string;
  raw_description: string;
  /** English description (LLM-generated, added in Phase 4+). */
  description_en?: string;
  description_zh_tw?: string;
  use_cases?: string[];
  use_cases_zh_tw?: string[];
  tags?: string[];
  pricing?: Pricing;
  difficulty?: Difficulty;
  target_types?: TargetType[];
  platforms?: Platform[];
  ethical_flag?: boolean;
  ethics_note?: string | null;
  source_section?: string;
  source_permalink?: string;
  review?: ToolReview;
  is_dead_link?: boolean;
  is_active?: boolean;
  curation_status?: CurationStatus;
  curation_reason?: string | null;
  maintenance_status?: MaintenanceStatus;
  source_collections?: string[];
  last_verified_at?: string | null;
}

/** Filter state passed between components. */
export interface FilterState {
  pricing: Pricing[];
  difficulty: Difficulty[];
  target_types: TargetType[];
  platforms: Platform[];
  tags: string[];
}

export const EMPTY_FILTERS: FilterState = {
  pricing: [],
  difficulty: [],
  target_types: [],
  platforms: [],
  tags: [],
};
