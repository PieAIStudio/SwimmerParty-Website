import path from "node:path";
import { access } from "node:fs/promises";

/** Public URLs must never become root/media paths or escape the public directory. */
export function publicFile(root: string, url: string) {
  if (!url.startsWith("/media/") || url.includes("\\") || url.split("/").includes(".."))
    throw new Error(`Invalid public media path: ${url}`);
  return path.join(root, "public", url);
}
export function sourceFile(root: string, relative: string) {
  const base = path.resolve(root, "media-pack");
  const target = path.resolve(base, relative);
  if (!target.startsWith(base + path.sep))
    throw new Error(`Source escapes media-pack: ${relative}`);
  return target;
}
export async function requireSources(files: string[]) {
  for (const file of files) {
    try {
      await access(file);
    } catch {
      throw new Error(
        `Missing source: ${file}. Restore the approved local originals before generating; existing deliveries were not replaced.`,
      );
    }
  }
}
export function requireMediaOptIn() {
  if (!process.argv.includes("--generate-media"))
    throw new Error(
      "Real media generation is opt-in: pass --generate-media after restoring approved originals. Use pnpm data:check for pure metadata checks.",
    );
}
