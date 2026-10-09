import type { CommunityBackend } from "./adapter.ts";
import type { CommunityPost } from "../../../contracts/community.ts";

/** An isolated, explicitly local adapter. Runtime selection is solely in adapter.ts. */
export function createMemoryBackend(): CommunityBackend {
  const posts: CommunityPost[] = [];
  const trusted = new Set<string>();
  const likes = new Map<string, Set<string>>();
  const reports = new Map<string, Map<string, string>>();
  const votes = new Map<string, Set<string>>();
  const getPost = (id: string) => posts.find((post) => post.id === id);
  return {
    async listPosts() {
      return posts.filter((p) => p.status === "published").sort((a, b) => b.likes - a.likes);
    },
    async getPost(id) {
      return getPost(id);
    },
    async addPost(input) {
      const post: CommunityPost = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        likes: 0,
        status: input.authorId && trusted.has(input.authorId) ? "published" : "pending",
      };
      posts.unshift(post);
      return post;
    },
    async deletePost(id, authorId) {
      const index = posts.findIndex((post) => post.id === id && post.authorId === authorId);
      if (index < 0) return false;
      posts.splice(index, 1);
      likes.delete(id);
      reports.delete(id);
      return true;
    },
    async listReviewQueue() {
      return posts
        .filter((p) => p.status === "pending" || (p.status === "hidden" && reports.has(p.id)))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async reviewPost(id, action) {
      const post = getPost(id);
      if (!post) return undefined;
      post.status = action === "approve" ? "published" : "hidden";
      reports.delete(id);
      if (action === "approve" && post.authorId) trusted.add(post.authorId);
      return post;
    },
    async setPostLike(id, userId, liked) {
      const post = getPost(id);
      if (!post || post.status !== "published") return null;
      const voters = likes.get(id) ?? new Set<string>();
      if (liked) voters.add(userId);
      else voters.delete(userId);
      likes.set(id, voters);
      post.likes = voters.size;
      return { liked: voters.has(userId), count: post.likes };
    },
    async reportPost(id, userId, reason) {
      const post = getPost(id);
      if (!post || post.status !== "published") return null;
      const reporters = reports.get(id) ?? new Map<string, string>();
      reporters.set(userId, reason);
      reports.set(id, reporters);
      if (reporters.size >= 3) post.status = "hidden";
      return { count: reporters.size, hidden: post.status === "hidden", reason };
    },
    async toggleVote(slug, userId) {
      const set = votes.get(slug) ?? new Set<string>();
      if (set.has(userId)) set.delete(userId);
      else set.add(userId);
      votes.set(slug, set);
      return { voted: set.has(userId), count: set.size };
    },
    async voteCount(slug) {
      return votes.get(slug)?.size ?? 0;
    },
  };
}
