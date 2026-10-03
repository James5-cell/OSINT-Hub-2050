"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export default function ResourceSearchBox({
  query = "",
  directory = false,
}: {
  query?: string;
  directory?: boolean;
}) {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  const router = useRouter();
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  return (
    <form
      className="resource-search-form"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = draft.trim();
        router.push(
          `${directory ? "/directory" : "/search"}${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        );
      }}
    >
      <label htmlFor="resource-query" className="sr-only">
        {zh ? "輸入關鍵詞或工具名稱" : "Enter a keyword or resource name"}
      </label>
      <Search size={22} aria-hidden="true" />
      <input
        id="resource-query"
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={
          zh
            ? "試試：公司、人名、網址、圖片"
            : "Try company, person, website or image"
        }
        autoComplete="off"
      />
      <button className="resource-primary" type="submit">
        <span>{zh ? "找資源" : "Find resources"}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
