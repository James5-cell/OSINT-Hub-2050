"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import type { DefaultStartView } from "@/lib/locale-context";

/* ── Section wrapper ───────────────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="px-6 py-5">
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{
            fontFamily:    "var(--font-mono)",
            color:         "var(--faint)",
            fontSize:      "0.6rem",
            letterSpacing: "0.14em",
          }}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

/* ── Toggle row ─────────────────────────────────────────────── */
function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label:    string;
  hint?:    string;
  checked:  boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer select-none">
      <div className="min-w-0">
        <p className="text-sm" style={{ color: "var(--text)" }}>
          {label}
        </p>
        {hint && (
          <p
            className="mt-0.5 text-xs leading-relaxed"
            style={{ fontFamily: "var(--font-mono)", color: "var(--faint)", fontSize: "0.62rem" }}
          >
            {hint}
          </p>
        )}
      </div>
      {/* Toggle pill */}
      <span
        className="shrink-0 mt-0.5 relative inline-block rounded-full transition-all"
        style={{
          width:      "32px",
          height:     "18px",
          background: checked ? "var(--accent)" : "var(--border)",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <span
          className="absolute top-0.5 rounded-full transition-all"
          style={{
            width:      "14px",
            height:     "14px",
            background: "var(--bg)",
            left:       checked ? "15px" : "2px",
          }}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
    </label>
  );
}

/* ── Radio-style select row ─────────────────────────────────── */
function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2.5 text-sm" style={{ color: "var(--text)" }}>
        {label}
      </p>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="w-full flex items-center gap-2.5 rounded px-3 py-2 text-left transition-colors"
              style={{
                background:  active ? "var(--surface)" : "transparent",
                border:      `1px solid ${active ? "var(--accent-dim)" : "var(--border)"}`,
                cursor:      "pointer",
              }}
            >
              <span
                className="shrink-0 rounded-full border"
                style={{
                  width:       "12px",
                  height:      "12px",
                  background:  active ? "var(--accent)" : "transparent",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                }}
                aria-hidden="true"
              />
              <span
                className="text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  color:      active ? "var(--text)" : "var(--muted)",
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Disabled row ───────────────────────────────────────────── */
function DisabledRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <span
        className="rounded px-2 py-0.5 text-xs"
        style={{
          fontFamily:  "var(--font-mono)",
          background:  "var(--surface)",
          color:       "var(--faint)",
          border:      "1px solid var(--border)",
          fontSize:    "0.6rem",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Main drawer ────────────────────────────────────────────── */
interface SettingsDrawerProps {
  open:    boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { locale, setLocale, dict, settings, updateSettings } = useLocale();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const START_VIEW_OPTIONS: { value: DefaultStartView; label: string }[] = [
    { value: "index",     label: dict.settings.startViewIndex     },
    { value: "workflows", label: dict.settings.startViewWorkflows },
    { value: "search",    label: dict.settings.startViewSearch    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: "rgba(7,9,12,0.72)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.settings.title}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm animate-panel-in overflow-hidden"
        style={{
          background: "var(--panel)",
          borderLeft: "1px solid var(--border)",
          boxShadow:  "-4px 0 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <p
              className="text-xs mb-0.5"
              style={{
                fontFamily:    "var(--font-mono)",
                color:         "var(--faint)",
                fontSize:      "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {"// preferences"}
            </p>
            <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
              {dict.settings.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label={dict.settings.close}
            onClick={onClose}
            className="rounded p-1.5 transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--muted)")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── 1. Language ─────────────────────────────────── */}
          <Section title={dict.settings.language}>
            <div className="flex gap-2">
              {(LOCALES as readonly Locale[]).map((l) => {
                const active = l === locale;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l)}
                    aria-pressed={active}
                    className="flex-1 rounded py-2 text-sm font-medium transition-all"
                    style={{
                      fontFamily:  "var(--font-mono)",
                      background:  active ? "var(--accent)" : "var(--surface)",
                      color:       active ? "var(--bg)"     : "var(--muted)",
                      border:      `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      cursor:      "pointer",
                      fontSize:    "0.75rem",
                    }}
                    onMouseOver={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--accent-dim)"; }}
                    onMouseOut={(e)  => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ── 2. Safety Display ───────────────────────────── */}
          <Section title={dict.settings.safetyDisplay}>
            <ToggleRow
              label={dict.settings.showFullEthicalGuidance}
              hint={dict.settings.showFullEthicalGuidanceHint}
              checked={settings.showFullEthicalGuidance}
              onChange={(v) => updateSettings({ showFullEthicalGuidance: v })}
            />
          </Section>

          {/* ── 3. Navigation ───────────────────────────────── */}
          <Section title={dict.settings.navigation}>
            <SelectRow
              label={dict.settings.defaultStartView}
              value={settings.defaultStartView}
              options={START_VIEW_OPTIONS}
              onChange={(v) => updateSettings({ defaultStartView: v as DefaultStartView })}
            />
          </Section>

          {/* ── 4. Appearance ───────────────────────────────── */}
          <Section title={dict.settings.appearance}>
            <DisabledRow
              label={dict.settings.theme}
              value={dict.settings.themePlanned}
            />
          </Section>
        </div>

        {/* Footer hint */}
        <div
          className="shrink-0 border-t px-6 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color:      "var(--faint)",
              fontSize:   "0.58rem",
            }}
          >
            {dict.common.ethicsDisclaimer}
          </p>
        </div>
      </div>
    </>
  );
}
