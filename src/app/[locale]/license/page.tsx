import type { Metadata } from "next";
import Image from "next/image";
import {
  LICENSE,
  LICENSE_FAQ,
  LICENSE_EXAMPLES,
  LICENSE_RULES,
  LICENSE_WHERE,
} from "@/content/license";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import { localizedAlternates } from "@/i18n/metadata";
import { GameBadge } from "@pieai/swimmer-ui-kit";
import { CopyButton } from "@/site/CopyButton";
import { CreditMarkDownload } from "@/features/assets";
const l = (x: { en: string; zh: string }, locale: AppLocale) => x[locale];
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: l(LICENSE.title, locale),
    description: l(LICENSE.description, locale),
    alternates: localizedAlternates(locale, "/license"),
  };
}
export default async function LicensePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const { t } = await getSiteI18n(locale);
  setSiteLocale(locale);
  return (
    <div className="sp-container py-16">
      <GameBadge tone="neutral">{t("license.badge")}</GameBadge>
      <h1 className="sp-display-xl mt-6 max-w-3xl">
        <>
          {t("license.heroLines.0")}
          <br />
          {t("license.heroLines.1")}
        </>
      </h1>
      <p className="sp-lead mt-6 max-w-3xl">{l(LICENSE.intro, locale)}</p>
      <section id="credit" className="mt-16 scroll-mt-24">
        <h2 className="sp-title">{t("license.creditTitle")}</h2>
        <p className="mt-3 max-w-2xl">{t("license.creditNote")}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {LICENSE.creditLines.map((x) => (
            <div key={x} className="sp-panel p-5 font-semibold">
              {x}
            </div>
          ))}
        </div>
        <p className="sp-small mt-6 text-muted-foreground">{t("license.creditFavourite")}</p>
        <div className="mt-6 flex items-center gap-4">
          <CopyButton primary text={LICENSE.credit[locale]} label={t("license.copyCredit")} />
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-title">{t("license.whereTitle")}</h2>
        <div className="mt-6 overflow-x-auto sp-panel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4">{t("license.whereMade")}</th>
                <th className="p-4">{t("license.wherePlacement")}</th>
                <th className="p-4">{t("license.whereSize")}</th>
              </tr>
            </thead>
            <tbody>
              {LICENSE_WHERE.map((item) => (
                <tr key={item.en} className="border-b border-border last:border-0">
                  <td className="p-4 align-top font-semibold">{l(item, locale)}</td>
                  <td className="p-4 align-top">{locale === "zh" ? item.whereZh : item.whereEn}</td>
                  <td className="p-4 align-top">{locale === "zh" ? item.sizeZh : item.sizeEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {LICENSE_EXAMPLES.map((item) => (
            <figure key={item.en} className="sp-panel overflow-hidden">
              <Image
                src={`${item.image}.${locale}.webp`}
                alt=""
                width={960}
                height={540}
                className="aspect-video w-full object-cover"
              />
              <figcaption className="p-4 sp-small">
                {locale === "zh" ? item.zh : item.en}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-title">{t("license.markTitle")}</h2>
        <p className="mt-3">{t("license.markNote")}</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="sp-panel p-4">
            <div className="flex aspect-[3/1] items-center justify-center rounded-[var(--game-ui-radius-card)] bg-[#1f2326] p-5">
              <Image
                src="/downloads/swim-in-ai-white.png"
                alt="Swim In AI"
                width={2000}
                height={500}
                className="h-auto w-full"
              />
            </div>
            <CreditMarkDownload endpoint="/api/assets/public/swim-in-ai-white/download">
              {t("license.downloadWhite")}
            </CreditMarkDownload>
          </article>
          <article className="sp-panel p-4">
            <div className="flex aspect-[3/1] items-center justify-center rounded-[var(--game-ui-radius-card)] bg-[#fffdf8] p-5">
              <Image
                src="/downloads/swim-in-ai-black.png"
                alt="Swim In AI"
                width={2000}
                height={500}
                className="h-auto w-full"
              />
            </div>
            <CreditMarkDownload endpoint="/api/assets/public/swim-in-ai-black/download">
              {t("license.downloadBlack")}
            </CreditMarkDownload>
          </article>
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-title">{t("license.canTitle")}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {LICENSE_RULES.can.map(([enTitle, enBody, zhTitle, zhBody]) => (
            <article key={enTitle} className="sp-panel p-5">
              <h3 className="font-semibold">{locale === "zh" ? zhTitle : enTitle}</h3>
              <p className="sp-small mt-2">{locale === "zh" ? zhBody : enBody}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-title">{t("license.cannotTitle")}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {LICENSE_RULES.cannot.map(([enTitle, enBody, zhTitle, zhBody]) => (
            <article key={enTitle} className="sp-panel p-5">
              <h3 className="font-semibold">{locale === "zh" ? zhTitle : enTitle}</h3>
              <p className="sp-small mt-2">{locale === "zh" ? zhBody : enBody}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-title">{t("license.faqTitle")}</h2>
        <div className="mt-6 grid gap-3">
          {LICENSE_FAQ.map(([enQ, enA, zhQ, zhA]) => (
            <details key={enQ} className="sp-panel p-4">
              <summary className="font-semibold">{locale === "zh" ? zhQ : enQ}</summary>
              <p className="sp-small mt-3">{locale === "zh" ? zhA : enA}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-title">{t("license.promisesTitle")}</h2>
        <div className="mt-6 space-y-4">
          {LICENSE.promises.map((x) => (
            <article key={x.en} className="sp-panel p-5">
              <h3 className="font-semibold">{l(x, locale)}</h3>
              <p className="sp-small mt-2">{locale === "zh" ? x.bodyZh : x.bodyEn}</p>
            </article>
          ))}
        </div>
      </section>
      <p className="sp-small mt-16 text-muted-foreground">{t("license.effectiveNote")}</p>
    </div>
  );
}
