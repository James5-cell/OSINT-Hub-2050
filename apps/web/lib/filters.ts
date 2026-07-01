import type { Tool, FilterState } from "./types";

/**
 * Apply filter state to a tool list.
 * Within the same group: OR logic (any match passes).
 * Across different groups: AND logic (all active groups must match).
 */
export function applyFilters(tools: Tool[], filters: FilterState): Tool[] {
  const activeGroups = {
    pricing: filters.pricing.length > 0,
    difficulty: filters.difficulty.length > 0,
    target_types: filters.target_types.length > 0,
    platforms: filters.platforms.length > 0,
    tags: filters.tags.length > 0,
  };

  const hasAnyFilter = Object.values(activeGroups).some(Boolean);
  if (!hasAnyFilter) return tools;

  return tools.filter((tool) => {
    if (activeGroups.pricing) {
      if (!filters.pricing.includes(tool.pricing ?? "unknown")) return false;
    }

    if (activeGroups.difficulty) {
      if (!filters.difficulty.includes(tool.difficulty ?? "unknown"))
        return false;
    }

    if (activeGroups.target_types) {
      const toolTargets = tool.target_types ?? [];
      if (!filters.target_types.some((t) => toolTargets.includes(t)))
        return false;
    }

    if (activeGroups.platforms) {
      const toolPlatforms = tool.platforms ?? [];
      if (!filters.platforms.some((p) => toolPlatforms.includes(p)))
        return false;
    }

    if (activeGroups.tags) {
      const toolTags = tool.tags ?? [];
      if (!filters.tags.some((t) => toolTags.includes(t))) return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: FilterState): number {
  return (
    filters.pricing.length +
    filters.difficulty.length +
    filters.target_types.length +
    filters.platforms.length +
    filters.tags.length
  );
}

export function toggleFilterValue<T extends string>(
  arr: T[],
  value: T
): T[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}
