"use client";
import { useState } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameButton } from "@pieai/swimmer-ui-kit";
export function ShareButton() {
  const { t } = useSiteI18n();
  const [copied, setCopied] = useState(false);
  return (
    <GameButton
      onClick={async () => {
        if (navigator.share) {
          try {
            await navigator.share({ url: window.location.href });
            return;
          } catch {}
        }
        await navigator.clipboard?.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? t("common.copied") : t("common.share")}
    </GameButton>
  );
}
