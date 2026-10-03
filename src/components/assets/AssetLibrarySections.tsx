import type { ActorAssets } from "@/content/asset-types";
import { listSeries, slotsOf, slotLabelKey, type ResolvedSlot } from "@/content/asset-series";
import type { MessageContracts } from "@/i18n/message-contracts";
import { getSiteI18n } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import { Mannequin } from "../Mannequin";
import { AssetTile } from "./AssetTile";
import { SelectAssetSeries } from "./AssetSelection";

type SeriesMessage = Extract<keyof MessageContracts, `assets.${"series" | "note"}.${string}`>;
export async function AssetLibrarySections({
  assets,
  locale,
}: {
  assets: ActorAssets;
  locale: AppLocale;
}) {
  const { t } = await getSiteI18n();
  const delivered = new Map(assets.items.map((item) => [item.slot, item]));
  const grid = (slots: ResolvedSlot[], fullBody: boolean) => (
    <div
      className={`mt-8 grid gap-3 sm:gap-4 ${fullBody ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"}`}
    >
      {slots.map((slot) => {
        const item = delivered.get(slot.slot);
        const label = t(slotLabelKey(slot.series, slot.key));
        return item ? (
          <AssetTile
            key={slot.slot}
            item={item}
            label={label}
            code={assets.code}
            fullBody={fullBody}
          />
        ) : (
          <div
            key={slot.slot}
            data-asset-slot={slot.slot}
            data-delivered="false"
            className={`relative flex items-center justify-center overflow-hidden rounded-[var(--game-ui-radius-card)] bg-muted p-3 text-center ${fullBody ? "aspect-2/3" : "aspect-square"}`}
          >
            {fullBody ? (
              <Mannequin className="absolute inset-0 h-full w-full opacity-[0.08]" />
            ) : null}
            <div className="relative">
              <p className="sp-label">{label}</p>
              <p className="sp-small mt-2 text-muted-foreground">{t("assets.pending")}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
  return listSeries()
    .filter((series) => series.required || assets.items.some((item) => item.series === series.id))
    .map((series) => {
      const all = series.perLook
        ? assets.looks.flatMap((look) => slotsOf(series.id, look.id))
        : slotsOf(series.id);
      const visible = all.filter(
        (slot) => (series.required && slot.required) || delivered.has(slot.slot),
      );
      const available = visible.filter((slot) => delivered.has(slot.slot)).map((slot) => slot.slot);
      const extended = visible.filter((slot) => slot.tier === "extended");
      const core = visible.filter((slot) => slot.tier !== "extended");
      return (
        <section
          id={`series-${series.id}`}
          key={series.id}
          className="sp-section scroll-mt-40"
          data-asset-series={series.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="sp-title">
                {t(`assets.series.${series.id}` as SeriesMessage)}{" "}
                <span className="sp-code ml-2 text-muted-foreground">
                  {available.length}/{visible.length}
                </span>
              </h2>
              <p className="sp-small mt-3 text-muted-foreground">
                {t(`assets.note.${series.id}` as SeriesMessage)}
              </p>
            </div>
            <SelectAssetSeries slots={available} />
          </div>
          {series.perLook
            ? assets.looks
                .filter((look) =>
                  available.some((slot) => slot.startsWith(`${series.id}.${look.id}.`)),
                )
                .map((look) => (
                  <div key={look.id} className="mt-8">
                    <h3 className="sp-subtitle">{look.label[locale]}</h3>
                    {grid(
                      core.filter((slot) => slot.look === look.id),
                      series.frame === "full",
                    )}
                  </div>
                ))
            : grid(core, series.frame === "full")}
          {extended.length ? (
            <div className="mt-10">
              <h3 className="sp-subtitle">{t("assets.extended")}</h3>
              {grid(extended, false)}
            </div>
          ) : null}
        </section>
      );
    });
}
