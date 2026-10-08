"use client";
import { useState } from "react";
import { useSiteI18n } from "@/i18n/client";
import { GameBadge } from "@pieai/swimmer-ui-kit";
export function VersionBadge({
  version,
  date,
  note,
}: {
  version?: string;
  date?: string;
  note?: string;
}) {
  const { t } = useSiteI18n();
  const [open, setOpen] = useState(false);
  if (!version) return null;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={t("assets.versionLabel", { version })}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <GameBadge tone="neutral">v{version}</GameBadge>
      </button>
      {open ? (
        <dialog
          open
          className="absolute top-full right-0 z-30 mt-2 w-72 rounded-[var(--game-ui-radius-card)] border border-border bg-background p-4 shadow-xl"
        >
          <p className="font-semibold">{t("actor.versionHistory")}</p>
          <p className="sp-small mt-2">
            v{version}
            {date ? ` · ${date}` : ""} · {t("assets.current")}
          </p>
          {note ? <p className="sp-small mt-2 text-muted-foreground">{note}</p> : null}
          <p className="sp-small mt-3 text-muted-foreground">{t("actor.versionNote")}</p>
        </dialog>
      ) : null}
    </span>
  );
}
