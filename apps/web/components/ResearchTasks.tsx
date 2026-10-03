"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import {resourceDatabase} from "@/lib/resource-search";
import rawTasks from "@/data/search/tasks.json";
import EvidenceNotebook from "./EvidenceNotebook";
import QueryWorkbench from "./QueryWorkbench";
import type {LocalText} from "@/lib/resource-search/types";
type Task={id:string;title:LocalText;intent:string;goal:string;primary:string[];fallback:string;inputs:LocalText;steps:{title:LocalText;text:LocalText}[];no_result:LocalText;exercise?:{title:LocalText;evidence:LocalText[];choices:LocalText[];correct:number;feedback:LocalText}};
const tasks=rawTasks as Task[];
export default function ResearchTasks(){
 const {locale}=useLocale();const zh=locale==="zh-TW";const params=useSearchParams();const router=useRouter();
 const task=tasks.find(t=>t.id===params.get("task"))??tasks[0];
 const [checks,setChecks]=useState<Record<string,boolean>>({});const [answers,setAnswers]=useState<Record<string,number>>({});
 const exercise=task.exercise;const answer=answers[task.id];
 function source(id:string){const r=resourceDatabase.resources.find(r=>r.id===id);return r&&<li key={id}><a className="resource-text-link" href={r.url} target="_blank" rel="noopener noreferrer">{r.name} ↗</a><span className="resource-small"> · {r.guide?.regions.map(region=>({global:zh?"跨地區":"Global",uk:zh?"英國":"UK",us:zh?"美國":"US",cn:zh?"中國大陸":"Mainland China",tw:zh?"台灣":"Taiwan",hk:zh?"香港":"Hong Kong"}[region])).filter(Boolean).join(" / ")|| (zh?"請核對來源涵蓋範圍":"Check source coverage")}</span></li>;}
 const progress=task.steps.filter((_,i)=>checks[`${task.id}-${i}`]).length;
 return <main className="resource-learn mx-auto w-full max-w-4xl flex-1 px-5 py-10">
  <p className="resource-eyebrow">{zh?"從問題到有證據的回答":"From a question to an evidenced answer"}</p><h1 className="text-3xl sm:text-4xl">{zh?"跟著完成一次查證":"Work through a research task"}</h1><p className="resource-muted mt-4">{zh?"選一個日常問題，按步驟選來源、收集、比較和記錄。範例資料是虛構的；勾選步驟只表示你完成了操作，不代表結論已被系統核實。":"Choose a practical question, then collect, compare and record. Example evidence is fictional; checking a step records your progress, not system verification of your conclusion."}</p>
  <label className="resource-task-select mt-6">{zh?"你想解決什麼問題？":"What would you like to check?"}<select value={task.id} onChange={e=>router.push(`/tasks?task=${e.target.value}`,{scroll:false})}>{tasks.map(t=><option key={t.id} value={t.id}>{t.title[locale]}</option>)}</select></label>
  <section className="resource-example mt-6"><h2 className="text-2xl">{task.title[locale]}</h2><p className="resource-muted mt-3"><strong>{zh?"先準備：":"Have ready: "}</strong>{task.inputs[locale]}</p><div className="resource-form-grid mt-5"><div><h3 className="text-lg">{zh?"優先來源":"Start with"}</h3><ul className="space-y-3 mt-3">{task.primary.map(source)}</ul></div><div><h3 className="text-lg">{zh?"替代路徑":"Alternative path"}</h3><ul className="mt-3">{source(task.fallback)}</ul><p className="resource-small mt-3">{zh?"來源沒有涵蓋或查不到時，換查詢方式或找原始資料；替代來源不保證提供相同記錄。":"If coverage is missing, try another query or an original source. An alternative may not contain equivalent records."}</p></div></div><Link className="resource-secondary mt-5" href={`/search?intent=${task.intent}&goal=${task.goal}&q=${encodeURIComponent(task.title[locale])}`}>{zh?"查看適用工具與條件":"See tools and input requirements"}</Link></section>
  <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">{zh?"四步完成任務":"Four steps to work through"}</h2><span className="resource-small" role="status">{progress}/4 {zh?"操作已完成":"steps completed"}</span></div><ol className="space-y-4 mt-5">{task.steps.map((step,i)=><li className="resource-example" key={`${task.id}-${i}`}><label className="flex items-center gap-3"><input type="checkbox" checked={!!checks[`${task.id}-${i}`]} onChange={e=>setChecks(c=>({...c,[`${task.id}-${i}`]:e.target.checked}))}/><strong>{i+1}. {step.title[locale]}</strong></label><p className="resource-muted mt-3">{step.text[locale]}</p></li>)}</ol></section>
  <details className="resource-workbench mt-5"><summary>{zh?"查無結果，下一步怎麼做？":"No results — what next?"}</summary><p className="resource-muted mt-3">{task.no_result[locale]}</p><p className="resource-small mt-3">{zh?"一次改一個條件並記錄查過的來源。仍然沒有資料時，結論應是「目前未找到」，而不是「不存在」。":"Change one condition at a time and record sources checked. If nothing is found, conclude ‘not found so far’, rather than ‘does not exist’."}</p></details>
  <QueryWorkbench key={task.id} intent={task.intent}/>
  {exercise&&<section className="resource-example mt-8"><p className="resource-eyebrow">{zh?"動手比較證據":"Compare the evidence"}</p><h2 className="text-xl">{exercise.title[locale]}</h2><ol className="space-y-3 mt-4">{exercise.evidence.map((e,i)=><li className="resource-feedback" key={i}><strong>{zh?"材料":"Evidence"} {String.fromCharCode(65+i)}</strong><p>{e[locale]}</p></li>)}</ol><h3 className="text-lg mt-5">{zh?"哪個結論有證據支持？":"Which conclusion is supported?"}</h3><div className="space-y-3 mt-3">{exercise.choices.map((choice,i)=><button key={i} className="resource-choice" aria-pressed={answer===i} onClick={()=>setAnswers(a=>({...a,[task.id]:i}))}>{choice[locale]}</button>)}</div>{answer!==undefined&&<div role="status" className="resource-feedback mt-4"><strong>{answer===exercise.correct?(zh?"判斷正確":"Correct"):(zh?"這個結論超出了證據":"This goes beyond the evidence")}</strong><p>{exercise.feedback[locale]}</p><p className="mt-3"><strong>{zh?"有範圍的結論範例：":"Example of a bounded conclusion: "}</strong>{exercise.choices[exercise.correct][locale]}</p></div>}</section>}
  <EvidenceNotebook suggestedQuestion={task.title[locale]}/>
  <div className="resource-chips mt-8"><Link className="resource-text-link" href="/learn">{zh?"回到查證基礎":"Verification basics"}</Link><Link className="resource-text-link" href="/workflows">{zh?"閱讀進階流程":"Detailed workflows"}</Link></div>
 </main>;
}
