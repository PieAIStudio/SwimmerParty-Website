import { LICENSE } from "@/content/license";
import { LicenseView } from "@/features/license";
import { localizedAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
import { setSiteLocale } from "@/i18n/server";
import type { Metadata } from "next";
const l = (x: { en: string; zh: string }, locale: AppLocale) => x[locale];
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: l(LICENSE.title, locale),
    description: l(LICENSE.description, locale),
    alternates: localizedAlternates(locale, "/license"),
  };
}
export default async function LicensePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <LicenseView locale={locale} />;
}
