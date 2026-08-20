import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mega, Display } from "@/components/Mega";
import { SectionHead } from "@/components/SectionHead";
import { StageMount } from "@/three/StageMount";
import { Reveal } from "@/motion/Reveal";
import { STANCE_LINE } from "@/content/doctrine";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };
type Belief = { n: string; title: string; body: string };
type Stack = { name: string; role: string; note: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const t = await getTranslations("studio");
  const heroLines = t.raw("heroLines") as string[];
  const outroLines = t.raw("outroLines") as string[];
  const beliefs = t.raw("beliefs") as Belief[];
  const stack = t.raw("stack") as Stack[];

  return (
    <div className="pt-14" style={{ ["--sp-accent" as string]: "var(--color-cyan)" }}>
      <section className="relative overflow-hidden border-b border-[var(--sp-hairline)]">
        <div className="absolute inset-0 opacity-40 md:left-1/2 md:opacity-90">
          <StageMount accent="#00e5ff" />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--color-black) 6%, color-mix(in srgb, var(--color-black) 55%, transparent) 44%, transparent 68%)",
          }}
        />
        <div className="relative mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-28">
          <p className="sp-label sp-cjk text-[0.625rem]">{t("eyebrow")}</p>
          <Mega
            lines={heroLines}
            immediate
            className="mt-6 text-bone"
            size="text-[clamp(2.5rem,10vw,8rem)]"
          />
          <p className="sp-cjk mt-8 max-w-lg text-sm leading-[1.95] text-smoke">{t("intro")}</p>
          <p className="sp-label mt-8 text-[0.5625rem] text-cyan">{STANCE_LINE[loc]}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="01"
          label={t("beliefsLabel")}
          title={t("beliefsTitle")}
          note={t("beliefsNote")}
        />

        <Reveal className="mt-14 grid gap-px bg-[var(--sp-hairline)] md:grid-cols-2">
          {beliefs.map((b) => (
            <article key={b.n} className="sp-reveal sp-crosshair bg-black p-8 md:p-10">
              <span className="sp-ghost-num text-[5rem]">{b.n}</span>
              <Display
                text={b.title}
                as="h3"
                className="mt-8 text-[clamp(1.15rem,2.6vw,1.6rem)] text-bone"
              />
              <p className="sp-cjk mt-5 text-sm leading-[1.95] text-smoke">{b.body}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="02"
            label={t("stackLabel")}
            title={t("stackTitle")}
            note={t("stackNote")}
          />
          <Reveal className="mt-14 grid gap-px bg-[var(--sp-hairline)] sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((s) => (
              <article key={s.name} className="sp-reveal bg-carbon p-6">
                <p className="sp-display text-sm text-bone">{s.name}</p>
                <p className="sp-cjk mt-1 text-xs text-cyan">{s.role}</p>
                <p className="sp-cjk mt-4 text-xs leading-relaxed text-smoke">{s.note}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)] text-center">
        <Mega
          as="h2"
          lines={outroLines}
          className="text-bone"
          size="text-[clamp(2rem,9vw,7.5rem)]"
        />
        <p className="sp-cjk mx-auto mt-8 max-w-xl text-sm leading-[1.95] text-smoke">
          {t("outroBody")}
        </p>
        <Link
          href="/casting"
          data-cursor="→"
          className="sp-label sp-cjk mt-12 inline-block border border-cyan px-10 py-4 text-[0.6875rem] text-cyan transition-colors hover:bg-cyan hover:text-black"
        >
          {t("outroCta")} →
        </Link>
      </section>
    </div>
  );
}
