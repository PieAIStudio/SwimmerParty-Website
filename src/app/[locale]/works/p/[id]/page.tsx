import { notFound } from "next/navigation";
import { COMMUNITY_ENABLED } from "@/content/features";
import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { localizedAlternates } from "@/i18n/metadata";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { PostDetail } from "@/features/community";

type Props = { params: Promise<{ locale: AppLocale; id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  return {
    title: t("community.postTitle"),
    robots: { index: false, follow: false },
    alternates: localizedAlternates(locale, "/works"),
  };
}
export default async function CommunityPostPage({ params }: Props) {
  if (!COMMUNITY_ENABLED) notFound();
  const { locale, id } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <Breadcrumbs
        ariaLabel={t("common.breadcrumb")}
        items={[{ label: t("nav.works"), href: "/works" }, { label: t("community.postTitle") }]}
      />
      <PostDetail id={id} />
    </div>
  );
}
