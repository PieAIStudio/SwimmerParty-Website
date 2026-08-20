"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./gsap";

/**
 * Vertical scroll, horizontal travel.
 *
 * The section's height is derived from how far the track actually has to
 * move, measured after layout — hard-coding a viewport multiple would
 * either strand the last card off screen or leave dead scroll at the end,
 * and the right number changes with the card count and the breakpoint.
 *
 * Reduced motion gets a plain, swipeable overflow rail instead: the
 * content is the same, only the transport changes.
 */
export function HorizontalRail({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = host.current;
    const rail = track.current;
    if (!el || !rail) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);

      gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={host} className={className} aria-label={ariaLabel}>
      {/* The clip has to be here rather than on the page: the track is
       * several viewports wide by design, and without a clipping ancestor
       * it widens the document and gives the whole site a horizontal
       * scrollbar. Below `md` the same box becomes the swipe rail. */}
      <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:overflow-x-hidden">
        <div
          ref={track}
          className="flex w-max gap-px px-[var(--sp-gutter)] md:items-center md:min-h-svh"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
