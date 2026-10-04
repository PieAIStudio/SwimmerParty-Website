"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Actor } from "@/content/actors";
import type { ActorAssets, AssetItem } from "@/content/asset-types";
import { EXPORT_TARGETS, type ExportTarget } from "@/content/export-targets";
import { slotLabelKey } from "@/content/asset-series";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { siteI18n } from "@/i18n/catalog";
import { exportPack, SignInRequired, type ExportFormat } from "@/lib/export-packs";
import {
  renderSheet,
  type SheetBackground,
  type SheetLabels,
  type SheetImage,
} from "@/lib/render-sheet";
import { fetchImageBlob, saveBlob } from "@/lib/browser-files";
import { veoPlan } from "@/lib/export-plan";
import { GameButton, GameSegmentedControl, GameSelect, GameToast } from "@pieai/swimmer-ui-kit";
import { LiquidPopover } from "@pieai/swimmer-ui-kit/liquid-presence";
import { useAccount } from "@/features/account";

const translators = { en: siteI18n.translator("en"), zh: siteI18n.translator("zh-CN") };
function labelsFor(item: AssetItem) {
  const key = slotLabelKey(item.series, item.key);
  return { en: translators.en.t(key), zh: translators.zh.t(key) };
}
export function MemberExportDialog({
  actor,
  assets,
  selected,
  onClose,
  onSuccess,
  onSignIn,
  source,
}: {
  actor: Actor;
  assets: ActorAssets;
  selected: AssetItem[];
  onClose: () => void;
  onSuccess: () => void;
  onSignIn: () => void;
  source: RefObject<HTMLElement | null>;
}) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const account = useAccount();
  const [format, setFormat] = useState<ExportFormat>("zip");
  const [labels, setLabels] = useState<SheetLabels>("none");
  const [background, setBackground] = useState<SheetBackground>("grey");
  const [target, setTarget] = useState<ExportTarget>("gpt-image");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const selectedKey = selected.map((item) => item.slot).join("|");
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const limit = EXPORT_TARGETS.find((model) => model.id === target)!.limit;
  const unavailableVeo = format === "model" && target === "veo" && !veoPlan(selected, assets.items);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (format !== "sheet") return;
    const abort = new AbortController();
    const images: SheetImage[] = [];
    setPreviewReady(false);
    void (async () => {
      try {
        for (const item of selectedRef.current) {
          const blob = await fetchImageBlob(item.thumb, abort.signal);
          const bitmap = await createImageBitmap(blob);
          images.push({
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            fullBody: ["turnaround", "wardrobe", "pose"].includes(item.series),
            labels: labelsFor(item),
          });
          abort.signal.throwIfAborted();
        }
        if (canvas.current) renderSheet(images, { labels, background }, canvas.current, true);
        setPreviewReady(true);
      } catch {
        if (!abort.signal.aborted) setFailed(true);
      } finally {
        for (const image of images) (image.source as ImageBitmap).close();
      }
    })();
    return () => abort.abort();
  }, [format, selectedKey, labels, background]);
  function cancel() {
    controller.current?.abort();
    onClose();
  }
  async function start() {
    if (controller.current || unavailableVeo) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setFailed(false);
    try {
      const result = await exportPack({
        actor,
        assets,
        selected,
        format,
        target,
        sheet: { labels, background },
        locale,
        labels: Object.fromEntries(assets.items.map((item) => [item.slot, labelsFor(item)])),
        signal: abort.signal,
      });
      abort.signal.throwIfAborted();
      saveBlob(result.blob, result.filename);
      account.event("bundle_download", { format: format === "model" ? target : format });
      onSuccess();
    } catch (error) {
      if (!abort.signal.aborted) {
        if (error instanceof SignInRequired) onSignIn();
        else setFailed(true);
      }
    } finally {
      controller.current = null;
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <LiquidPopover
      open
      onOpenChange={(open) => {
        if (!open) cancel();
      }}
      source={source}
      title={t("assets.dialogTitle", { count: selected.length })}
      width={560}
    >
      <GameSegmentedControl
        activeId={format}
        label={t("assets.exportFormat")}
        disabled={busy}
        onSelect={(id) => setFormat(id as ExportFormat)}
        options={["zip", "sheet", "model"].map((id) => ({
          id,
          label: t(
            `assets.format.${id}` as
              | "assets.format.zip"
              | "assets.format.sheet"
              | "assets.format.model",
          ),
        }))}
      />
      <p className="sp-small mt-5 text-muted-foreground">
        {t(
          format === "zip" && selected.some((item) => item.conformance === "legacy")
            ? "assets.originalsLegacy"
            : `assets.format.${format}Note`,
        )}
      </p>
      {format === "sheet" ? (
        <div className="mt-6 space-y-5">
          <GameSegmentedControl
            activeId={labels}
            label={t("assets.labels")}
            disabled={busy}
            onSelect={(id) => setLabels(id as SheetLabels)}
            options={[
              { id: "none", label: t("assets.labels.none") },
              { id: "zh", label: "中文" },
              { id: "en", label: "English" },
            ]}
          />
          <GameSegmentedControl
            activeId={background}
            label={t("assets.background")}
            disabled={busy}
            onSelect={(id) => setBackground(id as SheetBackground)}
            options={[
              { id: "grey", label: t("assets.background.light") },
              { id: "white", label: t("assets.background.white") },
              { id: "dark", label: t("assets.background.dark") },
            ]}
          />
          <canvas
            ref={canvas}
            className="w-full rounded-[var(--game-ui-radius-card)]"
            aria-label={t("assets.preview")}
            data-preview-ready={previewReady}
          />
        </div>
      ) : null}
      {format === "model" ? (
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="asset-export-model" className="sp-label mb-2 block">
              {t("assets.model")}
            </label>
            <GameSelect
              id="asset-export-model"
              value={target}
              disabled={busy}
              onChange={(event) => setTarget(event.target.value as ExportTarget)}
            >
              {EXPORT_TARGETS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </GameSelect>
          </div>
          {selected.length > limit && target !== "veo" ? (
            <p className="sp-small">{t("assets.overLimit", { count: selected.length, limit })}</p>
          ) : null}
          {target === "seedance" ? (
            <p className="sp-small text-muted-foreground">{t("assets.seedanceUnverified")}</p>
          ) : null}
          {unavailableVeo ? (
            <output className="sp-small block">{t("assets.veoMissing")}</output>
          ) : null}
        </div>
      ) : null}
      {failed ? (
        <div className="mt-5">
          <GameToast tone="danger">{t("assets.failed")}</GameToast>
        </div>
      ) : null}
      <div className="mt-6 flex justify-end gap-3">
        <GameButton onClick={cancel}>{t("assets.cancel")}</GameButton>
        <GameButton
          variant="secondary"
          disabled={busy || Boolean(unavailableVeo)}
          onClick={() => void start()}
        >
          {t(busy ? "assets.preparing" : "assets.start")}
        </GameButton>
      </div>
    </LiquidPopover>
  );
}
