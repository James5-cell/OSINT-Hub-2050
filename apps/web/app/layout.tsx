import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme-context";

import JsonLd from "@/components/JsonLd";

import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGES,
  DEFAULT_TWITTER,
  DEFAULT_OG_IMAGE_URL,
} from "@/lib/seo";

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
    images:      DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
    title:       `${SITE_NAME} — Operational Intelligence Index`,
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
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
    "logo": `${SITE_URL}/icon-512x512.png`,
    "sameAs": [
      "https://github.com/zubair-trabzada/geo-seo-claude"
    ]
  }
];

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-EGTETEHBWV";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Explicit Open Graph & Twitter Social Share Meta (Absolute URLs) */}
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta property="og:image:secure_url" content={DEFAULT_OG_IMAGE_URL} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />

        {/* PWA & Touch Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
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
