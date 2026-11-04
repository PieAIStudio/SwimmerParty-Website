import type { Metadata } from "next";
import { SceneView } from "@/features/scene";
import { localizedAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  return { title: t("scene.title"), alternates: localizedAlternates(locale, "/scene") };
}
export default async function ScenePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <SceneView locale={locale} />;
}
