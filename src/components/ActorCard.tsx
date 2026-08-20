import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ACCENT_VAR, STATUS_LABEL, type Actor } from "@/content/actors";
import { CG_BADGE } from "@/content/doctrine";
import { Mannequin } from "./Mannequin";
import type { AppLocale } from "@/i18n/routing";

/**
 * A roster card is a casting card, not a blog teaser. It leads with the
 * serial code and the status gauge; the name comes third, because the
 * first question a caster asks is "is this one available".
 *
 * Actors still in development get a hatched void instead of a fake plate.
 * Showing a placeholder as if it were a delivered asset would be a lie the
 * viewer can check — and this site is shown to people who check.
 */
export async function ActorCard({
  actor,
  index,
  width = "auto",
}: {
  actor: Actor;
  index: number;
  /** `rail` fixes the card width so a horizontal track can be measured. */
  width?: "auto" | "rail";
}) {
  const t = await getTranslations("actor");
  const locale = (await getLocale()) as AppLocale;
  const accent = ACCENT_VAR[actor.accent];
  const ready = actor.status === "active" && actor.portrait;
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;

  return (
    <Link
      href={`/actors/${actor.slug}`}
      data-cursor={actor.code}
      className={`sp-crosshair sp-sweep group relative block border border-[var(--sp-hairline)] bg-carbon transition-colors duration-500 hover:border-[var(--sp-accent)] ${
        width === "rail" ? "w-[78vw] shrink-0 sm:w-[42vw] lg:w-[24rem]" : ""
      }`}
      style={{ ["--sp-accent" as string]: accent }}
    >
      {/* Instrument strip */}
      <div className="flex items-center justify-between border-b border-[var(--sp-hairline)] px-3 py-2">
        <span className="sp-label text-[0.5625rem] text-bone">{actor.code}</span>
        <span
          className="sp-label sp-cjk flex items-center gap-1.5 text-[0.5625rem]"
          style={{ color: accent }}
        >
          <span
            className={ready ? "sp-blink inline-block h-1 w-1" : "inline-block h-1 w-1"}
            style={{ background: ready ? accent : "var(--color-ash)" }}
            aria-hidden
          />
          {STATUS_LABEL[actor.status][locale]}
        </span>
      </div>

      {/* Plate */}
      <div className="sp-scanlines relative aspect-4/5 overflow-hidden bg-void">
        {ready ? (
          <Image
            src={actor.portrait!}
            alt={`${name} — ${actor.code}`}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 27rem"
            className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
            priority={index < 2}
          />
        ) : (
          <div className="sp-hazard absolute inset-0">
            <Mannequin
              className="absolute inset-y-[9%] left-1/2 h-[82%] -translate-x-1/2 opacity-70 transition-opacity duration-700 group-hover:opacity-100"
              accent={accent}
            />
            <span className="sp-label sp-cjk absolute inset-x-0 bottom-4 text-center text-[0.5625rem] text-smoke">
              {t("noPlateShort")}
            </span>
          </div>
        )}

        {/* Oversized index, bleeding off the bottom edge */}
        <span
          className="sp-ghost-num pointer-events-none absolute -bottom-4 left-2 z-3 text-[6.5rem]"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Accent rule that fills across on hover */}
        <span
          className="absolute inset-x-0 bottom-0 z-3 h-[3px] origin-left scale-x-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
          style={{ background: accent }}
          aria-hidden
        />
      </div>

      {/* Identity */}
      <div className="px-3 pt-3 pb-4">
        <h3
          className={`${
            locale === "zh" ? "sp-zh-display" : "sp-display"
          } sp-rgb text-xl leading-none text-bone transition-colors group-hover:text-[var(--sp-accent)]`}
          data-text={name}
        >
          {name}
        </h3>
        <p className="sp-cjk mt-3 line-clamp-2 text-xs leading-relaxed text-smoke">
          {actor.tagline[locale]}
        </p>
        <p className="sp-label mt-4 text-[0.5rem] text-ash">{CG_BADGE[locale]}</p>
      </div>
    </Link>
  );
}
