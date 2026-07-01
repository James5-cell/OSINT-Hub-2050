import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search OSINT Hub's indexed tools, guided investigation workflows, and investigation categories.",
  openGraph: {
    title:       "Search — OSINT Hub",
    description: "Search tools, workflows, and investigation categories in OSINT Hub.",
  },
};

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
