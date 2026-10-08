import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { ShareButton } from "@/site/ShareButton";
import { Link } from "@/i18n/navigation";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import { localizedAlternates } from "@/i18n/metadata";
type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => WORKS.map((work) => ({ locale, slug: work.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const work = WORKS.find((w) => w.slug === slug);
  if (!work) return {};
  return {
    title: work.title[locale],
    description: work.logline[locale],
    alternates: localizedAlternates(locale, `/works/${slug}`),
  };
}
export default async function WorkPage({ params }: Props) {
  const { locale, slug } = await params;
  setSiteLocale(locale);
  const work = WORKS.find((w) => w.slug === slug);
  if (!work) notFound();
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <Breadcrumbs
        ariaLabel={t("common.breadcrumb")}
        items={[{ label: t("nav.works"), href: "/works" }, { label: work.title[locale] }]}
      />
      <section className="grid items-start gap-8 lg:grid-cols-12">
        <div className="sp-sweep sp-panel relative aspect-video lg:col-span-7">
          <GameBadge tone="neutral" className="absolute top-4 left-4">
            {t("works.keyArt")}
          </GameBadge>
        </div>
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="sp-code">{work.code}</span>
            <GameBadge tone="neutral">{WORK_STATUS_LABEL[work.status][locale]}</GameBadge>
          </div>
          <h1 className="sp-display-lg mt-5">{work.title[locale]}</h1>
          <p className="sp-small mt-3 text-muted-foreground">{work.format[locale]}</p>
          <p className="mt-6">{work.logline[locale]}</p>
          <div className="mt-8">
            <ShareButton />
          </div>
        </div>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("works.castTitle")}</h2>
        {work.slug === "journey-to-the-east" ? (
          <p className="sp-lead mt-4">
            {locale === "zh"
              ? "主演：唐韵秋 饰 何姐 · 罗米沙 饰 戴尔 · 张强 饰 导演 · 陈伟 饰 场务大哥"
              : "Starring Tang Yunqiu as He Jie · Misha Luo as Dai Er · Zhang Qiang as the Director · Chen Wei as the Grip"}
          </p>
        ) : null}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {work.cast.map((credit) => {
            const actor = ACTORS.find((a) => a.slug === credit.actor);
            if (!actor) return null;
            return (
              <Link
                data-card
                key={credit.actor}
                href={`/actors/${actor.slug}`}
                className="sp-card bg-card hover:bg-muted"
              >
                <p className="sp-subtitle">{credit.role?.name[locale] ?? t("works.roleTbd")}</p>
                <p className="mt-2">
                  {t("works.playedBy", { actor: locale === "zh" ? actor.nameCn : actor.nameEn })}
                </p>
                {credit.role?.note?.[locale] ? (
                  <p className="sp-small mt-2 text-muted-foreground">{credit.role.note[locale]}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("works.episodes")}</h2>
        {work.episodes?.length ? (
          <div className="mt-6 space-y-3">
            {work.episodes.map((ep) => (
              <div
                key={ep.id}
                className="flex items-center justify-between border-b border-border py-4"
              >
                <span>{ep.title[locale]}</span>
                <GameBadge tone="neutral">{WORK_STATUS_LABEL[ep.status][locale]}</GameBadge>
              </div>
            ))}
          </div>
        ) : (
          <p className="sp-lead mt-6">{t("works.episodesEmpty")}</p>
        )}
      </section>
      <section className="sp-section grid gap-6 lg:grid-cols-2">
        <div className="sp-sweep sp-panel aspect-video">
          <GameBadge tone="neutral" className="m-4">
            {t("works.trailer")}
          </GameBadge>
        </div>
        <div className="sp-sweep sp-panel aspect-video">
          <GameBadge tone="neutral" className="m-4">
            {t("works.stills")}
          </GameBadge>
        </div>
      </section>
    </div>
  );
}
