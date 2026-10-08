import type { NextApiRequest, NextApiResponse } from "next";
import { accountUser } from "../account/server/index.ts";
import { HttpError, runtimeModes } from "../../lib/server/runtime-mode.ts";
import { requireSameOrigin } from "../../lib/server/api.ts";
export async function communityUser(req: NextApiRequest, res: NextApiResponse, required = true) {
  res.setHeader("Cache-Control", "private, no-store");
  const modes = runtimeModes();
  // The shared backend adapter is not yet delivered; local data must never be used in production.
  if (modes.account !== "mock" || process.env.VERCEL_ENV !== undefined)
    throw new HttpError(503, "community-backend-not-configured");
  if (!["GET", "HEAD"].includes(req.method ?? "")) requireSameOrigin(req, modes.account);
  const user = await accountUser(req, res, modes.account);
  if (required && !user) throw new HttpError(401, "sign-in-required");
  return user;
}
