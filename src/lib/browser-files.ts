export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  // A later task lets Safari start consuming the URL before it is revoked.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function fetchImageBlob(url: string, signal?: AbortSignal): Promise<Blob> {
  const response = await fetch(url, { signal, credentials: "same-origin" });
  if (!response.ok) throw new Error("Image download failed");
  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || !blob.size) throw new Error("Invalid image response");
  return blob;
}
