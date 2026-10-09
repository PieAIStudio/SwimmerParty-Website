import type {
  CommunityPost,
  NewCommunityPost,
  ReviewAction,
  LikeResult,
  VoteResult,
  ReportReason,
} from "../../../contracts/community.ts";
import { HttpError } from "../../../lib/server/api.ts";
import { runtimeModes } from "../../../config/server.ts";
import { createMemoryBackend } from "./memory.ts";

/** The only storage contract handlers use. A future remote implementation is asynchronous too. */
export interface CommunityBackend {
  listPosts(): Promise<CommunityPost[]>;
  getPost(id: string): Promise<CommunityPost | undefined>;
  addPost(input: NewCommunityPost): Promise<CommunityPost>;
  deletePost(id: string, authorId: string): Promise<boolean>;
  listReviewQueue(): Promise<CommunityPost[]>;
  reviewPost(id: string, action: ReviewAction): Promise<CommunityPost | undefined>;
  setPostLike(id: string, userId: string, liked: boolean): Promise<LikeResult | null>;
  reportPost(
    id: string,
    userId: string,
    reason: ReportReason,
  ): Promise<{ count: number; hidden: boolean; reason: string } | null>;
  toggleVote(slug: string, userId: string): Promise<VoteResult>;
  voteCount(slug: string): Promise<number>;
}
const local = globalThis as typeof globalThis & { swimmerCommunityBackend?: CommunityBackend };
export function communityBackend(): CommunityBackend {
  const modes = runtimeModes();
  // No remote implementation is configured. Never instantiate local storage on a hosted deployment.
  if (modes.account !== "mock" || process.env.VERCEL_ENV !== undefined)
    throw new HttpError(503, "community-backend-not-configured");
  return (local.swimmerCommunityBackend ??= createMemoryBackend());
}
