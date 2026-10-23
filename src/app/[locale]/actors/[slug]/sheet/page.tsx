import { ACTORS } from "@/content/actors";
import { getActor } from "@/features/actors/queries";
import { getActorAssets } from "@/features/assets/queries";
import { SheetView } from "@/features/sheet";
import { localizedAlternates } from "@/i18n/metadata";
import { routing, type AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  const { t } = await getSiteI18n(locale);
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return {
    title: t("sheet.metaTitle", { name }),
    description: t("sheet.lead", { name }),
    alternates: localizedAlternates(locale, `/actors/${slug}/sheet`),
  };
}

export default async function SheetPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  const actor = getActor(slug);
  if (!actor) notFound();
  return <SheetView actor={actor} assets={getActorAssets(slug)} locale={locale} />;
}
