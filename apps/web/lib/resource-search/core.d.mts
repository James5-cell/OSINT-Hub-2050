import type {
  Database,
  Intent,
  SearchIndex,
  SearchOptions,
  SearchResult,
} from "./types";
export function normalize(value: unknown): string;
export function matchesAlias(query: string, alias: string): boolean;
export function inferIntent(query: string, intents: Intent[]): string | null;
export function searchResources(
  database: Database,
  index: SearchIndex,
  query: string,
  options?: SearchOptions,
): SearchResult;

export function resourceRole(resource: import("./types").Resource, intentId?: string): import("./types").ResourceRole;
