// Original primitive stand-ins, not MPFB assets or actor likenesses.
// Manual source recipe: node src/features/scene/generate-placeholders.mjs
import { mkdir, writeFile } from "node:fs/promises";
import {
  AnimationClip,
  Box3,
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  QuaternionKeyframeTrack,
  SphereGeometry,
  VectorKeyframeTrack,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

// GLTFExporter uses the browser FileReader for its binary Blob, with no image data here.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};
const out = new URL("../../../public/scene/figures/", import.meta.url);
await mkdir(out, { recursive: true });
const sphere = new SphereGeometry(1, 12, 8);
const cylinder = new CylinderGeometry(1, 1, 1, 10);
const material = new MeshStandardMaterial({ color: "#e8e4dc", roughness: 0.86, metalness: 0 });
const poses = {
  neutral: {},
  walk: {
    upperLegL: [-0.5, 0, 0],
    lowerLegL: [0.2, 0, 0],
    upperLegR: [0.4, 0, 0],
    lowerLegR: [0.45, 0, 0],
    upperArmL: [0.35, 0, -0.1],
    upperArmR: [-0.35, 0, 0.1],
  },
  guard: {
    upperArmL: [-0.8, 0, -0.35],
    lowerArmL: [-1.1, 0, 0],
    upperArmR: [-0.8, 0, 0.35],
    lowerArmR: [-1.1, 0, 0],
    upperLegL: [-0.1, 0, -0.16],
    upperLegR: [0.1, 0, 0.16],
  },
  lunge: {
    torso: [0.18, 0, 0],
    upperLegL: [-1.0, 0, -0.12],
    lowerLegL: [1.25, 0, 0],
    upperLegR: [0.6, 0, 0.12],
    lowerLegR: [0.12, 0, 0],
    upperArmL: [-0.7, 0, -0.15],
    upperArmR: [0.4, 0, 0.15],
  },
  crouch: {
    torso: [0.2, 0, 0],
    upperLegL: [-1.2, 0, -0.16],
    upperLegR: [-1.2, 0, 0.16],
    lowerLegL: [1.9, 0, 0],
    lowerLegR: [1.9, 0, 0],
    upperArmL: [-0.7, 0, -0.15],
    upperArmR: [-0.7, 0, 0.15],
    lowerArmL: [-0.5, 0, 0],
    lowerArmR: [-0.5, 0, 0],
  },
  point: { upperArmR: [-1.55, 0, 0.15], lowerArmR: [-0.05, 0, 0], head: [0, -0.15, 0] },
};
const report = [];
for (const [build, dimensions] of Object.entries({
  slim: [0.17, 0.22, 0.1, 0.045],
  regular: [0.21, 0.26, 0.12, 0.058],
  broad: [0.27, 0.32, 0.15, 0.074],
})) {
  const [chest, shoulder, hip, limb] = dimensions;
  const root = new Group();
  root.name = "figure";
  const joints = {};
  function joint(name, parent, position) {
    const group = new Group();
    group.name = name;
    group.position.set(...position);
    parent.add(group);
    joints[name] = group;
    return group;
  }
  function ellipsoid(parent, position, scale) {
    const mesh = new Mesh(sphere, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
  }
  function segment(parent, length, radius) {
    const mesh = new Mesh(cylinder, material);
    mesh.position.y = -length / 2;
    mesh.scale.set(radius, length, radius);
    parent.add(mesh);
    ellipsoid(parent, [0, 0, 0], [radius, radius, radius]);
  }
  const hips = joint("hips", root, [0, 0.88, 0]);
  ellipsoid(hips, [0, 0, 0], [chest * 0.85, 0.14, 0.13]);
  const torso = joint("torso", hips, [0, 0.1, 0]);
  ellipsoid(torso, [0, 0.2, 0], [chest, 0.3, chest * 0.65]);
  ellipsoid(torso, [0, 0.48, 0], [0.065, 0.1, 0.065]);
  const head = joint("head", torso, [0, 0.62, 0]);
  ellipsoid(head, [0, 0, 0], [0.115, 0.15, 0.12]);
  // A small nose makes facing legible, without implying an actor likeness.
  ellipsoid(head, [0, -0.01, 0.12], [0.025, 0.035, 0.035]);
  for (const [suffix, sign] of [
    ["L", -1],
    ["R", 1],
  ]) {
    const arm = joint(`upperArm${suffix}`, torso, [sign * shoulder, 0.39, 0]);
    segment(arm, 0.29, limb);
    const forearm = joint(`lowerArm${suffix}`, arm, [0, -0.29, 0]);
    segment(forearm, 0.27, limb * 0.85);
    ellipsoid(forearm, [0, -0.32, 0], [limb * 0.85, 0.075, limb * 0.55]);
    const leg = joint(`upperLeg${suffix}`, hips, [sign * hip, -0.03, 0]);
    segment(leg, 0.4, limb * 1.3);
    const shin = joint(`lowerLeg${suffix}`, leg, [0, -0.4, 0]);
    segment(shin, 0.38, limb);
    ellipsoid(shin, [0, -0.4, 0.05], [0.065, 0.05, 0.14]);
  }
  const clips = [];
  for (const [pose, rotations] of Object.entries(poses)) {
    for (const [name, node] of Object.entries(joints))
      node.rotation.set(
        ...(rotations[name] ??
          (name === "upperArmL" ? [0, 0, -0.08] : name === "upperArmR" ? [0, 0, 0.08] : [0, 0, 0])),
      );
    hips.position.set(0, 0.88, 0);
    root.updateMatrixWorld(true);
    hips.position.y -= new Box3().setFromObject(root).min.y;
    const tracks = Object.entries(joints).map(([name, node]) => {
      node.quaternion.setFromEuler(new Euler(...node.rotation.toArray().slice(0, 3)));
      const q = node.quaternion.toArray();
      return new QuaternionKeyframeTrack(`${name}.quaternion`, [0, 1], [...q, ...q]);
    });
    const position = hips.position.toArray();
    tracks.push(new VectorKeyframeTrack("hips.position", [0, 1], [...position, ...position]));
    clips.push(new AnimationClip(pose, 1, tracks));
  }
  // The default bind/display state is neutral; each named clip is a static pose.
  for (const [name, node] of Object.entries(joints))
    node.rotation.set(0, 0, name === "upperArmL" ? -0.08 : name === "upperArmR" ? 0.08 : 0);
  hips.position.set(0, 0.88, 0);
  root.updateMatrixWorld(true);
  hips.position.y -= new Box3().setFromObject(root).min.y;
  const bytes = await new GLTFExporter().parseAsync(root, {
    binary: true,
    animations: clips,
    onlyVisible: true,
  });
  await writeFile(new URL(`${build}.glb`, out), new Uint8Array(bytes));
  let triangles = 0;
  root.traverse((node) => {
    if (node.isMesh)
      triangles += (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3;
  });
  report.push({ build, bytes: bytes.byteLength, triangles, poses: clips.map((clip) => clip.name) });
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
