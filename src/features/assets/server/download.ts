import { getActor } from "../../../content/actors/index.ts";
import { getActorAssets } from "../assets.ts";
import { privateApi, queryText } from "../../../lib/server/api.ts";
import { HttpError } from "../../../lib/server/runtime-mode.ts";
import { accountUser } from "../../account/server/index.ts";
import { limitGuest } from "./guest-limiter.ts";
import { signedAsset } from "./asset-downloads.ts";
import { GUEST_DOWNLOAD_WINDOW_SECONDS } from "../downloads.ts";
import { getPublicDownload } from "../public-downloads.ts";

function publicDownloadUrl(req: { headers: { host?: string | string[] } }, path: string): string {
  const host = typeof req.headers.host === "string" ? req.headers.host : undefined;
  if (!host) return path;
  const protocol = process.env.VERCEL_ENV ? "https" : "http";
  return new URL(path, `${protocol}://${host}`).toString();
}

export default privateApi("GET", async (req, res, modes) => {
  const slug = queryText(req.query.slug);
  const slot = queryText(req.query.slot);
  const publicDownload = slug === "public" ? getPublicDownload(slot) : undefined;
  const actor = publicDownload ? null : getActor(slug);
  if (!actor && !publicDownload) throw new HttpError(404, "asset-not-found");
  const item = actor
    ? getActorAssets(actor.slug).items.find((candidate) => candidate.slot === slot)
    : null;
  if (!item && !publicDownload) throw new HttpError(404, "asset-not-found");
  const user = await accountUser(req, res, modes.account);
  if (!user) {
    const retryAfter = await limitGuest(req, modes.limiter);
    if (retryAfter) {
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ retryAfter });
      return;
    }
  }
  const result = publicDownload
    ? { ...publicDownload, url: publicDownloadUrl(req, publicDownload.url) }
    : await signedAsset(actor!.slug, item!, modes.store);
  const { url, filename } = result;
  res
    .status(200)
    .json({ url, filename, ...(!user ? { cooldown: GUEST_DOWNLOAD_WINDOW_SECONDS } : {}) });
});
