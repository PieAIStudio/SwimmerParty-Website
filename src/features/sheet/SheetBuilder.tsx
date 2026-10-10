"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
} from "react";
import Image from "next/image";
import type { Actor } from "@/content/actors";
import type { ActorAssets, AssetItem } from "@/features/assets/asset-types";
import {
  assetFilename,
  characterProfile,
  exportPack,
  labelsFor,
  licenseText,
  renderSheet,
  SignInRequired,
  type SheetBackground,
  type SheetImage,
  type SheetLabels,
} from "@/features/assets/client";
import {
  fitSheetSlots,
  isFullBodySeries,
  listSeries,
  SHEET_MAX_IMAGES,
} from "@/features/assets/contracts";
import { useAccount } from "@/features/account";
import { seriesLabelKey } from "@/i18n/asset-labels";
import { useSiteI18n } from "@/i18n/client";
import type { AppLocale } from "@/i18n/routing";
import { fetchImageBlob, saveBlob, zipBlob } from "@/lib/browser-files";
import { GameButton, GameCheckbox, GameSegmentedControl, GameToast } from "@pieai/swimmer-ui-kit";
import { availablePresets, presetSlots, type SheetPreset } from "./sheet-presets";
import { readSheetState, sheetSearch, type SheetState } from "./sheet-state";
import { sheetBundleFiles, sheetReadme, type SheetMedia } from "./sheet-bundle";

const SHEET_EVENT = "sp-sheet-change";

/**
 * Option labels stay on one line (CJK text would otherwise break between characters), and each option
 * is sized by its label so the control wraps onto a second row instead of overlapping the labels. The
 * flex override is important because UIKit's option rule is unlayered and would otherwise win.
 */
function Segments(props: ComponentProps<typeof GameSegmentedControl>) {
  return (
    <div className="[&_.game-ui-segmented-option]:!flex-[0_1_auto] [&_.game-ui-segmented-option]:whitespace-nowrap">
      <GameSegmentedControl {...props} />
    </div>
  );
}
function subscribeSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(SHEET_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(SHEET_EVENT, callback);
  };
}

/** The picture, its preview and the optional ZIP extras. The address is the page state. */
export function SheetBuilder({
  actor,
  assets,
  locale,
}: {
  actor: Actor;
  assets: ActorAssets;
  locale: AppLocale;
}) {
  const { t } = useSiteI18n();
  const account = useAccount();
  const { items, looks } = assets;
  const hasPrompt = Boolean(actor.promptSeed);
  const images = useMemo(() => items.filter((item) => item.kind === "image"), [items]);
  const voices = useMemo(() => items.filter((item) => item.kind === "voice"), [items]);
  const videos = useMemo(() => items.filter((item) => item.kind === "video"), [items]);
  const labelMap = useMemo(
    () => Object.fromEntries(items.map((item) => [item.slot, labelsFor(item, assets)])),
    [items, assets],
  );
  const nameOf = (item: AssetItem) => labelMap[item.slot]?.[locale] ?? item.key;
  const presets = useMemo(() => availablePresets(items, looks), [items, looks]);
  const groups = useMemo(
    () =>
      listSeries()
        .filter((series) => !["voice", "video"].includes(series.id))
        .map((series) => ({
          series,
          items: images.filter((item) => item.series === series.id),
        }))
        .filter((group) => group.items.length > 0),
    [images],
  );

  // Server render and first paint use the default preset; the browser then reads the address.
  const search = useSyncExternalStore(
    subscribeSearch,
    () => location.search,
    () => "",
  );
  const sheet = useMemo(
    () => readSheetState(search, { items, looks, hasPrompt }),
    [search, items, looks, hasPrompt],
  );
  function commit(next: SheetState) {
    history.replaceState(history.state, "", `${location.pathname}${sheetSearch(next)}`);
    window.dispatchEvent(new Event(SHEET_EVENT));
  }
  const [limited, setLimited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [needPick, setNeedPick] = useState(false);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const slots = sheet.preset === "custom" ? sheet.slots : presetSlots(sheet.preset, items, looks);
  const slotsKey = slots.join("|");
  const selected = useMemo(() => new Set(slots), [slots]);
  const picked = useMemo(() => {
    const bySlot = new Map(images.map((item) => [item.slot, item]));
    return slotsKey ? slotsKey.split("|").flatMap((slot) => bySlot.get(slot) ?? []) : [];
  }, [slotsKey, images]);
  const expressionGrid = sheet.preset === "expressions";
  const extras = sheet.voice || sheet.video || sheet.prompt;
  const renderKey = `${slotsKey}:${sheet.labels}:${sheet.background}:${expressionGrid}`;

  useEffect(() => {
    const abort = new AbortController();
    const bitmaps: ImageBitmap[] = [];
    void (async () => {
      try {
        const frames: SheetImage[] = [];
        for (const item of picked) {
          const bitmap = await createImageBitmap(await fetchImageBlob(item.thumb, abort.signal));
          bitmaps.push(bitmap);
          frames.push({
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            fullBody: isFullBodySeries(item.series),
            labels: labelMap[item.slot] ?? { en: item.key, zh: item.key },
          });
          abort.signal.throwIfAborted();
        }
        if (canvas.current)
          renderSheet(
            frames,
            { labels: sheet.labels, background: sheet.background, expressionGrid },
            canvas.current,
            true,
          );
        setPreviewFailed(false);
        setPreviewKey(renderKey);
      } catch {
        if (!abort.signal.aborted) setPreviewFailed(true);
      } finally {
        for (const bitmap of bitmaps) bitmap.close();
      }
    })();
    return () => abort.abort();
  }, [renderKey, picked, labelMap, sheet.labels, sheet.background, expressionGrid]);

  function effectiveSlots(state: SheetState) {
    return state.preset === "custom" ? state.slots : presetSlots(state.preset, items, looks);
  }
  function choosePreset(preset: SheetPreset) {
    setLimited(false);
    // Switching to custom keeps what the preset was showing, so it can be adjusted.
    commit({ ...sheet, preset, slots: preset === "custom" ? effectiveSlots(sheet) : [] });
  }
  function tick(slot: string, add: boolean) {
    const current = effectiveSlots(sheet);
    const next = images
      .filter((item) => (item.slot === slot ? add : current.includes(item.slot)))
      .map((item) => item.slot);
    if (add && fitSheetSlots(next, images).length !== next.length) {
      setLimited(true);
      return;
    }
    setLimited(false);
    commit({ ...sheet, preset: "custom", slots: next });
  }

  async function download() {
    if (controller.current) return;
    if (!picked.length) {
      setNeedPick(true);
      return;
    }
    setNeedPick(false);
    setFailed(false);
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    try {
      const { user } = await account.whenReady();
      if (!user) {
        await account.signIn();
        return;
      }
      const sheetFile = await exportPack({
        actor,
        assets,
        selected: picked,
        format: "sheet",
        target: "gpt-image",
        sheet: { labels: sheet.labels, background: sheet.background, expressionGrid },
        locale,
        labels: labelMap,
        signal: abort.signal,
      });
      if (!extras) {
        saveBlob(sheetFile.blob, sheetFile.filename);
        account.event("bundle_download", { format: "sheet" });
        return;
      }
      const media: SheetMedia[] = [];
      const chosen: [SheetMedia["folder"], AssetItem[]][] = [
        ["voice", sheet.voice ? voices : []],
        ["video", sheet.video ? videos : []],
      ];
      for (const [folder, list] of chosen)
        for (const item of list) {
          // The same address VoiceTile downloads a clip from, so a voice reaches the browser one way only.
          const response = await fetch(item.previewUrl ?? item.preview, { signal: abort.signal });
          if (!response.ok) throw new Error("Media download failed");
          media.push({
            folder,
            name: assetFilename(actor.slug, item),
            bytes: new Uint8Array(await response.arrayBuffer()),
          });
        }
      const zip = zipBlob(
        sheetBundleFiles({
          sheetName: sheetFile.filename,
          sheet: new Uint8Array(await sheetFile.blob.arrayBuffer()),
          media,
          prompt: sheet.prompt ? `${actor.promptSeed ?? ""}\n` : undefined,
          profile: sheet.prompt
            ? `${JSON.stringify(characterProfile(actor, assets), null, 2)}\n`
            : undefined,
          license: licenseText(locale),
          readme: sheetReadme({ slug: actor.slug, nameEn: actor.nameEn, nameCn: actor.nameCn }),
        }),
        abort.signal,
      );
      saveBlob(zip, `${actor.slug}_sheet.zip`);
      account.event("bundle_download", { format: "sheet-zip" });
    } catch (error) {
      if (error instanceof SignInRequired) await account.signIn();
      else if (!abort.signal.aborted) setFailed(true);
    } finally {
      controller.current = null;
      if (!abort.signal.aborted) setBusy(false);
    }
  }

  const labelChoices = [
    { id: "none", label: t("assets.labels.none") },
    { id: "zh", label: t("common.languageName.zh") },
    { id: "en", label: t("common.languageName.en") },
  ];
  const backgroundChoices = [
    { id: "grey", label: t("assets.background.light") },
    { id: "white", label: t("assets.background.white") },
    { id: "dark", label: t("assets.background.dark") },
  ];

  return (
    <div className="mt-10 grid gap-10 pb-32 lg:grid-cols-12 lg:gap-10 lg:pb-0">
      <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
        <div className="sp-panel aspect-video overflow-hidden">
          <canvas
            ref={canvas}
            className="h-full w-full"
            aria-label={t("assets.preview")}
            data-preview-ready={previewKey === renderKey}
          />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t border-border bg-background px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:static lg:mt-6 lg:items-start lg:border-0 lg:bg-transparent lg:p-0">
          {needPick ? <GameToast tone="info">{t("assets.selectFirst")}</GameToast> : null}
          {failed || previewFailed ? (
            <GameToast tone="danger">{t("assets.failed")}</GameToast>
          ) : null}
          <GameButton
            variant="primary"
            className="w-full lg:w-auto"
            pending={busy}
            {...(account.user ? {} : account.signInIntent)}
            onClick={() => void download()}
          >
            {busy ? t("assets.preparing") : t(extras ? "sheet.downloadZip" : "sheet.download")}
          </GameButton>
        </div>
      </div>
      <div className="min-w-0 space-y-12 lg:col-span-5">
        <section className="space-y-5">
          <h2 className="sp-subtitle">{t("sheet.pick")}</h2>
          <Segments
            activeId={sheet.preset}
            label={t("sheet.pick")}
            onSelect={(id) => choosePreset(id as SheetPreset)}
            options={presets.map((preset) => ({ id: preset, label: t(`sheet.preset.${preset}`) }))}
          />
          <p className="sp-small text-muted-foreground">
            {t("sheet.count", { count: picked.length, max: SHEET_MAX_IMAGES })}
          </p>
          <output className="sp-small block min-h-5" aria-live="polite">
            {limited ? t("sheet.limit") : null}
          </output>
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.series.id}>
                <h3 className="sp-label">{t(seriesLabelKey(group.series.id))}</h3>
                <ul className="mt-4 grid grid-cols-3 gap-3 xl:grid-cols-4">
                  {group.items.map((item) => {
                    const checked = selected.has(item.slot);
                    return (
                      <li key={item.slot} data-asset-slot={item.slot}>
                        {/* Pointer shortcut for the checkbox below, which stays the accessible control. */}
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-hidden="true"
                          className="sp-asset-frame block w-full cursor-pointer overflow-hidden rounded-[var(--game-ui-radius-card)]"
                          data-selected={checked}
                          onClick={() => tick(item.slot, !checked)}
                        >
                          <Image
                            src={item.thumb}
                            alt=""
                            width={item.width}
                            height={item.height}
                            sizes="(min-width: 1280px) 9rem, 30vw"
                            className="h-auto w-full"
                          />
                        </button>
                        <div className="mt-2 flex min-h-11 items-center">
                          <GameCheckbox
                            checked={checked}
                            onChange={(event) => tick(item.slot, event.currentTarget.checked)}
                            label={nameOf(item)}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-5">
          <h2 className="sp-subtitle">{t("sheet.style")}</h2>
          <Segments
            activeId={sheet.labels}
            label={t("assets.labels")}
            onSelect={(id) => commit({ ...sheet, labels: id as SheetLabels })}
            options={labelChoices}
          />
          <Segments
            activeId={sheet.background}
            label={t("assets.background")}
            onSelect={(id) => commit({ ...sheet, background: id as SheetBackground })}
            options={backgroundChoices}
          />
        </section>
        <section className="space-y-4">
          <h2 className="sp-subtitle">{t("sheet.extras")}</h2>
          {voices.length ? (
            <GameCheckbox
              checked={sheet.voice}
              onChange={(event) => commit({ ...sheet, voice: event.currentTarget.checked })}
              label={t("sheet.withVoice", { count: voices.length })}
            />
          ) : null}
          {videos.length ? (
            <GameCheckbox
              checked={sheet.video}
              onChange={(event) => commit({ ...sheet, video: event.currentTarget.checked })}
              label={t("sheet.withVideo", { count: videos.length })}
            />
          ) : null}
          {hasPrompt ? (
            <GameCheckbox
              checked={sheet.prompt}
              onChange={(event) => commit({ ...sheet, prompt: event.currentTarget.checked })}
              label={t("sheet.withPrompt")}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
