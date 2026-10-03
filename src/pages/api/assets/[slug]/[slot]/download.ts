import { getActor } from "../../../../../content/actors.ts";
import { getActorAssets } from "../../../../../content/assets.ts";
import { privateApi, queryText } from "../../../../../server/api.ts";
import { HttpError } from "../../../../../server/runtime-mode.ts";
import { accountUser } from "../../../../../server/account.ts";
import { limitGuest } from "../../../../../server/guest-limiter.ts";
import { signedAsset } from "../../../../../server/asset-downloads.ts";
import { GUEST_DOWNLOAD_WINDOW_SECONDS } from "../../../../../lib/downloads.ts";

export default privateApi("GET", async (req, res, modes) => {
  const actor = getActor(queryText(req.query.slug));
  if (!actor) throw new HttpError(404, "asset-not-found");
  const item = getActorAssets(actor.slug).items.find(
    (candidate) => candidate.slot === queryText(req.query.slot),
  );
  if (!item) throw new HttpError(404, "asset-not-found");
  const user = await accountUser(req, res, modes.account);
  if (!user) {
    const retryAfter = await limitGuest(req, modes.limiter);
    if (retryAfter) {
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ retryAfter });
      return;
    }
  }
  const { url, filename } = await signedAsset(actor.code, item, modes.store);
  res
    .status(200)
    .json({ url, filename, ...(!user ? { cooldown: GUEST_DOWNLOAD_WINDOW_SECONDS } : {}) });
});
