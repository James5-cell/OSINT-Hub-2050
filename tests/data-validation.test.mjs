import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile}from'node:fs/promises';
import{validateLocalData}from'../scripts/lib/validate-local-data.mjs';
const base={};for(const[key,file]of Object.entries({tools:'tools.json',intents:'search/intents.json',goals:'search/goals.json',guides:'search/guides.json',capabilities:'search/capabilities.json',tasks:'search/tasks.json'}))base[key]=JSON.parse(await readFile(new URL('../apps/web/data/'+file,import.meta.url),'utf8'));
test('rejects an invalid task source before generated files are written',()=>{const d=structuredClone(base);d.tasks[0].fallback='missing-resource';assert.throws(()=>validateLocalData(d),/Ineligible task source/)});
test('rejects unsupported input spellings and missing capability metadata',()=>{const d=structuredClone(base);d.capabilities[0].accepted_inputs=['preson'];assert.throws(()=>validateLocalData(d),/Unknown input/);const e=structuredClone(base);e.capabilities=e.capabilities.filter(c=>c.tool_id!=='linkedin');assert.throws(()=>validateLocalData(e),/Missing capability/)});
test('rejects invalid exercise answers and missing translations',()=>{const d=structuredClone(base);d.tasks[0].exercise.correct=99;assert.throws(()=>validateLocalData(d),/Invalid exercise answer/);const e=structuredClone(base);e.tasks[0].no_result['zh-TW']='';assert.throws(()=>validateLocalData(e),/Missing/)});
test('rejects impossible documentation dates',()=>{const d=structuredClone(base);d.guides[0].source_checked_at='2026-02-31';assert.throws(()=>validateLocalData(d),/Invalid source date/)});
