"use client";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
export default function AboutContent() {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  return (
    <main className="resource-learn mx-auto w-full max-w-3xl flex-1 px-5 py-12">
      <p className="resource-eyebrow">OSINT Hub</p>
      <h1 className="text-3xl mb-6">
        {zh ? "關於這個專案" : "About this project"}
      </h1>
      <p className="resource-lead">
        {zh
          ? "幫助不熟悉 OSINT 的人理解公開資訊查證，並用簡單關鍵詞找到合適的網站和工具。"
          : "Helping people new to OSINT understand public-information research and find useful websites and tools with everyday keywords."}
      </p>
      <section className="mt-8">
        <h2 className="text-xl mb-3">
          {zh ? "我們提供什麼" : "What you can find here"}
        </h2>
        <p className="resource-muted">
          {zh
            ? "資源推薦、操作起點、適用範圍和查證方法。本網站不提供人物或企業的調查結論。來源網站的資料覆蓋、價格和可用性可能改變。"
            : "Resource suggestions, first steps, coverage notes and verification methods. This site does not provide investigative findings about people or companies. Source coverage, pricing and availability can change."}
        </p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl mb-3">
          {zh ? "如何負責任地使用" : "Responsible use"}
        </h2>
        <p className="resource-muted">
          {zh
            ? "只使用合法可取得的公開資訊，遵守來源網站的使用條款，尊重隱私。不以工具進行未授權存取、跟蹤或騷擾。公開搜尋結果只是線索，請交叉查證。"
            : "Use lawfully accessible public information, follow source terms and respect privacy. Do not use resources for unauthorized access, stalking or harassment. Public search results are leads that need corroboration."}
        </p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl mb-3">
          {zh ? "資料與來源" : "Data and sources"}
        </h2>
        <p className="resource-muted">
          {zh
            ? "工具資料以 Awesome OSINT For Everything 等公開資源清單為起點。工具介紹保留來源和審核狀態；關鍵詞與入門操作說明由本專案整理。"
            : "The collection starts from public resource lists including Awesome OSINT For Everything. Resource details retain source attribution and review status; keyword mappings and introductory guidance are maintained in this project."}
        </p>
        <a
          className="resource-text-link"
          href="https://github.com/Astrosp/Awesome-OSINT-For-Everything"
          target="_blank"
          rel="noopener noreferrer"
        >
          Awesome OSINT For Everything
        </a>
      </section>
      <section className="mt-8">
        <h2 className="text-xl mb-3">
          {zh
            ? "引用與機器可讀資料"
            : "Attribution and machine-readable content"}
        </h2>
        <p className="resource-muted">
          {zh
            ? "引用時請註明 OSINT Hub，並附上使用的頁面網址及查閱日期。"
            : "When citing this site, credit OSINT Hub and include the page URL and your access date."}
        </p>
        <div className="resource-chips mt-3">
          <a className="resource-chip" href="/llms.txt">
            llms.txt
          </a>
          <a className="resource-chip" href="/llms-full.txt">
            llms-full.txt
          </a>
          <a className="resource-chip" href="/sitemap.xml">
            sitemap.xml
          </a>
        </div>
      </section>
      <div className="flex flex-wrap gap-5 mt-10">
        <Link className="resource-text-link" href="/search">
          {zh ? "開始找資源" : "Find resources"}
        </Link>
        <Link className="resource-text-link" href="/learn">
          {zh ? "認識 OSINT" : "Learn OSINT"}
        </Link>
      </div>
    </main>
  );
}
