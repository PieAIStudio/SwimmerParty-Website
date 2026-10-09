import { z } from "zod";

export const communityKindSchema = z.enum(["image", "video", "audio", "game", "other"]);
export const communityPostSchema = z.object({
  id: z.string(),
  kind: communityKindSchema,
  title: z.string(),
  description: z.string().optional(),
  author: z.string(),
  authorId: z.string().optional(),
  actorSlugs: z.array(z.string()),
  tool: z.string().optional(),
  recipe: z.string().optional(),
  mediaUrl: z.string().optional(),
  official: z.boolean().optional(),
  likes: z.number().int().nonnegative(),
  createdAt: z.string(),
  status: z.enum(["published", "pending", "hidden"]),
});
export const communityPostsResponseSchema = z.object({ posts: z.array(communityPostSchema) });
export const communityPostResponseSchema = z.object({ post: communityPostSchema });
export const voteCountSchema = z.object({ count: z.number().int().nonnegative() });
export const voteResultSchema = voteCountSchema.extend({ voted: z.boolean() });
export const likeResultSchema = voteCountSchema.extend({ liked: z.boolean() });
export const reportReasons = [
  "Looks like a real person",
  "Sexual or violent",
  "Hateful or harassing",
  "Not made with our actors",
  "Stolen work",
  "Something else",
] as const;
export const likeRequestSchema = z.object({ postId: z.string(), liked: z.boolean() });
export const reportRequestSchema = z.object({ postId: z.string(), reason: z.enum(reportReasons) });
export const reviewRequestSchema = z.object({
  id: z.string(),
  action: z.enum(["approve", "hide"]),
});
export const postRequestSchema = z.object({
  kind: communityKindSchema,
  title: z.string().trim().min(1),
  actorSlugs: z.array(z.string()).min(1),
  description: z.string().optional(),
  tool: z.string().optional(),
  recipe: z.string().optional(),
  mediaUrl: z.string().optional(),
  creditConfirmed: z.unknown().optional(),
  rightsConfirmed: z.unknown().optional(),
});
export type CommunityKind = z.infer<typeof communityKindSchema>;
export type CommunityPost = z.infer<typeof communityPostSchema>;
export type NewCommunityPost = Omit<CommunityPost, "id" | "createdAt" | "likes" | "status">;
export type ReviewAction = z.infer<typeof reviewRequestSchema>["action"];
export type LikeResult = z.infer<typeof likeResultSchema>;
export type VoteResult = z.infer<typeof voteResultSchema>;
export type ReportReason = z.infer<typeof reportRequestSchema>["reason"];
