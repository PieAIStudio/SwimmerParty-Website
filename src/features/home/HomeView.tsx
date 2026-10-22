import { ACTORS, type Actor } from "@/content/actors";
import { OFFICIAL_SAMPLES, type OfficialSample } from "@/content/official-samples.generated";
import { ActorCard } from "@/features/actors";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { TextLink } from "@/site/TextLink";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { selectHomeContent } from "./home-catalog";
import { SampleVideo } from "@/features/samples/client";
import { NextGraduation } from "@/features/community/client";

export async function HomeView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  const { ready, newFaces, featuredFaces, heroSamples, featured, updates } = selectHomeContent(
    ACTORS,
    OFFICIAL_SAMPLES,
  );
  return (
    <div className="sp-container">
      <section
        data-home-section="hero"
        className="grid items-center gap-7 py-8 lg:grid-cols-12 lg:gap-8 lg:py-10"
      >
        <div className="lg:col-span-4">
          <h1 className="sp-display-xl sp-home-title">
            <span className="block whitespace-nowrap">{t("home.heroLines.0")}</span>
            <span className="block whitespace-nowrap">{t("home.heroLines.1")}</span>
          </h1>
          <p className="sp-lead mt-5 max-w-[28rem] text-muted-foreground">{t("home.heroBody")}</p>
          <p className="sp-small mt-4 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            <span data-ready-count={ready.length}>
              {t("home.readyCount", { count: ready.length })}
            </span>
            <span data-new-face-count={newFaces.length}>
              {t("home.newFaceCount", { count: newFaces.length })}
            </span>
          </p>
          <GameButton className="mt-6" variant="primary" href="/actors" linkComponent={Link}>
            {t("home.ctaAssets")}
          </GameButton>
        </div>
        <div className="lg:col-span-8">
          {heroSamples.length ? (
            <div>
              <div
                className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:items-end lg:gap-5"
                data-same-actor-comparison
              >
                {heroSamples.map((entry, index) => (
                  <SamplePreview
                    key={entry.sample.sampleId}
                    entry={entry}
                    locale={locale}
                    hero
                    reference={heroSamples.length === 2 && index === 0}
                  />
                ))}
              </div>
              <p className="sp-small mt-3 text-muted-foreground">{t("samples.official")}</p>
            </div>
          ) : ready[0] ? (
            <div className="mx-auto max-w-48">
              <ActorCard actor={ready[0]} />
            </div>
          ) : null}
        </div>
      </section>
      {featured.length ? (
        <section data-home-section="samples" id="samples" className="sp-section scroll-mt-24">
          <h2 className="sp-title">{t("home.samplesTitle")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:gap-8">
            {featured.map((entry) => (
              <SamplePreview key={entry.sample.sampleId} entry={entry} locale={locale} />
            ))}
          </div>
          <TextLink href="/works#samples" className="mt-6">
            {t("samples.seeAll")}
          </TextLink>
        </section>
      ) : null}
      <section data-home-section="ready" className="sp-section">
        <h2 className="sp-title">{t("home.rosterTitle")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {ready.slice(0, 4).map((actor) => (
            <ActorCard key={actor.slug} actor={actor} />
          ))}
        </div>
        <TextLink href="/actors" className="mt-6">
          {t("home.rosterMore")}
        </TextLink>
      </section>
      {newFaces.length ? (
        <section data-home-section="new-faces" className="sp-section">
          <h2 className="sp-title">{t("roster.newFacesTitle")}</h2>
          <p className="sp-small mt-3 text-muted-foreground">{t("home.newFacesNote")}</p>
          <div className="mt-6 grid max-w-[36rem] grid-cols-2 gap-6">
            {featuredFaces.map((actor) => (
              <ActorCard key={actor.slug} actor={actor} />
            ))}
          </div>
        </section>
      ) : null}
      <NextGraduation />
      <section
        data-home-section="credit"
        className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-6"
      >
        <p className="sp-small">{t("home.licenseBadge")}</p>
        <TextLink href="/license#credit">{t("home.licenseCta")}</TextLink>
      </section>
      {updates.length ? (
        <section data-home-section="updates" className="sp-section">
          <h2 className="sp-title">{t("home.updatesTitle")}</h2>
          <div className="mt-6 divide-y divide-border">
            {updates.map((actor) => (
              <Link
                key={actor.slug}
                href={`/actors/${actor.slug}`}
                className="block py-4 hover:underline"
              >
                <span className="sp-small text-muted-foreground">
                  <time dateTime={actor.versionDate}>{actor.versionDate}</time> ·{" "}
                  {locale === "zh" ? actor.nameCn : actor.nameEn}
                </span>
                <p className="mt-1">{actor.versionNote?.[locale]}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** Compact homepage composition; actor/works pages keep the full existing recipe. */
async function SamplePreview({
  entry: { actor, sample },
  locale,
  hero = false,
  reference = false,
}: {
  entry: { actor: Actor; sample: OfficialSample };
  locale: AppLocale;
  hero?: boolean;
  reference?: boolean;
}) {
  const { t } = await getSiteI18n(locale);
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return (
    <figure
      data-official-sample={sample.slug}
      data-sample-id={sample.sampleId}
      className={
        reference
          ? "grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 lg:block"
          : "min-w-0"
      }
    >
      <SampleVideo
        src={sample.video}
        poster={sample.poster}
        label={t("samples.videoLabel", { name, tool: sample.tools.at(-1) ?? "" })}
        compactControl={reference}
        className={
          hero
            ? `${reference ? "aspect-[3/4]" : "aspect-video"} w-full bg-muted object-contain`
            : "aspect-9/16 max-h-[420px] w-full rounded-[var(--game-ui-radius-card)] bg-muted object-contain"
        }
      />
      <figcaption
        className={
          hero
            ? `sp-small grid gap-1 ${reference ? "lg:mt-3" : "mt-3"}`
            : "sp-small mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
        }
      >
        <Link href={`/actors/${actor.slug}`} className="font-semibold hover:underline">
          {name}
        </Link>
        <span className="text-muted-foreground">
          {hero ? sample.tools.at(-1) : sample.tools.join(" · ")}
        </span>
      </figcaption>
    </figure>
  );
}
