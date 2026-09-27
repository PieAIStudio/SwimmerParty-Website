"use client";
import type { MessageContracts } from "./message-contracts";
import { useMemo, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { I18nProvider, useI18n } from "@pieai/swimmer-i18n-kit/react";
import { createSiteI18n, type SiteMessages } from "./catalog";
import { catalogLocale, hasLocale, routing, type AppLocale } from "./routing";
export function SiteI18nProvider({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: SiteMessages;
  children: ReactNode;
}) {
  const i18n = useMemo(() => createSiteI18n(catalogLocale(locale), messages), [locale, messages]);
  return (
    <I18nProvider i18n={i18n} locale={catalogLocale(locale)}>
      {children}
    </I18nProvider>
  );
}
export function useSiteI18n() {
  return useI18n<SiteMessages, MessageContracts>();
}
export function useSiteLocale(): AppLocale {
  const locale = useParams<{ locale?: string }>().locale;
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
