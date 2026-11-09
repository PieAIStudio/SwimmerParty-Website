import { notFound } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { FilmShotView } from "@/features/scene";
export default async function FilmPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ shot?: string }>;
}) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "zh") notFound();
  const { shot } = await searchParams;
  if (!shot) notFound();
  return <FilmShotView encodedShot={shot} />;
}
