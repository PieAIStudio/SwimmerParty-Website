import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { localizedAlternates } from "@/i18n/metadata";
import { PageIntro } from "@/site/PageIntro";
import { SectionHead } from "@/site/SectionHead";
import { GameButton, GameIcon } from "@pieai/swimmer-ui-kit";
import type { MessageContracts } from "@/i18n/message-contracts";
type Key = Extract<keyof MessageContracts, string>;

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return {
    title: t("studio.metaTitle"),
    description: t("studio.metaDescription"),
    alternates: localizedAlternates(locale, "/studio"),
  };
}
export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const msg = (key: string) => t(key as Key, {} as never);
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("studio.eyebrow")}
        lines={[t("studio.heroLines.0"), t("studio.heroLines.1")]}
      >
        {t("studio.intro")}
      </PageIntro>
      <section className="sp-section">
        <SectionHead label={t("studio.beliefsLabel")} title={t("studio.beliefsTitle")} />
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2">
          {([0, 1, 2, 3] as const).map((index) => (
            <article className="sp-card bg-card" key={index}>
              <p className="sp-code text-muted-foreground">{t(`studio.beliefs.${index}.n`)}</p>
              <h3 className="sp-subtitle mt-4">{t(`studio.beliefs.${index}.title`)}</h3>
              <p className="mt-4 text-muted-foreground">{t(`studio.beliefs.${index}.body`)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("studio.missionLabel")}
          title={t("studio.missionTitle")}
          note={t("studio.missionBody")}
        />
        <p className="sp-lead mt-6 max-w-2xl">{t("studio.missionLine")}</p>
        <a
          href="https://www.swiminai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="sp-link mt-6"
        >
          {t("studio.missionLink")}
          <GameIcon icon="arrow-right" />
        </a>
      </section>
      <section className="sp-section" id="work-with-us">
        <SectionHead
          label={locale === "zh" ? "找我们合作" : "Work with us"}
          title={locale === "zh" ? "两种合作方式" : "Two ways to work together"}
          note={
            locale === "zh"
              ? "名单上的演员谁都能免费用。如果你需要更多："
              : "The roster is free for everyone. If you need more than that:"
          }
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[1, 2].map((index, position) => (
            <article key={index} className="sp-card bg-card">
              <p className="sp-code">{String(position + 1).padStart(2, "0")}</p>
              <h3 className="sp-subtitle mt-4">{msg(`casting.routes.${index}.title`)}</h3>
              <p className="mt-4 text-muted-foreground">{msg(`casting.routes.${index}.body`)}</p>
            </article>
          ))}
        </div>
        <GameButton variant="primary" href="mailto:pieai@hotmail.com" className="mt-6">
          {locale === "zh" ? "找我们合作" : "Work with us"}
        </GameButton>
      </section>
    </div>
  );
}
