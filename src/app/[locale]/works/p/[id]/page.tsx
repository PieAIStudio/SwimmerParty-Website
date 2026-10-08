import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { localizedAlternates } from "@/i18n/metadata";
import { Breadcrumbs } from "@/site/Breadcrumbs";
import { PostDetail } from "@/features/community";

type Props = { params: Promise<{ locale: AppLocale; id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "作品" : "Works",
    alternates: localizedAlternates(locale, "/works"),
  };
}
export default async function CommunityPostPage({ params }: Props) {
  const { locale, id } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <Breadcrumbs
        ariaLabel={t("common.breadcrumb")}
        items={[
          { label: t("nav.works"), href: "/works" },
          { label: locale === "zh" ? "作品" : "Works" },
        ]}
      />
      <PostDetail id={id} locale={locale} />
    </div>
  );
}
