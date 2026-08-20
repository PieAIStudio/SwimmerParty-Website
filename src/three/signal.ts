/**
 * A mutable bridge between DOM scroll/pointer state and the R3F frame loop.
 *
 * Deliberately not React state. Scroll and pointer events fire far faster
 * than React can usefully re-render, and pushing them through `useState`
 * would re-render the whole canvas subtree dozens of times a second. GSAP
 * writes into this object, `useFrame` reads it, and React never learns
 * that anything moved.
 */
export const stageSignal = {
  /** 0 = parts scattered, 1 = body assembled. */
  assembly: 1,
  /** Pointer position in normalised device coordinates, −1…1. */
  pointerX: 0,
  pointerY: 0,
  /** Extra yaw fed by scroll, in radians. */
  scrollSpin: 0,
};

export function resetStageSignal() {
  stageSignal.assembly = 1;
  stageSignal.pointerX = 0;
  stageSignal.pointerY = 0;
  stageSignal.scrollSpin = 0;
}
