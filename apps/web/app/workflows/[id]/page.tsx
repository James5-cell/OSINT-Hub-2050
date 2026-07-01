import { notFound } from "next/navigation";
import { WORKFLOWS, getWorkflowById } from "@/lib/workflows";
import WorkflowDetailClient from "@/components/WorkflowDetailClient";

/* ── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  return WORKFLOWS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wf = getWorkflowById(id);
  if (!wf) return { title: "Workflow not found" };
  return {
    title:       wf.title,
    description: wf.summary,
    openGraph: {
      title:       `${wf.title} — OSINT Hub`,
      description: wf.summary,
    },
    twitter: {
      card:        "summary",
      title:       `${wf.title} — OSINT Hub Workflow`,
      description: wf.summary,
    },
  };
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wf = getWorkflowById(id);
  if (!wf) notFound();

  /**
   * Pass the canonical EN workflow to the client component.
   * WorkflowDetailClient reads the zh-TW overlay at runtime via useLocale()
   * and merges it on the client side, keeping static export compatible.
   */
  return <WorkflowDetailClient workflow={wf} />;
}
