"use client";

import type { Tool } from "@/lib/types";
import ToolCard from "./ToolCard";
import { useLocale } from "@/lib/locale-context";

interface ToolGridProps {
  tools: Tool[];
  onDetails: (tool: Tool) => void;
}

export default function ToolGrid({ tools, onDetails }: ToolGridProps) {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  if (tools.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        role="status"
        aria-live="polite"
      >
        <p
          className="text-2xl font-semibold mb-2"
          style={{ color: "var(--faint)" }}
        >
          {zh ? "沒有符合的工具" : "No matching tools"}
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {zh ? "試試其他關鍵詞或清除篩選。" : "Try another keyword or clear your filters."}
        </p>
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label={zh ? `工具清單，共 ${tools.length} 筆` : `Tool list, ${tools.length} results`}
      className="grid gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
      }}
    >
      {tools.map((tool, index) => (
        <div key={tool.id} role="listitem">
          <ToolCard tool={tool} index={index} onDetails={onDetails} />
        </div>
      ))}
    </div>
  );
}
