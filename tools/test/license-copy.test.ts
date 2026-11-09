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
    en: "Free for personal and paid work.",
    zh: "自己用、赚钱用都免费。",
  });
  assert.deepEqual(messages["license.metaDescription"], {
    en: "Use SWIMMER PARTY’s animated actors for free in personal and paid work. Credit SwimInAI and follow the rules below.",
    zh: "SWIMMER PARTY 的动画演员可免费用于个人和赚钱项目。写上 SwimInAI，并遵守下面的简单规则。",
  });
  assert.deepEqual(messages["license.intro"], {
    en: "Use our actors free in films, ads, games, comics, music and merch. No need to ask. Just credit SwimInAI.",
    zh: "电影、广告、游戏、漫画、音乐、周边，都能免费用，不用申请。记得署名 SwimInAI。",
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
