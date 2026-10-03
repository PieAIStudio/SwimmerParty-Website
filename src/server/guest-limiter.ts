import type { IncomingMessage } from "node:http";
import type { checkRateLimit } from "@vercel/firewall";
import { GUEST_DOWNLOAD_WINDOW_SECONDS } from "../lib/downloads.ts";
import { HttpError } from "./runtime-mode.ts";

export function memoryGuestLimiter(now = Date.now) {
  const deadlines = new Map<string, number>();
  return (ip: string): number => {
    const time = now();
    const deadline = deadlines.get(ip) ?? 0;
    if (deadline > time) return Math.ceil((deadline - time) / 1000);
    if (deadlines.size >= 4096) {
      for (const [key, until] of deadlines) if (until <= time) deadlines.delete(key);
      if (deadlines.size >= 4096) throw new HttpError(503, "guest-limiter-capacity");
    }
    deadlines.set(ip, time + GUEST_DOWNLOAD_WINDOW_SECONDS * 1000);
    return 0;
  };
}
const limiterKey = Symbol.for("swimmer-party.guest-limiter");
const globals = globalThis as typeof globalThis & {
  [limiterKey]?: ReturnType<typeof memoryGuestLimiter>;
};
export async function limitGuest(
  request: IncomingMessage,
  mode: "memory" | "vercel",
): Promise<number> {
  if (mode === "memory") {
    const limit = (globals[limiterKey] ??= memoryGuestLimiter());
    // Local reverse-proxy headers are untrusted: changing X-Forwarded-For cannot evade a window.
    return limit(request.socket.remoteAddress ?? "local-unknown");
  }
  return vercelGuestLimiter((await import("@vercel/firewall")).checkRateLimit, request);
}
export async function vercelGuestLimiter(
  check: typeof checkRateLimit,
  request: Pick<IncomingMessage, "headers">,
): Promise<number> {
  const headers = Object.fromEntries(
    Object.entries(request.headers).filter(
      (entry): entry is [string, string | string[]] => entry[1] !== undefined,
    ),
  );
  const result = await check("guest-asset-download", { headers });
  if (result.error) throw new HttpError(503, "guest-limiter-unavailable");
  // The maintained SDK resolves the request IP and supplies no exact Retry-After value.
  return result.rateLimited ? GUEST_DOWNLOAD_WINDOW_SECONDS : 0;
}
