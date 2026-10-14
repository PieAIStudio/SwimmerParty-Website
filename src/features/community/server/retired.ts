import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { CommunityError } from "../errors.ts";
import { communityFailure } from "./gateway.ts";
/** v1 cannot bypass v3 confirmation, idempotency, ownership or upload admission. */
export async function retiredCommunityRoute(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  communityFailure(res, new CommunityError("COMMUNITY_UNAVAILABLE"), randomUUID());
}
