import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { ACTORS, getActor } from "@/content/actors";
import {
  getActorAssets,
  firstImage,
  listSeries,
  AssetLibrarySections,
  AssetSelectionProvider,
  AssetSelectionBar,
  DownloadActorProfile,
  SeriesJumpButton,
} from "@/features/assets";
import { routing, type AppLocale } from "@/i18n/routing";
import { localizedAlternates } from "@/i18n/metadata";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { CopyBlock } from "@/site/CopyBlock";
import { VersionBadge } from "@/site/VersionBadge";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import { TextLink } from "@/site/TextLink";
import { KIT_RULES } from "@/content/kit";
import type { MessageContracts } from "@/i18n/message-contracts";
type Key = Extract<keyof MessageContracts, string>;
type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  const { t } = await getSiteI18n(locale);
  return {
    title: t("assets.metaTitle", { name: locale === "zh" ? actor.nameCn : actor.nameEn }),
    alternates: localizedAlternates(locale, `/actors/${slug}/assets`),
  };
}
export default async function AssetsPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  if (slug === "he-jie" || slug === "dai-er")
    permanentRedirect(
      `/${locale}/actors/${slug === "he-jie" ? "tang-yunqiu" : "misha-luo"}/assets`,
    );
  const actor = getActor(slug);
  if (!actor) notFound();
  const assets = getActorAssets(slug);
  const { t } = await getSiteI18n();
  const msg = (key: string) => t(key as Key, {} as never);
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const imageSeries = listSeries().filter(
    (s) =>
      !["voice", "video"].includes(s.id) &&
      (s.required || assets.items.some((i) => i.series === s.id)),
  );
  return (
    <div className="sp-container overflow-x-clip pb-24">
      <AssetSelectionProvider actor={actor} assets={assets}>
        <Breadcrumbs
          ariaLabel={t("common.breadcrumb")}
          items={[
            { label: t("nav.actors"), href: "/actors" },
            { label: name, href: `/actors/${slug}` },
            { label: t("assets.breadcrumb") },
          ]}
        />
        <header className="pb-10">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
              <Image
                src={
                  firstImage(slug, ["face.front"])?.preview ??
                  actor.portrait ??
                  "/media/placeholder.svg"
                }
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="sp-display-lg">{name}</h1>
                <VersionBadge
                  version={actor.version}
                  date={actor.versionDate}
                  note={actor.versionNote?.[locale]}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <GameBadge tone="neutral">{t("common.animatedBadge")}</GameBadge>
              </div>
            </div>
          </div>
          <p className="sp-lead mt-6 max-w-3xl text-muted-foreground">{t("assets.intro")}</p>
        </header>
        <div className="sp-library-toolbar sticky top-16 z-20 flex min-h-16 items-center gap-4 border-b border-border py-2">
          <nav
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-2"
            aria-label={t("assets.navigation")}
          >
            {imageSeries.map((s) => (
              <SeriesJumpButton key={s.id} id={`series-${s.id}`}>
                {msg(`assets.series.${s.id}`)}
              </SeriesJumpButton>
            ))}
            <SeriesJumpButton id="series-voice">{t("assets.series.voice")}</SeriesJumpButton>
            <SeriesJumpButton id="series-video">{t("assets.series.video")}</SeriesJumpButton>
            <SeriesJumpButton id="series-how-to">{t("assets.series.howTo")}</SeriesJumpButton>
            <SeriesJumpButton id="series-text">{t("assets.series.text")}</SeriesJumpButton>
            <SeriesJumpButton id="series-rules">{t("assets.series.rules")}</SeriesJumpButton>
          </nav>
          <AssetSelectionBar />
        </div>
        <AssetLibrarySections assets={assets} locale={locale} actorName={name} />
        <section id="series-how-to" className="sp-section scroll-mt-40">
          <h2 className="sp-title">{t("assets.series.howTo")}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="sp-card bg-card">
                <span className="sp-code">{String(i).padStart(2, "0")}</span>
                <p className="mt-4">{t(`assets.howTo.${i}` as Key, {} as never)}</p>
              </li>
            ))}
          </ol>
          <p className="sp-small mt-6 text-muted-foreground">{t("assets.howTo.credit")}</p>
        </section>
        <section id="series-text" className="sp-section scroll-mt-40">
          <h2 className="sp-title">{t("assets.series.text")}</h2>
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
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[true, false].map((allow) => (
              <div key={String(allow)} className="sp-card bg-card">
                <h3 className="sp-subtitle">{t(allow ? "assets.can" : "assets.dont")}</h3>
                <ul className="mt-6 space-y-5">
                  {KIT_RULES.filter((r) => r.allow === allow).map((rule) => (
                    <li key={rule.id}>
                      <h4 className="font-semibold">{rule.head[locale]}</h4>
                      <p className="sp-small mt-2 text-muted-foreground">{rule.body[locale]}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <TextLink href="/pact" className="mt-8">
            {t("assets.rulesPact")}
          </TextLink>
        </section>
        <AssetSelectionBar mobile />
      </AssetSelectionProvider>
    </div>
  );
}
