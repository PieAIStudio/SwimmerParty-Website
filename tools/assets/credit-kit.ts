import path from "node:path";
import { pathToFileURL } from "node:url";
import { requireMediaOptIn } from "./generated-media-common.ts";
import { writeTransaction } from "./file-transaction.ts";
import sharp from "sharp";
import { LICENSE } from "../../src/content/license.ts";

const output = {
  white: "public/downloads/swim-in-ai-white.png",
  black: "public/downloads/swim-in-ai-black.png",
} as const;

export function creditSvg(fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="540" viewBox="0 0 2400 540"><text x="80" y="430" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="420" fill="${fill}">${LICENSE.credit.en}</text></svg>`;
}

async function render(fill: string): Promise<Buffer> {
  return sharp(Buffer.from(creditSvg(fill)))
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

async function generateCreditMarks(root = process.cwd()) {
  // Raster bytes depend on the installed font; don't regenerate during ordinary checks.
  await writeTransaction([
    { path: path.join(root, output.white), bytes: await render("#FFFFFF") },
    { path: path.join(root, output.black), bytes: await render("#000000") },
  ]);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  requireMediaOptIn();
  await generateCreditMarks();
}
