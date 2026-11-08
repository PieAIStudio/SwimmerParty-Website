// Only the lazy canvas imports this module; the editor keeps plain JSON state.
import {
  Bone,
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  SkinnedMesh,
  Vector3,
  type Object3D,
} from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { createFigureIK, pinHipHand } from "./figure-ik";
import { refineShelfPose } from "./figure-hands";
import { refineHead } from "./head-geometry";
import type { JointRotations } from "./model";

export type FigurePose = { name?: string; bones: Record<string, [number, number, number, number]> };

// Share a smoothed runtime copy just like the loader shares the original geometry.
// Weld normals and refine only long head edges, without altering the GLB/cache.
const smoothGeometry = new WeakMap<BufferGeometry, BufferGeometry>();
function smoothSkin(source: BufferGeometry, head: number) {
  let geometry = smoothGeometry.get(source);
  if (!geometry) {
    const copy = source.clone();
    copy.deleteAttribute("normal");
    const welded = mergeVertices(copy);
    welded.computeVertexNormals();
    geometry = refineHead(welded, head);
    copy.dispose();
    welded.dispose();
    smoothGeometry.set(source, geometry);
  }
  return geometry;
}

/** Refresh deformed bounds for framing, frustum culling and pointer picking. */
export function updateSkinBounds(root: Object3D) {
  root.updateMatrixWorld(true);
  root.traverse((node) => {
    if (node instanceof SkinnedMesh) {
      node.skeleton.update();
      node.computeBoundingBox();
      node.computeBoundingSphere();
    }
  });
}

/** Poses are static: skin once for precise picking, not for every pointer/triangle. */
function preparePicking(mesh: SkinnedMesh) {
  const geometry = new BufferGeometry();
  const positions = new Float32BufferAttribute(
    new Float32Array(mesh.geometry.attributes.position.count * 3),
    3,
  );
  const vertex = new Vector3();
  for (let index = 0; index < positions.count; index++) {
    mesh.getVertexPosition(index, vertex);
    positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }
  geometry.setAttribute("position", positions);
  geometry.setIndex(mesh.geometry.index);
  geometry.groups = mesh.geometry.groups.map((group) => ({ ...group }));
  geometry.setDrawRange(mesh.geometry.drawRange.start, mesh.geometry.drawRange.count);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const picker = new Mesh(geometry, mesh.material);
  mesh.raycast = (raycaster, intersections) => {
    picker.matrixWorld.copy(mesh.matrixWorld);
    const start = intersections.length;
    picker.raycast(raycaster, intersections);
    for (let index = start; index < intersections.length; index++)
      intersections[index].object = mesh;
  };
  return () => geometry.dispose();
}

export function poseFigure(
  source: Object3D,
  pose: FigurePose,
  scale: number,
  sitting: boolean,
  joints: JointRotations = {},
  shoulder?: { wrist: Vector3; normal: Vector3; tangent: Vector3 },
  editingPair = false,
  standingClearance = 0,
  relaxedLineup = false,
) {
  // Object3D.clone leaves skinned meshes pointing at the source skeleton.
  const object = clone(source);
  const bones = new Map<string, Bone>();
  const material = new MeshStandardMaterial({ color: "#b8b4ac", roughness: 0.88 });
  object.traverse((node) => {
    if (node instanceof Bone) bones.set(node.name, node);
    if (node instanceof SkinnedMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      node.material = material;
      node.geometry = smoothSkin(
        node.geometry,
        node.skeleton.bones.findIndex((bone) => bone.name === "head"),
      );
    }
  });
  for (const [name, quaternion] of Object.entries(pose.bones)) {
    const bone = bones.get(name);
    if (!bone) throw new Error(`Unknown figure bone: ${name}`);
    bone.quaternion.fromArray(quaternion);
  }
  object.scale.setScalar(scale);
  updateSkinBounds(object);
  refineShelfPose(
    object,
    editingPair && pose.name === "hand-on-hip" ? "stand" : pose.name,
    scale,
    standingClearance,
    relaxedLineup,
  );
  updateSkinBounds(object);
  if (pose.name === "hand-on-hip" && !editingPair) {
    pinHipHand(object, scale);
    updateSkinBounds(object);
  }
  const bounds = new Box3().setFromObject(object, true);
  // Measure the actual deformed skin, so every body/pose/height touches y=0.
  object.position.y -= bounds.min.y;
  updateSkinBounds(object);
  bounds.setFromObject(object, true);
  const hips = bones.get("pelvis")!.getWorldPosition(new Vector3());
  // A plain stool follows the hips, sized in metres and scaled with the person.
  const height = Math.max(0.05, hips.y - 0.085 * scale);
  const seat = sitting
    ? {
        position: [hips.x, height / 2, hips.z + 0.035 * scale] as [number, number, number],
        size: [0.44 * scale, height, 0.38 * scale] as [number, number, number],
      }
    : null;
  if (editingPair) {
    // A small elbow bend retains both wrist handles in Medium. The free hand
    // stays beside the hip, fingers down, rather than turning onto the belly.
    const ik = createFigureIK(object);
    const right = ik.position("rightWrist");
    for (const handle of ["leftWrist", "rightWrist"] as const) {
      const wrist = ik.position(handle);
      const left = handle === "leftWrist";
      // In drag mode the unedited hip hand is free too, not a shelf contact.
      if (left && pose.name === "hand-on-hip") {
        wrist.x = 2 * hips.x - right.x;
        wrist.z = right.z;
      }
      wrist.y = bounds.max.y - 0.78 * scale;
      if (left) wrist.z += 0.06 * scale;
      wrist.x += (left ? 1 : -1) * 0.015 * scale;
      ik.begin(handle);
      ik.solve(handle, wrist);
      ik.orient(handle, wrist, new Vector3(left ? 1 : -1, 0, -0.35), new Vector3(0, -1, 0));
    }
    ik.dispose();
  }
  if (shoulder) {
    // The neighbour is already grounded; solve this contact before manual overrides/picking.
    for (const finger of ["index", "middle", "ring", "pinky"])
      for (let joint = 1; joint <= 3; joint++)
        bones.get(`${finger}_0${joint}_r`)!.rotation.set(joint === 1 ? 0.08 : 0.12, 0, 0);
    const ik = createFigureIK(object);
    ik.begin("rightWrist");
    ik.solve("rightWrist", shoulder.wrist, shoulder.normal);
    ik.orient("rightWrist", shoulder.wrist, shoulder.normal, shoulder.tangent);
    ik.dispose();
  }
  // Overrides are relative to the grounded shelf pose: lifting a foot must not
  // re-ground the whole person or move their seat.
  for (const [name, quaternion] of Object.entries(joints))
    bones.get(name)?.quaternion.fromArray(quaternion).normalize();
  updateSkinBounds(object);
  const cleanup: (() => void)[] = [() => material.dispose()];
  object.traverse((node) => {
    if (node instanceof SkinnedMesh) {
      cleanup.push(preparePicking(node), () => node.skeleton.dispose());
    }
  });
  return {
    object,
    top: bounds.max.y,
    contacts: ["foot_l", "foot_r"].map((name) =>
      bones.get(name)!.getWorldPosition(new Vector3()).toArray(),
    ),
    seat,
    dispose: () => cleanup.forEach((dispose) => dispose()),
  };
}
