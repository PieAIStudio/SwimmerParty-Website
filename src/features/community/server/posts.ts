import { TOOLS } from "../../../content/tools.ts";
import { postRequestSchema } from "../../../contracts/community.ts";
import { HttpError } from "../../../lib/server/api.ts";
import { communityRoute, requireCommunityMember } from "./route.ts";

export const posts = communityRoute(async (req, res, { backend, user }) => {
  if (req.method === "GET") return res.status(200).json({ posts: await backend.listPosts() });
  const member = requireCommunityMember(user);
  if (req.method !== "POST") return res.status(405).end();
  const parsed = postRequestSchema.safeParse(req.body);
  if (!parsed.success || (parsed.data.tool && !TOOLS.some((tool) => tool === parsed.data.tool)))
    return res.status(400).json({ error: "invalid-post" });
  const body = parsed.data;
  if (body.creditConfirmed !== true || body.rightsConfirmed !== true)
    return res.status(400).json({ error: "confirmations-required" });
  return res.status(201).json({
    post: await backend.addPost({
      kind: body.kind,
      title: body.title,
      description: body.description,
      author: "local member",
      authorId: member.id,
      actorSlugs: body.actorSlugs,
      tool: body.tool,
      recipe: body.recipe,
      mediaUrl: body.mediaUrl,
    }),
  });
});
export const post = communityRoute(async (req, res, { backend, user }) => {
  if (req.method !== "GET") requireCommunityMember(user);
  const id = typeof req.query.id === "string" ? req.query.id : "";
  const item = await backend.getPost(id);
  if (!item || (item.status !== "published" && item.authorId !== user?.id))
    throw new HttpError(404, "post-not-found");
  if (req.method === "GET") return res.status(200).json({ post: item });
  if (req.method !== "DELETE") return res.status(405).end();
  if (!(await backend.deletePost(id, requireCommunityMember(user).id)))
    throw new HttpError(403, "post-owner-required");
  return res.status(204).end();
});
