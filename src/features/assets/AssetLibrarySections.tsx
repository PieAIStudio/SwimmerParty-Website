import type { ActorAssets } from "./asset-types";
import { listSeries, slotsForLook, slotsOf, slotLabelKey, type ResolvedSlot } from "./asset-series";
import type { AppLocale } from "@/i18n/routing";
import type { MessageContracts } from "@/i18n/message-contracts";
import { getSiteI18n } from "@/i18n/server";
import { AssetTile } from "./AssetTile";
import { VoiceTile } from "./VoiceTile";
import { SelectAssetSeries } from "./AssetSelection";
import { Mannequin } from "@/features/actors";

type DynamicKey = Extract<keyof MessageContracts, string>;
export async function AssetLibrarySections({
  assets,
  locale,
  actorName,
  isNewFace,
}: {
  assets: ActorAssets;
  locale: AppLocale;
  actorName: string;
  isNewFace?: boolean;
}) {
  const { t } = await getSiteI18n();
  const msg = (key: string) => t(key as DynamicKey, {} as never);
  const delivered = new Map(assets.items.map((item) => [item.slot, item]));
  const hasVideo = assets.items.some((item) => item.kind === "video" || item.series === "video");
  const imageSeries = listSeries().filter(
    (series) =>
      !["voice", "video"].includes(series.id) &&
      (series.required || assets.items.some((item) => item.series === series.id)) &&
      (!isNewFace || assets.items.some((item) => item.series === series.id)),
  );
  const grid = (slots: ResolvedSlot[], fullBody: boolean) => (
    <div
      className={`mt-8 grid gap-3 sm:gap-4 ${fullBody ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"}`}
    >
      {slots.map((slot) => {
        const item = delivered.get(slot.slot);
        const extra = assets.looks
          .find((look) => look.id === slot.look)
          ?.extras.find((entry) => entry.key === slot.key);
        const label =
          isNewFace && slot.series === "turnaround" && slot.key === "front"
            ? t("assets.castingPhoto")
            : extra
              ? extra.label[locale]
              : t(slotLabelKey(slot.series, slot.key));
        return item ? (
          <AssetTile key={slot.slot} item={item} label={label} actorName={actorName} />
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
  return (
    <>
      {imageSeries.map((series) => {
        const all = series.perLook
          ? assets.looks.flatMap((look) => slotsForLook(series.id, look))
          : slotsOf(series.id);
        const visible = all.filter((slot) =>
          isNewFace
            ? delivered.has(slot.slot)
            : (series.required && slot.required) || delivered.has(slot.slot),
        );
        const available = visible
          .filter((slot) => delivered.has(slot.slot))
          .map((slot) => slot.slot);
        const core = visible.filter((slot) => slot.tier !== "extended");
        const extended = visible.filter((slot) => slot.tier === "extended");
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
                  {msg(`assets.series.${series.id}`)}{" "}
                  <span className="sp-code ml-2 text-muted-foreground">
                    {available.length}/{visible.length}
                  </span>
                </h2>
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
      })}
      <section id="series-voice" className="sp-section scroll-mt-40">
        <h2 className="sp-title">{t("assets.series.voice")}</h2>
        {isNewFace ? (
          <p className="sp-small mt-3 max-w-2xl text-muted-foreground">{t("assets.newFaceNote")}</p>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slotsOf("voice")
            .filter(
              (slot) =>
                (!isNewFace || delivered.has(slot.slot)) &&
                (!slot.key.startsWith("role-") || delivered.has(slot.slot)),
            )
            .map((slot) => {
              const item = delivered.get(slot.slot);
              const label = msg(
                `assets.voice.${slot.key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}`,
              );
              return (
                <VoiceTile
                  key={slot.slot}
                  item={item}
                  label={label}
                  reference={slot.key === "intro" && Boolean(item)}
                />
              );
            })}
        </div>
      </section>
      {hasVideo ? (
        <section id="series-video" className="sp-section scroll-mt-40">
          <h2 className="sp-title">{t("assets.series.video")}</h2>
          <p className="sp-small mt-3 max-w-2xl text-muted-foreground">{t("assets.videoNote")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {slotsOf("video").map((slot) => (
              <VoiceTile
                key={slot.slot}
                label={msg(
                  `assets.video.${slot.key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}`,
                )}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
