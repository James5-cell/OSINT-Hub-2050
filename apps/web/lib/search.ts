import Fuse, { type IFuseOptions } from "fuse.js";
import type { Tool } from "./types";

/* ── Fuse.js options ─────────────────────────────────────── */
const FUSE_OPTIONS: IFuseOptions<Tool> = {
  keys: [
    { name: "name",              weight: 2.0 },
    { name: "description_en",    weight: 1.5 },
    { name: "description_zh_tw", weight: 1.5 },
    { name: "tags",              weight: 1.0 },
    { name: "target_types",      weight: 0.8 },
    { name: "use_cases",         weight: 0.6 },
    { name: "platforms",         weight: 0.5 },
  ],
  threshold:         0.35,
  includeScore:      true,
  ignoreLocation:    true,
  minMatchCharLength: 2,
};

let fuseInstance: Fuse<Tool> | null = null;

export function buildSearchIndex(tools: Tool[]): void {
  fuseInstance = new Fuse(tools, FUSE_OPTIONS);
}

/* ── Scored result type ──────────────────────────────────── */
export interface ScoredTool {
  tool:  Tool;
  /** Fuse score: 0 = perfect match, 1 = no match. */
  score: number;
}

/**
 * Search tools and return results with Fuse confidence scores.
 * Deduplicates by id so the count always matches the source data.
 */
export function searchToolsScored(
  query: string,
  tools: Tool[]
): ScoredTool[] {
  if (!query.trim()) return tools.map((t) => ({ tool: t, score: 0.5 }));

  if (!fuseInstance) buildSearchIndex(tools);

  const seen = new Set<string>();
  return fuseInstance!
    .search(query)
    .filter((r) => {
      if (seen.has(r.item.id)) return false;
      seen.add(r.item.id);
      return true;
    })
    .map((r) => ({ tool: r.item, score: r.score ?? 1 }));
}

/**
 * Simplified wrapper — returns just the Tool array.
 * Used by components that don't need confidence scores.
 */
export function searchTools(query: string, tools: Tool[]): Tool[] {
  if (!query.trim()) return tools;
  return searchToolsScored(query, tools).map((r) => r.tool);
}
