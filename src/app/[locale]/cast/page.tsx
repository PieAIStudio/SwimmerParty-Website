import { ACTORS } from "@/content/actors";
import { CastBoard } from "@/features/cast";
import { getActorAssets, starterSlots } from "@/features/assets";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import type { Metadata } from "next";
import { localizedAlternates } from "@/i18n/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  return {
    title: t("cast.title"),
    alternates: localizedAlternates(locale, "/cast"),
  };
}
export default async function CastPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  setSiteLocale(locale);
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
