import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector3,
} from "three";

/** Curve only the back of the head; keep the delivered face's triangles intact. */
export function refineHead(geometry: BufferGeometry, head: number) {
  const { position, normal, skinIndex, skinWeight } = geometry.attributes;
  const positions = Array.from(position.array);
  const indices = Array.from(skinIndex.array);
  const weights = Array.from(skinWeight.array);
  const edges = new Map<string, number>();
  const rigid = (i: number) =>
    [0, 1, 2, 3].some(
      (j) => skinIndex.array[i * 4 + j] === head && skinWeight.array[i * 4 + j] > 0.999,
    );
  const headBounds = new Box3();
  for (let i = 0; i < position.count; i++)
    if (rigid(i)) headBounds.expandByPoint(new Vector3().fromBufferAttribute(position, i));
  const faceDepth = headBounds.getCenter(new Vector3()).z;
  const face = (i: number) => rigid(i) && position.getZ(i) >= faceDepth;
  const faceNormals = new Map<number, Vector3>();
  const source = geometry.index!;
  const midpoint = (a: number, b: number) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (edges.has(key)) return edges.get(key)!;
    const start = new Vector3().fromBufferAttribute(position, a);
    const end = new Vector3().fromBufferAttribute(position, b);
    if (
      !rigid(a) ||
      !rigid(b) ||
      start.z >= faceDepth ||
      end.z >= faceDepth ||
      start.distanceTo(end) <= 0.025
    )
      return -1;
    const na = new Vector3().fromBufferAttribute(normal, a);
    const nb = new Vector3().fromBufferAttribute(normal, b);
    const delta = end.clone().sub(start);
    // Cubic normal-projected edge: follow the skull, not a flat chord.
    const point = start
      .add(end)
      .multiplyScalar(0.5)
      .addScaledVector(nb, delta.dot(nb) / 8)
      .addScaledVector(na, -delta.dot(na) / 8);
    const index = positions.length / 3;
    positions.push(...point.toArray());
    indices.push(head, 0, 0, 0);
    weights.push(1, 0, 0, 0);
    edges.set(key, index);
    return index;
  };
  const triangles: number[] = [];
  for (let i = 0; i < source.count; i += 3) {
    const v = [source.getX(i), source.getX(i + 1), source.getX(i + 2)];
    // After welding, weight each face corner by its angle, not triangle area.
    // Large cheek triangles must not drown out thin eyelid/nostril triangles.
    if (v.some(face)) {
      const points = v.map((i) => new Vector3().fromBufferAttribute(position, i));
      const normal = points[1]
        .clone()
        .sub(points[0])
        .cross(points[2].clone().sub(points[0]))
        .normalize();
      v.forEach((index, j) => {
        if (!face(index)) return;
        const a = points[(j + 1) % 3].clone().sub(points[j]);
        const b = points[(j + 2) % 3].clone().sub(points[j]);
        const angle = Math.atan2(a.clone().cross(b).length(), a.dot(b));
        const sum = faceNormals.get(index) ?? new Vector3();
        sum.addScaledVector(normal, angle);
        faceNormals.set(index, sum);
      });
    }
    const m = v.map((a, j) => midpoint(a, v[(j + 1) % 3]));
    const count = m.filter((index) => index >= 0).length;
    if (!count) {
      triangles.push(...v);
      continue;
    }
    // Rotate to one canonical case for each number of split edges.
    const start = count === 2 ? m.indexOf(-1) : m.findIndex((index) => index >= 0);
    const [a, b, c] = [0, 1, 2].map((j) => v[(start + j) % 3]);
    const [ab, bc, ca] = [0, 1, 2].map((j) => m[(start + j) % 3]);
    if (count === 1) triangles.push(a, ab, c, ab, b, c);
    else if (count === 2) triangles.push(c, ca, bc, a, b, ca, b, bc, ca);
    else triangles.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
  }
  const refined = new BufferGeometry();
  refined.setAttribute("position", new Float32BufferAttribute(positions, 3));
  refined.setAttribute("skinIndex", new Uint16BufferAttribute(indices, 4));
  refined.setAttribute("skinWeight", new Float32BufferAttribute(weights, 4));
  refined.setIndex(triangles);
  refined.computeVertexNormals();
  for (const [i, normal] of faceNormals)
    refined.attributes.normal.setXYZ(i, ...normal.normalize().toArray());
  return refined;
}
