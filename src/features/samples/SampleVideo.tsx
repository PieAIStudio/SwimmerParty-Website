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
  const video = useRef<HTMLVideoElement>(null);
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
    <div data-sample-video className="relative min-w-0">
      <video
        ref={video}
        src={started ? src : undefined}
        poster={poster || undefined}
        controls={started}
        muted
        playsInline
        preload="none"
        aria-label={label}
        className={`block w-full rounded-[var(--game-ui-radius-card)] bg-muted object-contain ${className}`}
        onError={() => setFailed(true)}
      />
      {!started ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <GameButton
            aria-label={`${t("samples.play")} · ${label}`}
            onClick={() => setStarted(true)}
          >
            {t("samples.play")}
          </GameButton>
        </div>
      ) : null}
      {failed ? <output className="sp-small mt-2 block">{t("samples.playFailed")}</output> : null}
    </div>
  );
}
