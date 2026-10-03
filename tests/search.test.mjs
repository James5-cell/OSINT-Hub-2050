import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  inferIntent,
  matchesAlias,
  normalize,
  searchResources,
} from "../apps/web/lib/resource-search/core.mjs";
const database = JSON.parse(
  await readFile(
    new URL(
      "../apps/web/data/generated/resource-database.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const index = JSON.parse(
  await readFile(
    new URL("../apps/web/data/generated/search-index.json", import.meta.url),
    "utf8",
  ),
);
const search = (q, opts) => searchResources(database, index, q, opts);
const ids = (result) => result.results.map((r) => r.resource.id);

test("simplified, traditional and English company keywords return the same recommendations", () => {
  const baseline = ids(search("company"));
  for (const q of ["公司", "企业", "企業", "companies", " COMPANY "])
    assert.deepEqual(ids(search(q)), baseline);
  assert.ok(baseline.includes("opencorporates"));
  assert.ok(baseline.includes("spiderfoot"));
});
test("person and username remain distinct research tasks", () => {
  assert.equal(search("人名").intent.id, "person");
  assert.ok(ids(search("人名")).includes("linkedin"));
  assert.ok(ids(search("人名")).includes("pimeyes"));
  assert.equal(search("用户名").intent.id, "username");
  assert.ok(ids(search("用户名")).includes("whatsmyname"));
});
test("English aliases match whole words rather than unrelated substrings", () => {
  assert.equal(matchesAlias("namespace", "name"), false);
  assert.equal(inferIntent("shipping", database.intents), null);
  assert.equal(inferIntent("company name", database.intents), "company");
});
test("recognises domains, URLs, email addresses, usernames and valid IPv4 addresses", () => {
  for (const q of ["https://example.com/a", "example.com", "www.example.com"])
    assert.equal(search(q).intent.id, "website");
  assert.equal(search("me@example.com").intent.id, "email");
  assert.equal(search("@example").intent.id, "username");
  assert.equal(search("8.8.8.8").intent.id, "ip");
  assert.equal(inferIntent("999.8.8.8", database.intents), null);
});
test("a concrete person name is not treated as identity evidence", () => {
  assert.equal(search("John Smith").intent, null);
  assert.equal(search("John Smith", { intent: "person" }).intent.id, "person");
  assert.ok(
    ids(search("John Smith", { intent: "person" })).includes("linkedin"),
  );
});
test("goal filters distinguish registration from technology and background", () => {
  const result = search("公司", { goal: "registration" });
  assert.ok(result.results.length > 0);
  assert.ok(
    result.results.every((r) =>
      r.resource.guide?.goals.includes("registration") || r.resource.capability?.goals.includes("registration"),
    ),
  );
  assert.ok(!ids(result).includes("crunchbase"));
});
test("natural keyword goals can be cleared with an explicit all-goals option", () => {
  assert.equal(search("公司注册").goal, "registration");
  const all = search("公司注册", { goal: "all" });
  assert.equal(all.goal, null);
  assert.ok(ids(all).includes("crunchbase"));
});
test("incompatible goal parameters are ignored", () => {
  assert.equal(search("公司", { goal: "image-source" }).goal, null);
});
test("region filtering removes incompatible coverage and retains labelled unknowns", () => {
  const uk = search("company", { region: "uk", goal: "registration" });
  assert.ok(ids(uk).includes("companies-house"));
  assert.ok(
    !ids(search("company", { region: "us" })).includes("companies-house"),
  );
  assert.ok(!ids(search("company", { region: "cn" })).includes("sec-edgar"));
  assert.ok(
    search("", { region: "tw" }).results.every(
      (r) =>
        r.coverageUnknown ||
        (r.resource.capability?.regions.length ? r.resource.capability.regions : r.resource.guide?.regions ?? []).some(region => ["global", "tw"].includes(region)),
    ),
  );
});
test("free and easy filters apply together", () => {
  const result = search("", { freeOnly: true, beginnerOnly: true });
  assert.ok(result.results.length > 0);
  assert.ok(
    result.results.every(
      ({ resource: r }) =>
        ["free", "open-source"].includes(r.pricing) &&
        r.difficulty === "beginner" &&
        r.platforms.includes("web"),
    ),
  );
});
test("exact tool names rank first; a single name typo remains searchable", () => {
  assert.equal(ids(search("TinEye"))[0], "tineye");
  assert.equal(ids(search("tiney"))[0], "tineye");
  assert.equal(ids(search("LinkedIn"))[0], "linkedin");
});
test("unrecognised input has an empty state rather than arbitrary recommendations", () => {
  assert.equal(search("zzzzqxy987").results.length, 0);
});
test("catalogue has no duplicate, dead, inactive or rejected resources", () => {
  const result = search("");
  assert.equal(new Set(ids(result)).size, database.resources.length);
  for (const { resource: r } of result.results) {
    assert.notEqual(r.is_active, false);
    assert.notEqual(r.is_dead_link, true);
    assert.notEqual(r.review?.status, "rejected");
    assert.notEqual(r.curation_status, "rejected");
    assert.ok(index.entries[r.id]);
  }
});
test("every supported intent has reviewed, actionable guides ranked among its results", () => {
  for (const intent of database.intents) {
    const result = search(intent.label.en);
    assert.equal(result.intent.id, intent.id);
    assert.ok(result.results.length > 0, intent.id);
    for (const { resource: r } of result.results.filter(
      (r) => r.match === "intent",
    )) {
      assert.ok(r.guide);
      assert.equal(r.ethical_flag, false);
      assert.ok(
        r.review.status === "manually_reviewed" ||
          r.guide.source_status === "documented",
      );
      for (const locale of ["en", "zh-TW"])
        for (const field of ["reason", "start", "limitations"])
          assert.ok(r.guide[field][locale]);
    }
  }
});
test("all goals have a matching capable resource; search results are reproducible", () => {
  for (const intent of database.intents)
    for (const goal of intent.goals) {
      const result = search(intent.label.en, { goal });
      assert.ok(result.results.length > 0, `${intent.id}/${goal}`);
      assert.deepEqual(result, search(intent.label.en, { goal }));
    }
  assert.equal(normalize(" ＣＯＭＰＡＮＹ  "), "company");
});

test("subject searches include all matching records, even without a usage guide", () => {
  for (const intent of database.intents) {
    const result = search(intent.label.en, { goal: "all" });
    const expected = database.resources.filter(
      (r) =>
        intent.targets.some((t) => r.target_types?.includes(t)) ||
        r.guide?.intents.includes(intent.id) || r.capability?.intents.includes(intent.id),
    );
    assert.deepEqual(
      new Set(ids(result)),
      new Set(expected.map((r) => r.id)),
      intent.id,
    );
  }
});
test("person catalogue contains broad resource matches while guides rank first", () => {
  const result = search("人名", { intent: "person", goal: "all" });
  assert.ok(result.results.length > 20);
  assert.ok(result.results.some((r) => !r.resource.guide));
  assert.equal(result.results[0].match, "intent");
  assert.equal(
    result.results.find((r) => r.resource.id === "maltego").match,
    "target",
  );
  assert.ok(
    result.results.find((r) => r.resource.id === "pimeyes").resource
      .ethical_flag,
  );
});


test("person results rank name inputs above image pivots and research preparation", () => {
  const result = search("人名", { goal: "all" });
  const position = id => ids(result).indexOf(id);
  assert.ok(position("linkedin") < position("pimeyes"));
  assert.ok(position("linkedin") < position("maltego"));
  assert.equal(result.results.find(r => r.resource.id === "pimeyes").role, "pivot");
  assert.equal(result.results.find(r => r.resource.id === "maltego").role, "analysis");
  assert.equal(result.results.find(r => r.resource.id === "signal").role, "support");
});
test("capability-based goals find useful records without requiring an introductory guide", () => {
  const result = search("人名", {goal: "public-records"});
  assert.ok(ids(result).includes("judyrecords"));
  assert.ok(ids(result).includes("opensanctions"));
  assert.ok(!ids(result).includes("signal"));
});
test("unknown phone coverage survives a region filter with an explicit label", () => {
  const result = search("電話", {region: "tw"});
  assert.ok(result.results.length > 0);
  assert.ok(result.results.some(r => r.coverageUnknown));
});
test("news, video and scholarly inputs recommend appropriate source types", () => {
  assert.ok(ids(search("新聞")).includes("fact-check-explorer"));
  assert.ok(ids(search("影片")).includes("invid-weverify"));
  assert.ok(!ids(search("影片")).includes("pimeyes"));
  assert.ok(ids(search("學術")).includes("google-scholar"));
});


test("every active resource has bilingual input and output metadata", () => {
  for (const resource of database.resources) {
    assert.ok(resource.capability, resource.id);
    assert.ok(resource.capability.accepted_inputs.length, resource.id);
    assert.ok(resource.capability.output.en, resource.id);
    assert.ok(resource.capability.output["zh-TW"], resource.id);
  }
  for (const intent of database.intents)
    assert.ok(search(intent.label.en, { goal: "all" }).results.some(r => r.role === "direct"), intent.id);
});

test('exact names outrank general guides even with an explicit intent',()=>{
 assert.equal(ids(search('LinkedIn',{intent:'person'}))[0],'linkedin');
 assert.equal(ids(search('TinEye',{intent:'image'}))[0],'tineye');
});
test('direct-input filtering keeps name sources and removes image pivots',()=>{
 const result=search('人名',{directOnly:true});
 assert.ok(ids(result).includes('linkedin'));
 assert.ok(!ids(result).includes('pimeyes'));
 assert.ok(result.results.every(r=>r.role==='direct'));
});
test('annotated-only filter excludes unknown coverage without changing the default',()=>{
 const broad=search('電話');
 assert.ok(broad.results.some(r=>r.coverageUnknown));
 assert.ok(search('電話',{knownCoverageOnly:true}).results.every(r=>!r.coverageUnknown));
});
test('regional news sources match their documented editorial regions',()=>{
 assert.ok(ids(search('新聞',{region:'tw'})).includes('taiwan-factcheck'));
 assert.ok(!ids(search('新聞',{region:'tw'})).includes('full-fact'));
 assert.ok(ids(search('news',{region:'uk'})).includes('full-fact'));
});
