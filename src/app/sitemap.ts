import type { MetadataRoute } from "next";
import { ACTORS } from "@/content/actors";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/actors", "/works", "/studio", "/casting"].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const actors = ACTORS.map((a) => ({
    url: `${SITE.url}/actors/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...routes, ...actors];
}
