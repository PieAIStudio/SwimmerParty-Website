import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { writeTransaction } from "../assets/file-transaction.ts";

/** OG previews depend only on tracked website images, not on private originals/fonts. */
export async function generateOgAssets(root = process.cwd(), check = false) {
  const sourceRoot = path.join(root, "public/media/assets");
  const changes: { path: string; bytes: Uint8Array }[] = [];
  for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let source: Buffer;
    try {
      source = await readFile(path.join(sourceRoot, entry.name, "turnaround.front.webp"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    const bytes = await sharp(source)
      .resize({ width: 560, height: 560, fit: "contain", background: "#1f2326" })
      .flatten({ background: "#1f2326" })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
    const target = path.join(root, "public/media/og", `${entry.name}.jpg`);
    if (check) {
      const actual = await readFile(target);
      if (!actual.equals(bytes)) throw new Error(`Generated OG drift: ${target}`);
    } else changes.push({ path: target, bytes });
  }
  await writeTransaction(changes);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await generateOgAssets(process.cwd(), process.argv.includes("--check"));
}
