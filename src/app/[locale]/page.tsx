import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import Image from "next/image";
import type { AppLocale } from "@/i18n/routing";
import { ACTORS, latestActors } from "@/content/actors";
import { ActorCard } from "@/features/actors";
import { getActorAssets } from "@/features/assets";
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
  const items = ACTORS.flatMap((actor) => getActorAssets(actor.slug).items);
  const count = (kind: string) => items.filter((item) => item.kind === kind).length;
  return (
    <div className="sp-container">
      <section className="grid items-center gap-10 py-12 lg:min-h-[82vh] lg:grid-cols-12">
        <div className="lg:col-span-6">
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
            <TextLink href="/license#credit">{t("home.ctaBook")}</TextLink>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 lg:col-span-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible">
          {ACTORS.slice(0, 4).map((actor) => (
            <Link
              data-card
              key={actor.slug}
              href={`/actors/${actor.slug}`}
              className="group min-w-[118px] flex-1 lg:min-w-0"
            >
              <div className="sp-sweep sp-panel aspect-[3/5] lg:aspect-[3/5]">
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
          <p className="font-display text-[2.5rem] font-bold">{count("image")}</p>
          <p className="sp-small mt-1 text-muted-foreground">{t("home.statImages")}</p>
        </div>
        <div>
          <p className="font-display text-[2.5rem] font-bold">{count("voice")}</p>
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
        <SectionHead
          label={locale === "zh" ? "商用也免费" : "Free, even commercially"}
          title={
            locale === "zh"
              ? "用在哪都行，赚钱也行。"
              : "Use them anywhere. Even when you get paid."
          }
          note={
            locale === "zh"
              ? "不收钱，不填表，不用问。署上“Swim In AI”就行。"
              : "No fee, no forms, no asking. Just credit “Swim In AI”."
          }
        />
        <TextLink href="/license" className="mt-6">
          {locale === "zh" ? "看怎么署名" : "See how to credit"}
        </TextLink>
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
        <SectionHead label={t("home.worksLabel")} title={t("home.worksTitle")} />
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
        <SectionHead
          label={t("home.customLabel")}
          title={`${t("home.customTitle.0")} ${t("home.customTitle.1")}`}
        />
        <p className="sp-lead mt-6 max-w-2xl text-muted-foreground">{t("home.customBody")}</p>
        <TextLink href="/studio#work-with-us" className="mt-6">
          {t("home.customCta")}
        </TextLink>
      </section>
    </div>
  );
}
