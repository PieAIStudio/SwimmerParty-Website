import type { NextApiRequest, NextApiResponse } from "next";
import { apiFailure, requireSameOrigin } from "../../../lib/server/api.ts";
import { HttpError } from "../../../lib/server/api.ts";
import { accountUser } from "../../account/server/index.ts";
import { communityBackend, type CommunityBackend } from "./adapter.ts";

type Context = { backend: CommunityBackend; user: { id: string } | null };
export function communityRoute(
  handler: (req: NextApiRequest, res: NextApiResponse, context: Context) => Promise<unknown>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader("Cache-Control", "private, no-store");
    try {
      // Enforce the disabled-production contract before reading cookies, checking roles or methods.
      const backend = communityBackend();
      if (!["GET", "HEAD"].includes(req.method ?? "")) requireSameOrigin(req, "mock");
      const user = await accountUser(req, res, "mock");
      await handler(req, res, { backend, user });
    } catch (error) {
      apiFailure(res, error);
    }
  };
}
export function requireCommunityMember(user: Context["user"]): { id: string } {
  if (!user) throw new HttpError(401, "sign-in-required");
  return user;
}
