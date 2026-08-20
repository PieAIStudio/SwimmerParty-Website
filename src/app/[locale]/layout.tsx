import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CursorLayer } from "@/motion/CursorLayer";
import { LOCALE_HTML_LANG, LOCALE_OG, routing, type AppLocale } from "@/i18n/routing";
import { SITE } from "@/lib/site";
import { STANCE_LINE } from "@/content/doctrine";
import "../globals.css";

/* Variable grotesk with a real width axis — the poster headlines need
 * Expanded Black, and no static webfont gives us that plus body weights. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--sp-font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--sp-font-mono",
  display: "swap",
});

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
  const t = await getTranslations({ locale, namespace: "home" });
  const loc = locale as AppLocale;

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} — ${t("metaTitle")}`,
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

/** Kept as a constant so the formatter cannot reflow it into the JSX. */
const NOSCRIPT_CSS = `
.sp-word,.sp-reveal{opacity:1!important;transform:none!important}
.sp-clip{clip-path:none!important}
`;

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={LOCALE_HTML_LANG[locale as AppLocale]}
      className={`${archivo.variable} ${jetbrains.variable}`}
      data-game-ui-theme="acid"
      suppressHydrationWarning
    >
      <head>
        {/* Fail open. Every entrance animation on this site parks its
         * subject at opacity 0 and waits for GSAP; without scripting that
         * would be a blank page with a working screen reader. This puts
         * all of it back to the finished state instead. */}
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
      </head>
      <body className="sp-grain">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sp-label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:bg-acid focus:px-4 focus:py-2 focus:text-black"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <CursorLayer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
