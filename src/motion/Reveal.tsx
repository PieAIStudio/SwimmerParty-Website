"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useIsoLayoutEffect } from "./gsap";

/**
 * Adds `.is-in` to its children when they scroll into view.
 *
 * The transition itself lives in CSS (`.sp-reveal`, `.sp-clip`) so the
 * resting state is declared before any JavaScript runs. This component
 * only decides *when*; it never sets a style. That split is what keeps a
 * slow bundle from flashing already-placed content.
 */
export function Reveal({
  children,
  className,
  /** Seconds between each direct child landing. */
  stagger = 0.08,
  start = "top 86%",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  start?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = host.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>(".sp-reveal, .sp-clip");
    if (targets.length === 0) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        targets.forEach((node, i) => {
          node.style.transitionDelay = `${i * stagger}s`;
          node.classList.add("is-in");
        });
      },
    });

    return () => trigger.kill();
  }, [stagger, start]);

  return (
    <div ref={host} className={className}>
      {children}
    </div>
  );
}

/**
 * A number that counts up to its value the first time it is seen.
 *
 * Rendered with the final value in the markup so it is correct for search
 * engines and for anyone whose JavaScript never arrives; the animation
 * only rewrites `textContent` afterwards.
 */
export function Counter({
  value,
  pad = 2,
  className,
}: {
  value: number;
  pad?: number;
  className?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const el = host.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const box = { n: 0 };
      gsap.to(box, {
        n: value,
        duration: 1.4,
        ease: "expo.out",
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(box.n)).padStart(pad, "0");
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, pad]);

  return (
    <span ref={host} className={className}>
      {String(value).padStart(pad, "0")}
    </span>
  );
}
