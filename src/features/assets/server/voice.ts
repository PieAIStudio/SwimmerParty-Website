import { readFile } from "node:fs/promises";
import path from "node:path";
import { getActor } from "../../../content/actors/index.ts";
import { getActorAssets } from "../assets.ts";
import { configuredBlobStore } from "./blob-store.ts";
import { privateApi, queryText } from "../../../lib/server/api.ts";
import { HttpError } from "../../../lib/server/runtime-mode.ts";

/** Public voice preview. Blob mode redirects to a short-lived signed URL; local mode streams. */
export default privateApi("GET", async (req, res, modes) => {
  const actor = getActor(queryText(req.query.slug));
  const slot = queryText(req.query.slot);
  const item = actor
    ? getActorAssets(actor.slug).items.find(
        (candidate) => candidate.kind === "voice" && candidate.slot === `voice.${slot}`,
      )
    : undefined;
  if (!actor || !item) throw new HttpError(404, "voice-not-found");
  if (modes.store === "blob") {
    res.redirect(302, await (await configuredBlobStore()).sign(item.object));
    return;
  }
  // New-face voices stay in the casting folder locally; delivered voices sit under their slug.
  // An explicit local asset root isolates tests from real recordings. Without it,
  // preserve the production-workbench layout; Blob mode above is unchanged.
  const library = process.env.ASSET_LOCAL_ROOT
    ? path.resolve(/* turbopackIgnore: true */ process.env.ASSET_LOCAL_ROOT, "voice")
    : path.join(/* turbopackIgnore: true */ process.cwd(), "media-pack/library/voice");
  const object = item.object.replace(/^voice\//, "");
  const candidates = [
    path.join(library, "new-faces", actor.slug, path.basename(object)),
    path.join(library, object),
  ];
  for (const file of candidates) {
    const bytes = await readFile(/* turbopackIgnore: true */ file).catch(() => null);
    if (!bytes) continue;
    res.setHeader("Content-Type", item.format === "wav" ? "audio/wav" : "audio/mpeg");
    res.status(200).send(bytes);
    return;
  }
  throw new HttpError(404, "voice-not-found");
});
