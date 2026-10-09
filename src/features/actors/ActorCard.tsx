import { getSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { STATUS_LABEL, type Actor } from "@/content/actors";
import { ActorPicture } from "./ActorPicture";
import { getActorAssets } from "@/features/assets/queries";
import { GameBadge } from "@pieai/swimmer-ui-kit";

export async function ActorCard({ actor, href }: { actor: Actor; href?: string }) {
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const item =
    getActorAssets(actor.slug).items.find((candidate) => candidate.slot === "face.front") ??
    getActorAssets(actor.slug).items.find((candidate) => candidate.slot === "turnaround.front");
  return (
    <Link
      href={href ?? `/actors/${actor.slug}`}
      data-actor-card={actor.slug}
      data-card
      className="group -m-2 block min-w-0 rounded-[var(--game-ui-radius-card)] p-2 hover:bg-card"
    >
      <ActorPicture
        src={item?.preview ?? actor.portrait}
        alt={name}
        sizes="(min-width: 1200px) 252px, (min-width: 1024px) 22vw, (min-width: 640px) 29vw, 42vw"
        legacy={!item && Boolean(actor.portrait)}
        legacyLabel={t("assets.legacy")}
        fullBody={item?.series === "turnaround"}
        className="aspect-4/5 rounded-[var(--game-ui-radius-card)]"
      />
      {actor.status !== "active" ? (
        <div className="mt-3.5">
          <GameBadge data-actor-status tone="neutral">
            {STATUS_LABEL[actor.status][locale]}
          </GameBadge>
        </div>
      ) : null}
      <h3 className="mt-3 font-display text-[1.375rem] leading-tight font-bold group-hover:underline">
        {name}
      </h3>
      <p className="sp-small mt-2 line-clamp-2 text-muted-foreground">{actor.tagline[locale]}</p>
    </Link>
  );
}
