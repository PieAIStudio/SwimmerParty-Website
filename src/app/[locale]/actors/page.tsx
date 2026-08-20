import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActorCard } from "@/components/ActorCard";
import { SectionHead } from "@/components/SectionHead";
import { Mega } from "@/components/Mega";
import { StageMount } from "@/three/StageMount";
import { Reveal } from "@/motion/Reveal";
import { ACTORS } from "@/content/actors";
import { CG_BADGE } from "@/content/doctrine";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roster" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ActorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const t = await getTranslations("roster");
  const castable = ACTORS.filter((a) => a.status === "active");
  const building = ACTORS.filter((a) => a.status !== "active");
  const heroLines = t.raw("heroLines") as string[];

  return (
    <div className="pt-14">
      {/* The roster wall: one merged figure per actor, receding into fog.
       * It is the page's masthead and its census at the same time. */}
      <section className="relative h-[62svh] overflow-hidden border-b border-[var(--sp-hairline)]">
        <div className="absolute inset-0">
          <StageMount accent="#ccff00" mode="wall" count={ACTORS.length} />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--color-black) 88%, transparent) 0%, transparent 42%, var(--color-black) 99%)",
          }}
        />
        <div className="relative mx-auto flex h-full max-w-[var(--sp-max)] flex-col justify-end px-[var(--sp-gutter)] pb-10">
          <p className="sp-label sp-cjk text-[0.625rem]">{t("eyebrow")}</p>
          <Mega
            lines={heroLines}
            immediate
            className="mt-4 text-bone"
            size="text-[clamp(2.5rem,11vw,9rem)]"
          />
        </div>
      </section>

      <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-14 pb-[var(--sp-section)]">
        <p className="sp-cjk max-w-2xl text-sm leading-[1.95] text-smoke">
          {t("intro", { castable: castable.length, building: building.length })}
        </p>
        <p className="sp-label mt-4 text-[0.5rem] text-acid">{CG_BADGE[loc]}</p>

        <div className="mt-20">
          <SectionHead index="A" label={t("castableLabel")} title={t("castableTitle")} />
          <Reveal className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {castable.map((actor, i) => (
              <div key={actor.slug} className="sp-reveal">
                <ActorCard actor={actor} index={i} />
              </div>
            ))}
          </Reveal>
        </div>

        <div className="mt-24">
          <SectionHead
            index="B"
            label={t("buildingLabel")}
            title={t("buildingTitle")}
            note={t("buildingNote")}
          />
          <Reveal className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {building.map((actor, i) => (
              <div key={actor.slug} className="sp-reveal">
                <ActorCard actor={actor} index={castable.length + i} />
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
