import { z } from "zod";
import { settingDraftSchema } from "@/features/settings/contracts";

export const DRAFT_KEY = "sp-scene-v1";
export const POSES = [
  "stand",
  "walk",
  "point",
  "wave",
  "sit",
  "arms-crossed",
  "lean-in",
  "hand-on-hip",
  "hands-on-table",
  "look-over-shoulder",
  "hug-ready",
  "kneel",
] as const;
export const BUILDS = ["slim", "average", "broad", "slim-f", "average-f", "broad-f"] as const;
// Slot colours identify a figure in this layout, not an actor's brand colour.
export const FIGURE_BANDS = [
  { colour: "blue", hex: "#235ea8" },
  { colour: "amber", hex: "#986400" },
  { colour: "magenta", hex: "#983f78" },
  { colour: "teal", hex: "#08776e" },
  { colour: "purple", hex: "#7044ae" },
  { colour: "red", hex: "#aa4039" },
  { colour: "green", hex: "#49702d" },
  { colour: "slate", hex: "#506478" },
] as const;
export const figureBand = (index: number) => FIGURE_BANDS[index % FIGURE_BANDS.length];
export const LAYOUTS = { talk: 2, triangle: 3, group: 5, lineup: 8 } as const;
export type Layout = keyof typeof LAYOUTS;
export type FigureIdentity = { label: string; colour: string };
export const VIEWS = ["eye", "low", "high", "shoulder"] as const;
export const SHOTS = ["full", "medium", "close"] as const;
export const LENSES = [24, 50, 85] as const;
export const FRAMES = {
  landscape: [1920, 1080],
  portrait: [1080, 1920],
  square: [1080, 1080],
} as const;
const finite = z.number().finite();
const point = z.tuple([finite, finite, finite]);
const jointRotations = z.record(z.string(), z.tuple([finite, finite, finite, finite]));
export type JointRotations = z.infer<typeof jointRotations>;
const figureSchema = z.object({
  id: z.string().min(1),
  actorSlug: z.string().optional(),
  name: z.string().optional(),
  heightCm: finite.min(80).max(240),
  build: z.enum(BUILDS),
  pose: z.enum(POSES),
  joints: jointRotations.default({}),
  x: finite,
  z: finite,
  turn: finite.min(-180).max(180),
});
export const sceneSchema = z
  .object({
    version: z.literal(1),
    castKey: z.string(),
    figures: z.array(figureSchema).min(1),
    frame: z.enum(["landscape", "portrait", "square"]),
    camera: z.object({
      view: z.enum(VIEWS),
      position: point,
      target: point,
      shot: z.enum(SHOTS).default("full"),
      lens: z.union([z.literal(24), z.literal(50), z.literal(85)]).default(50),
      sensorWidth: z.literal(36).default(36),
      subject: z.string().default("everyone"),
      fit: z.boolean().default(false),
    }),
    setting: settingDraftSchema,
  })
  .refine(
    (scene) => new Set(scene.figures.map((figure) => figure.id)).size === scene.figures.length,
  );
export type FigureState = z.infer<typeof figureSchema>;
export type SceneState = z.infer<typeof sceneSchema>;
export type SceneActor = {
  slug: string;
  name: string;
  heightCm?: number;
  gender?: "female" | "male";
  build?: "slim" | "average" | "broad";
};

export function defaultBuild(actor?: SceneActor): FigureState["build"] {
  const build = actor?.build ?? "average";
  return actor?.gender === "female" ? `${build}-f` : build;
}
export type CameraState = SceneState["camera"];
export type Frame = SceneState["frame"];

export function makeFigure(id: string, actor?: SceneActor): FigureState {
  return {
    id,
    ...(actor ? { actorSlug: actor.slug, name: actor.name } : {}),
    heightCm: actor?.heightCm ?? 175,
    build: defaultBuild(actor),
    pose: "stand",
    joints: {},
    x: 0,
    z: 0,
    turn: 0,
  };
}
export function arrange(figures: FigureState[], arrangement: "line" | "faceOff"): FigureState[] {
  return figures.map((figure, index) =>
    arrangement === "line"
      ? { ...figure, x: (index - (figures.length - 1) / 2) * 1.1, z: 0, turn: 0 }
      : {
          ...figure,
          x: index % 2 === 0 ? -1 : 1,
          z: (Math.floor(index / 2) - Math.floor((figures.length - 1) / 2) / 2) * 1.1,
          turn: index % 2 === 0 ? 90 : -90,
        },
  );
}
// Presets reuse assigned actors in order; one undo restores the previous cast/layout.
export function applyLayout(
  figures: FigureState[],
  layout: Layout,
  compact = false,
): FigureState[] {
  return Array.from({ length: LAYOUTS[layout] }, (_, index) => {
    const figure = { ...(figures[index] ?? makeFigure(crypto.randomUUID())), joints: {} };
    if (layout === "talk")
      return {
        ...figure,
        x: index === 0 ? -0.325 : 0.325,
        z: 0,
        turn: index === 0 ? 65 : -65,
        pose: index === 0 ? "lean-in" : "hand-on-hip",
      };
    if (layout === "triangle")
      return {
        ...figure,
        x: (index - 1) * 1.25,
        z: index === 1 ? -0.8 : 0.35,
        turn: (1 - index) * 25,
        pose: "stand",
      };
    const five = layout === "group";
    const half = (LAYOUTS[layout] - 1) / 2;
    const offset = (index - half) / half;
    const builds: FigureState["build"][] = [
      "broad",
      "slim-f",
      "average",
      "broad-f",
      "slim",
      "average-f",
      "average",
      "slim-f",
    ];
    const poses: FigureState["pose"][] = [
      "stand",
      "hand-on-hip",
      "arms-crossed",
      "stand",
      "lean-in",
      "arms-crossed",
      "hand-on-hip",
      "stand",
    ];
    // #2 stands just behind the sitter, within a real arm's reach of his shoulder.
    // #4 uses the shelf's soft-kneed contrapposto, with both hands free.
    // #5 turns a further 30° toward the sitter instead of reading as front-facing.
    const group = [
      { x: -1.3, z: 0.65, turn: -25 },
      { x: -0.68, z: 0.35, turn: -25 },
      { x: 0.05, z: 0.05, turn: -25 },
      { x: 0.74, z: -0.55, turn: -30 },
      { x: 1.4, z: 0.05, turn: -60 },
    ];
    // One row on phone too: close the spacing by about 15%, not a second row.
    // Desktop keeps its original arc; both remain ordinary saved edits.
    const phoneLineup = compact && layout === "lineup";
    // Leave slightly more room at the broad body and flared hip/lean elbows.
    const phoneX = [-1.91, -1.35, -0.82, -0.29, 0.26, 0.79, 1.32, 1.9];
    // Assigned actors retain their known build; generic stand-ins vary naturally.
    return {
      ...figure,
      build: figure.actorSlug ? figure.build : builds[index],
      x: five ? group[index].x : phoneLineup ? phoneX[index] : (index - half) * 0.62,
      z: five ? group[index].z : phoneLineup ? 0 : -0.45 + 0.9 * offset * offset,
      turn: five
        ? group[index].turn
        : -Math.sign(offset) * (15 + (20 * (Math.abs(index - half) - 0.5)) / 3),
      pose: five
        ? (["sit", "lean-in", "arms-crossed", "stand", "stand"] as const)[index]
        : poses[index],
    };
  });
}
export function applyBlocking(
  scene: SceneState,
  preset: "talk" | "shoulder" | "group" | "lineup",
  compact = false,
): SceneState {
  const dialogue = preset === "talk" || preset === "shoulder";
  const figures = applyLayout(scene.figures, preset === "shoulder" ? "talk" : preset, compact);
  if (dialogue) figures[0].pose = "stand";
  return {
    ...scene,
    figures,
    frame: "landscape",
    camera: fitCamera({
      shot: dialogue || (compact && preset === "lineup") ? "medium" : "full",
      lens: 50,
      view: preset === "shoulder" ? "shoulder" : "eye",
      subject: preset === "shoulder" ? figures[1].id : "everyone",
    }),
  };
}

// Request a fit after the lazy canvas has loaded the actual posed geometry.
// Resolved transforms replace this request in the same undo entry.
export function fitCamera(camera: Partial<CameraState> = {}): CameraState {
  return {
    view: "eye",
    shot: "full",
    lens: 50,
    sensorWidth: 36,
    subject: "everyone",
    position: [0, 1, 7],
    target: [0, 1, 0],
    ...camera,
    fit: true,
  };
}
export function initialScene(actors: SceneActor[] = [], castKey = ""): SceneState {
  const figures = arrange(
    actors.length
      ? actors.map((actor, index) => makeFigure(`figure-${index + 1}`, actor))
      : [makeFigure("figure-1"), makeFigure("figure-2")],
    "line",
  );
  return {
    version: 1,
    castKey,
    figures,
    frame: "landscape",
    camera: fitCamera(),
    setting: settingDraftSchema.parse(undefined),
  };
}
export function readDraft(raw: string | null): SceneState | null {
  try {
    const saved = JSON.parse(raw ?? "null");
    // Keep v1 drafts made with the old placeholder pose/build IDs usable.
    const oldPoses: Record<string, string> = {
      neutral: "stand",
      guard: "arms-crossed",
      lunge: "walk",
      crouch: "sit",
    };
    const oldBuilds: Record<string, string> = { regular: "average" };
    if (Array.isArray(saved?.figures))
      saved.figures = saved.figures.map((figure: FigureState) => ({
        ...figure,
        build: oldBuilds[figure.build] ?? figure.build,
        pose: oldPoses[figure.pose] ?? figure.pose,
      }));
    const result = sceneSchema.safeParse(saved);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
