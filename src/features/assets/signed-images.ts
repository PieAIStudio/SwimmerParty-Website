import { signedBundleSchema, MAX_BUNDLE_ITEMS } from "../../contracts/downloads.ts";
import { fetchMediaBlob } from "../../lib/browser-files.ts";
import { SignInRequired } from "./downloads.ts";
import type { AssetFetchProgress } from "./contracts.ts";

type ExpectedAsset = {
  slot: string;
  filename?: string;
  kind?: "image" | "audio";
};

/** Request at most 64 links per API call. Whole actor exports can contain more than 64 files. */
export async function loadSignedImages(
  slug: string,
  expected: ExpectedAsset[],
  {
    signal,
    authorizationError = "Bundle authorization failed",
    maxBytes,
    onProgress,
  }: {
    signal?: AbortSignal;
    authorizationError?: string;
    maxBytes?: number;
    onProgress?: (progress: AssetFetchProgress) => void;
  } = {},
): Promise<{ slot: string; filename: string; blob: Blob }[]> {
  signal?.throwIfAborted();
  if (!expected.length || new Set(expected.map((item) => item.slot)).size !== expected.length)
    throw new Error("Invalid bundle selection");

  const signed: { slot: string; filename: string; url: string; kind: "image" | "audio" }[] = [];
  // Validate ALL signature groups before downloading any file or counting progress.
  for (let start = 0; start < expected.length; start += MAX_BUNDLE_ITEMS) {
    signal?.throwIfAborted();
    const group = expected.slice(start, start + MAX_BUNDLE_ITEMS);
    const response = await fetch(`/api/assets/${slug}/bundle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: group.map((item) => item.slot) }),
      signal,
    });
    if (response.status === 401) throw new SignInRequired("Sign in again");
    if (!response.ok) throw new Error(authorizationError);
    const parsed = signedBundleSchema.safeParse(await response.json());
    if (
      !parsed.success ||
      parsed.data.items.length !== group.length ||
      new Set(parsed.data.items.map((item) => item.slot)).size !== group.length
    )
      throw new Error("Invalid signed bundle");
    for (const item of group) {
      const result = parsed.data.items.find((candidate) => candidate.slot === item.slot);
      if (!result || (item.filename !== undefined && result.filename !== item.filename))
        throw new Error("Bundle identity mismatch");
      signed.push({ ...result, kind: item.kind ?? "image" });
    }
  }

  const files: { slot: string; filename: string; blob: Blob }[] = [];
  let bytes = 0;
  signal?.throwIfAborted();
  onProgress?.({ completed: 0, total: signed.length });
  for (const item of signed) {
    signal?.throwIfAborted();
    const blob = await fetchMediaBlob(item.url, item.kind, signal);
    signal?.throwIfAborted();
    bytes += blob.size;
    if (maxBytes !== undefined && bytes > maxBytes) throw new Error("Choose a smaller export");
    files.push({ slot: item.slot, filename: item.filename, blob });
    onProgress?.({ completed: files.length, total: signed.length });
  }
  signal?.throwIfAborted();
  return files;
}
