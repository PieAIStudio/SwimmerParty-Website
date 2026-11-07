import { Box3, BufferGeometry, MathUtils, Vector3 } from "three";

/** Inset the separate female cap, never the face or the calibrated crown. */
export function softenHairCap(geometry: BufferGeometry) {
  const { position, normal } = geometry.attributes;
  const neighbours = Array.from({ length: position.count }, () => new Set<number>());
  for (let i = 0; i < geometry.index!.count; i += 3) {
    const triangle = [0, 1, 2].map((j) => geometry.index!.getX(i + j));
    for (const a of triangle) for (const b of triangle) if (a !== b) neighbours[a].add(b);
  }
  // The delivered cap is a disconnected component containing the highest vertex.
  let crown = 0;
  for (let i = 1; i < position.count; i++) if (position.getY(i) > position.getY(crown)) crown = i;
  const cap = new Set([crown]);
  for (const i of cap) for (const next of neighbours[i]) cap.add(next);
  const bounds = new Box3();
  for (const i of cap) bounds.expandByPoint(new Vector3().fromBufferAttribute(position, i));
  const centre = bounds.getCenter(new Vector3());
  const originalNormals = normal.array.slice();
  for (const i of cap) {
    const point = new Vector3().fromBufferAttribute(position, i);
    const rim = MathUtils.smoothstep(point.z, bounds.max.z - 0.05, bounds.max.z - 0.02);
    const belowCrown = 1 - MathUtils.smoothstep(point.y, bounds.max.y - 0.015, bounds.max.y - 0.01);
    const inward = new Vector3(point.x - centre.x, 0, point.z - centre.z).normalize();
    point.addScaledVector(inward, -0.0018 * rim * belowCrown);
    position.setXYZ(i, point.x, point.y, point.z);
    const smooth = new Vector3();
    for (const next of neighbours[i])
      smooth.add(new Vector3().fromArray(originalNormals, next * 3));
    const n = new Vector3()
      .fromArray(originalNormals, i * 3)
      .lerp(smooth.normalize(), 0.7 * rim)
      .normalize();
    normal.setXYZ(i, n.x, n.y, n.z);
  }
}
