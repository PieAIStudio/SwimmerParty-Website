import { CommunityError } from "./errors.ts";

/** Inspect dimensions before browser decode. A conservative local safety ceiling; the server may reject more. */
export function imageDimensions(
  bytes: Uint8Array,
  mime: string,
): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.subarray(start, start + length));
  let width = 0,
    height = 0;
  if (
    mime === "image/png" &&
    bytes.length >= 33 &&
    bytes[0] === 137 &&
    ascii(1, 3) === "PNG" &&
    ascii(12, 4) === "IHDR"
  ) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (mime === "image/jpeg" && view.byteLength > 4 && view.getUint16(0) === 0xffd8) {
    let at = 2;
    while (at + 4 < bytes.length) {
      if (bytes[at++] !== 255) throw new CommunityError("MEDIA_INVALID");
      while (bytes[at] === 255) at++;
      const marker = bytes[at++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (at + 2 > bytes.length) break;
      const length = view.getUint16(at);
      if (length < 2 || at + length > bytes.length) throw new CommunityError("MEDIA_INVALID");
      if ([0xc0, 0xc1, 0xc2].includes(marker) && length >= 8) {
        height = view.getUint16(at + 3);
        width = view.getUint16(at + 5);
        break;
      }
      at += length;
    }
  } else if (
    mime === "image/webp" &&
    bytes.length >= 30 &&
    ascii(0, 4) === "RIFF" &&
    ascii(8, 4) === "WEBP"
  ) {
    const type = ascii(12, 4);
    if (type === "VP8X") {
      if (bytes[20] & 2) throw new CommunityError("UNSUPPORTED_MEDIA"); // animation is not a still reference
      width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    } else if (type === "VP8 " && bytes[23] === 0x9d && bytes[24] === 1 && bytes[25] === 0x2a) {
      width = view.getUint16(26, true) & 0x3fff;
      height = view.getUint16(28, true) & 0x3fff;
    } else if (type === "VP8L" && bytes[20] === 0x2f) {
      width = 1 + (((bytes[22] & 0x3f) << 8) | bytes[21]);
      height = 1 + (((bytes[24] & 0x0f) << 10) | (bytes[23] << 2) | (bytes[22] >> 6));
    }
  }
  if (!width || !height || width > 16384 || height > 16384 || width * height > 40000000)
    throw new CommunityError("MEDIA_INVALID");
  return { width, height };
}
