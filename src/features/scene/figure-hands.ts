// SP shelf-pose polish only. Delivered assets and persisted manual edits stay intact.
import { Bone, Raycaster, SkinnedMesh, Vector3, type Object3D } from "three";
import { createFigureIK } from "./figure-ik";

export function refineShelfPose(object: Object3D, pose: string | undefined, scale: number) {
  const point = (name: string) => object.getObjectByName(name)!.getWorldPosition(new Vector3());
  for (const side of ["l", "r"] as const) {
    const contact = pose === "sit" || (pose === "hand-on-hip" && side === "l");
    const curl =
      pose === "arms-crossed" ? [0.08, 0.6, 0.4] : contact ? [0, 0.08, 0.06] : [0.12, 0.5, 0.35];
    for (const finger of ["index", "middle", "ring", "pinky"])
      for (let joint = 1; joint <= 3; joint++)
        (object.getObjectByName(`${finger}_0${joint}_${side}`) as Bone).rotateX(curl[joint - 1]);
    (object.getObjectByName(`thumb_02_${side}`) as Bone).rotateX(
      pose === "arms-crossed" ? 0.35 : contact ? 0 : 0.12,
    );
    (object.getObjectByName(`thumb_03_${side}`) as Bone).rotateX(
      pose === "arms-crossed" ? 0.3 : contact ? 0 : 0.16,
    );
  }
  if (pose === "lean-in") {
    (object.getObjectByName("spine_01") as Bone).rotateX(0.1);
    (object.getObjectByName("spine_02") as Bone).rotateX(0.08);
    // Open both shoulders by 10°: the broad female arm must clear the ribcage.
    (object.getObjectByName("upperarm_l") as Bone).rotateZ(Math.PI / 18);
    (object.getObjectByName("upperarm_r") as Bone).rotateZ(-Math.PI / 18);
  }
  object.updateWorldMatrix(true, true);
  object.traverse((node) => {
    if (node instanceof SkinnedMesh) node.skeleton.update();
  });
  if (pose !== "sit" && pose !== "arms-crossed") return;
  const ik = createFigureIK(object);
  // Snapshot both upper arms before solving either hand.
  const elbows = { l: point("lowerarm_l"), r: point("lowerarm_r") };
  const shoulders = { l: point("upperarm_l"), r: point("upperarm_r") };
  for (const side of ["l", "r"] as const) {
    const handle = side === "l" ? "leftWrist" : "rightWrist";
    let target: Vector3;
    let normal: Vector3;
    let tangent: Vector3;
    if (pose === "sit") {
      const thigh = point(`thigh_${side}`);
      const knee = point(`calf_${side}`);
      const middle = thigh.clone().lerp(knee, 0.42);
      const hit = new Raycaster(
        middle.clone().add(new Vector3(0, 0.25 * scale, 0)),
        new Vector3(0, -1, 0),
        0,
        0.4 * scale,
      )
        .intersectObject(object, true)
        .find(
          (hit) =>
            hit.object instanceof SkinnedMesh && Math.abs(hit.point.y - middle.y) < 0.13 * scale,
        );
      if (!hit) continue;
      normal = new Vector3(0, 1, 0);
      target = hit.point.clone().addScaledVector(normal, 0.022 * scale);
      tangent = knee.sub(thigh);
    } else {
      const other = side === "l" ? "r" : "l";
      // Wrist at the inner biceps; curled fingers continue behind the other arm.
      target = shoulders[other].clone().lerp(elbows[other], 0.68);
      target.x += (side === "l" ? 1 : -1) * 0.075 * scale;
      target.y -= 0.02 * scale;
      target.z -= 0.005 * scale;
      // Palm faces up under the biceps; fingers point back, not over its front.
      normal = new Vector3(0, -1, 0);
      tangent = shoulders[other].clone().sub(target);
    }
    ik.begin(handle);
    ik.solve(handle, target, normal);
    ik.orient(handle, target, normal, tangent);
  }
  ik.dispose();
}
