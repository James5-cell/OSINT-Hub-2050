import type { Tool } from "./types";
import { findResources } from "./resource-search";
// Compatibility for existing category/playbook consumers. The static index is built
// before dev/build; searching never retains mutable state from a previous tool list.
export function buildSearchIndex(tools: Tool[]): void {
  void tools; /* pre-generated index */
}
export interface ScoredTool {
  tool: Tool;
  score: number;
}
export function searchToolsScored(query: string, tools: Tool[]): ScoredTool[] {
  if (!query.trim()) return tools.map((tool) => ({ tool, score: 0.5 }));
  const allowed = new Map(tools.map((tool) => [tool.id, tool]));
  return findResources(query)
    .results.filter((r) => allowed.has(r.resource.id))
    .map((r) => ({
      tool: allowed.get(r.resource.id)!,
      score: 1 - Math.min(r.score, 1000) / 1000,
    }));
}
export function searchTools(query: string, tools: Tool[]): Tool[] {
  return searchToolsScored(query, tools).map((r) => r.tool);
}
