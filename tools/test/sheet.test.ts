import test from "node:test";
import assert from "node:assert/strict";
import { strFromU8, unzipSync, zipSync } from "fflate";
import { getActorAssets } from "../../src/features/assets/assets.ts";
import { fitSheetSlots, sheetHref, SHEET_MAX_IMAGES } from "../../src/features/assets/contracts.ts";
import {
  availablePresets,
  canMakeSheet,
  presetSlots,
  SHEET_MIN_IMAGES,
} from "../../src/features/sheet/sheet-presets.ts";
import {
  readSheetState,
  sheetSearch,
  DEFAULT_SHEET_STATE,
  type SheetState,
} from "../../src/features/sheet/sheet-state.ts";
import { sheetBundleFiles, sheetReadme } from "../../src/features/sheet/sheet-bundle.ts";

const tang = getActorAssets("tang-yunqiu");
const agnes = getActorAssets("agnes-lefevre");
// What the page passes to the state reader: the manifest plus whether a prompt exists.
const tangSheet = { ...tang, hasPrompt: true };
const tangNoPrompt = { ...tang, hasPrompt: false };
const agnesSheet = { ...agnes, hasPrompt: false };
const EXPRESSIONS = [
  "neutral",
  "smile",
  "laugh",
  "sad",
  "cry",
  "annoyed",
  "angry",
  "surprised",
  "scared",
  "disgusted",
  "embarrassed",
  "tired",
].map((key) => `expression.${key}`);

/** A small invented library for rules that need exact shapes, not a real actor. */
function item(
  series: string,
  key: string,
  look: string | null = null,
  kind: "image" | "voice" | "video" = "image",
) {
  const slot = [series, ...(look ? [look] : []), key].join(".");
  return { slot, kind, series, key, look };
}

test("recommended, turnaround, expressions and wardrobe resolve to the slots the actor has", () => {
  assert.deepEqual(presetSlots("recommended", tang.items, tang.looks), [
    "turnaround.front",
    "turnaround.three-quarter",
    "turnaround.side",
    "turnaround.back",
    "face.front",
    "face.three-quarter",
    "expression.smile",
    "expression.angry",
    "expression.sad",
    "expression.surprised",
  ]);
  assert.deepEqual(
    presetSlots("turnaround", tang.items, tang.looks),
    tang.items.filter((entry) => entry.series === "turnaround").map((entry) => entry.slot),
  );
  assert.equal(presetSlots("turnaround", tang.items, tang.looks).length, 6);
  assert.deepEqual(presetSlots("expressions", tang.items, tang.looks), EXPRESSIONS);
  assert.deepEqual(presetSlots("wardrobe", tang.items, tang.looks), [
    "wardrobe.personal.front",
    "wardrobe.maid.front",
  ]);
  assert.deepEqual(presetSlots("custom", tang.items, tang.looks), []);
});

test("a preset drops slots the actor does not have and a look without a front uses its first outfit", () => {
  const library = [
    item("turnaround", "front"),
    item("expression", "smile"),
    item("wardrobe", "side", "a"),
    item("wardrobe", "back", "a"),
    item("wardrobe", "front", "b"),
  ];
  const looks = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(presetSlots("recommended", library, looks), [
    "turnaround.front",
    "expression.smile",
  ]);
  assert.deepEqual(presetSlots("expressions", library, looks), ["expression.smile"]);
  // Look a has no front, so its first outfit image stands in; look c has no outfit at all.
  assert.deepEqual(presetSlots("wardrobe", library, looks), ["wardrobe.a.side", "wardrobe.b.front"]);
});

test("presets with nothing to show are hidden, while custom is always offered", () => {
  assert.deepEqual(availablePresets(tang.items, tang.looks), [
    "recommended",
    "turnaround",
    "expressions",
    "wardrobe",
    "custom",
  ]);
  // The single-photo actor has no expressions and no looks, so those presets never appear.
  assert.deepEqual(availablePresets(agnes.items, agnes.looks), [
    "recommended",
    "turnaround",
    "custom",
  ]);
  assert.deepEqual(availablePresets([], []), ["custom"]);
});

test("the sheet page needs at least four images in the library", () => {
  assert.equal(SHEET_MIN_IMAGES, 4);
  assert.equal(canMakeSheet(tang.items), true);
  assert.equal(canMakeSheet(agnes.items), false);
  const three = [item("turnaround", "front"), item("face", "front"), item("face", "side")];
  assert.equal(canMakeSheet(three), false);
  assert.equal(canMakeSheet([...three, item("expression", "smile")]), true);
  assert.equal(canMakeSheet([...three, item("voice", "intro", null, "voice")]), false);
});

test("limits: at most 16 images and at most 8 full-body, skipping what does not fit", () => {
  const poses = Array.from({ length: 12 }, (_, index) => item("pose", `p${index + 1}`));
  const heads = Array.from({ length: 8 }, (_, index) => item("expression", `e${index + 1}`));
  const library = [...poses, ...heads];
  const picked = fitSheetSlots(
    library.map((entry) => entry.slot),
    library,
  );
  assert.equal(picked.length, SHEET_MAX_IMAGES);
  assert.deepEqual(
    picked.filter((slot) => slot.startsWith("pose.")),
    poses.slice(0, 8).map((entry) => entry.slot),
  );
  assert.equal(picked.filter((slot) => slot.startsWith("expression.")).length, 8);
  // Unknown, duplicate and non-image entries never count against the limits.
  const voice = item("voice", "intro", null, "voice");
  assert.deepEqual(
    fitSheetSlots(["nope", voice.slot, "pose.p1", "pose.p1", "expression.e1"], [...library, voice]),
    ["pose.p1", "expression.e1"],
  );
});

test("the member dialog link carries only images, in order, within the limits", () => {
  const picks = [item("voice", "intro", null, "voice"), ...tang.items.slice(0, 20)];
  const href = sheetHref("tang-yunqiu", picks);
  const slots = href.split("slots=")[1].split(",");
  assert.equal(href.startsWith("/actors/tang-yunqiu/sheet?preset=custom&slots="), true);
  assert.equal(slots.length, SHEET_MAX_IMAGES);
  assert.equal(slots.includes("voice.intro"), false);
});

test("custom picks from a link open with exactly those images ticked", () => {
  const state = readSheetState(
    "?preset=custom&slots=turnaround.front,face.front,expression.smile", tangSheet);
  assert.equal(state.preset, "custom");
  assert.deepEqual(state.slots, ["turnaround.front", "face.front", "expression.smile"]);
});

test("invalid URL values are ignored and the default preset stands in", () => {
  const state = readSheetState(
    "?preset=bogus&labels=xx&bg=red&voice=1&video=1&prompt=1&slots=nope",
    agnesSheet,
  );
  assert.deepEqual(state, { ...DEFAULT_SHEET_STATE, voice: true });
  // A preset this actor cannot show falls back; slots only matter for custom.
    assert.equal(readSheetState("?preset=wardrobe", agnesSheet).preset, "recommended");
  assert.deepEqual(readSheetState("?preset=expressions&slots=turnaround.front", agnesSheet).slots, []);
  assert.deepEqual(readSheetState("?preset=custom&slots=,,", tangSheet).slots, []);
  assert.deepEqual(
    readSheetState("?preset=custom&slots=face.front,face.front,voice.intro", tangSheet).slots,
    ["face.front"],
  );
  // Media flags only apply where the actor has that kind and a prompt exists.
  assert.equal(readSheetState("?video=1", tangSheet).video, false);
  assert.equal(readSheetState("?prompt=1", tangNoPrompt).prompt, false);
  assert.equal(readSheetState("?prompt=1", tangSheet).prompt, true);
});

test("the URL round trip restores every state exactly", () => {
  // An invented actor with a video clip, so every media flag can be restored.
  const actor = {
    items: [...tang.items, item("video", "walk", null, "video")],
    looks: tang.looks,
    hasPrompt: true,
  };
  const states: SheetState[] = [
    DEFAULT_SHEET_STATE,
    { ...DEFAULT_SHEET_STATE, preset: "expressions", labels: "en", background: "dark" },
    {
      ...DEFAULT_SHEET_STATE,
      preset: "custom",
      slots: ["turnaround.front", "face.front", "expression.smile"],
      labels: "zh",
      background: "white",
      voice: true,
      prompt: true,
    },
    { ...DEFAULT_SHEET_STATE, preset: "custom", slots: [], video: true },
  ];
  for (const state of states) {
    const search = sheetSearch(state);
    assert.deepEqual(readSheetState(search, actor), state, search);
  }
  assert.equal(
    sheetSearch({
      ...DEFAULT_SHEET_STATE,
      preset: "custom",
      slots: ["turnaround.front", "face.front"],
    }),
    "?preset=custom&slots=turnaround.front,face.front",
  );
  assert.equal(sheetSearch(DEFAULT_SHEET_STATE), "?preset=recommended");
});

test("the readme is the shipped text, with the actor's names and slug filled in", () => {
  assert.equal(
    sheetReadme({ slug: "demo-actor", nameEn: "Demo Actor", nameCn: "演示演员" }),
    [
      "SWIMMER PARTY · Demo Actor",
      "1. Upload demo-actor_sheet.png to your image or video tool as the character reference.",
      "2. Voice and video files are references for voice and motion tools.",
      "3. Credit: Demo Actor · Swim In AI",
      "",
      "SWIMMER PARTY · 演示演员",
      "1. 把 demo-actor_sheet.png 作为角色参考图上传到你的图像或视频工具。",
      "2. 声音和视频文件给配音、动作类工具做参考。",
      "3. 署名：演示演员 · Swim In AI",
      "",
    ].join("\n"),
  );
});

test("a sheet ZIP holds the picture, media under voice/ and video/, and the optional prompt and profile", () => {
  const bytes = new Uint8Array([1, 2, 3]);
  const common = {
    sheetName: "demo_sheet.png",
    sheet: bytes,
    license: "LICENSE",
    readme: "README",
  };
  const withExtras = sheetBundleFiles({
    ...common,
    media: [
      { folder: "voice", name: "demo__voice__intro.wav", bytes },
      { folder: "video", name: "demo__video__walk.mp4", bytes },
    ],
    prompt: "prompt\n",
    profile: "{}\n",
  });
  const packed = unzipSync(zipSync(withExtras, { level: 0 }));
  assert.deepEqual(Object.keys(packed).sort(), [
    "LICENSE.txt",
    "README.txt",
    "character.json",
    "demo_sheet.png",
    "prompt.txt",
    "video/demo__video__walk.mp4",
    "voice/demo__voice__intro.wav",
  ]);
  assert.equal(strFromU8(packed["prompt.txt"]), "prompt\n");
  // Without the extras, only the picture and the license and readme remain.
  const plain = sheetBundleFiles({ ...common, media: [] });
  assert.deepEqual(Object.keys(plain).sort(), ["LICENSE.txt", "README.txt", "demo_sheet.png"]);
});
