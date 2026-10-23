import { GuideView } from "@/features/guide";
import { localizedAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  return {
    title: t("guide.metaTitle"),
    description: t("guide.lead"),
    alternates: localizedAlternates(locale, "/guide"),
  };
}

export default async function GuidePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <GuideView locale={locale} />;
}
