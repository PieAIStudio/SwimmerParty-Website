"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useIsoLayoutEffect } from "./gsap";
import { stageSignal } from "@/three/signal";

/**
 * A tall section whose scroll progress drives both the 3D stage and CSS.
 *
 * Three deliberate choices:
 *
 *  - The sticky frame is CSS `position: sticky`, not a GSAP pin. A pin
 *    rewrites layout and has to be refreshed whenever anything above it
 *    resizes; sticky is the browser's own implementation of exactly this
 *    and never desynchronises.
 *  - Progress is published as a single custom property, `--p`, on the
 *    sticky frame. Children then move with `calc()` in a stylesheet
 *    instead of through per-frame JavaScript writes, so adding a fifth
 *    animated element to the hero costs nothing at runtime.
 *  - The figure assembles on arrival and *loosens* on the way out, rather
 *    than assembling as you scroll. A hero whose subject only appears once
 *    you scroll shows a pile of scattered parts to anyone who lands and
 *    reads for a moment — which is most people.
 */
export function ScrubStage({
  children,
  className,
  /** Total scroll length, as a multiple of the viewport. */
  length = 2.2,
  /** How far the body comes back apart by the end of the section. */
  loosenBy = 0.45,
}: {
  children: ReactNode;
  className?: string;
  length?: number;
  loosenBy?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = host.current;
    const inner = frame.current;
    if (!el || !inner) return;

    // Never pre-set `assembly` to 0 here. If GSAP's ticker never runs — a
    // background tab, a blocked bundle, a throttled webview — the figure
    // has to be standing there assembled, not lying in pieces. The intro
    // takes it apart only at the moment it can also put it back together.
    let intro = prefersReducedMotion() ? 1 : 0;
    let progress = 0;

    const apply = () => {
      stageSignal.assembly = intro * (1 - progress * loosenBy);
      stageSignal.scrollSpin = progress * 1.15;
      inner.style.setProperty("--p", progress.toFixed(4));
    };

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion()) {
        const box = { v: 0 };
        gsap.to(box, {
          v: 1,
          duration: 2,
          delay: 0.2,
          ease: "expo.out",
          onStart: () => {
            intro = 0;
            apply();
          },
          onUpdate: () => {
            intro = box.v;
            apply();
          },
        });
      }

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progress = self.progress;
          apply();
        },
        onRefresh: (self) => {
          progress = self.progress;
          apply();
        },
      });
    }, el);

    return () => {
      ctx.revert();
      stageSignal.assembly = 1;
      stageSignal.scrollSpin = 0;
    };
  }, [loosenBy]);

  return (
    <div ref={host} className={className} style={{ height: `${length * 100}svh` }}>
      <div ref={frame} className="sticky top-0 h-svh overflow-hidden" style={{ "--p": 0 } as never}>
        {children}
      </div>
    </div>
  );
}
