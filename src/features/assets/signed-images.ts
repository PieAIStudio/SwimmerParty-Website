import { signedBundleSchema } from "../../contracts/downloads.ts";
import { fetchImageBlob } from "../../lib/browser-files.ts";
import { SignInRequired } from "./downloads.ts";

type ExpectedImage = { slot: string; filename?: string };
/** One authorization/identity/transport path for starter, cast and member exports. */
export async function loadSignedImages(
  slug: string,
  expected: ExpectedImage[],
  {
    signal,
    authorizationError = "Bundle authorization failed",
    maxBytes,
  }: {
    signal?: AbortSignal;
    authorizationError?: string;
    maxBytes?: number;
  } = {},
): Promise<{ slot: string; filename: string; blob: Blob }[]> {
  signal?.throwIfAborted();
  const response = await fetch(`/api/assets/${slug}/bundle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slots: expected.map((item) => item.slot) }),
    signal,
  });
  if (response.status === 401) throw new SignInRequired("Sign in again");
  if (!response.ok) throw new Error(authorizationError);
  const parsed = signedBundleSchema.safeParse(await response.json());
  if (
    !parsed.success ||
    parsed.data.items.length !== expected.length ||
    new Set(parsed.data.items.map((item) => item.slot)).size !== expected.length
  )
    throw new Error("Invalid signed bundle");
  const signed = expected.map((item) => {
    const result = parsed.data.items.find((candidate) => candidate.slot === item.slot);
    if (!result || (item.filename !== undefined && result.filename !== item.filename))
      throw new Error("Bundle identity mismatch");
    return result;
  });
  const images: { slot: string; filename: string; blob: Blob }[] = [];
  let bytes = 0;
  for (const item of signed) {
    signal?.throwIfAborted();
    const blob = await fetchImageBlob(item.url, signal);
    bytes += blob.size;
    if (maxBytes !== undefined && bytes > maxBytes) throw new Error("Choose a smaller export");
    images.push({ slot: item.slot, filename: item.filename, blob });
  }
  signal?.throwIfAborted();
  return images;
}
