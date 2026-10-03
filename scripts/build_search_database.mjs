import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateLocalData } from "./lib/validate-local-data.mjs";
import { normalize } from "../apps/web/lib/resource-search/core.mjs";
const root = new URL("../apps/web/", import.meta.url);
const read = async (path) =>
  JSON.parse(await readFile(new URL(path, root), "utf8"));
const [tools, intents, goals, guides, capabilities, tasks] = await Promise.all(
  [
    "data/tools.json",
    "data/search/intents.json",
    "data/search/goals.json",
    "data/search/guides.json",
    "data/search/capabilities.json",
    "data/search/tasks.json",
  ].map(read),
);
validateLocalData({tools,intents,goals,guides,capabilities,tasks});
const ids = new Set();
for (const tool of tools) {
  if (!tool.id || ids.has(tool.id))
    throw new Error(`Missing/duplicate resource id: ${tool.id}`);
  ids.add(tool.id);
  const url = new URL(tool.url);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error(`Invalid resource URL: ${tool.id}`);
}
for (const list of [intents, goals]) {
  if (new Set(list.map((x) => x.id)).size !== list.length)
    throw new Error("Duplicate intent/goal id");
  for (const row of list)
    if (!row.label.en || !row.label["zh-TW"] || !row.aliases.length)
      throw new Error(`Incomplete search term: ${row.id}`);
}
for (const intent of intents)
  for (const goal of intent.goals)
    if (!goals.some((g) => g.id === goal))
      throw new Error(`Unknown goal: ${goal}`);
const guideMap = new Map();
for (const guide of guides) {
  if (!ids.has(guide.tool_id) || guideMap.has(guide.tool_id))
    throw new Error(`Unknown/duplicate guide: ${guide.tool_id}`);
  for (const id of guide.intents)
    if (!intents.some((i) => i.id === id))
      throw new Error(`Unknown intent: ${id}`);
  for (const id of guide.goals)
    if (!goals.some((g) => g.id === id)) throw new Error(`Unknown goal: ${id}`);
  for (const field of ["reason", "start", "limitations"])
    if (!guide[field]?.en || !guide[field]?.["zh-TW"])
      throw new Error(`Incomplete guide: ${guide.tool_id}/${field}`);
  if (
    !guide.regions.length ||
    guide.regions.some(
      (r) => !["global", "us", "uk", "cn", "tw", "hk"].includes(r),
    )
  )
    throw new Error(`Invalid guide region: ${guide.tool_id}`);
  if (guide.source_status === "documented") {
    if (
      !guide.source_url ||
      new URL(guide.source_url).protocol !== "https:" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(guide.source_checked_at ?? "")
    ) {
      throw new Error(`Incomplete documented source: ${guide.tool_id}`);
    }
  }
  guideMap.set(guide.tool_id, guide);
}
const capabilityMap = new Map();
for (const capability of capabilities) {
  if (!ids.has(capability.tool_id) || capabilityMap.has(capability.tool_id))
    throw new Error(`Unknown/duplicate capability: ${capability.tool_id}`);
  if (!capability.accepted_inputs.length || !capability.output.en || !capability.output["zh-TW"])
    throw new Error(`Incomplete capability: ${capability.tool_id}`);
  for (const id of capability.intents)
    if (!intents.some(i => i.id === id)) throw new Error(`Unknown capability intent: ${id}`);
  for (const id of capability.goals)
    if (!goals.some(g => g.id === id)) throw new Error(`Unknown capability goal: ${id}`);
  if (!['discover','collect','verify','analyze','prepare'].includes(capability.stage) ||
      capability.regions.some(r => !['global','us','uk','cn','tw','hk'].includes(r)))
    throw new Error(`Invalid capability stage/coverage: ${capability.tool_id}`);
  capabilityMap.set(capability.tool_id, capability);
}
const resources = tools
  .filter(
    (t) =>
      t.review?.status !== "rejected" &&
      t.curation_status !== "rejected" &&
      t.is_active !== false &&
      !t.is_dead_link,
  )
  .map((t) => ({
    ...t,
    ...(capabilityMap.has(t.id) ? { capability: capabilityMap.get(t.id) } : {}),
    ...(guideMap.has(t.id) ? { guide: guideMap.get(t.id) } : {}),
  }));
const entries = Object.fromEntries(
  resources.map((t) => [
    t.id,
    {
      name: normalize(t.name),
      text: normalize(
        [
          t.name,
          t.id,
          t.description_en,
          t.description_zh_tw,
          t.raw_description,
          ...(t.tags ?? []),
          ...(t.capability?.accepted_inputs ?? []),
          t.capability?.output.en,
          t.capability?.output["zh-TW"],
          ...(t.target_types ?? []),
          ...(t.use_cases ?? []),
          ...(t.use_cases_zh_tw ?? []),
        ]
          .filter(Boolean)
          .join(" "),
      ),
    },
  ]),
);
const maintenanceReport = {
  counts: { resources: resources.length, guides: guides.length, tasks: tasks.length, documentedSources: guides.filter(g => g.source_status === "documented").length },
  needsUsageGuide: resources.filter(r => !r.guide).map(r => r.id),
  unknownRegionCoverage: resources.filter(r => !r.capability.regions.length && !r.guide?.regions.length).map(r => r.id),
  awaitingReview: resources.filter(r => r.review?.status !== "manually_reviewed" && r.guide?.source_status !== "documented").map(r => r.id),
  note: "Local metadata validation only. Documentation checks are not live availability or complete coverage audits.",
};
await mkdir(new URL("data/generated/", root), { recursive: true });
for (const [name, value] of [
  ["maintenance-report", maintenanceReport],
  ["resource-database", { version: 2, resources, intents, goals }],
  ["search-index", { version: 2, entries }],
]) {
  const target = new URL(`data/generated/${name}.json`, root);
  await writeFile(target, JSON.stringify(value, null, 2) + "\n");
  console.log(`Generated ${fileURLToPath(target)}`);
}
// Keep public reference text aligned with the current catalogue, instead of
// maintaining another historical list of tools and claims.
const safeText = value => String(value ?? "").replace(/\r?\n/g, " ");
const feed = [
  "# OSINT Hub — Current resource reference",
  "Generated from the local curated resource database. Recommendations are external sources and methods, not findings about a subject.",
  "Use /learn for verification basics, /tasks for practical exercises and /workflows for detailed bilingual methods.",
  ...resources.map(r => [
    `### ${safeText(r.name)}`,
    `URL: ${r.url}`,
    `Inputs: ${r.capability.accepted_inputs.join(", ")}`,
    `Coverage: ${r.capability.regions.join(", ") || "Unknown"}`,
    safeText(r.capability.output.en),
    safeText(r.guide?.limitations.en ?? "Check original source requirements; candidate matches need corroboration."),
  ].join("\n")),
].join("\n\n") + "\n";
await writeFile(new URL("public/llms-full.txt", root), feed);
console.log(
  `${resources.length} searchable resources; ${guides.length} guides; ${intents.length} intents.`,
);
