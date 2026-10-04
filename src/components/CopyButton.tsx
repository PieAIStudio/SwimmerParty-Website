"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { GameIcon } from "@pieai/swimmer-ui-kit";

/** The surrounding text remains selectable when clipboard access is denied. */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useSiteI18n();
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(timer.current);
      setDone(true);
      timer.current = setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  };
  return (
    <GameButton onClick={copy}>
      <GameIcon icon={done ? "check" : "copy"}  />
      <span aria-live="polite">{done ? t("common.copied") : (label ?? t("common.copy"))}</span>
    </GameButton>
  );
}
