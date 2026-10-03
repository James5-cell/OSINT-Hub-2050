import { Suspense } from "react";
import ResourceFinder from "@/components/ResourceFinder";
import { buildPageMetadata } from "@/lib/seo";
export const metadata = buildPageMetadata({
  title: "Resource directory",
  path: "/directory",
  description:
    "Browse public-source research tools and websites, with access, difficulty and usage guidance.",
});
export default function DirectoryPage() {
  return (
    <Suspense
      fallback={<main className="flex-1 p-10">Loading resources…</main>}
    >
      <ResourceFinder directory />
    </Suspense>
  );
}
