import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { messages } from "../../src/i18n/messages.source.ts";
import { licenseText } from "../../src/features/assets/export-packs.ts";

const sha256 = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");

// Owner approved these presentation-only changes on 2026-10-14.
test("license presentation matches the six approved strings exactly", () => {
  assert.deepEqual(messages["license.heroLines.0"], {
    en: "Free for personal and commercial projects.",
    zh: "个人创作、商用都免费。",
  });
  assert.deepEqual(messages["license.metaDescription"], {
    en: "Use SWIMMER PARTY’s animated actors in personal and commercial projects for free. Credit Swim In AI and follow the usage rules below.",
    zh: "SWIMMER PARTY 的动画演员可免费用于个人创作和商业项目。署名 Swim In AI，并遵守下列使用规则。",
  });
  assert.deepEqual(messages["license.intro"], {
    en: "Use our animated actors in films, ads, games, comics, music or merch under the rules below. No license fee or permission request. Credit Swim In AI where people can read it. Downloading packs requires a free Swimmer account.",
    zh: "动画演员可用于电影、广告、游戏、漫画、音乐和周边，具体规则见下方。无需支付许可费或申请许可；请在清晰可见处署名 Swim In AI。下载整包需要免费泳者账号。",
  });
});

// Baseline f45a561. These are deliberate byte-level guards: changing the license
// itself needs separate Owner approval, not a presentation-copy update.
test("License v1.0 rules, credit, FAQ, promises and starter terms stay byte-identical", async () => {
  const source = await readFile(new URL("../../src/content/license.ts", import.meta.url));
  assert.equal(sha256(source), "df72dc3732a1831ec8cfb2f08c78281cc6b5a7a34ca07bc53561f6063d272ab7");
});

test("bilingual download LICENSE.txt retains its exact pre-copy bytes", () => {
  assert.equal(
    sha256(licenseText("en")),
    "c0c328962e8a7569578f7cc872e87acce27eb68123dc388dfe74e3f012a67683",
  );
  assert.equal(
    sha256(licenseText("zh")),
    "f0ff66876b78e527e402d254fe1b5f44882e718071e36ebb552e50eb14511975",
  );
});
