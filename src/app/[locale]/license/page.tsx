import type { Metadata } from "next";
import Image from "next/image";
import {
  LICENSE,
  LICENSE_FAQ,
  LICENSE_EXAMPLES,
  LICENSE_RULES,
  LICENSE_WHERE,
} from "@/content/license";
import { setSiteLocale } from "@/i18n/server";
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
      <section id="credit" className="mt-16 scroll-mt-24">
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
        <p className="sp-small mt-6 text-muted-foreground">
          {locale === "zh"
            ? "我们最喜欢第三种：写上演员名字。他因为你火了，后面的项目你优先。"
            : "Our favourite is the third: name the actor. It helps them get famous, and if they take off because of you, you get first call."}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <CopyButton
            text={LICENSE.credit[locale]}
            label={locale === "zh" ? "复制署名" : "Copy credit line"}
          />
        </div>
      </section>
      <section className="mt-16">
        <h2 className="sp-display-md">{locale === "zh" ? "放在哪" : "Where it goes"}</h2>
        <div className="mt-6 overflow-x-auto sp-panel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4">{locale === "zh" ? "你做的" : "What you made"}</th>
                <th className="p-4">{locale === "zh" ? "放在哪" : "Where"}</th>
                <th className="p-4">{locale === "zh" ? "多大" : "How big"}</th>
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
        <h2 className="sp-display-md">{locale === "zh" ? "署名标" : "Credit mark"}</h2>
        <p className="mt-3">
          {locale === "zh"
            ? "纯白和纯黑两种，透明背景，直接拖进剪辑或修图软件就能用。"
            : "Pure white or pure black, on a transparent background. Drop it into any editor."}
        </p>
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
              {locale === "zh" ? "下载纯白" : "Download white"}
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
              {locale === "zh" ? "下载纯黑" : "Download black"}
            </CreditMarkDownload>
          </article>
        </div>
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
        <h2 className="sp-display-md">{locale === "zh" ? "常见问题" : "Questions people ask"}</h2>
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
        <h2 className="sp-display-md">{locale === "zh" ? "我们的承诺" : "Our promises"}</h2>
        <p className="mt-3">
          {locale === "zh"
            ? "规矩是双向的。这是我们对你的承诺。"
            : "Rules go both ways. Here’s what we promise you."}
        </p>
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
