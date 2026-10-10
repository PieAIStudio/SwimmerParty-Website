"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Actor } from "@/content/actors";
import type { ActorAssets, AssetItem } from "@/features/assets/asset-types";
import { EXPORT_TARGETS, type ExportTarget } from "@/content/tools";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { exportPack, SignInRequired, type ExportFormat } from "@/features/assets/export-packs";
import { veoPlan } from "@/features/assets/export-plan";
import { sheetHref } from "@/features/assets/contracts";
import { labelsFor } from "@/features/assets/item-labels";
import { saveBlob } from "@/lib/browser-files";
import { TextLink } from "@/site/TextLink";
import { GameButton, GameSegmentedControl, GameSelect, GameToast } from "@pieai/swimmer-ui-kit";
import { LiquidPopover } from "@pieai/swimmer-ui-kit/liquid-presence";
import { useAccount } from "@/features/account";

// The one-sheet format lives on its own page; this dialog keeps originals and model packs.
type DialogFormat = Exclude<ExportFormat, "sheet">;

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const [format, setFormat] = useState<DialogFormat>("zip");
  const [target, setTarget] = useState<ExportTarget>("gpt-image");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const limit = EXPORT_TARGETS.find((model) => model.id === target)!.limit;
  const unavailableVeo = format === "model" && target === "veo" && !veoPlan(selected, assets.items);
  const selectedBytes = selected.reduce((total, item) => total + item.bytes, 0);
  useEffect(() => () => controller.current?.abort(), []);
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
        locale,
        labels: Object.fromEntries(
          assets.items.map((item) => [item.slot, labelsFor(item, assets)]),
        ),
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
      title={t("assets.dialogTitle")}
      width={560}
    >
      <div className="mb-6 rounded-2xl border border-border p-4">
        <p className="sp-label">{t("assets.download")}</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between gap-4">
            <span>{t("assets.format.zipNote")}</span>
            <span className="shrink-0 text-muted-foreground">{fileSize(selectedBytes)} · ZIP</span>
          </li>
          <li className="flex justify-between gap-4">
            <span>{t("assets.format.modelNote")}</span>
            <span className="shrink-0 text-muted-foreground">{fileSize(selectedBytes)} · ZIP</span>
          </li>
        </ul>
      </div>
      <GameSegmentedControl
        activeId={format}
        label={t("assets.exportFormat")}
        disabled={busy}
        onSelect={(id) => setFormat(id as DialogFormat)}
        options={(["zip", "model"] as const).map((id) => ({
          id,
          label: t(`assets.format.${id}`),
        }))}
      />
      <p className="sp-small mt-5 text-muted-foreground">
        {t(
          format === "zip" && selected.some((item) => item.conformance === "legacy")
            ? "assets.originalsLegacy"
            : `assets.format.${format}Note`,
        )}
      </p>
      <p className="sp-small mt-4">
        <TextLink href={sheetHref(actor.slug, selected)}>{t("assets.makeSheet")}</TextLink>
      </p>
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
          variant="primary"
          disabled={Boolean(unavailableVeo)}
          pending={busy}
          onClick={() => void start()}
        >
          {t(busy ? "assets.preparing" : "assets.start")}
        </GameButton>
      </div>
    </LiquidPopover>
  );
}
