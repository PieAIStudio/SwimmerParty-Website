import type { CommunityPost } from "./types";
const posts: CommunityPost[] = [];
export function listPosts() {
  return [...posts].filter((p) => p.status === "published").sort((a, b) => b.likes - a.likes);
}
export function addPost(input: Omit<CommunityPost, "id" | "createdAt" | "likes" | "status">) {
  const post: CommunityPost = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes: 0,
    status: "pending",
  };
  posts.unshift(post);
  return post;
}
