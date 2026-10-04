"use client";

import { useSiteLocale, useSiteI18n } from "@/i18n/client";
import { usePathname } from "@/i18n/navigation";
import { localePath, MACHINE_LOCALES, machineTranslateUrl } from "@/i18n/routing";
import { SITE } from "@/lib/site";
import { GameLanguageMenu } from "@pieai/swimmer-ui-kit";

/** Authored locales retain the current path, query and hash. */
export function LocaleSwitcher({ variant = "rail" }: { variant?: "rail" | "panel" }) {
  const { t } = useSiteI18n();
  const active = useSiteLocale();
  const pathname = usePathname();
  const options = [
    { id: "zh", label: "中文", meta: t("common.authored") },
    { id: "en", label: "English", meta: t("common.authored") },
    ...MACHINE_LOCALES.map((machine) => ({
      id: machine.code,
      label: machine.label,
      meta: t("common.machine"),
    })),
  ];
  function select(id: string) {
    if (id === "zh" || id === "en") {
      window.location.assign(
        `${localePath(pathname, id)}${window.location.search}${window.location.hash}`,
      );
      return;
    }
    const englishPath = `/en${pathname === "/" ? "" : pathname}`;
    window.open(machineTranslateUrl(SITE.url, englishPath, id), "_blank", "noopener,noreferrer");
  }
  return (
    <GameLanguageMenu
      className={variant === "rail" ? "relative z-10" : "w-full"}
      label={t("common.language")}
      currentLabel={active === "zh" ? "中文" : "English"}
      value={active}
      options={options}
      onSelect={select}
    />
  );
}
