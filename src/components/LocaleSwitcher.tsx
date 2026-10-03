"use client";

import { useEffect, useRef } from "react";
import { useSiteLocale, useSiteI18n } from "@/i18n/client";
import { Link, usePathname } from "@/i18n/navigation";
import { MACHINE_LOCALES, machineTranslateUrl } from "@/i18n/routing";
import { SITE } from "@/lib/site";
import { Icon } from "@/ui/icons";

/** Authored locales remain ordinary links; machine proxies are labelled separately. */
export function LocaleSwitcher({ variant = "rail" }: { variant?: "rail" | "panel" }) {
  const { t } = useSiteI18n();
  const active = useSiteLocale();
  const pathname = usePathname();
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!details.current?.contains(event.target as Node))
        details.current?.removeAttribute("open");
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.current?.open) {
        details.current.removeAttribute("open");
        details.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const englishPath = `/en${pathname === "/" ? "" : pathname}`;
  return (
    <div className="flex flex-wrap items-center gap-3" aria-label={t("common.language")}>
      <div className="inline-flex rounded-full bg-muted px-1 py-1">
        {(["zh", "en"] as const).map((code) => (
          <Link
            key={code}
            href={pathname}
            locale={code}
            lang={code === "zh" ? "zh-Hans" : "en"}
            aria-current={code === active ? "true" : undefined}
            className={`rounded-full px-2 py-1 text-[13px] font-semibold hover:underline underline-offset-4 ${code === active ? "bg-background text-foreground" : "text-muted-foreground"}`}
          >
            {code === "zh" ? "中文" : "EN"}
          </Link>
        ))}
      </div>
      <details ref={details} className="relative">
        <summary className="sp-small cursor-pointer text-muted-foreground">
          {t("common.machine")}
        </summary>
        <div
          className={`${variant === "rail" ? "absolute top-full right-0 z-50 mt-3" : "mt-3"} sp-card w-72 max-w-full bg-card`}
        >
          <p className="sp-label text-muted-foreground">{t("common.machine")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {MACHINE_LOCALES.map((machine) => (
              <li key={machine.code}>
                <a
                  href={machineTranslateUrl(SITE.url, englishPath, machine.code)}
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  className="sp-small inline-flex items-center gap-1 py-2 hover:underline underline-offset-4"
                >
                  {machine.label}
                  <Icon name="external" width={14} height={14} />
                </a>
              </li>
            ))}
          </ul>
          <p className="sp-small mt-4 text-muted-foreground">{t("common.machineNote")}</p>
        </div>
      </details>
    </div>
  );
}
