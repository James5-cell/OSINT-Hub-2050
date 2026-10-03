"use client";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
export default function SiteFooter() {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  return (
    <footer
      style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
    >
      <div className="mx-auto max-w-5xl px-5 py-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm">
          OSINT Hub ·{" "}
          {zh ? "從公開資訊開始查證" : "Start with public information"} · by
          postsoma-2050
        </p>
        <div className="flex gap-5">
          <Link className="resource-text-link" href="/about">
            {zh ? "關於與使用原則" : "About & responsible use"}
          </Link>
          <a
            className="resource-text-link"
            href="https://github.com/Astrosp/Awesome-OSINT-For-Everything"
            target="_blank"
            rel="noopener noreferrer"
          >
            {zh ? "資料來源" : "Source collection"}
          </a>
        </div>
      </div>
    </footer>
  );
}
