import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { ActorCard } from "@/features/actors/ActorCard";
import { PageIntro } from "@/features/site/PageIntro";
import { SectionHead } from "@/features/site/SectionHead";
import { Reveal } from "@/motion/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return { title: t("roster.metaTitle"), description: t("roster.metaDescription") };
}

export default async function RosterPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const castable = ACTORS.filter((actor) => actor.status === "active");
  const building = ACTORS.filter((actor) => actor.status !== "active");
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("roster.eyebrow")}
        lines={[t("roster.heroLines.0"), t("roster.heroLines.1")]}
      >
        {t("roster.intro", { castable: castable.length, building: building.length })}
      </PageIntro>
      <section className="sp-section">
        <SectionHead label={t("roster.castableLabel")} title={t("roster.castableTitle")} />
        <Reveal className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:mt-10 lg:grid-cols-4">
          {castable.map((actor) => (
            <div className="sp-reveal min-w-0" key={actor.slug}>
              <ActorCard actor={actor} />
            </div>
          ))}
        </Reveal>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("roster.buildingLabel")}
          title={t("roster.buildingTitle")}
          note={t("roster.buildingNote")}
        />
        <Reveal className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:mt-10 lg:grid-cols-4">
          {building.map((actor) => (
            <div className="sp-reveal min-w-0" key={actor.slug}>
              <ActorCard actor={actor} />
            </div>
          ))}
        </Reveal>
      </section>
    </div>
  );
}
