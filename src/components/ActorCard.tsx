import Image from "next/image";
import Link from "next/link";
import { ACCENT_VAR, STATUS_LABEL, type Actor } from "@/content/actors";

/**
 * A roster card is a casting card, not a blog teaser. It leads with the
 * serial code and the status gauge; the name comes third, because the
 * first question a caster asks is "is this one available".
 *
 * Actors still in development get a hatched void instead of a fake plate.
 * Showing a placeholder as if it were a delivered asset would be a lie the
 * viewer can check.
 */
export function ActorCard({ actor, index }: { actor: Actor; index: number }) {
  const accent = ACCENT_VAR[actor.accent];
  const status = STATUS_LABEL[actor.status];
  const ready = actor.status === "active" && actor.portrait;

  return (
    <Link
      href={`/actors/${actor.slug}`}
      className="sp-crosshair group relative block border border-[var(--sp-hairline)] bg-carbon transition-colors duration-500 hover:border-[color-mix(in_srgb,var(--color-bone)_34%,transparent)]"
      style={{ ["--card-accent" as string]: accent }}
    >
      {/* Instrument strip */}
      <div className="flex items-center justify-between border-b border-[var(--sp-hairline)] px-3 py-2">
        <span className="sp-label text-[0.5625rem] text-bone">{actor.code}</span>
        <span
          className="sp-label flex items-center gap-1.5 text-[0.5625rem]"
          style={{ color: accent }}
        >
          <span
            className={ready ? "sp-blink inline-block h-1 w-1" : "inline-block h-1 w-1"}
            style={{ background: ready ? accent : "var(--color-ash)" }}
            aria-hidden
          />
          {status.en}
        </span>
      </div>

      {/* Plate */}
      <div className="relative aspect-4/5 overflow-hidden bg-void">
        {ready ? (
          <Image
            src={actor.portrait!}
            alt={`${actor.nameCn} ${actor.nameEn} 角色定妆`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
            priority={index < 2}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 11px, color-mix(in srgb, var(--color-ash) 60%, transparent) 11px 12px)",
            }}
          >
            <div className="absolute inset-0 grid place-items-center">
              <span className="sp-label text-[0.5625rem] text-smoke">NO PLATE / 尚无定妆</span>
            </div>
          </div>
        )}

        {/* Oversized index, bleeding off the bottom edge */}
        <span
          className="sp-display pointer-events-none absolute -bottom-3 left-2 text-[5.5rem] leading-none text-bone/8 select-none"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Identity */}
      <div className="px-3 pt-3 pb-4">
        <h3 className="sp-display text-lg leading-none text-bone transition-colors group-hover:text-[var(--card-accent)]">
          {actor.nameEn}
        </h3>
        <p className="sp-cjk mt-1.5 text-xs text-smoke">{actor.nameCn}</p>
        <p className="sp-cjk mt-3 line-clamp-2 text-xs leading-relaxed text-ash">
          {actor.taglineCn}
        </p>
      </div>
    </Link>
  );
}
