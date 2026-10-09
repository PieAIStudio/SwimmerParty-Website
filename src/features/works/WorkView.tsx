import { ACTORS } from "@/content/actors";
import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { Link } from "@/i18n/navigation";
import { type AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { ShareButton } from "@/site/ShareButton";
import { GameBadge } from "@pieai/swimmer-ui-kit";
export async function WorkView({
  work,
  locale,
}: {
  work: (typeof WORKS)[number];
  locale: AppLocale;
}) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container">
      <Breadcrumbs
        ariaLabel={t("common.breadcrumb")}
        items={[{ label: t("nav.works"), href: "/works" }, { label: work.title[locale] }]}
      />
      <section className="max-w-2xl">
        <div>
          <div className="flex items-center gap-3">
            <GameBadge tone="neutral">{WORK_STATUS_LABEL[work.status][locale]}</GameBadge>
          </div>
          <h1 className="sp-display-lg mt-5">{work.title[locale]}</h1>
          <p className="sp-small mt-3 text-muted-foreground">{work.format[locale]}</p>
          {work.logline ? <p className="mt-6">{work.logline[locale]}</p> : null}
          <div className="mt-8">
            <ShareButton />
          </div>
        </div>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("works.castTitle")}</h2>
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
      {work.episodes?.length ? (
        <section className="sp-section">
          <h2 className="sp-title">{t("works.episodes")}</h2>
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
        </section>
      ) : null}
    </div>
  );
}
