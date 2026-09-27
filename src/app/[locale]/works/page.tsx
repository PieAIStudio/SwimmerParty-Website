import type { Metadata } from "next";
import { setSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { Mega, Display } from "@/components/Mega";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/motion/Reveal";
import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { ACTORS } from "@/content/actors";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getSiteI18n(locale).then((i18n) => i18n.t);
  return { title: t("works.metaTitle"), description: t("works.metaDescription") };
}

export default async function WorksPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  const loc = locale as AppLocale;

  const t = await getSiteI18n().then((i18n) => i18n.t);
  const heroLines = [t("works.heroLines.0"), t("works.heroLines.1")];
  const nameOf = (code: string) => {
    const a = ACTORS.find((x) => x.code === code);
    if (!a) return code;
    return `${code} ${loc === "zh" ? a.nameCn : a.nameEn}`;
  };

  return (
    <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-32 pb-[var(--sp-section)]">
      <p className="sp-label sp-cjk text-[0.625rem]">{t("works.eyebrow")}</p>
      <Mega
        lines={heroLines}
        immediate
        className="mt-6 text-bone"
        size="text-[clamp(2.75rem,12vw,10rem)]"
      />
      <p className="sp-cjk mt-8 max-w-2xl text-sm leading-[1.95] text-smoke">
        {t("works.intro", { year: 2026 })}
      </p>

      <div className="mt-20">
        <SectionHead index="01" label={t("works.slateLabel")} title={t("works.slateTitle")} />

        <Reveal className="mt-12 divide-y divide-[var(--sp-hairline)] border-y border-[var(--sp-hairline)]">
          {WORKS.map((w) => (
            <article
              key={w.code}
              className="sp-reveal group grid gap-6 py-10 md:grid-cols-[7rem_minmax(0,1fr)_14rem]"
              style={{ ["--sp-accent" as string]: `var(--color-${w.accent})` }}
            >
              <div>
                <p className="sp-ghost-num text-5xl">{w.code}</p>
                <p className="sp-label sp-cjk mt-3 text-[0.5rem] text-[var(--sp-accent)]">
                  <span className="sp-blink">▊</span> {WORK_STATUS_LABEL[w.status][loc]}
                </p>
              </div>

              <div>
                <Display
                  text={w.title[loc]}
                  as="h2"
                  className="text-[clamp(1.5rem,4vw,2.75rem)] text-bone transition-colors group-hover:text-[var(--sp-accent)]"
                />
                <p className="sp-cjk mt-6 max-w-2xl text-sm leading-[1.95] text-smoke">
                  {w.logline[loc]}
                </p>
              </div>

              <dl className="space-y-4 md:text-right">
                <div>
                  <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("works.format")}</dt>
                  <dd className="sp-cjk mt-1 text-xs text-smoke">{w.format[loc]}</dd>
                </div>
                <div>
                  <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("works.cast")}</dt>
                  <dd className="sp-cjk mt-1 space-y-0.5 text-xs text-smoke">
                    {w.cast.map((c) => (
                      <span key={c} className="block">
                        {nameOf(c)}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </Reveal>
      </div>

      <div className="mt-20 border border-[var(--sp-hairline)] p-10 text-center">
        <p className="sp-cjk text-sm leading-[1.95] text-smoke">{t("works.outro")}</p>
        <Link
          href="/casting"
          data-cursor="→"
          className="sp-label sp-cjk mt-8 inline-block border border-acid px-8 py-4 text-[0.6875rem] text-acid transition-colors hover:bg-acid hover:text-black"
        >
          {t("works.outroCta")} →
        </Link>
      </div>
    </div>
  );
}
