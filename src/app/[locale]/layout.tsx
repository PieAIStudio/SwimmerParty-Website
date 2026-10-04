import type { Metadata, Viewport } from "next";
import { SiteI18nProvider } from "@/i18n/client";
import { hasLocale } from "@/i18n/routing";
import { setSiteLocale, getSiteI18n } from "@/i18n/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/site/SiteHeader";
import { SiteFooter } from "@/site/SiteFooter";
import { AccountProvider } from "@/features/account";
import { Analytics } from "@vercel/analytics/next";
import { SITE_UI_STYLE, THEME_INIT_SCRIPT } from "@/site/theme";
import { LOCALE_HTML_LANG, LOCALE_OG, routing, type AppLocale } from "@/i18n/routing";
import { SITE } from "@/content/site";
import { STANCE_LINE } from "@/content/doctrine";
// oxlint-disable-next-line no-unassigned-import -- Root stylesheet initialization.
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/* Both authored locales are pre-rendered. Everything else on this site is
 * static too, which is why the roster loads instantly on a cold cache. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getSiteI18n(locale).then((i18n) => i18n.t);
  const loc = locale as AppLocale;

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} — ${t("home.metaTitle")}`,
      template: `%s — ${SITE.name}`,
    },
    description: SITE.description[loc],
    keywords:
      loc === "zh"
        ? ["AI 演员", "动画角色", "虚拟演员", "CG 角色", "角色授权", "合成演员", "SWIMMER PARTY"]
        : [
            "AI actor",
            "animated character",
            "synthetic talent",
            "CG character",
            "character licensing",
            "virtual talent",
            "SWIMMER PARTY",
          ],
    alternates: {
      canonical: `/${loc}`,
      languages: Object.fromEntries(routing.locales.map((l) => [LOCALE_HTML_LANG[l], `/${l}`])),
    },
    openGraph: {
      type: "website",
      locale: LOCALE_OG[loc],
      url: `${SITE.url}/${loc}`,
      siteName: SITE.name,
      title: `${SITE.name} — ${SITE.claim[loc]}`,
      description: `${STANCE_LINE[loc]} · ${SITE.description[loc]}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} — ${SITE.claim[loc]}`,
      description: STANCE_LINE[loc],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2326" },
  ],
  colorScheme: "light dark",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setSiteLocale(locale);

  const t = await getSiteI18n(locale).then((i18n) => i18n.t);

  return (
    <html
      lang={LOCALE_HTML_LANG[locale as AppLocale]}
      data-game-ui-theme="light"
      data-game-ui-style={SITE_UI_STYLE}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <SiteI18nProvider locale={locale}>
          <AccountProvider analytics={process.env.VERCEL_ENV === "production"}>
            <a
              href="#main"
              className="sp-label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:bg-background focus:px-4 focus:py-3 focus:text-foreground"
            >
              {t("common.skipToContent")}
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </AccountProvider>
          {process.env.VERCEL_ENV === "production" ? <Analytics /> : null}
        </SiteI18nProvider>
      </body>
    </html>
  );
}
