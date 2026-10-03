"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import IndexView from "@/components/IndexView";
import dynamic from "next/dynamic";
const CategoryView = dynamic(() => import("@/components/CategoryView"));
import ToolDetailPanel from "@/components/ToolDetailPanel";
import type { Tool } from "@/lib/types";
// Keep existing category links from playbooks and bookmarks usable.
function HomeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const category = params.get("category");
  return (
    <main className="flex-1">
      {category ? (
        <CategoryView
          mode="target"
          categoryId={category}
          onBack={() => router.push("/")}
          onDetails={setTool}
        />
      ) : (
        <IndexView />
      )}
      <ToolDetailPanel tool={tool} onClose={() => setTool(null)} />
    </main>
  );
}
export default function HomePage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <HomeContent />
    </Suspense>
  );
}
