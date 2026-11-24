import { PerspectiveCamera, Vector3 } from "three";
import type { FigureState } from "./model";

export type FilmFitOptions = {
  shot?: string;
  cameraHeight?: number;
  targetHeight?: number;
  /** Focus only the named actors while leaving every other actor in place. */
  focusIds?: string[];
  /** Close framing is deliberately bounded so the room cannot swallow the shot. */
  maxDistance?: number;
};

/** A film composition is fitted without changing actor blocking or the authored camera side. */
export function fitFilmPeople(
  people: FigureState[],
  originalPosition: [number, number, number],
  originalTarget: [number, number, number],
  lens: number,
  options: FilmFitOptions = {},
) {
  const close = options.shot?.toLowerCase() === "close";
  const target: [number, number, number] = [
    originalTarget[0],
    options.targetHeight ?? originalTarget[1],
    originalTarget[2],
  ];
  if (people.length < 2) return { position: originalPosition, target, lens };
  const focused =
    close && options.focusIds?.length
      ? people.filter((person) => options.focusIds!.includes(person.id))
      : people;
  const framingPeople = focused.length >= 1 ? focused : people;
  const bounds = framingPeople.map((person) => {
    const sitting = person.pose === "sit";
    const kneeling = person.pose.includes("kneel");
    const slumped = person.pose.includes("slumped");
    const height = person.heightCm / 100;
    return {
      x: person.x,
      z: person.z,
      lower: close
        ? slumped
          ? 0.55
          : kneeling
            ? 0.48
            : sitting
              ? 0.55
              : 0.65
        : sitting
          ? 0.32
          : 0.4,
      upper: close
        ? slumped
          ? Math.max(1.05, height * 0.78)
          : sitting
            ? Math.max(1.15, height * 0.84)
            : height + 0.04
        : sitting
          ? Math.max(1.1, height * 0.78)
          : height + 0.08,
      // Close coverage is upper-body continuity; keep the crop tight while
      // the full-body wide fit retains the larger stage radius.
      radius: close && options.focusIds?.length ? 0.24 : 0.38,
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
  target[0] = midX;
  target[2] = midZ;
  if (options.targetHeight === undefined) {
    const low = Math.min(...bounds.map((b) => b.lower));
    const high = Math.max(...bounds.map((b) => b.upper));
    target[1] = (low + high) / 2;
  }
  const start = new Vector3(...originalPosition);
  const aim = new Vector3(...target);
  const ray = start
    .clone()
    .sub(new Vector3(...originalTarget))
    .normalize();
  if (ray.lengthSq() < 0.1) ray.set(1, 0.1, 0);
  const maxDistance = close ? (options.maxDistance ?? 2) : undefined;
  const initialDistance = close
    ? Math.min(maxDistance ?? 2, Math.max(1.2, start.distanceTo(aim)))
    : Math.max(1.2, start.distanceTo(aim));
  const boxCorners = bounds.flatMap((b) =>
    [b.x - b.radius, b.x + b.radius].flatMap((x) =>
      [b.lower, b.upper].flatMap((y) =>
        [b.z - b.radius, b.z + b.radius].map((z) => new Vector3(x, y, z)),
      ),
    ),
  );
  // Close shots stay inside the authored 1.2–2m envelope, opening the lens only
  // as much as needed for the two focal actors. Wide shots retain their old search.
  const distances = close
    ? [initialDistance, 1.8, 1.6, 1.4, 1.2].filter(
        (distance, index, values) =>
          distance <= (maxDistance ?? 2) && values.indexOf(distance) === index,
      )
    : [
        initialDistance,
        ...Array.from({ length: 26 }, (_, i) => initialDistance * Math.pow(1.13, i + 1)),
      ];
  for (const distance of distances) {
    const candidateLenses = close
      ? [lens, 24, 22, 20, 18]
      : distance === initialDistance
        ? [lens, 22, 20, 18]
        : [18];
    for (const candidateLens of candidateLenses) {
      const candidate = close ? candidateLens : Math.max(18, Math.min(lens, candidateLens));
      const camera = new PerspectiveCamera(
        (2 * Math.atan(36 / (2 * candidate * (16 / 9))) * 180) / Math.PI,
        16 / 9,
        0.05,
        1000,
      );
      const cameraPosition = aim.clone().addScaledVector(ray, distance);
      if (options.cameraHeight !== undefined) cameraPosition.y = options.cameraHeight;
      camera.position.copy(cameraPosition);
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
  if (close) {
    // A close two-shot must remain usable even when authored marks are wider than
    // the 5% full-body safety box. Keep the hard distance envelope and open to 18mm.
    const distance = Math.min(maxDistance ?? 2, 1.9);
    const camera = new PerspectiveCamera(
      (2 * Math.atan(36 / (2 * 18 * (16 / 9))) * 180) / Math.PI,
      16 / 9,
      0.05,
      1000,
    );
    const cameraPosition = aim.clone().addScaledVector(ray, distance);
    if (options.cameraHeight !== undefined) cameraPosition.y = options.cameraHeight;
    camera.position.copy(cameraPosition);
    camera.lookAt(aim);
    camera.updateMatrixWorld(true);
    return {
      position: camera.position.toArray() as [number, number, number],
      target,
      lens: 18,
    };
  }
  throw new Error("Multi-person framing cannot achieve the required 5% margin");
}
