import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The "?" help card's clips are recorded by tools/help-clips; this checks what the site ships.
const HELP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public/help");
const CAP_BYTES = 300 * 1024;
const LOCALES = ["zh", "en"];
const TOPICS = ["starter", "sheet", "cast"];

for (const locale of LOCALES)
  for (const topic of TOPICS)
    test(`${locale}/${topic} ships webm, mp4 and a WebP poster under the size cap`, () => {
      const webm = readFileSync(path.join(HELP, locale, `${topic}.webm`));
      const mp4 = readFileSync(path.join(HELP, locale, `${topic}.mp4`));
      const poster = readFileSync(path.join(HELP, locale, `${topic}-poster.webp`));
      assert.equal(webm.readUInt32BE(0), 0x1a45dfa3, "webm starts with the EBML header");
      assert.equal(mp4.subarray(4, 8).toString("latin1"), "ftyp", "mp4 has an ftyp box");
      assert.equal(poster.subarray(0, 4).toString("latin1"), "RIFF");
      assert.equal(poster.subarray(8, 12).toString("latin1"), "WEBP");
      for (const file of [`${topic}.webm`, `${topic}.mp4`, `${topic}-poster.webp`]) {
        const { size } = statSync(path.join(HELP, locale, file));
        assert.ok(size > 0 && size <= CAP_BYTES, `${locale}/${file} is ${size} bytes`);
      }
    });

test("public/help holds exactly the clips and posters the card names", () => {
  for (const locale of LOCALES) {
    const expected = TOPICS.flatMap((topic) => [
      `${topic}.webm`,
      `${topic}.mp4`,
      `${topic}-poster.webp`,
    ]).sort();
    assert.deepEqual(readdirSync(path.join(HELP, locale)).sort(), expected, locale);
  }
});
