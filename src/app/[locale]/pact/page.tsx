import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mega, Display } from "@/components/Mega";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/motion/Reveal";
import { CLAUSES, PACT_VERSION, TERMS } from "@/content/pact";
import { REFUSALS, STANCE_LINE, WHY } from "@/content/doctrine";
import { SITE } from "@/lib/site";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pact" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const t = await getTranslations("pact");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const heroLines = t.raw("heroLines") as string[];

  return (
    <div className="pt-14">
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-20 pb-16">
        <p className="sp-label sp-cjk text-[0.625rem]">{t("eyebrow")}</p>
        <Mega
          lines={heroLines}
          immediate
          className="mt-6 text-bone"
          size="text-[clamp(2.75rem,12vw,10rem)]"
        />
        <p className="sp-cjk mt-8 max-w-2xl text-base leading-[1.95] text-smoke">{t("intro")}</p>
        <p className="sp-label mt-8 inline-block border border-flare px-3 py-2 text-[0.5rem] text-flare">
          {PACT_VERSION} · {tc("draft")}
        </p>
      </section>

      {/* ================= PART ONE — the refusal ================= */}
      <section className="sp-slab" style={{ ["--sp-accent" as string]: "var(--color-acid)" }}>
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="01"
            label={t("partOneLabel")}
            title={t("partOneTitle")}
            note={t("partOneNote")}
            tone="slab"
          />

          <Reveal className="mt-16 grid gap-px border border-black/25 bg-black/25 md:grid-cols-2">
            {REFUSALS.map((r) => (
              <article key={r.id} className="sp-reveal sp-slab p-8">
                <span className="sp-display text-6xl leading-none text-black/30">{r.n}</span>
                <h3 className="sp-cjk mt-6 text-[clamp(1.2rem,3vw,1.85rem)] leading-tight font-bold text-black">
                  {r.head[loc]}
                </h3>
                <p className="sp-cjk mt-4 text-sm leading-[1.9] text-black/80">{r.body[loc]}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---- the argument, on black, set as long-form prose ---- */}
      <section className="border-b border-[var(--sp-hairline)] bg-black">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <p className="sp-label sp-cjk text-[0.625rem]">{t("whyLabel")}</p>

          <Reveal className="mt-12 max-w-3xl space-y-8">
            {WHY.map((w, i) => (
              <p
                key={w.id}
                className={`sp-reveal sp-cjk leading-[1.95] ${
                  i === 0
                    ? "text-[clamp(1.35rem,4vw,2.5rem)] leading-[1.35] font-bold text-acid"
                    : "text-base text-smoke md:text-lg"
                }`}
              >
                {w.body[loc]}
              </p>
            ))}
          </Reveal>

          <p className="sp-label mt-16 border-t border-[var(--sp-hairline)] pt-8 text-[0.625rem] text-acid">
            {STANCE_LINE[loc]}
          </p>
        </div>
      </section>

      {/* ================= PART TWO — the money ================= */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="02"
          label={t("partTwoLabel")}
          title={t("partTwoTitle")}
          note={t("partTwoNote")}
        />

        <Reveal className="mt-16 divide-y divide-[var(--sp-hairline)] border-y border-[var(--sp-hairline)]">
          {CLAUSES.map((c) => (
            <article
              key={c.id}
              className="sp-reveal grid gap-6 py-10 md:grid-cols-[6rem_minmax(0,1fr)]"
            >
              <span className="sp-ghost-num text-[4.5rem]">{c.n}</span>
              <div>
                <Display
                  text={c.head[loc]}
                  as="h3"
                  className="text-[clamp(1.25rem,3.6vw,2.25rem)] text-bone"
                />
                <p className="sp-cjk mt-5 max-w-2xl text-sm leading-[1.95] text-smoke md:text-base">
                  {c.body[loc]}
                </p>
              </div>
            </article>
          ))}
        </Reveal>
      </section>

      {/* ---- terms table: what is settled and what is not ---- */}
      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="03"
            label={t("termsLabel")}
            title={t("termsTitle")}
            note={t("draftNote")}
          />

          <dl className="mt-12 divide-y divide-[var(--sp-hairline)] border-y border-[var(--sp-hairline)]">
            {TERMS.map((term) => (
              <div
                key={term.id}
                className="grid gap-2 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_7rem] md:items-baseline md:gap-6"
              >
                <dt className="sp-label sp-cjk text-[0.625rem] text-bone">{term.label[loc]}</dt>
                <dd className="sp-cjk font-mono text-xs text-smoke">{term.value[loc]}</dd>
                <dd
                  className={`sp-label sp-cjk text-[0.5rem] md:text-right ${
                    term.settled ? "text-acid" : "text-flare"
                  }`}
                >
                  {term.settled ? t("settled") : t("openTerm")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)] text-center">
        <p className="sp-cjk mx-auto max-w-xl text-lg leading-[1.9] text-bone">{t("outro")}</p>
        <a
          href={`mailto:${SITE.contact}?subject=${encodeURIComponent("[REMIX] SWIMMER PARTY")}`}
          data-cursor="→"
          className="sp-label sp-cjk mt-10 inline-block border border-acid bg-acid px-10 py-4 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
        >
          {t("outroCta")} →
        </a>
        <p className="mt-6">
          <Link
            href="/kit"
            className="sp-label sp-cjk text-[0.5625rem] text-smoke transition-colors hover:text-acid"
          >
            ← {tn("kit")}
          </Link>
        </p>
      </section>
    </div>
  );
}
