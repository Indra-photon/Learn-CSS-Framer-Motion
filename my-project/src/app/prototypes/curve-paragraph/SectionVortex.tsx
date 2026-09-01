"use client";

import React, { useMemo, useRef } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { hash01, ramp, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH, readingIndex } from "./copy";
import { useLineHeight } from "./useLineHeight";

/* ── VORTEX ───────────────────────────────────────────────────────────
 * Converge's opposite number: the paragraph drains INTO a point instead
 * of opening out of one, and it goes round rather than straight.
 *
 * Each glyph keeps its distance from the origin as a radius and its
 * bearing as an angle; collapsing shortens the radius while adding to the
 * angle, so every letter follows a spiral home. Because the added angle
 * is the same for all of them but their radii differ, the outer letters
 * sweep further in absolute terms — the block visibly winds up.
 *
 * The glyphs also spin about their own centres at a different rate, which
 * is what stops the whole thing reading as one rigid rotating slab. */

const TURN = 260; // degrees added to each glyph's bearing
const SPIN = 420; // degrees each glyph turns about itself
const SPREAD = 0.35;

export function SectionVortex() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { columnRef, offsetOf } = useLineHeight(PARAGRAPH.length);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const collapse = useSpring(
    useTransform(scrollYProgress, (p) =>
      reduce ? 0 : Math.min(1, Math.abs(2 * p - 1) * 1.4),
    ),
    { stiffness: 120, damping: 24 },
  );

  return (
    <section className="cp-section" ref={ref}>
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Vortex · drains to a point
      </p>

      <div className="cp-column" ref={columnRef}>
        {PARAGRAPH.map((line, i) => (
          <VortexLine
            key={i}
            text={line}
            line={i}
            lineY={offsetOf(i)}
            collapse={collapse}
          />
        ))}
      </div>

      <p className="cp-note">
        Polar, not linear: collapsing shortens each letter&rsquo;s radius
        while adding to its bearing, so it spirals home. Outer letters
        sweep further than inner ones and the block winds up.
      </p>
    </section>
  );
}

function VortexLine({
  text,
  line,
  lineY,
  collapse,
}: {
  text: string;
  line: number;
  lineY: number;
  collapse: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (c, half) => (u: number) => {
      const glyph = Math.round(((u + 1) / 2) * (text.length - 1));
      const n = readingIndex(line, glyph);

      const flatX = u * half;
      const radius = Math.hypot(flatX, lineY);
      const bearing = Math.atan2(lineY, flatX);

      const threshold = hash01(n, 17) * SPREAD;
      const local = ramp(c, threshold, threshold + (1 - SPREAD));

      /* Shrinking radius, growing angle — a spiral, not a slide. */
      const r = radius * (1 - local);
      const a = bearing + (local * TURN * Math.PI) / 180;

      return {
        dx: Math.cos(a) * r - flatX,
        dy: Math.sin(a) * r - lineY,
        rot: local * SPIN * (hash01(n, 29) > 0.5 ? 1 : -1),
        sx: 1 - local * 0.8,
        sy: 1 - local * 0.8,
        o: 1 - local * local,
      };
    },
    [line, text.length, lineY],
  );

  return (
    <p className="cp-line">
      <GlyphLine text={text} value={collapse} curve={curve} />
    </p>
  );
}
