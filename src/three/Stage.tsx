"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import type { Group, Mesh, Points } from "three";
import { AdditiveBlending, BufferAttribute, BufferGeometry } from "three";
import { WhiteModel } from "./WhiteModel";
import { whiteModelGeometry } from "./mergedModel";
import { stageSignal } from "./signal";

/**
 * The stage.
 *
 * Colour pipeline (Web3D capability baseline rule 2): R3F owns the single
 * renderer for this canvas, applies ACES Filmic tone mapping, and encodes
 * to sRGB exactly once on output. There is deliberately no EffectComposer
 * here — inserting one would move the encode and silently wash the image.
 * The grade is done in-scene with light colour and fog instead.
 *
 * DPR is clamped and drops a tier on coarse pointers (rule 4).
 *
 * The camera is configured once and never touched again: R3F re-runs the
 * default camera's config on every resize and resets its orientation, so
 * composition changes move the scene, not the camera.
 */

export type StageMode = "solo" | "wall";

/** A ring sweeping the figure — reads as an active 3D scan pass. A flat
 *  plane was tried first and rendered as a glowing slab across the stage;
 *  a thin torus outline is what actually looks like a scanner. */
function ScanRing({ color }: { color: string }) {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = (clock.elapsedTime * 0.28) % 1;
    mesh.current.position.y = t * 1.82;
    // Widen at the hips, narrow at the crown, so the ring hugs the body.
    const w = 1 + Math.sin(t * Math.PI) * 0.28;
    mesh.current.scale.set(w, w, w);
    const m = mesh.current.material as { opacity: number };
    m.opacity = Math.sin(t * Math.PI) * 0.85;
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.36, 0.0055, 8, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/**
 * Suspended dust. Volumetric light is not affordable here — a particle
 * field lit by the same rim colour sells the same "there is air in this
 * room" read for one draw call.
 */
function Motes({ color, count = 220 }: { color: string; count?: number }) {
  const points = useRef<Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Deterministic placement, same reasoning as the part scatter.
      const h = (n: number) => {
        const x = Math.sin(i * 91.7 + n * 47.3) * 43758.5453;
        return x - Math.floor(x);
      };
      positions[i * 3] = (h(1) - 0.5) * 6;
      positions[i * 3 + 1] = h(2) * 3.2;
      positions[i * 3 + 2] = (h(3) - 0.5) * 5;
    }
    const geom = new BufferGeometry();
    geom.setAttribute("position", new BufferAttribute(positions, 3));
    return geom;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.014}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

/** Pointer → signal. Lives inside the Canvas so it gets R3F's own
 *  normalised pointer rather than a second listener on window. */
function PointerBridge() {
  const { pointer } = useThree();
  useFrame(() => {
    stageSignal.pointerX = pointer.x;
    stageSignal.pointerY = pointer.y;
  });
  return null;
}

function Lights({ accent }: { accent: string }) {
  return (
    <>
      {/* Key: cold white from front-right. */}
      <directionalLight position={[2.6, 3.2, 2.4]} intensity={2.1} color="#eef2ff" castShadow />
      {/* Rim: accent from behind-left. This is what carves the silhouette. */}
      <directionalLight position={[-3, 2.2, -2.6]} intensity={2.2} color={accent} />
      {/* Bounce: cyan up-light from the grid. */}
      <pointLight
        position={[0, 0.15, 1.2]}
        intensity={2.2}
        color="#00e5ff"
        distance={5}
        decay={2}
      />
      <ambientLight intensity={0.16} />
    </>
  );
}

function StageGrid() {
  return (
    <Grid
      args={[40, 40]}
      position={[0, -0.88, 0]}
      cellSize={0.3}
      cellThickness={0.5}
      cellColor="#0e2b31"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#0e7c8c"
      fadeDistance={16}
      fadeStrength={1.6}
      followCamera={false}
      infiniteGrid
    />
  );
}

function SoloScene({ accent, assemble }: { accent: string; assemble: boolean }) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 4.6, 15]} />
      <Lights accent={accent} />
      <PointerBridge />

      <group position={[0, -0.88, 0]}>
        <WhiteModel accent={accent} interactive assemble={assemble} />
        <ScanRing color={accent} />
        <Motes color={accent} />
      </group>

      <StageGrid />
    </>
  );
}

/**
 * The roster wall: a rank of merged figures receding into fog.
 *
 * Every figure shares one geometry and one material, so the whole rank is
 * as cheap as the count of figures. The rank slides on pointer and on
 * scroll, which is what makes a static row read as a room you are moving
 * through.
 */
function WallScene({ accent, count }: { accent: string; count: number }) {
  const rank = useRef<Group>(null);
  const geometry = useMemo(() => whiteModelGeometry(), []);

  const layout = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const h = (n: number) => {
          const x = Math.sin(i * 57.3 + n * 19.7) * 43758.5453;
          return x - Math.floor(x) - 0.5;
        };
        return {
          x: (i - (count - 1) / 2) * 1.15,
          z: h(1) * 1.8,
          yaw: h(2) * 0.7,
          scale: 0.92 + h(3) * 0.16,
        };
      }),
    [count],
  );

  useFrame((_, delta) => {
    const g = rank.current;
    if (!g) return;
    const want = stageSignal.pointerX * 0.55 - stageSignal.scrollSpin * 2.4;
    g.position.x += (want - g.position.x) * Math.min(1, delta * 1.8);
    g.rotation.y += (stageSignal.pointerX * 0.1 - g.rotation.y) * Math.min(1, delta * 1.8);
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 3.2, 13]} />
      <Lights accent={accent} />
      <PointerBridge />

      <group ref={rank} position={[0, -0.88, 0]}>
        {layout.map((slot, i) => (
          <group key={i} position={[slot.x, 0, slot.z]} rotation={[0, slot.yaw, 0]}>
            <mesh geometry={geometry} scale={slot.scale} castShadow receiveShadow>
              <meshStandardMaterial color="#dedeD8" roughness={0.68} metalness={0.05} />
            </mesh>
            <mesh geometry={geometry} scale={slot.scale * 1.014}>
              <meshBasicMaterial
                color={accent}
                wireframe
                transparent
                opacity={0.1}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
        <Motes color={accent} count={320} />
      </group>

      <StageGrid />
    </>
  );
}

export default function Stage({
  accent = "#ccff00",
  mode = "solo",
  assemble = false,
  count = 12,
}: {
  accent?: string;
  mode?: StageMode;
  assemble?: boolean;
  count?: number;
}) {
  const [active, setActive] = useState(true);
  const host = useRef<HTMLDivElement>(null);

  /* Lifecycle: stop rendering when the canvas scrolls away or the tab is
   * backgrounded. A 3D hero that keeps burning GPU off-screen is the most
   * common reason a site kills a laptop battery. */
  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);

    const onVisibility = () => setActive(!document.hidden && !!el.offsetParent);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={coarse ? [1, 1.35] : [1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={
          mode === "wall"
            ? { position: [0, 0.55, 6.2], fov: 36, near: 0.1, far: 60 }
            : { position: [2.0, 0.28, 4.15], fov: 32, near: 0.1, far: 60 }
        }
        shadows={mode === "solo"}
      >
        {mode === "wall" ? (
          <WallScene accent={accent} count={coarse ? Math.min(count, 7) : count} />
        ) : (
          <SoloScene accent={accent} assemble={assemble} />
        )}
      </Canvas>
    </div>
  );
}
