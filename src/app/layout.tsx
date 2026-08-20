import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE } from "@/lib/site";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — 合成演员工厂 / Synthetic Talent House`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.descriptionCn,
  keywords: [
    "AI 演员",
    "AI actor",
    "虚拟角色",
    "virtual talent",
    "数字人",
    "synthetic talent",
    "角色授权",
    "character licensing",
    "SWIMMER PARTY",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.claimCn}`,
    description: SITE.descriptionCn,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.claimCn}`,
    description: SITE.descriptionCn,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${archivo.variable} ${jetbrains.variable}`}
      data-game-ui-theme="acid"
      suppressHydrationWarning
    >
      <body className="sp-grain">
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
