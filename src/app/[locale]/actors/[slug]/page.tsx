import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { ACTORS, getActor, STATUS_LABEL } from "@/content/actors";
import {
  getActorAssets,
  firstImage,
  listSeries,
  StarterPackButton,
  starterSlots,
  ImageLightbox,
  VoiceTile,
  AssetLibrarySections,
  AssetSelectionProvider,
  AssetSelectionBar,
  DownloadActorProfile,
  SeriesJumpButton,
} from "@/features/assets";
import { CopyBlock } from "@/site/CopyBlock";
import type { MessageContracts } from "@/i18n/message-contracts";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { ShareButton } from "@/site/ShareButton";
import { VersionBadge } from "@/site/VersionBadge";
import { TextLink } from "@/site/TextLink";
import { Link } from "@/i18n/navigation";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import { localizedAlternates } from "@/i18n/metadata";
import { WORKS } from "@/content/works";
import { CastAddButton } from "@/features/cast";
import { ActorSample } from "@/features/samples";
type Key = Extract<keyof MessageContracts, string>;
type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  return {
    title: locale === "zh" ? actor.nameCn : actor.nameEn,
    description: actor.tagline[locale],
    alternates: localizedAlternates(locale, `/actors/${slug}`),
  };
}
export default async function ActorPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  if (slug === "he-jie" || slug === "dai-er")
    permanentRedirect(`/${locale}/actors/${slug === "he-jie" ? "tang-yunqiu" : "misha-luo"}`);
  const actor = getActor(slug);
  if (!actor) notFound();
  const { t } = await getSiteI18n();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const alternate = locale === "zh" ? actor.nameEn : actor.nameCn;
  const assets = getActorAssets(slug);
  const front = firstImage(slug, ["turnaround.front"]);
  const next = ACTORS[(ACTORS.indexOf(actor) + 1) % ACTORS.length];
  const voice = assets.items.find((i) => i.kind === "voice" && i.key === "intro");
  const frontLabel = actor.status === "new-face" ? t("assets.castingPhoto") : name;
  // The info table and appearances already say who they are; new faces only add what's next.
  const description =
    actor.status === "new-face"
      ? locale === "zh"
        ? "目前只有一张照片和一段声音。"
        : "One photo and one voice so far."
      : null;
  const isNewFace = actor.status === "new-face";
  const msg = (key: string) => t(key as Key, {} as never);
  // The library sits below the profile; the intro voice already plays in the profile.
  const imageSeries = listSeries().filter(
    (s) =>
      !["voice", "video"].includes(s.id) &&
      (s.required || assets.items.some((i) => i.series === s.id)) &&
      (!isNewFace || assets.items.some((i) => i.series === s.id)),
  );
  const moreVoices = assets.items.some((i) => i.kind === "voice" && i.slot !== voice?.slot);
  const hasVideo = assets.items.some((i) => i.kind === "video");
  const credits = WORKS.flatMap((work) =>
    work.cast.filter((credit) => credit.actor === actor.slug).map((credit) => ({ work, credit })),
  );
  return (
    <div className="sp-container overflow-x-clip [overflow-clip-margin:8px] pb-24">
      <AssetSelectionProvider actor={actor} assets={assets}>
        <Breadcrumbs
          ariaLabel={t("common.breadcrumb")}
          items={[{ label: t("nav.actors"), href: "/actors" }, { label: name }]}
        />
        <section className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="max-w-[560px] lg:col-span-7">
            {front ? (
              <ImageLightbox item={front} name={`${name} · ${frontLabel}`} displayLarge />
            ) : (
              <div className="sp-sweep sp-panel aspect-4/5" />
            )}
          </div>
          <div className="min-w-0 lg:col-span-5">
            <div className="flex flex-wrap items-center gap-3">
              <GameBadge tone={actor.status === "active" ? "success" : "neutral"}>
                {STATUS_LABEL[actor.status][locale]}
              </GameBadge>
              <VersionBadge
                version={actor.version}
                date={actor.versionDate}
                note={actor.versionNote?.[locale]}
                history={actor.versionHistory?.map((entry) => ({
                  ...entry,
                  note: entry.note[locale],
                }))}
              />
            </div>
            <h1 className="sp-display-lg mt-5">
              {name}
              <span className="sp-small mt-3 block font-sans text-muted-foreground">
                {alternate}
              </span>
            </h1>
            <p className="sp-lead mt-6">{actor.tagline[locale]}</p>
            <div className="mt-6 flex flex-wrap items-start gap-4">
              <StarterPackButton
                actor={{
                  slug: actor.slug,
                  nameEn: actor.nameEn,
                  nameCn: actor.nameCn,
                  promptSeed: actor.promptSeed,
                  slots: starterSlots(assets.items),
                }}
              />
              <CastAddButton slug={actor.slug} locale={locale} name={name} />
            </div>
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
            {description ? <p className="mt-6">{description}</p> : null}
            {voice ? (
              <div className="mt-8">
                <h2 className="sp-subtitle">{t("actor.voiceTitle", { name })}</h2>
                <div className="mt-4">
                  <VoiceTile item={voice} label={t("assets.voice.intro")} reference />
                </div>
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <TextLink href="/license#credit">{t("actor.workWithUs")}</TextLink>
              <ShareButton />
            </div>
          </div>
        </section>
        <div
          id="assets"
          className="sp-library-toolbar sticky top-16 z-20 mt-16 flex min-h-16 scroll-mt-16 items-center gap-4 border-b border-border py-2"
        >
          <nav
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-2"
            aria-label={t("assets.navigation")}
          >
            {imageSeries.map((s) => (
              <SeriesJumpButton key={s.id} id={`series-${s.id}`}>
                {msg(`assets.series.${s.id}`)}
              </SeriesJumpButton>
            ))}
            {moreVoices ? (
              <SeriesJumpButton id="series-voice">{t("assets.series.voice")}</SeriesJumpButton>
            ) : null}
            {hasVideo ? (
              <SeriesJumpButton id="series-video">{t("assets.series.video")}</SeriesJumpButton>
            ) : null}
            <SeriesJumpButton id="series-how-to">{t("assets.series.howTo")}</SeriesJumpButton>
            <SeriesJumpButton id="series-rules">{t("assets.series.rules")}</SeriesJumpButton>
          </nav>
          <AssetSelectionBar />
        </div>
        <AssetLibrarySections
          assets={assets}
          locale={locale}
          actorName={name}
          isNewFace={isNewFace}
          skipVoiceSlot={voice?.slot}
        />
        <section id="series-how-to" className="sp-section scroll-mt-40">
          <h2 className="sp-title">{t("assets.series.howTo")}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="sp-card bg-card">
                <span className="sp-code">{String(i).padStart(2, "0")}</span>
                <p className="mt-4">
                  {t(
                    `assets.howTo.${isNewFace && i !== 2 ? `newFace${i}` : i}` as Key,
                    {} as never,
                  )}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            {actor.promptSeed ? (
              <CopyBlock label={t("assets.characterPrompt", { name })} text={actor.promptSeed} />
            ) : (
              <p className="text-muted-foreground">{t("assets.noSeed")}</p>
            )}
          </div>
          <p className="sp-small mt-4 text-muted-foreground">{t("assets.characterPromptNote")}</p>
          <div className="mt-6">
            <DownloadActorProfile actor={actor} assets={assets} />
          </div>
        </section>
        <section id="series-rules" className="sp-section scroll-mt-40">
          <h2 className="sp-title">{t("assets.rulesTitle")}</h2>
          <p className="mt-6 max-w-3xl text-lg">{t("assets.rulesBody", { name })}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <CopyBlock label={t("assets.copyCredit", { name })} text={`${name} · Swim In AI`} />
            <TextLink href="/license">{t("assets.rulesPact")}</TextLink>
          </div>
        </section>
        <ActorSample slug={actor.slug} />
        <section className="sp-section">
          <h2 className="sp-title">{t("actor.appearances")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {credits.length ? (
              credits.map(({ work, credit }) => (
                <Link
                  data-card
                  key={`${work.code}-${actor.slug}`}
                  href={`/works/${work.slug}`}
                  className="sp-card bg-card hover:bg-muted"
                >
                  <p className="sp-subtitle">{work.title[locale]}</p>
                  <p className="mt-2">
                    {credit.role
                      ? t("actor.appearanceRole", { role: credit.role.name[locale] })
                      : t("actor.roleTbd")}
                  </p>
                  {credit.role?.note?.[locale] ? (
                    <p className="sp-small mt-2 text-muted-foreground">
                      {credit.role.note[locale]}
                    </p>
                  ) : null}
                </Link>
              ))
            ) : (
              <p className="sp-lead">{t("actor.noCredits", { name })}</p>
            )}
          </div>
        </section>
        <TextLink href={`/actors/${next.slug}`} className="mt-8">
          {t("common.next", { name: locale === "zh" ? next.nameCn : next.nameEn })}
        </TextLink>
        <AssetSelectionBar mobile />
      </AssetSelectionProvider>
    </div>
  );
}
