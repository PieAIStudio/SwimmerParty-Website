import { PRIVACY } from "@/content/legal";
import { LegalDocument } from "@/features/license";
import { setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import type { Metadata } from "next";
import { localizedAlternates } from "@/i18n/metadata";
type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: PRIVACY.title[locale],
    description: PRIVACY.description[locale],
    alternates: localizedAlternates(locale, "/privacy"),
  };
}
export default async function Privacy({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <LegalDocument document={PRIVACY} locale={locale} introWidth="max-w-2xl" />;
}
