"use client";

import { useSiteI18n } from "@/i18n/client";
import { setSiteTheme, useSiteTheme } from "@/lib/use-site-theme";
import { GameIconButton } from "@/ui/kit";
import { Icon } from "@/ui/icons";

export function ThemeToggle() {
  const theme = useSiteTheme();
  const { t } = useSiteI18n();
  return (
    <GameIconButton
      label={t("common.themeToggle")}
      title={t(theme === "light" ? "common.themeDark" : "common.themeLight")}
      onClick={() => setSiteTheme(theme === "light" ? "dark" : "light")}
    >
      <Icon name={theme === "light" ? "moon" : "sun"} />
    </GameIconButton>
  );
}
