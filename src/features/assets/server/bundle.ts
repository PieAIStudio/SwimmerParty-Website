import { getActor } from "../../../content/actors/index.ts";
import { getActorAssets } from "../assets.ts";
import { privateApi, queryText, readJsonBody } from "../../../lib/server/api.ts";
import { HttpError } from "../../../lib/server/runtime-mode.ts";
import { accountUser } from "../../account/server/index.ts";
import { signedAsset } from "./asset-downloads.ts";
import { MAX_BUNDLE_ITEMS } from "../downloads.ts";

// Parse inside the private response wrapper so even malformed requests remain no-store.
export const config = { api: { bodyParser: false } };
export default privateApi("POST", async (req, res, modes) => {
  if (!(await accountUser(req, res, modes.account))) {
    res.status(401).json({ signIn: true });
    return;
  }
  const actor = getActor(queryText(req.query.slug));
  if (!actor) throw new HttpError(404, "asset-not-found");
  const slots = (await readJsonBody(req)).slots;
  if (
    !Array.isArray(slots) ||
    !slots.length ||
    slots.length > MAX_BUNDLE_ITEMS ||
    slots.some((slot) => typeof slot !== "string" || slot.length > 100) ||
    new Set(slots).size !== slots.length
  )
    throw new HttpError(400, "invalid-slots");
  const delivered = getActorAssets(actor.slug).items;
  const selected = slots.map((slot) => delivered.find((item) => item.slot === slot));
  if (selected.some((item) => !item)) throw new HttpError(404, "asset-not-found");
  res.status(200).json({
    items: await Promise.all(selected.map((item) => signedAsset(actor.code, item!, modes.store))),
  });
});
