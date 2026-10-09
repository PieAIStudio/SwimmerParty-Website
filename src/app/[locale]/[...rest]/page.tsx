import { notFound } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { setSiteLocale } from "@/i18n/server";

// Unknown paths under a locale render the localized not-found page instead of Next's default.
export default async function UnknownPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  setSiteLocale((await params).locale);
  notFound();
}
