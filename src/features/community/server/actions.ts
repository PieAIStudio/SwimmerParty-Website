import {
  likeRequestSchema,
  reportRequestSchema,
  reviewRequestSchema,
} from "../../../contracts/community.ts";
import { HttpError } from "../../../lib/server/api.ts";
import { communityRoute, requireCommunityMember } from "./route.ts";

export const likes = communityRoute(async (req, res, { backend, user }) => {
  if (req.method !== "POST") throw new HttpError(405, "method-not-allowed");
  const member = requireCommunityMember(user);
  const body = likeRequestSchema.safeParse(req.body);
  if (!body.success) throw new HttpError(400, "invalid-like");
  const result = await backend.setPostLike(body.data.postId, member.id, body.data.liked);
  if (!result) throw new HttpError(404, "post-not-found");
  res.status(200).json(result);
});
export const reports = communityRoute(async (req, res, { backend, user }) => {
  if (req.method !== "POST") throw new HttpError(405, "method-not-allowed");
  const member = requireCommunityMember(user);
  const body = reportRequestSchema.safeParse(req.body);
  if (!body.success) throw new HttpError(400, "invalid-report");
  const result = await backend.reportPost(body.data.postId, member.id, body.data.reason);
  if (!result) throw new HttpError(404, "post-not-found");
  res.status(200).json(result);
});
export const review = communityRoute(async (req, res, { backend, user }) => {
  const member = requireCommunityMember(user);
  const owners = (process.env.OWNER_ACCOUNT_IDS ?? "").split(",").map((id) => id.trim());
  if (owners.length ? !owners.includes(member.id) : member.id !== "local-mock-member")
    throw new HttpError(403, "owner-required");
  if (req.method === "GET") return res.status(200).json({ posts: await backend.listReviewQueue() });
  if (req.method !== "POST") return res.status(405).end();
  const body = reviewRequestSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "invalid-review" });
  const item = await backend.reviewPost(body.data.id, body.data.action);
  return item ? res.status(200).json({ post: item }) : res.status(404).json({ error: "not-found" });
});
export const votes = communityRoute(async (req, res, { backend, user }) => {
  if (req.method === "GET") {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "";
    return slug
      ? res.status(200).json({ count: await backend.voteCount(slug) })
      : res.status(400).json({ error: "slug-required" });
  }
  if (req.method !== "POST") return res.status(405).end();
  const member = requireCommunityMember(user);
  const slug = typeof req.body?.slug === "string" ? req.body.slug : "";
  if (!slug) return res.status(400).json({ error: "slug-required" });
  return res.status(200).json(await backend.toggleVote(slug, member.id));
});
