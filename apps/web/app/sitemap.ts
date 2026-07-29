import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { WORKFLOWS } from "@/lib/workflows";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.205044.xyz";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date("2026-05-20"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/workflows`,
      lastModified: new Date("2026-05-20"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-05-20"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date("2026-05-20"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const dynamicWorkflows: MetadataRoute.Sitemap = WORKFLOWS.map((wf) => ({
    url: `${baseUrl}/workflows/${wf.id}`,
    lastModified: new Date("2026-05-20"),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...dynamicWorkflows];
}
