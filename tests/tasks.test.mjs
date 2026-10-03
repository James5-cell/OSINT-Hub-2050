import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const tasks=await read('../apps/web/data/search/tasks.json');
const database=await read('../apps/web/data/generated/resource-database.json');
import{searchResources}from '../apps/web/lib/resource-search/core.mjs';
const index=await read('../apps/web/data/generated/search-index.json');
test('every task has usable catalogue references and a non-empty goal path',()=>{
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 for(const task of tasks){
  for(const id of [...task.primary,task.fallback])assert.ok(database.resources.some(r=>r.id===id),`${task.id}/${id}`);
  assert.ok(!task.primary.includes(task.fallback),task.id);
  for(const locale of ['en','zh-TW']){
   assert.ok(task.inputs[locale]&&task.no_result[locale],task.id);
   assert.equal(task.steps.length,4);
   for(const step of task.steps)assert.ok(step.title[locale]&&step.text[locale],task.id);
   assert.ok(searchResources(database,index,task.title[locale],{intent:task.intent,goal:task.goal}).results.length,task.id);
  }
 }
});
test('core teaching cases compare evidence with valid answers rather than always saying no',()=>{
 const cases=tasks.filter(t=>['company','person','image'].includes(t.id));
 assert.equal(cases.length,3);
 assert.ok(new Set(cases.map(t=>t.exercise.correct)).size>1);
 for(const task of cases){
  assert.ok(task.exercise.evidence.length>=2);
  assert.ok(task.exercise.choices[task.exercise.correct]);
  for(const locale of ['en','zh-TW'])assert.ok(task.exercise.feedback[locale]);
 }
});


test('every task starting source and alternative has a usage guide',()=>{
 for(const task of tasks)for(const id of [...task.primary,task.fallback])
  assert.ok(database.resources.find(r=>r.id===id)?.guide,`${task.id}/${id}`);
});
