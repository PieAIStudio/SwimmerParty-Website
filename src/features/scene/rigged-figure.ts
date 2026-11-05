// Only the lazy canvas imports this module; the editor keeps plain JSON state.
import {
  Bone,
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  SkinnedMesh,
  Vector3,
  type Object3D,
} from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";

export type FigurePose = { bones: Record<string, [number, number, number, number]> };

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

export function poseFigure(source: Object3D, pose: FigurePose, scale: number, sitting: boolean) {
  // Object3D.clone leaves skinned meshes pointing at the source skeleton.
  const object = clone(source);
  const bones = new Map<string, Bone>();
  object.traverse((node) => {
    if (node instanceof Bone) bones.set(node.name, node);
    if (node instanceof SkinnedMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  for (const [name, quaternion] of Object.entries(pose.bones)) {
    const bone = bones.get(name);
    if (!bone) throw new Error(`Unknown figure bone: ${name}`);
    bone.quaternion.fromArray(quaternion);
  }
  object.scale.setScalar(scale);
  updateSkinBounds(object);
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
  const cleanup: (() => void)[] = [];
  object.traverse((node) => {
    if (node instanceof SkinnedMesh) {
      cleanup.push(preparePicking(node), () => node.skeleton.dispose());
    }
  });
  return {
    object,
    top: bounds.max.y,
    seat,
    dispose: () => cleanup.forEach((dispose) => dispose()),
  };
}
