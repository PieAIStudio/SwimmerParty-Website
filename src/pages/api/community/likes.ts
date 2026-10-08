import type { NextApiRequest, NextApiResponse } from "next";
import { setPostLike } from "@/features/community";
import { communityUser } from "@/features/community/server";
import { apiFailure } from "@/lib/server/api";
import { HttpError } from "@/lib/server/runtime-mode";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") throw new HttpError(405, "method-not-allowed");
    const user = await communityUser(req, res);
    const { postId, liked } = req.body ?? {};
    if (typeof postId !== "string" || typeof liked !== "boolean")
      throw new HttpError(400, "invalid-like");
    const result = setPostLike(postId, user!.id, liked);
    if (!result) throw new HttpError(404, "post-not-found");
    res.status(200).json(result);
  } catch (error) {
    apiFailure(res, error);
  }
}
