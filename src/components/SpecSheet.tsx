import Image from "next/image";
import { ACCENT_VAR, DEFAULT_LANDMARKS, STATUS_LABEL, type Actor } from "@/content/actors";

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

const STATIONS = [
  { key: "crown", label: "CROWN", labelCn: "顶" },
  { key: "shoulder", label: "SHOULDER", labelCn: "肩" },
  { key: "waist", label: "WAIST", labelCn: "腰" },
  { key: "knee", label: "KNEE", labelCn: "膝" },
  { key: "base", label: "BASE", labelCn: "基线" },
] as const;

export function SpecSheet({ actor }: { actor: Actor }) {
  const accent = ACCENT_VAR[actor.accent];
  const status = STATUS_LABEL[actor.status];
  const hasPlate = Boolean(actor.plate);
  const marks = actor.landmarks ?? DEFAULT_LANDMARKS;
  // The SVG viewBox is 100x150; stations run between y=10 and y=145.
  const yOf = (pct: number) => 10 + (pct / 100) * 135;
  const ticks = STATIONS.map((s) => ({ ...s, y: yOf(marks[s.key]) }));

  return (
    <section
      className="grid gap-px border border-[var(--sp-hairline)] bg-[var(--sp-hairline)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
      style={{ ["--sheet-accent" as string]: accent }}
      aria-label={`${actor.nameCn} 角色规格书`}
    >
      {/* ---------------- Plate + measured frame ---------------- */}
      <div className="relative bg-void">
        <div className="relative aspect-2/3 w-full">
          {hasPlate ? (
            <Image
              src={actor.plate!}
              alt={`${actor.nameCn} ${actor.nameEn} 全身定妆板`}
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-contain"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent 0 13px, color-mix(in srgb, var(--color-ash) 55%, transparent) 13px 14px)",
              }}
            />
          )}

          {/* Measurement overlay */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
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
            {ticks.map((t) => (
              <g key={t.label}>
                <line
                  x1="9"
                  y1={t.y}
                  x2="91"
                  y2={t.y}
                  stroke={accent}
                  strokeWidth="0.11"
                  strokeDasharray="0.9 1.6"
                  opacity="0.3"
                />
                <circle cx="9" cy={t.y} r="0.45" fill={accent} opacity="0.7" />
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
          <ul className="pointer-events-none absolute inset-0">
            {ticks.map((t) => (
              <li
                key={t.label}
                className="sp-label absolute right-2 -translate-y-1/2 text-[0.5rem] tracking-[0.2em]"
                style={{ top: `${(t.y / 150) * 100}%`, color: accent, opacity: 0.75 }}
              >
                {t.label} <span className="sp-cjk">{t.labelCn}</span>
              </li>
            ))}
          </ul>

          {!hasPlate ? (
            <div className="absolute inset-0 grid place-items-center px-8 text-center">
              <div>
                <p className="sp-label text-[0.625rem] text-smoke">NO PLATE DELIVERED</p>
                <p className="sp-cjk mt-3 text-xs leading-relaxed text-ash">
                  这个演员还在白膜阶段。
                  <br />
                  定妆板、表情组和造型交付后此处自动替换。
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sheet footer strip */}
        <div className="flex items-center justify-between border-t border-[var(--sp-hairline)] px-4 py-2.5">
          <span className="sp-label text-[0.5rem]">SHEET {actor.code}-A / FRONT 正视</span>
          <span className="sp-label text-[0.5rem] text-ash">UNITS: CM</span>
        </div>
      </div>

      {/* ---------------- Specification table ---------------- */}
      <div className="bg-carbon">
        <header className="flex items-start justify-between gap-6 border-b border-[var(--sp-hairline)] px-5 py-5">
          <div>
            <p className="sp-label text-[0.5625rem]">{actor.code} — SPECIFICATION 规格书</p>
            <p className="sp-display mt-2 text-3xl leading-none text-bone">{actor.nameEn}</p>
            <p className="sp-cjk mt-1.5 text-sm text-smoke">{actor.nameCn}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="sp-label text-[0.5rem] text-ash">VERSION</p>
            <p className="sp-display text-xl leading-none" style={{ color: accent }}>
              {actor.version.current} <span className="text-ash">/ {actor.version.total}</span>
            </p>
          </div>
        </header>

        <dl className="divide-y divide-[var(--sp-hairline)]">
          {actor.spec.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] gap-4 px-5 py-3"
            >
              <dt className="sp-label text-[0.5625rem] leading-relaxed">
                {row.key}
                <span className="sp-cjk mt-0.5 block text-[0.625rem] tracking-normal text-ash">
                  {row.keyCn}
                </span>
              </dt>
              <dd className="font-mono text-[0.75rem] leading-relaxed text-bone">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-[var(--sp-hairline)] px-5 py-5">
          <p className="sp-label text-[0.5625rem]">NOTE 角色笔记</p>
          <p className="sp-cjk mt-3 text-sm leading-[1.85] text-smoke">{actor.note}</p>
        </div>

        <div className="border-t border-[var(--sp-hairline)] px-5 py-5">
          <p className="sp-label text-[0.5625rem]">CAST FOR 可出演</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {actor.castFor.map((c) => (
              <li
                key={c}
                className="sp-cjk border border-[var(--sp-hairline)] px-2.5 py-1 text-[0.6875rem] text-smoke"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex items-center justify-between border-t px-5 py-4"
          style={{ borderColor: "var(--sp-hairline)" }}
        >
          <span
            className="sp-label flex items-center gap-2 text-[0.5625rem]"
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
            {status.en}
            <span className="sp-cjk text-ash">{status.cn}</span>
          </span>
          <span className="sp-label text-[0.5rem] text-ash">SWIMMER PARTY · SYNTHETIC TALENT</span>
        </div>
      </div>
    </section>
  );
}
