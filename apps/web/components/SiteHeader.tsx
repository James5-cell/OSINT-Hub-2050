"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import SettingsPanel from "./SettingsPanel";
import SiteLogo from "./SiteLogo";

export default function SiteHeader() {
  const pathname = usePathname();
  const { dict, locale, setLocale } = useLocale();
  const [panelOpen, setPanelOpen] = useState(false);

  const NAV_LINKS = [
    { href: "/",          label: dict.nav.index    },
    { href: "/workflows", label: dict.nav.workflows },
    { href: "/search",    label: dict.nav.search   },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background:     "var(--header-bg)",
          backdropFilter: "blur(16px)",
          borderColor:    "var(--border)",
          transition:     "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div className="mx-auto max-w-screen-xl px-5 h-12 flex items-center justify-between gap-4">

          {/* ── Wordmark ──────────────────────────── */}
          <Link
            href="/"
            className="flex items-center shrink-0 no-underline"
            aria-label={dict.common.goHome}
          >
            <div className="hidden sm:block">
              <SiteLogo variant="full" />
            </div>
            <div className="block sm:hidden">
              <SiteLogo variant="icon" />
            </div>
          </Link>

          {/* ── Nav + controls ────────────────────── */}
          <div className="flex items-center gap-2">
            <nav aria-label="Primary navigation">
              <ul className="flex items-center gap-0.5 list-none m-0 p-0">
                {NAV_LINKS.map(({ href, label }) => {
                  const active =
                    href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className="px-3 py-1.5 rounded text-xs transition-colors no-underline"
                        style={{
                          color:      active ? "var(--text)" : "var(--muted)",
                          fontFamily: "var(--font-mono)",
                          background: active ? "var(--surface)" : "transparent",
                        }}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}

              </ul>
            </nav>

            {/* Divider */}
            <span
              className="h-4"
              style={{ width: "1px", background: "var(--border)", flexShrink: 0 }}
              aria-hidden="true"
            />

            {/* ── Compact language toggle (inline in header) ── */}
            <div
              className="flex items-center rounded overflow-hidden border"
              style={{ borderColor: "var(--border)" }}
              role="group"
              aria-label={dict.settings.language}
            >
              {(LOCALES as readonly Locale[]).map((l) => {
                const active = l === locale;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l)}
                    aria-pressed={active}
                    aria-label={l === "en" ? "Switch to English" : "切換至繁體中文"}
                    className="px-2 py-1 text-xs transition-colors"
                    style={{
                      fontFamily:  "var(--font-mono)",
                      background:  active ? "var(--surface)" : "transparent",
                      color:       active ? "var(--text)"    : "var(--faint)",
                      borderRight: l === "en" ? "1px solid var(--border)" : undefined,
                      fontSize:    "0.62rem",
                      cursor:      "pointer",
                      lineHeight:  1,
                    }}
                    onMouseOver={(e) => { if (!active) e.currentTarget.style.color = "var(--muted)"; }}
                    onMouseOut={(e)  => { if (!active) e.currentTarget.style.color = "var(--faint)"; }}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                );
              })}
            </div>

            {/* ── Settings gear ──────────────────── */}
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              aria-label={dict.settings.title}
              aria-haspopup="dialog"
              className="rounded p-1.5 transition-colors"
              style={{ color: "var(--faint)", cursor: "pointer" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
              onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
            >
              <Settings size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings panel (rendered outside header to avoid z-index stacking) */}
      <SettingsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
