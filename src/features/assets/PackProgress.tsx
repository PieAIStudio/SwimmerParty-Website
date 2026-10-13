"use client";
import { GameProgress } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import type { AssetFetchProgress } from "./contracts";

/** Only composes the kit's progress with the transport's real file count. */
export function PackProgress({ progress }: { progress: AssetFetchProgress | null }) {
  const { t } = useSiteI18n();
  if (!progress || progress.total === 0)
    return <output className="sp-small block">{t("downloads.authorizing")}</output>;
  return (
    <div data-pack-progress className="w-full min-w-0 max-w-xl">
      <GameProgress
        value={progress.completed}
        max={progress.total}
        label={t("downloads.fetching")}
        showValue
        valueLabel={t("downloads.filesProgress", progress)}
      />
      {progress.completed === progress.total ? (
        <output className="sp-small mt-2 block">{t("downloads.assembling")}</output>
      ) : null}
    </div>
  );
}
