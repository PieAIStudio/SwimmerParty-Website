import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { ACTORS, getActor, STATUS_LABEL } from "@/content/actors";
import { getActorAssets, firstImage, slotLabelKey, StarterPackButton } from "@/features/assets";
import { ImageLightbox } from "@/features/assets";
import { VoiceTile } from "@/features/assets";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { ShareButton } from "@/site/ShareButton";
import { VersionBadge } from "@/site/VersionBadge";
import { TextLink } from "@/site/TextLink";
import { Link } from "@/i18n/navigation";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import { localizedAlternates } from "@/i18n/metadata";
import { WORKS } from "@/content/works";
import { CastAddButton } from "@/features/cast";
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
  const credits = WORKS.flatMap((work) =>
    work.cast.filter((credit) => credit.actor === actor.slug).map((credit) => ({ work, credit })),
  );
  return (
    <div className="sp-container overflow-x-clip [overflow-clip-margin:8px]">
      <Breadcrumbs
        ariaLabel={t("common.breadcrumb")}
        items={[{ label: t("nav.actors"), href: "/actors" }, { label: name }]}
      />
      <section className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="max-w-[560px] lg:col-span-7">
          {front ? (
            <ImageLightbox item={front} name={name} displayLarge />
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
            <span className="sp-small mt-3 block font-sans text-muted-foreground">{alternate}</span>
          </h1>
          <p className="sp-lead mt-6">{actor.tagline[locale]}</p>
          <GameBadge tone="neutral" className="mt-4">
            {t("common.animatedBadge")}
          </GameBadge>
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
          {voice ? (
            <div className="mt-8">
              <h2 className="sp-subtitle">{t("actor.voiceTitle", { name })}</h2>
              <div className="mt-4">
                <VoiceTile item={voice} label={t("assets.voice.intro")} reference />
              </div>
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-4">
            <StarterPackButton slug={actor.slug} />
            <CastAddButton slug={actor.slug} locale={locale} name={name} />
            <TextLink href="/cast">{t("actor.workWithUs")}</TextLink>
            <ShareButton />
          </div>
        </div>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("actor.referenceImages")}</h2>
        <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {assets.items
            .filter((i) => i.kind === "image")
            .slice(0, 8)
            .map((item) => (
              <div key={item.slot} className="overflow-hidden rounded-[var(--game-ui-radius-card)]">
                <ImageLightbox item={item} name={t(slotLabelKey(item.series, item.key))} />
              </div>
            ))}
        </div>
      </section>
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
                  <p className="sp-small mt-2 text-muted-foreground">{credit.role.note[locale]}</p>
                ) : null}
              </Link>
            ))
          ) : (
            <p className="sp-lead">{t("actor.noCredits")}</p>
          )}
        </div>
      </section>
      <TextLink href={`/actors/${next.slug}`} className="mt-8">
        {t("common.next", { name: locale === "zh" ? next.nameCn : next.nameEn })}
      </TextLink>
    </div>
  );
}
