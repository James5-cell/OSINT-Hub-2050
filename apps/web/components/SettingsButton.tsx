"use client";

import { Settings } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

interface SettingsButtonProps {
  onClick: () => void;
}

export default function SettingsButton({ onClick }: SettingsButtonProps) {
  const { dict } = useLocale();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dict.settings.title}
      className="rounded p-1.5 transition-colors"
      style={{ color: "var(--faint)", cursor: "pointer" }}
      onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
      onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
    >
      <Settings size={15} aria-hidden="true" />
    </button>
  );
}
