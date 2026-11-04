import { ACTORS } from "@/content/actors";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { SceneEditor } from "./SceneEditor";

export async function SceneView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container pt-8">
      <Link href="/cast" className="sp-link">
        {t("nav.cast")}
      </Link>
      <h1 className="sp-display-lg mt-5">{t("scene.title")}</h1>
      <p className="sp-small my-5 max-w-3xl text-muted-foreground">{t("scene.intro")}</p>
      <SceneEditor
        actors={ACTORS.map((actor) => ({
          slug: actor.slug,
          name: locale === "zh" ? actor.nameCn : actor.nameEn,
          ...(actor.heightCm ? { heightCm: actor.heightCm } : {}),
        }))}
      />
    </div>
  );
}
