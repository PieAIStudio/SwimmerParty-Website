import { ImageResponse } from "next/og";
import { getActor } from "@/content/actors";
import { hasLocale, type AppLocale } from "@/i18n/routing";
import { SITE } from "@/content/site";
import { actorOgImage } from "@/lib/og-actor-image";

export const runtime = "nodejs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const actor = getActor(slug);
  const lang = hasLocale(["zh", "en"], locale) ? (locale as AppLocale) : "en";
  const name = actor ? (lang === "zh" ? actor.nameCn : actor.nameEn) : SITE.name;
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
        position: "relative",
      }}
    >
      {image ? (
        // ImageResponse requires a raw image element for embedded bitmap data.
        // eslint-disable-next-line @next/next/no-img-element
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
      <div style={{ color: "#a8d8ff", fontSize: 28, display: "flex" }}>
        {SITE.name} · {actor?.nameEn ?? ""}
      </div>
      <div style={{ fontSize: 76, fontWeight: 700, display: "flex" }}>{name}</div>
    </div>,
    size,
  );
}
