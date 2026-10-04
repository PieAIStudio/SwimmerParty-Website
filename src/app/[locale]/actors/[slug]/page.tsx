import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { ACTORS, getActor, STATUS_LABEL } from "@/content/actors";
import { CG_BADGE, STANCE_LINE } from "@/content/doctrine";
import { ActorPicture } from "@/components/ActorPicture";
import { CopyBlock } from "@/components/CopyBlock";
import { SectionHead } from "@/components/SectionHead";
import { TextLink } from "@/components/TextLink";
import { StageMount } from "@/features/stage";
import { GameBadge, GameButton, GameCallout } from "@pieai/swimmer-ui-kit";
import { getActorAssets, firstImage } from "@/content/assets";
import { slotLabelKey } from "@/content/asset-series";
import { AssetProgress } from "@/components/AssetProgress";
import { HeightScale } from "@/components/HeightScale";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  const image = firstImage(slug, ["turnaround.front"]);
  return {
    title: `${locale === "zh" ? actor.nameCn : actor.nameEn} — ${actor.code}`,
    description: `${actor.tagline[locale]} ${STANCE_LINE[locale]}`,
    openGraph: image
      ? { images: [{ url: image.preview, alt: `${actor.code} — ${actor.nameEn}` }] }
      : undefined,
  };
}
export default async function ActorPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  const actor = getActor(slug);
  if (!actor) notFound();
  const { t } = await getSiteI18n();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const alternateName = locale === "zh" ? actor.nameEn : actor.nameCn;
  const next = ACTORS[(ACTORS.indexOf(actor) + 1) % ACTORS.length];
  const previews = getActorAssets(slug).items.slice(0, 8);
  const front = firstImage(slug, ["turnaround.front"]);
  return (
    <div className="sp-container">
      <div className="py-8">
        <TextLink href="/actors" back>
          {t("common.backToRoster")}
        </TextLink>
      </div>
      <section className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          {front ? (
            <ActorPicture
              src={front.preview}
              alt={`${name} — ${actor.code}`}
              sizes="(min-width: 1200px) 610px, (min-width: 1024px) 52vw, 90vw"
              legacy={front.conformance === "legacy"}
              fullBody
              legacyLabel={t("assets.legacy")}
              priority
              className="sp-panel aspect-4/5"
            >
              {front.conformance === "v1" && actor.heightCm ? (
                <HeightScale heightCm={actor.heightCm} />
              ) : null}
            </ActorPicture>
          ) : (
            <div className="sp-sweep sp-panel relative aspect-4/5">
              <StageMount />
              <GameBadge tone="neutral" className="absolute top-4 left-4">
                {t("actor.inDevelopment")}
              </GameBadge>
            </div>
          )}
          {!front ? (
            <div className="mt-6">
              <p className="sp-label">{t("actor.noPlate")}</p>
              <p className="sp-small mt-2 text-muted-foreground">{t("actor.noPlateBody")}</p>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 lg:col-span-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="sp-code">{actor.code}</span>
            <GameBadge tone={actor.status === "active" ? "success" : "neutral"}>
              {actor.status === "active"
                ? t("roster.castableLabel")
                : actor.status === "in-development"
                  ? t("actor.inDevelopment")
                  : STATUS_LABEL[actor.status][locale]}
            </GameBadge>
          </div>
          <h1 className="sp-display-lg mt-5">
            {name}
            <span
              className="sp-small mt-3 block font-sans text-muted-foreground"
              lang={locale === "zh" ? "en" : "zh-Hans"}
            >
              {alternateName}
            </span>
          </h1>
          <p className="sp-lead mt-6">{actor.tagline[locale]}</p>
          <GameBadge tone="neutral" className="mt-4">
            {CG_BADGE[locale]}
          </GameBadge>
          <p className="sp-code mt-6 text-muted-foreground">
            VERSION {actor.version.current} / {actor.version.total}
          </p>
          <dl className="mt-4 divide-y divide-border">
            {actor.spec.map((row) => (
              <div
                key={row.id}
                className="grid min-h-11 grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] items-baseline gap-4 py-3"
              >
                <dt className="sp-label text-muted-foreground">{row.label[locale]}</dt>
                <dd>{row.value[locale]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6">{actor.note[locale]}</p>
          <p className="sp-label mt-6 text-muted-foreground">{t("actor.castFor")}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {actor.castFor[locale].map((value) => (
              <li key={value}>
                <GameBadge tone="neutral">{value}</GameBadge>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-6">
            <GameButton variant="primary" linkComponent={Link} href={`/kit/${actor.slug}`}>
              {t("assets.openLibrary")}
            </GameButton>
            <TextLink href={`/casting?actor=${actor.slug}`} className="text-muted-foreground">
              {t("common.enquire")}
            </TextLink>
          </div>
        </div>
      </section>
      <section className="sp-section">
        <SectionHead label={actor.code} title={t("kit.platesLabel")} />
        {previews.length ? (
          <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:mt-10 lg:grid-cols-8">
            {previews.slice(0, 8).map((view) => (
              <ActorPicture
                key={view.slot}
                src={view.thumb}
                alt={`${actor.code} ${t(slotLabelKey(view.series, view.key))}`}
                legacy={view.conformance === "legacy"}
                fullBody={["turnaround", "wardrobe", "pose"].includes(view.series)}
                sizes="(min-width: 1200px) 120px, (min-width: 640px) 14vw, 19vw"
                className="aspect-2/3 rounded-[var(--game-ui-radius-card)]"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <GameCallout tone="neutral">{t("assets.none")}</GameCallout>
          </div>
        )}
        <div className="mt-6 max-w-xs">
          <AssetProgress slug={actor.slug} />
        </div>
        <TextLink href={`/kit/${actor.slug}`} className="mt-6">
          {t("assets.openLibrary")}
        </TextLink>
      </section>
      {actor.promptSeed ? (
        <section className="pb-16">
          <CopyBlock label={`${actor.code} / CHARACTER SEED`} text={actor.promptSeed} />
          <p className="sp-small mt-3 text-muted-foreground">{t("actor.seedEnNote")}</p>
        </section>
      ) : null}
      <TextLink href={`/actors/${next.slug}`} className="mt-8">
        {t("common.next")}: {locale === "zh" ? next.nameCn : next.nameEn}
      </TextLink>
    </div>
  );
}
