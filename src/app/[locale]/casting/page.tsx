import { Suspense } from "react";
import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { SITE } from "@/lib/site";
import { PageIntro } from "@/features/site/PageIntro";
import { SectionHead } from "@/features/site/SectionHead";
import { TextLink } from "@/features/site/TextLink";
import { CopyButton } from "@/features/site/CopyButton";
import { CastingContext } from "@/components/CastingContext";

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return { title: t("casting.metaTitle"), description: t("casting.metaDescription") };
}
export default async function CastingPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return (
    <div className="sp-container">
      <PageIntro
        eyebrow={t("casting.eyebrow")}
        lines={[t("casting.heroLines.0"), t("casting.heroLines.1")]}
      >
        {t("casting.intro")}
      </PageIntro>
      <section className="sp-section">
        <SectionHead label={t("casting.routesLabel")} title={t("casting.routesTitle")} />
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-3">
          {([0, 1, 2] as const).map((index) => (
            <article key={index} className="sp-card bg-card">
              <p className="sp-code text-muted-foreground">{t(`casting.routes.${index}.n`)}</p>
              <h3 className="sp-subtitle mt-4">{t(`casting.routes.${index}.title`)}</h3>
              <p className="sp-small mt-2 text-muted-foreground">
                {t(`casting.routes.${index}.sub`)}
              </p>
              <p className="mt-6">{t(`casting.routes.${index}.body`)}</p>
              <p className="sp-label mt-6 text-muted-foreground">{t("casting.goodFor")}</p>
              <ul className="mt-3 space-y-2">
                {([0, 1, 2] as const).map((item) => (
                  <li className="sp-small" key={item}>
                    {t(`casting.routes.${index}.good.${item}`)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead title={t("casting.contact")} note={t("casting.contactBody")} />
        <div className="mt-8 lg:mt-10">
          <Suspense>
            <CastingContext />
          </Suspense>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${SITE.contact}?subject=${encodeURIComponent("[CASTING] SWIMMER PARTY")}`}
              className="font-semibold break-all hover:underline underline-offset-4"
            >
              {SITE.contact}
            </a>
            <CopyButton text={SITE.contact} label={t("casting.copyEmail")} />
          </div>
        </div>
        <h3 className="sp-subtitle mt-12">{t("casting.availableNow")}</h3>
        <div className="mt-4 flex flex-wrap gap-6">
          {ACTORS.filter((actor) => actor.status === "active").map((actor) => (
            <TextLink href={`/actors/${actor.slug}`} key={actor.slug}>
              {locale === "zh" ? actor.nameCn : actor.nameEn}
            </TextLink>
          ))}
        </div>
        <p className="sp-small mt-4 text-muted-foreground">{t("casting.availableNote")}</p>
        <p className="sp-small mt-12 text-muted-foreground">{t("casting.remixNote")}</p>
        <TextLink href="/kit" className="mt-4">
          {t("nav.kit")}
        </TextLink>
      </section>
    </div>
  );
}
