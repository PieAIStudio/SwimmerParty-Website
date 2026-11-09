import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { PageIntro } from "@/site/PageIntro";
import { SectionHead } from "@/site/SectionHead";
import { TextLink } from "@/site/TextLink";
import { GameBadge, GameButton, GameIcon } from "@pieai/swimmer-ui-kit";
export async function StudioView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("studio.eyebrow")}
        lines={[t("studio.heroLines.0"), t("studio.heroLines.1")]}
      >
        <p>{t("studio.intro")}</p>
        <TextLink href="#work-with-us" className="mt-4">
          {t("studio.workWithUs")}
        </TextLink>
      </PageIntro>
      <section className="sp-section" id="projects" data-studio-projects>
        <h2 className="sp-title">{t("studio.projectsTitle")}</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {WORKS.map((work) => (
            <Link
              key={work.slug}
              data-project={work.slug}
              href={`/works/${work.slug}`}
              className="sp-card block bg-card hover:bg-muted"
            >
              <GameBadge tone="neutral">{WORK_STATUS_LABEL[work.status][locale]}</GameBadge>
              <h3 className="sp-subtitle mt-4">{work.title[locale]}</h3>
              <p className="sp-small mt-2 text-muted-foreground">{work.format[locale]}</p>
              {work.logline ? <p className="mt-4">{work.logline[locale]}</p> : null}
              <span className="sp-link mt-5 underline">
                {t("studio.viewProject")}
                <GameIcon icon="arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead label={t("studio.beliefsLabel")} title={t("studio.beliefsTitle")} />
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2">
          {([0, 1, 2, 3] as const).map((index) => (
            <article className="sp-card bg-card" key={index}>
              <p className="sp-code text-muted-foreground">{t(`studio.beliefs.${index}.n`)}</p>
              <h3 className="sp-subtitle mt-4">{t(`studio.beliefs.${index}.title`)}</h3>
              <p className="mt-4 text-muted-foreground">{t(`studio.beliefs.${index}.body`)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("studio.missionLabel")}
          title={t("studio.missionTitle")}
          note={t("studio.missionBody")}
        />
        <p className="sp-lead mt-6 max-w-2xl">{t("studio.missionLine")}</p>
        <a
          href="https://www.swiminai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="sp-link mt-6"
        >
          {t("studio.missionLink")}
          <GameIcon icon="arrow-right" />
        </a>
      </section>
      <section className="sp-section" id="work-with-us">
        <SectionHead
          label={t("studio.workWithUs")}
          title={t("studio.cooperationTitle")}
          note={t("studio.cooperationNote")}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {([1, 2] as const).map((index, position) => (
            <article key={index} className="sp-card bg-card">
              <p className="sp-code">{String(position + 1).padStart(2, "0")}</p>
              <h3 className="sp-subtitle mt-4">{t(`casting.routes.${index}.title`)}</h3>
              <p className="mt-4 text-muted-foreground">{t(`casting.routes.${index}.body`)}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <GameButton variant="primary" href="mailto:pieai@hotmail.com">
            {t("studio.workWithUs")}
          </GameButton>
        </div>
      </section>
    </div>
  );
}
