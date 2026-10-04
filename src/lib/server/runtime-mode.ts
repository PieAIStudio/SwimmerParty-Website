export type RuntimeModes = {
  store: "local" | "blob";
  account: "mock" | "swimmer";
  limiter: "memory" | "vercel";
};
export class HttpError extends Error {
  status: number;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}

/** Inspect modes only. No credentials or SDKs are touched by local requests. */
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
