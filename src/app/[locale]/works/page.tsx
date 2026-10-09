import { WorksView } from "@/features/works";
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
    title: t("works.metaTitle"),
    description: t("works.metaDescription"),
    alternates: localizedAlternates(locale, "/works"),
  };
}
export default async function WorksPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <WorksView locale={locale} />;
}
