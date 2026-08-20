"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { assemblyOrder, PARTS, scatterOf, type Part } from "./parts";
import { stageSignal } from "./signal";

function Geometry({ part }: { part: Part }) {
  if (part.kind === "sphere") return <sphereGeometry args={[part.r, 28, 24]} />;
  if (part.kind === "box") return <boxGeometry args={part.size} />;
  return <capsuleGeometry args={[part.r, part.len, 8, 20]} />;
}

/** How much of the 0…1 assembly range a single part takes to fly home. */
const PART_WINDOW = 0.45;

export function WhiteModel({
  accent = "#ccff00",
  /** Follow the pointer instead of turning at a fixed rate. */
  interactive = false,
  /** Assemble from scattered parts when the signal drives it. */
  assemble = false,
}: {
  accent?: string;
  interactive?: boolean;
  assemble?: boolean;
}) {
  const group = useRef<Group>(null);
  const parts = useRef<(Group | null)[]>([]);
  const scatter = useMemo(() => PARTS.map((_, i) => scatterOf(i)), []);
  const order = useMemo(() => PARTS.map((_, i) => assemblyOrder(i)), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    // Yaw. A pointer-driven figure reads as aware of you; a fixed spin
    // reads as a screensaver. The idle drift stays in so the silhouette
    // keeps moving when nobody touches the page.
    if (interactive) {
      const want = stageSignal.pointerX * 0.85 + stageSignal.scrollSpin;
      g.rotation.y += (want - g.rotation.y) * Math.min(1, delta * 2.4);
      const wantX = stageSignal.pointerY * -0.16;
      g.rotation.x += (wantX - g.rotation.x) * Math.min(1, delta * 2.4);
    } else {
      g.rotation.y += delta * 0.16;
    }

    if (!assemble) return;

    const a = stageSignal.assembly;
    for (let i = 0; i < PARTS.length; i += 1) {
      const node = parts.current[i];
      if (!node) continue;

      // Each part gets its own slice of the range, so the body builds up
      // from the feet instead of every piece landing on the same frame.
      const startAt = order[i] * (1 - PART_WINDOW);
      const raw = (a - startAt) / PART_WINDOW;
      const t = raw <= 0 ? 0 : raw >= 1 ? 1 : raw;
      // Ease-out-cubic, inlined: this runs 24 times a frame.
      const e = 1 - (1 - t) ** 3;
      const s = scatter[i];
      const home = PARTS[i].pos;

      node.position.set(
        home[0] + s.offset[0] * (1 - e),
        home[1] + s.offset[1] * (1 - e),
        home[2] + s.offset[2] * (1 - e),
      );
      node.rotation.set(s.rot[0] * (1 - e), s.rot[1] * (1 - e), s.rot[2] * (1 - e));
      const scale = 0.35 + 0.65 * e;
      node.scale.setScalar(scale);
    }
  });

  return (
    <group ref={group}>
      {PARTS.map((part, i) => (
        <group
          key={i}
          ref={(node) => {
            parts.current[i] = node;
          }}
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
