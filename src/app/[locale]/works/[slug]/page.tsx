import { WORKS } from "@/content/works";
import { WorkView } from "@/features/works";
import { localizedAlternates } from "@/i18n/metadata";
import { routing, type AppLocale } from "@/i18n/routing";
import { setSiteLocale } from "@/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => WORKS.map((work) => ({ locale, slug: work.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const work = WORKS.find((w) => w.slug === slug);
  if (!work) return {};
  return {
    title: work.title[locale],
    description: (work.logline ?? work.format)[locale],
    alternates: localizedAlternates(locale, `/works/${slug}`),
  };
}
export default async function WorkPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  const work = WORKS.find((w) => w.slug === slug);
  if (!work) notFound();
  return <WorkView work={work} locale={locale} />;
}
