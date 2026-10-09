import { HomeView } from "@/features/home";
import type { AppLocale } from "@/i18n/routing";
import { setSiteLocale } from "@/i18n/server";
export default async function Home({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setSiteLocale(locale);
  return <HomeView locale={locale} />;
}
