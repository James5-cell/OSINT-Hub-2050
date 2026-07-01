"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, DICT, type Locale } from "./i18n";
import type { Tool } from "./types";

const LS_LOCALE   = "osint-hub-locale";
const LS_SETTINGS = "osint-hub-settings";

/* ── App settings interface ──────────────────────────────────── */
export type DefaultStartView = "index" | "workflows" | "search";

export interface AppSettings {
  showFullEthicalGuidance: boolean;
  defaultStartView:        DefaultStartView;
}

const DEFAULT_SETTINGS: AppSettings = {
  showFullEthicalGuidance: true,
  defaultStartView:        "index",
};

/* ── Context type ────────────────────────────────────────────── */
interface LocaleCtx {
  locale:         Locale;
  setLocale:      (l: Locale) => void;
  dict:           (typeof DICT)[Locale];
  settings:       AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const Ctx = createContext<LocaleCtx>({
  locale:         DEFAULT_LOCALE,
  setLocale:      () => {},
  dict:           DICT[DEFAULT_LOCALE],
  settings:       DEFAULT_SETTINGS,
  updateSettings: () => {},
});

/* ── Provider ────────────────────────────────────────────────── */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale,   setLocaleState]   = useState<Locale>(DEFAULT_LOCALE);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(LS_LOCALE) as Locale | null;
      if (savedLocale === "en" || savedLocale === "zh-TW") {
        setLocaleState(savedLocale);
      }

      const savedSettings = localStorage.getItem(LS_SETTINGS);
      if (savedSettings) {
        setSettingsState((prev) => ({
          ...prev,
          ...JSON.parse(savedSettings),
        }));
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try { localStorage.setItem(LS_LOCALE, l); } catch { /* ignore */ }
  }

  // Update dynamic SEO headers on locale switches
  useEffect(() => {
    try {
      const d = DICT[locale];
      if (d && d.seo) {
        document.title = d.seo.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute("content", d.seo.description);
        }
      }
    } catch {
      // localStorage/document not available in SSR context
    }
  }, [locale]);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(LS_SETTINGS, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <Ctx.Provider
      value={{
        locale,
        setLocale,
        dict:           DICT[locale],
        settings,
        updateSettings,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}

/* ══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS (pure, no React dependency)
   ══════════════════════════════════════════════════════════════ */

/**
 * Returns the best available description for a tool given the current locale.
 * EN  → description_en   → description_zh_tw → raw_description → ""
 * zhTW→ description_zh_tw → description_en  → raw_description → ""
 */
export function getToolDescription(tool: Tool, locale: Locale): string {
  if (locale === "zh-TW") {
    return (
      tool.description_zh_tw ??
      tool.description_en    ??
      tool.raw_description   ??
      ""
    );
  }
  return (
    tool.description_en    ??
    tool.description_zh_tw ??
    tool.raw_description   ??
    ""
  );
}

/**
 * Returns a locale-translated difficulty label.
 * Falls back to the raw value if no translation exists.
 */
export function formatDifficulty(d: string, locale: Locale): string {
  return DICT[locale].labels.difficulty[d] ?? d;
}

/**
 * Returns a locale-translated risk level label.
 */
export function formatRiskLevel(r: string, locale: Locale): string {
  return DICT[locale].labels.riskLevel[r] ?? r;
}

/**
 * Returns a locale-translated safety badge label.
 */
export function formatSafetyBadge(b: string, locale: Locale): string {
  return DICT[locale].labels.safetyBadge[b] ?? b;
}

/**
 * Returns a locale-translated workflow tag (badge, difficulty, risk).
 * Tries difficulty → riskLevel → safetyBadge in order.
 */
export function formatWorkflowTag(tag: string, locale: Locale): string {
  const d = DICT[locale];
  return (
    d.labels.difficulty[tag] ??
    d.labels.riskLevel[tag]  ??
    d.labels.safetyBadge[tag] ??
    tag
  );
}
