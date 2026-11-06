import { ACTORS } from "@/content/actors";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { SceneEditor } from "./SceneEditor";

export async function SceneView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container sp-scene-page">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="sp-subtitle">{t("scene.title")}</h1>
        <Link href="/cast" className="sp-link sp-small">
          {t("nav.cast")}
        </Link>
      </div>
      <SceneEditor
        actors={ACTORS.map((actor) => ({
          slug: actor.slug,
          name: locale === "zh" ? actor.nameCn : actor.nameEn,
          gender: actor.gender,
          ...(actor.heightCm ? { heightCm: actor.heightCm } : {}),
        }))}
      />
    </div>
  );
}
