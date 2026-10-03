import { getSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { STATUS_LABEL, type Actor } from "@/content/actors";
import { ActorPicture } from "./ActorPicture";

export async function ActorCard({ actor, href }: { actor: Actor; href?: string }) {
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return (
    <Link
      href={href ?? `/actors/${actor.slug}`}
      data-actor-card={actor.code}
      className="group block min-w-0 rounded-[var(--game-ui-radius-card)]"
    >
      <ActorPicture
        src={actor.portrait}
        alt={`${name} — ${actor.code}`}
        sizes="(min-width: 1200px) 252px, (min-width: 1024px) 22vw, (min-width: 640px) 29vw, 42vw"
        legacy={Boolean(actor.portrait)}
        className="aspect-4/5 rounded-[var(--game-ui-radius-card)]"
      >
        {!actor.portrait ? (
          <span className="sp-pill absolute bottom-3 left-3 text-muted-foreground">
            {t("actor.inDevelopment")}
          </span>
        ) : null}
      </ActorPicture>
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className="sp-code whitespace-nowrap text-muted-foreground">{actor.code}</span>
        <span
          className={`sp-pill whitespace-nowrap ${actor.status === "active" ? "" : "text-muted-foreground"}`}
          data-active={actor.status === "active"}
        >
          {actor.status === "active"
            ? t("roster.castableLabel")
            : actor.status === "in-development"
              ? t("actor.inDevelopment")
              : STATUS_LABEL[actor.status][locale]}
        </span>
      </div>
      <h3 className="mt-3 font-display text-[1.375rem] leading-tight font-bold">{name}</h3>
      <p className="sp-small mt-2 line-clamp-2 text-muted-foreground">{actor.tagline[locale]}</p>
    </Link>
  );
}
