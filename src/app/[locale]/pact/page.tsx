import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { localizedAlternates } from "@/i18n/metadata";
import { REFUSALS, WHY } from "@/content/doctrine";
import { CLAUSES, TERMS, PACT_VERSION } from "@/content/pact";
import { PageIntro } from "@/site/PageIntro";
import { SectionHead } from "@/site/SectionHead";
import { TextLink } from "@/site/TextLink";
import { GameBadge, GameIcon } from "@pieai/swimmer-ui-kit";

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return {
    title: t("pact.metaTitle"),
    description: t("pact.metaDescription"),
    alternates: localizedAlternates("/pact"),
  };
}
export default async function PactPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <PageIntro eyebrow={t("pact.eyebrow")} lines={[t("pact.heroLines.0"), t("pact.heroLines.1")]}>
        {t("pact.intro")}
      </PageIntro>
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="sp-code text-muted-foreground">{PACT_VERSION}</span>
        <GameBadge tone="neutral">{t("common.draft")}</GameBadge>
      </div>
      <section className="sp-section">
        <SectionHead
          label={t("pact.partOneLabel")}
          title={t("pact.partOneTitle")}
          note={t("pact.partOneNote")}
        />
        <div className="sp-card mt-8 bg-card lg:mt-10">
          <ul className="space-y-8">
            {REFUSALS.map((refusal) => (
              <li key={refusal.id} className="flex gap-4">
                <GameIcon icon="close" className="mt-1 shrink-0 text-danger-ink" />
                <div>
                  <h3 className="sp-subtitle">{refusal.head[locale]}</h3>
                  <p className="mt-3 max-w-[48rem] text-muted-foreground">{refusal.body[locale]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="sp-reading mt-12">
          <h3 className="sp-subtitle mb-6">{t("pact.whyLabel")}</h3>
          {WHY.map((paragraph) => (
            <p key={paragraph.id} className="mt-6">
              {paragraph.body[locale]}
            </p>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("pact.partTwoLabel")}
          title={t("pact.partTwoTitle")}
          note={t("pact.partTwoNote")}
        />
        <div className="mt-8 space-y-8 lg:mt-10">
          {CLAUSES.map((clause) => (
            <article key={clause.id} className="grid gap-4 sm:grid-cols-[3rem_1fr]">
              <p className="sp-code text-muted-foreground">{clause.n}</p>
              <div>
                <h3 className="sp-subtitle">{clause.head[locale]}</h3>
                <p className="mt-3 max-w-[48rem] text-muted-foreground">{clause.body[locale]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead label={t("pact.termsLabel")} title={t("pact.termsTitle")} />
        <table className="mt-8 w-full table-fixed border-collapse text-left lg:mt-10">
          <caption className="sr-only">{t("pact.termsTitle")}</caption>
          <tbody>
            {TERMS.map((term) => (
              <tr className="border-b border-border" key={term.id}>
                <th scope="row" className="w-[42%] py-5 pr-4 font-semibold">
                  {term.label[locale]}
                </th>
                <td className={`py-5 ${term.settled ? "" : "text-muted-foreground"}`}>
                  <span>{term.value[locale]}</span>
                  <span className="sp-small mt-2 block text-muted-foreground">
                    {t(term.settled ? "pact.settled" : "pact.openTerm")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sp-small mt-6 max-w-[48rem] text-muted-foreground">{t("pact.draftNote")}</p>
      </section>
      <p className="sp-lead">{t("pact.outro")}</p>
      <TextLink href="/casting" className="mt-4">
        {t("pact.outroCta")}
      </TextLink>
    </div>
  );
}
