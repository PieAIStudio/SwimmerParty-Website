import { settingDraftSchema } from "../settings/contracts.ts";
import { fitFilmPeople } from "./film-framing.ts";
import { fitCamera, type FigureState, type FilmStageState, type SceneState } from "./model.ts";
type DirectingPoint = {
  x?: number;
  z?: number;
  y?: number;
  position?: { x?: number; z?: number; y?: number };
  [key: string]: unknown;
};

export type DirectingShot = {
  id?: string;
  shotId?: string;
  sceneId?: string;
  shotSize?: string;
  cameraHeight?: number;
  cameraY?: number;
  targetHeight?: number;
  cameraTargetHeight?: number;
  staging?: string;
  frameLeft?: unknown;
  frameRight?: unknown;
  frameCenter?: unknown;
  target?: unknown;
  cameraTarget?: unknown;
  lookAt?: unknown;
  cameraSpot?: string | DirectingPoint;
  eyeLine?: unknown;
  onScreenIds?: unknown[];
  onScreen?: unknown[];
  floorPlan?: {
    spots?: Record<string, DirectingPoint> | Array<Record<string, unknown>>;
    people?: Array<Record<string, unknown>>;
    props?: unknown[];
    cameraSpots?: Record<string, DirectingPoint> | Array<Record<string, unknown>>;
    axis?: unknown;
    walls?: unknown[];
    roomBounds?: unknown;
    [key: string]: unknown;
  };
  scene?: { floorPlan?: DirectingShot["floorPlan"] };
  shot?: DirectingShot;
  shots?: DirectingShot[];
  [key: string]: unknown;
};

export type FilmStageMapping = {
  scene: SceneState;
  unsupported: string[];
  source: {
    shotId: string;
    axis?: unknown;
    eyeLine?: unknown;
    frame: Record<string, unknown>;
  };
};

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const string = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const refs = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          const object = asObject(item);
          return (
            string(object.id) ?? string(object.roleId) ?? string(object.personId) ?? string(item)
          );
        })
        .filter((item): item is string => Boolean(item))
    : string(value)
      ? [string(value)!]
      : [];

const firstRef = (value: unknown) => refs(value)[0];

function point(value: unknown): [number, number] | undefined {
  const item = asObject(value);
  const position = asObject(item.position);
  const x = item.x ?? position.x;
  const z = item.z ?? position.z ?? item.y;
  return typeof x === "number" && typeof z === "number" ? [x, z] : undefined;
}

function indexSpots(value: unknown): Map<string, [number, number]> {
  const map = new Map<string, [number, number]>();
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      const item = asObject(entry);
      const key = string(item.id) ?? string(item.name) ?? String(index + 1);
      const p = point(item);
      if (p) map.set(key, p);
    });
  } else {
    Object.entries(asObject(value)).forEach(([key, entry]) => {
      const p = point(entry);
      if (p) map.set(key, p);
    });
  }
  return map;
}

function propKind(
  id: string,
  name: string,
): "door" | "toilet" | "cylinder" | "handProp" | "table" | "box" {
  const value = (id + " " + name).toLowerCase();
  if (value.includes("door") || value.includes("门")) return "door";
  if (value.includes("toilet") || value.includes("马桶")) return "toilet";
  if (value.includes("table") || value.includes("desk") || value.includes("茶几") || value.includes("桌"))
    return "table";
  if (
    value.includes("cigarette") ||
    value.includes("paper") ||
    value.includes("medicine") ||
    value.includes("drug") ||
    value.includes("box") ||
    value.includes("药") ||
    value.includes("盒") ||
    value.includes("烟") ||
    value.includes("纸")
  )
    return "handProp";
  return "box";
}

function personId(person: Record<string, unknown>, index: number) {
  return (
    string(person.id) ??
    string(person.personId) ??
    string(person.roleId) ??
    string(person.role) ??
    "figure-" + (index + 1)
  );
}

function blockingFor(person: Record<string, unknown>) {
  const blocking = asObject(person.blocking);
  return Object.keys(blocking).length ? blocking : person;
}

function poseFor(
  person: Record<string, unknown>,
  _shotText: string,
  namedSpot: string | undefined,
  ownedPropNames: string[],
): FigureState["pose"] {
  const blocking = blockingFor(person);
  const raw = String(blocking.pose ?? blocking.action ?? blocking.stance ?? "").toLowerCase();
  // A pose belongs to this person's authored blocking. Shot staging is deliberately
  // excluded: a kneel in one person's action must never kneel the whole room.
  const descriptor = (
    raw +
    " " +
    String(blocking.description ?? blocking.staging ?? "") +
    " " +
    (namedSpot ?? "") +
    " " +
    ownedPropNames.join(" ")
  ).toLowerCase();
  const reach = /(递|伸|掏|指向|举|递烟|offer|reach|point|hand)/i.test(descriptor);
  if (descriptor.includes("趴") || descriptor.includes("伏") || descriptor.includes("slump") || descriptor.includes("head on table"))
    return "slumped-on-table";
  if (raw.includes("kneel") || descriptor.includes("跪"))
    return reach ? "kneel-and-reach" : "kneel";
  if (raw.includes("sit") || namedSpot?.toLowerCase().includes("seat") || namedSpot?.toLowerCase().includes("toilet"))
    return "sit";
  if (descriptor.includes("移开视线") || descriptor.includes("看一眼") || descriptor.includes("look away") || descriptor.includes("look down"))
    return "look-over-shoulder";
  if (descriptor.includes("回应") || descriptor.includes("答") || descriptor.includes("answer"))
    return "lean-in";
  if (raw.includes("walk") || descriptor.includes("走") || descriptor.includes("跑")) return "walk";
  if (reach) return "point";
  if (raw.includes("sit") || descriptor.includes("坐") || descriptor.includes("toilet") || namedSpot?.toLowerCase().includes("seat") || namedSpot?.toLowerCase().includes("toilet"))
    return "sit";
  if (raw.includes("wave")) return "wave";
  if (raw.includes("cross")) return "arms-crossed";
  if (raw.includes("lean")) return "lean-in";
  if (raw.includes("hip")) return "hand-on-hip";
  if (raw.includes("table")) return "hands-on-table";
  if (raw.includes("shoulder")) return "look-over-shoulder";
  return "stand";
}

// Keep the seated pelvis/legs while lifting the anatomical right arm for a reach.
const seatedReachJoints: FigureState["joints"] = {
  upperarm_r: [0.618159, 0.203427, 0.1773, 0.738283],
  lowerarm_r: [0.037142, -0.03644, 0.004982, 0.998633],
  hand_r: [0.010445, -0.398664, 0.00284, 0.917033],
};

// Compound film poses keep the delivered kneel/table assets and add only the
// authored contact. Missing bones are ignored by poseFigure for older rigs.
const slumpedJoints: FigureState["joints"] = {
  spine_03: [0.33, 0, 0, 0.944],
  neck_01: [0.38, 0, 0, 0.925],
  head: [0.46, 0, 0, 0.888],
};

function buildFor(person: Record<string, unknown>): FigureState["build"] {
  const blocking = blockingFor(person);
  const build = string(blocking.build) ?? string(person.build);
  const gender = string(blocking.gender) ?? string(person.gender);
  const base = build === "slim" || build === "average" || build === "broad" ? build : "average";
  return gender === "female" ? ((base + "-f") as FigureState["build"]) : base;
}

function heightFor(person: Record<string, unknown>) {
  const blocking = blockingFor(person);
  return number(blocking.heightCm ?? blocking.height ?? person.heightCm ?? person.height, 175);
}

function eyeLineValue(eyeLine: unknown) {
  const first = Array.isArray(eyeLine) ? eyeLine[0] : eyeLine;
  if (first && typeof first === "object") {
    const item = asObject(first);
    return item.view ?? item.height ?? item.angle ?? item.type ?? item.eyeLine ?? "";
  }
  return first ?? "";
}

function cameraView(eyeLine: unknown): SceneState["camera"]["view"] {
  const value = String(eyeLineValue(eyeLine)).toLowerCase();
  return value.includes("low")
    ? "low"
    : value.includes("high")
      ? "high"
      : value.includes("shoulder") || value.includes("ots")
        ? "shoulder"
        : "eye";
}

function shotName(size: unknown): SceneState["camera"]["shot"] {
  const value = String(size ?? "").toLowerCase();
  return value.includes("close")
    ? "close"
    : value.includes("medium") || value.includes("mid")
      ? "medium"
      : "full";
}

function makeWalls(
  spots: Map<string, [number, number]>,
  authoredWalls: unknown,
): FilmStageState["walls"] {
  if (Array.isArray(authoredWalls)) {
    const walls = authoredWalls.flatMap((raw, index) => {
      const item = asObject(raw);
      const position = point(item);
      const sizeValue = Array.isArray(item.size) ? item.size : undefined;
      if (!position || !sizeValue || sizeValue.length !== 3) return [];
      const size = sizeValue.map((value) => number(value, 0)) as [number, number, number];
      return [
        {
          id: string(item.id) ?? "wall-" + (index + 1),
          position: [position[0], number(item.y, 1.4), position[1]] as [number, number, number],
          size,
          rotation: number(item.rotation, 0),
        },
      ];
    });
    if (walls.length) return walls;
  }
  const values = [...spots.values()];
  const xs = values.map(([x]) => x);
  const zs = values.map(([, z]) => z);
  const minX = (xs.length ? Math.min(...xs) : -2) - 0.7;
  const maxX = (xs.length ? Math.max(...xs) : 2) + 0.7;
  const minZ = (zs.length ? Math.min(...zs) : -2) - 0.7;
  const maxZ = (zs.length ? Math.max(...zs) : 2) + 0.7;
  const width = Math.max(1, maxX - minX);
  const depth = Math.max(1, maxZ - minZ);
  const midX = (minX + maxX) / 2;
  const midZ = (minZ + maxZ) / 2;
  return [
    {
      id: "room-north",
      position: [midX, 1.4, minZ],
      size: [width, 2.8, 0.08],
      rotation: 0,
    },
    {
      id: "room-south",
      position: [midX, 1.4, maxZ],
      size: [width, 2.8, 0.08],
      rotation: 0,
    },
    {
      id: "room-west",
      position: [minX, 1.4, midZ],
      size: [0.08, 2.8, depth],
      rotation: 0,
    },
    {
      id: "room-east",
      position: [maxX, 1.4, midZ],
      size: [0.08, 2.8, depth],
      rotation: 0,
    },
  ];
}

function resolveTarget(
  shot: DirectingShot,
  spots: Map<string, [number, number]>,
  people: Array<Record<string, unknown>>,
  personPositions: Map<string, [number, number]>,
  frameCenter: string | undefined,
): { value: [number, number]; explicit: boolean } {
  const candidates = [shot.target, shot.cameraTarget, shot.lookAt];
  for (const candidate of candidates) {
    const p = point(candidate);
    if (p) return { value: p, explicit: true };
    const ref = string(candidate);
    if (ref) {
      const resolved = spots.get(ref) ?? personPositions.get(ref);
      if (resolved) return { value: resolved, explicit: true };
    }
  }
  if (frameCenter) {
    const resolved = spots.get(frameCenter) ?? personPositions.get(frameCenter);
    if (resolved) return { value: resolved, explicit: false };
  }
  const visible = people
    .map((raw) => personPositions.get(personId(asObject(raw), 0)))
    .filter((value): value is [number, number] => Boolean(value));
  if (visible.length) {
    return {
      value: [
        visible.reduce((sum, value) => sum + value[0], 0) / visible.length,
        visible.reduce((sum, value) => sum + value[1], 0) / visible.length,
      ],
      explicit: false,
    };
  }
  return { value: [0, 0], explicit: false };
}

export function directingToSceneState(input: DirectingShot): FilmStageMapping {
  const root = asObject(input);
  const nested = asObject(root.shot ?? (Array.isArray(root.shots) ? root.shots[0] : undefined));
  // MF's batch envelope keeps scene/floorPlan context beside the per-shot payload.
  // Merge both layers before resolving camera, people and props so nested shots
  // cannot silently fall back to the generic camera when context is envelope-only.
  const shot =
    Object.keys(nested).length > 0
      ? {
          ...root,
          ...nested,
          scene: typeof nested.scene === "object" ? nested.scene : root.scene,
          floorPlan: nested.floorPlan ?? root.floorPlan ?? asObject(root.scene).floorPlan,
        }
      : root;
  const floorPlan = asObject(shot.floorPlan ?? root.floorPlan ?? asObject(root.scene).floorPlan);
  const spots = indexSpots(floorPlan.spots);
  const cameraSpots = indexSpots(floorPlan.cameraSpots);
  const shotText = String(shot.staging ?? shot.startFrame ?? "");
  const requested = new Set(refs(shot.onScreenIds ?? shot.onScreen));
  const allPeople = Array.isArray(floorPlan.people)
    ? floorPlan.people.map((item) => asObject(item))
    : Array.isArray(shot.people)
      ? shot.people.map((item) => asObject(item))
      : [];
  const doorOpen =
    !/关闭|关着|closed/i.test(shotText) &&
    (/打开|敞开|推开|open|opened/i.test(shotText) ||
      allPeople.some((person) => {
        const blocking = blockingFor(person);
        const spot =
          string(blocking.spot) ??
          string(blocking.spotId) ??
          string(blocking.positionId) ??
          string(blocking.at) ??
          string(person.spotId);
        return spot?.toLowerCase().includes("doorway") ?? false;
      }));
  const people = requested.size
    ? allPeople.filter((person) =>
        requested.has(String(person.id ?? person.personId ?? person.roleId ?? person.role)),
      )
    : allPeople;
  const personPositions = new Map<string, [number, number]>();
  const rawProps = Array.isArray(floorPlan.props)
    ? floorPlan.props.map((item) => asObject(item))
    : [];
  const propsByOwner = new Map<string, string[]>();
  rawProps.forEach((item) => {
    const owner = string(item.ownerId) ?? string(item.at);
    if (!owner) return;
    const names = propsByOwner.get(owner) ?? [];
    names.push(string(item.name) ?? string(item.id) ?? "prop");
    propsByOwner.set(owner, names);
  });
  // Resolve the entire authored cast before selecting visible meshes: eyelines and
  // owned props can target a person who is deliberately outside this shot.
  const allFigures = allPeople.map((person, index) => {
    const id = personId(person, index);
    const blocking = blockingFor(person);
    const namedSpot =
      string(blocking.spot) ??
      string(blocking.spotId) ??
      string(blocking.positionId) ??
      string(blocking.at) ??
      string(person.spotId);
    const located = point(blocking) ??
      point(person) ??
      (namedSpot ? spots.get(namedSpot) : undefined) ?? [
        index * 0.8 - (allPeople.length - 1) * 0.4,
        0,
      ];
    personPositions.set(id, located);
    const castRole = asObject(asObject(shot.cast)[id]);
    const pose = poseFor(person, shotText, namedSpot, propsByOwner.get(id) ?? []);
    const seatedReach =
      pose === "sit" &&
      /(递|伸|指向|掏|offer|reach|point|hand)/i.test(
        String(blocking.description ?? blocking.staging ?? ""),
      );
    return {
      id,
      actorSlug: string(person.actorSlug) ?? string(person.actor) ?? string(castRole.actorSlug),
      name: string(person.name) ?? string(castRole.name) ?? id,
      heightCm: heightFor(person),
      build: buildFor(person),
      pose,
      joints:
        pose === "kneel-and-reach"
          ? seatedReachJoints
          : pose === "slumped-on-table"
            ? slumpedJoints
            : seatedReach
              ? seatedReachJoints
              : {},
      x: located[0],
      z: located[1],
      turn: number(blocking.turn ?? blocking.rotation ?? blocking.facing ?? person.turn, 0),
    };
  });
  const figures = requested.size
    ? allFigures.filter((figure) => requested.has(figure.id))
    : allFigures;
  const safeFigures: FigureState[] = figures.length
    ? figures
    : [
        {
          id: "figure-1",
          name: "figure-1",
          heightCm: 175,
          build: "average",
          pose: "stand",
          joints: {},
          x: 0,
          z: 0,
          turn: 0,
        },
      ];

  const axisRaw = asObject(floorPlan.axis);
  const axisFrom = string(axisRaw.fromSpotId) ? spots.get(string(axisRaw.fromSpotId)!) : undefined;
  const axisTo = string(axisRaw.toSpotId) ? spots.get(string(axisRaw.toSpotId)!) : undefined;
  const axis =
    axisFrom && axisTo
      ? {
          from: axisFrom,
          to: axisTo,
          cameraSide:
            string(axisRaw.cameraSide) === "left" ? ("left" as const) : ("right" as const),
        }
      : undefined;

  const cameraKey = string(shot.cameraSpot);
  const cameraPoint =
    point(shot.cameraSpot) ??
    (cameraKey ? cameraSpots.get(cameraKey) : undefined) ??
    (() => {
      const target = resolveTarget(
        shot,
        spots,
        people,
        personPositions,
        firstRef(shot.frameCenter),
      ).value;
      return [target[0], target[1] - 6] as [number, number];
    })();

  const centerKey = firstRef(shot.frameCenter);
  const targetResult = resolveTarget(shot, spots, people, personPositions, centerKey);
  let target = targetResult.value;
  const left = refs(shot.frameLeft);
  const right = refs(shot.frameRight);
  // Framing references adjust the aim point; they never rewrite figure positions.
  // Bias toward the left reference along the authored axis so camera-side ordering
  // remains stable when a two-shot has no explicit target.
  if (!targetResult.explicit && left.length && right.length && axis && axisFrom && axisTo) {
    const leftPoint = spots.get(left[0]) ?? personPositions.get(left[0]);
    const rightPoint = spots.get(right[0]) ?? personPositions.get(right[0]);
    const axisDx = axisTo[0] - axisFrom[0];
    const axisDz = axisTo[1] - axisFrom[1];
    const axisLength = Math.hypot(axisDx, axisDz);
    if (leftPoint && rightPoint && axisLength > 0.01) {
      const midpoint: [number, number] = [
        (leftPoint[0] + rightPoint[0]) / 2,
        (leftPoint[1] + rightPoint[1]) / 2,
      ];
      const bias = axis.cameraSide === "right" ? -0.2 : 0.2;
      target = [
        midpoint[0] + (axisDx / axisLength) * bias,
        midpoint[1] + (axisDz / axisLength) * bias,
      ];
    }
  }
  const targets = new Map<string, [number, number]>();
  spots.forEach((value, key) => targets.set(key, value));
  personPositions.forEach((value, key) => targets.set(key, value));

  const props: FilmStageState["props"] = rawProps.map((item, index) => {
    const id = string(item.id) ?? "prop-" + (index + 1);
    const name = string(item.name) ?? id;
    const kind = propKind(id, name);
    const at = string(item.at);
    const ownerId = string(item.ownerId) ?? (at && personPositions.has(at) ? at : undefined);
    const base = point(item) ??
      (at ? (spots.get(at) ?? personPositions.get(at)) : undefined) ?? [0, 0];
    const ownerIndex = ownerId ? allFigures.findIndex((figure) => figure.id === ownerId) : -1;
    const owner = ownerIndex >= 0 ? allFigures[ownerIndex] : undefined;
    const explicitTarget = string(item.targetId) ?? string(item.toward) ?? string(item.lookAt);
    const targetPoint = explicitTarget
      ? targets.get(explicitTarget)
      : ownerId
        ? [...personPositions.entries()]
            .filter(([person]) => person !== ownerId)
            .sort(([, left], [, right]) => Math.hypot(left[0] - base[0], left[1] - base[1]) - Math.hypot(right[0] - base[0], right[1] - base[1]))[0]?.[1]
        : undefined;
    const ownerTurn = owner ? (owner.turn * Math.PI) / 180 : 0;
    const handTurn = targetPoint ? Math.atan2(targetPoint[0] - base[0], targetPoint[1] - base[1]) : ownerTurn;
    const handOffset: [number, number] = [
      Math.sin(handTurn) * 0.31 + (ownerIndex % 2 ? -0.08 : 0.08),
      Math.cos(handTurn) * 0.31,
    ];
    const size = Array.isArray(item.size) && item.size.length === 3
      ? item.size.map((value) => number(value, 0.1)) as [number, number, number]
      : kind === "table"
        ? [1.8, 0.45, 1.0]
        : kind === "door"
          ? [0.12, 2.4, 1.0]
          : kind === "toilet"
            ? [0.72, 0.45, 0.72]
            : kind === "handProp"
              ? [0.28, 0.12, 0.18]
              : [0.5, 0.35, 0.5];
    const surfaceHeight = number(
      item.surfaceHeight,
      kind === "table" ? size[1] / 2 : kind === "toilet" ? 0.225 : kind === "door" ? 1.2 : kind === "handProp" ? (owner?.pose.includes("kneel") ? 0.76 : 0.95) : size[1] / 2,
    );
    const position: [number, number, number] = ownerId && owner
      ? [base[0] + handOffset[0], surfaceHeight, base[1] + handOffset[1]]
      : [base[0], surfaceHeight, base[1]];
    const rotation = number(item.yaw, kind === "handProp" && targetPoint ? handTurn : kind === "door" ? (doorOpen ? Math.PI / 2 : 0) : number(item.rotation, 0));
    const orientation: [number, number, number] = kind === "handProp"
      ? [number(item.pitch, targetPoint ? 0.12 : 0), rotation, number(item.roll, targetPoint ? -0.08 : 0)]
      : [0, rotation, 0];
    return {
      id,
      kind,
      position,
      size,
      surfaceHeight,
      orientation,
      // Keep yaw as a compatibility field for evidence and old readers.
      rotation,
      ownerId,
    };
  });
  props.forEach((prop) => targets.set(prop.id, [prop.position[0], prop.position[2]]));
  const eyeTargets = Array.isArray(shot.eyeLine)
    ? shot.eyeLine.flatMap((raw) => {
        const item = asObject(raw);
        const roleId = string(item.roleId) ?? string(item.personId);
        const targetId = string(item.targetId) ?? string(item.lookAt);
        return roleId && targetId ? [{ roleId, targetId }] : [];
      })
    : [];
  const turnedFigures = safeFigures.map((figure) => {
    const eye = eyeTargets.find((targetItem) => targetItem.roleId === figure.id);
    const targetPoint = eye ? targets.get(eye.targetId) : undefined;
    if (!targetPoint) return figure;
    return {
      ...figure,
      turn: (Math.atan2(targetPoint[0] - figure.x, targetPoint[1] - figure.z) * 180) / Math.PI,
    };
  });
  const shotSize = shotName(shot.shotSize);
  const cameraSpotObject = asObject(shot.cameraSpot);
  const cameraSpotPosition = asObject(cameraSpotObject.position);
  const cameraTargetObject = asObject(shot.cameraTarget ?? shot.lookAt);
  const cameraTargetPosition = asObject(cameraTargetObject.position);
  const cameraHeight = number(
    shot.cameraHeight ?? shot.cameraY ?? cameraSpotObject.y ?? cameraSpotPosition.y,
    shotSize === "close" ? 0.72 : 1.55,
  );
  const targetHeight = number(
    shot.targetHeight ?? shot.cameraTargetHeight ?? cameraTargetObject.y ?? cameraTargetPosition.y,
    shotSize === "close" ? 0.85 : 1.1,
  );
  const filmCamera = fitFilmPeople(
    turnedFigures,
    [cameraPoint[0], cameraHeight, cameraPoint[1]],
    [target[0], targetHeight, target[1]],
    shotSize === "close" ? 50 : 24,
    { shot: shotSize, cameraHeight, targetHeight },
  );
  const scene: SceneState = {
    version: 1,
    castKey: "directing",
    figures: turnedFigures,
    frame: "landscape",
    camera: {
      ...fitCamera({
        fit: false,
        shot: shotSize,
        view: cameraView(shot.eyeLine),
        lens: filmCamera.lens as SceneState["camera"]["lens"],
        position: filmCamera.position,
        target: filmCamera.target,
        subject:
          centerKey && turnedFigures.some((figure) => figure.id === centerKey)
            ? centerKey
            : "everyone",
      }),
      fit: false,
    },
    setting: settingDraftSchema.parse(undefined),
    stage: {
      props: props.filter(
        (prop) => !prop.ownerId || safeFigures.some((figure) => figure.id === prop.ownerId),
      ),
      walls: makeWalls(spots, floorPlan.walls),
      axis,
      frame: { left, right, center: refs(shot.frameCenter) },
      eyeTargets,
    },
  };
  const unknownFloorPlan = Object.keys(floorPlan).filter(
    (key) =>
      !["spots", "people", "props", "cameraSpots", "axis", "walls", "roomBounds"].includes(key),
  );
  return {
    scene,
    unsupported: unknownFloorPlan,
    source: {
      shotId: string(shot.id) ?? string(shot.shotId) ?? "shot",
      axis: floorPlan.axis,
      eyeLine: shot.eyeLine,
      frame: { left: shot.frameLeft, right: shot.frameRight, center: shot.frameCenter },
    },
  };
}
