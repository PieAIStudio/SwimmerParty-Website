import figures from "./figures.json";
import type { FigureState } from "./model";

/** One rest-pose GLB per body; changing pose never downloads another body. */
export function loadFigure(build: FigureState["build"]): string {
  return `${figures[build].base}/${build}.glb`;
}

/** Shared quaternion data is fetched only by the lazy stage. */
export function loadPose(pose: FigureState["pose"]): string {
  return `/scene/rigged/poses/${pose}.json`;
}

/** Standing skinned bounds, even for sitting/kneeling; no width stretching. */
export function figureScale(build: FigureState["build"], heightCm: number): number {
  return heightCm / 100 / figures[build].standingHeightM;
}
