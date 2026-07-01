"use client";

import { getWorkflows } from "@/lib/workflows";
import { useLocale } from "@/lib/locale-context";
import WorkflowList from "./WorkflowList";

interface WorkflowsSectionProps {
  onToolSearch: (toolName: string) => void;
}

export default function WorkflowsSection({ onToolSearch }: WorkflowsSectionProps) {
  const { locale, dict } = useLocale();
  const workflows = getWorkflows(locale);

  return (
    <section
      id="workflows"
      className="py-14 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-screen-xl px-5">
        {/* Section header */}
        <div className="mb-8">
          <p
            className="text-xs mb-2"
            style={{
              fontFamily:    "var(--font-mono)",
              color:         "var(--faint)",
              fontSize:      "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {dict.workflow.sectionLabel}
          </p>
          <h2 className="text-2xl font-semibold mb-1" style={{ color: "var(--text)" }}>
            {dict.workflow.guidedWorkflows}
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {dict.workflow.stepByStepDesc} {dict.workflow.passiveFirstDesc}
          </p>
        </div>

        <WorkflowList workflows={workflows} onToolSearch={onToolSearch} />
      </div>
    </section>
  );
}
