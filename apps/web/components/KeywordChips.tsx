"use client";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import searchIntents from "@/data/search/intents.json";
export default function KeywordChips({ all = false }: { all?: boolean }) {
  const { locale } = useLocale();
  const intents = all
    ? searchIntents
    : searchIntents.filter((i) =>
        ["company", "person", "website", "image"].includes(i.id),
      );
  return (
    <div
      className="resource-chips"
      aria-label={locale === "zh-TW" ? "常用關鍵詞" : "Popular keywords"}
    >
      {intents.map((i) => (
        <Link
          className="resource-chip"
          href={`/search?q=${encodeURIComponent(i.label[locale])}`}
          key={i.id}
        >
          {i.label[locale]}
        </Link>
      ))}
    </div>
  );
}
