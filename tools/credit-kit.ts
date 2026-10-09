import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const output = {
  white: "public/downloads/swim-in-ai-white.png",
  black: "public/downloads/swim-in-ai-black.png",
} as const;

function svg(fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="540" viewBox="0 0 2400 540"><text x="80" y="430" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="420" fill="${fill}">Swim In AI</text></svg>`;
}

async function render(fill: string): Promise<Buffer> {
  return sharp(Buffer.from(svg(fill)))
    .png()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

await mkdir("public/downloads", { recursive: true });
await Promise.all([
  writeFile(output.white, await render("#FFFFFF")),
  writeFile(output.black, await render("#000000")),
]);
