import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { imageDimensions } from "../../src/features/community/image-header.ts";
import { transferTargetSchema, mediaAccessSchema } from "../../src/contracts/community-transfer.ts";
import { CommunityError } from "../../src/features/community/errors.ts";
import {
  normalizeUploadTarget,
  normalizeMediaAccess,
} from "../../src/contracts/community-transfer.ts";
import { OP_ID, POST_ID } from "./fixtures/community-v3.ts";
for (const format of ["png", "jpeg", "webp"] as const)
  test(`pre-decode dimensions come from ${format} bytes, not file names`, async () => {
    const bytes = await sharp({
      create: { width: 24, height: 32, channels: 3, background: "white" },
    })
      .toFormat(format)
      .toBuffer();
    assert.deepEqual(imageDimensions(bytes, `image/${format}`), { width: 24, height: 32 });
    assert.throws(() => imageDimensions(bytes, "image/gif"), CommunityError);
  });
test("pixel bombs, truncated headers and animation do not reach browser decode", () => {
  const png = Buffer.alloc(40);
  png[0] = 137;
  png.write("PNG", 1);
  png.write("IHDR", 12);
  png.writeUInt32BE(16384, 16);
  png.writeUInt32BE(16384, 20);
  assert.throws(() => imageDimensions(png, "image/png"), CommunityError);
  assert.throws(() => imageDimensions(Buffer.from("not an image"), "image/png"), CommunityError);
  const webp = Buffer.alloc(32);
  webp.write("RIFF");
  webp.write("WEBP", 8);
  webp.write("VP8X", 12);
  webp[20] = 2;
  assert.throws(() => imageDimensions(webp, "image/webp"), CommunityError);
});
test("transfer capabilities never accept credential-bearing URLs, arbitrary headers or object keys", () => {
  const target = {
    url: "https://uploads.fixture.invalid/object",
    method: "PUT",
    headers: { "content-type": "image/png" },
    expiresAt: "2026-10-14T00:00:00Z",
  };
  assert(transferTargetSchema.safeParse(target).success);
  const now = Date.parse("2026-10-13T23:00:00Z");
  const raw = {
    uploadId: OP_ID,
    uploadUrl: target.url,
    uploadUrlExpiresAt: "2026-10-13T23:05:00Z",
    expiresAt: "2026-10-13T23:15:00Z",
  };
  const normalized = normalizeUploadTarget(raw, OP_ID, "image/png", now);
  assert.equal(normalized.method, "PUT");
  assert.equal(normalized.expiresAt, raw.uploadUrlExpiresAt);
  assert.equal(normalized.headers["x-upsert"], "false");
  assert.throws(() => normalizeUploadTarget(raw, POST_ID, "image/png", now));
  assert.throws(() => normalizeUploadTarget(raw, OP_ID, "image/png", now + 300001));
  assert.throws(() =>
    normalizeUploadTarget(
      { ...raw, uploadUrlExpiresAt: "2026-10-13T23:16:00Z" },
      OP_ID,
      "image/png",
      now,
    ),
  );
  const media = { mediaId: POST_ID, url: target.url, mime: "image/png", expiresInSeconds: 300 };
  assert.equal(
    Date.parse(normalizeMediaAccess(media, POST_ID, now).expiresAt),
    Date.parse(raw.uploadUrlExpiresAt),
  );
  assert.throws(() => normalizeMediaAccess(media, OP_ID, now));
  assert(
    !transferTargetSchema.safeParse({ ...target, headers: { authorization: "token" } }).success,
  );
  assert(!transferTargetSchema.safeParse({ ...target, objectKey: "private/key" }).success);
  assert(
    !transferTargetSchema.safeParse({
      ...target,
      url: "https://u:password@uploads.fixture.invalid/object",
    }).success,
  );
  assert(
    !mediaAccessSchema.safeParse({
      url: "javascript:alert(1)",
      mime: "image/png",
      expiresAt: target.expiresAt,
    }).success,
  );
});
