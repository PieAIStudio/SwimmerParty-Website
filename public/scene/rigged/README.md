# SwimmerParty Rigged Stage Mannequin Family (`handoff-rigged/`)

Six CC0-1.0 skinned rest-pose stage mannequins (`slim`, `average`, `broad`, `slim-f`, `average-f`, `broad-f`) sharing a single canonical 53-bone humanoid skeleton (`mpfb2-game_engine-53`), plus 12 bone-local quaternion pose files (`poses/*.json`) that work interchangeably across all 6 bodies.

## Contents

- **6 Skinned Rest-Pose GLBs** (`+Y` up, `+Z` forward, metres, floor origin `y_min = 0.0`, 0 textures, 1 `SkinnedMesh`, 53 bones):
  - Male builds (`7,478` triangles, `~227 KB` each): `slim.glb` (`1.72 m`), `average.glb` (`1.75 m`), `broad.glb` (`1.79 m`)
  - Female builds (`8,022` triangles with sculptural bob+bun hair weighted `1.0` to `head`, `~243 KB` each): `slim-f.glb` (`1.64 m`), `average-f.glb` (`1.68 m`), `broad-f.glb` (`1.71 m`)
- **12 Shared Pose Shelf JSONs** (`poses/*.json`, `[x, y, z, w]` bone-local quaternions on `mpfb2-game_engine-53`):
  - Core poses (6): `stand.json`, `walk.json`, `point.json`, `wave.json`, `sit.json`, `arms-crossed.json`
  - Two-person dialogue & staging poses (6): `lean-in.json`, `hand-on-hip.json`, `hands-on-table.json`, `look-over-shoulder.json`, `hug-ready.json`, `kneel.json`
- **Metadata & Provenance**:
  - `manifest.json` — SHA-256 hashes, byte sizes, triangle counts, bounds, 53-bone hierarchy & canonical rest quaternions
  - `LICENSE.md` — CC0-1.0 public domain dedication & verbatim MPFB 2.0.18 `base.obj` / `rig.game_engine.json` provenance

---

## Three.js Load + Apply-Pose Snippet (`SkinnedMesh`, Bones by Name)

All 6 GLBs share the exact same 53 bone names and canonical rest-pose local orientations (`node.rotation` in glTF). To apply any `poses/<pose>.json` file in Three.js, index the `SkinnedMesh.skeleton.bones` map by `bone.name` and copy each `[x, y, z, w]` parent-local quaternion from `poseData.bones`:

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const loader = new GLTFLoader();

/**
 * Index all bones by name from the first SkinnedMesh in a loaded/cloned root.
 * @param {THREE.Object3D} root
 * @returns {Map<string, THREE.Bone>}
 */
export function indexBonesByName(root) {
  const boneMap = new Map();
  root.traverse((obj) => {
    if (obj.isSkinnedMesh && obj.skeleton) {
      for (const bone of obj.skeleton.bones) {
        boneMap.set(bone.name, bone);
      }
    } else if (obj.isBone && !boneMap.has(obj.name)) {
      boneMap.set(obj.name, obj);
    }
  });
  return boneMap;
}

/**
 * Apply a shared pose JSON (`poses/*.json`) to any of the 6 rigged bodies.
 * Works with either the full pose JSON object (`poseData.bones`) or a raw `{ [boneName]: [x,y,z,w] }` map.
 *
 * @param {THREE.Object3D} actorRoot - Loaded gltf.scene or SkeletonUtils.clone(gltf.scene)
 * @param {object} poseData - Parsed JSON from `handoff-rigged/poses/<pose>.json`
 * @param {object} [options]
 * @param {string} [options.buildId] - Optional build key ('slim'|'average'|'broad'|'slim-f'|'average-f'|'broad-f') for exact floor grounding
 * @param {boolean} [options.groundToFloor=true] - Apply vertical grounding offset so feet/knees rest at y = 0
 */
export function applyPose(actorRoot, poseData, { buildId, groundToFloor = true } = {}) {
  const bonesRecord = poseData.bones ?? poseData;
  const boneMap = indexBonesByName(actorRoot);

  for (const [boneName, xyzw] of Object.entries(bonesRecord)) {
    const bone = boneMap.get(boneName);
    if (bone && Array.isArray(xyzw) && xyzw.length === 4) {
      bone.quaternion.fromArray(xyzw);
    }
  }

  if (groundToFloor && typeof poseData === 'object') {
    const dy =
      (buildId && poseData.groundOffsetByBuild?.[buildId]) ??
      poseData.groundOffsetY ??
      0;
    actorRoot.position.y = dy;
  }

  actorRoot.updateMatrixWorld(true);
}

// Example usage: load `average-f.glb` + `broad.glb` and stage a two-person conversation
async function stageDialogueExample(scene) {
  const [femaleGltf, maleGltf, leanInPose, handOnHipPose] = await Promise.all([
    loader.loadAsync('./handoff-rigged/average-f.glb'),
    loader.loadAsync('./handoff-rigged/broad.glb'),
    fetch('./handoff-rigged/poses/lean-in.json').then((r) => r.json()),
    fetch('./handoff-rigged/poses/hand-on-hip.json').then((r) => r.json()),
  ]);

  const actorA = SkeletonUtils.clone(femaleGltf.scene);
  applyPose(actorA, leanInPose, { buildId: 'average-f' });
  actorA.position.x = -0.45;
  actorA.rotation.y = Math.PI * 0.42;

  const actorB = SkeletonUtils.clone(maleGltf.scene);
  applyPose(actorB, handOnHipPose, { buildId: 'broad' });
  actorB.position.x = 0.45;
  actorB.rotation.y = -Math.PI * 0.42;

  scene.add(actorA, actorB);
}
```
