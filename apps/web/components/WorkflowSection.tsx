"use client";

import type { Difficulty, TargetType, FilterState } from "@/lib/types";
import { EMPTY_FILTERS } from "@/lib/types";

interface Workflow {
  id: string;
  title: string;
  objective: string;
  difficulty: Difficulty;
  signals: TargetType[];
  tools: string[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: "username",
    title: "Username Investigation",
    objective: "Enumerate an account's presence across platforms and build a social footprint.",
    difficulty: "beginner",
    signals: ["username", "social-media", "person"],
    tools: ["Sherlock", "WhatsMyName", "Tookie-OSINT"],
  },
  {
    id: "domain-recon",
    title: "Domain Reconnaissance",
    objective: "Map the infrastructure, certificate records, and subdomain exposure of a target domain.",
    difficulty: "intermediate",
    signals: ["domain", "ip", "network"],
    tools: ["SpiderFoot", "theHarvester", "Censys"],
  },
  {
    id: "social-verify",
    title: "Social Media Verification",
    objective: "Verify the authenticity of an account or claim using cross-platform signals.",
    difficulty: "beginner",
    signals: ["social-media", "person", "image"],
    tools: ["WhatsMyName", "PimEyes", "Sherlock"],
  },
  {
    id: "image-verify",
    title: "Image Verification",
    objective: "Extract metadata, verify origin, and cross-reference images against public databases.",
    difficulty: "beginner",
    signals: ["image", "geolocation", "person"],
    tools: ["ExifTool", "PimEyes"],
  },
  {
    id: "exposure-review",
    title: "Defensive Exposure Review",
    objective: "Audit your organization's authorized public-facing footprint and reduce attack surface.",
    difficulty: "intermediate",
    signals: ["domain", "ip", "network", "organization"],
    tools: ["Shodan", "Censys", "SpiderFoot"],
  },
];

const DIFF_COLOR: Record<Difficulty, string> = {
  beginner:     "var(--verified)",
  intermediate: "var(--accent)",
  advanced:     "var(--warning)",
  unknown:      "var(--muted)",
};

const DIFF_BG: Record<Difficulty, string> = {
  beginner:     "var(--verified-faint)",
  intermediate: "var(--accent-faint)",
  advanced:     "var(--warning-faint)",
  unknown:      "transparent",
};

interface WorkflowSectionProps {
  onWorkflowSelect: (filters: Partial<FilterState>) => void;
}

export default function WorkflowSection({ onWorkflowSelect }: WorkflowSectionProps) {
  function handleStart(wf: Workflow) {
    onWorkflowSelect({
      ...EMPTY_FILTERS,
      target_types: wf.signals as TargetType[],
    });
  }

  return (
    <section
      id="workflows"
      className="py-14 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-screen-xl px-5">
        <div className="mb-8">
          <p
            className="text-xs mb-1.5"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            02 — Starter Workflows
          </p>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
            Common investigation patterns
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Structured starting points. Each workflow surfaces relevant tools.
          </p>
        </div>

        <div className="space-y-2">
          {WORKFLOWS.map((wf, i) => (
            <div
              key={wf.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-md px-5 py-4 border transition-colors animate-slide-up stagger-${Math.min(i + 1, 5)}`}
              style={{
                background:   "var(--card)",
                borderColor:  "var(--border)",
              }}
            >
              <span
                className="hidden sm:block w-7 shrink-0 text-sm tabular-nums"
                style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text)" }}>
                  {wf.title}
                </p>
                <p className="text-xs leading-snug" style={{ color: "var(--muted)" }}>
                  {wf.objective}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 sm:w-44 shrink-0">
                {wf.signals.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--surface)",
                      color: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "3px",
                      padding: "1px 5px",
                      fontSize: "0.58rem",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className="px-2 py-0.5 rounded"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: DIFF_BG[wf.difficulty],
                    color:      DIFF_COLOR[wf.difficulty],
                    border:     `1px solid ${DIFF_COLOR[wf.difficulty]}33`,
                    fontSize:   "0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {wf.difficulty}
                </span>
                <button
                  type="button"
                  onClick={() => handleStart(wf)}
                  className="text-xs px-3 py-1.5 rounded transition-all"
                  style={{
                    fontFamily:  "var(--font-mono)",
                    background:  "var(--accent-faint)",
                    color:       "var(--accent)",
                    border:      "1px solid rgba(125,211,252,0.2)",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent-dim)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(125,211,252,0.2)")
                  }
                >
                  Find tools →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          {WORKFLOWS.map((wf) => (
            <span
              key={wf.id}
              className="text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
            >
              <span style={{ color: "var(--muted)" }}>{wf.title}:</span>{" "}
              {wf.tools.join(" · ")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
