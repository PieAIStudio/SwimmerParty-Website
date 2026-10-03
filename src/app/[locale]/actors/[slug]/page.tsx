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
import { StageMount } from "@/three/StageMount";
import { GameCallout, GameProgress } from "@/ui/kit";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((actor) => ({ locale, slug: actor.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  return {
    title: `${locale === "zh" ? actor.nameCn : actor.nameEn} — ${actor.code}`,
    description: `${actor.tagline[locale]} ${STANCE_LINE[locale]}`,
    openGraph: actor.plate
      ? { images: [{ url: actor.plate, alt: `${actor.code} — ${actor.nameEn}` }] }
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
  const previews = actor.views.length
    ? actor.views
    : actor.plate
      ? [{ id: "front", src: actor.plate, label: { en: "Front", zh: "正面" } }]
      : [];
  return (
    <div className="sp-container">
      <div className="py-8">
        <TextLink href="/actors" back>
          {t("common.backToRoster")}
        </TextLink>
      </div>
      <section className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          {actor.plate ? (
            <ActorPicture
              src={actor.plate}
              alt={`${name} — ${actor.code}`}
              sizes="(min-width: 1200px) 610px, (min-width: 1024px) 52vw, 90vw"
              legacy
              fullBody
              legacyLabel={t("assets.legacy")}
              priority
              className="sp-panel aspect-4/5"
            />
          ) : (
            <div className="sp-sweep sp-panel relative aspect-4/5">
              <StageMount />
              <span className="sp-pill absolute top-4 left-4 text-muted-foreground">
                {t("actor.inDevelopment")}
              </span>
            </div>
          )}
          {!actor.plate ? (
            <div className="mt-6">
              <p className="sp-label">{t("actor.noPlate")}</p>
              <p className="sp-small mt-2 text-muted-foreground">{t("actor.noPlateBody")}</p>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 lg:col-span-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="sp-code">{actor.code}</span>
            <span
              className={`sp-pill ${actor.status === "active" ? "" : "text-muted-foreground"}`}
              data-active={actor.status === "active"}
            >
              {actor.status === "active"
                ? t("roster.castableLabel")
                : actor.status === "in-development"
                  ? t("actor.inDevelopment")
                  : STATUS_LABEL[actor.status][locale]}
            </span>
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
          <span className="sp-pill mt-4">{CG_BADGE[locale]}</span>
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
              <li className="sp-pill" key={value}>
                {value}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-6">
            <TextLink href={`/kit#${actor.code}`}>{t("assets.openLibrary")}</TextLink>
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
                key={view.id}
                src={view.src}
                alt={`${actor.code} ${view.label[locale]}`}
                legacy
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
          <GameProgress
            value={previews.length}
            max={21}
            label={t("assets.progress", { done: previews.length, total: 21 })}
          />
        </div>
        <TextLink href={`/kit#${actor.code}`} className="mt-6">
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
