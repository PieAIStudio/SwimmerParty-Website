import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mega, Display } from "@/components/Mega";
import { SectionHead } from "@/components/SectionHead";
import { CopyBlock } from "@/components/CopyBlock";
import { ReferenceStrip } from "@/components/ReferenceStrip";
import { Reveal } from "@/motion/Reveal";
import { VelocityMarquee } from "@/motion/VelocityMarquee";
import { ACTORS } from "@/content/actors";
import { KIT_MANIFEST, KIT_RULES, KIT_STATUS_LABEL } from "@/content/kit";
import { CG_BADGE } from "@/content/doctrine";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kit" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function KitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const t = await getTranslations("kit");
  const ta = await getTranslations("actor");
  const seeded = ACTORS.filter((a) => a.promptSeed);
  const pending = ACTORS.filter((a) => !a.promptSeed);
  const heroLines = t.raw("heroLines") as string[];

  return (
    <div className="pt-14">
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-20">
        <p className="sp-label sp-cjk text-[0.625rem]">{t("eyebrow")}</p>
        <Mega
          lines={heroLines}
          immediate
          className="mt-6 text-bone"
          size="text-[clamp(3rem,13vw,11rem)]"
        />
        <p className="sp-cjk mt-8 max-w-2xl text-base leading-[1.95] text-smoke">{t("intro")}</p>
      </section>

      <div className="mt-16 border-y border-[var(--sp-hairline)]">
        <VelocityMarquee
          items={[t("eyebrow"), CG_BADGE[loc], t("rulesTitle"), t("seedsTitle")]}
          tone="cyan"
          speed={70}
        />
      </div>

      {/* ---------------- Seeds: the part that actually works today ------- */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="01"
          label={t("seedsLabel")}
          title={t("seedsTitle")}
          note={t("seedsNote")}
        />

        <div className="mt-14 space-y-px">
          {seeded.map((a) => (
            <div
              key={a.slug}
              className="grid gap-6 border border-[var(--sp-hairline)] bg-carbon p-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:p-8"
              style={{ ["--sp-accent" as string]: `var(--color-${a.accent})` }}
            >
              <div>
                <p
                  className="sp-label text-[0.5625rem]"
                  style={{ color: `var(--color-${a.accent})` }}
                >
                  {a.code}
                </p>
                <Display
                  text={loc === "zh" ? a.nameCn : a.nameEn}
                  as="h3"
                  className="mt-3 text-3xl text-bone"
                />
                <p className="sp-cjk mt-4 max-w-sm text-xs leading-[1.9] text-smoke">
                  {a.tagline[loc]}
                </p>
                <Link
                  href={`/actors/${a.slug}`}
                  className="sp-label sp-cjk mt-6 inline-block border border-[var(--sp-hairline)] px-5 py-3 text-[0.5625rem] text-bone transition-colors hover:border-[var(--sp-accent)] hover:text-[var(--sp-accent)]"
                >
                  {a.code} →
                </Link>
              </div>
              <div className="space-y-6">
                <CopyBlock text={a.promptSeed!} label={`${a.code} / CHARACTER SEED`} />
                <ReferenceStrip actor={a} />
              </div>
            </div>
          ))}

          <div className="border border-[var(--sp-hairline)] p-6 lg:p-8">
            <p className="sp-label sp-cjk text-[0.5625rem] text-ash">{t("seedPending")}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {pending.map((a) => (
                <li
                  key={a.slug}
                  className="sp-cjk sp-hazard border border-[var(--sp-hairline)] px-3 py-1.5 text-[0.6875rem] text-smoke"
                >
                  <span className="text-ash">{a.code}</span> {loc === "zh" ? a.nameCn : a.nameEn}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- Manifest ---------------- */}
      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="sp-blueprint mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="02"
            label={t("manifestLabel")}
            title={t("manifestTitle")}
            note={t("manifestNote")}
          />

          <Reveal className="mt-14 grid gap-px bg-[var(--sp-hairline)] sm:grid-cols-2 lg:grid-cols-4">
            {KIT_MANIFEST.map((k) => (
              <article key={k.id} className="sp-reveal sp-crosshair flex flex-col bg-carbon p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="sp-label text-[0.5rem] text-ash">{k.index}</span>
                  <span
                    className={`sp-label sp-cjk text-[0.5rem] ${
                      k.status === "live"
                        ? "text-acid"
                        : k.status === "preparing"
                          ? "text-cyan"
                          : "text-smoke"
                    }`}
                  >
                    {k.status === "live" ? <span className="sp-blink">▊ </span> : null}
                    {KIT_STATUS_LABEL[k.status][loc]}
                  </span>
                </div>
                <h3 className="sp-cjk mt-5 text-base leading-tight font-semibold text-bone">
                  {k.name[loc]}
                </h3>
                <p className="sp-label mt-1.5 text-[0.5rem] text-smoke">{k.format}</p>
                <p className="sp-cjk mt-4 text-xs leading-[1.9] text-smoke">{k.body[loc]}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- Rules ---------------- */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="03"
          label={t("rulesLabel")}
          title={t("rulesTitle")}
          note={t("rulesNote")}
        />

        <Reveal className="mt-14 grid gap-px bg-[var(--sp-hairline)] md:grid-cols-2">
          {KIT_RULES.map((r, i) => (
            <article
              key={r.id}
              /* An odd count in a two-up grid leaves a hole; the last rule
               * takes the whole row instead, which also happens to be the
               * one about money. */
              className={`sp-reveal p-8 ${r.allow ? "bg-black" : "sp-slab"} ${
                i === KIT_RULES.length - 1 && KIT_RULES.length % 2 === 1 ? "md:col-span-2" : ""
              }`}
              style={r.allow ? undefined : { ["--sp-accent" as string]: "var(--color-magenta)" }}
            >
              <p
                className={`sp-label sp-cjk text-[0.5625rem] ${
                  r.allow ? "text-acid" : "text-black/60"
                }`}
              >
                {r.allow ? t("allowed") : t("forbidden")}
              </p>
              <h3
                className={`sp-cjk mt-5 text-[clamp(1.15rem,3vw,1.75rem)] leading-tight font-bold ${
                  r.allow ? "text-bone" : "text-black"
                }`}
              >
                {r.head[loc]}
              </h3>
              <p
                className={`sp-cjk mt-4 max-w-md text-sm leading-[1.9] ${
                  r.allow ? "text-smoke" : "text-black/80"
                }`}
              >
                {r.body[loc]}
              </p>
            </article>
          ))}
        </Reveal>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--sp-hairline)] pt-10">
          <p className="sp-cjk max-w-lg text-sm leading-[1.9] text-smoke">{t("manifestNote")}</p>
          <Link
            href="/pact"
            data-cursor="→"
            className="sp-label sp-cjk border border-acid bg-acid px-8 py-4 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
          >
            {t("pactCta")} →
          </Link>
        </div>
      </section>
    </div>
  );
}
