import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";

type LegalBody = {
  title: { en: string; zh: string };
  intro: { en: string; zh: string };
  rows: readonly (readonly [string, string, string, string])[];
};
export async function LegalDocument({
  document,
  locale,
  introWidth,
}: {
  document: LegalBody;
  locale: AppLocale;
  introWidth: "max-w-2xl" | "max-w-3xl";
}) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container py-16">
      <h1 className="sp-display-xl">{document.title[locale]}</h1>
      <p className={`sp-lead mt-5 ${introWidth}`}>{document.intro[locale]}</p>
      <p className="sp-small mt-4 text-muted-foreground">{t("legal.lastUpdated")}</p>
      <div className="mt-12 space-y-5">
        {document.rows.map(([enT, enB, zhT, zhB]) => (
          <article key={enT} className="sp-panel p-5">
            <h2 className="font-semibold">{locale === "zh" ? zhT : enT}</h2>
            <p className="sp-small mt-2">{locale === "zh" ? zhB : enB}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
