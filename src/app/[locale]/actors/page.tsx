import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { ActorFilters } from "@/features/actors";
import { PageIntro } from "@/site/PageIntro";
import { localizedAlternates } from "@/i18n/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return {
    title: t("roster.metaTitle"),
    description: t("roster.metaDescription"),
    alternates: localizedAlternates(locale, "/actors"),
  };
}
export default async function ActorsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const counts = {
    castable: ACTORS.filter((a) => a.status === "active").length,
    newFaces: ACTORS.filter((a) => a.status === "new-face").length,
    building: ACTORS.filter((a) => a.status === "in-development").length,
  };
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("roster.eyebrow")}
        lines={[t("roster.heroLines.0"), t("roster.heroLines.1")]}
      >
        {t("roster.intro", counts)}
      </PageIntro>
      <ActorFilters actors={ACTORS} />
    </div>
  );
}
