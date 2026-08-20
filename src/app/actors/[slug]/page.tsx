import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpecSheet } from "@/components/SpecSheet";
import { StageMount } from "@/three/StageMount";
import { ACCENT_VAR, ACTORS, getActor } from "@/content/actors";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ACTORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const actor = getActor(slug);
  if (!actor) return {};
  return {
    title: `${actor.nameCn} ${actor.nameEn} — ${actor.code}`,
    description: `${actor.taglineCn} ${actor.nameCn}（${actor.code}）的完整角色规格书、表演区间与授权状态。`,
    openGraph: {
      title: `${actor.nameEn} / ${actor.nameCn} — ${actor.code}`,
      description: actor.taglineCn,
      images: actor.plate ? [{ url: actor.plate }] : undefined,
    },
  };
}

export default async function ActorPage({ params }: Params) {
  const { slug } = await params;
  const actor = getActor(slug);
  if (!actor) notFound();

  const accent = ACCENT_VAR[actor.accent];
  const index = ACTORS.findIndex((a) => a.slug === actor.slug);
  const next = ACTORS[(index + 1) % ACTORS.length];
  const inDev = actor.status !== "active";

  return (
    <div className="pt-14">
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
            className="sp-label text-[0.5625rem] transition-colors hover:text-acid"
          >
            ← ROSTER 名册
          </Link>

          <p className="sp-label mt-10 text-[0.625rem]" style={{ color: accent }}>
            {actor.code} — {actor.status === "active" ? "CASTABLE 可出演" : "IN DEVELOPMENT 研发中"}
          </p>

          <h1 className="sp-mega mt-5 text-[clamp(2.75rem,12vw,11rem)] text-bone">
            {actor.nameEn}
          </h1>
          <p className="sp-cjk mt-3 text-2xl text-smoke">{actor.nameCn}</p>

          <p className="sp-cjk mt-10 max-w-2xl text-base leading-[1.95]" style={{ color: accent }}>
            {actor.taglineCn}
          </p>
          <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-ash">
            {actor.tagline}
          </p>

          {inDev ? (
            <p
              className="sp-cjk mt-10 max-w-xl border-l-2 pl-5 text-xs leading-[1.95] text-smoke"
              style={{ borderColor: accent }}
            >
              你现在看到的是这个演员的白膜。比例和动作范围已经定死，脸和服装还没上。
              <br />
              这不是渲染失败，这是产线上的一道真实工序。
            </p>
          ) : null}
        </div>
      </section>

      {/* -------- Spec sheet -------- */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-[var(--sp-section)]">
        <SpecSheet actor={actor} />
      </section>

      {/* -------- Booking -------- */}
      <section className="border-y border-[var(--sp-hairline)] bg-carbon">
        <div className="mx-auto flex max-w-[var(--sp-max)] flex-wrap items-center justify-between gap-8 px-[var(--sp-gutter)] py-16">
          <div>
            <p className="sp-label text-[0.5625rem]">AVAILABILITY 档期</p>
            <p className="sp-display mt-3 text-3xl text-bone">
              {actor.status === "active" ? "OPEN FOR CASTING" : "NOT YET AVAILABLE"}
            </p>
            <p className="sp-cjk mt-2 text-xs text-smoke">
              {actor.status === "active"
                ? "可洽谈授权出演、品牌合作与联合出品。"
                : "交付后开放洽谈。想提前锁定可以先联系我们。"}
            </p>
          </div>
          <Link
            href="/casting"
            className="sp-label border px-8 py-4 text-[0.6875rem] transition-colors"
            style={{ borderColor: accent, color: accent }}
          >
            ENQUIRE 洽谈
          </Link>
        </div>
      </section>

      {/* -------- Next -------- */}
      <section className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-20">
        <Link href={`/actors/${next.slug}`} className="group block">
          <p className="sp-label text-[0.5625rem]">NEXT 下一位 — {next.code}</p>
          <p className="sp-mega mt-4 text-[clamp(2rem,8vw,7rem)] text-ash transition-colors group-hover:text-bone">
            {next.nameEn} →
          </p>
        </Link>
      </section>
    </div>
  );
}
