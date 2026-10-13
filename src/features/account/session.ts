import { z } from "zod";
import {
  AccountProfileSchema,
  AuthUserSchema,
  type AccountProfile,
} from "@pieaistudio/swimmer-auth-kit";

export type AccountSession = {
  user: { id: string } | null;
  mode: "mock" | "swimmer" | null;
  profile: AccountProfile | null;
};
const legacySession = z.object({
  mode: z.enum(["mock", "swimmer"]),
  user: AccountProfileSchema.nullable(),
});
const swimmerSession = z.object({
  user: AuthUserSchema.nullable(),
  profile: AccountProfileSchema.nullable().optional(),
});

/** Only the same-origin server's verified session response enters this adapter.
 * Preserve local mock and old deployed responses during rollout. New swimmer
 * responses use AuthKit's separate profile, never raw user_metadata or a second
 * provider call. This projection is for UI only; requests authorize on the server.
 */
export function accountSession(value: unknown): AccountSession {
  if (value && typeof value === "object" && "mode" in value) {
    const { mode, user: profile } = legacySession.parse(value);
    return { user: profile ? { id: profile.id } : null, profile, mode };
  }
  const { user, profile } = swimmerSession.parse(value);
  if (user === null) {
    if (profile != null) throw new Error("Profile without a verified account");
    return { user: null, profile: null, mode: "swimmer" };
  }
  if (user.is_anonymous !== false || !profile || profile.id !== user.id)
    throw new Error("Profile does not match the verified account");
  return { user: { id: user.id }, profile, mode: "swimmer" };
}
