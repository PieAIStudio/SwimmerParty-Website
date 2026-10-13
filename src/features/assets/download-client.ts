import { signedDownloadSchema } from "../../contracts/downloads.ts";
import { fetchImageBlob, saveBlob } from "@/lib/browser-files";
import { trackProductEvent } from "@/features/analytics/client";
import { announceFirstUse } from "@/features/guidance/client";

export type AssetDownloadAccount = {
  user: { id: string } | null;
  event: (name: "guest_download" | "member_download") => void;
};

export class GuestDownloadCooldownError extends Error {
  constructor(readonly retryAfter: number) {
    super("guest-download-cooldown");
  }
}

export async function downloadAsset({
  endpoint,
  signal,
  account,
}: {
  endpoint: string;
  signal: AbortSignal;
  account: AssetDownloadAccount;
}): Promise<{ cooldown?: number }> {
  trackProductEvent("download_started", { kind: "single", signed_in: Boolean(account.user) });
  const response = await fetch(endpoint, { signal, cache: "no-store" });
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new GuestDownloadCooldownError(Number.isFinite(retryAfter) ? retryAfter : 30);
  }
  if (!response.ok) throw new Error("Download request failed");
  const result = signedDownloadSchema.parse(await response.json());
  const blob = await fetchImageBlob(result.url, signal);
  if (signal.aborted) return result;
  saveBlob(blob, result.filename);
  announceFirstUse("download");
  account.event(result.cooldown ? "guest_download" : "member_download");
  return result;
}
