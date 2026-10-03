import { getSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { NAV, SITE } from "@/lib/site";
import { ACTORS } from "@/content/actors";
import { STANCE_LINE } from "@/content/doctrine";
import { TextLink } from "./TextLink";

export async function SiteFooter() {
  const { t } = await getSiteI18n();
  const locale = await getSiteLocale();
  return (
    <footer className="mt-24 bg-card">
      <div className="sp-container grid gap-10 py-16 lg:grid-cols-3">
        <div>
          <Link href="/" className="font-display text-xl font-bold">
            {SITE.name}
          </Link>
          <p className="sp-small mt-4 max-w-xs">{SITE.claim[locale]}</p>
          <p className="sp-small mt-6 max-w-xs text-muted-foreground">{STANCE_LINE[locale]}</p>
          <TextLink href="/pact" className="sp-small mt-4">
            {t("footer.stanceLink")}
          </TextLink>
        </div>
        <nav aria-label={t("footer.index")}>
          <ul className="flex flex-wrap gap-x-4 gap-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="sp-small font-semibold hover:underline underline-offset-4"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="sp-label mt-8 text-muted-foreground">{t("footer.roster")}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {ACTORS.map((actor) => (
              <li key={actor.slug}>
                <Link
                  href={`/actors/${actor.slug}`}
                  className="sp-small hover:underline underline-offset-4"
                >
                  <span className="sp-code text-muted-foreground">{actor.code}</span>{" "}
                  {locale === "zh" ? actor.nameCn : actor.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="sp-label text-muted-foreground">{t("footer.contact")}</p>
          <a
            href={`mailto:${SITE.contact}`}
            className="mt-4 inline-block font-semibold break-all hover:underline underline-offset-4"
          >
            {SITE.contact}
          </a>
          <p className="sp-small mt-2 text-muted-foreground">{t("footer.contactNote")}</p>
          <div className="mt-6 flex flex-wrap gap-6">
            <TextLink href="/kit">{t("nav.kit")}</TextLink>
            <TextLink href="/pact">{t("nav.pact")}</TextLink>
          </div>
          <p className="sp-small mt-8 text-muted-foreground">
            © {SITE.founded} {SITE.name}
            <br />
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
