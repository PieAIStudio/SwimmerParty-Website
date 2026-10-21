import Image from "next/image";
import { ACTORS } from "@/content/actors";
import { TOOL_TUTORIALS } from "@/content/tutorials";
import { Link } from "@/i18n/navigation";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { DownloadTerms } from "@/site/DownloadTerms";
import { WORKFLOW_STEPS } from "./workflows";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { PageIntro } from "@/site/PageIntro";
import { TextLink } from "@/site/TextLink";

const WAYS = ["starter", "sheet", "cast"] as const;
const AFTER = ["guide.after.1", "guide.after.2", "guide.after.3"] as const;

export async function GuideView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  const ready = ACTORS.find((actor) => actor.status === "active");
  const actions = {
    starter: ready ? `/actors/${ready.slug}` : "/actors",
    sheet: ready ? `/actors/${ready.slug}/sheet` : "/actors",
    cast: "/cast",
  };
  return (
    <div className="sp-container">
      <PageIntro eyebrow={t("guide.helpLabel")} lines={[t("guide.title")]}>
        {t("guide.lead")}
      </PageIntro>
      <section className="sp-section">
        <div className="grid gap-6 lg:grid-cols-3">
          {WAYS.map((way) => (
            <article data-learn-outcome={way} key={way} className="sp-card bg-card">
              <h2 className="sp-subtitle">{t(`guide.${way}.title`)}</h2>
              <figure className="mt-4">
                <Image
                  src={`/help/${locale}/${way}-poster.webp`}
                  alt={t("learn.workflowPreview")}
                  width={640}
                  height={400}
                  className="aspect-8/5 w-full rounded-[var(--game-ui-radius-card)] object-contain"
                />
                <figcaption className="sp-small mt-2 text-muted-foreground">
                  {t("learn.workflowPreview")}
                </figcaption>
              </figure>
              <p className="mt-4">{t(`guide.${way}.for`)}</p>
              <p className="mt-3">{t(`guide.${way}.has`)}</p>
              <p className="sp-small mt-3 text-muted-foreground">{t(`guide.${way}.where`)}</p>
              <ol className="mt-4 list-decimal space-y-2 pl-5">
                {WORKFLOW_STEPS[way].map((step, index) => (
                  <li key={index}>{step[locale]}</li>
                ))}
              </ol>
              <GameButton href={actions[way]} linkComponent={Link} className="mt-5">
                {t(`learn.start.${way}`)}
              </GameButton>
              <DownloadTerms className="mt-3" />
            </article>
          ))}
        </div>
      </section>
      <section id="tools" className="sp-section" data-learn-tools>
        <h2 className="sp-title">{t("learn.toolsTitle")}</h2>
        <p className="sp-small mt-4 max-w-3xl text-muted-foreground">{t("learn.toolIntro")}</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_TUTORIALS.map((tutorial) => (
            <article key={tutorial.id} className="sp-card bg-card">
              <h3 className="sp-subtitle mt-4">{tutorial.tool}</h3>
              <p className="mt-2">{tutorial.goal[locale]}</p>
              <p className="sp-small mt-3 text-muted-foreground">{tutorial.access[locale]}</p>
              <TextLink href={`/guide/tools/${tutorial.id}`} className="mt-4">
                {t("learn.readSteps")}
              </TextLink>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section grid gap-x-12 gap-y-10 md:grid-cols-2">
        <div>
          <h2 className="sp-subtitle">{t("guide.more.title")}</h2>
          <div className="mt-4 space-y-3">
            <p>{t("guide.more.single")}</p>
            <p>{t("guide.more.selected")}</p>
          </div>
        </div>
        <div>
          <h2 className="sp-subtitle">{t("guide.after.title")}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6">
            {AFTER.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="sp-subtitle">{t("guide.account.title")}</h2>
          <p className="mt-4">{t("guide.account.body")}</p>
        </div>
        <div>
          <h2 className="sp-subtitle">{t("guide.license.title")}</h2>
          <p className="mt-4">{t("guide.license.body")}</p>
          <div className="mt-4">
            <TextLink href="/license#credit">{t("license.creditTitle")}</TextLink>
          </div>
        </div>
      </section>
      <TextLink href="/actors" className="mb-24">
        {t("guide.browse")}
      </TextLink>
    </div>
  );
}
