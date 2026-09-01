"use client";

import React, { useMemo, useRef } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { hash01, ramp, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH, readingIndex } from "./copy";

/* ── DISSOLVE ─────────────────────────────────────────────────────────
 * The paragraph comes apart into its own letters and puts itself back
 * together. Each glyph drifts along its own fixed bearing, spins a
 * little, fades and shrinks — never far enough to read as an explosion,
 * which is the difference between dissolve and scatter.
 *
 * Two details do the work:
 *
 * DETERMINISM. Every bearing comes from a hash of the glyph's reading
 * index, so a letter flies to the same place on every frame and every
 * reload. Math.random would reshuffle the paragraph sixty times a second
 * and the whole thing would boil.
 *
 * STAGGER BY HASH, NOT BY POSITION. Each glyph also gets its own
 * threshold, so the paragraph erodes in patches rather than sweeping
 * left-to-right. Text disintegrating unevenly is what makes it read as
 * material rather than as a wipe.
 *
 * Driver: scroll position — assembled through the middle of the pass,
 * dissolved at both edges. You scrub it apart yourself. */

const REACH = 78; // px a glyph can travel
const SPIN = 34; // degrees
/** How much of the timeline is stagger vs travel. */
const SPREAD = 0.45;

export function SectionDissolve() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* 0 = whole, 1 = fully dissolved. Symmetric, so it re-forms on the way
   * in and comes apart again on the way out. */
  const dissolve = useSpring(
    useTransform(scrollYProgress, (p) =>
      reduce ? 0 : Math.min(1, Math.abs(2 * p - 1) * 1.35),
    ),
    { stiffness: 150, damping: 28 },
  );

  return (
    <section className="cp-section" ref={ref}>
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Dissolve · scroll-scrubbed
      </p>

      <div className="cp-column">
        {PARAGRAPH.map((line, i) => (
          <DissolveLine key={i} text={line} line={i} dissolve={dissolve} />
        ))}
      </div>

      <p className="cp-note">
        Bearings are hashed from each letter&rsquo;s position in the
        paragraph, so they never change between frames — and the thresholds
        are hashed too, so it erodes in patches instead of wiping across.
      </p>
    </section>
  );
}

function DissolveLine({
  text,
  line,
  dissolve,
}: {
  text: string;
  line: number;
  dissolve: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (d) => (u: number) => {
      /* Recover this glyph's index in the line from its normalised centre,
       * then its index in the paragraph — the stagger has to run across
       * the whole block, not restart on every line. */
      const glyph = Math.round(((u + 1) / 2) * (text.length - 1));
      const n = readingIndex(line, glyph);

      const bearing = hash01(n, 7) * Math.PI * 2;
      const distance = 0.35 + hash01(n, 13) * 0.65;
      const threshold = hash01(n, 23) * SPREAD;

      const local = ramp(d, threshold, threshold + (1 - SPREAD));
      const travel = local * REACH * distance;

      return {
        dx: Math.cos(bearing) * travel,
        dy: Math.sin(bearing) * travel,
        rot: (hash01(n, 31) - 0.5) * 2 * SPIN * local,
        sx: 1 - local * 0.4,
        sy: 1 - local * 0.4,
        o: 1 - local,
      };
    },
    [line, text.length],
  );

  return (
    <p className="cp-line">
      <GlyphLine text={text} value={dissolve} curve={curve} />
    </p>
  );
}
