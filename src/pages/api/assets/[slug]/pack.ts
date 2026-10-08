import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { accountUser } from "@/features/account/server/account";
import { apiFailure, queryText } from "@/lib/server/api";
import { HttpError, runtimeModes } from "@/lib/server/runtime-mode";
import { getActor } from "@/content/actors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") throw new HttpError(405, "method-not-allowed");
    const modes = runtimeModes();
    const user = await accountUser(req, res, modes.account);
    if (!user) throw new HttpError(401, "sign-in-required");
    if (modes.store !== "local") throw new HttpError(503, "pack-storage-not-configured");
    const slug = queryText(req.query.slug);
    const actor = getActor(slug);
    if (!actor) throw new HttpError(404, "pack-not-found");
    const version = actor.version ?? "0.1.0";
    const file = path.join(
      process.cwd(),
      "media-pack/library/packs",
      slug,
      `v${version}`,
      `${slug}_v${version}_starter.zip`,
    );
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) throw new HttpError(404, "pack-not-found");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", info.size);
    res.setHeader("Content-Disposition", `attachment; filename="${slug}_v${version}_starter.zip"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).send(await readFile(file));
  } catch (error) {
    apiFailure(res, error);
  }
}
