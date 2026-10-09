import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) {
  throw new Error("Usage: node tools/release/compare-shots.ts <before-dir> <after-dir>");
}

const files = (await fs.readdir(beforeDir)).filter((name) => name.endsWith(".png"));
const results: { file: string; difference: number }[] = [];
for (const file of files) {
  const beforePath = path.join(beforeDir, file);
  const afterPath = path.join(afterDir, file);
  try {
    const [before, after] = await Promise.all([
      sharp(beforePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(afterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);
    if (before.info.width !== after.info.width || before.info.height !== after.info.height) {
      results.push({ file, difference: 100 });
      continue;
    }
    let changed = 0;
    for (let i = 0; i < before.data.length; i += 4) {
      if (before.data.subarray(i, i + 4).some((value, channel) => value !== after.data[i + channel])) changed += 1;
    }
    results.push({ file, difference: (changed / (before.data.length / 4)) * 100 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") results.push({ file, difference: 100 });
    else throw error;
  }
}
results.sort((a, b) => b.difference - a.difference);
console.log(JSON.stringify(results, null, 2));
