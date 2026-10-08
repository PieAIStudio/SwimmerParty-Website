import { ACTORS } from "@/content/actors";
import { CastBoard } from "@/features/cast";
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
    title: locale === "zh" ? "选角单" : "My cast",
    alternates: localizedAlternates(locale, "/cast"),
  };
}
export default async function CastPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return (
    <div className="sp-container py-16">
      <p className="sp-label">{locale === "zh" ? "选角单" : "Cast"}</p>
      <h1 className="sp-display-xl mt-3">{locale === "zh" ? "我的选角单" : "My cast"}</h1>
      <p className="sp-lead mt-5">
        {locale === "zh"
          ? "把演员放在一起，复制名单，发给团队。"
          : "Put actors together, copy the lineup and share it with your team."}
      </p>
      <CastBoard actors={ACTORS} locale={locale} />
    </div>
  );
}
