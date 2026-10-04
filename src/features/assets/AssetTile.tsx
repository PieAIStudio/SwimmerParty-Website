"use client";

import type { AssetItem } from "@/features/assets/asset-types";
import { useSiteI18n } from "@/i18n/client";
import { GameBadge, GameCheckbox, GameIconButton } from "@pieai/swimmer-ui-kit";
import { GameIcon } from "@pieai/swimmer-ui-kit";
import { ActorPicture } from "@/features/actors/client";
import { useAssetSelection } from "./AssetSelection";

export function AssetTile({
  item,
  label,
  code,
  fullBody,
}: {
  item: AssetItem;
  label: string;
  code: string;
  fullBody: boolean;
}) {
  const { t } = useSiteI18n();
  const { selected, change, downloadOne, remaining, busy } = useAssetSelection();
  const checked = selected.has(item.slot);
  const toggle = () => change([item.slot], !checked);
  const selectLabel = t("assets.select", { label });
  return (
    <article data-asset-slot={item.slot} data-delivered="true">
      <div
        className="sp-asset-frame relative overflow-hidden rounded-[var(--game-ui-radius-card)]"
        data-selected={checked}
      >
        <ActorPicture
          src={item.preview}
          alt={`${code} ${label}`}
          fullBody={fullBody}
          legacy={item.conformance === "legacy"}
          sizes={
            fullBody
              ? "(min-width: 1200px) 252px, (min-width: 1024px) 22vw, (min-width: 640px) 29vw, 42vw"
              : "(min-width: 1200px) 168px, (min-width: 1024px) 14vw, (min-width: 640px) 21vw, 27vw"
          }
          className={`${fullBody ? "aspect-2/3" : "aspect-square"} rounded-[var(--game-ui-radius-card)]`}
        />
        <button
          type="button"
          className="absolute inset-0 rounded-[var(--game-ui-radius-card)]"
          aria-label={selectLabel}
          aria-pressed={checked}
          onClick={toggle}
        />
        <div className="absolute top-2 left-2">
          <GameCheckbox
            checked={checked}
            onChange={toggle}
            label={selectLabel}
            className="sp-asset-checkbox"
          />
        </div>
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <GameIconButton
            label={t("assets.downloadOne")}
            disabled={busy || remaining > 0}
            onClick={() => void downloadOne(item)}
          >
            <GameIcon icon="download" />
          </GameIconButton>
          {remaining > 0 ? (
            <span aria-live="off" data-cooldown>
              <GameBadge tone="warning">{remaining}s</GameBadge>
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="sp-label">{label}</span>
        {item.conformance === "legacy" ? (
          <span title={t("assets.legacyNote")}>
            <GameBadge tone="warning">{t("assets.legacy")}</GameBadge>
          </span>
        ) : null}
      </div>
    </article>
  );
}
