import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Uint16BufferAttribute,
  Vector3,
} from "three";

/** Neutral mannequin lips/nose, then one curved split on long rigid-head edges. */
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
  const bounds = new Box3();
  for (let i = 0; i < position.count; i++)
    if (rigid(i)) bounds.expandByPoint(new Vector3().fromBufferAttribute(position, i));
  const height = bounds.max.y - bounds.min.y;
  const unit = height / 0.22;
  const neighbours = Array.from({ length: position.count }, () => new Set<number>());
  const source = geometry.index!;
  for (let i = 0; i < source.count; i += 3) {
    const triangle = [source.getX(i), source.getX(i + 1), source.getX(i + 2)];
    for (const a of triangle)
      if (rigid(a)) for (const b of triangle) if (a !== b) neighbours[a].add(b);
  }
  for (let i = 0; i < position.count; i++) {
    if (!rigid(i)) continue;
    const x = position.getX(i);
    const y = (position.getY(i) - bounds.min.y) / height;
    const z = position.getZ(i);
    const front = MathUtils.smoothstep(z, bounds.max.z - 0.06 * unit, bounds.max.z - 0.03 * unit);
    const side = 1 - MathUtils.smoothstep(Math.abs(x), 0.018 * unit, 0.05 * unit);
    const mouth = MathUtils.smoothstep(y, 0.06, 0.12) * (1 - MathUtils.smoothstep(y, 0.23, 0.29));
    const nose = Math.exp(-Math.pow((y - 0.31) / 0.085, 2));
    const average =
      [...neighbours[i]].reduce((sum, n) => sum + position.getZ(n), 0) / neighbours[i].size;
    const smoothed = MathUtils.lerp(z, average, 0.45 * mouth * side * front);
    // Flatten the projecting lip roll but retain its fine neutral seam; soften the nose tip.
    const lipPlane = bounds.max.z - 0.023 * unit;
    positions[i * 3 + 2] =
      smoothed -
      front * side * (Math.max(0, smoothed - lipPlane) * mouth * 0.9 + 0.009 * unit * nose);
  }
  for (let i = 0; i < position.count; i++) position.setZ(i, positions[i * 3 + 2]);
  geometry.computeVertexNormals();
  const midpoint = (a: number, b: number) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (edges.has(key)) return edges.get(key)!;
    const start = new Vector3().fromBufferAttribute(position, a);
    const end = new Vector3().fromBufferAttribute(position, b);
    if (!rigid(a) || !rigid(b) || start.distanceTo(end) <= 0.025) return -1;
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
  return refined;
}
