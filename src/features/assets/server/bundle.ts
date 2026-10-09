import { getActor } from "../../actors/queries.ts";
import { getActorAssets } from "../assets.ts";
import { privateApi, queryText } from "./route.ts";
import { readJsonBody } from "../../../lib/server/api.ts";
import { HttpError } from "../../../lib/server/api.ts";
import { accountUser } from "../../account/server/index.ts";
import { signedAsset } from "./asset-downloads.ts";
import { bundleRequestSchema } from "../../../contracts/downloads.ts";

// Parse inside the private response wrapper so even malformed requests remain no-store.
export default privateApi("POST", async (req, res, modes) => {
  if (!(await accountUser(req, res, modes.account))) {
    res.status(401).json({ signIn: true });
    return;
  }
  const actor = getActor(queryText(req.query.slug));
  if (!actor) throw new HttpError(404, "asset-not-found");
  const parsed = bundleRequestSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) throw new HttpError(400, "invalid-slots");
  const { slots } = parsed.data;
  const delivered = getActorAssets(actor.slug).items;
  const selected = slots.map((slot) => delivered.find((item) => item.slot === slot));
  if (selected.some((item) => !item)) throw new HttpError(404, "asset-not-found");
  res.status(200).json({
    items: await Promise.all(selected.map((item) => signedAsset(actor.slug, item!, modes.store))),
  });
});
