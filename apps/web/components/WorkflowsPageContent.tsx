"use client";

import Link from "next/link";
import { getWorkflows } from "@/lib/workflows";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import WorkflowList from "./WorkflowList";

export default function WorkflowsPageContent() {
  const { dict, locale } = useLocale();
  const workflows = getWorkflows(locale);

  return (
    <main className="flex-1 flex flex-col">
      {/* Page header */}
      <div className="border-b py-10" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-screen-xl px-5">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 mb-5 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="transition-colors no-underline"
              style={{ color: "var(--faint)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
              onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
            >
              {dict.nav.index}
            </Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: "var(--muted)" }}>{dict.nav.workflows}</span>
          </nav>

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
          <h1 className="text-3xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            {dict.workflow.investigationPlaybooks}
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--muted)" }}>
            {dict.workflow.stepByStepDesc}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {dict.workflow.passiveFirstDesc}
          </p>
          <p
            className="mt-1 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
          >
            {t(dict.workflow.workflowsAvailable, { n: workflows.length })}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="mx-auto max-w-screen-xl px-5 py-10 w-full">
        <WorkflowList workflows={workflows} />
      </div>
    </main>
  );
}
