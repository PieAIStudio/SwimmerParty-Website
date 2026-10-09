import { getSiteI18n } from "@/i18n/server";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container grid min-h-[65vh] place-items-center py-16 text-center">
      <div>
        <p className="sp-label text-muted-foreground">{t("notFound.eyebrow")}</p>
        <h1 className="sp-display-lg mt-4">
          {t("notFound.lines.0")} {t("notFound.lines.1")}
        </h1>
        <GameButton variant="primary" href="/actors" linkComponent={Link} className="mt-8">
          {t("notFound.cta")}
        </GameButton>
      </div>
    </div>
  );
}
