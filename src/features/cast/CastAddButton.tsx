"use client";

import { useSyncExternalStore } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameBadge, GameButton } from "@pieai/swimmer-ui-kit";
import { announceFirstUse } from "@/features/guidance/client";
import { readSavedCast, subscribeCast, writeSavedCast } from "./store.ts";

export function CastAddButton({ slug }: { slug: string; locale: "en" | "zh"; name?: string }) {
  const { t } = useSiteI18n();
  // Other cards, the cast board, browser back and other tabs share this one source.
  const added = useSyncExternalStore(
    subscribeCast,
    () => readSavedCast().includes(slug),
    () => false,
  );
  function add() {
    const saved = readSavedCast();
    if (!saved.includes(slug) && saved.length < 12) {
      writeSavedCast([...saved, slug]);
      announceFirstUse("cast");
    }
  }
  return added ? (
    <span data-in-cast="true">
      <GameBadge tone="success">{t("cast.added")}</GameBadge>
    </span>
  ) : (
    <GameButton variant="ghost" data-in-cast="false" onClick={add}>
      {t("cast.add")}
    </GameButton>
  );
}
