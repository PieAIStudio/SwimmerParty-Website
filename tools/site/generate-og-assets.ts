import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { writeTransaction } from "../assets/file-transaction.ts";

/** OG previews depend only on tracked website images, not on private originals/fonts. */
export async function generateOgAssets(root = process.cwd(), check = false) {
  const sourceRoot = path.join(root, "public/media/assets");
  const changes: { path: string; bytes: Uint8Array }[] = [];
  const expected = new Set<string>();
  const outputRoot = path.join(root, "public/media/og");
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
    expected.add(`${entry.name}.jpg`);
    const target = path.join(outputRoot, `${entry.name}.jpg`);
    if (check) {
      const actual = await readFile(target);
      if (!actual.equals(bytes)) throw new Error(`Generated OG drift: ${target}`);
    } else changes.push({ path: target, bytes });
  }
  const existing = await readdir(outputRoot, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    },
  );
  const retired = existing.filter(
    (entry) => entry.isFile() && /^[a-z0-9-]+\.jpg$/.test(entry.name) && !expected.has(entry.name),
  );
  if (check && retired.length)
    throw new Error(`Retired OG outputs remain: ${retired.map((entry) => entry.name).join(", ")}`);
  await writeTransaction(changes);
  // Only disposable derived JPEGs in this generator's output directory are pruned.
  // Production PNGs, delivery sources, and any unrelated files are never removed.
  if (!check) for (const entry of retired) await unlink(path.join(outputRoot, entry.name));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await generateOgAssets(process.cwd(), process.argv.includes("--check"));
}
