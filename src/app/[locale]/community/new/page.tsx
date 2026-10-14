import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMMUNITY_ENABLED } from "@/content/features";
import { Composer } from "@/features/community";
import { setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function NewWorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ id?: string }>;
}) {
  if (!COMMUNITY_ENABLED) notFound();
  const { locale } = await params;
  setSiteLocale(locale);
  const { id } = await searchParams;
  return (
    <div className="sp-container">
      <Composer locale={locale} postId={typeof id === "string" ? id : undefined} />
    </div>
  );
}
