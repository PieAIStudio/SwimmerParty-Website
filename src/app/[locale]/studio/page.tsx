import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { PageIntro } from "@/site/PageIntro";
import { SectionHead } from "@/site/SectionHead";
import { TextLink } from "@/site/TextLink";

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return { title: t("studio.metaTitle"), description: t("studio.metaDescription") };
}
export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("studio.eyebrow")}
        lines={[t("studio.heroLines.0"), t("studio.heroLines.1")]}
      >
        {t("studio.intro")}
      </PageIntro>
      <section className="sp-section">
        <SectionHead
          label={t("studio.beliefsLabel")}
          title={t("studio.beliefsTitle")}
          note={t("studio.beliefsNote")}
        />
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
          label={t("studio.stackLabel")}
          title={t("studio.stackTitle")}
          note={t("studio.stackNote")}
        />
        <dl className="mt-8 space-y-8 lg:mt-10">
          {([0, 1, 2, 3] as const).map((index) => (
            <div key={index} className="grid gap-2 lg:grid-cols-3">
              <dt className="sp-subtitle">{t(`studio.stack.${index}.name`)}</dt>
              <dd className="lg:col-span-2">
                <p className="sp-label">{t(`studio.stack.${index}.role`)}</p>
                <p className="mt-2 text-muted-foreground">{t(`studio.stack.${index}.note`)}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="sp-section">
        <h2 className="sp-display-lg">
          {t("studio.outroLines.0")} {t("studio.outroLines.1")}
        </h2>
        <p className="sp-lead mt-6 max-w-[36rem] text-muted-foreground">{t("studio.outroBody")}</p>
        <TextLink href="/casting" className="mt-6">
          {t("studio.outroCta")}
        </TextLink>
      </section>
    </div>
  );
}
