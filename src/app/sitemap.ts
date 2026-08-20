import type { MetadataRoute } from "next";
import { ACTORS } from "@/content/actors";
import { LOCALE_HTML_LANG, routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";

const PAGES = ["", "/actors", "/works", "/kit", "/studio", "/casting", "/pact"];

/**
 * Every page in every authored locale, cross-linked with hreflang.
 *
 * The machine-translated languages are deliberately absent: those live on
 * Google's proxy domain, are marked `nofollow` in the switcher, and are not
 * ours to submit as canonical versions of this site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [...PAGES, ...ACTORS.map((a) => `/actors/${a.slug}`)];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE.url}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/actors/") ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [LOCALE_HTML_LANG[l], `${SITE.url}/${l}${path}`]),
        ),
      },
    })),
  );
}
