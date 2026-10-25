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
    en: "Use SWIMMER PARTY’s animated actors in personal and commercial projects for free. Credit SwimInAI and follow the usage rules below.",
    zh: "SWIMMER PARTY 的动画演员可免费用于个人创作和商业项目。署名 SwimInAI，并遵守下列使用规则。",
  });
  assert.deepEqual(messages["license.intro"], {
    en: "Use our animated actors in films, ads, games, comics, music or merch under the rules below. No license fee or permission request. Credit SwimInAI where people can read it. Downloading packs requires a free Swimmer account.",
    zh: "动画演员可用于电影、广告、游戏、漫画、音乐和周边，具体规则见下方。无需支付许可费或申请许可；请在清晰可见处署名 SwimInAI。下载整包需要免费泳者账号。",
  });
});

// Baseline f45a561. These are deliberate byte-level guards: changing the license
// itself needs separate Owner approval, not a presentation-copy update.
test("License v1.0 rules, credit, FAQ, promises and starter terms stay byte-identical", async () => {
  const source = await readFile(new URL("../../src/content/license.ts", import.meta.url));
  assert.equal(sha256(source), "8893bbb6b8a6c2dd042b1a8a84e7c26db7cd09405813d08895747014ef4dd53a");
});

test("bilingual download LICENSE.txt retains its exact pre-copy bytes", () => {
  assert.equal(
    sha256(licenseText("en")),
    "d8fd8e702983e114ee30e0761741f407a9c9942c3e5cfd4a0e3807ca97d34553",
  );
  assert.equal(
    sha256(licenseText("zh")),
    "2035d3c1c3a33b625a60989a636af0360f1f79fac8e1b1284a751e1f7d35f5c3",
  );
});
