import { getSiteI18n } from "@/i18n/server";
import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";
import { hasLocale, type AppLocale } from "@/i18n/routing";
import { ACTORS } from "@/content/actors";
import { actorOgImage } from "@/lib/og-actor-image";

export const runtime = "nodejs";

export const alt = "SWIMMER PARTY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = hasLocale(["zh", "en"], locale) ? (locale as AppLocale) : "en";
  const { t } = await getSiteI18n(lang);
  const actor = ACTORS.find((item) => item.status === "active") ?? ACTORS[0];
  const image = actor ? await actorOgImage(actor.slug) : null;
  return new ImageResponse(
    <div
      style={{
        background: "#1f2326",
        color: "#fffdf8",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        fontSize: 48,
        position: "relative",
      }}
    >
      {image ? (
        // ImageResponse requires a raw image element for embedded bitmap data.
        // oxlint-disable-next-line next/no-img-element
        <img
          alt=""
          src={image}
          style={{
            width: 520,
            height: 520,
            objectFit: "contain",
            position: "absolute",
            right: 48,
            bottom: 24,
          }}
        />
      ) : null}
      <div style={{ color: "#a8d8ff", fontSize: 28 }}>{SITE.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{t("home.ogTitle")}</div>
        <div style={{ fontSize: 30, color: "#c7ced3" }}>{t("home.ogSubtitle")}</div>
      </div>
    </div>,
    size,
  );
}
