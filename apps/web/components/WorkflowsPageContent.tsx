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
    <main className="resource-learn mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
      <nav aria-label={locale === "zh-TW" ? "麵包屑導覽" : "Breadcrumb"} className="workflow-breadcrumb">
        <Link href="/">{locale === "zh-TW" ? "首頁" : "Home"}</Link><span aria-hidden="true">/</span><span aria-current="page">{dict.nav.workflows}</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl mt-6">{dict.workflow.investigationPlaybooks}</h1>
      <p className="resource-muted mt-4 max-w-2xl">{dict.workflow.stepByStepDesc} {dict.workflow.passiveFirstDesc}</p>
      <p className="resource-small mt-3">{t(dict.workflow.workflowsAvailable, { n: workflows.length })}</p>
      <div className="mt-8"><WorkflowList workflows={workflows} /></div>
    </main>
  );
}
