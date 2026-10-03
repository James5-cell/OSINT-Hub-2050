import rawDatabase from "../../data/generated/resource-database.json";
import rawIndex from "../../data/generated/search-index.json";
import { searchResources } from "./core.mjs";
import type { Database, SearchIndex, SearchOptions } from "./types";
export const resourceDatabase = rawDatabase as unknown as Database;
const searchIndex = rawIndex as SearchIndex;
export const findResources = (query: string, options: SearchOptions = {}) =>
  searchResources(resourceDatabase, searchIndex, query, options);
