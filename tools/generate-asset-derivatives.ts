import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ACTORS } from "../src/content/actors/index.ts";
const root = process.cwd();
for (const actor of ACTORS) {
  const manifestPath = path.join(root, "src/content/actors", actor.slug, "assets.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const item of manifest.items as Array<Record<string, unknown>>) {
    if (item.kind === "voice" || item.kind === "video") continue;
    const preview = String(item.preview);
    const sourcePath = path.join(root, "public", preview);
    const bytes = await readFile(sourcePath);
    const base = preview.replace(/\.webp$/, "");
    const large = `${base}.large.webp`;
    const [largeBytes, blurBytes] = await Promise.all([
      sharp(bytes).resize({ width: 941, height: 1672, fit: "inside" }).webp({ quality: 82 }).toBuffer(),
      sharp(bytes).resize({ width: 12 }).webp({ quality: 35 }).toBuffer(),
    ]);
    await mkdir(path.dirname(path.join(root, large)), { recursive: true });
    await writeFile(path.join(root, large), largeBytes);
    item.kind = "image";
    item.large = large;
    item.blur = `data:image/webp;base64,${blurBytes.toString("base64")}`;
    if (typeof item.object === "string") item.object = item.object.replace(/SP-\d{2,4}__/g, `${actor.slug}__`);
  }
  delete manifest.code;
  manifest.slug = actor.slug;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
console.log(`generated image derivatives for ${ACTORS.length} actors`);
