// Runtime-only adapter: the delivered skeleton/mesh and loader cache stay untouched.
import { Bone, SkinnedMesh, Vector3, type Object3D } from "three";
import { CCDIKSolver, type IK } from "three/addons/animation/CCDIKSolver.js";
import type { JointRotations } from "./model";

export const HANDLES = ["leftWrist", "rightWrist", "leftAnkle", "rightAnkle", "head"] as const;
export type Handle = (typeof HANDLES)[number];

export function createFigureIK(object: Object3D) {
  let skin!: SkinnedMesh;
  object.traverse((node) => {
    if (node instanceof SkinnedMesh) skin = node;
  });
  const bones = skin.skeleton.bones;
  const index = (name: string) => bones.findIndex((bone) => bone.name === name);
  const target = new Bone();
  const tip = new Bone();
  tip.position.set(0, 0.16, 0);
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
  return {
    effector: (handle: Handle) => all[chains[handle].effector],
    position: (handle: Handle) => all[chains[handle].effector].getWorldPosition(new Vector3()),
    solve(handle: Handle, point: Vector3) {
      object.updateWorldMatrix(true, true);
      target.matrixWorld.makeTranslation(point.x, point.y, point.z);
      solver.updateOne(chains[handle]);
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
