"use client";

import React, { useMemo } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { drift, transversePlacer, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH } from "./copy";

/* ── BREATHE ──────────────────────────────────────────────────────────
 * River's quiet cousin. Same paragraph, same reading scale, but the
 * baseline is never still and is never scrubbed: three sines at
 * incommensurate periods, so the block moves like paper in a room with
 * the window open and never repeats a pose.
 *
 * Amplitude is FOUR PIXELS. That is the entire design decision. Below
 * about six the eye reads it as the page being alive; above about ten it
 * reads as the text being unstable and you stop being able to hold a
 * line. This is the variant that argues motion in body copy should be
 * felt and not seen.
 *
 * Each line samples the same field at its own offset, so the paragraph
 * undulates as one surface rather than six independent ribbons. */

const AMPLITUDE = 4; // px — see above
const LINE_OFFSET = 0.9;
const RATE = 0.55;

export function SectionBreathe() {
  const reduce = useReducedMotion() ?? false;
  const clock = useMotionValue(0);

  useAnimationFrame((t) => {
    if (reduce) return;
    clock.set((t / 1000) * RATE);
  });

  return (
    <section className="cp-section">
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Breathe · ambient, four pixels
      </p>

      <div className="cp-column">
        {PARAGRAPH.map((line, i) => (
          <BreatheLine key={i} text={line} index={i} clock={clock} />
        ))}
      </div>

      <p className="cp-note">
        Four pixels of travel, three sines that never come back into step,
        no trigger and no rest. Read a line and you will lose track of
        whether it is moving — which is the intended result.
      </p>
    </section>
  );
}

function BreatheLine({
  text,
  index,
  clock,
}: {
  text: string;
  index: number;
  clock: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (t, half) =>
      transversePlacer(
        (x) => drift(x / half, t + index * LINE_OFFSET) * AMPLITUDE,
        half,
        /* No rotation at all. At four pixels a tilt would be the only
         * thing you noticed, and it would be the wrong thing. */
        0,
      ),
    [index],
  );

  return (
    <p className="cp-line">
      <GlyphLine text={text} value={clock} curve={curve} />
    </p>
  );
}
