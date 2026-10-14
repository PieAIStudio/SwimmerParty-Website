import { communityMode } from "../contracts/community-access.ts";
/** Build and deploy must use the same value. The previous boolean switch is intentionally retired. */
export const COMMUNITY_MODE = communityMode(process.env.NEXT_PUBLIC_COMMUNITY_MODE);
/** Public-only legacy affordances (such as sign-in benefits) must not leak owner rollout. */
export const COMMUNITY_ENABLED = COMMUNITY_MODE === "on";
