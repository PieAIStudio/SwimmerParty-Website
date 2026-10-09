import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { ACTORS } from "../../src/content/actors/index.ts";
import { actorAssetsSchema } from "../../src/contracts/assets.ts";
import { publicFile, requireSources, requireMediaOptIn } from "./generated-media-common.ts";
import { writeTransaction } from "./file-transaction.ts";

export async function generateAssetDerivatives(root: string, slugs: string[]) {
  const manifests = await Promise.all(
    slugs.map(async (slug) => {
      const file = path.join(root, "src/content/actors", slug, "assets.json");
      const data = actorAssetsSchema.parse(JSON.parse(await readFile(file, "utf8")));
      if (data.slug !== slug) throw new Error(`Manifest slug mismatch: ${file}`);
      return { file, data };
    }),
  );
  const images = manifests.flatMap(({ data }) =>
    data.items.filter((item) => item.kind === "image"),
  );
  for (const item of images)
    if (!item.preview.endsWith(".webp")) throw new Error(`Unsupported preview: ${item.preview}`);
  await requireSources(images.map((item) => publicFile(root, item.preview)));
  const changes: { path: string; bytes: Uint8Array }[] = [];
  for (const { file, data } of manifests) {
    for (const item of data.items) {
      if (item.kind !== "image") continue;
      const bytes = await readFile(publicFile(root, item.preview));
      const large = item.preview.replace(/\.webp$/, ".large.webp");
      const [largeBytes, blurBytes] = await Promise.all([
        sharp(bytes)
          .resize({ width: 941, height: 1672, fit: "inside" })
          .webp({ quality: 82 })
          .toBuffer(),
        sharp(bytes).resize({ width: 12 }).webp({ quality: 35 }).toBuffer(),
      ]);
      changes.push({ path: publicFile(root, large), bytes: largeBytes });
      item.large = large;
      item.blur = `data:image/webp;base64,${blurBytes.toString("base64")}`;
    }
    changes.push({ path: file, bytes: Buffer.from(`${JSON.stringify(data, null, 2)}\n`) });
  }
  await writeTransaction(changes);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  requireMediaOptIn();
  await generateAssetDerivatives(
    process.cwd(),
    ACTORS.map((actor) => actor.slug),
  );
}
