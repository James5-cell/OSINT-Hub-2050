"use client";

import { useLocale } from "@/lib/locale-context";

const UPSTREAM_URL  = "https://github.com/Astrosp/Awesome-OSINT-For-Everything";

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
        className="mx-auto max-w-screen-xl px-5 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
      >
        {/* Left — copyright & signature */}
        <span
          className="text-center sm:text-left flex flex-wrap items-center justify-center sm:justify-start gap-1"
          style={{ color: "var(--faint)" }}
        >
          <span>{dict.footer.copyright}</span>
          {DOT}
          <span style={{ color: "var(--muted)" }}>by postsoma-2050</span>
        </span>

        {/* Right — machine feeds & attribution */}
        <span
          className="flex flex-wrap items-center justify-center sm:justify-end gap-0"
          style={{ color: "var(--faint)" }}
        >
          <a
            href="/about"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            About & Ethics
          </a>
          {DOT}
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            llms.txt
          </a>
          {DOT}
          <a
            href="/llms-full.txt"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            llms-full.txt
          </a>
          {DOT}
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            Sitemap
          </a>
          {DOT}
          <a
            href={UPSTREAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--faint)", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--muted)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "var(--faint)")}
          >
            Awesome-OSINT
          </a>
          {DOT}
          {dict.footer.mitLicense}
        </span>
      </div>
    </footer>
  );
}
