# SwimmerParty Rigged Stage Mannequin Family (`handoff-rigged/`)

Six CC0-1.0 skinned rest-pose stage mannequins (`slim`, `average`, `broad`, `slim-f`, `average-f`, `broad-f`) sharing a single canonical 53-bone humanoid skeleton (`mpfb2-game_engine-53`), plus 12 bone-local quaternion pose files (`poses/*.json`) that work interchangeably across all 6 bodies.

## Contents

- **6 Skinned Rest-Pose GLBs** (`+Y` up, `+Z` forward, metres, floor origin `y_min = 0.0`, 0 textures, 1 `SkinnedMesh`, 53 bones):
  - Male builds (`7,478` triangles, `<228 KB` each): `slim.glb` (`1.72 m`), `average.glb` (`1.75 m`), `broad.glb` (`1.79 m`)
  - Female builds (`8,662` triangles with the original sculptural bob and bun weighted to `head`, `<261 KB` each): `slim-f.glb` (`1.64 m`), `average-f.glb` (`1.68 m`), `broad-f.glb` (`1.71 m`)
- **12 Shared Pose Shelf JSONs** (`poses/*.json`, `[x, y, z, w]` bone-local quaternions on `mpfb2-game_engine-53`):
  - Core poses (6): `stand.json`, `walk.json`, `point.json`, `wave.json`, `sit.json`, `arms-crossed.json`
  - Two-person dialogue & staging poses (6): `lean-in.json`, `hand-on-hip.json`, `hands-on-table.json`, `look-over-shoulder.json`, `hug-ready.json`, `kneel.json`
- **Metadata & Provenance**:
  - `manifest.json` — SHA-256 hashes, byte sizes, triangle counts, bounds, 53-bone hierarchy & canonical rest quaternions
  - `LICENSE.md` — CC0-1.0 public domain dedication & verbatim MPFB 2.0.18 `base.obj` / `rig.game_engine.json` provenance

## Closed-mouth head revision (2026-11-08)

Round 2 supersedes the rejected `70b088f` head treatment. The original upper/lower lip rolls are pulled together, retaining their profile bulge and the original rounded chin; no facial replacement patch is generated. A natural lip contact line remains. Original closed eyelids are restored, not replaced with plain eye sockets. Female cheeks keep their added fullness and the jaw corners are softened. The original bob and bun are retained, with only the front cap root smoothly recessed into the forehead over about 1.5 cm; the skull is not stretched. Formal visual acceptance remains independent.

The 53 bone names/hierarchy, rest pose, units, floor origin and filenames are retained. All 12 pose JSONs are byte-identical to `025c7c9`. This Mac rebuild uses Blender **5.2.0 LTS** and pinned MPFB **2.0.18**; compared with the earlier Blender 5.2.1 build, raw bone transform components differ by at most `7.16e-7` (floating-point export noise). No animation or texture was added. Nothing below the head is intentionally remodeled.

### Rebuild and review

After `pnpm mf stage setup` / `pnpm mf stage doctor` report ready, run these Blender commands through the authorized heavy-work lock, with `BLENDER_USER_RESOURCES="$PWD/.local-store/blender"`:

```sh
blender -b --python-exit-code 17 -P source/build_rigged_bodies.py -- --keep-poses
blender -b --python-exit-code 17 -P source/render_rigged_review.py -- --mode heads --outdir <review-dir> --width 1440
python source/validate_rigged.py --review-dir <review-dir> --review-prefix <portable-evidence-prefix>
```

`--keep-poses` preserves existing pose bytes and checks all 72 body/pose floor offsets. The head renderer clean-imports each GLB and writes **20 PNGs**: 18 rest-head close-ups (front/profile/three-quarter), one full standing group, and one SwimmerParty Conversation profile-camera view. Head/group PNGs are native **1440×1080**; Conversation is **1440×810**, preserving the captured 16:9 sensor framing. `head_review_evidence.json` records hashes, camera parameters and shared pose hashes. The legacy lineup mode remains available.

The three-way pack is in the HQ receipt directory `conductor/projects/MediaFactory/closed-mouth-heads-20261108/final/`: `before-54a0566/`, `before-025c7c9/`, and `after/` (60 originals). All three use identical cameras, lighting, materials, height scales and the same `025c7c9` pose bytes via `--pose-dir` (default: this checkout's unchanged `handoff-rigged/poses`). The **025c7c9 comparison isolates this head revision**; 54a0566 retains its historical body-shape differences and is not presented as a head-only body comparison. `source/rigged_review_scene.json` freezes the actual SwimmerParty capture's camera, ±65° figure turns and poses. Formal look scoring/selection belongs to the independent reviewer.

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
