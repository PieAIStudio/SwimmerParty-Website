import { readdir, readFile } from "node:fs/promises";
import { analyzeBoundaries } from "./boundary-analysis.ts";

const sources = new Map<string, string>();
async function walk(directory: string) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${item.name}`;
    if (item.isDirectory()) await walk(file);
    else if (item.isFile() && /\.tsx?$/.test(file) && !file.endsWith(".d.ts"))
      sources.set(file, await readFile(file, "utf8"));
  }
}
await walk("src");
const failures = analyzeBoundaries(sources);
if (failures.length) {
  process.stderr.write(`${failures.map(item => `${item.file}: ${item.message}`).join("\n")}\n`);
  process.exitCode = 1;
} else process.stdout.write(`Module boundaries OK (${sources.size} modules; no value cycles or browser-to-server paths)\n`);
