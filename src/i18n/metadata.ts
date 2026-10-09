import { LOCALE_HTML_LANG, routing, type AppLocale } from "./routing";
import { SITE } from "@/content/site";

export function localizedAlternates(locale: AppLocale, path: string) {
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
