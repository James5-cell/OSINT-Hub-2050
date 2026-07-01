"use client";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="flex items-center rounded overflow-hidden border"
      style={{ borderColor: "var(--border)" }}
      role="group"
      aria-label="Select language"
    >
      {(LOCALES as readonly Locale[]).map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            aria-label={`Switch to ${l}`}
            className="px-2 py-1 text-xs transition-colors"
            style={{
              fontFamily:  "var(--font-mono)",
              background:  active ? "var(--surface)" : "transparent",
              color:       active ? "var(--text)" : "var(--faint)",
              borderRight: l === "en" ? "1px solid var(--border)" : undefined,
              fontSize:    "0.62rem",
              cursor:      "pointer",
              lineHeight:  1,
            }}
            onMouseOver={(e) => {
              if (!active) e.currentTarget.style.color = "var(--muted)";
            }}
            onMouseOut={(e) => {
              if (!active) e.currentTarget.style.color = "var(--faint)";
            }}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
