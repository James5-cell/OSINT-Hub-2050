"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, CheckCheck } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import ResourceSearchBox from "./ResourceSearchBox";
import KeywordChips from "./KeywordChips";
export default function IndexView() {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  return (
    <div className="resource-home mx-auto w-full max-w-5xl px-5">
      <section className="resource-hero">
        <p className="resource-eyebrow">
          {zh
            ? "公開資訊 · 查證方法 · 實用資源"
            : "Public information. Useful resources. Better questions."}
        </p>
        <h1>
          {zh ? (
            <>
              用公開資訊，
              <br />
              <span>找到查證的起點。</span>
            </>
          ) : (
            <>
              Find a starting point.
              <br />
              <span>Follow the public information.</span>
            </>
          )}
        </h1>
        <p className="resource-lead">
          {zh
            ? "輸入你想了解的對象，我們幫你找到適合的網站，並告訴你怎麼開始。"
            : "Tell us what you want to research. Find useful websites, understand what they offer, and learn how to start."}
        </p>
        <ResourceSearchBox />
        <div className="resource-popular">
          <span>{zh ? "從這裡開始" : "Start with"}</span>
          <KeywordChips />
        </div>
        <p className="resource-small">
          {zh
            ? "這裡推薦公開資源，不會替你搜尋個人或公司的實際資料。"
            : "We recommend public resources. We do not look up people or companies for you."}
        </p>
      </section>
      <section
        className="resource-how"
        aria-label={zh ? "使用方法" : "How it works"}
      >
        {[
          {
            icon: Search,
            title: zh ? "說出你想查什麼" : "Start with a question",
            text: zh
              ? "公司、人名、圖片或網址，不需要先懂專業術語。"
              : "A company, person, image or website. No specialist terminology needed.",
          },
          {
            icon: ArrowRight,
            title: zh ? "找到合適的入口" : "Choose a useful source",
            text: zh
              ? "了解推薦理由、適用範圍和第一步操作。"
              : "See why a resource fits, where it applies and how to use it.",
          },
          {
            icon: CheckCheck,
            title: zh ? "比較線索，再下結論" : "Compare before concluding",
            text: zh
              ? "核對不同來源，分清楚線索和已證實的資訊。"
              : "Check independent sources and distinguish a lead from a verified fact.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={22} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="resource-intro-card">
        <BookOpen size={30} aria-hidden="true" />
        <div>
          <h2>{zh ? "第一次聽說 OSINT？" : "New to OSINT?"}</h2>
          <p>
            {zh
              ? "OSINT 是利用公開資訊進行查找、核實和分析。從一個簡單案例開始，了解它能做什麼。"
              : "Open-source intelligence means finding, verifying and analysing publicly available information. Learn with a simple example."}
          </p>
        </div>
        <Link className="resource-secondary" href="/learn">
          {zh ? "認識 OSINT" : "Learn the basics"}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <section className="resource-intro-card mt-6"><div><h2>{zh ? "有問題，但不知道怎麼查？" : "Have a question but need a method?"}</h2><p>{zh ? "公司登記、舊照片、新聞說法或網站歷史，跟著任務一步步查證。" : "Work through company records, old images, news claims or website history."}</p></div><Link className="resource-secondary" href="/tasks">{zh ? "選一個查證任務" : "Choose a research task"}<ArrowRight size={18}/></Link></section>
      <p className="resource-directory-link">
        <Link href="/directory">
          {zh
            ? "已經知道要找什麼？瀏覽完整工具目錄"
            : "Already know what you need? Browse the resource directory"}{" "}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}
