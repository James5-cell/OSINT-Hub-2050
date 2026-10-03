import test from "node:test";
import assert from "node:assert/strict";
import {buildQueryTemplates} from "../apps/web/lib/query-templates.mjs";
test("templates keep names and context quoted while limiting an optional domain",()=>{
 const queries=buildQueryTemplates('Example name','Example employer','https://example.org/');
 assert.equal(queries[0].query,'"Example name" "Example employer"');
 assert.equal(queries[1].query,'"Example name" "Example employer" site:example.org');
 assert.equal(queries[2].query,'"Example name" "Example employer" filetype:pdf');
});
test("empty subjects and invalid domains do not create misleading queries",()=>{
 assert.deepEqual(buildQueryTemplates('  '),[]);
 assert.ok(!buildQueryTemplates('Example','','example.org/path').some(q=>q.id==='site'));
 assert.equal(buildQueryTemplates('"Example"\nname')[0].query,'"Example name"');
});
