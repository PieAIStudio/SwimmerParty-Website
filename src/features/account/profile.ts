/** The signed-in person as the header shows them. Pure: no AuthKit or request types. */
export type AccountProfile = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

/** The subset of an AuthKit user this derivation reads. `user_metadata` is optional
 * because the current AuthKit user type does not expose it; AuthKit 0.9 is expected
 * to ship the same helper as `accountProfile`. */
export type AccountSource = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

const MAX_NAME_LENGTH = 40;
const FALLBACK_NAME = "Swimmer";

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Name order: display_name, full_name, name, the email local part, then "Swimmer". */
export function accountProfile(user: AccountSource): AccountProfile {
  const metadata = user.user_metadata ?? {};
  const email = user.email ?? null;
  const localPart = email ? text(email.split("@")[0]) : null;
  const name =
    text(metadata.display_name) ??
    text(metadata.full_name) ??
    text(metadata.name) ??
    localPart ??
    FALLBACK_NAME;
  return {
    id: user.id,
    name: Array.from(name).slice(0, MAX_NAME_LENGTH).join("").trim(),
    email,
    avatarUrl: httpsUrl(metadata.avatar_url),
  };
}
