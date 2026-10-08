import type { NextApiRequest, NextApiResponse } from "next";
import { reportPost } from "@/features/community";
import { communityUser } from "@/features/community/server";
import { apiFailure } from "@/lib/server/api";
import { HttpError } from "@/lib/server/runtime-mode";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") throw new HttpError(405, "method-not-allowed");
    const user = await communityUser(req, res);
    const { postId, reason } = req.body ?? {};
    const reasons = [
      "Looks like a real person",
      "Sexual or violent",
      "Hateful or harassing",
      "Not made with our actors",
      "Stolen work",
      "Something else",
    ];
    if (typeof postId !== "string" || !reasons.includes(reason))
      throw new HttpError(400, "invalid-report");
    const result = reportPost(postId, user!.id, reason);
    if (!result) throw new HttpError(404, "post-not-found");
    res.status(200).json(result);
  } catch (error) {
    apiFailure(res, error);
  }
}
