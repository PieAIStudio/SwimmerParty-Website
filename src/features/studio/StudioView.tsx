import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { PageIntro } from "@/site/PageIntro";
import { SectionHead } from "@/site/SectionHead";
import { GameButton, GameIcon } from "@pieai/swimmer-ui-kit";
export async function StudioView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("studio.eyebrow")}
        lines={[t("studio.heroLines.0"), t("studio.heroLines.1")]}
      >
        {t("studio.intro")}
      </PageIntro>
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
        <GameButton variant="primary" href="mailto:pieai@hotmail.com" className="mt-6">
          {t("studio.workWithUs")}
        </GameButton>
      </section>
    </div>
  );
}
