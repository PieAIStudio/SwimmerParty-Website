import { CastView } from "@/features/cast";
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
    title: t("cast.title"),
    alternates: localizedAlternates(locale, "/cast"),
  };
}
export default async function CastPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <CastView locale={locale} />;
}
