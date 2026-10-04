"use client";

import { useSiteI18n } from "@/i18n/client";
import { setSiteTheme, useSiteTheme } from "@/lib/use-site-theme";
import { GameIconButton } from "@pieai/swimmer-ui-kit";
import { GameIcon } from "@pieai/swimmer-ui-kit";

export function ThemeToggle() {
  const theme = useSiteTheme();
  const { t } = useSiteI18n();
  return (
    <GameIconButton
      label={t("common.themeToggle")}
      title={t(theme === "light" ? "common.themeDark" : "common.themeLight")}
      onClick={() => setSiteTheme(theme === "light" ? "dark" : "light")}
    >
      <GameIcon icon={theme === "light" ? "moon" : "sun"} />
    </GameIconButton>
  );
}
