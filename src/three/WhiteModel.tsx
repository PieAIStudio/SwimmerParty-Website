"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * The white model — 白膜.
 *
 * A deliberately un-finished mannequin assembled from primitives. It is a
 * placeholder in the literal sense and a statement in the figurative one:
 * this house builds actors, and this is what one looks like before the
 * surface goes on. When a real rigged .glb exists, it drops in here behind
 * the same props and nothing else on the page changes.
 *
 * Proportions are real metres against a 1.755 m figure, and every segment
 * is capped by a joint sphere so the limbs read as one body rather than a
 * stack of pills. Capsule total length is `len + 2 * r` — the spans in the
 * comments below are what keeps the joints touching.
 */

const HIP_X = 0.088;
const ARM_X = 0.225;

type Part =
  | {
      kind: "capsule";
      pos: [number, number, number];
      r: number;
      len: number;
      rot?: [number, number, number];
    }
  | { kind: "sphere"; pos: [number, number, number]; r: number }
  | { kind: "box"; pos: [number, number, number]; size: [number, number, number] };

const PARTS: Part[] = [
  // ---- head / neck ----
  { kind: "sphere", pos: [0, 1.648, 0], r: 0.113 }, //            1.545 – 1.755
  { kind: "capsule", pos: [0, 1.5, 0], r: 0.045, len: 0.06 }, // 1.425 – 1.575

  // ---- torso ----
  { kind: "capsule", pos: [0, 1.24, 0], r: 0.158, len: 0.2 }, // 0.995 – 1.485
  { kind: "capsule", pos: [0, 0.99, 0], r: 0.132, len: 0.06 }, // 0.840 – 1.140  (pelvis)

  // ---- arms: shoulder → upper → elbow → fore → hand ----
  { kind: "sphere", pos: [-ARM_X + 0.02, 1.42, 0], r: 0.062 },
  { kind: "sphere", pos: [ARM_X - 0.02, 1.42, 0], r: 0.062 },
  { kind: "capsule", pos: [-ARM_X, 1.28, 0], r: 0.05, len: 0.2 },
  { kind: "capsule", pos: [ARM_X, 1.28, 0], r: 0.05, len: 0.2 },
  { kind: "sphere", pos: [-ARM_X - 0.012, 1.13, 0], r: 0.052 },
  { kind: "sphere", pos: [ARM_X + 0.012, 1.13, 0], r: 0.052 },
  { kind: "capsule", pos: [-ARM_X - 0.02, 0.99, 0], r: 0.044, len: 0.2 },
  { kind: "capsule", pos: [ARM_X + 0.02, 0.99, 0], r: 0.044, len: 0.2 },
  { kind: "sphere", pos: [-ARM_X - 0.027, 0.83, 0], r: 0.053 },
  { kind: "sphere", pos: [ARM_X + 0.027, 0.83, 0], r: 0.053 },

  // ---- legs: hip → thigh → knee → shin → foot ----
  { kind: "sphere", pos: [-HIP_X, 0.93, 0], r: 0.082 },
  { kind: "sphere", pos: [HIP_X, 0.93, 0], r: 0.082 },
  { kind: "capsule", pos: [-HIP_X, 0.711, 0], r: 0.075, len: 0.3 }, // 0.486 – 0.936
  { kind: "capsule", pos: [HIP_X, 0.711, 0], r: 0.075, len: 0.3 },
  { kind: "sphere", pos: [-HIP_X, 0.486, 0], r: 0.064 },
  { kind: "sphere", pos: [HIP_X, 0.486, 0], r: 0.064 },
  { kind: "capsule", pos: [-HIP_X, 0.278, 0], r: 0.058, len: 0.3 }, // 0.070 – 0.486
  { kind: "capsule", pos: [HIP_X, 0.278, 0], r: 0.058, len: 0.3 },
  { kind: "box", pos: [-HIP_X, 0.038, 0.05], size: [0.098, 0.076, 0.235] },
  { kind: "box", pos: [HIP_X, 0.038, 0.05], size: [0.098, 0.076, 0.235] },
];

function Geometry({ part }: { part: Part }) {
  if (part.kind === "sphere") return <sphereGeometry args={[part.r, 28, 24]} />;
  if (part.kind === "box") return <boxGeometry args={part.size} />;
  return <capsuleGeometry args={[part.r, part.len, 8, 20]} />;
}

export function WhiteModel({ accent = "#ccff00" }: { accent?: string }) {
  const group = useRef<Group>(null);

  // Turntable. Slow enough to read as a display plinth, not a spinner.
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.16;
  });

  return (
    <group ref={group}>
      {PARTS.map((part, i) => (
        <group
          key={i}
          position={part.pos}
          rotation={"rot" in part && part.rot ? part.rot : [0, 0, 0]}
        >
          {/* Solid clay pass */}
          <mesh castShadow receiveShadow>
            <Geometry part={part} />
            <meshStandardMaterial color="#dedeD8" roughness={0.68} metalness={0.05} />
          </mesh>
          {/* Wireframe cage, scaled a hair out so it does not z-fight. */}
          <mesh scale={1.014}>
            <Geometry part={part} />
            <meshBasicMaterial
              color={accent}
              wireframe
              transparent
              opacity={0.13}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
