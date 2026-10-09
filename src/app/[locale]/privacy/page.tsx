import { PRIVACY } from "@/content/legal";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import type { Metadata } from "next";
import { localizedAlternates } from "@/i18n/metadata";
const l = (x: { en: string; zh: string }, loc: AppLocale) => x[loc];
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: l(PRIVACY.title, locale),
    description: l(PRIVACY.description, locale),
    alternates: localizedAlternates(locale, "/privacy"),
  };
}
export default async function Privacy({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  setSiteLocale(locale);
  return (
    <div className="sp-container py-16">
      <h1 className="sp-display-xl">{l(PRIVACY.title, locale)}</h1>
      <p className="sp-lead mt-5 max-w-2xl">{l(PRIVACY.intro, locale)}</p>
      <p className="sp-small mt-4 text-muted-foreground">{t("legal.lastUpdated")}</p>
      <div className="mt-12 space-y-5">
        {PRIVACY.rows.map(([enT, enB, zhT, zhB]) => (
          <article key={enT} className="sp-panel p-5">
            <h2 className="font-semibold">{locale === "zh" ? zhT : enT}</h2>
            <p className="sp-small mt-2">{locale === "zh" ? zhB : enB}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
