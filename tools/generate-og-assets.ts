import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "public", "media", "assets");
const outputRoot = path.join(root, "public", "media", "og");
await mkdir(outputRoot, { recursive: true });
for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  try {
    await sharp(path.join(sourceRoot, entry.name, "turnaround.front.webp"))
      .resize({ width: 560, height: 560, fit: "contain", background: "#1f2326" })
      .flatten({ background: "#1f2326" })
      .jpeg({ quality: 82, progressive: true })
      .toFile(path.join(outputRoot, `${entry.name}.jpg`));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
