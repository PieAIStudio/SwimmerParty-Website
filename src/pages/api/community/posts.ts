import type { NextApiRequest, NextApiResponse } from "next";
import { addPost, listPosts } from "@/features/community";
import { TOOLS } from "@/content/tools";
import { communityUser } from "@/features/community/server";
import { apiFailure } from "@/lib/server/api";
import { HttpError } from "@/lib/server/runtime-mode";
const kinds = new Set(["image", "video", "audio", "game", "other"]);
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await communityUser(req, res, req.method !== "GET");
    if (req.method === "GET") return res.status(200).json({ posts: listPosts() });
    if (req.method !== "POST") return res.status(405).end();
    if (!user) throw new HttpError(401, "sign-in-required");
    const body = req.body as Record<string, unknown>;
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      !Array.isArray(body.actorSlugs) ||
      !body.actorSlugs.length ||
      !kinds.has(String(body.kind)) ||
      (body.tool && !TOOLS.includes(body.tool as never))
    )
      return res.status(400).json({ error: "invalid-post" });
    if (body.creditConfirmed !== true || body.rightsConfirmed !== true)
      return res.status(400).json({ error: "confirmations-required" });
    return res.status(201).json({
      post: addPost({
        kind: body.kind as never,
        title: body.title.trim(),
        description: typeof body.description === "string" ? body.description : undefined,
        author: "local member",
        authorId: user.id,
        actorSlugs: body.actorSlugs as string[],
        tool: body.tool as string | undefined,
        recipe: body.recipe as string | undefined,
        mediaUrl: body.mediaUrl as string | undefined,
      }),
    });
  } catch (error) {
    apiFailure(res, error);
  }
}
