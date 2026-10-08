import { communityMemory, getPost, listReviewQueue } from "./mock-store.ts";
export function reportPost(postId: string, userId: string, reason: string) {
  const post = getPost(postId);
  if (!post || post.status !== "published") return null;
  const reporters = communityMemory.reports.get(postId) ?? new Map<string, string>();
  reporters.set(userId, reason);
  communityMemory.reports.set(postId, reporters);
  if (reporters.size >= 3) post.status = "hidden";
  return { count: reporters.size, hidden: post.status === "hidden", reason };
}
export function reportCount(postId: string) {
  return communityMemory.reports.get(postId)?.size ?? 0;
}
export function reviewQueue() {
  return listReviewQueue();
}
