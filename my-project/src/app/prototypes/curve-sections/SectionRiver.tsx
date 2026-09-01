"use client";

import React, { useMemo, useRef } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { transversePlacer, type CurveFactory } from "../curve-type/engine";

/* ── RIVER ────────────────────────────────────────────────────────────
 * COMPOSITION: a PARAGRAPH, not a headline. Eight lines of running copy
 * in a reading column — the case every other variant dodges by animating
 * three words at 92px.
 *
 * MOTION PATTERN: a wave that travels DOWN the page through the stack.
 * Each line samples the same travelling sine, offset by its own position
 * in the column, so the crest passes through the paragraph like a swell
 * under a raft rather than every line moving together.
 *
 * EASING: none, in the deliberate sense — the phase is mapped straight
 * from scroll position, so the reader's own scrolling IS the easing
 * curve. A spring smooths the input, nothing more. Stop scrolling and it
 * stops; there is no playback to wait for.
 *
 * Amplitude is small on purpose. This has to stay readable at body size,
 * which is the whole test. */

const LINES = [
  "We started with a simple observation about the way",
  "people read long-form work on the web: they scan the",
  "shape of a paragraph before they read a word of it.",
  "So we built a type system that treats the shape as",
  "something you can compose with — a baseline that can",
  "carry rhythm, weight and motion without ever giving up",
  "the thing that matters most, which is that the sentence",
  "stays perfectly legible while it moves.",
];

const AMPLITUDE = 9;
/** Wavelength as a fraction of the column width. */
const WAVELENGTH = 1.45;
/** Phase shift per line — this is what makes the swell travel. */
const LINE_SHIFT = 0.55;

export function SectionRiver() {
  const columnRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: columnRef,
    offset: ["start end", "end start"],
  });

  /* Scroll position drives phase directly. Springing the input only takes
   * the jitter out of a wheel; it does not add a playback curve. */
  const phase = useSpring(
    useTransform(scrollYProgress, (p) => (reduce ? 0 : p * Math.PI * 4)),
    { stiffness: 180, damping: 30 },
  );

  return (
    <section className="cs-section cs-river" ref={columnRef}>
      <p className="cs-eyebrow">
        <span className="cs-dot" /> Long-form · body copy
      </p>

      <div className="cs-river-column">
        {LINES.map((line, i) => (
          <RiverLine key={i} text={line} index={i} phase={phase} />
        ))}
      </div>

      <p className="cs-copy cs-copy--center">
        Eight lines, one travelling wave, each line reading the same
        function at its own phase. Amplitude is nine pixels — enough to see
        the swell move down the column, not enough to cost you the
        sentence.
      </p>
    </section>
  );
}

function RiverLine({
  text,
  index,
  phase,
}: {
  text: string;
  index: number;
  phase: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (p, half) =>
      transversePlacer(
        (x) =>
          Math.sin((x / half) * Math.PI * WAVELENGTH + p + index * LINE_SHIFT) *
          AMPLITUDE,
        half,
        /* Rotation would tip body copy off its baseline and cost more
         * legibility than it buys at this size. Displacement only. */
        0,
      ),
    [index],
  );

  return (
    <p className="cs-river-line">
      <GlyphLine text={text} value={phase} curve={curve} />
    </p>
  );
}
