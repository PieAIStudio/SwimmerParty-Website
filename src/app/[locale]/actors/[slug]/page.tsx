import { ACTORS } from "@/content/actors";
import { getActor } from "@/features/actors/queries";
import { ActorDossier } from "@/features/actors";
import { localizedAlternates } from "@/i18n/metadata";
import { routing, type AppLocale } from "@/i18n/routing";
import { setSiteLocale } from "@/i18n/server";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  return {
    title: locale === "zh" ? actor.nameCn : actor.nameEn,
    description: actor.tagline[locale],
    alternates: localizedAlternates(locale, `/actors/${slug}`),
  };
}
export default async function ActorPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  if (slug === "he-jie" || slug === "dai-er")
    permanentRedirect(`/${locale}/actors/${slug === "he-jie" ? "tang-yunqiu" : "misha-luo"}`);
  const actor = getActor(slug);
  if (!actor) notFound();
  return <ActorDossier actor={actor} locale={locale} />;
}
