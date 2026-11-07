// Runtime-only adapter: the delivered skeleton/mesh and loader cache stay untouched.
import {
  Bone,
  Matrix3,
  Matrix4,
  Quaternion,
  Raycaster,
  SkinnedMesh,
  Vector3,
  type Object3D,
} from "three";
import { CCDIKSolver, type IK } from "three/addons/animation/CCDIKSolver.js";
import type { JointRotations } from "./model";

export const HANDLES = ["leftWrist", "rightWrist", "leftAnkle", "rightAnkle", "head"] as const;
export type Handle = (typeof HANDLES)[number];

/** Sample the visible skin near a shoulder, using the posed picking mesh. */
export function shoulderContact(object: Object3D, bone: Object3D, from: Vector3) {
  const pivot = bone.getWorldPosition(new Vector3());
  const elbow = object.getObjectByName(bone.name.replace("upperarm", "lowerarm"));
  if (!elbow) return null;
  // Scale the shoulder search to the delivered arm, including turned/broader bodies.
  const radius = pivot.distanceTo(elbow.getWorldPosition(new Vector3()));
  const outward = from.clone().sub(pivot).normalize();
  const ray = new Raycaster(
    pivot.clone().addScaledVector(outward, 0.5),
    outward.clone().negate(),
    0,
    1,
  );
  const hit = ray
    .intersectObject(object, true)
    .find(
      (item) =>
        item.object instanceof SkinnedMesh && item.face && item.point.distanceTo(pivot) < radius,
    );
  if (!hit?.face) return null;
  const normal = hit.face.normal
    .clone()
    .applyMatrix3(new Matrix3().getNormalMatrix(hit.object.matrixWorld))
    .normalize();
  if (normal.dot(outward) < 0) normal.negate();
  return { point: hit.point, normal, wrist: hit.point.clone().addScaledVector(normal, 0.025) };
}

function orientHand(
  hand: Bone,
  point: Vector3,
  baseline: Quaternion,
  surfaceNormal?: Vector3,
  tangent?: Vector3,
) {
  const side = hand.name.endsWith("_l") ? "l" : "r";
  const finger = hand.getObjectByName(`middle_01_${side}`)!.position.clone().normalize();
  const world = baseline.clone();
  const direction = (
    tangent?.clone() ?? point.clone().sub(hand.parent!.getWorldPosition(new Vector3()))
  ).normalize();
  if (!surfaceNormal) {
    world.premultiply(
      new Quaternion().setFromUnitVectors(finger.clone().applyQuaternion(world), direction),
    );
  } else {
    const index = hand.getObjectByName(`index_01_${side}`)!.position;
    const pinky = hand.getObjectByName(`pinky_01_${side}`)!.position;
    const palm = new Vector3()
      .crossVectors(index, pinky)
      .multiplyScalar(side === "l" ? -1 : 1)
      .projectOnPlane(finger)
      .normalize();
    const normal = surfaceNormal.clone().negate();
    direction.projectOnPlane(normal);
    if (direction.lengthSq() < 0.001) direction.set(0, 1, 0).projectOnPlane(normal);
    if (direction.lengthSq() < 0.001) direction.set(0, 0, 1).projectOnPlane(normal);
    direction.normalize();
    const local = new Matrix4().makeBasis(finger, palm.clone().cross(finger).normalize(), palm);
    const aimed = new Matrix4().makeBasis(
      direction,
      normal.clone().cross(direction).normalize(),
      normal,
    );
    world.setFromRotationMatrix(aimed.multiply(local.invert()));
  }
  hand.quaternion
    .copy(hand.parent!.getWorldQuaternion(new Quaternion()).invert().multiply(world))
    .normalize();
}

/** Shelf-pose correction only; saved manual joint edits are applied afterwards. */
export function pinHipHand(object: Object3D, scale: number) {
  const pelvis = object.getObjectByName("pelvis")!.getWorldPosition(new Vector3());
  const origin = pelvis.clone().add(new Vector3(0.6, 0.045, 0).multiplyScalar(scale));
  const hit = new Raycaster(origin, new Vector3(-1, 0, 0), 0, scale)
    .intersectObject(object, true)
    .find((item) => item.object instanceof SkinnedMesh && item.face);
  if (!hit?.face) return;
  const normal = hit.face.normal
    .clone()
    .applyMatrix3(new Matrix3().getNormalMatrix(hit.object.matrixWorld))
    .normalize();
  const wrist = hit.point.clone().addScaledVector(normal, 0.018 * scale);
  const ik = createFigureIK(object);
  ik.begin("leftWrist");
  ik.solve("leftWrist", wrist, normal);
  orientHand(ik.effector("leftWrist"), wrist, new Quaternion(), normal, new Vector3(0, -1, 0.45));
  object.updateWorldMatrix(true, true);
  ik.dispose();
}

export function createFigureIK(object: Object3D) {
  let skin!: SkinnedMesh;
  object.traverse((node) => {
    if (node instanceof SkinnedMesh) skin = node;
  });
  const bones = skin.skeleton.bones;
  const index = (name: string) => bones.findIndex((bone) => bone.name === name);
  const target = new Bone();
  const tip = new Bone();
  // Forehead rather than crown: the full 32px target stays inside a phone crop.
  tip.position.set(0, 0.1, 0);
  bones[index("head")].add(tip);
  const all = [...bones, target, tip];
  const chain = (end: string, middle: string, upper: string): IK => {
    const hinge = bones[index(middle)].rotation;
    return {
      target: bones.length,
      effector: index(end),
      iteration: 32,
      maxAngle: 0.16,
      links: [
        // Keep the original hinge plane and a positive bend, away from the straight-arm
        // singularity. The elbow/knee cannot choose the mirrored solution on a drag.
        {
          index: index(middle),
          rotationMin: new Vector3(0.04, hinge.y, hinge.z),
          rotationMax: new Vector3(2.65, hinge.y, hinge.z),
        },
        { index: index(upper) },
      ],
    };
  };
  const chains: Record<Handle, IK> = {
    leftWrist: chain("hand_l", "lowerarm_l", "upperarm_l"),
    rightWrist: chain("hand_r", "lowerarm_r", "upperarm_r"),
    leftAnkle: chain("foot_l", "calf_l", "thigh_l"),
    rightAnkle: chain("foot_r", "calf_r", "thigh_r"),
    head: {
      target: bones.length,
      effector: bones.length + 1,
      iteration: 20,
      maxAngle: 0.12,
      links: [
        {
          index: index("head"),
          rotationMin: new Vector3(-0.95, -1.1, -0.5),
          rotationMax: new Vector3(0.4, 1.1, 0.5),
        },
        {
          index: index("neck_01"),
          rotationMin: new Vector3(0.15, -0.45, -0.3),
          rotationMax: new Vector3(0.85, 0.45, 0.3),
        },
      ],
    },
  };
  // CCD only reads skeleton.bones. A private view adds target/tip without changing
  // the 53-bone skin's bind matrices, inverses, texture or asset contract.
  const solver = new CCDIKSolver(
    { skeleton: { bones: all } } as SkinnedMesh,
    Object.values(chains),
  );
  object.updateWorldMatrix(true, true);
  const arms = (["l", "r"] as const).map((side) => {
    const clavicle = bones[index(`clavicle_${side}`)];
    const hand = bones[index(`hand_${side}`)];
    const parent = clavicle.parent!;
    const direction = hand
      .getWorldPosition(new Vector3())
      .sub(clavicle.getWorldPosition(new Vector3()))
      .transformDirection(parent.matrixWorld.clone().invert());
    return {
      clavicle,
      hand,
      direction,
      rotation: clavicle.quaternion.clone(),
      world: hand.getWorldQuaternion(new Quaternion()),
    };
  });
  return {
    begin(handle: Handle) {
      object.updateWorldMatrix(true, true);
      const arm = handle === "leftWrist" ? arms[0] : handle === "rightWrist" ? arms[1] : null;
      if (!arm) return;
      arm.rotation.copy(arm.clavicle.quaternion);
      arm.direction
        .copy(arm.hand.getWorldPosition(new Vector3()))
        .sub(arm.clavicle.getWorldPosition(new Vector3()))
        .transformDirection(arm.clavicle.parent!.matrixWorld.clone().invert());
      arm.hand.getWorldQuaternion(arm.world);
    },
    orient(handle: Handle, point: Vector3, normal: Vector3, tangent: Vector3) {
      orientHand(all[chains[handle].effector], point, new Quaternion(), normal, tangent);
      object.updateWorldMatrix(true, true);
      skin.skeleton.update();
    },
    effector: (handle: Handle) => all[chains[handle].effector],
    position: (handle: Handle) => all[chains[handle].effector].getWorldPosition(new Vector3()),
    solve(handle: Handle, point: Vector3, surfaceNormal?: Vector3) {
      object.updateWorldMatrix(true, true);
      const arm = handle === "leftWrist" ? arms[0] : handle === "rightWrist" ? arms[1] : null;
      if (arm) {
        // Absolute follow from the gesture base, never compounded on pointer moves.
        const direction = point
          .clone()
          .sub(arm.clavicle.getWorldPosition(new Vector3()))
          .transformDirection(arm.clavicle.parent!.matrixWorld.clone().invert());
        const swing = new Quaternion().setFromUnitVectors(arm.direction, direction);
        arm.clavicle.quaternion
          .copy(new Quaternion().slerp(swing, 0.2).multiply(arm.rotation))
          .normalize();
        arm.clavicle.updateWorldMatrix(true, true);
      }
      target.matrixWorld.makeTranslation(point.x, point.y, point.z);
      solver.updateOne(chains[handle]);
      if (arm) {
        // A snapped wrist uses build 10's contact curl, never the free-hand override.
        // Switching back off the body restores the shared closed half-curl.
        const curl = (
          surfaceNormal ? arm.hand.userData.contactCurl : arm.hand.userData.freeCurl
        ) as Record<string, number[]> | undefined;
        for (const [name, quaternion] of Object.entries(curl ?? {}))
          object.getObjectByName(name)!.quaternion.fromArray(quaternion);
        orientHand(arm.hand, point, arm.world, surfaceNormal);
      }
      object.updateWorldMatrix(true, true);
      skin.skeleton.update();
    },
    rotations(): JointRotations {
      return Object.fromEntries(bones.map((bone) => [bone.name, bone.quaternion.toArray()]));
    },
    dispose() {
      tip.removeFromParent();
    },
  };
}
