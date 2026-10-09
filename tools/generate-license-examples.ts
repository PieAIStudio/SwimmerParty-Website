import { mkdir } from "node:fs/promises";
import sharp from "sharp";

// "Where the credit goes" pictures for the license page, one per locale. Backgrounds are
// our own sample scenes; the credit is boxed so it can be found at card size.
const W = 960;
const H = 540;
const HIGHLIGHT = "#FFD447";
const SANS = "Helvetica Neue, Helvetica, Arial, Source Han Sans CN, Hiragino Sans GB, sans-serif";
const sample = (slug: string, n: number) =>
  `media-pack/library/samples/${slug}/${slug}__sample__image-0${n}__v1.png`;

async function scene(file: string, top: number, blur = 0) {
  let image = sharp(file).resize({ width: W }).extract({ left: 0, top, width: W, height: H });
  if (blur) image = sharp(await image.toBuffer()).blur(blur);
  return image.toBuffer();
}
const esc = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
/** Text with a highlight box; width is estimated from the glyph count. */
function boxed(text: string, x: number, y: number, size: number, anchor: "start" | "middle" | "end") {
  const width = Math.round(text.length * size * 0.56);
  const left = anchor === "start" ? x : anchor === "middle" ? x - width / 2 : x - width;
  return `<rect x="${left - 12}" y="${y - size - 8}" width="${width + 24}" height="${size + 22}" rx="10" fill="none" stroke="${HIGHLIGHT}" stroke-width="3"/>
<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${SANS}" font-weight="600" font-size="${size}" fill="#fff">${esc(text)}</text>`;
}
const overlay = (body: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);

const copy = {
  en: {
    title: "Riverside Tuesday",
    cast: "Cast",
    roles: ["He Jie — Tang Yunqiu", "Dai Er — Misha Luo"],
    credits: "Credits",
    rows: ["Game design — You", "Music — Your friend"],
    character: "Tang Yunqiu · Swim In AI",
  },
  zh: {
    title: "江边的星期二",
    cast: "演员",
    roles: ["何姐 —— 唐韵秋", "戴尔 —— 罗米沙"],
    credits: "制作人员",
    rows: ["游戏设计 —— 你", "音乐 —— 你的朋友"],
    character: "唐韵秋 · Swim In AI",
  },
} as const;

await mkdir("public/media/license", { recursive: true });
for (const [locale, text] of Object.entries(copy)) {
  const out = (name: string) => `public/media/license/${name}.${locale}.webp`;
  const shade = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`;

  // Opening shot: title, with the credit as one small line under it.
  await sharp(await scene(sample("misha-luo", 2), 10))
    .composite([
      {
        input: overlay(
          `${shade}<text x="${W / 2}" y="${H - 120}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="56" fill="#fff">${esc(text.title)}</text>${boxed("Swim In AI", W / 2, H - 62, 26, "middle")}`,
        ),
      },
    ])
    .webp({ quality: 82 })
    .toFile(out("opening"));

  // End credits: one line in the cast list.
  const still = await sharp(sample("tang-yunqiu", 1))
    .resize({ width: 300 })
    .extract({ left: 0, top: 60, width: 300, height: 420 })
    .toBuffer();
  const lines = text.roles
    .map(
      (role, index) =>
        `<text x="620" y="${210 + index * 52}" text-anchor="middle" font-family="${SANS}" font-size="28" fill="#e6e6e6">${esc(role)}</text>`,
    )
    .join("");
  await sharp({ create: { width: W, height: H, channels: 3, background: "#0b0b0d" } })
    .composite([
      { input: still, left: 60, top: 60 },
      {
        input: overlay(
          `<text x="620" y="140" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="32" fill="#fff">${esc(text.cast)}</text>${lines}${boxed("Actors: Swim In AI", 620, 350, 28, "middle")}`,
        ),
      },
    ])
    .webp({ quality: 82 })
    .toFile(out("end-credits"));

  // Image: a corner mark.
  await sharp(await scene(sample("misha-luo", 1), 110))
    .composite([{ input: overlay(`${shade}${boxed("Swim In AI", W - 36, H - 34, 26, "end")}`) }])
    .webp({ quality: 82 })
    .toFile(out("image"));

  // Game: the credits screen.
  const rows = [...text.rows]
    .map(
      (row, index) =>
        `<text x="${W / 2}" y="${240 + index * 50}" text-anchor="middle" font-family="${SANS}" font-size="26" fill="#e6e6e6">${esc(row)}</text>`,
    )
    .join("");
  await sharp(await scene(sample("zhang-qiang", 2), 300, 8))
    .composite([
      {
        input: overlay(
          `<rect x="200" y="90" width="560" height="360" rx="24" fill="#101216" fill-opacity="0.86"/><text x="${W / 2}" y="170" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="34" fill="#fff">${esc(text.credits)}</text>${rows}${boxed(text.character, W / 2, 360, 26, "middle")}`,
        ),
      },
    ])
    .webp({ quality: 82 })
    .toFile(out("game"));
}
