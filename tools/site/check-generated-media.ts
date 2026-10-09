import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { getActorAssets } from "../../src/features/assets/assets.ts";
import { LICENSE_EXAMPLES } from "../../src/content/license.ts";
import { loadActorProjection } from "./actor-data.ts";
import { publicFile } from "../assets/generated-media-common.ts";

/** Check portable references and metadata, not unavailable master bytes. */
export async function checkGeneratedMedia(root = process.cwd()) {
  const data = await loadActorProjection(root);
  const references = new Set<string>();
  let voices = 0;
  for (const actor of data.actors) {
    const assets = getActorAssets(actor.slug, root);
    for (const item of assets.items) {
      if (item.kind === "voice") {
        const url = `/api/voice/${actor.slug}/${item.key}`;
        if (item.preview !== url || item.thumb !== url || item.previewUrl !== url)
          throw new Error(`Voice route drift: ${actor.slug}/${item.slot}`);
        if (
          !item.object.startsWith(`voice/${actor.slug}/`) ||
          !["wav", "mp3"].includes(item.format)
        )
          throw new Error(`Voice delivery drift: ${actor.slug}/${item.slot}`);
        const face = data.newFaces.find((entry) => entry.slug === actor.slug);
        if (face && item.key === "intro" && item.transcript?.text !== face.voice.introLine)
          throw new Error(`Voice transcript drift: ${actor.slug}; regenerate from approved source`);
        voices++;
      } else {
        for (const url of [item.preview, item.thumb, item.large]) if (url) references.add(url);
      }
    }
    if (actor.portrait) references.add(actor.portrait);
  }
  for (const sample of data.samples)
    for (const url of [...sample.images, sample.video]) references.add(url);
  for (const url of references) {
    const bytes = await readFile(publicFile(root, url));
    if (!bytes.length) throw new Error(`Empty generated media: ${url}`);
    if (url.endsWith(".webp") && (await sharp(bytes).metadata()).format !== "webp")
      throw new Error(`Invalid WebP: ${url}`);
  }
  for (const example of LICENSE_EXAMPLES)
    for (const locale of ["en", "zh"]) {
      const url = `${example.image}.${locale}.webp`;
      const metadata = await sharp(await readFile(publicFile(root, url))).metadata();
      if (metadata.format !== "webp" || metadata.width !== 960 || metadata.height !== 540)
        throw new Error(`License example format drift: ${url}`);
    }
  for (const tone of ["white", "black"]) {
    const file = path.join(root, `public/downloads/swim-in-ai-${tone}.png`);
    const metadata = await sharp(await readFile(file)).metadata();
    if (metadata.format !== "png" || !metadata.hasAlpha || !metadata.width || !metadata.height)
      throw new Error(`Invalid credit mark: ${file}`);
  }
  return { actors: data.actors.length, publicReferences: references.size, voices };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await checkGeneratedMedia();
  process.stdout.write(
    `checked ${result.actors} manifests, ${result.publicReferences} public references, ${result.voices} voice routes; source-byte exceptions: tools/README.md\n`,
  );
}
