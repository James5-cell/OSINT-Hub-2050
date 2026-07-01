import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme-context";

const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.205044.xyz";
const SITE_NAME  = "OSINT Hub";
const DEFAULT_DESCRIPTION =
  "A scenario-based index of public-source intelligence tools for research, verification, and defensive workflows. 51 tools. 8 guided workflows.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — Operational Intelligence Index`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "OSINT",
    "open source intelligence",
    "threat intelligence",
    "domain recon",
    "username investigation",
    "email OSINT",
    "geolocation",
    "breach lookup",
    "security research",
  ],
  authors:  [{ name: "OSINT Hub" }],
  creator:  "OSINT Hub",
  openGraph: {
    type:        "website",
    siteName:    SITE_NAME,
    title:       `${SITE_NAME} — Operational Intelligence Index`,
    description: DEFAULT_DESCRIPTION,
    url:         SITE_URL,
    locale:      "en_US",
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       `${SITE_NAME} — Operational Intelligence Index`,
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * suppressHydrationWarning: the FOUC-prevention script (below) adds
     * a theme class to <html> before React hydrates, causing a mismatch
     * between server-rendered HTML (no class) and client DOM.
     * suppressHydrationWarning tells React to ignore that difference.
     */
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        {/*
         * FOUC-prevention: runs synchronously before any paint.
         * Reads localStorage and sets the theme class on <html>
         * before React hydrates, preventing flash of wrong theme.
         */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />

        <ThemeProvider>
          <LocaleProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
