import type { MetadataRoute } from "next";
import { ACTORS } from "@/content/actors";
import { WORKS } from "@/content/works";
import { LOCALE_HTML_LANG, routing } from "@/i18n/routing";
import { SITE } from "@/content/site";
const PAGES = ["", "/actors", "/works", "/license", "/studio", "/privacy", "/terms", "/cast"];
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    ...PAGES,
    ...ACTORS.map((actor) => `/actors/${actor.slug}`),
    ...WORKS.map((work) => `/works/${work.slug}`),
  ];
  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE.url}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/actors/") ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((l) => [LOCALE_HTML_LANG[l], `${SITE.url}/${l}${path}`]),
          ["x-default", `${SITE.url}/en${path}`],
        ]),
      },
    })),
  );
}
