import { fetchImageBlob, saveBlob } from "@/lib/browser-files";

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
  const response = await fetch(endpoint, { signal, cache: "no-store" });
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new GuestDownloadCooldownError(Number.isFinite(retryAfter) ? retryAfter : 30);
  }
  if (!response.ok) throw new Error("Download request failed");
  const result = (await response.json()) as {
    url: string;
    filename: string;
    cooldown?: number;
  };
  const blob = await fetchImageBlob(result.url, signal);
  if (signal.aborted) return result;
  saveBlob(blob, result.filename);
  account.event(result.cooldown ? "guest_download" : "member_download");
  return result;
}
