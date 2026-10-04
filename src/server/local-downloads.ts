import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import path from "node:path";
import { objectPath } from "./asset-store.ts";
import { HttpError } from "./runtime-mode.ts";
import { SIGNED_DOWNLOAD_SECONDS } from "../features/assets/downloads.ts";

const secretKey = Symbol.for("swimmer-party.local-asset-signing-secret");
const globals = globalThis as typeof globalThis & { [secretKey]?: string };
function secret(): string {
  // A single process key survives independent Next Pages API module instances.
  return (globals[secretKey] ??=
    process.env.DEV_ASSET_SIGNING_SECRET || randomBytes(32).toString("hex"));
}
function signature(object: string, exp: number, key: string): string {
  return createHmac("sha256", key).update(`swimmer-party-asset\n${object}\n${exp}`).digest("hex");
}
export function signLocalObject(object: string, now = Date.now(), key = secret()): string {
  objectPath(".", object);
  const exp = Math.floor(now / 1000) + SIGNED_DOWNLOAD_SECONDS;
  return `/api/dev-assets/${object.split("/").map(encodeURIComponent).join("/")}?exp=${exp}&sig=${signature(object, exp, key)}`;
}
export function verifyLocalObject(
  object: string,
  expiration: unknown,
  sig: unknown,
  now = Date.now(),
  key = secret(),
): void {
  try {
    objectPath(".", object);
  } catch {
    throw new HttpError(404, "asset-not-found");
  }
  const exp =
    typeof expiration === "string" && /^\d{1,12}$/.test(expiration) ? Number(expiration) : NaN;
  const current = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(exp) ||
    exp <= current ||
    exp > current + SIGNED_DOWNLOAD_SECONDS ||
    typeof sig !== "string" ||
    !/^[a-f0-9]{64}$/.test(sig)
  )
    throw new HttpError(403, "invalid-asset-signature");
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(signature(object, exp, key), "hex")))
    throw new HttpError(403, "invalid-asset-signature");
}

/** The configured root is trusted; nothing below it may redirect through symlinks. */
export async function readLocalObject(root: string, object: string): Promise<Buffer> {
  const target = objectPath(root, object);
  try {
    // Local masters are runtime-only files, never deployment trace inputs.
    const rootReal = await realpath(/* turbopackIgnore: true */ root);
    let cursor = path.resolve(/* turbopackIgnore: true */ root);
    for (const segment of object.split("/")) {
      cursor = path.join(/* turbopackIgnore: true */ cursor, segment);
      if ((await lstat(/* turbopackIgnore: true */ cursor)).isSymbolicLink())
        throw new HttpError(404, "asset-not-found");
    }
    const actual = await realpath(/* turbopackIgnore: true */ target);
    if (!actual.startsWith(`${rootReal}${path.sep}`)) throw new HttpError(404, "asset-not-found");
    const handle = await open(
      /* turbopackIgnore: true */ actual,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > 64 * 1024 * 1024)
        throw new HttpError(404, "asset-not-found");
      return await handle.readFile();
    } finally {
      await handle.close();
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (["ENOENT", "ENOTDIR", "ELOOP"].includes((error as NodeJS.ErrnoException).code ?? ""))
      throw new HttpError(404, "asset-not-found");
    throw error;
  }
}
