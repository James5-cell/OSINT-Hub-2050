"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

export const THEMES: readonly Theme[] = ["dark", "light"] as const;
const DEFAULT_THEME: Theme = "dark";
const LS_KEY = "osint-hub-theme";

interface ThemeCtx {
  theme:    Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme:    DEFAULT_THEME,
  setTheme: () => {},
});

/* ── Apply class to <html> ─────────────────────────────────── */
function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(t);
}

/* ── Provider ────────────────────────────────────────────────── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  /* Hydrate from localStorage and apply class on mount.
     The inline FOUC-prevention script in layout.tsx already set the
     class server-side, so this just syncs React state with it. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as Theme | null;
      const resolved: Theme =
        saved === "dark" || saved === "light" ? saved : DEFAULT_THEME;
      setThemeState(resolved);
      applyTheme(resolved);
    } catch {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    applyTheme(t);
    try { localStorage.setItem(LS_KEY, t); } catch { /* ignore */ }
  }

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  return useContext(Ctx);
}

/* ── FOUC-prevention script string (injected by layout.tsx) ─── */
/**
 * Inline script that runs synchronously before React hydrates.
 * Sets the correct theme class on <html> before any paint.
 * This eliminates the flash of dark → light when user prefers light.
 */
export const THEME_INIT_SCRIPT = `(function(){
  try{
    var t=localStorage.getItem('${LS_KEY}');
    if(t==='light'||t==='dark'){document.documentElement.classList.add(t);}
    else{document.documentElement.classList.add('dark');}
  }catch(e){document.documentElement.classList.add('dark');}
})();`;
