import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { CommunityError } from "../errors.ts";
import { requireCommunityEnabled } from "./context.ts";
import { communityFailure } from "./gateway.ts";
/** Signing and access wiring are owned by B2. Do not invoke service-role RPCs from the product runtime. */
export async function unavailableCapability(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Cookie");
  try {
    requireCommunityEnabled();
    throw new CommunityError("PROCESSING_UNAVAILABLE");
  } catch (error) {
    communityFailure(res, error, randomUUID());
  }
}
