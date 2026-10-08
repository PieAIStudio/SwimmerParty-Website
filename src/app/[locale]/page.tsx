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
          <p className="mt-4 inline-flex rounded-full border border-border px-3 py-1 text-sm font-semibold">
            {locale === "zh"
              ? "商用免费 · 署名 Swim In AI"
              : "Free for commercial use · Credit Swim In AI"}
          </p>
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
            .concat(ACTORS.slice(4, 8))
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
        <TextLink href="/license" className="mt-6">
          {locale === "zh" ? "我们的承诺 →" : "Our promises →"}
        </TextLink>
      </section>
      <section className="sp-section sp-panel bg-card p-7 lg:p-12">
        <SectionHead
          label={locale === "zh" ? "商用也免费" : "Free, even commercially"}
          title={
            locale === "zh"
              ? "用在哪都行，赚钱也行。"
              : "Use them anywhere. Even when you get paid."
          }
          note={
            locale === "zh"
              ? "电影、广告、YouTube、游戏、漫画、周边，都行。不收钱，不填表，不用问。在开头和片尾字幕里放一行小字“Swim In AI”，就这么简单。"
              : "Films, ads, YouTube, games, comics, merch. No fee, no forms, no asking. Put “Swim In AI” in small text at the start and in the credits. That’s the whole deal."
          }
        />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {(locale === "zh"
            ? [
                "视频：开头一行小字，片尾字幕一行",
                "图片：角落一行小字",
                "声音、游戏、周边：写在致谢或简介里",
              ]
            : [
                "Video: one small line at the start, one in the end credits",
                "Image: one small line in a corner",
                "Audio, games, merch: in the credits or the description",
              ]
          ).map((x) => (
            <div key={x} className="sp-card bg-background p-4">
              {x}
            </div>
          ))}
        </div>
        <TextLink href="/license" className="mt-6">
          {locale === "zh" ? "看怎么署名 →" : "See how to credit →"}
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
      <section className="sp-section sp-panel bg-card p-7 lg:p-12" id="work-with-us">
        <SectionHead title={`${t("home.castingTitle.0")} ${t("home.castingTitle.1")}`} />
        <p className="sp-lead mt-6 max-w-2xl text-muted-foreground">{t("home.castingBody")}</p>
        <TextLink href="/studio#work-with-us" className="mt-6">
          {t("home.castingCta")}
        </TextLink>
      </section>
    </div>
  );
}
