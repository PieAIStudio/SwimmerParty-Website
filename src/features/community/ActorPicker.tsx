"use client";
import { useState } from "react";
import { GameCheckbox, GameField, GameInput } from "@pieai/swimmer-ui-kit";
import { ACTORS } from "@/content/actors";
import { useSiteI18n } from "@/i18n/client";
import type { DraftContent } from "@/contracts/community";
export function ActorPicker({
  value,
  onChange,
  locale,
  disabled,
}: {
  value: NonNullable<DraftContent["actors"]>;
  onChange: (actors: NonNullable<DraftContent["actors"]>) => void;
  locale: "en" | "zh";
  disabled?: boolean;
}) {
  const { t } = useSiteI18n();
  const [query, setQuery] = useState("");
  const choices = ACTORS.filter(
    (actor): actor is typeof actor & { version: string } => typeof actor.version === "string",
  ).filter((actor) =>
    `${actor.nameCn} ${actor.nameEn}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <fieldset disabled={disabled} className="min-w-0" data-community-actors>
      <legend className="sp-label mb-3">{t("c.actors")}</legend>
      <GameField label={t("c.actorSearch")} hint={t("c.actorLimit")}>
        <GameInput value={query} onChange={(event) => setQuery(event.target.value)} />
      </GameField>
      <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
        {choices.map((actor) => {
          const selected = value.find((reference) => reference.slug === actor.slug);
          return (
            <GameCheckbox
              key={actor.slug}
              label={`${locale === "zh" ? actor.nameCn : actor.nameEn} · ${selected?.assetVersion ?? actor.version}`}
              checked={Boolean(selected)}
              disabled={!selected && value.length >= 16}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, { slug: actor.slug, assetVersion: actor.version }]
                    : value.filter((reference) => reference.slug !== actor.slug),
                )
              }
            />
          );
        })}
      </div>
    </fieldset>
  );
}
