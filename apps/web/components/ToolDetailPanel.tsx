"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { Tool } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";

function ReviewBadge({ status }: { status: string }) {
  const { dict } = useLocale();
  if (status === "manually_reviewed")
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--verified)" }}>
        <CheckCircle size={11} aria-hidden="true" /> {dict.tool.reviewReviewed}
      </span>
    );
  if (status === "rejected")
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--danger)" }}>
        <XCircle size={11} aria-hidden="true" /> {dict.tool.reviewRejected}
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
      <Clock size={11} aria-hidden="true" /> {dict.tool.reviewPending}
    </span>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="w-24 shrink-0 text-xs pt-0.5"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--faint)",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

interface ToolDetailPanelProps {
  tool: Tool | null;
  onClose: () => void;
}

export default function ToolDetailPanel({ tool, onClose }: ToolDetailPanelProps) {
  const { locale, dict, settings } = useLocale();
  const showFullEthics = settings.showFullEthicalGuidance;
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (tool) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [tool, handleKeyDown]);

  if (!tool) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: "rgba(7,9,12,0.8)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${tool.name} — ${dict.search.viewDetails}`}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-lg animate-panel-in overflow-hidden"
        style={{
          background: "var(--panel)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex-1 min-w-0 pr-4">
            {tool.source_section && (
              <p
                className="text-xs mb-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--faint)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {tool.source_section}
              </p>
            )}
            <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
              {tool.name}
            </h2>
          </div>
          <button
            type="button"
            aria-label={dict.common.closePanel}
            onClick={onClose}
            className="rounded p-1.5 transition-colors shrink-0"
            style={{ color: "var(--muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Ethical warning */}
          {tool.ethical_flag && (
            showFullEthics ? (
              /* Full guidance panel */
              <div
                className="flex gap-3 rounded-md p-4"
                style={{
                  background: "var(--danger-faint)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
                role="alert"
              >
                <AlertTriangle
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: "var(--danger)" }}
                  aria-hidden="true"
                />
                <div>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "var(--danger)" }}
                  >
                    {dict.tool.ethicsNote}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(249,115,22,0.75)" }}
                  >
                    {tool.ethics_note ?? dict.tool.legalNote}
                  </p>
                </div>
              </div>
            ) : (
              /* Compact indicator */
              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{
                  background:  "var(--danger-faint)",
                  border:      "1px solid rgba(249,115,22,0.18)",
                }}
                role="alert"
              >
                <AlertTriangle
                  size={11}
                  style={{ color: "var(--danger)", flexShrink: 0 }}
                  aria-hidden="true"
                />
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color:      "var(--danger)",
                    fontSize:   "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {dict.tool.ethicsNote}
                </p>
              </div>
            )
          )}

          {/* Description */}
          <div>
            <p
              className="text-xs mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--faint)",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {dict.tool.description}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {locale === "zh-TW"
                ? (tool.description_zh_tw ?? tool.description_en ?? tool.raw_description ?? dict.tool.noDescription)
                : (tool.description_en    ?? tool.description_zh_tw ?? tool.raw_description ?? dict.tool.noDescription)}
            </p>
          </div>

          {/* Use cases */}
          {tool.use_cases && tool.use_cases.length > 0 && (
            <div>
              <p
                className="text-xs mb-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--faint)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {dict.tool.useCases}
              </p>
              <ul className="space-y-2.5">
                {((locale === "zh-TW" ? tool.use_cases_zh_tw : tool.use_cases) ?? tool.use_cases ?? []).map((uc, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span
                      className="shrink-0 text-xs mt-0.5"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug" style={{ color: "var(--muted)" }}>
                      {uc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr style={{ borderColor: "var(--border)" }} />

          {/* Metadata fields */}
          <div className="space-y-3">
            {tool.pricing && (
              <FieldRow label={dict.tool.pricing}>
                <span
                  className="text-xs"
                  style={{
                    color:
                      tool.pricing === "paid"
                        ? "var(--warning)"
                        : tool.pricing === "free" || tool.pricing === "open-source"
                        ? "var(--verified)"
                        : "var(--muted)",
                  }}
                >
                  {dict.labels.pricing[tool.pricing] ?? tool.pricing}
                </span>
              </FieldRow>
            )}
            {tool.difficulty && (
              <FieldRow label={dict.tool.difficulty}>
                <span
                  className="text-xs"
                  style={{
                    color:
                      tool.difficulty === "advanced"
                        ? "var(--warning)"
                        : tool.difficulty === "beginner"
                        ? "var(--verified)"
                        : "var(--accent)",
                  }}
                >
                  {dict.labels.difficulty[tool.difficulty] ?? tool.difficulty}
                </span>
              </FieldRow>
            )}
            {tool.target_types && tool.target_types.length > 0 && (
              <FieldRow label={dict.tool.targets}>
                <div className="flex flex-wrap gap-1">
                  {tool.target_types.map((tt) => (
                    <span
                      key={tt}
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "var(--surface)",
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                        fontSize: "0.65rem",
                      }}
                    >
                      {dict.labels.targets[tt] ?? tt}
                    </span>
                  ))}
                </div>
              </FieldRow>
            )}
            {tool.platforms && tool.platforms.length > 0 && (
              <FieldRow label={dict.tool.platforms}>
                <div className="flex flex-wrap gap-1">
                  {tool.platforms.map((p) => (
                    <span
                      key={p}
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "var(--surface)",
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                        fontSize: "0.65rem",
                      }}
                    >
                      {dict.labels.platforms[p] ?? p}
                    </span>
                  ))}
                </div>
              </FieldRow>
            )}
            {tool.tags && tool.tags.length > 0 && (
              <FieldRow label={dict.tool.tags}>
                <div className="flex flex-wrap gap-1">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "var(--accent-faint)",
                        color: "var(--accent-dim)",
                        border: "1px solid rgba(125,211,252,0.12)",
                        fontSize: "0.65rem",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </FieldRow>
            )}
            {tool.review && (
              <FieldRow label={dict.tool.review}>
                <ReviewBadge status={tool.review.status} />
              </FieldRow>
            )}
          </div>

          {/* Source link — muted, subordinate attribution */}
          {tool.source_permalink && (
            <a
              href={tool.source_permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline transition-colors"
              style={{ color: "var(--faint)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--faint)")}
            >
              {locale === "zh-TW" ? dict.tool.originalSource : dict.tool.originalSource} ↗
            </a>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="shrink-0 border-t p-4"
          style={{ borderColor: "var(--border)" }}
        >
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${dict.tool.openTool} — ${tool.name}`}
            className="flex w-full items-center justify-center gap-2 rounded py-2.5 text-sm font-medium transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              background: "var(--accent-faint)",
              color: "var(--accent)",
              border: "1px solid rgba(125,211,252,0.2)",
            }}
            onMouseOver={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(125,211,252,0.1)";
              el.style.borderColor = "var(--accent-dim)";
            }}
            onMouseOut={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "var(--accent-faint)";
              el.style.borderColor = "rgba(125,211,252,0.2)";
            }}
          >
            {dict.tool.openTool}
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}
