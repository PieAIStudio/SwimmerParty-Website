import type { NextApiRequest, NextApiResponse } from "next";
import { accountUser } from "@/features/account/server";
import { deletePost, getPost } from "@/features/community";
import { apiFailure, requireSameOrigin } from "@/lib/server/api";
import { HttpError, runtimeModes } from "@/lib/server/runtime-mode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = typeof req.query.id === "string" ? req.query.id : "";
    const post = getPost(id);
    if (!post) throw new HttpError(404, "post-not-found");
    if (req.method === "GET") return res.status(200).json({ post });
    if (req.method !== "DELETE") return res.status(405).end();
    const modes = runtimeModes();
    requireSameOrigin(req, modes.account);
    const user = await accountUser(req, res, modes.account);
    if (!user) throw new HttpError(401, "sign-in-required");
    if (!deletePost(id, user.id)) throw new HttpError(403, "post-owner-required");
    return res.status(204).end();
  } catch (error) {
    apiFailure(res, error);
  }
}
