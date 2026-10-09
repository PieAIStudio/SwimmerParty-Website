/**
 * Community posting, likes, reports and new-face votes need the shared
 * SwimmerBackend contract (reads, metadata, actor votes, owner review). Until that
 * ships, production keeps them off; local development and e2e turn them on with
 * NEXT_PUBLIC_COMMUNITY_ENABLED=1 against the in-memory adapter.
 */
export const COMMUNITY_ENABLED = process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "1";
