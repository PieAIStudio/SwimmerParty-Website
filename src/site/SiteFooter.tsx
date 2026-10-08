import { getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/content/site";
import { TextLink } from "./TextLink";
import { SECONDARY_NAV } from "@/content/site";
export async function SiteFooter() {
  const { t } = await getSiteI18n();
  return (
    <footer className="mt-24 bg-card">
      <div className="sp-container grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <Link href="/" className="font-display text-xl font-bold">
            {SITE.name}
          </Link>
          <p className="sp-small mt-4 max-w-xs">{t("footer.claim")}</p>
          <p className="sp-small mt-6 max-w-xs text-muted-foreground">{t("footer.stance")}</p>
        </div>
        <div className="lg:justify-self-end">
          <p className="sp-label">{t("footer.contact")}</p>
          <a
            href={`mailto:${SITE.contact}`}
            className="mt-4 inline-block font-semibold break-all hover:underline underline-offset-4"
          >
            {SITE.contact}
          </a>
          <p className="sp-small mt-2 text-muted-foreground">{t("footer.contactNote")}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            {SECONDARY_NAV.map((item) => (
              <TextLink key={item.href} href={item.href}>
                {t(`nav.${item.key}`)}
              </TextLink>
            ))}
            <TextLink href="/license">{t("nav.license")}</TextLink>
          </div>
          <p className="sp-small mt-10 text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name} · {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
