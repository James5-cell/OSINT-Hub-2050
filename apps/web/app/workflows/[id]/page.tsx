import { notFound } from "next/navigation";
import { WORKFLOWS, getWorkflowById } from "@/lib/workflows";
import WorkflowDetailClient from "@/components/WorkflowDetailClient";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.205044.xyz";

/* ── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  return WORKFLOWS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wf = getWorkflowById(id);
  if (!wf) return { title: "Workflow not found" };
  const canonicalUrl = `${SITE_URL}/workflows/${id}`;
  return {
    title:       wf.title,
    description: wf.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title:       `${wf.title} — OSINT Hub`,
      description: wf.summary,
      url:         canonicalUrl,
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

  const pageUrl = `${SITE_URL}/workflows/${id}`;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": wf.title,
    "description": wf.summary,
    "url": pageUrl,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": wf.steps.map((step) => ({
      "@type": "HowToStep",
      "position": step.step_number,
      "name": step.title,
      "itemListElement": [
        {
          "@type": "HowToDirection",
          "text": `${step.objective}. ${step.what_to_do}`
        }
      ]
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "OSINT Hub",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Workflows",
        "item": `${SITE_URL}/workflows`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": wf.title,
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <JsonLd data={[howToSchema, breadcrumbSchema]} />
      <WorkflowDetailClient workflow={wf} />
    </>
  );
}
