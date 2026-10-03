"use client";
import type { MessageContracts } from "./message-contracts";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { I18nProvider, useI18n } from "@pieai/swimmer-i18n-kit/react";
import { siteI18n, type SiteMessages } from "./catalog";
import { catalogLocale, hasLocale, routing, type AppLocale } from "./routing";
export function SiteI18nProvider({ locale, children }: { locale: AppLocale; children: ReactNode }) {
  return (
    <I18nProvider i18n={siteI18n} locale={catalogLocale(locale)}>
      {children}
    </I18nProvider>
  );
}
export function useSiteI18n() {
  return useI18n<SiteMessages, MessageContracts>();
}
export function useSiteLocale(): AppLocale {
  const locale = useParams<{ locale?: string }>()?.locale;
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
