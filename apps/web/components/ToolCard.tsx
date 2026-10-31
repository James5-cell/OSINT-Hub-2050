"use client";

import { ExternalLink } from "lucide-react";
import type { Tool } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";

export default function ToolCard({ tool, onDetails }: {
  tool: Tool;
  index?: number;
  onDetails: (tool: Tool) => void;
}) {
  const { locale, dict } = useLocale();
  const inactive = tool.is_active === false || tool.is_dead_link;
  const description = locale === "zh-TW"
    ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description ?? dict.tool.noDescription)
    : (tool.description_en ?? tool.description_zh_tw ?? tool.raw_description ?? dict.tool.noDescription);
  return (
    <article className="category-tool">
      <div className="category-tool-heading">
        <h2>{tool.name}</h2>
        <div className="category-tool-badges">
          {tool.ethical_flag && <span className="category-tool-caution">{dict.tool.caution}</span>}
          {inactive && <span>{dict.tool.offline}</span>}
        </div>
      </div>
      <p className="category-tool-description">{description}</p>
      <dl className="category-tool-meta">
        {!!tool.target_types?.length && <div><dt>{dict.tool.targets}</dt><dd>{tool.target_types.slice(0, 5).map((type) => dict.labels.targets[type] ?? type).join(" · ")}</dd></div>}
        {!!tool.platforms?.length && <div><dt>{dict.tool.platforms}</dt><dd>{tool.platforms.map((platform) => dict.labels.platforms[platform] ?? platform).join(" · ")}</dd></div>}
        {tool.difficulty && tool.difficulty !== "unknown" && <div><dt>{dict.tool.difficulty}</dt><dd>{dict.labels.difficulty[tool.difficulty]}</dd></div>}
        {tool.pricing && tool.pricing !== "free" && tool.pricing !== "open-source" && <div><dt>{dict.tool.pricing}</dt><dd>{dict.labels.pricing[tool.pricing]}</dd></div>}
      </dl>
      <div className="category-tool-actions">
        <button type="button" className="resource-text-link" aria-label={`${dict.tool.inspect} ${tool.name}`} onClick={() => onDetails(tool)}>{dict.tool.inspect}</button>
        <a className="resource-secondary" href={tool.url} target="_blank" rel="noopener noreferrer" aria-label={`${dict.tool.openTool} — ${tool.name}`}>{dict.tool.openTool}<ExternalLink size={15} aria-hidden="true" /></a>
      </div>
    </article>
  );
}
