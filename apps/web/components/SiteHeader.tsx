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

  const zh = locale === "zh-TW";
  const NAV_LINKS = [
    {
      href: "/",
      label: zh ? "找資源" : "Find resources",
      shortLabel: zh ? "找資源" : "Find",
    },
    {
      href: "/learn",
      label: zh ? "學習與實作" : "Learn & practise",
      shortLabel: zh ? "入門" : "Learn",
    },
    {
      href: "/directory",
      label: zh ? "工具目錄" : "Directory",
      shortLabel: zh ? "目錄" : "Tools",
    },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "var(--header-bg)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div className="mx-auto max-w-screen-xl px-3 sm:px-5 min-h-16 flex items-center justify-between gap-2">
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
                {NAV_LINKS.map(({ href, label, shortLabel }) => {
                  const active =
                    href === "/"
                      ? pathname === "/" || pathname === "/search"
                      : pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-label={label}
                        className="inline-flex items-center min-h-11 px-2 sm:px-3 rounded text-sm transition-colors no-underline"
                        style={{
                          color: active ? "var(--text)" : "var(--muted)",
                          fontFamily: "var(--font-mono)",
                          background: active ? "var(--surface)" : "transparent",
                        }}
                      >
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{shortLabel}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Divider */}
            <span
              className="h-4"
              style={{
                width: "1px",
                background: "var(--border)",
                flexShrink: 0,
              }}
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
                    aria-label={
                      l === "en" ? "Switch to English" : "切換至繁體中文"
                    }
                    className="px-2 min-h-11 text-sm transition-colors"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: active ? "var(--surface)" : "transparent",
                      color: active ? "var(--text)" : "var(--muted)",
                      borderRight:
                        l === "en" ? "1px solid var(--border)" : undefined,
                      fontSize: "0.86rem",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                    onMouseOver={(e) => {
                      if (!active) e.currentTarget.style.color = "var(--muted)";
                    }}
                    onMouseOut={(e) => {
                      if (!active) e.currentTarget.style.color = "var(--muted)";
                    }}
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
              className="rounded min-h-11 min-w-11 flex items-center justify-center transition-colors"
              style={{ color: "var(--muted)", cursor: "pointer" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
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
