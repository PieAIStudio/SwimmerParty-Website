import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { SITE } from "@/lib/site";
import { PageIntro } from "@/components/PageIntro";
import { TextLink } from "@/components/TextLink";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return { title: t("works.metaTitle"), description: t("works.metaDescription") };
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
        {t("works.intro", { year: SITE.founded })}
      </PageIntro>
      <section className="sp-section grid gap-6 lg:grid-cols-2" aria-label={t("works.slateTitle")}>
        {WORKS.map((work) => (
          <article key={work.code} className="sp-card bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="sp-code text-muted-foreground">{work.code}</span>
              <span className="sp-pill">{WORK_STATUS_LABEL[work.status][locale]}</span>
            </div>
            <h2 className="sp-subtitle mt-5">{work.title[locale]}</h2>
            <p className="sp-small mt-2 text-muted-foreground">{work.format[locale]}</p>
            <p className="mt-6">{work.logline[locale]}</p>
            <div className="sp-small mt-6 flex flex-wrap gap-3">
              <span className="text-muted-foreground">{t("works.cast")}</span>
              {work.cast.map((code) => {
                const actor = ACTORS.find((person) => person.code === code);
                return actor ? (
                  <Link
                    key={code}
                    href={`/actors/${actor.slug}`}
                    className="font-semibold hover:underline underline-offset-4"
                  >
                    {locale === "zh" ? actor.nameCn : actor.nameEn}
                  </Link>
                ) : null;
              })}
            </div>
          </article>
        ))}
      </section>
      <p className="sp-lead">{t("works.outro")}</p>
      <TextLink href="/casting" className="mt-4">
        {t("works.outroCta")}
      </TextLink>
    </div>
  );
}
