import type {
  AuthorPost,
  CommunityLimits,
  CommunityPost,
  OwnerPost,
} from "../../../src/contracts/community.ts";
/** Synthetic, deterministic v3 projections transcribed from sp-community@7611445. Never runtime seed data. */
export const USER_ID = "11111111-1111-4111-8111-111111111111";
export const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";
export const POST_ID = "33333333-3333-4333-8333-333333333333";
export const MEDIA_ID = "44444444-4444-4444-8444-444444444444";
export const OP_ID = "55555555-5555-4555-8555-555555555555";
export const UPLOAD_ID = "66666666-6666-4666-8666-666666666666";
export const WHEN = "2026-10-14T00:00:00+00:00";
export const v3Limits: CommunityLimits = {
  limitsVersion: 1,
  submissionsOpen: true,
  limits: {
    imageCount: 4,
    imageBytes: 8388608,
    audioCount: 1,
    audioBytes: 26214400,
    audioDurationMs: 300000,
    dailyPosts: 3,
    dailyUploadBytes: 104857600,
  },
  kinds: ["image", "video", "audio"],
  videoPlatforms: ["youtube", "bilibili", "vimeo"],
};
export function publicFixture(overrides: Partial<CommunityPost> = {}): CommunityPost {
  return {
    id: POST_ID,
    revision: 1,
    kind: "image",
    status: "published",
    title: "Synthetic community work",
    description: "A local contract fixture, not an actual submission.",
    recipe: null,
    tool: null,
    actors: [{ slug: "jiang-yifan", assetVersion: "1.0.0" }],
    author: { id: AUTHOR_ID, displayName: "Fixture creator", avatarUrl: null },
    media: [{ id: MEDIA_ID, kind: "image", sortOrder: 0, altText: "Synthetic test pixels" }],
    video: null,
    creditConfirmed: true,
    rightsConfirmed: true,
    official: false,
    featuredAt: null,
    likeCount: 0,
    viewerHasLiked: false,
    createdAt: WHEN,
    updatedAt: WHEN,
    publishedAt: WHEN,
    ...overrides,
  };
}
export function authorFixture(overrides: Partial<AuthorPost> = {}): AuthorPost {
  const base = publicFixture();
  return {
    ...base,
    status: "draft",
    title: "Fixture draft",
    publishedAt: null,
    author: { ...base.author, id: USER_ID },
    media: base.media.map((item) => ({
      ...item,
      processingStatus: "ready",
      reviewStatus: "unreviewed",
    })),
    submittedAt: null,
    deletedAt: null,
    returnedReason: null,
    hiddenReason: null,
    ...overrides,
  };
}
export function ownerFixture(overrides: Partial<OwnerPost> = {}): OwnerPost {
  return {
    ...authorFixture(),
    status: "pending",
    title: "Private test submission",
    submittedAt: WHEN,
    submittedRevision: 1,
    reportRound: 1,
    legacyV1: false,
    reportCount: 1,
    reports: [
      {
        round: 1,
        reasonCode: "not_site_actors",
        note: "Please check actor reference.",
        createdAt: WHEN,
      },
    ],
    authorTrusted: true,
    history: [
      { action: "submit", source: "author_action", reason: null, postRevision: 1, createdAt: WHEN },
    ],
    ...overrides,
  };
}
