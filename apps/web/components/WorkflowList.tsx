"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WorkflowDef } from "@/lib/workflows";
import { resourceDatabase } from "@/lib/resource-search";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const indexedTools = new Set(resourceDatabase.resources.map((tool) => tool.name.toLowerCase()));

export default function WorkflowList({ workflows, onToolSearch }: {
  workflows: WorkflowDef[];
  onToolSearch?: (toolName: string) => void;
}) {
  const { dict, locale } = useLocale();
  if (!workflows.length) return <p className="resource-muted py-12">{dict.workflow.noWorkflows}</p>;

  return (
    <div className="workflow-list">
      {workflows.map((workflow) => (
        <article className="workflow-list-item" key={workflow.id}>
          <div className="workflow-list-main">
            <Link className="workflow-title-link" href={`/workflows/${workflow.id}`}>
              <h2>{workflow.title}</h2><ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="workflow-subtitle">{workflow.subtitle}</p>
            <p className="resource-muted mt-3">{workflow.summary}</p>
            <div className="workflow-meta" aria-label={locale === "zh-TW" ? "流程資訊" : "Workflow information"}>
              <span>{dict.labels.difficulty[workflow.difficulty] ?? workflow.difficulty}</span>
              <span>{workflow.estimated_time}</span>
              <span>{t(dict.workflow.stepsCount, { n: workflow.steps.length })}</span>
              <span>{dict.labels.riskLevel[workflow.risk_level] ?? workflow.risk_level}</span>
            </div>
            <div className="workflow-safety">
              {workflow.ethical_checkpoint.badges.map((badge) => <span key={badge}>{dict.labels.safetyBadge[badge] ?? badge}</span>)}
            </div>
          </div>
          <div className="workflow-tools">
            <p>{dict.workflow.tools}</p>
            <div>
              {workflow.recommended_tools.slice(0, 4).map((name) => {
                const indexed = indexedTools.has(name.toLowerCase());
                if (!indexed) return <span className="workflow-tool-name" title={dict.common.notIndexed} key={name}>{name}</span>;
                return onToolSearch ? (
                  <button type="button" className="workflow-tool-link" key={name} onClick={() => onToolSearch(name)}>{name}</button>
                ) : (
                  <Link className="workflow-tool-link" href={`/directory?q=${encodeURIComponent(name)}`} key={name}>{name}</Link>
                );
              })}
              {workflow.recommended_tools.length > 4 && <span className="workflow-tool-name">{t(dict.workflow.moreTools, { n: workflow.recommended_tools.length - 4 })}</span>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
