"use client";
import type { AssetItem } from "./asset-types";
import { useSiteI18n } from "@/i18n/client";
import { GameBadge, GameCheckbox, GameIcon, GameIconButton } from "@pieai/swimmer-ui-kit";
import { useAssetSelection } from "./AssetSelection";
import { ImageLightbox } from "./ImageLightbox";
export function AssetTile({
  item,
  label,
  actorName,
}: {
  item: AssetItem;
  label: string;
  actorName: string;
}) {
  const { t } = useSiteI18n();
  const { selected, change, downloadOne, remaining, busy } = useAssetSelection();
  const checked = selected.has(item.slot);
  return (
    <article data-asset-slot={item.slot} data-delivered="true">
      <div
        className="sp-asset-frame overflow-hidden rounded-[var(--game-ui-radius-card)]"
        data-selected={checked}
      >
        <ImageLightbox item={item} name={`${actorName} · ${label}`} />
      </div>
      <div className="mt-2 flex min-h-11 items-center gap-2">
        <GameCheckbox
          checked={checked}
          onChange={() => change([item.slot], !checked)}
          label={label}
        />
        {item.conformance === "legacy" ? (
          <GameBadge tone="warning">{t("assets.legacy")}</GameBadge>
        ) : null}
        <GameIconButton
          label={t("assets.downloadNamed", { name: label })}
          disabled={busy || remaining > 0}
          onClick={() => void downloadOne(item)}
        >
          <GameIcon icon="download" />
        </GameIconButton>
        {remaining > 0 ? (
          <GameBadge tone="warning">{t("assets.cooldownBadge", { seconds: remaining })}</GameBadge>
        ) : null}
      </div>
    </article>
  );
}
