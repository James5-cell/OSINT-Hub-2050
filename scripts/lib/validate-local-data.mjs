export function validateLocalData({tools,intents,goals,guides,capabilities,tasks}) {
 const fail=message=>{throw new Error(message)};
 const bilingual=(value,label)=>{for(const locale of ['en','zh-TW'])if(typeof value?.[locale]!=='string'||!value[locale].trim())fail(`Missing ${label}/${locale}`)};
 const unique=(values,label)=>{if(!Array.isArray(values)||new Set(values).size!==values.length)fail(`Invalid/duplicate ${label}`)};
 const ids=new Set(tools.map(t=>t.id)), intentIds=new Set(intents.map(i=>i.id)), goalIds=new Set(goals.map(g=>g.id));
 const inputs=new Set([...intentIds,'preparation','question','query','file_hash','aircraft','vessel','radio_signal']);
 const regions=new Set(['global','us','uk','cn','tw','hk']);
 const eligible=new Set(tools.filter(t=>t.is_active!==false&&!t.is_dead_link&&t.review?.status!=='rejected'&&t.curation_status!=='rejected').map(t=>t.id));
 for(const c of capabilities){
  for(const field of ['accepted_inputs','intents','goals','regions'])unique(c[field],`${c.tool_id}/${field}`);
  for(const input of c.accepted_inputs)if(!inputs.has(input))fail(`Unknown input: ${c.tool_id}/${input}`);
  bilingual(c.output,`${c.tool_id}/output`);if(c.coverage_note)bilingual(c.coverage_note,`${c.tool_id}/coverage_note`);
  if(!['search','database','platform','software','directory','method'].includes(c.kind))fail(`Unknown resource kind: ${c.tool_id}`);
  if(c.regions.some(r=>!regions.has(r)))fail(`Unknown coverage: ${c.tool_id}`);
 }
 for(const id of eligible)if(!capabilities.some(c=>c.tool_id===id))fail(`Missing capability: ${id}`);
 for(const guide of guides){
  for(const field of ['intents','goals','regions'])unique(guide[field],`${guide.tool_id}/${field}`);
  if(guide.source_checked_at){const date=new Date(guide.source_checked_at);if(!/^\d{4}-\d{2}-\d{2}$/.test(guide.source_checked_at)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==guide.source_checked_at)fail(`Invalid source date: ${guide.tool_id}`)}
 }
 unique(tasks.map(t=>t.id),'task ids');
 for(const task of tasks){
  if(!intentIds.has(task.intent)||!goalIds.has(task.goal)||!intents.find(i=>i.id===task.intent).goals.includes(task.goal))fail(`Invalid task goal: ${task.id}`);
  unique(task.primary,`${task.id}/primary`);
  if(!task.primary.length||task.primary.includes(task.fallback))fail(`Missing alternative path: ${task.id}`);
  for(const id of [...task.primary,task.fallback])if(!ids.has(id)||!eligible.has(id))fail(`Ineligible task source: ${task.id}/${id}`);
  for(const field of ['title','inputs','no_result'])bilingual(task[field],`${task.id}/${field}`);
  if(!Array.isArray(task.steps)||task.steps.length!==4)fail(`Invalid steps: ${task.id}`);
  for(const step of task.steps){bilingual(step.title,`${task.id}/step title`);bilingual(step.text,`${task.id}/step text`)}
  if(task.exercise){const e=task.exercise;
   bilingual(e.title,`${task.id}/exercise title`);bilingual(e.feedback,`${task.id}/feedback`);
   if(!Array.isArray(e.evidence)||!e.evidence.length||!Array.isArray(e.choices)||e.choices.length<2||!Number.isInteger(e.correct)||e.correct<0||e.correct>=e.choices.length)fail(`Invalid exercise answer: ${task.id}`);
   for(const value of [...e.evidence,...e.choices])bilingual(value,`${task.id}/exercise`);
  }
 }
}
