import { settingDraftSchema } from "@/features/settings/contracts";
import { fitCamera, type FigureState, type FilmStageState, type SceneState } from "./model";

export type DirectingPoint = { x?: number; z?: number; y?: number; [key: string]: unknown };
export type DirectingShot = {
  id?: string;
  shotId?: string;
  sceneId?: string;
  shotSize?: string;
  staging?: string;
  frameLeft?: unknown;
  frameRight?: unknown;
  frameCenter?: unknown;
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
  source: { shotId: string; axis?: unknown; eyeLine?: unknown; frame: Record<string, unknown> };
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

function propKind(id: string, name: string): "door" | "cylinder" | "handProp" | "box" {
  const value = (id + " " + name).toLowerCase();
  if (value.includes("door") || value.includes("门")) return "door";
  if (value.includes("toilet") || value.includes("马桶")) return "cylinder";
  if (
    value.includes("cigarette") ||
    value.includes("paper") ||
    value.includes("烟") ||
    value.includes("纸")
  )
    return "handProp";
  return "box";
}

function poseFor(
  person: Record<string, unknown>,
  shotText = "",
  namedSpot: string | undefined = undefined,
): FigureState["pose"] {
  const raw = String(person.pose ?? person.action ?? person.stance ?? "").toLowerCase();
  const text = (raw + " " + shotText + " " + (namedSpot ?? "")).toLowerCase();
  if (raw.includes("kneel")) return "kneel";
  if (raw.includes("walk") || text.includes("走") || text.includes("跑")) return "walk";
  if (
    raw.includes("sit") ||
    text.includes("坐") ||
    text.includes("toilet") ||
    namedSpot?.toLowerCase().includes("seat")
  )
    return "sit";
  if (
    raw.includes("hand") ||
    raw.includes("point") ||
    text.includes("递") ||
    text.includes("伸") ||
    text.includes("掏") ||
    text.includes("指向") ||
    text.includes("offer") ||
    text.includes("reach")
  )
    return "point";
  if (raw.includes("wave")) return "wave";
  if (raw.includes("cross")) return "arms-crossed";
  if (raw.includes("lean")) return "lean-in";
  if (raw.includes("hip")) return "hand-on-hip";
  if (raw.includes("table")) return "hands-on-table";
  if (raw.includes("shoulder")) return "look-over-shoulder";
  return "stand";
}

function buildFor(person: Record<string, unknown>, index: number): FigureState["build"] {
  const build = string(person.build);
  if (build === "slim" || build === "broad") {
    const gender = string(person.gender);
    return gender === "female" ? ((build + "-f") as FigureState["build"]) : build;
  }
  const gender = string(person.gender);
  const base = index % 2 ? "broad" : "slim";
  return gender === "female" ? ((base + "-f") as FigureState["build"]) : base;
}

function cameraView(eyeLine: unknown): SceneState["camera"]["view"] {
  const value = String(Array.isArray(eyeLine) ? eyeLine[0] : (eyeLine ?? "")).toLowerCase();
  return value.includes("low")
    ? "low"
    : value.includes("high")
      ? "high"
      : value.includes("shoulder")
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

function reflectAcrossAxis(
  pointValue: [number, number],
  from: [number, number],
  to: [number, number],
): [number, number] {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz) || 1;
  const ux = dx / length;
  const uz = dz / length;
  const px = pointValue[0] - from[0];
  const pz = pointValue[1] - from[1];
  const along = px * ux + pz * uz;
  const cross = px * uz - pz * ux;
  return [from[0] + along * ux - cross * uz, from[1] + along * uz + cross * ux];
}

function makeWalls(spots: Map<string, [number, number]>): FilmStageState["walls"] {
  const values = [...spots.values()];
  const xs = values.map(([x]) => x);
  const zs = values.map(([, z]) => z);
  const minX = Math.min(-1.8, ...(xs.length ? xs : [0])) - 0.7;
  const maxX = Math.max(1.8, ...(xs.length ? xs : [0])) + 0.7;
  const minZ = Math.min(-3, ...(zs.length ? zs : [0])) - 0.7;
  const maxZ = Math.max(2, ...(zs.length ? zs : [0])) + 0.7;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const midX = (minX + maxX) / 2;
  const midZ = (minZ + maxZ) / 2;
  return [
    {
      id: "room-north",
      position: [midX, 1.4, minZ] as [number, number, number],
      size: [width, 2.8, 0.08],
      rotation: 0,
    },
    {
      id: "room-south",
      position: [midX, 1.4, maxZ] as [number, number, number],
      size: [width, 2.8, 0.08],
      rotation: 0,
    },
    {
      id: "room-west",
      position: [minX, 1.4, midZ] as [number, number, number],
      size: [0.08, 2.8, depth],
      rotation: 0,
    },
    {
      id: "room-east",
      position: [maxX, 1.4, midZ] as [number, number, number],
      size: [0.08, 2.8, depth],
      rotation: 0,
    },
  ];
}

export function directingToSceneState(input: DirectingShot): FilmStageMapping {
  const root = asObject(input);
  const nested = asObject(root.shot ?? (Array.isArray(root.shots) ? root.shots[0] : undefined));
  const shot = Object.keys(nested).length ? nested : root;
  const floorPlan = asObject(shot.floorPlan ?? root.floorPlan ?? asObject(root.scene).floorPlan);
  const spots = indexSpots(floorPlan.spots);
  const cameraSpots = indexSpots(floorPlan.cameraSpots);
  const shotText = String(shot.staging ?? shot.startFrame ?? "");
  const requested = new Set(refs(shot.onScreenIds ?? shot.onScreen));
  const allPeople = Array.isArray(floorPlan.people)
    ? floorPlan.people
    : Array.isArray(shot.people)
      ? shot.people
      : [];
  const people = requested.size
    ? allPeople.filter((person) => {
        const item = asObject(person);
        return requested.has(String(item.id ?? item.personId ?? item.roleId ?? item.role));
      })
    : allPeople;
  const personPositions = new Map<string, [number, number]>();
  const figures = people.map((raw, index) => {
    const person = asObject(raw);
    const id =
      string(person.id) ??
      string(person.personId) ??
      string(person.roleId) ??
      string(person.role) ??
      "figure-" + (index + 1);
    const namedSpot =
      string(person.spot) ??
      string(person.spotId) ??
      string(person.positionId) ??
      string(person.at);
    const located = point(person) ??
      (namedSpot ? spots.get(namedSpot) : undefined) ?? [
        index * 0.8 - (people.length - 1) * 0.4,
        0,
      ];
    personPositions.set(id, located);
    return {
      id,
      actorSlug: string(person.actorSlug) ?? string(person.actor) ?? undefined,
      name: string(person.name) ?? id,
      heightCm: number(person.heightCm, index % 2 ? 184 : 170),
      build: buildFor(person, index),
      pose: poseFor(person, shotText, namedSpot),
      joints: {},
      x: located[0],
      z: located[1],
      turn: number(person.turn ?? person.rotation ?? person.facing, 0),
    };
  });
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
  let cameraPoint = point(shot.cameraSpot) ??
    (cameraKey ? cameraSpots.get(cameraKey) : undefined) ?? [0, 6];
  if (axis) {
    const dx = axis.to[0] - axis.from[0];
    const dz = axis.to[1] - axis.from[1];
    const side = dx * (cameraPoint[1] - axis.from[1]) - dz * (cameraPoint[0] - axis.from[0]);
    const desired = axis.cameraSide === "left" ? -1 : 1;
    if (side * desired < 0) cameraPoint = reflectAcrossAxis(cameraPoint, axis.from, axis.to);
  }

  const centerKey = firstRef(shot.frameCenter);
  const center = centerKey ? (spots.get(centerKey) ?? personPositions.get(centerKey)) : undefined;
  const target = center ?? [0, 0];
  const viewX = target[0] - cameraPoint[0];
  const viewZ = target[1] - cameraPoint[1];
  const viewLength = Math.hypot(viewX, viewZ) || 1;
  const screenRight: [number, number] = [viewZ / viewLength, -viewX / viewLength];
  const left = refs(shot.frameLeft);
  const right = refs(shot.frameRight);
  const sides = new Map<string, number>();
  left.forEach((id) => sides.set(id, -1));
  right.forEach((id) => sides.set(id, 1));
  const placedFigures = safeFigures.map((figure) => {
    const side = sides.get(figure.id);
    if (side === undefined) return figure;
    return {
      ...figure,
      x: figure.x + screenRight[0] * side * 0.9,
      z: figure.z + screenRight[1] * side * 0.9,
    };
  });

  const rawProps = Array.isArray(floorPlan.props) ? floorPlan.props : [];
  const props: FilmStageState["props"] = rawProps.map((raw, index) => {
    const item = asObject(raw);
    const id = string(item.id) ?? "prop-" + (index + 1);
    const name = string(item.name) ?? id;
    const kind = propKind(id, name);
    const at = string(item.at);
    const base = at ? (spots.get(at) ?? personPositions.get(at)) : undefined;
    const position = base ?? [0, 0];
    const isDoor = kind === "door";
    const isToilet = kind === "cylinder";
    return {
      id,
      kind,
      position: [position[0], isToilet ? 0.35 : isDoor ? 1.2 : 0.9, position[1]],
      size: isDoor ? [0.12, 2.4, 1.0] : isToilet ? [0.72, 0.7, 0.72] : [0.12, 0.06, 0.38],
      rotation: isDoor ? Math.PI / 2 : 0,
      ownerId: at && personPositions.has(at) ? at : undefined,
    };
  });
  const targets = new Map<string, [number, number]>();
  spots.forEach((value, key) => targets.set(key, value));
  personPositions.forEach((value, key) => targets.set(key, value));
  props.forEach((prop) => targets.set(prop.id, [prop.position[0], prop.position[2]]));
  const eyeTargets = Array.isArray(shot.eyeLine)
    ? shot.eyeLine.map(asObject).flatMap((item) => {
        const roleId = string(item.roleId);
        const targetId = string(item.targetId);
        return roleId && targetId ? [{ roleId, targetId }] : [];
      })
    : [];
  const turnedFigures = placedFigures.map((figure) => {
    const eye = eyeTargets.find((targetItem) => targetItem.roleId === figure.id);
    const targetPoint = eye ? targets.get(eye.targetId) : undefined;
    if (!targetPoint) return figure;
    return {
      ...figure,
      turn: (Math.atan2(targetPoint[0] - figure.x, targetPoint[1] - figure.z) * 180) / Math.PI,
    };
  });
  const shotSize = shotName(shot.shotSize);
  const scene: SceneState = {
    version: 1,
    castKey: "directing",
    figures: turnedFigures,
    frame: "landscape",
    camera: fitCamera({
      fit: false,
      shot: shotSize,
      view: cameraView(shot.eyeLine),
      lens: shotSize === "close" ? 85 : shotSize === "medium" ? 50 : 24,
      position: [cameraPoint[0], 1.55, cameraPoint[1]],
      target: [target[0], 1.1, target[1]],
      subject:
        centerKey && turnedFigures.some((figure) => figure.id === centerKey)
          ? centerKey
          : "everyone",
    }),
    setting: settingDraftSchema.parse(undefined),
    stage: {
      props,
      walls: makeWalls(spots),
      axis,
      frame: { left, right, center: refs(shot.frameCenter) },
      eyeTargets,
    },
  };
  const unknownFloorPlan = Object.keys(floorPlan).filter(
    (key) => !["spots", "people", "props", "cameraSpots", "axis"].includes(key),
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
