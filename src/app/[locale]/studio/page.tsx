import { StudioView } from "@/features/studio";
import { localizedAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return {
    title: t("studio.metaTitle"),
    description: t("studio.metaDescription"),
    alternates: localizedAlternates(locale, "/studio"),
  };
}
export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <StudioView locale={locale} />;
}
