import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOL_TUTORIALS } from "@/content/tutorials";
import { ToolGuideView } from "@/features/guide";
import { localizedAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
import { setSiteLocale } from "@/i18n/server";

type Props = { params: Promise<{ locale: AppLocale; tool: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tool } = await params;
  const tutorial = TOOL_TUTORIALS.find((item) => item.id === tool);
  if (!tutorial) notFound();
  return {
    title: `${tutorial.tool} — ${tutorial.goal[locale]}`,
    description: tutorial.goal[locale],
    robots: { index: false, follow: true },
    alternates: localizedAlternates(locale, `/guide/tools/${tool}`),
  };
}
export default async function ToolGuidePage({ params }: Props) {
  const { locale, tool } = await params;
  setSiteLocale(locale);
  const tutorial = TOOL_TUTORIALS.find((item) => item.id === tool);
  if (!tutorial) notFound();
  return <ToolGuideView locale={locale} tutorial={tutorial} />;
}
