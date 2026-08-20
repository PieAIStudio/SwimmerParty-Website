import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  Euler,
  Matrix4,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PARTS, type Part } from "./parts";

/**
 * One white model baked into a single BufferGeometry.
 *
 * The hero stage needs the parts separate so they can fly in one at a
 * time. The roster wall does not, and drawing twelve figures out of
 * twenty-four groups each would be 576 draw calls for a background
 * element. Merging collapses a whole figure to one, so twelve of them cost
 * twelve — which is what makes the wall affordable on a phone at all.
 *
 * Built lazily and cached at module scope: the geometry is identical for
 * every figure, and disposing it would only mean rebuilding it on the next
 * route that wants a wall.
 */

function geometryFor(part: Part): BufferGeometry {
  if (part.kind === "sphere") return new SphereGeometry(part.r, 18, 14);
  if (part.kind === "box") return new BoxGeometry(...part.size);
  return new CapsuleGeometry(part.r, part.len, 6, 14);
}

let cached: BufferGeometry | null = null;

export function whiteModelGeometry(): BufferGeometry {
  if (cached) return cached;

  const matrix = new Matrix4();
  const euler = new Euler();
  const placed = PARTS.map((part) => {
    const geom = geometryFor(part);
    const rot = "rot" in part && part.rot ? part.rot : [0, 0, 0];
    euler.set(rot[0], rot[1], rot[2], "XYZ");
    matrix.makeRotationFromEuler(euler);
    matrix.setPosition(part.pos[0], part.pos[1], part.pos[2]);
    geom.applyMatrix4(matrix);
    return geom;
  });

  const merged = mergeGeometries(placed, false);
  placed.forEach((g) => g.dispose());

  // `mergeGeometries` returns null when the inputs disagree on attributes.
  // Every primitive here ships position/normal/uv and an index, so this is
  // a guard against a future part kind, not an expected branch.
  if (!merged) throw new Error("white model geometry failed to merge");

  merged.computeBoundingSphere();
  cached = merged;
  return merged;
}
