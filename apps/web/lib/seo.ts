import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.205044.xyz";
export const SITE_NAME = "OSINT Hub";
export const DEFAULT_DESCRIPTION =
  "Find public-source research resources with everyday keywords. Learn OSINT basics, choose suitable websites and understand how to start.";

export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const DEFAULT_OG_IMAGES = [
  {
    url: DEFAULT_OG_IMAGE_URL,
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — Public Information Resource Navigator`,
    type: "image/png",
  },
];

export const DEFAULT_TWITTER = {
  card: "summary_large_image" as const,
  title: `${SITE_NAME} — Public Information Resource Navigator`,
  description: DEFAULT_DESCRIPTION,
  images: [DEFAULT_OG_IMAGE_URL],
};

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  imageUrl?: string;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  imageUrl = DEFAULT_OG_IMAGE_URL,
}: PageMetadataOptions): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;

  const resolvedOgTitle = ogTitle ?? (title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`);
  const resolvedOgDesc = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
  const resolvedTwitterDesc = twitterDescription ?? resolvedOgDesc;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: canonicalUrl,
      title: resolvedOgTitle,
      description: resolvedOgDesc,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: resolvedOgTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTwitterTitle,
      description: resolvedTwitterDesc,
      images: [imageUrl],
    },
  };
}
