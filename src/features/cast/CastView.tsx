import { ACTORS } from "@/content/actors";
import { getActorAssets } from "@/features/assets/queries";
import { starterSlots } from "@/features/assets/contracts";
import { CastBoard } from "./CastBoard";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
export async function CastView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container py-16">
      <p className="sp-label">{t("cast.eyebrow")}</p>
      <h1 className="sp-display-xl mt-3">{t("cast.title")}</h1>
      <p className="sp-lead mt-5">{t("cast.intro")}</p>
      <CastBoard
        actors={ACTORS}
        starterSlots={Object.fromEntries(
          ACTORS.map((actor) => [actor.slug, starterSlots(getActorAssets(actor.slug).items)]),
        )}
        locale={locale}
      />
    </div>
  );
}
