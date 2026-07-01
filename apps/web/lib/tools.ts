/**
 * Data adapter — the only place the frontend imports raw JSON.
 * All components consume Tool from types.ts, never raw JSON shapes directly.
 */

import type { Tool, Pricing, Difficulty, TargetType, Platform, CurationStatus, MaintenanceStatus } from "./types";
import rawData from "../data/tools.json";

/** Coerce a raw JSON record to the canonical Tool shape. */
function adaptTool(raw: Record<string, unknown>): Tool {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    url: String(raw.url ?? ""),
    raw_description: String(raw.raw_description ?? ""),
    description_en:
      typeof raw.description_en === "string" ? raw.description_en : undefined,
    description_zh_tw:
      typeof raw.description_zh_tw === "string"
        ? raw.description_zh_tw
        : undefined,
    use_cases: Array.isArray(raw.use_cases)
      ? (raw.use_cases as string[])
      : undefined,
    use_cases_zh_tw: Array.isArray(raw.use_cases_zh_tw)
      ? (raw.use_cases_zh_tw as string[])
      : undefined,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : undefined,
    pricing: (raw.pricing as Pricing) ?? "unknown",
    difficulty: (raw.difficulty as Difficulty) ?? "unknown",
    target_types: Array.isArray(raw.target_types)
      ? (raw.target_types as TargetType[])
      : undefined,
    platforms: Array.isArray(raw.platforms)
      ? (raw.platforms as Platform[])
      : undefined,
    ethical_flag:
      typeof raw.ethical_flag === "boolean" ? raw.ethical_flag : false,
    ethics_note:
      typeof raw.ethics_note === "string" ? raw.ethics_note : null,
    source_section:
      typeof raw.source_section === "string" ? raw.source_section : undefined,
    source_permalink:
      typeof raw.source_permalink === "string"
        ? raw.source_permalink
        : undefined,
    review:
      raw.review && typeof raw.review === "object"
        ? (raw.review as Tool["review"])
        : undefined,
    is_dead_link:
      typeof raw.is_dead_link === "boolean" ? raw.is_dead_link : false,
    is_active:
      typeof raw.is_active === "boolean" ? raw.is_active : undefined,
    curation_status: (raw.curation_status as CurationStatus) ?? undefined,
    curation_reason:
      typeof raw.curation_reason === "string" ? raw.curation_reason : null,
    maintenance_status:
      (raw.maintenance_status as MaintenanceStatus) ?? undefined,
    source_collections: Array.isArray(raw.source_collections)
      ? (raw.source_collections as string[])
      : undefined,
    last_verified_at:
      typeof raw.last_verified_at === "string" ? raw.last_verified_at : null,
  };
}

/** All tools adapted from JSON. Rejected tools are excluded from display. */
export const allTools: Tool[] = (rawData as Record<string, unknown>[])
  .map(adaptTool)
  .filter((t) => t.review?.status !== "rejected");

/** Derive unique sorted values for a given array field across all tools. */
export function collectValues<T extends string>(
  field: keyof Tool
): T[] {
  const set = new Set<T>();
  for (const tool of allTools) {
    const val = tool[field];
    if (Array.isArray(val)) {
      for (const v of val) set.add(v as T);
    } else if (typeof val === "string") {
      set.add(val as T);
    }
  }
  return Array.from(set).sort() as T[];
}

export const allTags = collectValues<string>("tags");
export const allTargetTypes = collectValues<TargetType>("target_types");
export const allPlatforms = collectValues<Platform>("platforms");
