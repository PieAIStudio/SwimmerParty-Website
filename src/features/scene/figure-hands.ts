// SP shelf-pose polish only. Delivered assets and persisted manual edits stay intact.
import { Bone, Quaternion, Raycaster, SkinnedMesh, Vector3, type Object3D } from "three";
import { createFigureIK } from "./figure-ik";

function alignThumb(object: Object3D, side: string) {
  const thumb = object.getObjectByName(`thumb_01_${side}`) as Bone;
  const direction = (name: string) =>
    thumb
      .parent!.worldToLocal(object.getObjectByName(name)!.getWorldPosition(new Vector3()))
      .sub(thumb.position)
      .normalize();
  thumb.quaternion.premultiply(
    new Quaternion().setFromUnitVectors(
      direction(`thumb_03_${side}`),
      direction(`index_03_${side}`),
    ),
  );
  thumb.updateWorldMatrix(true, true);
}

export function refineShelfPose(
  object: Object3D,
  pose: string | undefined,
  scale: number,
  standingClearance = 0,
  relaxedLineup = false,
) {
  const point = (name: string) => object.getObjectByName(name)!.getWorldPosition(new Vector3());
  for (const side of ["l", "r"] as const) {
    const contact = pose === "sit" || (pose === "hand-on-hip" && side === "l");
    const curl =
      pose === "arms-crossed" ? [0.08, 0.6, 0.4] : contact ? [0, 0.08, 0.06] : [0.12, 0.2, 0.12];
    const free = !contact && pose !== "arms-crossed";
    const hand = object.getObjectByName(`hand_${side}`)!;
    const contactCurl: Record<string, number[]> = {};
    if (free) hand.userData.contactCurl = contactCurl;
    for (const finger of ["index", "middle", "ring", "pinky"])
      for (let joint = 1; joint <= 3; joint++) {
        const bone = object.getObjectByName(`${finger}_0${joint}_${side}`) as Bone;
        if (free) {
          // Keep build 10's delivered + additive curl for an eventual body contact.
          contactCurl[bone.name] = bone.quaternion
            .clone()
            .multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), curl[joint - 1]))
            .toArray();
          // Free fingers share one closed half-curl, including their knuckle splay.
          bone.rotation.set(curl[joint - 1], 0, 0);
        } else bone.rotateX(curl[joint - 1]);
      }
    const thumb2 = object.getObjectByName(`thumb_02_${side}`) as Bone;
    const thumb3 = object.getObjectByName(`thumb_03_${side}`) as Bone;
    if (free) {
      contactCurl[`thumb_01_${side}`] = object
        .getObjectByName(`thumb_01_${side}`)!
        .quaternion.toArray();
      for (const [bone, bend] of [
        [thumb2, 0.12],
        [thumb3, 0.16],
      ] as const) {
        contactCurl[bone.name] = bone.quaternion
          .clone()
          .multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), bend))
          .toArray();
        bone.rotation.set(bend, 0, 0);
      }
    } else {
      thumb2.rotateX(pose === "arms-crossed" ? 0.35 : 0);
      thumb3.rotateX(pose === "arms-crossed" ? 0.3 : 0);
    }
  }
  object.updateWorldMatrix(true, true);
  for (const side of ["l", "r"] as const) {
    if (pose === "sit" || pose === "arms-crossed" || (pose === "hand-on-hip" && side === "l"))
      continue;
    const hand = object.getObjectByName(`hand_${side}`)!;
    const contactCurl = hand.userData.contactCurl as Record<string, number[]>;
    const freeCurl = Object.fromEntries(
      Object.keys(contactCurl).map((name) => [
        name,
        object.getObjectByName(name)!.quaternion.toArray(),
      ]),
    );
    for (const [name, quaternion] of Object.entries(contactCurl))
      object.getObjectByName(name)!.quaternion.fromArray(quaternion);
    object.updateWorldMatrix(true, true);
    alignThumb(object, side);
    contactCurl[`thumb_01_${side}`] = object
      .getObjectByName(`thumb_01_${side}`)!
      .quaternion.toArray();
    for (const [name, quaternion] of Object.entries(freeCurl))
      object.getObjectByName(name)!.quaternion.fromArray(quaternion);
    object.updateWorldMatrix(true, true);
    alignThumb(object, side);
    freeCurl[`thumb_01_${side}`] = object.getObjectByName(`thumb_01_${side}`)!.quaternion.toArray();
    hand.userData.freeCurl = freeCurl;
  }
  if (pose === "lean-in") {
    (object.getObjectByName("spine_01") as Bone).rotateX(0.1);
    (object.getObjectByName("spine_02") as Bone).rotateX(0.08);
  }
  if (pose === "lean-in" || (pose === "stand" && standingClearance)) {
    // The same clearance that fixed the lean keeps turned stand #5's arms
    // off his back, without changing the other standing figures.
    const opening = ((pose === "lean-in" ? 10 : standingClearance) * Math.PI) / 180;
    (object.getObjectByName("upperarm_l") as Bone).rotateZ(opening);
    (object.getObjectByName("upperarm_r") as Bone).rotateZ(-opening);
  }
  if (relaxedLineup && pose === "lean-in") {
    // Only lineup #5: lower the shoulders 5°, close the arms 6°, lift the chin 8°.
    const radians = Math.PI / 180;
    for (const side of ["l", "r"] as const) {
      const sign = side === "l" ? -1 : 1;
      (object.getObjectByName(`clavicle_${side}`) as Bone).rotateZ(sign * 5 * radians);
      (object.getObjectByName(`upperarm_${side}`) as Bone).rotateZ(sign * 6 * radians);
    }
    (object.getObjectByName("head") as Bone).rotateX(-8 * radians);
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
