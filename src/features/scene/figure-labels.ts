import { Mesh, PerspectiveCamera, Sprite, Vector3, type Object3D } from "three";

/** Reproject from the original anchor each frame: offsets never accumulate on orbit. */
export function placeFigureLabels(
  root: Object3D,
  camera: PerspectiveCamera,
  width: number,
  height: number,
) {
  const placed: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    leader: boolean;
  }[] = [];
  root.updateMatrixWorld(true);
  root.traverse((node) => {
    if (!(node instanceof Sprite) || !node.userData.figureLabel) return;
    const anchor = node.userData.labelAnchor as Vector3;
    const parent = node.parent!;
    const projected = parent.localToWorld(anchor.clone()).project(camera);
    node.position.copy(anchor);
    const scale = (40 * Math.tan((camera.fov * Math.PI) / 360)) / height;
    node.scale.set(scale, scale, 1);
    const leader = parent.getObjectByName("label-leader") as Mesh;
    leader.visible = false;
    // Do not pull off-camera people into the frame (for example in Close-up).
    if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || projected.z > 1) return;
    const x = ((projected.x + 1) * width) / 2;
    const y = ((1 - projected.y) * height) / 2;
    let left = x;
    let top = y;
    const free = (cx: number, cy: number) =>
      cx >= 12 &&
      cx <= width - 12 &&
      cy >= 12 &&
      cy <= height - 12 &&
      placed.every((box) => Math.abs(cx - box.x) >= 24 || Math.abs(cy - box.y) >= 24);
    for (let step = 0; step <= placed.length; step++) {
      const candidates = step
        ? [
            [x, y - step * 24],
            [x + step * 24, y],
            [x - step * 24, y],
          ]
        : [[x, y]];
      const found = candidates.find(([cx, cy]) => free(cx, cy));
      if (found) {
        [left, top] = found;
        break;
      }
    }
    const moved = left !== x || top !== y;
    if (moved) {
      const world = new Vector3(
        (left / width) * 2 - 1,
        1 - (top / height) * 2,
        projected.z,
      ).unproject(camera);
      node.position.copy(parent.worldToLocal(world));
      const points = leader.geometry.attributes.position;
      const person = parent
        .localToWorld((node.userData.labelPerson as Vector3).clone())
        .project(camera);
      const px = ((person.x + 1) * width) / 2;
      const py = ((1 - person.y) * height) / 2;
      const length = Math.hypot(left - px, top - py);
      const dx = (-(top - py) / length) * 0.75;
      const dy = ((left - px) / length) * 0.75;
      let vertex = 0;
      const point = (sx: number, sy: number) => {
        const local = parent.worldToLocal(
          new Vector3((sx / width) * 2 - 1, 1 - (sy / height) * 2, person.z).unproject(camera),
        );
        points.setXYZ(vertex++, local.x, local.y, local.z);
      };
      // A screen-space quad: native WebGL line widths are limited to one pixel.
      for (const [sx, sy] of [
        [px + dx, py + dy],
        [px - dx, py - dy],
        [left - dx, top - dy],
        [px + dx, py + dy],
        [left - dx, top - dy],
        [left + dx, top + dy],
      ])
        point(sx, sy);
      for (let side = 0; side < 8; side++) {
        point(px, py);
        for (const angle of [side, side + 1])
          point(px + 2 * Math.cos((angle * Math.PI) / 4), py + 2 * Math.sin((angle * Math.PI) / 4));
      }
      points.needsUpdate = true;
      leader.visible = true;
    }
    node.updateMatrixWorld(true);
    placed.push({
      id: node.userData.figureLabel,
      x: left,
      y: top,
      width: 20,
      height: 20,
      leader: moved,
    });
  });
  return placed;
}
