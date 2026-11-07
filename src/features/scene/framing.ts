// Imported only by the lazy canvas: no Three.js in the editor or site shell.
import { Box3, Matrix4, PerspectiveCamera, Vector3 } from "three";
import type { CameraControls } from "@react-three/drei/core/CameraControls";
import type { CameraState, FigureState } from "./model";

export function setLens(camera: PerspectiveCamera, state: CameraState) {
  // Fixed 36 mm horizontal sensor gate, including portrait crops.
  camera.fov =
    (2 * Math.atan(state.sensorWidth / (2 * state.lens * camera.aspect)) * 180) / Math.PI;
  camera.updateProjectionMatrix();
}

function shotBounds(body: Box3, figure: FigureState, shot: CameraState["shot"]) {
  const box = body.clone();
  const height = body.max.y - body.min.y;
  if (shot === "full") box.max.y += 0.28; // The attached number is part of the full shot.
  else {
    box.min.y += height * (shot === "medium" ? 0.42 : 0.64);
    const halfWidth = Math.min(
      (box.max.x - box.min.x) / 2,
      height * (shot === "medium" ? 0.36 : 0.13),
    );
    box.min.x = Math.max(box.min.x, figure.x - halfWidth);
    box.max.x = Math.min(box.max.x, figure.x + halfWidth);
    // Medium is also the phone editing shot: retain the attached number/head handle.
    box.max.y += shot === "medium" ? 0.28 : height * 0.04;
  }
  return box;
}

export function frameFigures(
  controls: CameraControls,
  state: CameraState,
  figures: FigureState[],
  bodies: Map<string, Box3>,
  editingPair = false,
) {
  const subjects = figures.filter(
    (figure) => editingPair || state.subject === "everyone" || figure.id === state.subject,
  );
  const targets = subjects.length ? subjects : figures;
  const box = new Box3();
  for (const figure of targets) {
    const body = bodies.get(figure.id);
    if (body) box.union(shotBounds(body, figure, state.shot));
  }
  if (box.isEmpty()) return;
  const center = box.getCenter(new Vector3());
  const direction = new Vector3(
    0,
    state.view === "high" ? 0.65 : state.view === "low" ? -0.16 : 0,
    1,
  ).normalize();
  const a = figures[0];
  const b = figures[1];
  if (state.view === "shoulder" && b) {
    direction.set(a.x - b.x, 0, a.z - b.z);
    if (direction.lengthSq() < 0.01) direction.set(0, 0, 1);
    direction.normalize();
    const side = new Vector3(direction.z, 0, -direction.x);
    direction.addScaledVector(side, 0.32).setY(0.1).normalize();
  }
  // fitToBox snaps arbitrary angles to a cardinal axis in camera-controls 3.1.2.
  // Use its distance solver on camera-oriented posed bounds to keep Low/High/OTS.
  const rotation = new Matrix4().lookAt(direction, new Vector3(), new Vector3(0, 1, 0)).invert();
  const size = box
    .clone()
    .translate(center.clone().negate())
    .applyMatrix4(rotation)
    .getSize(new Vector3());
  let distance = controls.getDistanceToFitBox(size.x * 1.1, size.y * 1.1, size.z);
  const phoneLineup =
    state.shot === "medium" &&
    state.view === "eye" &&
    targets.length === 8 &&
    targets.every((figure) => figure.z === targets[0].z);
  if (phoneLineup) {
    // Keep the same one-row width, but put the number row 12% from the top.
    // Medium bounds include 28 cm above the crown; number anchors use 20 cm.
    const camera = controls.camera as PerspectiveCamera;
    const rowDistance = distance + center.z - targets[0].z;
    const visibleHeight = 2 * rowDistance * Math.tan((camera.fov * Math.PI) / 360);
    center.y = box.max.y - 0.08 - visibleHeight * 0.38;
  }
  if (editingPair) {
    // A medium editing crop may lose the legs, not half the stage to empty space.
    // Keep the 56% width; put the tallest crown 10% below the image top.
    distance = controls.getDistanceToFitBox(size.x / 0.56, 0, size.z);
    const visibleHeight = size.x / 0.56 / (controls.camera as PerspectiveCamera).aspect;
    center.y = box.max.y - 0.28 - visibleHeight * 0.445;
  }
  if (state.view === "shoulder" && b)
    distance = Math.max(distance, Math.hypot(a.x - b.x, a.z - b.z) + 0.75);
  const position = center.clone().addScaledVector(direction, distance);
  position.y = Math.max(0.15, position.y);
  if (state.view === "shoulder")
    position.y = Math.max(position.y, (bodies.get(a.id)?.max.y ?? center.y) * 0.9);
  void controls.setLookAt(...position.toArray(), ...center.toArray(), false);
  controls.update(0);
  return box;
}
