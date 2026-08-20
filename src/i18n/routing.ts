import { defineRouting } from "next-intl/routing";

/**
 * Two authored locales, and only two.
 *
 * ZH and EN are written by hand and reviewed. Every other language is a
 * one-click hop to Google's translation proxy (see `MACHINE_LOCALES`) — we
 * do not ship half-checked JSON for nine languages nobody on the team can
 * proofread. When a locale earns a real translation it moves out of
 * `MACHINE_LOCALES` and into `locales`, and nothing else changes.
 */
export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_HTML_LANG: Record<AppLocale, string> = {
  zh: "zh-Hans",
  en: "en",
};

export const LOCALE_LABEL: Record<AppLocale, string> = {
  zh: "中文",
  en: "English",
};

/** OpenGraph locale codes, which use underscores and full regions. */
export const LOCALE_OG: Record<AppLocale, string> = {
  zh: "zh_CN",
  en: "en_US",
};

/**
 * Languages served by Google's translate proxy rather than by us.
 *
 * `code` is the `_x_tr_tl` target. The switcher labels these as machine
 * translation on screen — passing off a proxy render as an authored locale
 * is the same category of lie as a fake client logo.
 */
export const MACHINE_LOCALES = [
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
] as const;

/**
 * Build a Google translate-proxy URL for an absolute page URL.
 *
 * The proxy addresses a site as `host-with-dashes.translate.goog`, so
 * `swimmerparty.vercel.app` becomes `swimmerparty-vercel-app.translate.goog`.
 * We always translate FROM the English build: machine translation out of
 * English is markedly better than out of Chinese for every target here.
 */
export function machineTranslateUrl(siteUrl: string, pathname: string, target: string): string {
  const host = new URL(siteUrl).host.replaceAll("-", "--").replaceAll(".", "-");
  const params = new URLSearchParams({
    _x_tr_sl: "en",
    _x_tr_tl: target,
    _x_tr_hl: target,
  });
  return `https://${host}.translate.goog${pathname}?${params.toString()}`;
}
