/**
 * The white model's part list — 白膜.
 *
 * A deliberately un-finished mannequin assembled from primitives. It is a
 * placeholder in the literal sense and a statement in the figurative one:
 * this house builds actors, and this is what one looks like before the
 * surface goes on. When a real rigged .glb exists it drops in behind the
 * same props and nothing else on the page changes.
 *
 * Proportions are real metres against a 1.755 m figure, and every segment
 * is capped by a joint sphere so the limbs read as one body rather than a
 * stack of pills. Capsule total length is `len + 2 * r` — the spans in the
 * comments are what keeps the joints touching.
 */

const HIP_X = 0.088;
const ARM_X = 0.225;

export type Part =
  | {
      kind: "capsule";
      pos: [number, number, number];
      r: number;
      len: number;
      rot?: [number, number, number];
    }
  | { kind: "sphere"; pos: [number, number, number]; r: number }
  | { kind: "box"; pos: [number, number, number]; size: [number, number, number] };

export const PARTS: Part[] = [
  // ---- head / neck ----
  { kind: "sphere", pos: [0, 1.648, 0], r: 0.113 }, //            1.545 – 1.755
  { kind: "capsule", pos: [0, 1.5, 0], r: 0.045, len: 0.06 }, // 1.425 – 1.575

  // ---- torso ----
  { kind: "capsule", pos: [0, 1.24, 0], r: 0.158, len: 0.2 }, // 0.995 – 1.485
  { kind: "capsule", pos: [0, 0.99, 0], r: 0.132, len: 0.06 }, // 0.840 – 1.140  (pelvis)

  // ---- arms: shoulder → upper → elbow → fore → hand ----
  { kind: "sphere", pos: [-ARM_X + 0.02, 1.42, 0], r: 0.062 },
  { kind: "sphere", pos: [ARM_X - 0.02, 1.42, 0], r: 0.062 },
  { kind: "capsule", pos: [-ARM_X, 1.28, 0], r: 0.05, len: 0.2 },
  { kind: "capsule", pos: [ARM_X, 1.28, 0], r: 0.05, len: 0.2 },
  { kind: "sphere", pos: [-ARM_X - 0.012, 1.13, 0], r: 0.052 },
  { kind: "sphere", pos: [ARM_X + 0.012, 1.13, 0], r: 0.052 },
  { kind: "capsule", pos: [-ARM_X - 0.02, 0.99, 0], r: 0.044, len: 0.2 },
  { kind: "capsule", pos: [ARM_X + 0.02, 0.99, 0], r: 0.044, len: 0.2 },
  { kind: "sphere", pos: [-ARM_X - 0.027, 0.83, 0], r: 0.053 },
  { kind: "sphere", pos: [ARM_X + 0.027, 0.83, 0], r: 0.053 },

  // ---- legs: hip → thigh → knee → shin → foot ----
  { kind: "sphere", pos: [-HIP_X, 0.93, 0], r: 0.082 },
  { kind: "sphere", pos: [HIP_X, 0.93, 0], r: 0.082 },
  { kind: "capsule", pos: [-HIP_X, 0.711, 0], r: 0.075, len: 0.3 }, // 0.486 – 0.936
  { kind: "capsule", pos: [HIP_X, 0.711, 0], r: 0.075, len: 0.3 },
  { kind: "sphere", pos: [-HIP_X, 0.486, 0], r: 0.064 },
  { kind: "sphere", pos: [HIP_X, 0.486, 0], r: 0.064 },
  { kind: "capsule", pos: [-HIP_X, 0.278, 0], r: 0.058, len: 0.3 }, // 0.070 – 0.486
  { kind: "capsule", pos: [HIP_X, 0.278, 0], r: 0.058, len: 0.3 },
  { kind: "box", pos: [-HIP_X, 0.038, 0.05], size: [0.098, 0.076, 0.235] },
  { kind: "box", pos: [HIP_X, 0.038, 0.05], size: [0.098, 0.076, 0.235] },
];

/**
 * Where a part waits before the body is assembled.
 *
 * Deterministic rather than `Math.random()`: the assembly has to look the
 * same on the server-rendered first paint as on every reload, and a scrub
 * that reshuffles when you scroll back up reads as a bug, not a feature.
 * The hash is a cheap integer scramble — it only has to be unmemorable.
 */
export function scatterOf(i: number): {
  offset: [number, number, number];
  rot: [number, number, number];
} {
  const h = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x) - 0.5;
  };
  return {
    offset: [h(1) * 5.2, h(2) * 3.4, h(3) * 4.6],
    rot: [h(4) * 5, h(5) * 5, h(6) * 5],
  };
}

/** Feet arrive first, head last — the order reads as a body being built. */
export function assemblyOrder(i: number): number {
  return 1 - i / (PARTS.length - 1);
}
