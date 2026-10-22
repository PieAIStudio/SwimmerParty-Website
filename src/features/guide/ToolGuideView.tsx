import Image from "next/image";
import { getActor } from "@/features/actors/queries";
import { firstImage } from "@/features/assets/queries";
import type { ToolTutorial } from "@/content/tutorials";
import { OFFICIAL_SAMPLES } from "@/content/official-samples.generated";
import { SampleVideo } from "@/features/samples/client";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { CopyBlock } from "@/site/CopyBlock";
import { TextLink } from "@/site/TextLink";
import { DownloadTerms } from "@/site/DownloadTerms";
import { GameButton } from "@pieai/swimmer-ui-kit";

export async function ToolGuideView({
  tutorial,
  locale,
}: {
  tutorial: ToolTutorial;
  locale: AppLocale;
}) {
  const { t } = await getSiteI18n(locale);
  const actor = getActor(tutorial.caseStudy?.actorSlug ?? "tang-yunqiu");
  const image = actor ? firstImage(actor.slug, ["turnaround.front"]) : null;
  const result = OFFICIAL_SAMPLES.find(
    (sample) => sample.sampleId === tutorial.caseStudy?.sampleId,
  );
  return (
    <div className="sp-container pb-20" data-tool-guide={tutorial.id}>
      <Breadcrumbs items={[{ label: t("nav.learn"), href: "/guide" }, { label: tutorial.tool }]} />
      <h1 className="sp-display-lg mt-5">{tutorial.goal[locale]}</h1>
      <p className="sp-lead mt-4">{tutorial.tool}</p>
      <section className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="sp-title">{t("learn.before")}</h2>
          <p className="mt-4" data-tool-access>
            {tutorial.access[locale]}
          </p>
          <DownloadTerms className="mt-4" />
          <h2 className="sp-title mt-8">{t("learn.steps")}</h2>
          <ol className="mt-5 list-decimal space-y-4 pl-6" data-tool-steps>
            {tutorial.steps.map((step, index) => (
              <li key={index}>{step[locale]}</li>
            ))}
          </ol>
        </div>
        <figure className="sp-panel bg-card p-5">
          {image ? (
            <Image
              src={image.preview}
              alt={t("learn.inputPreview")}
              width={360}
              height={520}
              sizes="(min-width: 1024px) 330px, 90vw"
              className="mx-auto h-72 w-full object-contain"
            />
          ) : null}
          <figcaption className="sp-small mt-3">{t("learn.inputPreview")}</figcaption>
          <TextLink href={actor ? `/actors/${actor.slug}#assets` : "/actors"} className="mt-5">
            {t("learn.getReference")}
          </TextLink>
        </figure>
      </section>
      <section className="mt-10" data-tutorial-prompt>
        <CopyBlock label={t("learn.prompt")} text={tutorial.prompt[locale]} />
      </section>
      {result && tutorial.caseStudy && tutorial.reproducedAt ? (
        <section className="mt-8 grid gap-5 md:grid-cols-2" data-tested-tutorial>
          <div>
            <h2 className="sp-title">{t("learn.resultPreview")}</h2>
            <p className="sp-small mt-3" data-reproduction-date>
              {t("learn.testedOn", { date: tutorial.reproducedAt })}
            </p>
            <p className="mt-4">{tutorial.caseStudy.result[locale]}</p>
          </div>
          <SampleVideo
            src={result.video}
            poster={result.poster}
            label={t("learn.resultPreview")}
            className="aspect-video max-h-80 w-full rounded-[var(--game-ui-radius-card)] bg-muted object-contain"
          />
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="sp-title">{t("learn.checkResult")}</h2>
        <p className="mt-4 max-w-3xl">{tutorial.troubleshoot[locale]}</p>
        <p className="sp-small mt-4 text-muted-foreground">{t("learn.noOutput")}</p>
        <GameButton
          href={tutorial.entry}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5"
        >
          {t("learn.openTool")}
        </GameButton>
        <p className="sp-small mt-2 text-muted-foreground">{t("learn.externalCost")}</p>
      </section>
      <section className="mt-10">
        <h2 className="sp-subtitle">{t("learn.sources")}</h2>
        <ul className="mt-4 space-y-2">
          {tutorial.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
