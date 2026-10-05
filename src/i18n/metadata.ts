import { LOCALE_HTML_LANG, routing, type AppLocale } from "./routing";

export function localizedAlternates(path: string) {
  return {
    canonical: path,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((locale) => [LOCALE_HTML_LANG[locale], `/${locale}${path}`]),
      ),
      "x-default": `/en${path}`,
    },
  };
}

export function localizedUrl(locale: AppLocale, path: string) {
  return `/${locale}${path}`;
}
