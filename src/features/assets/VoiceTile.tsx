"use client";
import { useState } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameBadge } from "@pieai/swimmer-ui-kit";
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
  // Fetch then save, so the file gets the actor's name wherever the audio is stored.
  async function download(voice: AssetItem) {
    const response = await fetch(voice.previewUrl ?? voice.preview);
    if (response.ok)
      saveBlob(await response.blob(), assetFilename(voice.object.split("/")[1] ?? "voice", voice));
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
          >
            <track
              kind="captions"
              srcLang="en"
              label="English"
              src={`data:text/vtt,WEBVTT%0A%0A00:00.000%20--%3E%2000:30.000%0A${encodeURIComponent(item.transcript?.text ?? "")}`}
            />
          </audio>
          {item.transcript?.text ? (
            <>
              <button
                type="button"
                className="sp-small mt-4 font-semibold underline underline-offset-4"
                onClick={() => setShow((v) => !v)}
              >
                {show ? t("assets.hideLines") : t("assets.showLines")}
              </button>
              {show ? (
                <p className="sp-small mt-3 whitespace-pre-wrap text-muted-foreground">
                  {item.transcript.text}
                </p>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            className="sp-small mt-4 block font-semibold underline underline-offset-4"
            onClick={() => void download(item)}
          >
            {t("assets.downloadWav")}
          </button>
        </>
      ) : (
        <p className="sp-small mt-5 text-muted-foreground">{t("assets.pending")}</p>
      )}
    </article>
  );
}
