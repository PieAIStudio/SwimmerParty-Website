import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TOOL_TUTORIALS } from "../../src/content/tutorials.ts";
import { WORKFLOW_STEPS } from "../../src/features/guide/workflows.ts";

test("Learn starts with five unique tool workflows and separate evidence fields", () => {
  assert.deepEqual(TOOL_TUTORIALS.map((t) => t.id).sort(), [
    "gemini",
    "grok",
    "midjourney",
    "runway",
    "veo",
  ]);
  for (const tutorial of TOOL_TUTORIALS) {
    assert.match(tutorial.sourceCheckedAt, /^\d{4}-\d{2}-\d{2}$/);
    if (tutorial.reproducedAt) {
      assert.match(tutorial.reproducedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(tutorial.reproductionEvidence, tutorial.caseStudy?.sampleId);
    } else assert.equal(tutorial.reproductionEvidence, null);
    assert.ok(tutorial.steps.length >= 3 && tutorial.steps.length <= 5);
    for (const locale of ["en", "zh"] as const) {
      assert.ok(tutorial.prompt[locale].length > 30);
      assert.ok(tutorial.access[locale].length > 20);
      assert.ok(tutorial.steps.every((step) => step[locale].trim()));
    }
  }
});

test("the internal verification list tracks every unfinished tool guide, but visitors see no draft badge", async () => {
  const internal = JSON.parse(
    await readFile(
      new URL("./fixtures/tutorial-reproduction-internal.json", import.meta.url),
      "utf8",
    ),
  ) as { pending: { id: string; reproduced: boolean }[] };
  assert.deepEqual(
    internal.pending.map((item) => item.id).sort(),
    TOOL_TUTORIALS.filter((item) => item.reproducedAt === null)
      .map((item) => item.id)
      .sort(),
  );
  assert.ok(internal.pending.every((item) => item.reproduced === false));
  for (const name of ["GuideView.tsx", "ToolGuideView.tsx"]) {
    const source = await readFile(
      new URL("../../src/features/guide/" + name, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, /learn\.draft|reproductionPending|data-reproduction-status/);
  }
  const tested = TOOL_TUTORIALS.filter((tutorial) => tutorial.reproducedAt !== null);
  assert.deepEqual(
    tested.map((tutorial) => tutorial.id),
    ["grok"],
  );
  assert.equal(tested[0].caseStudy?.actorSlug, "liu-dan");
  assert.match(tested[0].caseStudy?.result.en ?? "", /medium shot/);
  assert.match(tested[0].access.en, /CLI.*not the web/);
});
test("tutorial sources and entry links use official HTTPS origins", () => {
  const hosts = new Set([
    "support.google.com",
    "help.runwayml.com",
    "docs.midjourney.com",
    "docs.x.ai",
    "x.ai",
    "labs.google",
    "gemini.google.com",
    "www.midjourney.com",
    "app.runwayml.com",
    "grok.com",
  ]);
  for (const t of TOOL_TUTORIALS)
    for (const value of [t.entry, ...t.sources.map((s) => s.url)]) {
      const url = new URL(value);
      assert.equal(url.protocol, "https:");
      assert.ok(hosts.has(url.hostname));
      assert.equal(url.username + url.password + url.port, "");
    }
});
test("all three local workflows have three explicit actions", () => {
  assert.deepEqual(Object.keys(WORKFLOW_STEPS), ["starter", "sheet", "cast"]);
  for (const steps of Object.values(WORKFLOW_STEPS)) assert.equal(steps.length, 3);
});
test("only recorded tests can be indexed; unverified guides have no result", async () => {
  const route = await readFile(
    new URL("../../src/app/[locale]/guide/tools/[tool]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(route, /index:\s*tutorial\.reproducedAt !== null/);
  for (const tutorial of TOOL_TUTORIALS.filter((item) => !item.reproducedAt))
    assert.equal(tutorial.caseStudy, undefined);
});
