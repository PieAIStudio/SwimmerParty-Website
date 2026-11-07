import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Uint16BufferAttribute,
  Vector3,
} from "three";

/** Smooth the entire lower face with its boundary held, then refine long skull edges. */
export function refineHead(geometry: BufferGeometry, head: number, female: boolean) {
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
  const faceWeights = Array<number>(position.count).fill(0);
  const cheekWeights = Array<number>(position.count).fill(0);
  const neighbours = Array.from({ length: position.count }, () => new Set<number>());
  const source = geometry.index!;
  for (let i = 0; i < source.count; i += 3) {
    const triangle = [source.getX(i), source.getX(i + 1), source.getX(i + 2)];
    for (const a of triangle) for (const b of triangle) if (a !== b) neighbours[a].add(b);
  }
  for (let i = 0; i < position.count; i++) {
    // Lip rims have tiny neck weights (about 0.1%); do not leave them as spikes.
    if (
      ![0, 1, 2, 3].some(
        (j) => skinIndex.array[i * 4 + j] === head && skinWeight.array[i * 4 + j] > 0.95,
      )
    )
      continue;
    const x = position.getX(i);
    const y = (position.getY(i) - bounds.min.y) / height;
    const z = position.getZ(i);
    const front = MathUtils.smoothstep(z, bounds.max.z - 0.1 * unit, bounds.max.z - 0.055 * unit);
    const side = 1 - MathUtils.smoothstep(Math.abs(x), 0.038 * unit, 0.07 * unit);
    const lowerFace = MathUtils.smoothstep(y, 0, 0.035) * (1 - MathUtils.smoothstep(y, 0.24, 0.4));
    const nose =
      Math.exp(-Math.pow((y - 0.31) / 0.085, 2)) *
      MathUtils.smoothstep(y, 0.2, 0.25) *
      (1 - MathUtils.smoothstep(y, 0.45, 0.5));
    const cheek =
      MathUtils.smoothstep(Math.abs(x), 0.012 * unit, 0.028 * unit) *
      (1 - MathUtils.smoothstep(Math.abs(x), 0.05 * unit, 0.07 * unit)) *
      MathUtils.smoothstep(y, 0.12, 0.2) *
      (1 - MathUtils.smoothstep(y, 0.4, 0.5)) *
      front;
    faceWeights[i] = lowerFace * side * front;
    positions[i * 3 + 2] = z - 0.009 * unit * nose * side * front;
    cheekWeights[i] = female ? cheek : 0;
  }
  // Diffuse the full nose-base-to-chin patch, not just the dense lip rings.
  // The mask is fixed in source space, so its rim, eyes and crown cannot drift.
  for (let pass = 0; pass < 80; pass++) {
    const previous = positions.slice();
    for (let i = 0; i < position.count; i++) {
      if (!faceWeights[i] || !neighbours[i].size) continue;
      const average =
        [...neighbours[i]].reduce((sum, n) => sum + previous[n * 3 + 2], 0) / neighbours[i].size;
      positions[i * 3 + 2] = MathUtils.lerp(previous[i * 3 + 2], average, 0.6 * faceWeights[i]);
    }
  }
  for (let i = 0; i < position.count; i++) {
    const outward = new Vector3()
      .fromBufferAttribute(normal, i)
      .multiplyScalar(0.0025 * unit * cheekWeights[i]);
    positions[i * 3] += outward.x;
    positions[i * 3 + 1] += outward.y;
    positions[i * 3 + 2] += outward.z;
    position.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
  }
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
    faceWeights.push((faceWeights[a] + faceWeights[b]) / 2);
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
  const normals = refined.attributes.normal;
  const smoothedNormal = new Vector3();
  for (let i = 0; i < faceWeights.length; i++) {
    if (!faceWeights[i]) continue;
    const x = positions[i * 3];
    // The former folds share one plain lower-face tangent, not a dark mouth crease.
    const tangent = new Vector3((1.6 * x) / unit, 0, 1).normalize();
    smoothedNormal.fromBufferAttribute(normals, i).lerp(tangent, faceWeights[i]).normalize();
    normals.setXYZ(i, smoothedNormal.x, smoothedNormal.y, smoothedNormal.z);
  }
  return refined;
}
