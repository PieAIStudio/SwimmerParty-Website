import { PerspectiveCamera, Vector3 } from "three";
import type { FigureState } from "./model";

/** A film composition is fitted without changing actor blocking or the authored camera side. */
export function fitFilmPeople(
  people: FigureState[],
  originalPosition: [number, number, number],
  originalTarget: [number, number, number],
  lens: number,
) {
  if (people.length < 2) return { position: originalPosition, target: originalTarget, lens };
  const bounds = people.map((person) => {
    const sitting = person.pose === "sit";
    const height = person.heightCm / 100;
    return {
      x: person.x,
      z: person.z,
      lower: sitting ? 0.32 : 0.4,
      upper: sitting ? Math.max(1.1, height * 0.78) : height + 0.08,
      radius: 0.38,
    };
  });
  const midX =
    (Math.min(...bounds.map((b) => b.x - b.radius)) +
      Math.max(...bounds.map((b) => b.x + b.radius))) /
    2;
  const midZ =
    (Math.min(...bounds.map((b) => b.z - b.radius)) +
      Math.max(...bounds.map((b) => b.z + b.radius))) /
    2;
  const low = Math.min(...bounds.map((b) => b.lower));
  const high = Math.max(...bounds.map((b) => b.upper));
  const target: [number, number, number] = [midX, (low + high) / 2, midZ];
  const start = new Vector3(...originalPosition);
  const aim = new Vector3(...target);
  const ray = start
    .clone()
    .sub(new Vector3(...originalTarget))
    .normalize();
  if (ray.lengthSq() < 0.1) ray.set(1, 0.1, 0);
  const initialDistance = Math.max(1.2, start.distanceTo(aim));
  const boxCorners = bounds.flatMap((b) =>
    [b.x - b.radius, b.x + b.radius].flatMap((x) =>
      [b.lower, b.upper].flatMap((y) =>
        [b.z - b.radius, b.z + b.radius].map((z) => new Vector3(x, y, z)),
      ),
    ),
  );
  // First widen to 18 mm; only then move the camera outward beyond occluding walls.
  for (const distance of [
    initialDistance,
    ...Array.from({ length: 26 }, (_, i) => initialDistance * Math.pow(1.13, i + 1)),
  ]) {
    for (const candidateLens of distance === initialDistance ? [lens, 22, 20, 18] : [18]) {
      const candidate = Math.max(18, Math.min(lens, candidateLens));
      const camera = new PerspectiveCamera(
        (2 * Math.atan(36 / (2 * candidate * (16 / 9))) * 180) / Math.PI,
        16 / 9,
        0.05,
        1000,
      );
      camera.position.copy(aim).addScaledVector(ray, distance);
      camera.lookAt(aim);
      camera.updateMatrixWorld(true);
      const fits = boxCorners.every((corner) => {
        const p = corner.clone().project(camera);
        return p.z >= -1 && p.z <= 1 && Math.abs(p.x) <= 0.9 && Math.abs(p.y) <= 0.9;
      });
      if (fits)
        return {
          position: camera.position.toArray() as [number, number, number],
          target,
          lens: candidate,
        };
    }
  }
  throw new Error("Multi-person framing cannot achieve the required 5% margin");
}
