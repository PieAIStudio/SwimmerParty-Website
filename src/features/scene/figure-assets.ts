import figures from "./figures.json";
import type { FigureState } from "./model";

/** The only figure-asset seam. Replace manifest URLs with cleared, contract-compatible GLBs. */
export function loadFigure(build: FigureState["build"]): string {
  return figures[build];
}
