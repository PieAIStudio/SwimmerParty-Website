"use client";
import { Link } from "@/i18n/navigation";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { STATUS_LABEL, type Actor } from "@/content/actors";
import { ActorPicture } from "./ActorPicture";
import { GameBadge } from "@pieai/swimmer-ui-kit";
export function ActorCardClient({ actor }: { actor: Actor }) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return (
    <Link
      href={`/actors/${actor.slug}`}
      data-actor-card={actor.slug}
      data-card
      className="group -m-2 block min-w-0 rounded-[var(--game-ui-radius-card)] p-2 hover:bg-card"
    >
      <ActorPicture
        src={actor.portrait}
        alt={name}
        sizes="(min-width:1200px) 252px,(min-width:1024px) 22vw,(min-width:640px) 29vw,42vw"
        fullBody
        className="aspect-4/5 rounded-[var(--game-ui-radius-card)]"
      />
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <GameBadge tone={actor.status === "active" ? "success" : "neutral"}>
          {STATUS_LABEL[actor.status][locale]}
        </GameBadge>
        {actor.version ? (
          <span className="sp-small text-muted-foreground">v{actor.version}</span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-[1.375rem] font-bold group-hover:underline">{name}</h3>
      <p className="sp-small mt-2 line-clamp-2 text-muted-foreground">{actor.tagline[locale]}</p>
      <span className="sr-only">{t("actor.openLibrary")}</span>
    </Link>
  );
}
