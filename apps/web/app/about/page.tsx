import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.205044.xyz";

export const metadata: Metadata = {
  title: "About & Ethics Policy — OSINT Hub",
  description: "Learn about OSINT Hub's mission, E-E-A-T background, passive reconnaissance standards, legal compliance, and citation guidelines.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About & Ethics Policy — OSINT Hub",
    description: "Learn about OSINT Hub's mission, E-E-A-T background, passive reconnaissance standards, legal compliance, and citation guidelines.",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About OSINT Hub & Ethics Policy",
    "description": "Educational, defensive, and lawful open-source intelligence research framework.",
    "url": `${SITE_URL}/about`,
    "publisher": {
      "@type": "Organization",
      "name": "OSINT Hub",
      "url": SITE_URL
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 text-slate-800 dark:text-slate-100">
      <JsonLd data={aboutSchema} />
      
      <header className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          About OSINT Hub & Ethics Policy
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A scenario-based index of public-source intelligence tools and passive investigation playbooks for research, verification, and defensive intelligence workflows.
        </p>
      </header>

      <div className="space-y-10 leading-relaxed text-slate-700 dark:text-slate-300">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 border-l-4 border-indigo-500 pl-3">
            Mission & E-E-A-T Framework
          </h2>
          <p>
            <strong>OSINT Hub</strong> was established to provide security researchers, investigative journalists, threat intelligence analysts, and legal professionals with a structured, passive-first framework for open-source intelligence (OSINT).
          </p>
          <p>
            We enforce strict standards of <strong>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T)</strong>. Every tool indexed and every investigation playbook published undergoes rigorous review to ensure all referenced sources rely on non-intrusive, publicly accessible data.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 border-l-4 border-indigo-500 pl-3">
            Ethical Principles & Passive Methodology
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">1. Passive-First Principle</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All playbooks prioritize third-party cached data (e.g., WHOIS history, certificate transparency logs, web archives) over direct target infrastructure probing.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">2. Lawful & Authorized Use</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Active scanning, unauthorized access, stalking, or harassment are strictly prohibited. Tools marked with caution badges require explicit authorization.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">3. Privacy Respect</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Investigative evidence must differentiate between corporate entities and non-public individuals, maintaining privacy protections.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">4. Verification & Defense</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our tools serve defensive security, breach remediation, fact-checking, and journalistic verification.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 border-l-4 border-indigo-500 pl-3">
            Academic & Generative Citation Guide
          </h2>
          <p>
            When referencing OSINT Hub in academic papers, threat intelligence reports, or AI model responses, please cite using the standard canonical format:
          </p>
          <div className="p-4 rounded border font-mono text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-x-auto text-slate-800 dark:text-slate-200">
            OSINT Hub. (2026). Operational Intelligence Index & Guided Playbooks. Retrieved from https://www.205044.xyz
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 border-l-4 border-indigo-500 pl-3">
            Machine Discovery & AI Crawlability
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            OSINT Hub natively supports Generative Engine Optimization (GEO). We provide open machine-readable endpoints for AI agents and LLM search models:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-400">
            <li><a href="/llms.txt" className="text-indigo-600 dark:text-indigo-400 underline">llms.txt</a> — Standard LLM Site Map</li>
            <li><a href="/llms-full.txt" className="text-indigo-600 dark:text-indigo-400 underline">llms-full.txt</a> — Complete LLM Knowledge Feed</li>
            <li><a href="/sitemap.xml" className="text-indigo-600 dark:text-indigo-400 underline">sitemap.xml</a> — XML Sitemap</li>
            <li><a href="/robots.txt" className="text-indigo-600 dark:text-indigo-400 underline">robots.txt</a> — Crawler Permissions</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
