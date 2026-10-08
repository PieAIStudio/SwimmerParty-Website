import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { NEW_FACE_DATA } from "../src/content/actors/new-faces.ts";

const root = process.cwd();
for (const entry of NEW_FACE_DATA) {
  const source = path.join(root, "media-pack", entry.image);
  const bytes = await readFile(source);
  const slug = entry.slug;
  const publicRoot = path.join(root, "public/media/assets", slug);
  const contentRoot = path.join(root, "src/content/actors", slug);
  await mkdir(publicRoot, { recursive: true });
  await mkdir(contentRoot, { recursive: true });
  const [preview, large, thumb, blur] = await Promise.all([
    sharp(bytes).resize({ width: 1024, height: 1672, fit: "inside" }).webp({ quality: 84 }).toBuffer(),
    sharp(bytes).resize({ width: 941, height: 1672, fit: "inside" }).webp({ quality: 82 }).toBuffer(),
    sharp(bytes).resize({ width: 384, height: 682, fit: "inside" }).webp({ quality: 82 }).toBuffer(),
    sharp(bytes).resize({ width: 12 }).webp({ quality: 35 }).toBuffer(),
  ]);
  await Promise.all([
    writeFile(path.join(publicRoot, "turnaround.front.webp"), preview),
    writeFile(path.join(publicRoot, "turnaround.front.large.webp"), large),
    writeFile(path.join(publicRoot, "turnaround.front.thumb.webp"), thumb),
  ]);
  const hash = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(contentRoot, "assets.json"), JSON.stringify({
    slug,
    looks: [],
    items: [{
      kind: "image", slot: "turnaround.front", series: "turnaround", key: "front", look: null,
      conformance: "v1", version: 0.1, width: 941, height: 1672, bytes: bytes.length,
      sha256: hash, sourceSha256: hash, bbox: { left: 0, top: 0, right: 1, bottom: 1 }, format: "png",
      object: `${slug}/${entry.source}.png`, preview: `/media/assets/${slug}/turnaround.front.webp`,
      large: `/media/assets/${slug}/turnaround.front.large.webp`, thumb: `/media/assets/${slug}/turnaround.front.thumb.webp`,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
    }],
  }, null, 2) + "\n");
}
console.log(`generated ${NEW_FACE_DATA.length} new-face image manifests`);
