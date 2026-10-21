"use client";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import type { AssetItem } from "./asset-types";
import { useAssetSelection } from "./AssetSelection";

export function AssetHeroActions({ front }: { front?: AssetItem }) {
  const { t } = useSiteI18n();
  const { downloadOne, requestStarter, sourceRef, remaining, busy } = useAssetSelection();
  return (
    <div className="flex flex-wrap items-center gap-3" data-hero-downloads>
      {front ? (
        <GameButton
          variant="secondary"
          disabled={busy || remaining > 0}
          onClick={() => void downloadOne(front)}
          data-free-front-download
        >
          {remaining > 0
            ? t("assets.cooldownBadge", { seconds: remaining })
            : t("actor.freeFrontDownload")}
        </GameButton>
      ) : null}
      <GameButton
        variant="secondary"
        onClick={(event) => {
          sourceRef.current = event.currentTarget;
          requestStarter();
        }}
        disabled={busy}
        data-all-files-download
      >
        {t("actor.fullPack")}
      </GameButton>
    </div>
  );
}
