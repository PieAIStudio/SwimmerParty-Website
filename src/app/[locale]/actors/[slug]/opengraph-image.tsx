import { ImageResponse } from "next/og";
import { getActor } from "@/content/actors";
import { hasLocale, type AppLocale } from "@/i18n/routing";
import { SITE } from "@/content/site";

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
      }}
    >
      <div style={{ color: "#a8d8ff", fontSize: 28 }}>
        {SITE.name} · {actor?.code ?? ""}
      </div>
      <div style={{ fontSize: 76, fontWeight: 700 }}>{name}</div>
    </div>,
    size,
  );
}
