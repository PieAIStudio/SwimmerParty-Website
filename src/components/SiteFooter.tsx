import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NAV, SECONDARY_NAV, SITE } from "@/lib/site";
import { ACTORS } from "@/content/actors";
import { STANCE_LINE } from "@/content/doctrine";
import type { AppLocale } from "@/i18n/routing";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const locale = (await getLocale()) as AppLocale;
  const castable = ACTORS.filter((a) => a.status === "active").length;

  return (
    <footer className="border-t border-[var(--sp-hairline)] bg-void">
      {/* The stance rides above the wordmark, in the accent, on every page.
       * It is the last thing a visitor reads before they leave. */}
      <div className="border-b border-[var(--sp-hairline)]">
        <div className="mx-auto flex max-w-[var(--sp-max)] flex-wrap items-center justify-between gap-4 px-[var(--sp-gutter)] py-5">
          <p className="sp-label text-[0.625rem] text-acid">{STANCE_LINE[locale]}</p>
          <Link
            href="/pact"
            className="sp-label text-[0.5625rem] text-smoke underline-offset-4 transition-colors hover:text-acid hover:underline"
          >
            {t("stanceLink")} →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--sp-max)] px-[var(--sp-gutter)] py-16">
        <p className="sp-ultra text-[clamp(2.5rem,13vw,11rem)] text-ash select-none">{SITE.name}</p>

        <div className="mt-12 grid gap-10 border-t border-[var(--sp-hairline)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="sp-label">{t("roster")}</p>
            <ul className="mt-4 space-y-2">
              {ACTORS.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/actors/${a.slug}`}
                    className="text-xs text-smoke transition-colors hover:text-acid"
                  >
                    <span className="text-ash">{a.code}</span>{" "}
                    <span className="sp-cjk">{locale === "zh" ? a.nameCn : a.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sp-label">{t("index")}</p>
            <ul className="mt-4 space-y-2">
              {[...NAV, ...SECONDARY_NAV].map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="sp-cjk text-xs text-smoke transition-colors hover:text-acid"
                  >
                    {tn(n.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sp-label">{t("contact")}</p>
            <a
              href={`mailto:${SITE.contact}`}
              className="mt-4 block text-xs text-smoke transition-colors hover:text-acid"
            >
              {SITE.contact}
            </a>
            <p className="sp-cjk mt-2 text-xs text-ash">{t("contactNote")}</p>
          </div>

          <div>
            <p className="sp-label">{t("status")}</p>
            <p className="sp-cjk mt-4 flex items-center gap-2 text-xs text-smoke">
              <span className="sp-blink inline-block h-1.5 w-1.5 bg-acid" aria-hidden />
              {t("statusLine", { castable, building: ACTORS.length - castable })}
            </p>
            <p className="sp-cjk mt-2 text-xs text-ash">{t("statusNote")}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--sp-hairline)] pt-6">
          <p className="sp-label text-[0.55rem]">
            © {SITE.founded} {SITE.name} — <span className="sp-cjk">{t("rights")}</span>
          </p>
          <p className="sp-label sp-cjk text-[0.55rem] text-ash">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
