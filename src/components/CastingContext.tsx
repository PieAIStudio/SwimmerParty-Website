"use client";

import { useSearchParams } from "next/navigation";
import { getActor } from "@/content/actors";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";

export function CastingContext() {
  const params = useSearchParams();
  const locale = useSiteLocale();
  const { t } = useSiteI18n();
  const actor = getActor(params.get("actor") ?? "");
  if (!actor) return null;
  return (
    <p className="sp-lead mb-4">
      {t("casting.aboutActor", { name: locale === "zh" ? actor.nameCn : actor.nameEn })}
    </p>
  );
}
