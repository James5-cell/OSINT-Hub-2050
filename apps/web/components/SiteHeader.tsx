"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import SettingsPanel from "./SettingsPanel";
import SiteLogo from "./SiteLogo";

export default function SiteHeader() {
  const pathname = usePathname();
  const { dict, locale } = useLocale();
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
      href: "/tasks",
      label: zh ? "查證任務" : "Research tasks",
      shortLabel: zh ? "任務" : "Tasks",
    },
    {
      href: "/directory",
      label: zh ? "工具目錄" : "Directory",
      shortLabel: zh ? "目錄" : "Tools",
    },
  ];

  return (
    <>
      <a className="skip-link" href="#main-content">{zh ? "跳至主要內容" : "Skip to main content"}</a>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--border)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div className="site-header-inner mx-auto max-w-screen-xl px-4 sm:px-5">
          {/* ── Wordmark ──────────────────────────── */}
          <Link
            href="/"
            className="flex items-center shrink-0 no-underline"
            aria-label={dict.common.goHome}
          >
            <div className="hidden md:block">
              <SiteLogo variant="full" />
            </div>
            <div className="block md:hidden">
              <SiteLogo variant="icon" />
            </div>
          </Link>

          {/* ── Nav + controls ────────────────────── */}
          <div className="site-header-controls flex items-center gap-2">
            <nav className="site-primary-nav" aria-label={zh ? "主要導覽" : "Primary navigation"}>
              <ul className="flex items-center gap-0.5 list-none m-0 p-0">
                {NAV_LINKS.map(({ href, label, shortLabel }) => {
                  const active =
                    href === "/"
                      ? pathname === "/" || pathname === "/search"
                      : pathname.startsWith(href) || (href === "/learn" && pathname.startsWith("/workflows"));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                        className="inline-flex items-center min-h-11 px-2 sm:px-3 rounded text-sm transition-colors no-underline"
                        style={{
                          color: active ? "var(--text)" : "var(--muted)",
                          background: active ? "var(--surface)" : "transparent",
                        }}
                      >
                        <span className="hidden md:inline">{label}</span>
                        <span className="md:hidden">{shortLabel}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

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
