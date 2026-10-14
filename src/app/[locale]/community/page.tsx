import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMMUNITY_MODE } from "@/content/features";
import { CommunityFeed } from "@/features/community";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { localizedAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  return {
    title: t("c.title"),
    alternates: localizedAlternates(locale, "/community"),
    robots: { index: COMMUNITY_MODE === "on", follow: COMMUNITY_MODE === "on" },
  };
}
export default async function CommunityPage({ params }: Props) {
  if (COMMUNITY_MODE === "off") notFound();
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container sp-section">
      <h1 className="sp-title mb-6">{t("c.title")}</h1>
      <CommunityFeed />
    </div>
  );
}
