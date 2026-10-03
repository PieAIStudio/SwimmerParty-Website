// oxlint-disable-next-line no-unassigned-import
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { siteI18n } from "./catalog";
import { catalogLocale, hasLocale, routing, type AppLocale } from "./routing";
// React owns the request lifetime; no process-global mutable locale.
const requestLocale = cache((): { locale?: AppLocale } => ({}));
export function setSiteLocale(locale: string) {
  if (!hasLocale(routing.locales, locale)) notFound();
  requestLocale().locale = locale;
}
export async function getSiteLocale(): Promise<AppLocale> {
  const saved = requestLocale().locale;
  if (saved) return saved;
  const requested = (await headers()).get("x-site-locale");
  return hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
}
const translatorForLocale = cache((locale: AppLocale) =>
  siteI18n.translator(catalogLocale(locale)),
);
export async function getSiteI18n(locale?: string) {
  const selected = locale ?? (await getSiteLocale());
  if (!hasLocale(routing.locales, selected)) notFound();
  return translatorForLocale(selected);
}
