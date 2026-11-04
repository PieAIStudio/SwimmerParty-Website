import figures from "./figures.json";
import type { FigureState } from "./model";

/** Static MediaFactory meshes: fetch only the build/pose actually in use. */
export function loadFigure(build: FigureState["build"], pose: FigureState["pose"]): string {
  const base = figures[build].base;
  return pose === "stand" ? `${base}/${build}.glb` : `${base}/poses/${build}-${pose}.glb`;
}

/** Use standing stature even for a seated mesh; never stretch body width. */
export function figureScale(build: FigureState["build"], heightCm: number): number {
  return heightCm / 100 / figures[build].standingHeightM;
}
