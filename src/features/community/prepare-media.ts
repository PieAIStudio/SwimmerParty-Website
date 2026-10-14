import type { CommunityLimits } from "../../contracts/community.ts";
import { CommunityError } from "./errors.ts";
import { imageDimensions } from "./image-header.ts";

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const audioTypes = ["audio/mpeg", "audio/wav", "audio/mp4"];
export async function prepareCommunityFile(
  file: File,
  kind: "image" | "audio",
  limits: CommunityLimits,
  signal?: AbortSignal,
): Promise<{ file: File; durationMs?: number }> {
  signal?.throwIfAborted();
  const max = kind === "image" ? limits.limits.imageBytes : limits.limits.audioBytes;
  if (!file.size) throw new CommunityError("MEDIA_INVALID");
  if (file.size > max) throw new CommunityError("FILE_TOO_LARGE");
  if (!(kind === "image" ? imageTypes : audioTypes).includes(file.type))
    throw new CommunityError("UNSUPPORTED_MEDIA");
  if (kind === "image") {
    const dimensions = imageDimensions(new Uint8Array(await file.arrayBuffer()), file.type);
    signal?.throwIfAborted();
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new CommunityError("MEDIA_INVALID");
    }
    try {
      if (bitmap.width * bitmap.height !== dimensions.width * dimensions.height)
        throw new CommunityError("MEDIA_INVALID");
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      if (!context) throw new CommunityError("PROCESSING_UNAVAILABLE");
      context.drawImage(bitmap, 0, 0);
      const clean = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new CommunityError("MEDIA_INVALID"))),
          file.type,
          0.92,
        ),
      );
      signal?.throwIfAborted();
      if (clean.size > max) throw new CommunityError("FILE_TOO_LARGE");
      if (clean.type !== file.type) throw new CommunityError("UNSUPPORTED_MEDIA");
      // Encoding a fresh canvas discards original metadata. Never upload original bytes as a fallback.
      return {
        file: new File(
          [clean],
          "image." + (file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]),
          { type: clean.type },
        ),
      };
    } finally {
      bitmap.close();
    }
  }
  const url = URL.createObjectURL(file),
    audio = new Audio();
  try {
    const durationMs = await new Promise<number>((resolve, reject) => {
      const finish = (error?: CommunityError) => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
        if (error) reject(error);
        else resolve(Math.ceil(audio.duration * 1000));
      };
      const abort = () => finish(new CommunityError("PROCESSING_UNAVAILABLE"));
      const timer = setTimeout(() => finish(new CommunityError("MEDIA_INVALID")), 15000);
      audio.onloadedmetadata = () => finish();
      audio.onerror = () => finish(new CommunityError("MEDIA_INVALID"));
      signal?.addEventListener("abort", abort, { once: true });
      audio.preload = "metadata";
      audio.src = url;
    });
    if (!Number.isFinite(durationMs) || durationMs <= 0) throw new CommunityError("MEDIA_INVALID");
    if (durationMs > limits.limits.audioDurationMs) throw new CommunityError("AUDIO_TOO_LONG");
    signal?.throwIfAborted();
    return { file, durationMs };
  } finally {
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(url);
  }
}
