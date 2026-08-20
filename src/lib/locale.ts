import type { AppLocale } from "@/i18n/routing";
import type { L, LList } from "@/content/actors";

/** Pull the active locale out of an authored `{ en, zh }` pair. */
export function t(value: L, locale: AppLocale): string {
  return value[locale];
}

/** Same, for authored lists. */
export function tl(value: LList, locale: AppLocale): string[] {
  return value[locale];
}
