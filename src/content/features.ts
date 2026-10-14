/** C1/C2 remain opt-in until the separate staging and publication acceptance (C3).
 * Test fixtures are injected by tests, never selected as a production fallback. */
export const COMMUNITY_ENABLED = process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "1";
