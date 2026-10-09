import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { PageIntro } from "@/site/PageIntro";
import { Link } from "@/i18n/navigation";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import { localizedAlternates } from "@/i18n/metadata";
import { CommunityFeed } from "@/features/community";
import { OfficialSamplesSection } from "@/features/samples";
import { COMMUNITY_ENABLED } from "@/content/features";
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
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("works.eyebrow")}
        lines={[t("works.heroLines.0"), t("works.heroLines.1")]}
      >
        {t("works.intro")}
      </PageIntro>
      <section className="sp-section">
        <h2 className="sp-title">{t("works.ourProductions")}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {WORKS.map((work) => (
            <Link
              data-card
              key={work.slug}
              href={`/works/${work.slug}`}
              className="sp-card block bg-card hover:bg-muted"
            >
              <div className="flex items-center justify-end">
                <GameBadge tone="neutral">{WORK_STATUS_LABEL[work.status][locale]}</GameBadge>
              </div>
              <h2 className="sp-subtitle mt-5">{work.title[locale]}</h2>
              <p className="sp-small mt-2 text-muted-foreground">{work.format[locale]}</p>
              <p className="mt-6">{work.logline[locale]}</p>
              <p className="sp-small mt-6">
                <span className="text-muted-foreground">{t("works.starring")} </span>
                {work.cast.map((credit, index) => {
                  const actor = ACTORS.find((a) => a.slug === credit.actor);
                  return actor ? (
                    <span key={credit.actor}>
                      {index ? " · " : ""}
                      {locale === "zh" ? actor.nameCn : actor.nameEn}
                      {credit.role
                        ? ` ${locale === "zh" ? "饰" : "as"} ${credit.role.name[locale]}`
                        : ""}
                    </span>
                  ) : null;
                })}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <OfficialSamplesSection />
      {COMMUNITY_ENABLED ? (
        <section className="sp-section">
          <h2 className="sp-title">{t("works.madeByYou")}</h2>
          <p className="sp-lead mt-6">{t("works.emptyFan")}</p>
          <CommunityFeed locale={locale} />
        </section>
      ) : null}
    </div>
  );
}
