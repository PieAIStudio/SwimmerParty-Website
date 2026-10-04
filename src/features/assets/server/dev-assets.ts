import type { NextApiRequest, NextApiResponse } from "next";
import { privateApi, queryText } from "../../../lib/server/api.ts";
import { HttpError } from "../../../lib/server/runtime-mode.ts";
import { readLocalObject, verifyLocalObject } from "./local-downloads.ts";

const serve = privateApi("GET", async (req, res) => {
  if (!Array.isArray(req.query.key)) throw new HttpError(404, "asset-not-found");
  const object = req.query.key.join("/");
  verifyLocalObject(object, queryText(req.query.exp), queryText(req.query.sig));
  const bytes = await readLocalObject(process.env.ASSET_LOCAL_ROOT ?? ".assets-local", object);
  res.setHeader("Content-Type", object.endsWith(".png") ? "image/png" : "image/webp");
  res.setHeader("Content-Disposition", "attachment");
  res.status(200).send(bytes);
});
export default async function devAsset(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.VERCEL_ENV !== undefined || (process.env.ASSET_STORE ?? "local") !== "local") {
    res.setHeader("Cache-Control", "private, no-store");
    res.status(404).json({ error: "not-found" });
    return;
  }
  await serve(req, res);
}
