import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SpecSheet } from "@/components/SpecSheet";
import { Mega, Display } from "@/components/Mega";
import { CopyBlock } from "@/components/CopyBlock";
import { ReferenceStrip } from "@/components/ReferenceStrip";
import { StageMount } from "@/three/StageMount";
import { Reveal } from "@/motion/Reveal";
import { ACCENT_VAR, ACTORS, getActor, STATUS_LABEL } from "@/content/actors";
import { CG_BADGE, STANCE_LINE } from "@/content/doctrine";
import { routing, type AppLocale } from "@/i18n/routing";

type Params = { params: Promise<{ slug: string; locale: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ACTORS.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, locale } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  const loc = locale as AppLocale;
  const name = loc === "zh" ? actor.nameCn : actor.nameEn;

  return {
    title: `${name} — ${actor.code}`,
    description: `${actor.tagline[loc]} · ${STANCE_LINE[loc]}`,
    openGraph: {
      title: `${name} — ${actor.code}`,
      description: actor.tagline[loc],
      images: actor.plate ? [{ url: actor.plate }] : undefined,
    },
  };
}

export default async function ActorPage({ params }: Params) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const actor = getActor(slug);
  if (!actor) notFound();

  const t = await getTranslations("actor");
  const tc = await getTranslations("common");
  const tk = await getTranslations("kit");
  const accent = ACCENT_VAR[actor.accent];
  const index = ACTORS.findIndex((a) => a.slug === actor.slug);
  const next = ACTORS[(index + 1) % ACTORS.length];
  const inDev = actor.status !== "active";
  const name = loc === "zh" ? actor.nameCn : actor.nameEn;
  const nextName = loc === "zh" ? next.nameCn : next.nameEn;

  return (
    /* One variable retints the entire dossier — the spec sheet, the rules,
     * the buttons and the next-actor link all read `--sp-accent`. */
    <div className="pt-14" style={{ ["--sp-accent" as string]: accent }}>
      {/* -------- Splash -------- */}
      <section className="relative overflow-hidden border-b border-[var(--sp-hairline)]">
        {inDev ? (
          <div className="absolute inset-0 opacity-70">
            <StageMount accent={accent} />
          </div>
        ) : null}

        <div className="relative mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-24">
          <Link
            href="/actors"
            className="sp-label sp-cjk text-[0.5625rem] transition-colors hover:text-acid"
          >
            ← {tc("backToRoster")}
          </Link>

          <p className="sp-label sp-cjk mt-10 text-[0.625rem]" style={{ color: accent }}>
            {actor.code} — {STATUS_LABEL[actor.status][loc]}
          </p>

          <Mega
            lines={[name]}
            immediate
            accentLine={-1}
            className="mt-5 text-bone"
            size="text-[clamp(2.75rem,12vw,10rem)]"
          />

          <p className="sp-cjk mt-10 max-w-2xl text-lg leading-[1.85]" style={{ color: accent }}>
            {actor.tagline[loc]}
          </p>

          <p
            className="sp-label mt-8 inline-block border px-3 py-2 text-[0.5rem]"
            style={{ borderColor: accent, color: accent }}
          >
            {CG_BADGE[loc]}
          </p>
          <p className="sp-cjk mt-3 max-w-md text-[0.6875rem] leading-relaxed text-ash">
            {t("cgNote")}
          </p>

          {inDev ? (
            <p
              className="sp-cjk mt-10 max-w-xl border-l-2 pl-5 text-xs leading-[1.95] text-smoke"
              style={{ borderColor: accent }}
            >
              {t("whiteModelNote")}
            </p>
          ) : null}
        </div>
      </section>

      {/* -------- Spec sheet -------- */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SpecSheet actor={actor} />
      </section>

      {/* -------- Character seed -------- */}
      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="mx-auto grid max-w-[var(--sp-max)] gap-10 px-[var(--sp-gutter)] py-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <p className="sp-label sp-cjk text-[0.5625rem]">{t("kitLink")}</p>
            <Display
              text={tk("seedsTitle")}
              as="h2"
              className="mt-4 text-[clamp(1.5rem,4vw,2.5rem)] text-bone"
            />
            <p className="sp-cjk mt-5 max-w-md text-sm leading-[1.9] text-smoke">
              {tk("seedsNote")}
            </p>
            <Link
              href="/kit"
              className="sp-label sp-cjk mt-8 inline-block border px-6 py-3.5 text-[0.6875rem] transition-colors hover:bg-[var(--sp-accent)] hover:text-black"
              style={{ borderColor: accent, color: accent }}
            >
              {tk("eyebrow")} →
            </Link>
          </div>

          {actor.promptSeed ? (
            <div className="space-y-6">
              <CopyBlock text={actor.promptSeed} label={`${actor.code} / CHARACTER SEED`} />
              <ReferenceStrip actor={actor} />
            </div>
          ) : (
            <div className="sp-hazard grid min-h-40 place-items-center border border-[var(--sp-hairline)]">
              <p className="sp-label sp-cjk bg-black px-4 py-2 text-[0.5625rem] text-smoke">
                {tk("seedPending")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* -------- Booking -------- */}
      <section className="border-b border-[var(--sp-hairline)]">
        <div className="mx-auto flex max-w-[var(--sp-max)] flex-wrap items-center justify-between gap-8 px-[var(--sp-gutter)] py-16">
          <div>
            <p className="sp-label sp-cjk text-[0.5625rem]">{t("availability")}</p>
            <Display
              text={actor.status === "active" ? t("open") : t("notYet")}
              as="p"
              className="mt-3 text-3xl text-bone"
            />
            <p className="sp-cjk mt-3 max-w-md text-xs leading-relaxed text-smoke">
              {actor.status === "active" ? t("openBody") : t("notYetBody")}
            </p>
          </div>
          <Link
            href="/casting"
            data-cursor="→"
            className="sp-label sp-cjk border px-8 py-4 text-[0.6875rem] transition-colors hover:bg-[var(--sp-accent)] hover:text-black"
            style={{ borderColor: accent, color: accent }}
          >
            {tc("enquire")}
          </Link>
        </div>
      </section>

      {/* -------- Next -------- */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-20">
        <Reveal>
          <Link
            href={`/actors/${next.slug}`}
            data-cursor={next.code}
            className="sp-reveal group block"
          >
            <p className="sp-label sp-cjk text-[0.5625rem]">
              {tc("next")} — {next.code}
            </p>
            <p
              className={`${loc === "zh" ? "sp-zh-mega" : "sp-ultra"} mt-4 text-[clamp(2rem,9vw,7.5rem)] text-ash transition-colors group-hover:text-bone`}
            >
              {nextName} →
            </p>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
