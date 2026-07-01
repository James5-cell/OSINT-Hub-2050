"use client";

import { useLocale } from "@/lib/locale-context";

const UPSTREAM_URL  = "https://github.com/Astrosp/Awesome-OSINT-For-Everything";
const OSINT_HUB_URL = "https://github.com/Astrosp/Awesome-OSINT-For-Everything";

const DOT = (
  <span aria-hidden="true" style={{ margin: "0 0.5rem", opacity: 0.4 }}>
    ·
  </span>
);

export default function SiteFooter() {
  const { dict } = useLocale();

  return (
    <footer
      style={{
        borderTop:  "1px solid var(--border)",
        background: "var(--bg)",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        className="mx-auto max-w-screen-xl px-5 py-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
      >
        {/* Left — copyright */}
        <span
          className="text-center sm:text-left"
          style={{ color: "var(--faint)" }}
        >
          {dict.footer.copyright}
        </span>

        {/* Right — attribution chain */}
        <span
          className="flex flex-wrap items-center justify-center sm:justify-end gap-0"
          style={{ color: "var(--faint)" }}
        >
          {dict.footer.builtOn}&nbsp;
          <a
            href={UPSTREAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            Awesome-OSINT-For-Everything
          </a>
          &nbsp;by @Astrosp
          {DOT}
          {dict.footer.mitLicense}
          {DOT}
          <a
            href={OSINT_HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            {dict.footer.viewSource}
          </a>
          {DOT}
          <span className="text-xs text-zinc-600">by postsoma-2050</span>
        </span>
      </div>
    </footer>
  );
}
