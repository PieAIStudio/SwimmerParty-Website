import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mega, Display } from "@/components/Mega";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/motion/Reveal";
import { ACTORS } from "@/content/actors";
import { STANCE_LINE } from "@/content/doctrine";
import { SITE } from "@/lib/site";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };
type Route = { n: string; title: string; sub: string; body: string; good: string[] };

const ROUTE_ACCENT = ["var(--color-acid)", "var(--color-cyan)", "var(--color-magenta)"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "casting" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CastingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as AppLocale;

  const t = await getTranslations("casting");
  const heroLines = t.raw("heroLines") as string[];
  const routes = t.raw("routes") as Route[];
  const castable = ACTORS.filter((a) => a.status === "active");

  return (
    <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] pt-32 pb-[var(--sp-section)]">
      <p className="sp-label sp-cjk text-[0.625rem]">{t("eyebrow")}</p>
      <Mega
        lines={heroLines}
        immediate
        className="mt-6 text-bone"
        size="text-[clamp(2.75rem,12vw,10rem)]"
      />
      <p className="sp-cjk mt-8 max-w-2xl text-sm leading-[1.95] text-smoke">{t("intro")}</p>
      <p className="sp-label mt-6 text-[0.5625rem] text-acid">{STANCE_LINE[loc]}</p>

      <div className="mt-20">
        <SectionHead index="01" label={t("routesLabel")} title={t("routesTitle")} />

        <Reveal className="mt-12 grid gap-px bg-[var(--sp-hairline)] lg:grid-cols-3">
          {routes.map((r, i) => (
            <article
              key={r.n}
              className="sp-reveal sp-crosshair flex flex-col bg-black p-8"
              style={{ ["--sp-accent" as string]: ROUTE_ACCENT[i] }}
            >
              <span className="sp-ghost-num text-[5rem]">{r.n}</span>
              <Display
                text={r.title}
                as="h2"
                className="mt-8 text-[clamp(1.1rem,2.4vw,1.5rem)] text-bone"
              />
              <p className="sp-cjk mt-2 text-sm text-[var(--sp-accent)]">{r.sub}</p>
              <p className="sp-cjk mt-5 text-sm leading-[1.95] text-smoke">{r.body}</p>

              <p className="sp-label sp-cjk mt-8 text-[0.5rem] text-ash">{t("goodFor")}</p>
              <ul className="mt-3 space-y-1.5">
                {r.good.map((g) => (
                  <li key={g} className="sp-cjk flex gap-2 text-xs text-smoke">
                    <span className="text-[var(--sp-accent)]">—</span>
                    {g}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>
      </div>

      <div className="mt-24 border border-[var(--sp-hairline)]">
        <div className="grid gap-px bg-[var(--sp-hairline)] md:grid-cols-2">
          <div className="bg-carbon p-10">
            <p className="sp-label sp-cjk text-[0.5625rem]">{t("contact")}</p>
            <a
              href={`mailto:${SITE.contact}?subject=${encodeURIComponent("[CASTING] SWIMMER PARTY")}`}
              data-cursor="MAIL"
              className="sp-display mt-6 block text-[clamp(1.25rem,3.5vw,2.25rem)] leading-none break-all text-bone transition-colors hover:text-acid"
            >
              {SITE.contact}
            </a>
            <p className="sp-cjk mt-6 text-xs leading-[1.9] text-smoke">{t("contactBody")}</p>
            <p className="sp-cjk mt-6 border-t border-[var(--sp-hairline)] pt-5 text-xs leading-[1.9] text-ash">
              {t("remixNote")}{" "}
              <Link href="/kit" className="text-acid underline underline-offset-4">
                →
              </Link>
            </p>
          </div>

          <div className="bg-carbon p-10">
            <p className="sp-label sp-cjk text-[0.5625rem]">{t("availableNow")}</p>
            <ul className="mt-6 divide-y divide-[var(--sp-hairline)]">
              {castable.map((a) => (
                <li key={a.slug} className="flex items-baseline justify-between gap-4 py-3">
                  <Link
                    href={`/actors/${a.slug}`}
                    className="sp-cjk text-lg text-bone transition-colors hover:text-acid"
                  >
                    {loc === "zh" ? a.nameCn : a.nameEn}
                  </Link>
                  <span className="sp-label text-[0.5rem] text-acid">{a.code} · OPEN</span>
                </li>
              ))}
            </ul>
            <p className="sp-cjk mt-6 text-xs leading-[1.9] text-ash">{t("availableNote")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
