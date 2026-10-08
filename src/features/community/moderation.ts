import { listPosts } from "./mock-store.ts";
const reports = new Map<string, Set<string>>();
export function reportPost(postId: string, userId: string, reason: string) {
  const set = reports.get(postId) ?? new Set<string>();
  set.add(userId);
  reports.set(postId, set);
  return { count: set.size, hidden: set.size >= 3, reason };
}
export function reportCount(postId: string) {
  return reports.get(postId)?.size ?? 0;
}
export function reviewQueue() {
  return listPosts().filter((p) => p.status !== "published");
}
