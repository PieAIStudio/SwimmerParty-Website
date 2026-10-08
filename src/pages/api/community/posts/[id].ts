import type { NextApiRequest, NextApiResponse } from "next";
import { communityUser } from "@/features/community/server";
import { deletePost, getPost } from "@/features/community";
import { apiFailure } from "@/lib/server/api";
import { HttpError } from "@/lib/server/runtime-mode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await communityUser(req, res, req.method !== "GET");
    const id = typeof req.query.id === "string" ? req.query.id : "";
    const post = getPost(id);
    if (!post || (post.status !== "published" && post.authorId !== user?.id))
      throw new HttpError(404, "post-not-found");
    if (req.method === "GET") return res.status(200).json({ post });
    if (req.method !== "DELETE") return res.status(405).end();
    if (!deletePost(id, user!.id)) throw new HttpError(403, "post-owner-required");
    return res.status(204).end();
  } catch (error) {
    apiFailure(res, error);
  }
}
