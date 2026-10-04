import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}
const errors: string[] = [];
for (const file of files("src")) {
  const ownFeature = file.match(/^src\/features\/([^/]+)\//)?.[1];
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g)) {
    const spec = match[1];
    const target = spec.startsWith("@/") ? `src/${spec.slice(2)}` : spec.startsWith(".") ? path.normalize(path.join(path.dirname(file), spec)) : "";
    const feature = target.match(/^src\/features\/([^/]+)(.*)$/);
    if (feature && feature[1] !== ownFeature && !/^(?:|\/client(?:\.ts)?|\/index(?:\.ts)?|\/server(?:\/index(?:\.ts)?)?)$/.test(feature[2]))
      errors.push(`${file}: use the public entry for ${spec}`);
    if (file.startsWith("src/content/") && /^src\/(features|site|app|pages)\//.test(target))
      errors.push(`${file}: content must not depend on ${spec}`);
    if (source.startsWith('"use client"') && target.includes("/server/"))
      errors.push(`${file}: client code must not import ${spec}`);
  }
}
if (errors.length) { process.stderr.write(errors.join("\n") + "\n"); process.exitCode = 1; }
