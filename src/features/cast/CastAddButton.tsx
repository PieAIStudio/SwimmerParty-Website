"use client";

import { useState } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { readSavedCast, writeSavedCast } from "./store.ts";

export function CastAddButton({ slug }: { slug: string; locale: "en" | "zh"; name?: string }) {
  const { t } = useSiteI18n();
  const [added, setAdded] = useState(false);
  function add() {
    const saved = readSavedCast();
    if (!saved.includes(slug) && saved.length < 12) {
      writeSavedCast([...saved, slug]);
      setAdded(true);
    }
  }
  return (
    <GameButton variant="ghost" onClick={add}>
      {added ? t("cast.added") : t("cast.add")}
    </GameButton>
  );
}
