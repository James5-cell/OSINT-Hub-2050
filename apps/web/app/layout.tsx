import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme-context";

import JsonLd from "@/components/JsonLd";

const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.205044.xyz";
const SITE_NAME  = "OSINT Hub";
const DEFAULT_DESCRIPTION =
  "A scenario-based index of public-source intelligence tools for research, verification, and defensive workflows. 51 tools. 8 guided workflows.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "./",
  },
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

const globalJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAME,
    "description": DEFAULT_DESCRIPTION,
    "inLanguage": ["en", "zh-TW"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/favicon.svg`,
    "sameAs": [
      "https://github.com/zubair-trabzada/geo-seo-claude"
    ]
  }
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <JsonLd data={globalJsonLd} />
      </head>
      <body className="flex flex-col min-h-screen">
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
