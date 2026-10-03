import type { Metadata } from "next";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import type { AppLocale } from "@/i18n/routing";
import { ACTORS } from "@/content/actors";
import { KIT_RULES, KIT_STATUS_LABEL } from "@/content/kit";
import { getKitManifest } from "@/content/kit-assets";
import { getActorAssets } from "@/content/assets";
import { slotLabelKey } from "@/content/asset-series";
import { ActorCard } from "@/components/ActorCard";
import { ActorPicture } from "@/components/ActorPicture";
import { CopyBlock } from "@/components/CopyBlock";
import { PageIntro } from "@/components/PageIntro";
import { SectionHead } from "@/components/SectionHead";
import { TextLink } from "@/components/TextLink";
import { AssetProgress } from "@/components/AssetProgress";
import { Icon } from "@/ui/icons";

type Props = { params: Promise<{ locale: AppLocale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return { title: t("kit.metaTitle"), description: t("kit.metaDescription") };
}
export default async function KitPage({ params }: Props) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const seeded = ACTORS.filter((actor) => actor.promptSeed);
  return (
    <div className="sp-container">
      <PageIntro eyebrow={t("kit.eyebrow")} lines={[t("kit.heroLines.0"), t("kit.heroLines.1")]}>
        {t("kit.intro")}
      </PageIntro>
      <section
        className="sp-section grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
        aria-label={t("nav.roster")}
      >
        {ACTORS.map((actor) => {
          return (
            <div key={actor.slug}>
              <ActorCard actor={actor} href={`/kit/${actor.slug}`} />
              <div className="mt-2 px-2">
                <AssetProgress slug={actor.slug} />
              </div>
            </div>
          );
        })}
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("kit.seedsLabel")}
          title={t("kit.seedsTitle")}
          note={t("kit.seedsNote")}
        />
        <div className="mt-8 space-y-12 lg:mt-10">
          {seeded.map((actor) => (
            <article id={actor.code} key={actor.slug} className="scroll-mt-24">
              <h3 className="sp-subtitle mb-4">{locale === "zh" ? actor.nameCn : actor.nameEn}</h3>
              <CopyBlock label={`${actor.code} / CHARACTER SEED`} text={actor.promptSeed!} />
              <div className="mt-6">
                <p className="sp-label text-muted-foreground">
                  {t("kit.platesLabel")}
                  {getActorAssets(actor.slug).items.filter((item) => item.series === "turnaround")
                    .length > 1
                    ? ""
                    : ` — ${t("kit.platesNone")}`}
                </p>
                <div className="mt-4 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
                  {getActorAssets(actor.slug)
                    .items.filter((item) => item.series === "turnaround")
                    .map((view) => (
                      <ActorPicture
                        key={view.slot}
                        src={view.thumb}
                        alt={`${actor.code} ${t(slotLabelKey(view.series, view.key))}`}
                        legacy={view.conformance === "legacy"}
                        fullBody
                        legacyLabel={t("assets.legacy")}
                        sizes="(min-width: 640px) 170px, 28vw"
                        className="aspect-2/3 rounded-[var(--game-ui-radius-card)]"
                      />
                    ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="sp-card mt-12 bg-card">
          <p className="sp-label">{t("kit.seedPending")}</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {ACTORS.filter((actor) => !actor.promptSeed).map((actor) => (
              <li key={actor.slug} id={actor.code}>
                <TextLink href={`/actors/${actor.slug}`} className="sp-small">
                  {actor.code} {locale === "zh" ? actor.nameCn : actor.nameEn}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("kit.manifestLabel")}
          title={t("kit.manifestTitle")}
          note={t("kit.manifestNote")}
        />
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-4">
          {getKitManifest().map((item) => (
            <article
              key={item.id}
              className="sp-card flex flex-col bg-card"
              data-kit-item={item.index}
            >
              <p className="sp-code text-muted-foreground">{item.index}</p>
              <h3 className="sp-subtitle mt-4">{item.name[locale]}</h3>
              <p className="sp-small mt-2 text-muted-foreground">{item.format}</p>
              <p className="sp-small mt-4 text-muted-foreground">{item.body[locale]}</p>
              <div className="mt-auto pt-6">
                <span className="sp-pill" data-active={item.status === "live"}>
                  {KIT_STATUS_LABEL[item.status][locale]}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="sp-section">
        <SectionHead
          label={t("kit.rulesLabel")}
          title={t("kit.rulesTitle")}
          note={t("kit.rulesNote")}
        />
        <div className="mt-8 grid items-start gap-6 lg:mt-10 lg:grid-cols-2">
          {[true, false].map((allow) => (
            <div key={String(allow)} className="sp-card bg-card">
              <h3 className="sp-subtitle">{t(allow ? "kit.allowed" : "kit.forbidden")}</h3>
              <ul className="mt-6 space-y-6">
                {KIT_RULES.filter((rule) => rule.allow === allow).map((rule) => (
                  <li key={rule.id} className="flex gap-3">
                    <Icon
                      name={allow ? "check" : "close"}
                      className={`mt-1 shrink-0 ${allow ? "" : "text-danger-ink"}`}
                    />
                    <div>
                      <h4 className="font-semibold">{rule.head[locale]}</h4>
                      <p className="sp-small mt-2 text-muted-foreground">{rule.body[locale]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <TextLink href="/pact" className="mt-8">
          {t("kit.pactCta")}
        </TextLink>
      </section>
    </div>
  );
}
