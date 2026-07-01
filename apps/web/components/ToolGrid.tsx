"use client";

import type { Tool } from "@/lib/types";
import ToolCard from "./ToolCard";

interface ToolGridProps {
  tools: Tool[];
  onDetails: (tool: Tool) => void;
}

export default function ToolGrid({ tools, onDetails }: ToolGridProps) {
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
          No results
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Try adjusting your search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label={`Tool list, ${tools.length} results`}
      className="grid gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
