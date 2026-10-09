import { SITE } from "../content/site.ts";
import { HttpError } from "../lib/server/api.ts";

export type RuntimeModes = {
  store: "local" | "blob";
  account: "mock" | "swimmer";
  limiter: "memory" | "vercel";
};
/** Deployment composition owns environment policy; generic HTTP helpers do not. */
export function runtimeModes(
  env: Readonly<Record<string, string | undefined>> = process.env,
): RuntimeModes {
  const store = env.ASSET_STORE ?? "local";
  const account = env.ACCOUNT_MODE ?? "mock";
  const limiter = env.GUEST_LIMITER ?? "memory";
  if (
    !["local", "blob"].includes(store) ||
    !["mock", "swimmer"].includes(account) ||
    !["memory", "vercel"].includes(limiter)
  )
    throw new HttpError(503, "invalid-runtime-mode");
  if (
    env.VERCEL_ENV !== undefined &&
    (store === "local" || account === "mock" || limiter === "memory")
  )
    throw new HttpError(503, "local-mode-forbidden-on-vercel");
  return { store, account, limiter } as RuntimeModes;
}
export function siteOrigin(
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  return env.SWIMMER_ORIGIN ?? SITE.url;
}
