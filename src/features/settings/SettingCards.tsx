"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { GameButton, GameField, GameTextArea } from "@pieai/swimmer-ui-kit";
import { SETTING_IDS, SETTING_MANIFEST } from "@/content/settings";
import { useSiteI18n } from "@/i18n/client";
import { fetchImageBlob, saveBlob } from "@/lib/browser-files";
import { CopyButton } from "@/site/CopyButton";
import { settingDraftSchema, type SettingDraft } from "./contracts";

// React switches from the server snapshot only after hydration; do not accept edits earlier.
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** One picker, independent of the renderer. Each card retains its own editable sentence. */
export function SettingCards({
  draft,
  onChange,
}: {
  draft?: SettingDraft;
  onChange?: (draft: SettingDraft) => void;
}) {
  const { t } = useSiteI18n();
  const headingId = useId();
  const [local, setLocal] = useState(() => settingDraftSchema.parse(undefined));
  const interactive = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const value = draft ?? local;
  const selected = value.selected;
  const image = SETTING_MANIFEST[selected].image;
  const sentence = value.sentences[selected] ?? t(`settings.sentence.${selected}`);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<{ id: string; failed: boolean } | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  function change(next: SettingDraft) {
    if (onChange) onChange(next);
    else setLocal(next);
  }
  async function download() {
    if (!image || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setDownloading(true);
    setFeedback(null);
    try {
      const blob = await fetchImageBlob(image.download, controller.signal);
      controller.signal.throwIfAborted();
      saveBlob(blob, image.filename);
      setFeedback({ id: selected, failed: false });
    } catch {
      if (!controller.signal.aborted) setFeedback({ id: selected, failed: true });
    } finally {
      request.current = null;
      setDownloading(false);
    }
  }
  return (
    <section
      className="sp-section"
      data-setting-picker
      aria-labelledby={headingId}
      aria-busy={!interactive}
    >
      <h2 id={headingId} className="sp-title">
        {t("settings.title")}
      </h2>
      <p className="sp-small mt-4 max-w-3xl text-muted-foreground">{t("settings.intro")}</p>
      <p className="sp-small mt-2 max-w-3xl text-muted-foreground">{t("settings.separate")}</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SETTING_IDS.map((id) => {
          const reference = SETTING_MANIFEST[id].image;
          const name = t(`settings.name.${id}`);
          return (
            <div key={id} className="min-w-0" data-setting-card={id}>
              {reference ? (
                <Image
                  src={reference.preview}
                  alt={name}
                  width={reference.width}
                  height={reference.height}
                  sizes="(max-width: 639px) 50vw, (max-width: 1279px) 33vw, 400px"
                  className="aspect-video w-full rounded-[var(--game-ui-radius-card)] object-cover"
                />
              ) : (
                <div
                  className="sp-card sp-small flex aspect-video items-center justify-center bg-muted text-center text-muted-foreground"
                  data-setting-placeholder
                >
                  {t("settings.imagePending")}
                </div>
              )}
              <GameButton
                className="mt-2 w-full"
                disabled={downloading || !interactive}
                aria-pressed={id === selected}
                variant={id === selected ? "secondary" : "ghost"}
                onClick={() => change({ ...value, selected: id })}
              >
                {name}
              </GameButton>
            </div>
          );
        })}
      </div>
      <div className="sp-card mt-6 min-w-0 bg-card" data-setting-editor={selected}>
        <h3 className="sp-subtitle">{t(`settings.name.${selected}`)}</h3>
        <GameField label={t("settings.sentence")} className="mt-4">
          <GameTextArea
            aria-label={t("settings.sentence")}
            disabled={!interactive}
            rows={3}
            maxLength={300}
            value={sentence}
            onChange={(event) =>
              change({
                ...value,
                sentences: { ...value.sentences, [selected]: event.target.value },
              })
            }
          />
        </GameField>
        <div className="mt-4 flex flex-wrap gap-3">
          <CopyButton
            key={selected}
            text={sentence}
            label={t("settings.copyPrompt")}
            copiedLabel={t("settings.promptCopied")}
          />
          <GameButton disabled={!image} pending={downloading} onClick={() => void download()}>
            {t("settings.saveImage")}
          </GameButton>
        </div>
        {!image ? (
          <p className="sp-small mt-3 text-muted-foreground">{t("settings.notSupplied")}</p>
        ) : null}
        {feedback?.id === selected ? (
          <p className="sp-small mt-3" role={feedback.failed ? "alert" : "status"}>
            {t(feedback.failed ? "settings.downloadFailed" : "settings.imageSaved")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
