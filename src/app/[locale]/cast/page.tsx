import { ACTORS } from "@/content/actors";
import { CastBoard } from "@/features/cast";
import { getActorAssets, starterSlots } from "@/features/assets";
import { setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import type { Metadata } from "next";
import { localizedAlternates } from "@/i18n/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "我的选角单" : "Your cast",
    alternates: localizedAlternates(locale, "/cast"),
  };
}
export default async function CastPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return (
    <div className="sp-container py-16">
      <p className="sp-label">{locale === "zh" ? "选角单" : "Cast"}</p>
      <h1 className="sp-display-xl mt-3">{locale === "zh" ? "我的选角单" : "Your cast"}</h1>
      <p className="sp-lead mt-5">
        {locale === "zh"
          ? "挑好你项目要用的演员，一次全部下载。"
          : "Pick the actors for your project, then download them all at once."}
      </p>
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
