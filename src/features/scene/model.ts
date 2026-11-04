import { z } from "zod";
import { settingDraftSchema } from "@/features/settings/contracts";

export const MAX_FIGURES = 5;
export const DRAFT_KEY = "sp-scene-v1";
export const POSES = ["stand", "walk", "point", "wave", "sit", "arms-crossed"] as const;
export const BUILDS = ["slim", "average", "broad"] as const;
// Slot colours identify a figure in this layout, not an actor's brand colour.
export const FIGURE_BANDS = [
  { colour: "blue", hex: "#235ea8" },
  { colour: "amber", hex: "#986400" },
  { colour: "magenta", hex: "#983f78" },
  { colour: "teal", hex: "#08776e" },
  { colour: "purple", hex: "#7044ae" },
] as const;
export type FigureIdentity = { label: string; colour: string };
export const VIEWS = ["eye", "low", "high"] as const;
export const FRAMES = {
  landscape: [1920, 1080],
  portrait: [1080, 1920],
  square: [1080, 1080],
} as const;
const finite = z.number().finite();
const point = z.tuple([finite, finite, finite]);
const figureSchema = z.object({
  id: z.string().min(1),
  actorSlug: z.string().optional(),
  name: z.string().optional(),
  heightCm: finite.min(80).max(240),
  build: z.enum(BUILDS),
  pose: z.enum(POSES),
  x: finite.min(-5).max(5),
  z: finite.min(-5).max(5),
  turn: finite.min(-180).max(180),
});
export const sceneSchema = z
  .object({
    version: z.literal(1),
    castKey: z.string(),
    figures: z.array(figureSchema).min(1).max(MAX_FIGURES),
    frame: z.enum(["landscape", "portrait", "square"]),
    camera: z.object({ view: z.enum(VIEWS), position: point, target: point }),
    setting: settingDraftSchema,
  })
  .refine(
    (scene) => new Set(scene.figures.map((figure) => figure.id)).size === scene.figures.length,
  );
export type FigureState = z.infer<typeof figureSchema>;
export type SceneState = z.infer<typeof sceneSchema>;
export type SceneActor = { slug: string; name: string; heightCm?: number };
export type CameraState = SceneState["camera"];
export type Frame = SceneState["frame"];

export function makeFigure(id: string, actor?: SceneActor): FigureState {
  return {
    id,
    ...(actor ? { actorSlug: actor.slug, name: actor.name } : {}),
    heightCm: actor?.heightCm ?? 175,
    build: "average",
    pose: "stand",
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
export function fitCamera(
  figures: FigureState[],
  frame: Frame,
  view: CameraState["view"],
): CameraState {
  const xs = figures.map((figure) => figure.x);
  const zs = figures.map((figure) => figure.z);
  const height = Math.max(...figures.map((figure) => figure.heightCm / 100));
  const width = Math.max(...xs) - Math.min(...xs) + 1.2;
  const depth = Math.max(...zs) - Math.min(...zs) + 1.2;
  const [w, h] = FRAMES[frame];
  const distance =
    Math.max(width / (w / h), height + 0.5) / (2 * Math.tan(Math.PI / 9)) + depth / 2;
  const target: [number, number, number] = [
    (Math.max(...xs) + Math.min(...xs)) / 2,
    height / 2,
    (Math.max(...zs) + Math.min(...zs)) / 2,
  ];
  return {
    view,
    target,
    position: [
      target[0],
      Math.max(
        0.25,
        target[1] + distance * (view === "high" ? 0.65 : view === "low" ? -0.12 : 0.08),
      ),
      target[2] + distance,
    ],
  };
}
export function initialScene(actors: SceneActor[] = [], castKey = ""): SceneState {
  if (actors.length > MAX_FIGURES) throw new Error("Choose at most five actors");
  const figures = arrange(
    actors.length
      ? actors.map((actor, index) => makeFigure(`figure-${index + 1}`, actor))
      : [makeFigure("figure-1")],
    "line",
  );
  return {
    version: 1,
    castKey,
    figures,
    frame: "landscape",
    camera: fitCamera(figures, "landscape", "eye"),
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
