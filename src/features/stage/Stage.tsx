"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useSiteTheme } from "@/lib/use-site-theme";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Mannequin } from "@/features/actors";
import { WhiteModel } from "./WhiteModel";
import { STUDIO_LIGHT } from "./palette";

const coarseQuery = "(pointer: coarse)";
function subscribePointer(onChange: () => void) {
  const query = window.matchMedia(coarseQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const coarsePointer = () => window.matchMedia(coarseQuery).matches;

function Fallback() {
  return (
    <Mannequin className="absolute inset-x-0 bottom-[4%] mx-auto h-[90%] w-full opacity-[0.12]" />
  );
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

/** Transparent studio: one renderer, ACES, one sRGB output, no post-processing. */
export default function Stage({ assemble = false }: { assemble?: boolean }) {
  const theme = useSiteTheme();
  const reduced = useReducedMotion();
  const coarse = useSyncExternalStore(subscribePointer, coarsePointer, () => false);
  const [active, setActive] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let visible = true;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.01 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const dark = theme === "dark";
  return (
    <div ref={host} className="absolute inset-0" data-clay-stage={theme}>
      <CanvasBoundary>
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, coarse ? 1.35 : 1.5]}
          camera={{ position: [0, 0.12, 3.8], fov: 32, near: 0.1, far: 20 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
          }}
          shadows="soft"
          fallback={<Fallback />}
        >
          <hemisphereLight args={[STUDIO_LIGHT.sky, STUDIO_LIGHT.ground, dark ? 0.6 : 1]} />
          <directionalLight
            position={[-2.5, 4, 3]}
            intensity={dark ? 1.1 : 1.6}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-normalBias={0.025}
          />
          <directionalLight position={[3, 2, 2]} intensity={0.35} />
          <group position={[0, -0.88, 0]}>
            <WhiteModel theme={theme} assemble={assemble} reduced={reduced} />
            <ContactShadows
              position={[0, 0, 0]}
              scale={3}
              blur={2.4}
              far={1.2}
              opacity={dark ? 0.55 : 0.35}
              resolution={512}
            />
          </group>
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
