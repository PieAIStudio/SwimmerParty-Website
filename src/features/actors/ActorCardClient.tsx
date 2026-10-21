"use client";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import type { Actor } from "@/content/actors";
import type { OfficialSample } from "@/content/official-samples.generated";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { ActorPicture } from "./ActorPicture";
import { CastAddButton } from "@/features/cast/client";

type CardSample = Pick<OfficialSample, "video" | "poster" | "label" | "tools">;

export function ActorCardClient({
  actor,
  portrait,
  sample,
}: {
  actor: Actor;
  portrait?: string;
  sample?: CardSample;
}) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  const href = `/actors/${actor.slug}`;
  const sampleLabel = sample ? t(`samples.label.${sample.label}`) : "";
  return (
    <article
      data-actor-card={actor.slug}
      data-card
      data-actor-preview={playing ? "playing" : "portrait"}
      className="group -m-2 min-w-0 rounded-[var(--game-ui-radius-card)] p-2 hover:bg-card"
    >
      <div className="relative min-w-0">
        {sample && playing ? (
          <>
            <video
              src={sample.video}
              poster={sample.poster}
              autoPlay
              muted
              playsInline
              controls
              preload="metadata"
              aria-label={`${name} · ${sampleLabel}`}
              onError={() => setFailed(true)}
              className="block aspect-4/5 w-full rounded-[var(--game-ui-radius-card)] bg-muted object-contain"
            />
            <div className="absolute right-2 top-2">
              <GameButton size="sm" variant="secondary" onClick={() => setPlaying(false)}>
                {t("samples.closePreview")}
              </GameButton>
            </div>
            {failed ? (
              <p className="sp-small mt-2 text-danger-ink">{t("samples.playFailed")}</p>
            ) : null}
          </>
        ) : (
          <>
            <Link href={href} className="block" aria-label={name}>
              <ActorPicture
                src={portrait ?? actor.portrait}
                alt={name}
                sizes="(min-width:1200px) 252px,(min-width:1024px) 22vw,(min-width:640px) 29vw,42vw"
                bust
                className="aspect-4/5 rounded-[var(--game-ui-radius-card)]"
              />
              {sample ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[var(--game-ui-radius-card)] opacity-0 transition-opacity group-hover:opacity-100 lg:block"
                >
                  <Image src={sample.poster} alt="" fill sizes="252px" className="object-cover" />
                </span>
              ) : null}
            </Link>
            {sample ? (
              <div className="absolute bottom-2 left-2 right-2 flex justify-start">
                <GameButton
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setFailed(false);
                    setPlaying(true);
                  }}
                >
                  {t("samples.play")}
                </GameButton>
              </div>
            ) : null}
          </>
        )}
      </div>
      <h3 className="mt-3 font-display text-[1.375rem] leading-tight font-bold">
        <Link href={href} className="hover:underline">
          {name}
        </Link>
      </h3>
      <p className="sp-small mt-2 line-clamp-2 text-muted-foreground">{actor.tagline[locale]}</p>
      {sample ? (
        <p className="sp-small mt-2 text-muted-foreground">
          {sampleLabel} · {sample.tools.join(" · ")}
        </p>
      ) : null}
      <div className="mt-3" data-actor-cast-action>
        <CastAddButton slug={actor.slug} name={name} locale={locale} />
      </div>
    </article>
  );
}
