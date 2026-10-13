import test from "node:test";
import assert from "node:assert/strict";
import {
  actorFilterSearch,
  DEFAULT_ACTOR_FILTERS,
  filterActors,
  makeActorFacets,
  readActorFilters,
} from "../../src/features/actors/discovery.ts";
import type { Actor } from "../../src/content/actors/index.ts";
import type { Work } from "../../src/content/works.ts";
const a: Actor = {
  slug: "one",
  nameEn: "One",
  nameCn: "一",
  status: "active",
  gender: "female",
  age: 30,
  heightCm: 163,
  portrait: null,
  tagline: { en: "Quiet", zh: "安静" },
  note: { en: "Short hair, glasses", zh: "短发，眼镜" },
  promptSeed: null,
  voiceLanguage: "zh",
  spec: [{ id: "origin", label: { en: "From", zh: "来自" }, value: { en: "Town", zh: "某城" } }],
};
const b: Actor = {
  ...a,
  slug: "two",
  nameEn: "Two",
  nameCn: "二",
  age: 46,
  heightCm: undefined,
  voiceLanguage: "en",
  status: "new-face",
  note: { en: "Long hair", zh: "长发" },
};
const work: Work = {
  slug: "story",
  code: "test",
  title: { en: "Story", zh: "故事" },
  status: "development",
  format: { en: "Comedy", zh: "喜剧" },
  cast: [{ actor: "one", role: { id: "boss", name: { en: "CEO", zh: "总裁" } } }],
};
const facets = makeActorFacets(
  [a, b],
  { one: [{ kind: "voice" }] },
  [{ slug: "one", video: "/sample.mp4" }],
  [work],
);

test("URL filters round trip and preserve foreign query state", () => {
  const f = { ...DEFAULT_ACTOR_FILTERS, q: "One", origin: "Town", voice: true, role: "boss" };
  const search = actorFilterSearch(f, "ref=shared&age=over45");
  assert.equal(new URLSearchParams(search).get("ref"), "shared");
  assert.deepEqual(readActorFilters(search, ["Town"]), f);
  assert.equal(actorFilterSearch(DEFAULT_ACTOR_FILTERS, search), "ref=shared");
});
test("invalid, repeated and overlong inputs have bounded deterministic defaults", () => {
  const f = readActorFilters(
    `q=${"a".repeat(150)}&role=unknown&origin=unknown&voice=true&gender=male&gender=female`,
    ["Town"],
  );
  assert.equal(f.q.length, 120);
  assert.equal(f.role, "all");
  assert.equal(f.origin, "all");
  assert.equal(f.voice, false);
  assert.equal(f.gender, "male");
});
test("media availability reflects actual files and approved associations, not planned language", () => {
  assert.equal(facets.one.voice, true);
  assert.equal(facets.one.video, true);
  assert.equal(facets.two.voice, false);
  assert.equal(facets.two.video, false);
});
test("role cues reflect authored credits, not appearance guesses", () => {
  assert.deepEqual(facets.one.roles, ["comedy", "boss"]);
  assert.deepEqual(facets.two.roles, []);
});
test("name, origin and appearance search use authored text in both locales", () => {
  assert.deepEqual(
    filterActors([a, b], facets, { ...DEFAULT_ACTOR_FILTERS, look: "眼镜" }).map((x) => x.slug),
    ["one"],
  );
  assert.deepEqual(
    filterActors([a, b], facets, {
      ...DEFAULT_ACTOR_FILTERS,
      q: "One Town",
      look: "short glasses",
    }).map((x) => x.slug),
    ["one"],
  );
});
test("filters intersect rather than broadening a zero-result query", () => {
  assert.deepEqual(
    filterActors([a, b], facets, {
      ...DEFAULT_ACTOR_FILTERS,
      role: "boss",
      voice: true,
      language: "en",
    }),
    [],
  );
});
test("age and height boundaries preserve unknown height instead of inventing it", () => {
  assert.deepEqual(
    filterActors([a, b], facets, {
      ...DEFAULT_ACTOR_FILTERS,
      age: "30to45",
      height: "160to179",
    }).map((x) => x.slug),
    ["one"],
  );
  assert.deepEqual(
    filterActors([a, b], facets, { ...DEFAULT_ACTOR_FILTERS, height: "180plus" }),
    [],
  );
});
test("unknown facets fail closed when availability is requested", () => {
  assert.deepEqual(filterActors([a], {}, { ...DEFAULT_ACTOR_FILTERS, voice: true }), []);
  assert.deepEqual(filterActors([a], {}, DEFAULT_ACTOR_FILTERS), [a]);
});
