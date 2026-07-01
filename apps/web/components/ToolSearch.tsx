"use client";

import { Search, X } from "lucide-react";
import { useRef } from "react";
import { useLocale } from "@/lib/locale-context";

interface ToolSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export default function ToolSearch({ value, onChange }: ToolSearchProps) {
  const { dict } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex-1">
      <label htmlFor="tool-search" className="sr-only">
        {dict.search.searchBy}
      </label>
      <Search
        size={13}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "var(--muted)" }}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="tool-search"
        type="search"
        placeholder={dict.search.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded py-2 pl-9 pr-9 text-sm outline-none transition-colors"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          fontFamily: "var(--font-body)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-dim)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      />
      {value && (
        <button
          type="button"
          aria-label={dict.search.clearSearch}
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors"
          style={{ color: "var(--muted)" }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
