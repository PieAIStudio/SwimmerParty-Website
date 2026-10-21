import test from "node:test";
import assert from "node:assert/strict";
import { loadSignedImages } from "../../src/features/assets/signed-images.ts";

const image = () => new Response(new Uint8Array([1, 2, 3]), {
  headers: { "content-type": "image/png" },
});

test("a 70-file image-and-voice bundle signs in groups of 64 and counts each saved file", async (context) => {
  const all = Array.from({ length: 70 }, (_, index) => ({
    slot: index === 69 ? "voice.intro" : `image.${index}`,
    filename: index === 69 ? "intro.mp3" : `image-${index}.png`,
    kind: index === 69 ? ("audio" as const) : ("image" as const),
  }));
  const requests: string[][] = [];
  const steps: { completed: number; total: number }[] = [];
  context.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    if (url.includes("/bundle")) {
      const slots = (JSON.parse(String(init?.body)) as { slots: string[] }).slots;
      requests.push(slots);
      return Response.json({
        items: slots.map((slot) => ({
          slot,
          url: `https://fixture.invalid/${slot}`,
          filename: all.find((item) => item.slot === slot)!.filename,
        })),
      });
    }
    return new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": url.endsWith("voice.intro") ? "audio/mpeg" : "image/png" },
    });
  });
  const files = await loadSignedImages("fixture", all, {
    onProgress: (progress) => steps.push(progress),
  });
  assert.deepEqual(requests.map((group) => group.length), [64, 6]);
  assert.equal(files.length, 70);
  assert.equal(files.at(-1)?.blob.type, "audio/mpeg");
  assert.deepEqual(steps[0], { completed: 0, total: 70 });
  assert.deepEqual(steps.at(-1), { completed: 70, total: 70 });
  assert.equal(steps.length, 71);
});

test("a bad signature group or a wrong voice MIME fails closed", async (context) => {
  const all = Array.from({ length: 65 }, (_, index) => ({
    slot: `item-${index}`, kind: ("image" as const),
  }));
  let downloads = 0;
  const mock = context.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    if (!url.includes("/bundle")) {
      downloads++;
      return image();
    }
    const slots = (JSON.parse(String(init?.body)) as { slots: string[] }).slots;
    return Response.json({
      items: slots.slice(0, slots.length === 1 ? 0 : slots.length).map((slot) => ({
        slot, url: `https://fixture.invalid/${slot}`, filename: `${slot}.png`,
      })),
    });
  });
  const steps: unknown[] = [];
  await assert.rejects(
    loadSignedImages("fixture", all, { onProgress: (value) => steps.push(value) }),
    /Invalid signed bundle/,
  );
  assert.equal(downloads, 0);
  assert.deepEqual(steps, []);

  mock.mock.mockImplementation(async (url: string) => {
    if (url.includes("/bundle")) {
      return Response.json({
        items: [{ slot: "voice.intro", filename: "intro.mp3", url: "https://fixture.invalid/audio" }],
      });
    }
    return image();
  });
  await assert.rejects(
    loadSignedImages("fixture", [{ slot: "voice.intro", kind: "audio" }]),
    /Invalid audio response/,
  );
});
