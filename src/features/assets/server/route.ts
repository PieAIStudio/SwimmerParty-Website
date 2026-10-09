import type { NextApiRequest, NextApiResponse } from "next";
import { apiFailure, HttpError, requireSameOrigin } from "../../../lib/server/api.ts";
import { runtimeModes, siteOrigin, type RuntimeModes } from "../../../config/server.ts";

type AssetHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  modes: RuntimeModes,
) => Promise<void>;
/** Privacy/mode policy belongs to the asset API, not to the shared HTTP library. */
export function privateApi(method: "GET" | "POST", handler: AssetHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      const modes = runtimeModes();
      if (req.method !== method) {
        res.setHeader("Allow", method);
        throw new HttpError(405, "method-not-allowed");
      }
      if (method === "POST") requireSameOrigin(req, modes.account, siteOrigin());
      await handler(req, res, modes);
    } catch (error) {
      apiFailure(res, error);
    }
  };
}
export function queryText(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length > 160) throw new HttpError(404, "asset-not-found");
  return value;
}
