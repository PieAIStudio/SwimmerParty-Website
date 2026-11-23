import assert from "node:assert/strict";
import test from "node:test";

import { PerspectiveCamera, Vector3 } from "three";
import type { SceneState } from "../../src/features/scene/model.ts";

function assertFivePercentPairMargin(scene: SceneState) {
  const shot = scene.camera;
  const lens = new PerspectiveCamera(
    (2 * Math.atan(shot.sensorWidth / (2 * shot.lens * (16 / 9))) * 180) / Math.PI,
    16 / 9,
    0.05,
    1000,
  );
  lens.position.set(...shot.position);
  lens.lookAt(new Vector3(...shot.target));
  lens.updateMatrixWorld(true);
  for (const person of scene.figures) {
    const sitting = person.pose === "sit";
    const height = person.heightCm / 100;
    const low = sitting ? 0.32 : 0.4;
    const high = sitting ? Math.max(1.1, height * 0.78) : height + 0.08;
    for (const x of [person.x - 0.38, person.x + 0.38])
      for (const y of [low, high])
        for (const z of [person.z - 0.38, person.z + 0.38]) {
          const projected = new Vector3(x, y, z).project(lens);
          assert.ok(
            Math.abs(projected.x) <= 0.9 && Math.abs(projected.y) <= 0.9,
            `${person.id}: camera must keep head-to-knee body box 5% inside frame`,
          );
        }
  }
}

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
  assertFivePercentPairMargin(result.scene);
  assert.ok(result.scene.camera.position[0] > result.scene.camera.target[0]);
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

test("door eyeline resolves a finite third coordinate, never an invisible actor", async () => {
  const { directingToSceneState } = await import("../../src/features/scene/film-adapter.ts");
  const result = directingToSceneState({
    id: "door-target",
    shotSize: "medium",
    cameraSpot: "close",
    onScreenIds: ["dale"],
    eyeLine: [{ roleId: "dale", targetId: "bathroom_door" }],
    floorPlan: {
      ...floorPlan,
      props: [{ id: "bathroom_door", name: "door", at: "doorway" }],
    },
  });
  assert.equal(result.scene.figures.length, 1);
  assert.ok(Number.isFinite(result.scene.figures[0].turn));
  const props = (result.scene.stage as { props: Array<{ position: number[] }> }).props;
  assert.deepEqual(props[0].position, [0, 1.2, 0]);
});

test("single dialogue shots resolve the offscreen partner without drawing that partner", async () => {
  const { directingToSceneState } = await import("../../src/features/scene/film-adapter.ts");
  for (const [visible, partner, yaw] of [
    ["crew_brother", "dale", 180],
    ["dale", "crew_brother", 0],
  ] as const) {
    const { scene } = directingToSceneState({
      id: `dialogue-${visible}`,
      cast: {
        dale: { name: "Role A", actorSlug: "actor-a" },
        crew_brother: { name: "Role B", actorSlug: "actor-b" },
      },
      shotSize: "close",
      cameraSpot: "close",
      frameCenter: [visible],
      onScreenIds: [visible],
      eyeLine: [{ roleId: visible, targetId: partner }],
      floorPlan,
    });
    assert.deepEqual(
      scene.figures.map((figure) => figure.id),
      [visible],
    );
    assert.equal(scene.figures[0].turn, yaw);
    assert.equal(scene.figures[0].actorSlug, visible === "dale" ? "actor-a" : "actor-b");
    assert.deepEqual(
      [scene.figures[0].x, scene.figures[0].z],
      visible === "dale" ? [0, 0] : [0, 2],
    );
    const stage = scene.stage as {
      eyeTargets: Array<{ roleId: string; targetId: string }>;
      props: Array<{ id: string; ownerId?: string }>;
    };
    assert.deepEqual(stage.eyeTargets, [{ roleId: visible, targetId: partner }]);
    assert.ok(stage.props.every((prop) => !prop.ownerId || prop.ownerId === visible));
  }
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
  assert.deepEqual(
    closeStage.props?.map(({ id, ownerId }) => ({ id, ownerId })),
    [
      { id: "toilet_fixture", ownerId: undefined },
      { id: "offered_cigarette", ownerId: "crew_brother" },
    ],
  );
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
  assertFivePercentPairMargin(result.scene);
  assert.deepEqual(
    result.scene.figures.map(({ id }) => id),
    ["dale", "crew_brother"],
  );

});

test("pose keywords stay on the person's blocking instead of bleeding from shot staging", async () => {
  const { directingToSceneState } = await import("../../src/features/scene/film-adapter.ts");
  const result = directingToSceneState({
    id: "pose-isolation",
    staging: "制片单膝跪地递药，戴尔仍站在桌边",
    floorPlan: {
      spots: { dale: { x: -1, z: 0 }, producer: { x: 1, z: 0 } },
      people: [
        { id: "dale", spotId: "dale", blocking: { pose: "stand" } },
        { id: "producer", spotId: "producer", blocking: { pose: "kneel", description: "右手递药盒" } },
      ],
    },
    onScreenIds: ["dale", "producer"],
  });
  assert.deepEqual(result.scene.figures.map(({ id, pose }) => ({ id, pose })), [
    { id: "dale", pose: "stand" },
    { id: "producer", pose: "kneel-and-reach" },
  ]);
});