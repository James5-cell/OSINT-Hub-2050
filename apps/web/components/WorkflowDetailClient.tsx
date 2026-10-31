"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import type { WorkflowDef } from "@/lib/workflows";
import { getWorkflowById } from "@/lib/workflows";
import { resourceDatabase } from "@/lib/resource-search";
import { useLocale } from "@/lib/locale-context";
import { t, DICT } from "@/lib/i18n";

const toolsByName = new Map(resourceDatabase.resources.map((tool) => [tool.name.toLowerCase(), tool]));
const categoryIds = new Map(Object.entries(DICT.en.categories).map(([id, category]) => [category.name.toLowerCase(), id]));

function ToolLinks({ names }: { names: string[] }) {
  const { dict } = useLocale();
  return <div className="workflow-tool-links">{names.map((name) => {
    const tool = toolsByName.get(name.toLowerCase());
    return tool ? <a className="workflow-tool-link" href={tool.url} target="_blank" rel="noopener noreferrer" key={name}>{name}<ExternalLink size={13} aria-hidden="true" /></a>
      : <span className="workflow-tool-name" title={dict.common.notIndexed} key={name}>{name}</span>;
  })}</div>;
}

export default function WorkflowDetailClient({ workflow: baseWorkflow }: { workflow: WorkflowDef }) {
  const { dict, locale } = useLocale();
  const wf = getWorkflowById(baseWorkflow.id, locale) ?? baseWorkflow;
  const zh = locale === "zh-TW";
  useEffect(() => { document.title = `${wf.title} — OSINT Hub`; }, [wf.title]);
  return (
    <main className="resource-learn workflow-detail mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:py-14">
      <nav className="workflow-breadcrumb" aria-label={zh ? "麵包屑導覽" : "Breadcrumb"}>
        <Link href="/">{zh ? "首頁" : "Home"}</Link><span aria-hidden="true">/</span>
        <Link href="/workflows">{dict.workflow.allWorkflows}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{wf.title}</span>
      </nav>
      <header className="workflow-detail-header">
        <h1>{wf.title}</h1>
        <p className="workflow-subtitle mt-3">{wf.subtitle}</p>
        <p className="resource-muted mt-4">{wf.summary}</p>
        <div className="workflow-meta">
          <span>{dict.labels.difficulty[wf.difficulty] ?? wf.difficulty}</span>
          <span>{wf.estimated_time}</span>
          <span>{t(dict.workflow.stepsCount, { n: wf.steps.length })}</span>
          <span>{dict.labels.riskLevel[wf.risk_level] ?? wf.risk_level}</span>
        </div>
      </header>
      <div className="workflow-context">
        <div><h2>{dict.workflow.startingPoint}</h2><p>{wf.starting_point}</p></div>
        <div><h2>{dict.workflow.endGoal}</h2><p>{wf.end_goal}</p></div>
      </div>
      <section className="workflow-checkpoint">
        <h2>{dict.workflow.ethicalCheckpoint}</h2>
        <p>{wf.ethical_checkpoint.summary}</p>
        <div className="workflow-safety">{wf.ethical_checkpoint.badges.map((badge) => <span key={badge}>{dict.labels.safetyBadge[badge] ?? badge}</span>)}</div>
      </section>
      <section className="workflow-steps">
        <h2>{dict.workflow.investigationSteps.replace(/^\/\/\s*/, "")}</h2>
        <ol>
          {wf.steps.map((step, i) => <li className="workflow-step" key={step.step_number}>
            <div className="workflow-step-heading"><span aria-hidden="true">{i + 1}</span><div><h3>{step.title}</h3><p>{step.objective}</p></div></div>
            <dl className="workflow-step-details">
              <div><dt>{dict.workflow.whatToDo}</dt><dd>{step.what_to_do}</dd></div>
              {step.tools.length > 0 && <div><dt>{dict.workflow.tools}</dt><dd><ToolLinks names={step.tools} /></dd></div>}
              <div><dt>{dict.workflow.whatToLookFor}</dt><dd>{step.what_to_look_for}</dd></div>
              <div><dt>{dict.workflow.commonPitfall}</dt><dd>{step.pitfalls}</dd></div>
              {step.safety_notes && <div><dt>{dict.workflow.safetyNote}</dt><dd>{step.safety_notes}</dd></div>}
            </dl>
          </li>)}
        </ol>
      </section>
      <section className="workflow-more">
        {wf.related_tools.length > 0 && <div><h2>{dict.workflow.relatedTools}</h2><ToolLinks names={wf.related_tools} /></div>}
        {wf.related_categories.length > 0 && <div><h2>{dict.workflow.relatedCategories}</h2><div className="workflow-tool-links">{wf.related_categories.map((name) => {
          const id = categoryIds.get(name.toLowerCase());
          return id ? <Link className="workflow-tool-link" key={name} href={`/?category=${encodeURIComponent(id)}`}>{dict.categories[id]?.name ?? name}</Link> : <span className="workflow-tool-name" key={name}>{name}</span>;
        })}</div></div>}
        {wf.user_groups.length > 0 && <div><h2>{dict.workflow.forGroups}</h2><p>{wf.user_groups.join(" · ")}</p></div>}
        {wf.signals.length > 0 && <div><h2>{dict.workflow.signals}</h2><p>{wf.signals.join(" · ")}</p></div>}
        <div><h2>{dict.workflow.metadata}</h2><p>{dict.workflow.publicSafe}: {wf.public_safe ? dict.workflow.yes : dict.workflow.no} · {dict.workflow.authNeeded}: {wf.requires_authorization ? dict.workflow.yes : dict.workflow.no}</p></div>
      </section>
      <Link className="resource-text-link mt-8" href="/workflows">{dict.workflow.backToWorkflows}</Link>
    </main>
  );
}
