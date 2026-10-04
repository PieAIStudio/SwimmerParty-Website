import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ACTORS, getActor } from "@/content/actors";
import { getActorAssets, firstImage } from "@/content/assets";
import { listSeries } from "@/content/asset-series";
import { CG_BADGE } from "@/content/doctrine";
import { routing, LOCALE_HTML_LANG, type AppLocale } from "@/i18n/routing";
import type { MessageContracts } from "@/i18n/message-contracts";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { TextLink } from "@/components/TextLink";
import { ActorPicture } from "@/components/ActorPicture";
import { AssetProgress } from "@/components/AssetProgress";
import { CopyBlock } from "@/components/CopyBlock";
import { AssetLibrarySections } from "@/components/assets/AssetLibrarySections";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import {
  AssetSelectionProvider,
  AssetSelectionBar,
  DownloadActorProfile,
} from "@/components/assets/AssetSelection";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  const { t } = await getSiteI18n(locale);
  const image = firstImage(slug, ["turnaround.front"]);
  return {
    title: t("assets.metaTitle", { name: locale === "zh" ? actor.nameCn : actor.nameEn }),
    alternates: {
      canonical: `/${locale}/kit/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((value) => [LOCALE_HTML_LANG[value], `/${value}/kit/${slug}`]),
      ),
    },
    openGraph: image ? { images: [{ url: image.preview, alt: actor.code }] } : undefined,
  };
}
export default async function ActorAssetPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  const actor = getActor(slug);
  if (!actor) notFound();
  const assets = getActorAssets(slug);
  const { t } = await getSiteI18n();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const face = firstImage(slug, ["face.front"]);
  const sections = listSeries().filter(
    (series) => series.required || assets.items.some((item) => item.series === series.id),
  );
  return (
    <div className="sp-container overflow-x-clip pb-24 [overflow-clip-margin:8px] md:pb-0">
      <AssetSelectionProvider actor={actor} assets={assets} key={actor.slug}>
        <div className="py-8">
          <TextLink href="/kit" back>
            {t("assets.back")}
          </TextLink>
        </div>
        <header className="pb-10">
          <div className="flex items-start gap-5">
            <ActorPicture
              src={face?.preview ?? actor.portrait}
              legacy={!face && Boolean(actor.portrait)}
              alt={name}
              sizes="64px"
              className="h-16 w-16 shrink-0 rounded-full"
            />
            <div className="min-w-0">
              <h1 className="sp-display-lg">{name}</h1>
              <span className="sp-code mt-3 block text-muted-foreground">{actor.code}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <AssetProgress slug={slug} />
            <GameBadge tone="ai">{CG_BADGE[locale]}</GameBadge>
          </div>
          <p className="sp-lead mt-6 max-w-3xl text-muted-foreground">
            {t("assets.intro", { name })}
          </p>
        </header>
        <div className="sp-library-toolbar sticky top-16 z-20 flex min-h-16 items-center gap-4 border-b border-border py-2">
          <nav
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-2"
            aria-label={t("assets.navigation")}
          >
            {sections.map((series) => (
              <a
                className="shrink-0 rounded-full border border-border px-3 py-1 text-sm"
                key={series.id}
                href={`#series-${series.id}`}
              >
                {t(
                  `assets.series.${series.id}` as Extract<
                    keyof MessageContracts,
                    `assets.series.${string}`
                  >,
                )}
              </a>
            ))}
            <a
              className="shrink-0 rounded-full border border-border px-3 py-1 text-sm"
              href="#series-text"
            >
              {t("assets.series.text")}
            </a>
          </nav>
          <AssetSelectionBar />
        </div>
        <AssetLibrarySections assets={assets} locale={locale} />
        <section id="series-text" className="sp-section scroll-mt-40">
          <h2 className="sp-title">{t("assets.series.text")}</h2>
          <div className="mt-8">
            {actor.promptSeed ? (
              <CopyBlock label={`${actor.code} / CHARACTER SEED`} text={actor.promptSeed} />
            ) : (
              <p className="text-muted-foreground">{t("assets.noSeed")}</p>
            )}
          </div>
          <div className="mt-6">
            <DownloadActorProfile actor={actor} assets={assets} />
          </div>
        </section>
        <AssetSelectionBar mobile />
      </AssetSelectionProvider>
    </div>
  );
}
