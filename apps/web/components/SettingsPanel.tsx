"use client";

import { useEffect, useCallback } from "react";
import { X, Moon, Sun, Globe, ShieldAlert, LayoutGrid } from "lucide-react";
import { useTheme, type Theme }       from "@/lib/theme-context";
import { useLocale }                   from "@/lib/locale-context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import type { DefaultStartView }       from "@/lib/locale-context";

/* ════════════════════════════════════════════════════════════════
   Shared sub-components
   ════════════════════════════════════════════════════════════════ */

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 px-6 pt-5 pb-3"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <span style={{ color: "var(--faint)" }} aria-hidden="true">
        {icon}
      </span>
      <p
        className="text-xs font-semibold"
        style={{
          fontFamily:    "var(--font-mono)",
          color:         "var(--faint)",
          fontSize:      "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
        }}
      >
        {title}
      </p>
    </div>
  );
}

/** Two-button pill toggle — the same pattern as EN | 中文 */
function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options:  { value: T; label: string; icon?: React.ReactNode }[];
  value:    T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="flex rounded overflow-hidden border"
      style={{ borderColor: "var(--border)" }}
      role="group"
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            aria-label={opt.label}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs transition-colors"
            style={{
              fontFamily:  "var(--font-mono)",
              background:  active ? "var(--accent)" : "var(--surface)",
              color:       active ? "var(--bg)"     : "var(--muted)",
              borderRight: i < options.length - 1 ? "1px solid var(--border)" : undefined,
              cursor:      "pointer",
              fontSize:    "0.72rem",
              fontWeight:  active ? 600 : 400,
              transition:  "background 0.15s, color 0.15s",
            }}
            onMouseOver={(e) => { if (!active) e.currentTarget.style.color = "var(--text)"; }}
            onMouseOut={(e)  => { if (!active) e.currentTarget.style.color = "var(--muted)"; }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle switch row */
function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label:   string;
  hint?:   string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex items-start justify-between gap-4 cursor-pointer select-none"
    >
      <div className="min-w-0">
        <p className="text-sm leading-snug" style={{ color: "var(--text)" }}>
          {label}
        </p>
        {hint && (
          <p
            className="mt-0.5 text-xs leading-relaxed"
            style={{
              fontFamily: "var(--font-mono)",
              color:      "var(--faint)",
              fontSize:   "0.6rem",
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {/* Toggle pill */}
      <span
        className="shrink-0 mt-0.5 relative inline-flex rounded-full transition-colors"
        style={{
          width:      "34px",
          height:     "20px",
          background: checked ? "var(--accent)" : "var(--border)",
          flexShrink: 0,
          transition: "background 0.2s ease",
        }}
        aria-hidden="true"
      >
        <span
          className="absolute top-[3px] rounded-full"
          style={{
            width:      "14px",
            height:     "14px",
            background: "var(--bg)",
            left:       checked ? "17px" : "3px",
            transition: "left 0.2s ease",
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

/** Radio-style select */
function RadioSelect({
  value,
  options,
  onChange,
}: {
  value:   string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
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
              background:  active ? "var(--accent-faint)" : "transparent",
              border:      `1px solid ${active ? "var(--accent-dim)" : "var(--border)"}`,
              cursor:      "pointer",
            }}
          >
            <span
              className="shrink-0 rounded-full border"
              style={{
                width:       "10px",
                height:      "10px",
                background:  active ? "var(--accent)" : "transparent",
                borderColor: active ? "var(--accent)" : "var(--border)",
                flexShrink:  0,
              }}
              aria-hidden="true"
            />
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color:      active ? "var(--accent)" : "var(--muted)",
                fontSize:   "0.7rem",
              }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Grayed-out planned feature row */
function PlannedRow({ label, badgeText = "Planned" }: { label: string; badgeText?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 opacity-40 select-none">
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
          fontSize:    "0.58rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {badgeText}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main SettingsPanel
   ════════════════════════════════════════════════════════════════ */
interface SettingsPanelProps {
  open:    boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { theme, setTheme }              = useTheme();
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

  const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: "dark",
      label: dict.settings.themeDark,
      icon:  <Moon size={11} aria-hidden="true" />,
    },
    {
      value: "light",
      label: dict.settings.themeLight,
      icon:  <Sun size={11} aria-hidden="true" />,
    },
  ];

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
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.settings.title}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-xs animate-panel-in overflow-hidden"
        style={{
          background: "var(--panel)",
          borderLeft: "1px solid var(--border)",
          boxShadow:  "-8px 0 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* ── Header ──────────────────────────────── */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p
              style={{
                fontFamily:    "var(--font-mono)",
                color:         "var(--faint)",
                fontSize:      "0.55rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom:  "2px",
              }}
            >
              {"// " + dict.settings.preferences.toLowerCase()}
            </p>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
            >
              {dict.settings.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label={dict.settings.close}
            onClick={onClose}
            className="rounded p-1.5 transition-colors"
            style={{ color: "var(--muted)", cursor: "pointer" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--muted)")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── A. Appearance ─────────────────────── */}
          <SectionDivider title={dict.settings.appearance} icon={<Sun size={11} />} />
          <div className="px-6 pb-5">
            <PillToggle
              options={THEME_OPTIONS}
              value={theme}
              onChange={setTheme}
            />
          </div>

          {/* ── B. Language ───────────────────────── */}
          <SectionDivider title={dict.settings.language} icon={<Globe size={11} />} />
          <div className="px-6 pb-5">
            <PillToggle
              options={(LOCALES as readonly Locale[]).map((l) => ({
                value: l,
                label: LOCALE_LABELS[l],
              }))}
              value={locale}
              onChange={setLocale}
            />
          </div>

          {/* ── C. Display ────────────────────────── */}
          <SectionDivider title={dict.settings.safetyDisplay} icon={<ShieldAlert size={11} />} />
          <div className="px-6 pb-5 space-y-4">
            <ToggleRow
              label={dict.settings.showFullEthicalGuidance}
              hint={dict.settings.showFullEthicalGuidanceHint}
              checked={settings.showFullEthicalGuidance}
              onChange={(v) => updateSettings({ showFullEthicalGuidance: v })}
            />
          </div>

          {/* Navigation default view */}
          <SectionDivider title={dict.settings.navigation} icon={<LayoutGrid size={11} />} />
          <div className="px-6 pb-5">
            <p
              className="mb-2.5 text-sm"
              style={{ color: "var(--muted)", fontSize: "0.8rem" }}
            >
              {dict.settings.defaultStartView}
            </p>
            <RadioSelect
              value={settings.defaultStartView}
              options={START_VIEW_OPTIONS}
              onChange={(v) =>
                updateSettings({ defaultStartView: v as DefaultStartView })
              }
            />
          </div>

          {/* ── D. Planned ────────────────────────── */}
          <div
            className="px-6 py-5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <PlannedRow
              label={dict.settings.defaultCategoryFilter}
              badgeText={dict.settings.themePlanned}
            />
          </div>
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div
          className="shrink-0 px-6 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color:      "var(--faint)",
              fontSize:   "0.56rem",
            }}
          >
            {dict.common.ethicsDisclaimer}
          </p>
        </div>
      </div>
    </>
  );
}
