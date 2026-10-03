"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { useTheme } from "@/lib/theme-context";
export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { locale, setLocale, settings, updateSettings } = useLocale();
  const { theme, setTheme } = useTheme();
  const zh = locale === "zh-TW";
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    function keydown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const elements = panel.current?.querySelectorAll<HTMLElement>(
        "button, input, select, a[href]",
      );
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === panel.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === panel.current)
      ) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,.55)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
        className="w-full max-w-sm h-full p-6 overflow-y-auto"
        style={{
          background: "var(--panel)",
          color: "var(--text)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 id="settings-heading" className="text-2xl">
            {zh ? "設定" : "Settings"}
          </h2>
          <button
            className="resource-secondary"
            aria-label={zh ? "關閉設定" : "Close settings"}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <fieldset className="mb-8">
          <legend className="text-lg mb-3">{zh ? "外觀" : "Appearance"}</legend>
          <div className="resource-chips">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                className="resource-chip"
                aria-pressed={theme === t}
                onClick={() => setTheme(t)}
              >
                {t === "dark" ? (zh ? "深色" : "Dark") : zh ? "淺色" : "Light"}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mb-8">
          <legend className="text-lg mb-3">{zh ? "語言" : "Language"}</legend>
          <div className="resource-chips">
            {(["en", "zh-TW"] as const).map((l) => (
              <button
                key={l}
                className="resource-chip"
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
              >
                {l === "en" ? "English" : "繁體中文"}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex items-start gap-3 min-h-11">
          <input
            className="mt-1 w-5 h-5"
            type="checkbox"
            checked={settings.showFullEthicalGuidance}
            onChange={(e) =>
              updateSettings({ showFullEthicalGuidance: e.target.checked })
            }
          />
          <span>
            {zh
              ? "在工具介紹中顯示完整使用注意事項"
              : "Show full usage guidance in resource details"}
          </span>
        </label>
      </div>
    </div>
  );
}
