"use client";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { buildQueryTemplates } from "@/lib/query-templates.mjs";
export default function QueryWorkbench({ intent = "person" }: { intent?: string }) {
  const { locale } = useLocale(); const zh = locale === "zh-TW";
  const [subject,setSubject]=useState(""); const [context,setContext]=useState(""); const [domain,setDomain]=useState(""); const [status,setStatus]=useState("");
  const queries=buildQueryTemplates(subject,context,domain,intent);
  async function copy(value:string) { try { await navigator.clipboard.writeText(value); setStatus(zh?"已複製查詢":"Query copied"); } catch { setStatus(zh?"請選取查詢文字並複製":"Select and copy the query text"); } }
  return <details className="resource-workbench mt-5"><summary>{zh?"不知道怎麼下關鍵詞？建立查詢範本":"Need search terms? Build a query"}</summary>
    <p className="resource-muted mt-3">{zh?"先用名稱或原句，再補充單位、地區或其他名稱變體。以下範本適用於 Google 網頁搜尋；只在點擊外部搜尋時送出。":"Start with a name or exact claim, then add an organisation, location or name variant. Templates are for Google web search; sent only when you open a search."}</p>
    <div className="resource-form-grid mt-4">
      <label>{zh?"名稱、主題或原句":"Name, topic or claim"}<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder={zh?"例如：示例公司":"e.g. Example company"}/></label>
      <label>{zh?"補充線索（選填）":"Context (optional)"}<input value={context} onChange={e=>setContext(e.target.value)} placeholder={zh?"單位或地區":"Organisation or location"}/></label>
      <label>{zh?"限定網站（選填）":"Website domain (optional)"}<input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="example.org"/></label>
    </div>
    {domain && !/^(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}\/?$/i.test(domain.trim()) && <p className="resource-small mt-2">{zh?"請輸入網域，例如 example.org；不需要路徑。":"Use a domain such as example.org, without a path."}</p>}
    <div className="mt-4 space-y-3">{queries.map(q=><div className="resource-query" key={q.id}><div><strong>{q.id==="site"?(zh?"限定來源":"Limit source"):q.id==="document"?(zh?"尋找 PDF":"Find PDFs"):(zh?"完整名稱 + 線索":"Exact phrase + context")}</strong><code>{q.query}</code></div><div className="resource-chips"><button className="resource-secondary" onClick={()=>copy(q.query)}>{zh?"複製":"Copy"}</button><a className="resource-primary" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/search?q=${encodeURIComponent(q.query)}`}>{zh?"前往 Google":"Search Google"}</a></div></div>)}</div>
    <p className="resource-small mt-4">{zh?"縮小搜尋範圍不能保證正確，查無結果也不代表不存在。":"A narrower query does not guarantee accuracy. No result does not prove absence."} <a href="https://support.google.com/websearch/answer/2466433" target="_blank" rel="noopener noreferrer">{zh?"查詢語法說明":"Search syntax reference"}</a></p><p role="status" className="resource-small">{status}</p>
  </details>;
}
