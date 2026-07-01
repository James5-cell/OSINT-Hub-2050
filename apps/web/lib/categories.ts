import type { TargetType } from "./types";

export interface CategoryDef {
  id: string;
  targetTypes: TargetType[];
  /** Optional tag-based refinement to distinguish overlapping categories (e.g. Leaks vs Email). */
  tags?: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "people",
    targetTypes: ["person"],
  },
  {
    id: "usernames",
    targetTypes: ["username"],
  },
  {
    id: "emails",
    targetTypes: ["email"],
  },
  {
    id: "domains",
    targetTypes: ["domain"],
  },
  {
    id: "ips",
    targetTypes: ["ip", "network"],
  },
  {
    id: "social",
    targetTypes: ["social-media"],
  },
  {
    id: "images",
    targetTypes: ["image", "geolocation"],
  },
  {
    id: "companies",
    targetTypes: ["organization"],
  },
  {
    id: "leaks",
    targetTypes: ["email", "username"],
    tags: ["breach", "credentials", "leaks", "password"],
  },
  {
    id: "crypto",
    targetTypes: ["cryptocurrency"],
  },
  {
    id: "threat",
    targetTypes: ["ip", "domain", "network"],
    tags: ["vulnerability", "iot", "tls", "threat", "search-engine"],
  },
  {
    id: "documents",
    targetTypes: ["document"],
  },
  {
    id: "phones",
    targetTypes: ["phone"],
  },
  {
    id: "government",
    targetTypes: ["organization", "document"],
    tags: ["government-records", "public-records", "court-records", "sec-filings", "sanctions", "foia"],
  },
  {
    id: "ai-osint",
    targetTypes: ["image", "person"],
    tags: ["ai-osint", "deepfake-detection", "ai-generated", "synthetic-media"],
  },
  {
    id: "malware",
    targetTypes: ["network", "domain"],
    tags: ["malware", "malware-analysis", "sandbox", "url-analysis", "threat-analysis"],
  },
  {
    id: "darkweb",
    targetTypes: ["network", "domain"],
    tags: ["dark-web", "tor", "onion"],
  },
  {
    id: "rf",
    targetTypes: ["network"],
    tags: ["sdr", "rf", "spectrum", "adsb", "sigint"],
  },
  {
    id: "iot",
    targetTypes: ["network", "ip"],
    tags: ["iot-osint", "smart-devices", "embedded-systems", "firmware"],
  },
  {
    id: "opsec",
    targetTypes: ["person"],
    tags: ["opsec", "privacy", "anonymity", "operational-security"],
  },
];

export function getCategoryById(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/** Count tools that match a category's target types and optional tags. */
import type { Tool } from "./types";

function toolMatchesCategory(tool: Tool, cat: CategoryDef): boolean {
  const toolTargets = tool.target_types ?? [];
  const toolTags = tool.tags ?? [];

  const targetMatch =
    cat.targetTypes.length === 0 ||
    cat.targetTypes.some((t) => toolTargets.includes(t));

  if (!cat.tags || cat.tags.length === 0) {
    return targetMatch;
  }

  const tagMatch = cat.tags.some((tag) => toolTags.includes(tag));

  // For tag-gated categories: require both a broad target match AND a specific tag.
  // This prevents tools that share a targetType (e.g. "network") from leaking
  // into unrelated tag-gated categories (e.g. dark-web vs malware vs ips).
  return targetMatch && tagMatch;
}

export function countCategoryTools(tools: Tool[], cat: CategoryDef): number {
  return tools.filter((t) => toolMatchesCategory(t, cat)).length;
}

/** Filter tools that belong to a category. */
export function filterCategoryTools(tools: Tool[], cat: CategoryDef): Tool[] {
  return tools.filter((t) => toolMatchesCategory(t, cat));
}
