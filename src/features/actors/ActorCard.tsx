import { getSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { STATUS_LABEL, type Actor } from "@/content/actors";
import { ActorPicture } from "./ActorPicture";
import { getActorAssets } from "@/features/assets/assets";
import { GameBadge } from "@pieai/swimmer-ui-kit";

export async function ActorCard({ actor, href }: { actor: Actor; href?: string }) {
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const items = getActorAssets(actor.slug).items.filter((item) => item.conformance === "v1");
  const image =
    items.find((item) => item.slot === "face.front") ??
    items.find((item) => item.slot === "turnaround.front");
  return (
    <Link
      href={href ?? `/actors/${actor.slug}`}
      data-actor-card={actor.code}
      className="group -m-2 block min-w-0 rounded-[var(--game-ui-radius-card)] p-2 hover:bg-card"
    >
      <ActorPicture
        src={image?.preview ?? actor.portrait}
        alt={`${name} — ${actor.code}`}
        sizes="(min-width: 1200px) 252px, (min-width: 1024px) 22vw, (min-width: 640px) 29vw, 42vw"
        legacy={!image && Boolean(actor.portrait)}
        legacyLabel={t("assets.legacy")}
        fullBody={image?.series === "turnaround"}
        className="aspect-4/5 rounded-[var(--game-ui-radius-card)]"
      >
        {!image && !actor.portrait ? (
          <GameBadge className="absolute bottom-3 left-3" tone="neutral">
            {t("actor.inDevelopment")}
          </GameBadge>
        ) : null}
      </ActorPicture>
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className="sp-code whitespace-nowrap text-muted-foreground">{actor.code}</span>
        <GameBadge
          data-actor-status
          tone={actor.status === "active" ? "success" : "neutral"}
          className="whitespace-nowrap"
        >
          {actor.status === "active"
            ? t("roster.castableLabel")
            : actor.status === "in-development"
              ? t("actor.inDevelopment")
              : STATUS_LABEL[actor.status][locale]}
        </GameBadge>
      </div>
      <h3 className="mt-3 font-display text-[1.375rem] leading-tight font-bold">{name}</h3>
      <p className="sp-small mt-2 line-clamp-2 text-muted-foreground">{actor.tagline[locale]}</p>
    </Link>
  );
}
