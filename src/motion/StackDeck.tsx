"use client";

import { Children, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./gsap";

/**
 * Cards that arrive on top of each other instead of below each other.
 *
 * Each card slides up over the one before it while that one shrinks and
 * darkens, so the section reads as a deck being dealt rather than a list
 * being scrolled. The last card stays.
 *
 * Below `md`, and under reduced motion, the same children render as an
 * ordinary stacked column — this device depends on a tall viewport and
 * degrades badly on a phone if forced.
 */
export function StackDeck({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);

  useIsoLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-deck-card]", el);
        if (cards.length < 2) return;

        gsap.set(cards, { position: "absolute", inset: 0 });
        gsap.set(cards.slice(1), { yPercent: 104 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${(cards.length - 1) * window.innerHeight * 0.85}`,
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, i) => {
          if (i === 0) return;
          tl.to(cards[i - 1], { scale: 0.94, filter: "brightness(0.45)", ease: "none" }, i - 1);
          tl.to(card, { yPercent: 0, ease: "none" }, i - 1);
        });
      });

      return () => mm.revert();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={host} className={className} aria-label={ariaLabel}>
      <div className="relative grid gap-px md:h-svh md:gap-0">
        {items.map((child, i) => (
          <div key={i} data-deck-card className="relative">
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
