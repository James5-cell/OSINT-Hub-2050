import type { Metadata } from "next";
import WorkflowsPageContent from "@/components/WorkflowsPageContent";

export const metadata: Metadata = {
  title: "Workflows",
  description:
    "Step-by-step guided investigation playbooks for public-source research. Passive-first methodology. Safety checkpoints included.",
  openGraph: {
    title:       "Investigation Workflows — OSINT Hub",
    description: "8 guided OSINT investigation playbooks covering username, email, domain, IP, company, social media, and more.",
  },
};

export default function WorkflowsPage() {
  return <WorkflowsPageContent />;
}
