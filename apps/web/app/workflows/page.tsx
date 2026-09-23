import type { Metadata } from "next";
import WorkflowsPageContent from "@/components/WorkflowsPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Workflows",
  description:
    "Step-by-step guided investigation playbooks for public-source research. Passive-first methodology. Safety checkpoints included.",
  path: "/workflows",
  ogTitle: "Investigation Workflows — OSINT Hub",
  ogDescription:
    "Guided OSINT investigation playbooks covering username, email, domain, IP, company, social media, and more.",
});

export default function WorkflowsPage() {
  return <WorkflowsPageContent />;
}
