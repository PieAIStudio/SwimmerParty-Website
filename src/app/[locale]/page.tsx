import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import Image from "next/image";
import type { AppLocale } from "@/i18n/routing";
import { ACTORS, latestActors } from "@/content/actors";
import { ActorCard } from "@/features/actors";
import { SectionHead } from "@/site/SectionHead";
import { TextLink } from "@/site/TextLink";
import { Link } from "@/i18n/navigation";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { WORKS } from "@/content/works";
import type { MessageContracts } from "@/i18n/message-contracts";
type Key = Extract<keyof MessageContracts, string>;
export default async function Home({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const newest = latestActors(5);
  const msg = (key: string) => t(key as Key, {} as never);
  return (
    <div className="sp-container">
      <section className="grid items-center gap-10 py-12 lg:min-h-[82vh] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="sp-label text-muted-foreground">{t("home.eyebrow")}</p>
          <h1 className="sp-display-xl mt-6">
            {[0, 1, 2].map((i) => (
              <span className="block" key={i}>
                {msg(`home.heroLines.${i}`)}
              </span>
            ))}
          </h1>
          <p className="sp-lead mt-6 max-w-[32rem] text-muted-foreground">
            {t("home.heroBody", { count: ACTORS.length })}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <GameButton variant="primary" href="/actors" linkComponent={Link}>
              {t("home.ctaAssets")}
            </GameButton>
            <TextLink href="/casting">{t("home.ctaBook")}</TextLink>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-6">
          {ACTORS.slice(0, 4).map((actor) => (
            <Link data-card key={actor.slug} href={`/actors/${actor.slug}`} className="group">
              <div className="sp-sweep sp-panel aspect-[3/5]">
                {actor.portrait ? (
                  <Image
                    src={actor.portrait}
                    alt={locale === "zh" ? actor.nameCn : actor.nameEn}
                    width={941}
                    height={1672}
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <p className="mt-3 font-display text-xl font-bold group-hover:underline">
                {locale === "zh" ? actor.nameCn : actor.nameEn}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-3 gap-6 py-10">
        <div>
          <p className="font-display text-[2.5rem] font-bold">{ACTORS.length}</p>
          <p className="sp-small mt-1 text-muted-foreground">{t("home.statActors")}</p>
        </div>
        <div>
          <p className="font-display text-[2.5rem] font-bold">263</p>
          <p className="sp-small mt-1 text-muted-foreground">{t("home.statImages")}</p>
        </div>
        <div>
          <p className="font-display text-[2.5rem] font-bold">111</p>
          <p className="sp-small mt-1 text-muted-foreground">{t("home.statVoices")}</p>
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("home.rosterLabel")}
          title={t("home.rosterTitle")}
          note={t("home.rosterNote")}
        />
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {ACTORS.slice(0, 4)
            .concat(ACTORS.slice(4, 12))
            .map((actor) => (
              <ActorCard key={actor.slug} actor={actor} />
            ))}
        </div>
        <TextLink href="/actors" className="mt-8">
          {t("home.rosterMore")}
        </TextLink>
      </section>
      <section className="sp-section sp-panel bg-card p-7 lg:p-12">
        <p className="sp-label text-muted-foreground">{t("home.stanceLabel")}</p>
        <h2 className="sp-display-lg mt-4">{t("home.stanceTitle")}</h2>
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
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <article key={i}>
              <p className="sp-code">{String(i).padStart(2, "0")}</p>
              <h3 className="sp-subtitle mt-4">{msg(`home.pipeline.${i}.title`)}</h3>
              <p className="sp-small mt-3 text-muted-foreground">
                {msg(`home.pipeline.${i}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead label={t("home.updatesLabel")} title={t("home.updatesTitle")} />
        <div className="mt-6 divide-y divide-border">
          {newest.map((actor) => (
            <Link
              data-card
              key={actor.slug}
              href={`/actors/${actor.slug}`}
              className="flex items-center justify-between gap-4 py-4 hover:underline"
            >
              <span>
                {actor.versionDate} · {locale === "zh" ? actor.nameCn : actor.nameEn}
              </span>
              <span className="sp-small">
                v{actor.version} · {actor.versionNote?.[locale]}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("home.worksLabel")}
          title={t("home.worksTitle")}
          note={t("home.worksNote")}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {WORKS.map((work) => (
            <Link
              data-card
              key={work.slug}
              href={`/works/${work.slug}`}
              className="sp-card bg-card"
            >
              <p className="sp-subtitle">{work.title[locale]}</p>
              <p className="sp-small mt-2 text-muted-foreground">{work.format[locale]}</p>
            </Link>
          ))}
        </div>
        <TextLink href="/works" className="mt-8">
          {t("home.worksCta")}
        </TextLink>
      </section>
    </div>
  );
}
