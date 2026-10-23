import { LOCALE_HTML_LANG, LOCALE_OG, routing, type AppLocale } from "./routing";
import { SITE } from "@/content/site";
import { STANCE_LINE } from "@/content/doctrine";

function localizedAlternates(locale: AppLocale, path: string) {
  const suffix = path === "/" ? "" : path;
  const canonical = `${SITE.url}/${locale}${suffix}`;
  return {
    canonical,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((alternateLocale) => [
          LOCALE_HTML_LANG[alternateLocale],
          `${SITE.url}/${alternateLocale}${suffix}`,
        ]),
      ),
      "x-default": `${SITE.url}/en${suffix}`,
    },
  };
}

export function localizedMetadata(locale: AppLocale, path: string) {
  const alternates = localizedAlternates(locale, path);
  return {
    alternates,
    openGraph: {
      type: "website" as const,
      locale: LOCALE_OG[locale],
      url: alternates.canonical,
      siteName: SITE.name,
      title: `${SITE.name} — ${SITE.claim[locale]}`,
      description: `${STANCE_LINE[locale]} · ${SITE.description[locale]}`,
    },
  };
}
