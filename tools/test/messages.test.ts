import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { messages } from "../../src/i18n/messages.source.ts";

test("message catalogs are regenerated from messages.source.ts", () => {
  for (const [language, directory] of [
    ["en", "en"],
    ["zh", "zh-CN"],
  ] as const) {
    const catalog = JSON.parse(readFileSync(`messages/${directory}/messages.json`, "utf8"));
    const expected = Object.fromEntries(
      Object.entries(messages).map(([key, pair]) => [key, pair[language]]),
    );
    assert.deepEqual(catalog, expected, `run pnpm messages:generate (${directory})`);
  }
});

import { analyzeMessages } from "../site/message-analysis.ts";
import { checkMessages } from "../site/check-messages.ts";

const translator = `
  declare function useSiteI18n(): { t: (key: string, args?: unknown) => string };
  const { t } = useSiteI18n();
`;
const analyzeFixture = (body: string, keys: string[], extra: Record<string, string> = {}) =>
  analyzeMessages({ sources: { "src/site/Fixture.tsx": translator + body, ...extra }, keys });

test("every authored message has a runtime consumer and UI has no inline bilingual copy", () => {
  const result = checkMessages();
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.unused, []);
});

test("only translation calls consume keys; generated files, tests, comments and docs do not", () => {
  const result = analyzeFixture(
    `
    t("used");
    // t("comment");
    const incidental = "incidental";
    const { t: message } = useSiteI18n();
    message("alias");
    function unrelated(t: (key: string) => string) { t("unrelated"); }
  `,
    ["used", "alias", "comment", "incidental", "source", "generated", "test", "doc", "unrelated"],
    {
      "src/i18n/messages.source.ts": translator + `t("source");`,
      "src/i18n/message-contracts.ts": translator + `t("generated");`,
      "src/i18n/catalog.ts": translator + `t("generated");`,
      "src/i18n/example.generated.ts": translator + `t("generated");`,
      "src/site/example.test.tsx": translator + `t("test");`,
      "src/site/fixtures/example.tsx": translator + `t("test");`,
      "docs/example.md": `t("doc");`,
    },
  );
  assert.deepEqual([...result.used].sort(), ["alias", "used"]);
  assert.deepEqual(result.issues, []);
});

test("finite loops, imported data unions and conditional keys protect only their actual members", () => {
  const keys = [
    "home.0",
    "home.1",
    "belief.0.title",
    "belief.1.title",
    "nav.actors",
    "nav.license",
    "yes",
    "no",
    "home.99",
  ];
  const result = analyzeFixture(
    `
    import { nav } from "./navigation-data";
    (["home.0", "home.1"] as const).map((key) => t(key));
    ([0, 1] as const).map((index) => t(\`belief.\${index}.title\`));
    nav.map((item) => t(\`nav.\${item.key}\`));
    declare const flag: boolean;
    t(flag ? "yes" : "no");
  `,
    keys,
    {
      "src/site/navigation-data.ts": `export const nav = [{key: "actors"}, {key: "license"}] as const;`,
    },
  );
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.unused, ["home.99"]);
  assert.equal(result.dynamicEvidence.length, 4);
});

test("unbounded dynamic strings and unsafe casts cannot mark a catalog as consumed", () => {
  const result = analyzeFixture(
    `
    declare const external: string;
    t(external as "one");
    const assertedAlias = external as "two";
    t(assertedAlias);
    t(\`prefix.\${external}\`);
    declare const allKeys: "one" | "two" | "three";
    t(allKeys);
  `,
    ["one", "two", "three"],
  );
  assert.equal(result.issues.length, 4);
  assert.deepEqual([...result.used], []);
});

test("unknown static and finite dynamic keys fail instead of widening allowances", () => {
  const result = analyzeFixture(`t("missing"); ([0, 1] as const).map((i) => t(\`item.\${i}\`));`, [
    "item.0",
    "spare",
  ]);
  assert.deepEqual(
    result.issues.map((issue) => issue.message),
    ["Unknown message key: missing", "Unknown message key: item.1"],
  );
});

test("inline copy check covers reversed locale comparisons, arrays, fragments, bilingual objects and prompts", () => {
  const samples = [
    `declare const locale: string; const x = locale === "zh" ? "你好" : "Hello";`,
    `declare const loc: string; const x = "en" === loc ? "Hello" : "Hi";`,
    `declare const lang: string; const x = lang === "zh" ? ["AI 演员"] : ["AI actor"];`,
    `declare const locale: string; const x = locale === "zh" ? <>随便用，<br />署名。</> : <>Use them.<br />Credit.</>;`,
    `const x = { en: "Hello", zh: "Hi" };`,
    `const x = <option>Image · 图片</option>;`,
    `const x = <button label="English" />;`,
    `alert("登录后参与"); confirm("删除作品？");`,
  ];
  // One fixture/program; each line must produce a focused diagnostic.
  const result = analyzeFixture(
    samples.map((sample, index) => `{ /* case ${index} */ ${sample} }`).join("\n"),
    ["spare"],
  );
  for (let index = 0; index < samples.length; index++) {
    assert.ok(
      result.issues.some((issue) => issue.line === index + translator.split("\n").length),
      `missed inline copy case ${index}`,
    );
  }
});

test("content field selectors, legal body selectors and translated key branches remain valid data", () => {
  const result = analyzeFixture(
    `
    declare const locale: "en" | "zh";
    declare const actor: { nameCn: string; nameEn: string };
    declare const legal: { bodyZh: string; bodyEn: string };
    declare const slugs: string[];
    const name = locale === "zh" ? actor.nameCn : actor.nameEn;
    const body = locale === "zh" ? legal.bodyZh : legal.bodyEn;
    const joined = locale === "zh" ? slugs.join("、") : slugs.join(", ");
    t(locale === "zh" ? "language.zh" : "language.en");
    const runtime = locale === "zh" ? "zh-CN" : "en";
    const canvas = <div data-active={true ? "always" : "never"}>{name}{body}{joined}</div>;
  `,
    ["language.zh", "language.en", "spare"],
  );
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.unused, ["spare"]);
});

test("slot allowances derive finite camelCase members from the vocabulary and actual helper reference", () => {
  const sources = {
    "src/site/Fixture.tsx":
      translator +
      `
    import { slotLabelKey } from "@/features/assets/asset-series";
    declare const slot: string;
    t(slotLabelKey("voice", slot));
  `,
  };
  const vocabulary = JSON.parse(readFileSync("src/content/asset-series.json", "utf8"));
  const keys = [
    "assets.voice.intro",
    "assets.voice.introAlt",
    "assets.voice.chat",
    "assets.voice.happy",
    "assets.voice.angry",
    "assets.voice.sad",
    "assets.voice.roleMaid",
    "assets.voice.roleCeo",
    "assets.voice.role-maid",
    "assets.voice.unregistered",
    "spare",
  ];
  const result = analyzeMessages({ sources, keys, vocabulary });
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.unused, ["assets.voice.role-maid", "assets.voice.unregistered", "spare"]);
  assert.match(result.dynamicEvidence[0].reference, /asset-series.ts#slotLabelKey/);
  const noReference = analyzeMessages({
    sources: { "src/site/Fixture.tsx": translator + `const unused = "assets.voice.roleMaid";` },
    keys,
    vocabulary,
  });
  assert.equal(noReference.used.size, 0, "vocabulary alone is not a consumer");
});

test("translator object calls and imported factory aliases are AST consumers", () => {
  const result = analyzeFixture(
    `
    import { useSiteI18n as useMessages } from "@/i18n/client";
    const i18n = useMessages();
    i18n.t("one");
    const { t: translated } = i18n;
    translated("two");
    const alias = i18n.t;
    alias("three");
  `,
    ["one", "two", "three", "spare"],
  );
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.unused, ["spare"]);
});

test("slot source drift invalidates the allowance instead of trusting its catalog-derived cast", () => {
  const original = readFileSync("src/features/assets/asset-series.ts", "utf8");
  const result = analyzeMessages({
    sources: {
      "src/site/Fixture.tsx":
        translator +
        `
        import { slotLabelKey } from "@/features/assets/asset-series";
        declare const slot: string;
        t(slotLabelKey("voice", slot));
      `,
      "src/features/assets/asset-series.ts": original.replace(
        "`assets.${seriesId}.${camel}`",
        "`changed.${seriesId}.${camel}`",
      ),
    },
    keys: ["assets.voice.intro", "assets.slot.turnaround.front", "spare"],
    vocabulary: JSON.parse(readFileSync("src/content/asset-series.json", "utf8")),
  });
  assert.equal(result.used.size, 0);
  assert.equal(result.issues.length, 1);
  assert.match(result.issues[0].message, /Unresolved/);
});
