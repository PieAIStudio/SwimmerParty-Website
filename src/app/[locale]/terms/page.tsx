import { TERMS } from "@/content/legal";
import { LegalDocument } from "@/features/license";
import { setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import type { Metadata } from "next";
import { localizedAlternates } from "@/i18n/metadata";
type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: TERMS.title[locale],
    description: TERMS.description[locale],
    alternates: localizedAlternates(locale, "/terms"),
  };
}
export default async function Terms({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <LegalDocument document={TERMS} locale={locale} introWidth="max-w-3xl" />;
}
