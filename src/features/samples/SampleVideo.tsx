"use client";
import { useEffect, useRef, useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";

/** Native media with a UIKit action. The video URL is absent until the visitor presses play. */
export function SampleVideo({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const { t } = useSiteI18n();
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [aspect, setAspect] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!poster) return;
    let active = true;
    const image = new window.Image();
    image.onload = () => {
      if (active && image.naturalWidth > 0 && image.naturalHeight > 0)
        setAspect(`${image.naturalWidth} / ${image.naturalHeight}`);
    };
    image.src = poster;
    return () => {
      active = false;
      image.onload = null;
    };
  }, [poster]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.pause();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.pause();
    };
  }, []);
  useEffect(() => {
    if (started)
      void video.current?.play().catch(() => {
        /* Native controls allow a second user gesture. */
      });
  }, [started]);
  return (
    <div data-sample-video data-sample-aspect={aspect ?? "unknown"} className="relative min-w-0">
      <video
        ref={video}
        src={started ? src : undefined}
        poster={poster || undefined}
        controls={started}
        muted
        playsInline
        preload="none"
        style={aspect ? { aspectRatio: aspect } : undefined}
        onLoadedMetadata={(event) => {
          const { videoWidth, videoHeight } = event.currentTarget;
          if (videoWidth > 0 && videoHeight > 0) setAspect(`${videoWidth} / ${videoHeight}`);
          setLoading(false);
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        aria-label={label}
        className={`block w-full rounded-[var(--game-ui-radius-card)] bg-muted object-contain ${className}`}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
      />
      {!started ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <GameButton
            aria-label={`${t("samples.play")} · ${label}`}
            onClick={() => {
              setStarted(true);
              setLoading(true);
            }}
          >
            {t("samples.play")}
          </GameButton>
        </div>
      ) : null}
      {loading && !failed ? (
        <output data-video-loading className="sp-small mt-2 block">
          {t("samples.loading")}
        </output>
      ) : null}
      {failed ? <output className="sp-small mt-2 block">{t("samples.playFailed")}</output> : null}
    </div>
  );
}
