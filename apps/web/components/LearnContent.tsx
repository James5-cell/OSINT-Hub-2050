"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, CheckCheck } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import LearnPractice from "./LearnPractice";
import EvidenceNotebook from "./EvidenceNotebook";
import QueryWorkbench from "./QueryWorkbench";
export default function LearnContent() {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  const lessons = [
    {
      title: zh ? "先提出一個具體問題" : "Ask a specific question",
      text: zh
        ? "「這家公司在哪裡登記？」比「查這家公司」更容易找到合適的來源。先確定想核實的事實。"
        : "“Where is this company registered?” is easier to research than “Tell me about this company.” Decide which fact you want to verify.",
    },
    {
      title: zh
        ? "找來源，並了解它的範圍"
        : "Choose a source and understand its scope",
      text: zh
        ? "企業登記、新聞、網站存檔提供的資訊不同。官方登記適合查法律主體，新聞適合提供事件背景。"
        : "Registries, news and web archives answer different questions. Official registries help identify legal entities; reporting adds event context.",
    },
    {
      title: zh ? "比較獨立來源" : "Compare independent sources",
      text: zh
        ? "多個網站轉載同一篇文章，仍然可能只有一個來源。核對名稱、日期、地區和原始出處，注意同名或過時資訊。"
        : "Several websites copying one article may still be a single source. Compare names, dates, locations and original provenance; watch for namesakes and stale information.",
    },
    {
      title: zh
        ? "記錄你能證明的事情"
        : "Record what the evidence actually supports",
      text: zh
        ? "保存來源網址、查閱日期和支持結論的原文。把已核實的事實、推測和未知分開，並尊重個人隱私。"
        : "Keep the source URL, access date and passage supporting your conclusion. Separate verified facts, hypotheses and unknowns, while respecting personal privacy.",
    },
    {title: zh ? "分清線索與輸入條件" : "Distinguish clues and inputs", text: zh ? "姓名、使用者名稱、圖片和網域是不同入口。一般搜尋也無法完整覆蓋登記庫或需要表單查詢的資料。" : "Names, handles, images and domains are different inputs. General search also cannot fully cover registries or form-based databases."},
    {title: zh ? "逐步調整關鍵詞" : "Refine your keywords", text: zh ? "從完整名稱開始，加入地區或機構，再試其他拼寫與語言。一次修改一個條件，觀察範圍如何變化。" : "Start with the full name, add a place or organisation, then try spelling and language variants. Change one condition at a time."},
  ];
  return (
    <main className="resource-learn mx-auto w-full max-w-4xl flex-1 px-5 py-12">
      <p className="resource-eyebrow">
        {zh ? "從零開始" : "Start with the basics"}
      </p>
      <h1 className="text-3xl sm:text-4xl mb-5">
        {zh
          ? "公開資訊，怎麼變成可靠的判斷？"
          : "How can public information support a reliable conclusion?"}
      </h1>
      <p className="resource-lead">
        {zh
          ? "OSINT（開源情報）是利用公開可取得的資訊，進行查找、核實和分析。網站、公司登記、新聞和公開文件，都可能成為來源。"
          : "OSINT, or open-source intelligence, is the practice of finding, verifying and analysing publicly available information. Websites, registries, news and published documents can all be sources."}
      </p>
      <p className="resource-muted mt-4">
        {zh
          ? "公開可取得，不代表內容一定正確，也不代表可以任意使用。本網站幫你找來源和方法；結論需要根據證據判斷。"
          : "Publicly available information is not automatically accurate or unrestricted in use. This site helps you find sources and methods; conclusions still depend on the evidence."}
      </p>
      <section className="resource-lesson-grid mt-10">
        {lessons.map((lesson, i) => (
          <article key={lesson.title}>
            <span className="resource-eyebrow">0{i + 1}</span>
            <h2 className="text-xl mt-2 mb-3">{lesson.title}</h2>
            <p className="resource-muted">{lesson.text}</p>
          </article>
        ))}
      </section>
      <section className="resource-intro-card mt-8"><div><h2>{zh ? "想完整做一次？" : "Ready to work through a task?"}</h2><p>{zh ? "從十個常見問題開始，選來源、比較證據，最後留下有範圍的結論。" : "Choose one of ten common questions, compare evidence and record a bounded conclusion."}</p></div><Link className="resource-primary" href="/tasks">{zh ? "開始實作" : "Try a task"}<ArrowRight size={16}/></Link></section>
      <QueryWorkbench />
      <LearnPractice />
      <EvidenceNotebook />
      <details className="resource-example mt-10"><summary>{zh ? "展開公司查證示範" : "Expand company walkthrough"}</summary>
        <p className="resource-eyebrow">
          {zh ? "一起試一次" : "Try an example"}
        </p>
        <h2 className="text-2xl mb-4">
          {zh
            ? "核實一家公司的公開背景"
            : "Check a company’s public background"}
        </h2>
        <ol className="space-y-4">
          <li>
            <strong>
              {zh
                ? "1. 確認名稱與地區"
                : "1. Confirm the name and jurisdiction"}
            </strong>
            <p className="resource-muted">
              {zh
                ? "使用完整公司名稱，避免把同名企業混在一起。"
                : "Use the full legal name to avoid mixing up similarly named businesses."}
            </p>
          </li>
          <li>
            <strong>{zh ? "2. 查企業登記" : "2. Look up registration"}</strong>
            <p className="resource-muted">
              {zh
                ? "從資源推薦找到適用的登記來源，核對編號、狀態和申報日期。"
                : "Choose a registry with appropriate coverage and compare company number, status and filing dates."}
            </p>
          </li>
          <li>
            <strong>
              {zh
                ? "3. 比較官網與歷史頁面"
                : "3. Compare the website and its history"}
            </strong>
            <p className="resource-muted">
              {zh
                ? "核對聯絡方式和業務描述，記下不一致之處。登記存在不能證明企業值得信賴。"
                : "Compare contact details and business descriptions. Record inconsistencies; registration alone does not establish trustworthiness."}
            </p>
          </li>
        </ol>
        <div className="resource-chips mt-6">
          <Link
            className="resource-primary"
            href={`/search?q=${encodeURIComponent(zh ? "公司" : "company")}&goal=registration`}
          >
            {zh ? "找企業登記資源" : "Find registry resources"}
            <Search size={16} />
          </Link>
          <Link
            className="resource-secondary"
            href={`/search?q=${encodeURIComponent(zh ? "網站歷史" : "website history")}`}
          >
            {zh ? "找網站歷史資源" : "Find web archives"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </details>
      <section className="resource-intro-card mt-8">
        <CheckCheck size={28} aria-hidden="true" />
        <div>
          <h2>
            {zh ? "查證時，記住這三件事" : "Three checks to keep in mind"}
          </h2>
          <p>
            {zh
              ? "同名不等於同一個人；查無結果不等於不存在；多個轉載不等於多個獨立來源。"
              : "A matching name is not proof of identity. No result is not proof of absence. Multiple copies are not independent sources."}
          </p>
        </div>
      </section>
      <div className="flex flex-wrap gap-5 mt-10">
        <Link className="resource-text-link" href="/search">
          {zh ? "開始找資源" : "Find a resource"}
          <ArrowRight size={16} />
        </Link>
        <Link className="resource-text-link" href="/workflows">
          <BookOpen size={16} />
          {zh
            ? "進一步閱讀完整查證流程"
            : "Explore detailed investigation playbooks"}
        </Link>
      </div>
    </main>
  );
}
