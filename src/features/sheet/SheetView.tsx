import type { Actor } from "@/content/actors";
import type { ActorAssets } from "@/features/assets/asset-types";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { SheetBuilder } from "./SheetBuilder";

export async function SheetView({
  actor,
  assets,
  locale,
}: {
  actor: Actor;
  assets: ActorAssets;
  locale: AppLocale;
}) {
  const { t } = await getSiteI18n(locale);
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return (
    <div className="sp-container">
      <Breadcrumbs
        ariaLabel={t("common.breadcrumb")}
        items={[
          { label: t("nav.actors"), href: "/actors" },
          { label: name, href: `/actors/${actor.slug}` },
          { label: t("sheet.crumb") },
        ]}
      />
      <header>
        <h1 className="sp-display-lg">{t("sheet.title", { name })}</h1>
        <p className="sp-lead mt-5 max-w-3xl">{t("sheet.lead", { name })}</p>
      </header>
      <SheetBuilder actor={actor} assets={assets} locale={locale} />
    </div>
  );
}
