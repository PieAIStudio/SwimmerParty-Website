"use client";
import { useId, useState } from "react";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
export function AudioPreview({
  src,
  transcript,
  onError,
}: {
  src: string;
  transcript?: string | null;
  onError?: () => void;
}) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const id = useId();
  const [duration, setDuration] = useState(0);
  // Author-supplied words only: no generated transcript or invented timing. One cue spans the measured recording.
  const clean = transcript
    ?.replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]!)
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n");
  const milliseconds = Math.ceil(duration * 1000);
  const end = `${Math.floor(milliseconds / 3600000)
    .toString()
    .padStart(2, "0")}:${Math.floor((milliseconds / 60000) % 60)
    .toString()
    .padStart(2, "0")}:${Math.floor((milliseconds / 1000) % 60)
    .toString()
    .padStart(2, "0")}.${(milliseconds % 1000).toString().padStart(3, "0")}`;
  return (
    <div className="grid min-w-0 gap-2">
      <audio
        src={src}
        controls
        preload="none"
        aria-label={t("community.kind.audio")}
        aria-describedby={id}
        className="w-full"
        onError={onError}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
      >
        <track
          kind="captions"
          srcLang={locale}
          label={t("c.transcript")}
          src={
            clean && duration > 0
              ? `data:text/vtt,${encodeURIComponent(`WEBVTT\n\n00:00:00.000 --> ${end}\n${clean}\n`)}`
              : undefined
          }
        />
      </audio>
      <p id={id} className="sp-small whitespace-pre-wrap break-words">
        {transcript || t("c.noTranscript")}
      </p>
    </div>
  );
}
