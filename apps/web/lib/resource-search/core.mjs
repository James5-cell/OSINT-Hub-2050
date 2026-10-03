// Shared by the build script, browser search and Node regression tests.
export function normalize(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesAlias(query, alias) {
  const q = normalize(query),
    a = normalize(alias);
  if (/[\u3400-\u9fff]/u.test(a)) return q.includes(a);
  const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "u").test(q);
}

function oneTypo(a, b) {
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1)
    return false;
  let i = 0,
    j = 0,
    changes = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++changes > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return changes + (i < a.length || j < b.length ? 1 : 0) <= 1;
}

export function inferIntent(query, intents) {
  const q = normalize(query);
  const ipv4 = q.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4 && q.split(".").every((n) => Number(n) <= 255)) return "ip";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)) return "email";
  if (
    /^(https?:\/\/|www\.)\S+$/u.test(q) ||
    /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?$/u.test(q)
  )
    return "website";
  if (/^@[a-z0-9_.-]+$/u.test(q)) return "username";
  const candidates = intents.map((intent) => ({
    id: intent.id,
    strength: Math.max(
      0,
      ...intent.aliases
        .filter((a) => matchesAlias(q, a))
        .map((a) => normalize(a).length),
    ),
  }));
  candidates.sort((a, b) => b.strength - a.strength);
  return candidates[0]?.strength > 0 ? candidates[0].id : null;
}

export function resourceRole(resource, intentId) {
  const cap = resource.capability;
  if (!cap) return "unknown";
  if (cap.stage === "prepare") return "support";
  if (cap.stage === "analyze" || cap.stage === "collect") return "analysis";
  if (!intentId || cap.accepted_inputs.includes(intentId)) return "direct";
  return "pivot";
}

export function searchResources(database, index, query, options = {}) {
  const q = normalize(query);
  const intent = options.intent
    ? (database.intents.find((i) => i.id === options.intent) ??
      database.intents.find((i) => i.id === inferIntent(q, database.intents)))
    : database.intents.find((i) => i.id === inferIntent(q, database.intents));
  const inferredGoal =
    intent &&
    database.goals.find(
      (g) =>
        intent.goals.includes(g.id) &&
        g.aliases.some((a) => matchesAlias(q, a)),
    );
  const goal =
    options.goal === "all"
      ? undefined
      : intent?.goals.includes(options.goal)
        ? options.goal
        : inferredGoal?.id;
  const region = ["us", "uk", "cn", "tw", "hk"].includes(options.region)
    ? options.region
    : "all";
  const genericQuery =
    !!intent && intent.aliases.some((a) => normalize(a) === q);
  const results = [];
  for (const resource of database.resources) {
    if (options.freeOnly && !["free", "open-source"].includes(resource.pricing))
      continue;
    if (
      options.beginnerOnly &&
      (resource.difficulty !== "beginner" ||
        !resource.platforms?.includes("web"))
    )
      continue;
    const guide = resource.guide;
    const capability = resource.capability;
    const regions = capability?.regions.length ? capability.regions : guide?.regions ?? [];
    const coverageUnknown = regions.length === 0;
    if (
      region !== "all" &&
      (!coverageUnknown && !regions.includes("global") && !regions.includes(region))
    )
      continue;
    if (options.knownCoverageOnly && coverageUnknown) continue;
    const role = resourceRole(resource, intent?.id);
    if (intent && options.directOnly && role !== "direct") continue;
    const entry = index.entries[resource.id];
    if (!entry) continue;
    const exact = q && (q === entry.name || q === normalize(resource.id));
    const nameMatch =
      q && !genericQuery && (entry.name.includes(q) || oneTypo(q, entry.name));
    const tokens = q.split(/[\s,，]+/u).filter(Boolean);
    const coverage = tokens.length
      ? tokens.filter((t) => entry.text.includes(t)).length / tokens.length
      : 0;
    const textMatch = q && (entry.text.includes(q) || coverage >= 0.75);
    const guided =
      !!intent &&
      !!guide &&
      guide.intents.includes(intent.id) &&
      !resource.ethical_flag &&
      (resource.review?.status === "manually_reviewed" ||
        guide.source_status === "documented");
    // Subject matching covers the entire catalogue, independently of whether
    // an introductory usage guide has been written for a resource.
    const targetMatch =
      !!intent &&
      intent.targets.some((target) => resource.target_types?.includes(target));
    const related =
      targetMatch || (!!intent && !!guide && guide.intents.includes(intent.id)) ||
      (!!intent && capability?.intents.includes(intent.id));
    if (goal && !(capability?.goals.includes(goal) || guide?.goals.includes(goal))) continue;
    if (q && !exact && !nameMatch && !textMatch && !related) continue;
    if (intent && !related && !exact && !nameMatch) continue;
    let score = exact
      ? 10000
      : nameMatch
        ? 8000
        : guided
          ? 500
          : related
            ? 300
            : textMatch
              ? 150 + coverage * 50
              : 0;
    if (intent && !exact && !nameMatch) score += { direct: 600, pivot: 100, analysis: -100, support: -200, unknown: 0 }[role];
    if (region !== "all" && coverageUnknown) score -= 80;
    if (region !== "all" && regions.includes(region)) score += 100;
    if (guided) {
      score += resource.difficulty === "beginner" ? 20 : 0;
      score += resource.platforms?.includes("web") ? 20 : 0;
      score += ["free", "open-source"].includes(resource.pricing) ? 10 : 0;
      score += goal && guide.goals.includes(goal) ? 60 : 0;
      score += region !== "all" && regions.includes(region) ? 30 : 0;
      score -= guide.intents.indexOf(intent.id) * 5;
    }
    results.push({
      resource,
      score,
      role,
      coverageUnknown,
      match:
        exact || nameMatch
          ? "name"
          : guided
            ? "intent"
            : related
              ? "target"
              : "text",
    });
  }
  results.sort(
    (a, b) =>
      b.score - a.score || a.resource.name.localeCompare(b.resource.name, "en"),
  );
  return { intent: intent ?? null, goal: goal ?? null, results };
}
