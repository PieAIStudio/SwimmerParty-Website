"use client";
import { useState } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameBadge, GameButton } from "@pieai/swimmer-ui-kit";
import type { AssetItem } from "./asset-types";
import { assetFilename } from "./downloads";
import { saveBlob } from "@/lib/browser-files";
export function VoiceTile({
  item,
  label,
  reference = false,
}: {
  item?: AssetItem;
  label: string;
  reference?: boolean;
}) {
  const { t } = useSiteI18n();
  const [show, setShow] = useState(false);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [downloadFailed, setDownloadFailed] = useState(false);
  // Fetch then save, so the file gets the actor's name wherever the audio is stored.
  async function download(voice: AssetItem) {
    setDownloadFailed(false);
    try {
      const response = await fetch(voice.previewUrl ?? voice.preview);
      if (!response.ok) throw new Error("Voice unavailable");
      saveBlob(await response.blob(), assetFilename(voice.object.split("/")[1] ?? "voice", voice));
    } catch {
      setDownloadFailed(true);
    }
  }
  return (
    <article data-voice-slot={item?.slot} className="sp-card bg-card">
      {" "}
      <div className="flex items-start justify-between gap-3">
        <h3 className="sp-subtitle">{label}</h3>
        {reference && item ? (
          <GameBadge tone="success">{t("assets.voiceReference")}</GameBadge>
        ) : null}
      </div>
      {item ? (
        <>
          <audio
            className="mt-5 w-full"
            controls
            preload="none"
            src={item.previewUrl ?? item.preview}
            onLoadStart={() => setAudioState("loading")}
            onWaiting={() => setAudioState("loading")}
            onCanPlay={() => setAudioState("ready")}
            onPlaying={() => setAudioState("ready")}
            onError={() => setAudioState("failed")}
          >
            <track
              kind="captions"
              srcLang="en"
              label={t("common.languageName.en")}
              src={`data:text/vtt,WEBVTT%0A%0A00:00.000%20--%3E%2000:30.000%0A${encodeURIComponent(item.transcript?.text ?? "")}`}
            />
          </audio>
          <output
            data-audio-state={audioState}
            className="sp-small mt-2 block text-muted-foreground"
          >
            {t(`assets.audioState.${audioState}`)}
          </output>
          {item.transcript?.text ? (
            <>
              <GameButton variant="ghost" className="mt-3" onClick={() => setShow((v) => !v)}>
                {show ? t("assets.hideLines") : t("assets.showLines")}
              </GameButton>
              {show ? (
                <p className="sp-small mt-3 whitespace-pre-wrap text-muted-foreground">
                  {item.transcript.text}
                </p>
              ) : null}
            </>
          ) : null}
          <GameButton variant="ghost" className="mt-3" onClick={() => void download(item)}>
            {t("assets.downloadWav")}
          </GameButton>
          {downloadFailed ? <output className="sp-small block">{t("assets.failed")}</output> : null}
        </>
      ) : (
        <p className="sp-small mt-5 text-muted-foreground">{t("assets.pending")}</p>
      )}
    </article>
  );
}
