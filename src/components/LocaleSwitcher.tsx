"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LOCALE_LABEL,
  MACHINE_LOCALES,
  machineTranslateUrl,
  routing,
  type AppLocale,
} from "@/i18n/routing";
import { SITE } from "@/lib/site";

/**
 * Two authored languages, then a list that leaves the site.
 *
 * The split is drawn on screen, not hidden: a machine-translated page is a
 * different kind of object from one somebody wrote, and labelling nine
 * proxy renders as if they were localisations is the same species of claim
 * as a fake client logo. The proxy always translates the English build —
 * machine output from English beats machine output from Chinese for every
 * target in this list.
 */
export function LocaleSwitcher({ variant = "rail" }: { variant?: "rail" | "panel" }) {
  const t = useTranslations("common");
  const active = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!host.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const englishPath = `/en${pathname === "/" ? "" : pathname}`;

  const list = (
    <div className="border border-[var(--sp-hairline)] bg-void">
      <p className="sp-label border-b border-[var(--sp-hairline)] px-4 py-2 text-[0.5rem] text-acid">
        {t("authored")}
      </p>
      <ul>
        {routing.locales.map((code) => (
          <li key={code}>
            <Link
              href={pathname}
              locale={code}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between gap-8 px-4 py-2.5 text-xs transition-colors hover:bg-acid hover:text-black ${
                code === active ? "text-acid" : "text-bone"
              }`}
              aria-current={code === active ? "true" : undefined}
            >
              <span className="sp-cjk">{LOCALE_LABEL[code]}</span>
              <span className="sp-label text-[0.5rem] opacity-60">{code.toUpperCase()}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="sp-label border-y border-[var(--sp-hairline)] px-4 py-2 text-[0.5rem] text-smoke">
        {t("machine")}
      </p>
      <ul className="grid grid-cols-2">
        {MACHINE_LOCALES.map((m) => (
          <li key={m.code}>
            <a
              href={machineTranslateUrl(SITE.url, englishPath, m.code)}
              rel="nofollow noopener"
              target="_blank"
              onClick={() => setOpen(false)}
              className="sp-cjk block px-4 py-2 text-xs text-smoke transition-colors hover:bg-bone hover:text-black"
            >
              {m.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="sp-cjk border-t border-[var(--sp-hairline)] px-4 py-3 text-[0.625rem] leading-relaxed text-ash">
        {t("machineNote")}
      </p>
    </div>
  );

  if (variant === "panel") return list;

  return (
    <div ref={host} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("language")}
        className="sp-label flex items-center gap-1.5 px-2 py-2 text-[0.5625rem] text-bone transition-colors hover:text-acid"
      >
        {active.toUpperCase()}
        <span aria-hidden className={open ? "rotate-180" : undefined}>
          ▾
        </span>
      </button>
      {open ? <div className="absolute top-full right-0 z-50 mt-2 w-72">{list}</div> : null}
    </div>
  );
}
