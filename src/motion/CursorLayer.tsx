"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A cursor made of two instruments: a crosshair that tracks the pointer
 * exactly, and a square reticle that lags behind it.
 *
 * `mix-blend-mode: difference` means it stays legible over black, over an
 * acid slab and over a photographic plate without a single colour rule.
 *
 * Native cursors are hidden only after this mounts, and only on fine
 * pointers — if the bundle fails, the visitor keeps a normal pointer
 * instead of losing it entirely.
 */
export function CursorLayer() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  // Nothing is drawn until the pointer moves. Parking a crosshair in the
  // middle of the viewport on load looks like a rendering artefact, and on
  // a machine that never sends a pointermove it would simply be wrong.
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;

    // Target vs current, integrated per frame. A single rAF loop for both
    // elements is what keeps this off the pointermove critical path.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const eased = { ...target };
    let raf = 0;

    let first = true;
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (first) {
        // Snap on the first sighting, and only now take the native cursor
        // away — otherwise a visitor who never moves the mouse is left
        // with no pointer at all.
        first = false;
        eased.x = e.clientX;
        eased.y = e.clientY;
        root.dataset.spCursor = "on";
        setAwake(true);
      }

      const hit = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(hit ? ((hit as HTMLElement).dataset.cursor ?? null) : null);
    };

    const tick = () => {
      eased.x += (target.x - eased.x) * 0.17;
      eased.y += (target.y - eased.y) * 0.17;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      delete root.dataset.spCursor;
    };
  }, []);

  if (!awake) return null;

  return (
    <>
      <div ref={dot} className="sp-cursor" aria-hidden>
        <div className="relative h-3 w-3">
          <span className="absolute top-1/2 left-0 h-px w-full bg-paper" />
          <span className="absolute top-0 left-1/2 h-full w-px bg-paper" />
        </div>
      </div>
      <div ref={ring} className="sp-cursor" aria-hidden>
        <div
          className="grid place-items-center border border-paper transition-all duration-200 ease-[var(--ease-out-expo)]"
          style={{
            width: label ? "5.5rem" : down ? "1.1rem" : "2rem",
            height: label ? "5.5rem" : down ? "1.1rem" : "2rem",
          }}
        >
          {label ? <span className="sp-label text-[0.5rem] text-paper">{label}</span> : null}
        </div>
      </div>
    </>
  );
}
