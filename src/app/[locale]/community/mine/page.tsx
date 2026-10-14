import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMMUNITY_ENABLED } from "@/content/features";
import { MyWorks } from "@/features/community";
import { setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function MyWorksPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  if (!COMMUNITY_ENABLED) notFound();
  setSiteLocale((await params).locale);
  return (
    <div className="sp-container">
      <MyWorks />
    </div>
  );
}
