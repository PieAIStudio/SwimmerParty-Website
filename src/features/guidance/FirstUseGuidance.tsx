"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { GameButton, GameHelpCard, type GameHelpCardTopic } from "@pieai/swimmer-ui-kit";
import { createFirstUseTracker, isFirstUseKind, type FirstUseKind } from "./first-use";

const tracker = createFirstUseTracker(() => window.localStorage);
type Notice = { kind: FirstUseKind; source: HTMLElement | null };

/** Route changes discard unviewed hints, not the persistent seen preference. */
export function FirstUseGuidance() {
  const path = usePathname();
  return <GuidanceForPage key={path} />;
}
function GuidanceForPage() {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const [queue, setQueue] = useState<Notice[]>([]);
  useEffect(() => {
    const receive = (event: Event) => {
      const kind: unknown = (event as CustomEvent)?.detail?.kind;
      if (!isFirstUseKind(kind) || tracker.seen(kind)) return;
      const source =
        document.activeElement instanceof HTMLElement && document.activeElement !== document.body
          ? document.activeElement
          : null;
      setQueue((current) =>
        current.some((entry) => entry.kind === kind) ? current : [...current, { kind, source }],
      );
    };
    window.addEventListener("sp-first-use", receive);
    return () => window.removeEventListener("sp-first-use", receive);
  }, []);
  const current = queue[0];
  if (!current) return null;
  const { kind } = current;
  const topic: GameHelpCardTopic = {
    id: kind,
    label: t(`firstUse.${kind}.title`),
    title: t(`firstUse.${kind}.title`),
    body: t(`firstUse.${kind}.body`),
  };
  if (kind === "download" || kind === "cast") {
    const clip = kind === "download" ? "starter" : "cast";
    topic.media = {
      kind: "video",
      sources: [
        { src: `/help/${locale}/${clip}.webm`, type: "video/webm" },
        { src: `/help/${locale}/${clip}.mp4`, type: "video/mp4" },
      ],
      poster: `/help/${locale}/${clip}-poster.webp`,
      alt: t(`firstUse.${kind}.body`),
      width: 640,
      height: 400,
    };
  }
  const remember = () => tracker.markSeen(kind);
  function dismiss() {
    remember();
    setQueue((items) => items.slice(1));
    if (current.source?.isConnected) current.source.focus({ preventScroll: true });
  }
  return (
    <aside
      data-first-use={kind}
      aria-label={t("firstUse.label")}
      className="fixed bottom-40 right-5 z-40 flex max-w-[calc(100vw-40px)] flex-wrap items-center justify-end gap-2"
    >
      <GameHelpCard
        key={kind}
        label={t(`firstUse.${kind}.title`)}
        topics={[topic]}
        placement="top"
        align="end"
        link={{ href: `/${locale}/guide`, label: t("help.fullGuide") }}
      >
        <GameButton onFocus={remember} onClick={remember}>
          {t(`firstUse.${kind}.title`)}
        </GameButton>
      </GameHelpCard>
      <GameButton onClick={dismiss} aria-label={t("firstUse.dismiss")}>
        {t("firstUse.dismiss")}
      </GameButton>
    </aside>
  );
}
