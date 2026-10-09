import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ACTORS } from "../../../src/content/actors/index.ts";
import { getActorAssets } from "../../../src/features/assets/assets.ts";
import { syntheticMp3, syntheticWav } from "./audio.ts";

/** Test-only geometric pixels, not portraits or delivered production masters. */
export async function prepareDownloadFixtures(root = path.resolve("e2e/fixtures/assets-store")) {
  await mkdir(root, { recursive: true });
  const png = await sharp({
    create: { width: 96, height: 144, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="96" height="144"><rect x="24" y="20" width="48" height="116" rx="12" fill="gray"/></svg>',
        ),
      },
    ])
    .png()
    .toBuffer();
  const webp = await sharp(png).webp().toBuffer();
  const audio = { wav: syntheticWav(), mp3: syntheticMp3() };
  await writeFile(path.join(root, "synthetic.png"), png);
  await writeFile(path.join(root, "synthetic.webp"), webp);
  for (const actor of ACTORS)
    for (const item of getActorAssets(actor.slug).items) {
      const target = path.join(root, item.object);
      await mkdir(path.dirname(target), { recursive: true });
      const bytes =
        item.kind === "voice"
          ? audio[item.format === "wav" ? "wav" : "mp3"]
          : item.format === "png"
            ? png
            : webp;
      await writeFile(target, bytes);
    }
}
