"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import ResourceSearchBox from "./ResourceSearchBox";
import KeywordChips from "./KeywordChips";

export default function IndexView() {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  const paths = [
    {
      href: "/learn",
      title: zh ? "認識公開資訊查證" : "Learn the basics",
      description: zh ? "了解如何選擇來源、比較線索和記錄證據。" : "Learn how to choose sources, compare clues and record evidence.",
    },
    {
      href: "/tasks",
      title: zh ? "跟著任務練習" : "Work through a task",
      description: zh ? "從公司登記、舊照片等常見問題開始。" : "Practise with common questions, from company records to old images.",
    },
    {
      href: "/directory",
      title: zh ? "瀏覽工具目錄" : "Browse the directory",
      description: zh ? "搜尋工具名稱，或依費用和使用條件篩選。" : "Search by name or filter resources by access and experience.",
    },
  ];
  return (
    <div className="resource-home mx-auto w-full max-w-5xl px-5">
      <section className="resource-hero">
        <h1>{zh ? "從公開資訊開始查證。" : "Find the right place to start your research."}</h1>
        <p className="resource-lead">
          {zh
            ? "輸入想查證的對象，找到合適的公開資源，了解如何開始。"
            : "Find public sources for your question, understand what they offer and learn how to use them."}
        </p>
        <ResourceSearchBox />
        <div className="resource-popular">
          <span>{zh ? "或從這裡開始" : "Or start with"}</span>
          <KeywordChips />
        </div>
        <p className="resource-small">
          {zh
            ? "本站推薦資源，不會替你搜尋個人或公司的實際資料。"
            : "This site recommends resources; it does not look up people or companies for you."}
        </p>
      </section>
      <section className="resource-paths" aria-labelledby="explore-heading">
        <div className="resource-paths-heading">
          <h2 id="explore-heading">{zh ? "繼續探索" : "Explore further"}</h2>
          <p>{zh ? "選擇適合你的下一步。" : "Choose the next step that suits you."}</p>
        </div>
        <div>
          {paths.map((path) => (
            <Link href={path.href} className="resource-path" key={path.href}>
              <span><strong>{path.title}</strong><span>{path.description}</span></span>
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
