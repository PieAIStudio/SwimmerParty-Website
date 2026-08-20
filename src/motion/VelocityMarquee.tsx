"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useIsoLayoutEffect } from "./gsap";

/**
 * A ticker whose speed and direction come from the scroll wheel.
 *
 * Scroll down and the rail runs left; scroll up and it reverses. The base
 * loop keeps running when the page is still, so the rail never freezes
 * into a static strip of text.
 *
 * The `modifiers` wrap is what makes the loop seamless without cloning the
 * track a third time: `x` is allowed to run off to infinity and is folded
 * back into one track-width on the way to the transform.
 */
export function VelocityMarquee({
  items,
  tone = "acid",
  speed = 90,
}: {
  items: string[];
  tone?: "acid" | "bone" | "cyan" | "ink";
  speed?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const color =
    tone === "acid"
      ? "text-acid"
      : tone === "cyan"
        ? "text-cyan"
        : tone === "ink"
          ? "text-black"
          : "text-bone";

  useIsoLayoutEffect(() => {
    const rail = track.current;
    if (!rail) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const half = () => rail.scrollWidth / 2;
      const wrap = gsap.utils.wrap(-half(), 0);
      const tween = gsap.to(rail, {
        x: `-=${half()}`,
        duration: half() / speed,
        ease: "none",
        repeat: -1,
        modifiers: { x: (v) => `${wrap(parseFloat(v))}px` },
      });

      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          // Direction follows the wheel; magnitude is capped so a flick on
          // a trackpad does not fling the text into a blur.
          const scale = gsap.utils.clamp(-6, 6, 1 + v / 900);
          gsap.to(tween, {
            timeScale: scale === 0 ? 1 : scale,
            duration: 0.5,
            overwrite: true,
          });
        },
      });
    }, rail);

    return () => ctx.revert();
  }, [speed]);

  const doubled = [...items, ...items];

  return (
    <div className="relative flex overflow-hidden py-3">
      <div
        ref={track}
        className={`flex shrink-0 items-center gap-8 whitespace-nowrap ${color}`}
        style={{ willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="sp-label flex items-center gap-8 text-[0.6875rem]"
            aria-hidden={i >= items.length}
          >
            {item}
            <span className="opacity-40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
