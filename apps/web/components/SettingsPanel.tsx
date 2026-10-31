"use client";
import { useRef } from "react";
import { useDialogFocus } from "@/lib/use-dialog-focus";
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
  useDialogFocus(open, panel, onClose);
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
        <div className="flex items-center justify-between mb-5">
          <h2 id="settings-heading" className="text-2xl">
            {zh ? "設定" : "Settings"}
          </h2>
          <button
            className="settings-close"
            aria-label={zh ? "關閉設定" : "Close settings"}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <fieldset className="settings-section">
          <legend >{zh ? "外觀" : "Appearance"}</legend>
          <div className="settings-options">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                aria-pressed={theme === t}
                onClick={() => setTheme(t)}
              >
                {t === "dark" ? (zh ? "深色" : "Dark") : zh ? "淺色" : "Light"}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="settings-section">
          <legend >{zh ? "語言" : "Language"}</legend>
          <div className="settings-options">
            {(["en", "zh-TW"] as const).map((l) => (
              <button
                key={l}
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
              >
                {l === "en" ? "English" : "繁體中文"}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="settings-section">
        <label className="settings-check">
          <input
            type="checkbox"
            checked={settings.showMascot}
            onChange={(e) => updateSettings({ showMascot: e.target.checked })}
          />
          <span>{zh ? "顯示桌寵" : "Show mascot"}</span>
        </label>
        <label className="settings-check">
          <input
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
    </div>
  );
}
