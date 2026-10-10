import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n } from "@/i18n/server";
import { PageIntro } from "@/site/PageIntro";
import { TextLink } from "@/site/TextLink";

const WAYS = ["starter", "sheet", "cast"] as const;
const AFTER = ["guide.after.1", "guide.after.2", "guide.after.3"] as const;

export async function GuideView({ locale }: { locale: AppLocale }) {
  const { t } = await getSiteI18n(locale);
  return (
    <div className="sp-container">
      <PageIntro eyebrow={t("guide.helpLabel")} lines={[t("guide.title")]}>
        {t("guide.lead")}
      </PageIntro>
      <section className="sp-section">
        <div className="grid gap-6 lg:grid-cols-3">
          {WAYS.map((way) => (
            <article key={way} className="sp-card bg-card">
              <h2 className="sp-subtitle">{t(`guide.${way}.title`)}</h2>
              <p className="mt-4">{t(`guide.${way}.for`)}</p>
              <p className="mt-3">{t(`guide.${way}.has`)}</p>
              <p className="sp-small mt-3 text-muted-foreground">{t(`guide.${way}.where`)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("guide.more.title")}</h2>
        <div className="mt-6 max-w-3xl space-y-4">
          <p>{t("guide.more.single")}</p>
          <p>{t("guide.more.selected")}</p>
        </div>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("guide.after.title")}</h2>
        <ol className="mt-6 max-w-3xl list-decimal space-y-3 pl-6">
          {AFTER.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("guide.account.title")}</h2>
        <p className="mt-6 max-w-3xl">{t("guide.account.body")}</p>
      </section>
      <section className="sp-section">
        <h2 className="sp-title">{t("guide.license.title")}</h2>
        <p className="mt-6 max-w-3xl">{t("guide.license.body")}</p>
        <div className="mt-6">
          <TextLink href="/license#credit">{t("license.creditTitle")}</TextLink>
        </div>
      </section>
      <TextLink href="/actors" className="mb-24">
        {t("guide.browse")}
      </TextLink>
    </div>
  );
}
