import { settingDraftSchema } from "@/features/settings/contracts";
import { fitCamera, type FigureState, type SceneState } from "./model";

export type DirectingPoint = { x?: number; z?: number; y?: number; [key: string]: unknown };
export type DirectingShot = {
  id?: string;
  shotId?: string;
  sceneId?: string;
  shotSize?: string;
  frameLeft?: unknown;
  frameRight?: unknown;
  frameCenter?: unknown;
  cameraSpot?: string | DirectingPoint;
  eyeLine?: unknown;
  onScreenIds?: unknown[];
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
const firstRef = (value: unknown) =>
  string(value) ?? (Array.isArray(value) ? string(value[0]) : undefined);
function point(value: unknown): [number, number] | undefined {
  const item = asObject(value);
  const position = asObject(item.position);
  const x = item.x ?? position.x;
  const z = item.z ?? position.z ?? item.y;
  return typeof x === "number" && typeof z === "number" ? [x, z] : undefined;
}
function indexSpots(value: unknown): Map<string, [number, number]> {
  const map = new Map<string, [number, number]>();
  if (Array.isArray(value))
    value.forEach((entry, index) => {
      const item = asObject(entry);
      const key = string(item.id) ?? string(item.name) ?? String(index + 1);
      const p = point(item);
      if (p) map.set(key, p);
    });
  else
    Object.entries(asObject(value)).forEach(([key, entry]) => {
      const p = point(entry);
      if (p) map.set(key, p);
    });
  return map;
}
function poseFor(person: Record<string, unknown>): FigureState["pose"] {
  const raw = String(person.pose ?? person.action ?? person.stance ?? "").toLowerCase();
  if (raw.includes("sit")) return "sit";
  if (raw.includes("kneel")) return "kneel";
  if (raw.includes("walk")) return "walk";
  if (raw.includes("point")) return "point";
  if (raw.includes("wave")) return "wave";
  if (raw.includes("cross")) return "arms-crossed";
  if (raw.includes("lean")) return "lean-in";
  if (raw.includes("hip")) return "hand-on-hip";
  if (raw.includes("table")) return "hands-on-table";
  if (raw.includes("shoulder")) return "look-over-shoulder";
  return "stand";
}
function buildFor(person: Record<string, unknown>): FigureState["build"] {
  const build = string(person.build) ?? "average";
  const gender = string(person.gender);
  const base = build === "slim" || build === "broad" ? build : "average";
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
export function directingToSceneState(input: DirectingShot): FilmStageMapping {
  const root = asObject(input);
  const nested = asObject(root.shot ?? (Array.isArray(root.shots) ? root.shots[0] : undefined));
  const shot = Object.keys(nested).length ? nested : root;
  const floorPlan = asObject(shot.floorPlan ?? root.floorPlan ?? asObject(root.scene).floorPlan);
  const spots = indexSpots(floorPlan.spots);
  const cameraSpots = indexSpots(floorPlan.cameraSpots);
  const requested = new Set(
    (Array.isArray(shot.onScreenIds)
      ? shot.onScreenIds
      : Array.isArray(shot.onScreen)
        ? shot.onScreen
        : []
    ).map((id) => String(id)),
  );
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
  const unsupported: string[] = [];
  if (Array.isArray(floorPlan.props) && floorPlan.props.length) unsupported.push("floorPlan.props");
  if (floorPlan.axis !== undefined) unsupported.push("floorPlan.axis");
  if (shot.frameLeft !== undefined) unsupported.push("shot.frameLeft");
  if (shot.frameRight !== undefined) unsupported.push("shot.frameRight");
  Object.keys(floorPlan)
    .filter((key) => !["spots", "people", "props", "cameraSpots", "axis"].includes(key))
    .forEach((key) => unsupported.push("floorPlan." + key));
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
    return {
      id,
      actorSlug: string(person.actorSlug) ?? string(person.actor) ?? undefined,
      name: string(person.name) ?? id,
      heightCm: number(person.heightCm, 175),
      build: buildFor(person),
      pose: poseFor(person),
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
  const cameraRaw = shot.cameraSpot;
  const cameraKey = string(cameraRaw);
  const cameraPoint = point(cameraRaw) ??
    (cameraKey ? cameraSpots.get(cameraKey) : undefined) ?? [0, 6];
  const centerKey = firstRef(shot.frameCenter);
  const center = centerKey ? spots.get(centerKey) : undefined;
  const target = center ?? [0, 0];
  const eye = typeof shot.eyeLine === "number" ? shot.eyeLine : 1.1;
  const shotSize = shotName(shot.shotSize);
  const scene: SceneState = {
    version: 1,
    castKey: "directing",
    figures: safeFigures,
    frame: "landscape",
    camera: fitCamera({
      fit: false,
      shot: shotSize,
      view: cameraView(shot.eyeLine),
      lens: shotSize === "close" ? 85 : shotSize === "medium" ? 50 : 24,
      position: [cameraPoint[0], eye + 0.5, cameraPoint[1]],
      target: [target[0], eye, target[1]],
      subject:
        centerKey && safeFigures.some((figure) => figure.id === centerKey) ? centerKey : "everyone",
    }),
    setting: settingDraftSchema.parse(undefined),
  };
  return {
    scene,
    unsupported: [...new Set(unsupported)],
    source: {
      shotId: string(shot.id) ?? string(shot.shotId) ?? "shot",
      axis: floorPlan.axis,
      eyeLine: shot.eyeLine,
      frame: { left: shot.frameLeft, right: shot.frameRight, center: shot.frameCenter },
    },
  };
}
