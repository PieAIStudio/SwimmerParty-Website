import type { NextApiRequest, NextApiResponse } from "next";
import { listReviewQueue, reviewPost } from "@/features/community";
import { accountUser } from "@/features/account/server";
import { apiFailure, requireSameOrigin } from "@/lib/server/api";
import { HttpError, runtimeModes } from "@/lib/server/runtime-mode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  try {
    const modes = runtimeModes();
    const user = await accountUser(req, res, modes.account);
    if (!user) throw new HttpError(401, "sign-in-required");
    const owners = (process.env.OWNER_ACCOUNT_IDS ?? "").split(",").map((id) => id.trim());
    if (owners.length ? !owners.includes(user.id) : user.id !== "local-mock-member")
      throw new HttpError(403, "owner-required");
    if (modes.account !== "mock") throw new HttpError(503, "community-backend-not-configured");
    if (req.method === "POST") requireSameOrigin(req, modes.account);
    if (req.method === "GET") return res.status(200).json({ posts: listReviewQueue() });
    if (req.method !== "POST") return res.status(405).end();
    const body = req.body as Record<string, unknown>;
    if (typeof body.id !== "string" || !["approve", "hide"].includes(String(body.action)))
      return res.status(400).json({ error: "invalid-review" });
    const post = reviewPost(body.id, body.action as "approve" | "hide");
    return post ? res.status(200).json({ post }) : res.status(404).json({ error: "not-found" });
  } catch (error) {
    apiFailure(res, error);
  }
}
