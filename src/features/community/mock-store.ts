import type { CommunityPost } from "./types";
const posts: CommunityPost[] = [];
const trustedAuthors = new Set<string>();
export function listPosts() {
  return [...posts].filter((p) => p.status === "published").sort((a, b) => b.likes - a.likes);
}
export function listReviewQueue() {
  return [...posts]
    .filter((p) => p.status === "pending")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
export function reviewPost(id: string, action: "approve" | "hide") {
  const post = posts.find((entry) => entry.id === id);
  if (!post) return undefined;
  post.status = action === "approve" ? "published" : "hidden";
  if (action === "approve" && post.authorId) trustedAuthors.add(post.authorId);
  return post;
}
export function addPost(input: Omit<CommunityPost, "id" | "createdAt" | "likes" | "status">) {
  const post: CommunityPost = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes: 0,
    status: input.authorId && trustedAuthors.has(input.authorId) ? "published" : "pending",
  };
  posts.unshift(post);
  return post;
}
