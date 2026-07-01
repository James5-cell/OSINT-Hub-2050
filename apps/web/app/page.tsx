"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Tool } from "@/lib/types";
import { buildSearchIndex } from "@/lib/search";
import { allTools } from "@/lib/tools";

import ToolDetailPanel from "@/components/ToolDetailPanel";
import IndexView from "@/components/IndexView";
import CategoryView from "@/components/CategoryView";

/* ── View state ──────────────────────────────────────────────── */
type ViewState =
  | { kind: "index" }
  | { kind: "category"; categoryId: string };

function HomePageInner() {
  const searchParams = useSearchParams();
  const [view, setView]               = useState<ViewState>({ kind: "index" });
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => { buildSearchIndex(allTools); }, []);

  // Handle ?category= query param from search results links
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setView({ kind: "category", categoryId: cat });
  }, [searchParams]);

  useEffect(() => {
    if (view.kind !== "index") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const goIndex    = useCallback(() => setView({ kind: "index" }), []);
  const goCategory = useCallback((id: string) => setView({ kind: "category", categoryId: id }), []);

  const handleDetails = useCallback((tool: Tool) => setSelectedTool(tool), []);
  const handleClose   = useCallback(() => setSelectedTool(null), []);

  // Tool search navigates to /search route — passed down for workflow tool chips
  const handleToolSearch = useCallback((name: string) => {
    window.location.href = `/search?q=${encodeURIComponent(name)}`;
  }, []);

  return (
    <main className="flex-1 flex flex-col">
      {view.kind === "index" && (
        <IndexView
          onCategorySelect={goCategory}
          onToolSearch={handleToolSearch}
        />
      )}

      {view.kind === "category" && (
        <CategoryView
          mode="target"
          categoryId={view.categoryId}
          onBack={goIndex}
          onDetails={handleDetails}
        />
      )}

      <ToolDetailPanel tool={selectedTool} onClose={handleClose} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <HomePageInner />
    </Suspense>
  );
}
