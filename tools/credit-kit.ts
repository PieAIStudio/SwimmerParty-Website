import { mkdir, writeFile } from "node:fs/promises";
import { strToU8, zipSync } from "fflate";
import sharp from "sharp";

// Credit kit for the license page: transparent full-frame overlays, bottom-left, in the
// title-safe area. Text height is about 1/27 of the frame, above the license minimum (1/50).
const sizes = { "1080p": [1920, 1080], "4k": [3840, 2160] } as const;
const marks = { "swim-in-ai": "Swim In AI", "actors-swim-in-ai": "Actors: Swim In AI" } as const;
const colors = { white: "#ffffff", black: "#000000" } as const;

function svg(width: number, height: number, text: string, fill: string): string {
  const fontSize = Math.round(height / 27);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><text x="${Math.round(width * 0.05)}" y="${Math.round(height * 0.95)}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="600" font-size="${fontSize}" fill="${fill}">${text}</text></svg>\n`;
}

const fixed = { mtime: new Date("2026-10-09T00:00:00Z") };
const files: Record<string, [Uint8Array, typeof fixed]> = {
  "credit.txt": [strToU8("Swim In AI\nActors: Swim In AI\n"), fixed],
  "README.txt": [
    strToU8(`SWIMMER PARTY credit kit

Transparent overlays, white and black, for 1080p and 4K frames.
Video: put one on screen at the start (title card or first 10 seconds) and in the end credits, for 2 seconds or more.
Images: the PNG works as a corner mark; scale it down if you like, but keep it readable.
"Swim In AI" always stays in English.

透明叠加图，白色和黑色，1080p 和 4K 两种画幅。
视频：开头（片名卡或前 10 秒）和片尾字幕各放一次，至少停留 2 秒。
图片：PNG 可以当角标用，可以缩小，但要看得清。
“Swim In AI”始终写英文。
`),
    fixed,
  ],
};
for (const [color, fill] of Object.entries(colors))
  for (const [size, [width, height]] of Object.entries(sizes))
    for (const [mark, text] of Object.entries(marks)) {
      const source = svg(width, height, text, fill);
      files[`${color}/${size}/${mark}.svg`] = [strToU8(source), fixed];
      files[`${color}/${size}/${mark}.png`] = [
        new Uint8Array(await sharp(Buffer.from(source)).png().toBuffer()),
        fixed,
      ];
    }
await mkdir("public/downloads", { recursive: true });
await writeFile("public/downloads/swim-in-ai-credit-kit.zip", zipSync(files, { level: 6 }));
