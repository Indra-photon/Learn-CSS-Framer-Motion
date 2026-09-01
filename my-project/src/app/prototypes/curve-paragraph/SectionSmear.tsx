"use client";

import React, { useMemo, useRef } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH } from "./copy";
import { useLineHeight } from "./useLineHeight";

/* ── SMEAR ────────────────────────────────────────────────────────────
 * Typographic motion blur, without a blur. Scroll fast and the letters
 * stretch along the direction of travel, lag behind their true positions
 * and thin out; stop and they snap back to being type.
 *
 * The stretch is scaleY, not scaleX, because the motion is vertical —
 * smearing across the axis you are actually moving on is what makes it
 * read as speed rather than as a wobble. Opacity drops with it, since a
 * real smear spreads the same ink over more area.
 *
 * Lines lag by their distance from the centre of the block, so the
 * paragraph trails rather than moving as a slab — the far edges are still
 * catching up while the middle has arrived.
 *
 * This one costs nothing extra: no filters, no layers, no extra elements.
 * It is entirely scale and opacity on glyphs that were already there. */

const MAX_STRETCH = 1.62;
const LAG = 26; // px of lag at the outermost line
/* Per px/s of scroll velocity. At 0.00042 you needed ~2400px/s — a hard
 * fling — to reach full stretch, so ordinary reading-speed scrolling
 * barely registered. 0.0009 saturates at a brisk ~1100px/s. */
const GAIN = 0.0009;

export function SectionSmear() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { columnRef, offsetOf } = useLineHeight(PARAGRAPH.length);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  /* Signed, so the smear leans with the direction of travel. Springing it
   * keeps the paragraph from twitching on every wheel tick. */
  const smear = useSpring(
    useTransform(velocity, (v) =>
      reduce ? 0 : Math.max(-1, Math.min(1, v * GAIN)),
    ),
    { stiffness: 300, damping: 34 },
  );

  return (
    <section className="cp-section" ref={ref}>
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Smear · scroll velocity
      </p>

      <div className="cp-column" ref={columnRef}>
        {PARAGRAPH.map((line, i) => (
          <SmearLine key={i} text={line} lineY={offsetOf(i)} smear={smear} />
        ))}
      </div>

      <p className="cp-note">
        Scroll hard. The stretch runs along the axis you are travelling on,
        opacity drops as the ink spreads, and the outer lines lag behind
        the middle. No filters — scale and opacity only.
      </p>
    </section>
  );
}

function SmearLine({
  text,
  lineY,
  smear,
}: {
  text: string;
  lineY: number;
  smear: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (s) => {
      const magnitude = Math.abs(s);
      const stretch = 1 + magnitude * (MAX_STRETCH - 1);
      /* Lines further from the block's centre trail further behind. */
      const lag = -s * LAG * Math.min(1, Math.abs(lineY) / 90);

      return () => ({
        dx: 0,
        dy: lag,
        rot: 0,
        sy: stretch,
        /* Same ink over more area. */
        o: 1 - magnitude * 0.45,
      });
    },
    [lineY],
  );

  return (
    <p className="cp-line">
      <GlyphLine text={text} value={smear} curve={curve} />
    </p>
  );
}
