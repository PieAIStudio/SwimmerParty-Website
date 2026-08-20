import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { TiltPlate } from "./TiltPlate";
import { ACCENT_VAR, DEFAULT_LANDMARKS, STATUS_LABEL, type Actor } from "@/content/actors";
import { CG_BADGE } from "@/content/doctrine";
import { Mannequin } from "./Mannequin";
import type { AppLocale } from "@/i18n/routing";

/**
 * The spec sheet — this site's signature device.
 *
 * A dark-mode technical drawing: the plate sits inside a measured frame
 * with hairline rules, tick caps and corner crosshairs. Every annotation is
 * SVG or real text drawn over the image, never baked into it, so it stays
 * crisp at any zoom, remains readable to screen readers and to search
 * engines, and can be corrected without regenerating a single pixel.
 *
 * The format says what the brand claims: an actor here is a manufactured
 * article with a serial number, a revision and a measured envelope.
 */

/* Station names live next to the drawing that uses them rather than in the
 * shared catalogue — they are draughting nomenclature for this one
 * component, and splitting them out would only make both files harder to
 * read. */
const STATIONS = [
  { key: "crown", en: "CROWN", zh: "顶" },
  { key: "shoulder", en: "SHOULDER", zh: "肩" },
  { key: "waist", en: "WAIST", zh: "腰" },
  { key: "knee", en: "KNEE", zh: "膝" },
  { key: "base", en: "BASE", zh: "基线" },
] as const;

export async function SpecSheet({ actor }: { actor: Actor }) {
  const t = await getTranslations("actor");
  const locale = (await getLocale()) as AppLocale;
  const accent = ACCENT_VAR[actor.accent];
  const hasPlate = Boolean(actor.plate);
  const marks = actor.landmarks ?? DEFAULT_LANDMARKS;
  // The SVG viewBox is 100x150; stations run between y=10 and y=145.
  const yOf = (pct: number) => 10 + (pct / 100) * 135;
  const ticks = STATIONS.map((s) => ({ ...s, y: yOf(marks[s.key]) }));
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;

  return (
    <section
      className="grid gap-px border border-[var(--sp-hairline)] bg-[var(--sp-hairline)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
      style={{ ["--sp-accent" as string]: accent }}
      aria-label={`${name} ${t("specification")}`}
    >
      {/* ---------------- Plate + measured frame ---------------- */}
      <div className="relative bg-void">
        <TiltPlate className="relative aspect-2/3 w-full">
          <div className="sp-scanlines relative h-full w-full overflow-hidden">
            {hasPlate ? (
              <Image
                src={actor.plate!}
                alt={`${name} — ${actor.code}`}
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-contain"
                priority
              />
            ) : (
              <div className="sp-hazard absolute inset-0">
                <Mannequin
                  className="absolute top-[4%] left-1/2 h-[76%] -translate-x-1/2"
                  accent={accent}
                />
              </div>
            )}
          </div>

          {/* Measurement overlay */}
          <svg
            className="pointer-events-none absolute inset-0 z-4 h-full w-full"
            viewBox="0 0 100 150"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* Vertical envelope line */}
            <line
              x1="9"
              y1="10"
              x2="9"
              y2="145"
              stroke={accent}
              strokeWidth="0.16"
              opacity="0.55"
            />
            <line
              x1="7.4"
              y1="10"
              x2="10.6"
              y2="10"
              stroke={accent}
              strokeWidth="0.16"
              opacity="0.55"
            />
            <line
              x1="7.4"
              y1="145"
              x2="10.6"
              y2="145"
              stroke={accent}
              strokeWidth="0.16"
              opacity="0.55"
            />

            {/* Horizontal station lines */}
            {ticks.map((s) => (
              <g key={s.key}>
                <line
                  x1="9"
                  y1={s.y}
                  x2="91"
                  y2={s.y}
                  stroke={accent}
                  strokeWidth="0.11"
                  strokeDasharray="0.9 1.6"
                  opacity="0.3"
                />
                <circle cx="9" cy={s.y} r="0.45" fill={accent} opacity="0.7" />
              </g>
            ))}

            {/* Corner crosshairs */}
            {[
              [4, 5],
              [96, 5],
              [4, 145],
              [96, 145],
            ].map(([cx, cy], i) => (
              <g key={i} stroke={accent} strokeWidth="0.14" opacity="0.6">
                <line x1={cx - 2} y1={cy} x2={cx + 2} y2={cy} />
                <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 2} />
              </g>
            ))}
          </svg>

          {/* Station labels as real text, positioned over the SVG */}
          <ul className="pointer-events-none absolute inset-0 z-5">
            {ticks.map((s) => (
              <li
                key={s.key}
                className="sp-label sp-cjk absolute right-2 -translate-y-1/2 text-[0.5rem] tracking-[0.2em]"
                style={{ top: `${(s.y / 150) * 100}%`, color: accent, opacity: 0.75 }}
              >
                {locale === "zh" ? s.zh : s.en}
              </li>
            ))}
          </ul>

          {/* The notice sits on the floor of the frame, not across the middle
           * of it: laid over the mannequin it fought the drawing and both
           * lost. A solid ground behind it keeps it legible over the hatch. */}
          {!hasPlate ? (
            <div className="absolute inset-x-0 bottom-0 z-5 border-t border-[var(--sp-hairline)] bg-[color-mix(in_srgb,var(--color-void)_88%,transparent)] px-6 py-5 backdrop-blur-sm">
              <p className="sp-label sp-cjk text-[0.625rem]" style={{ color: accent }}>
                {t("noPlate")}
              </p>
              <p className="sp-cjk mt-2 max-w-md text-xs leading-relaxed text-smoke">
                {t("noPlateBody")}
              </p>
            </div>
          ) : null}
        </TiltPlate>

        {/* Sheet footer strip */}
        <div className="flex items-center justify-between border-t border-[var(--sp-hairline)] px-4 py-2.5">
          <span className="sp-label sp-cjk text-[0.5rem]">
            SHEET {actor.code}-A / {t("sheetFront")}
          </span>
          <span className="sp-label text-[0.5rem] text-ash">UNITS: CM</span>
        </div>
      </div>

      {/* ---------------- Specification table ---------------- *
       * A column, not a block: the plate beside it is 2:3 and always taller
       * than the table, so the status strip is pushed to the floor rather
       * than leaving a dead panel under it. */}
      <div className="flex flex-col bg-carbon">
        <header className="flex items-start justify-between gap-6 border-b border-[var(--sp-hairline)] px-5 py-5">
          <div>
            <p className="sp-label sp-cjk text-[0.5625rem]">
              {actor.code} — {t("specification")}
            </p>
            <p
              className={`${locale === "zh" ? "sp-zh-display" : "sp-display"} mt-2 text-3xl leading-none text-bone`}
            >
              {name}
            </p>
            <p className="sp-label mt-2 text-[0.5rem]" style={{ color: accent }}>
              {CG_BADGE[locale]}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="sp-label sp-cjk text-[0.5rem] text-ash">{t("version")}</p>
            <p className="sp-display text-xl leading-none" style={{ color: accent }}>
              {actor.version.current} <span className="text-ash">/ {actor.version.total}</span>
            </p>
          </div>
        </header>

        <dl className="divide-y divide-[var(--sp-hairline)]">
          {actor.spec.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] gap-4 px-5 py-3"
            >
              <dt className="sp-label sp-cjk text-[0.5625rem] leading-relaxed">
                {r.label[locale]}
              </dt>
              <dd className="sp-cjk font-mono text-[0.75rem] leading-relaxed text-bone">
                {r.value[locale]}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-[var(--sp-hairline)] px-5 py-5">
          <p className="sp-label sp-cjk text-[0.5625rem]">{t("note")}</p>
          <p className="sp-cjk mt-3 text-sm leading-[1.85] text-smoke">{actor.note[locale]}</p>
        </div>

        <div className="border-t border-[var(--sp-hairline)] px-5 py-5">
          <p className="sp-label sp-cjk text-[0.5625rem]">{t("castFor")}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {actor.castFor[locale].map((c) => (
              <li
                key={c}
                className="sp-cjk border border-[var(--sp-hairline)] px-2.5 py-1 text-[0.6875rem] text-smoke"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--sp-hairline)] px-5 py-4">
          <span
            className="sp-label sp-cjk flex items-center gap-2 text-[0.5625rem]"
            style={{ color: accent }}
          >
            <span
              className={
                actor.status === "active"
                  ? "sp-blink inline-block h-1.5 w-1.5"
                  : "inline-block h-1.5 w-1.5"
              }
              style={{ background: actor.status === "active" ? accent : "var(--color-ash)" }}
              aria-hidden
            />
            {STATUS_LABEL[actor.status][locale]}
          </span>
          <span className="sp-label text-[0.5rem] text-ash">SWIMMER PARTY</span>
        </div>
      </div>
    </section>
  );
}
