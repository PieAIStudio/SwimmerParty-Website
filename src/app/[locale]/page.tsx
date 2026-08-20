import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ActorCard } from "@/components/ActorCard";
import { SectionHead } from "@/components/SectionHead";
import { Mega, Display } from "@/components/Mega";
import { StageMount } from "@/three/StageMount";
import { ScrubStage } from "@/motion/ScrubStage";
import { HorizontalRail } from "@/motion/HorizontalRail";
import { StackDeck } from "@/motion/StackDeck";
import { VelocityMarquee } from "@/motion/VelocityMarquee";
import { Reveal, Counter } from "@/motion/Reveal";
import { ACTORS } from "@/content/actors";
import { KIT_MANIFEST } from "@/content/kit";
import { CLAUSES } from "@/content/pact";
import { REFUSALS } from "@/content/doctrine";
import { WORKS, WORK_STATUS_LABEL } from "@/content/works";
import { SITE } from "@/lib/site";
import type { AppLocale } from "@/i18n/routing";

type Step = { step: string; title: string; body: string };

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const castable = ACTORS.filter((a) => a.status === "active");
  const plates = ACTORS.filter((a) => a.plate).length;
  const burned = ACTORS.reduce((n, a) => n + a.version.current, 0);
  const pipeline = t.raw("pipeline") as Step[];
  const heroLines = t.raw("heroLines") as string[];
  const marquee = t.raw("marquee") as string[];
  const stanceLines = t.raw("stanceTitle") as string[];
  const castingLines = t.raw("castingTitle") as string[];
  const liveKit = KIT_MANIFEST.filter((k) => k.status === "live").length;

  return (
    <>
      {/* ======================= HERO ======================= */}
      <ScrubStage className="relative" length={2.3}>
        {/* Stage sits behind the type, biased right so the headline gets the
         * left third clean. On mobile it drops behind everything at low
         * opacity — a 3D scene fighting a headline on a 390px screen loses. */}
        <div className="absolute inset-0 opacity-40 md:left-[32%] md:opacity-100">
          <StageMount accent="#ccff00" assemble />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--color-black) 4%, color-mix(in srgb, var(--color-black) 62%, transparent) 34%, transparent 62%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between px-[var(--sp-gutter)] pt-20 pb-12 sm:pb-8">
          <div
            className="mx-auto w-full max-w-[var(--sp-max)]"
            style={{
              transform: "translate3d(calc(var(--p) * -9vw), 0, 0)",
              opacity: "calc(1 - var(--p) * 1.5)",
            }}
          >
            <p className="sp-label sp-cjk text-[0.5625rem]">{t("eyebrow")}</p>
            <Mega
              lines={heroLines}
              immediate
              className="mt-6 text-bone"
              size="text-[clamp(2.5rem,10.5vw,9.5rem)]"
            />
            <p className="sp-cjk mt-8 max-w-lg text-[0.8125rem] leading-[1.9] text-smoke">
              {t("heroBody")}
            </p>
          </div>

          {/* Readout that arrives as the figure finishes assembling. */}
          <div
            className="pointer-events-none absolute top-1/2 right-[var(--sp-gutter)] hidden w-64 -translate-y-1/2 border-l-2 border-acid pl-4 md:block"
            style={{ opacity: "calc((var(--p) - 0.34) * 3.4)" }}
            aria-hidden
          >
            <p className="sp-label text-[0.5rem] text-acid">WHITE MODEL / SP-STD-01</p>
            <dl className="mt-3 space-y-1.5 font-mono text-[0.625rem] text-smoke">
              <div className="flex justify-between gap-4">
                <dt>HEIGHT</dt>
                <dd className="text-bone">1755 MM</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>SEGMENTS</dt>
                <dd className="text-bone">24</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>SURFACE</dt>
                <dd className="text-bone">NOT APPLIED</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>RENDER</dt>
                <dd className="text-acid">STYLISED / CG</dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto flex w-full max-w-[var(--sp-max)] flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/actors"
                data-cursor={t("ctaRoster")}
                className="sp-label sp-cjk border border-acid bg-acid px-6 py-3.5 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
              >
                {t("ctaRoster")}
              </Link>
              <Link
                href="/kit"
                data-cursor="KIT"
                className="sp-label sp-cjk border border-[var(--sp-hairline)] px-6 py-3.5 text-[0.6875rem] text-bone transition-colors hover:border-bone"
              >
                {t("kitCta")}
              </Link>
            </div>

            <dl className="flex gap-6 sm:gap-8">
              <div>
                <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("statRoster")}</dt>
                <dd className="sp-display text-2xl leading-none text-bone sm:text-4xl">
                  {String(ACTORS.length).padStart(2, "0")}
                </dd>
              </div>
              <div>
                <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("statCastable")}</dt>
                <dd className="sp-display text-2xl leading-none text-acid sm:text-4xl">
                  {String(castable.length).padStart(2, "0")}
                </dd>
              </div>
              <div className="hidden sm:block">
                <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{tc("scroll")}</dt>
                <dd className="sp-display sp-blink text-4xl leading-none text-ash">↓</dd>
              </div>
            </dl>
          </div>
        </div>
      </ScrubStage>

      <div className="border-y border-[var(--sp-hairline)]">
        <VelocityMarquee items={marquee} />
      </div>

      {/* ======================= ROSTER RAIL ======================= */}
      <section className="py-[var(--sp-section)]">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)]">
          <SectionHead
            index="01"
            label={t("rosterLabel")}
            title={t("rosterTitle")}
            note={t("rosterNote")}
          />
        </div>

        <HorizontalRail className="mt-14 md:mt-0" ariaLabel={t("rosterLabel")}>
          {ACTORS.map((actor, i) => (
            <ActorCard key={actor.slug} actor={actor} index={i} width="rail" />
          ))}
          <div className="flex w-[78vw] shrink-0 items-center justify-center self-stretch border border-[var(--sp-hairline)] bg-carbon sm:w-[42vw] lg:w-[24rem]">
            <Link
              href="/actors"
              data-cursor="→"
              className="sp-label sp-cjk px-8 text-center text-[0.6875rem] text-acid"
            >
              {t("rosterMore")} →
            </Link>
          </div>
        </HorizontalRail>
      </section>

      {/* ======================= STANCE ======================= */}
      <section
        className="sp-slab relative overflow-hidden"
        style={{ ["--sp-accent" as string]: "var(--color-acid)" }}
      >
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <p className="sp-label sp-cjk text-[0.625rem]">{t("stanceLabel")}</p>
          <Mega
            as="h2"
            lines={stanceLines}
            accentLine={-1}
            className="mt-6 text-black"
            size="text-[clamp(2.25rem,10vw,9rem)]"
          />
          <Reveal className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <p className="sp-reveal sp-cjk max-w-xl text-base leading-[1.9] text-black/80">
              {t("stanceBody")}
            </p>
            <ol className="sp-reveal divide-y divide-black/20 border-y border-black/20">
              {REFUSALS.map((r) => (
                <li key={r.id} className="flex items-baseline gap-4 py-3.5">
                  <span className="sp-display shrink-0 text-lg text-black/40">{r.n}</span>
                  <span className="sp-cjk text-sm leading-snug font-semibold text-black">
                    {r.head[loc]}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Link
            href="/pact"
            data-cursor={t("stanceCta")}
            className="sp-label sp-cjk mt-12 inline-block border-2 border-black px-8 py-4 text-[0.6875rem] text-black transition-colors hover:bg-black hover:text-acid"
          >
            {t("stanceCta")} →
          </Link>
        </div>
      </section>

      {/* ======================= METHOD ======================= */}
      <section className="border-b border-[var(--sp-hairline)] bg-carbon">
        <div className="sp-blueprint mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-[var(--sp-section)]">
          <SectionHead
            index="02"
            label={t("methodLabel")}
            title={t("methodTitle")}
            note={t("methodNote")}
          />
        </div>

        <StackDeck className="mt-14" ariaLabel={t("methodLabel")}>
          {pipeline.map((p) => (
            <div
              key={p.step}
              className="flex h-full flex-col justify-center border-t border-[var(--sp-hairline)] bg-carbon px-[var(--sp-gutter)] py-16 md:py-0"
            >
              <div className="mx-auto grid w-full max-w-[var(--sp-max)] items-center gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="flex items-baseline gap-6">
                  <span className="sp-ghost-num text-[clamp(5rem,16vw,13rem)]">{p.step}</span>
                  <Display
                    text={p.title}
                    as="h3"
                    className="text-[clamp(1.5rem,4.5vw,3.25rem)] text-bone"
                  />
                </div>
                <p className="sp-cjk max-w-xl text-sm leading-[2] text-smoke md:text-base">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </StackDeck>
      </section>

      {/* ======================= OPEN KIT ======================= */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead index="03" label={t("kitLabel")} title={t("kitTitle")} note={t("kitNote")} />

        <Reveal className="mt-14 grid gap-px bg-[var(--sp-hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {KIT_MANIFEST.slice(0, 4).map((k) => (
            <div key={k.id} className="sp-reveal sp-crosshair bg-black p-6">
              <p className="sp-label text-[0.5rem] text-ash">{k.index}</p>
              <p className="sp-cjk mt-4 text-base font-semibold text-bone">{k.name[loc]}</p>
              <p className="sp-label mt-1 text-[0.5rem] text-acid">{k.format}</p>
              <p className="sp-cjk mt-4 text-xs leading-[1.9] text-smoke">{k.body[loc]}</p>
            </div>
          ))}
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--sp-hairline)] pt-8">
          <dl className="flex gap-10">
            <div>
              <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("statPlates")}</dt>
              <dd className="sp-display text-3xl leading-none text-bone">
                <Counter value={plates} />
              </dd>
            </div>
            <div>
              <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("statKitLive")}</dt>
              <dd className="sp-display text-3xl leading-none text-acid">
                <Counter value={liveKit} />
              </dd>
            </div>
            <div>
              <dt className="sp-label sp-cjk text-[0.5rem] text-ash">{t("statVersions")}</dt>
              <dd className="sp-display text-3xl leading-none text-bone">
                <Counter value={burned} />
              </dd>
            </div>
          </dl>
          <Link
            href="/kit"
            data-cursor={t("kitCta")}
            className="sp-label sp-cjk border border-acid bg-acid px-8 py-4 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
          >
            {t("kitCta")} →
          </Link>
        </div>
      </section>

      {/* ======================= PACT ======================= */}
      <section className="border-y border-[var(--sp-hairline)] bg-void">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
          <SectionHead
            index="04"
            label={t("pactLabel")}
            title={t("pactTitle")}
            note={t("pactNote")}
          />
          <Reveal className="mt-14 divide-y divide-[var(--sp-hairline)] border-y border-[var(--sp-hairline)]">
            {CLAUSES.map((c) => (
              <div
                key={c.id}
                className="sp-reveal flex flex-wrap items-baseline gap-x-8 gap-y-2 py-6"
              >
                <span className="sp-ghost-num w-16 shrink-0 text-4xl">{c.n}</span>
                <span className="sp-cjk flex-1 text-[clamp(1.1rem,3vw,1.9rem)] leading-tight text-bone">
                  {c.short[loc]}
                </span>
                <span className="sp-cjk max-w-md flex-1 text-xs leading-relaxed text-smoke">
                  {c.head[loc]}
                </span>
              </div>
            ))}
          </Reveal>
          <Link
            href="/pact"
            data-cursor={t("pactCta")}
            className="sp-label sp-cjk mt-10 inline-block border border-[var(--sp-hairline)] px-8 py-4 text-[0.6875rem] text-bone transition-colors hover:border-acid hover:text-acid"
          >
            {t("pactCta")} →
          </Link>
        </div>
      </section>

      {/* ======================= WORKS ======================= */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SectionHead
          index="05"
          label={t("worksLabel")}
          title={t("worksTitle")}
          note={t("worksNote")}
        />

        <Reveal className="mt-14 divide-y divide-[var(--sp-hairline)] border-y border-[var(--sp-hairline)]">
          {WORKS.slice(0, 2).map((w) => (
            <article
              key={w.code}
              className="sp-reveal grid gap-6 py-10 md:grid-cols-[7rem_minmax(0,1fr)]"
            >
              <div>
                <p className="sp-display text-4xl leading-none text-ash">{w.code}</p>
                <p
                  className="sp-label sp-cjk mt-3 text-[0.5rem]"
                  style={{ color: `var(--color-${w.accent})` }}
                >
                  <span className="sp-blink">▊</span> {WORK_STATUS_LABEL[w.status][loc]}
                </p>
              </div>
              <div>
                <Display
                  text={w.title[loc]}
                  as="h3"
                  className="text-[clamp(1.4rem,4vw,2.75rem)] text-bone"
                />
                <p className="sp-cjk mt-5 max-w-2xl text-sm leading-[1.95] text-smoke">
                  {w.logline[loc]}
                </p>
                <p className="sp-cjk mt-4 text-xs text-ash">{w.format[loc]}</p>
              </div>
            </article>
          ))}
        </Reveal>

        <Link
          href="/works"
          data-cursor={t("worksCta")}
          className="sp-label sp-cjk mt-10 inline-block border border-[var(--sp-hairline)] px-6 py-3.5 text-[0.6875rem] text-bone transition-colors hover:border-acid hover:text-acid"
        >
          {t("worksCta")} →
        </Link>
      </section>

      {/* ======================= CASTING ======================= */}
      <section className="border-t border-[var(--sp-hairline)] bg-void">
        <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)] text-center">
          <p className="sp-label sp-cjk text-[0.625rem]">{SITE.claim[loc]}</p>
          <Mega
            as="h2"
            lines={castingLines}
            className="mt-8 text-bone"
            size="text-[clamp(2.5rem,12vw,11rem)]"
          />
          <p className="sp-cjk mx-auto mt-8 max-w-xl text-sm leading-[1.95] text-smoke">
            {t("castingBody")}
          </p>
          <Link
            href="/casting"
            data-cursor={t("castingCta")}
            className="sp-label sp-cjk mt-12 inline-block border border-acid bg-acid px-10 py-4 text-[0.6875rem] text-black transition-colors hover:bg-transparent hover:text-acid"
          >
            {t("castingCta")} →
          </Link>
        </div>
      </section>
    </>
  );
}
