"use client";

import React, { useMemo } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { ringPlacer, type CurveFactory } from "../curve-type/engine";

/* ── ORBIT ────────────────────────────────────────────────────────────
 * COMPOSITION: circular. Not a headline — a band of type running around
 * a product, the way a coin's edge is lettered. The whole section is
 * built around a centre object rather than a baseline.
 *
 * MOTION PATTERN: perpetual. There is no entrance, no rest state and no
 * end — it was already turning before you arrived and it keeps turning
 * after. Everything else in this set resolves to stillness; this one
 * never does, which is the point of a ticker.
 *
 * EASING: linear, and deliberately so. Constant motion is the one case
 * where any easing at all is wrong — a marquee that accelerates reads as
 * broken. Scroll velocity adds to the rate rather than easing it.
 *
 * The radius is derived from the phrase's own width, so the ring closes
 * exactly once around: no seam to hide, no reset to disguise. */

const PHRASE = "AVAILABLE NOW · SHIPS WORLDWIDE · 30-DAY RETURNS · ";
const BASE_SPEED = 26; // px of arc per second

export function SectionOrbit() {
  const reduce = useReducedMotion() ?? false;
  const phase = useMotionValue(0);

  /* Scroll velocity is ADDED to the constant rate — the ring speeds up
   * with the page and coasts back down, never stopping. */
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const boost = useSpring(
    useTransform(velocity, (v) => Math.max(-260, Math.min(260, v * 0.32))),
    { stiffness: 220, damping: 30 },
  );

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    phase.set(phase.get() + ((BASE_SPEED + boost.get()) * delta) / 1000);
  });

  const curve: CurveFactory = useMemo(
    () => (p, half) => ringPlacer(half, p, 0.82),
    [],
  );

  return (
    <section className="cs-section cs-orbit">
      <div className="cs-orbit-stage">
        <div className="cs-orbit-ring" aria-hidden="true">
          <GlyphLine
            text={PHRASE.repeat(2)}
            className="cs-orbit-text"
            value={phase}
            also={[boost]}
            curve={curve}
          />
        </div>

        <div className="cs-orbit-core">
          <div className="cs-orbit-product" />
          <p className="cs-orbit-name">Type&nbsp;01</p>
          <p className="cs-orbit-price">€180</p>
        </div>
      </div>

      <p className="cs-copy cs-copy--center">
        The ring is one sentence long. Its radius is computed from the text
        it contains, so the phrase closes on itself exactly — there is no
        seam, and no moment where a marquee snaps back to the start.
      </p>
    </section>
  );
}
