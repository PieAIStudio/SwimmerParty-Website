import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import { ACTORS } from "@/content/actors";
import { getKitManifest } from "@/features/assets/kit-assets";
import { getActorAssets, firstImage } from "@/features/assets/assets";
import { slotLabelKey } from "@/features/assets/asset-series";
import { CG_BADGE } from "@/content/doctrine";
import { ActorCard } from "@/features/actors";
import { ActorPicture } from "@/features/actors";
import { SectionHead } from "@/site/SectionHead";
import { TextLink } from "@/site/TextLink";
import { Reveal } from "@/site/Reveal";
import { StageMount } from "@/features/stage";
import { GameBadge, GameButton } from "@pieai/swimmer-ui-kit";
import { Link } from "@/i18n/navigation";

export default async function Home({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const stats = [
    [ACTORS.length, t("home.statRoster")],
    [ACTORS.filter((actor) => actor.status === "active").length, t("home.statCastable")],
    [ACTORS.reduce((sum, actor) => sum + actor.version.current, 0), t("home.statVersions")],
    [
      ACTORS.filter((actor) => firstImage(actor.slug, ["turnaround.front"])).length,
      t("home.statPlates"),
    ],
    [getKitManifest().filter((item) => item.status === "live").length, t("home.statKitLive")],
  ] as const;
  const previews = ACTORS.flatMap((actor) =>
    getActorAssets(actor.slug).items.map((item) => ({
      ...item,
      alt: `${actor.code} ${t(slotLabelKey(item.series, item.key))}`,
    })),
  ).slice(0, 6);
  return (
    <div className="sp-container">
      <section className="grid items-center gap-10 py-12 lg:min-h-[82vh] lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <p className="sp-label text-muted-foreground">{t("home.eyebrow")}</p>
          <h1 className="sp-display-xl mt-6">
            {([0, 1, 2] as const).map((index) => (
              <span className="block" key={index}>
                {index ? " " : ""}
                {t(`home.heroLines.${index}`)}
              </span>
            ))}
          </h1>
          <p className="sp-lead mt-6 max-w-[32rem] text-muted-foreground">{t("home.heroBody")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <GameButton variant="primary" href="/kit" linkComponent={Link}>
              {t("home.ctaAssets")}
            </GameButton>
            <TextLink href="/actors">{t("home.ctaRoster")}</TextLink>
            <TextLink href="/casting" className="text-muted-foreground">
              {t("home.ctaBook")}
            </TextLink>
          </div>
        </div>
        <div className="sp-panel sp-sweep relative h-[56vh] min-h-80 lg:col-span-7 lg:h-[68vh] lg:max-h-[760px]">
          <StageMount assemble />
        </div>
      </section>
      <section
        className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-5"
        aria-label={t("home.rosterLabel")}
      >
        {stats.map(([value, label]) => (
          <div key={label}>
            <p className="font-display text-[2.5rem] leading-tight font-bold">{value}</p>
            <p className="sp-small mt-1 text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("home.rosterLabel")}
          title={t("home.rosterTitle")}
          note={t("home.rosterNote")}
        />
        <Reveal className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:mt-10 lg:grid-cols-4">
          {ACTORS.slice(0, 8).map((actor) => (
            <div key={actor.slug} className="sp-reveal min-w-0">
              <ActorCard actor={actor} />
            </div>
          ))}
        </Reveal>
        <TextLink href="/actors" className="mt-8">
          {t("home.rosterMore", { count: ACTORS.length })}
        </TextLink>
      </section>
      <section className="sp-panel bg-card p-7 lg:p-12">
        <p className="sp-label text-muted-foreground">{t("home.stanceLabel")}</p>
        <h2 className="sp-display-lg mt-4">
          {([0, 1, 2] as const).map((index) => (
            <span className="block" key={index}>
              {index ? " " : ""}
              {t(`home.stanceTitle.${index}`)}
            </span>
          ))}
        </h2>
        <GameBadge tone="neutral" className="mt-6">
          {CG_BADGE[locale]}
        </GameBadge>
        <p className="sp-lead mt-6 max-w-[48rem] text-muted-foreground">{t("home.stanceBody")}</p>
        <TextLink href="/pact" className="mt-6">
          {t("home.stanceCta")}
        </TextLink>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("home.methodLabel")}
          title={t("home.methodTitle")}
          note={t("home.methodNote")}
        />
        <Reveal className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-4">
          {([0, 1, 2, 3] as const).map((index) => (
            <article key={index} className="sp-reveal">
              <p className="sp-code text-muted-foreground">{t(`home.pipeline.${index}.step`)}</p>
              <h3 className="sp-subtitle mt-4">{t(`home.pipeline.${index}.title`)}</h3>
              <p className="sp-small mt-3 text-muted-foreground">
                {t(`home.pipeline.${index}.body`)}
              </p>
            </article>
          ))}
        </Reveal>
      </section>
      <section className="sp-section grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHead
            label={t("home.kitLabel")}
            title={t("home.kitTitle")}
            note={t("home.kitNote")}
          />
          <TextLink href="/kit" className="mt-6">
            {t("home.kitCta")}
          </TextLink>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {previews.map((image) => (
            <ActorPicture
              key={image.preview}
              src={image.preview}
              alt={image.alt}
              sizes="(min-width: 1200px) 160px, (min-width: 1024px) 14vw, 28vw"
              legacy={image.conformance === "legacy"}
              fullBody={["turnaround", "wardrobe", "pose"].includes(image.series)}
              legacyLabel={t("assets.legacy")}
              className="aspect-2/3 rounded-[var(--game-ui-radius-card)]"
            />
          ))}
        </div>
      </section>
      <section className="sp-section grid gap-6 lg:grid-cols-2">
        <article className="sp-card bg-card">
          <SectionHead label={t("home.pactLabel")} title={t("home.pactTitle")} />
          <p className="sp-small mt-4 text-muted-foreground">{t("home.pactNote")}</p>
          <TextLink href="/pact" className="mt-6">
            {t("home.pactCta")}
          </TextLink>
        </article>
        <article className="sp-card bg-card">
          <SectionHead label={t("home.worksLabel")} title={t("home.worksTitle")} />
          <p className="sp-small mt-4 text-muted-foreground">{t("home.worksNote")}</p>
          <TextLink href="/works" className="mt-6">
            {t("home.worksCta")}
          </TextLink>
        </article>
      </section>
      <section className="sp-section text-center">
        <h2 className="sp-display-lg">
          {t("home.castingTitle.0")} {t("home.castingTitle.1")}
        </h2>
        <p className="sp-lead mx-auto mt-6 max-w-[36rem] text-muted-foreground">
          {t("home.castingBody")}
        </p>
        <TextLink href="/casting" className="mt-8">
          {t("home.castingCta")}
        </TextLink>
      </section>
    </div>
  );
}
