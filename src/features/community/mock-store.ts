import type { CommunityPost } from "./types";
// Pages API routes are compiled separately. Keep the local adapter shared across them.
const local = globalThis as typeof globalThis & {
  swimmerCommunity?: {
    posts: CommunityPost[];
    trusted: Set<string>;
    likes: Map<string, Set<string>>;
    reports: Map<string, Map<string, string>>;
  };
};
export const communityMemory: NonNullable<typeof local.swimmerCommunity> =
  (local.swimmerCommunity ??= {
    posts: [],
    trusted: new Set(),
    likes: new Map(),
    reports: new Map(),
  });
const { posts, trusted, likes, reports } = communityMemory;
export function listPosts() {
  return posts.filter((p) => p.status === "published").sort((a, b) => b.likes - a.likes);
}
export function getPost(id: string) {
  return posts.find((post) => post.id === id);
}
export function deletePost(id: string, authorId: string) {
  const index = posts.findIndex((post) => post.id === id && post.authorId === authorId);
  if (index < 0) return false;
  posts.splice(index, 1);
  likes.delete(id);
  reports.delete(id);
  return true;
}
export function listReviewQueue() {
  return posts
    .filter((p) => p.status === "pending" || (p.status === "hidden" && reports.has(p.id)))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
export function reviewPost(id: string, action: "approve" | "hide") {
  const post = getPost(id);
  if (!post) return undefined;
  post.status = action === "approve" ? "published" : "hidden";
  reports.delete(id);
  if (action === "approve" && post.authorId) trusted.add(post.authorId);
  return post;
}
export function addPost(input: Omit<CommunityPost, "id" | "createdAt" | "likes" | "status">) {
  const post: CommunityPost = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes: 0,
    status: input.authorId && trusted.has(input.authorId) ? "published" : "pending",
  };
  posts.unshift(post);
  return post;
}
export function setPostLike(id: string, userId: string, liked: boolean) {
  const post = getPost(id);
  if (!post || post.status !== "published") return null;
  const voters = likes.get(id) ?? new Set<string>();
  if (liked) voters.add(userId);
  else voters.delete(userId);
  likes.set(id, voters);
  post.likes = voters.size;
  return { liked: voters.has(userId), count: post.likes };
}
