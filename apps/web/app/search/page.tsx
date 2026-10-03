import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./SearchClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Search",
  description:
    "Find suitable public-source research resources using everyday keywords, with practical first steps and verification guidance.",
  path: "/search",
  ogTitle: "Search — OSINT Hub",
  ogDescription:
    "Find public research resources and learn how to use them.",
});

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center">
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.75rem" }}>
            Loading…
          </p>
        </main>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
