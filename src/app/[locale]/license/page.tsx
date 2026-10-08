import type { Metadata } from "next";
import { LICENSE, LICENSE_RULES } from "@/content/license";
import { setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import { localizedAlternates } from "@/i18n/metadata";
import { GameBadge, GameButton } from "@pieai/swimmer-ui-kit";
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
  setSiteLocale(locale);
  return (
    <div className="sp-container py-16">
      <GameBadge tone="neutral">
        {locale === "zh" ? "免费商用 · v1.0" : "Free License · v1.0"}
      </GameBadge>
      <h1 className="sp-display-xl mt-6 max-w-3xl">
        {locale === "zh" ? (
          <>
            随便用，
            <br />
            署上 Swim In AI。
          </>
        ) : (
          <>
            Use them anywhere.
            <br />
            Credit Swim In AI.
          </>
        )}
      </h1>
      <p className="sp-lead mt-6 max-w-3xl">{l(LICENSE.intro, locale)}</p>
      <section className="mt-16">
        <h2 className="sp-display-md">{locale === "zh" ? "怎么署名" : "How to credit"}</h2>
        <p className="mt-3 max-w-2xl">
          {locale === "zh"
            ? "下面任选一种都算。“Swim In AI”这几个字始终写英文，前后的话用什么语言都行。"
            : "Any one of these counts. “Swim In AI” always stays in English; the words around it can be in any language."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {LICENSE.creditLines.map((x) => (
            <div key={x} className="sp-panel p-5 font-semibold">
              {x}
            </div>
          ))}
        </div>
        <GameButton className="mt-6" variant="secondary">
          {locale === "zh" ? "复制署名" : "Copy credit line"}
        </GameButton>
      </section>
      <section className="mt-16">
        <h2 className="sp-display-md">{locale === "zh" ? "可以" : "You can"}</h2>
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
        <h2 className="sp-display-md">{locale === "zh" ? "不可以" : "You can’t"}</h2>
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
        <h2 className="sp-display-md">{locale === "zh" ? "我们的承诺" : "Our promises"}</h2>
        <div className="mt-6 space-y-4">
          {LICENSE.promises.map((x) => (
            <article key={x.en} className="sp-panel p-5">
              <h3 className="font-semibold">{l(x, locale)}</h3>
              <p className="sp-small mt-2">{locale === "zh" ? x.bodyZh : x.bodyEn}</p>
            </article>
          ))}
        </div>
      </section>
      <p className="sp-small mt-16 text-muted-foreground">
        {locale === "zh"
          ? "授权 v1.0 · 2026 年 10 月 8 日生效 · 属于《使用条款》的一部分"
          : "License v1.0 · Effective 8 October 2026 · Part of our Terms of Use"}
      </p>
    </div>
  );
}
