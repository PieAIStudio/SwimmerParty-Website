import assert from "node:assert/strict";
import test from "node:test";

const floorPlan = {
  spots: {
    doorway: { x: 0, z: 0 },
    toilet: { x: 0, z: 2 },
  },
  cameraSpots: {
    wide: { x: 1, z: 3 },
    close: { x: -1, z: 1 },
  },
  people: [
    { id: "dale", spotId: "doorway", heightCm: 178, build: "broad" },
    { id: "crew_brother", spotId: "toilet", build: "average" },
  ],
  props: [
    { id: "toilet_fixture", name: "toilet", at: "toilet" },
    { id: "offered_cigarette", name: "cigarette", ownerId: "crew_brother", at: "crew_brother" },
  ],
  axis: { fromSpotId: "doorway", toSpotId: "toilet", cameraSide: "right" },
};

test("directing adapter preserves a wide two-shot camera, blocking and axis", async () => {
  const { directingToSceneState } = await import("../../src/features/scene/film-adapter.ts");
  const result = directingToSceneState({
    id: "S-wide",
    shotSize: "wide",
    cameraSpot: "wide",
    target: "doorway",
    frameLeft: ["dale"],
    frameRight: ["crew_brother"],
    onScreenIds: ["dale", "crew_brother"],
    eyeLine: [{ roleId: "dale", targetId: "crew_brother", view: "low" }],
    floorPlan,
  });
  assert.deepEqual(result.scene.camera.position, [1, 1.55, 3]);
  assert.deepEqual(result.scene.camera.target, [0, 1.1, 0]);
  assert.deepEqual(
    result.scene.figures.map(({ id, x, z }) => ({ id, x, z })),
    [
      { id: "dale", x: 0, z: 0 },
      { id: "crew_brother", x: 0, z: 2 },
    ],
  );
  assert.equal(result.scene.camera.view, "low");
  const wideStage = result.scene.stage as {
    axis?: unknown;
    props?: Array<{ id: string; ownerId?: string }>;
    frame?: unknown;
  };
  assert.deepEqual(wideStage.axis, {
    from: [0, 0],
    to: [0, 2],
    cameraSide: "right",
  });
  assert.equal(wideStage.props?.length, 2);
  assert.deepEqual(wideStage.frame, {
    left: ["dale"],
    right: ["crew_brother"],
    center: [],
  });
});

test("directing adapter preserves a close single camera and data-driven pose", async () => {
  const { directingToSceneState } = await import("../../src/features/scene/film-adapter.ts");
  const result = directingToSceneState({
    id: "S-close",
    shotSize: "close",
    cameraSpot: "close",
    target: "crew_brother",
    onScreenIds: ["crew_brother"],
    eyeLine: { view: "shoulder" },
    floorPlan,
  });
  assert.deepEqual(result.scene.camera.position, [-1, 1.55, 1]);
  assert.deepEqual(result.scene.camera.target, [0, 1.1, 2]);
  assert.equal(result.scene.camera.shot, "close");
  assert.equal(result.scene.camera.view, "shoulder");
  assert.equal(result.scene.figures.length, 1);
  assert.equal(result.scene.figures[0]?.id, "crew_brother");
  assert.equal(result.scene.figures[0]?.pose, "sit");
  const closeStage = result.scene.stage as { props?: Array<{ id: string; ownerId?: string }> };
  assert.deepEqual(closeStage.props?.map(({ id, ownerId }) => ({ id, ownerId })), [
    { id: "toilet_fixture", ownerId: undefined },
    { id: "offered_cigarette", ownerId: "crew_brother" },
  ]);
});

test("directing adapter merges the MF envelope without losing per-shot camera data", async () => {
  const { directingToSceneState } = await import("../../src/features/scene/film-adapter.ts");
  const result = directingToSceneState({
    scene: { floorPlan },
    floorPlan,
    shot: {
      id: "S-envelope",
      shotSize: "medium",
      cameraSpot: "wide",
      target: "doorway",
      onScreenIds: ["dale", "crew_brother"],
      frameLeft: ["dale"],
      frameRight: ["crew_brother"],
    },
  });
  assert.deepEqual(result.scene.camera.position, [1, 1.55, 3]);
  assert.deepEqual(result.scene.figures.map(({ id }) => id), ["dale", "crew_brother"]);
});
