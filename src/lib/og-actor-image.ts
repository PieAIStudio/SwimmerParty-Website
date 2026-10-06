import { readFile } from "node:fs/promises";
import path from "node:path";

export async function actorOgImage(slug: string): Promise<string | null> {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "media", "og", `${slug}.jpg`));
    return `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}
