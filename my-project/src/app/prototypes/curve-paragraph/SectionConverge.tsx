"use client";

import React, { useMemo, useRef } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { easeOutQuint, hash01, ramp, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH, readingIndex } from "./copy";
import { useLineHeight } from "./useLineHeight";

/* ── CONVERGE ─────────────────────────────────────────────────────────
 * The paragraph arrives out of a single point. Every letter starts at the
 * same place — the centre of the block — and travels to where it belongs,
 * so what you see first is one bright knot that opens into text.
 *
 * The thing that makes this work is that the point is real: a glyph's
 * start position is the origin, not "somewhere near the middle". Its
 * whole journey is the vector from the origin to its own place in the
 * paragraph, which means letters near the centre barely move and letters
 * at the corners fly furthest — the block unfolds rather than fades.
 *
 * Stagger runs by DISTANCE from the origin, so the middle of the
 * paragraph exists before the edges do. */

const SPREAD = 0.42;
const OVERSHOOT = 1.04;

export function SectionConverge() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { columnRef, offsetOf } = useLineHeight(PARAGRAPH.length);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* 1 = collapsed into the point, 0 = fully assembled. */
  const collapse = useSpring(
    useTransform(scrollYProgress, (p) =>
      reduce ? 0 : Math.min(1, Math.abs(2 * p - 1) * 1.4),
    ),
    { stiffness: 130, damping: 26 },
  );

  return (
    <section className="cp-section" ref={ref}>
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Converge · out of one point
      </p>

      <div className="cp-column" ref={columnRef}>
        {PARAGRAPH.map((line, i) => (
          <ConvergeLine
            key={i}
            text={line}
            line={i}
            lineY={offsetOf(i)}
            collapse={collapse}
          />
        ))}
      </div>

      <p className="cp-note">
        Every letter starts at the same pixel and travels its own vector
        out to its place, so the ones near the middle barely move and the
        corners fly furthest. Stagger is by distance from the origin.
      </p>
    </section>
  );
}

function ConvergeLine({
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

      /* Vector from the origin to where this glyph actually belongs. */
      const flatX = u * half;
      const reach = Math.hypot(flatX, lineY);
      const maxReach = Math.hypot(half, lineY || 1) || 1;

      /* Furthest glyphs start latest, with a little hashed jitter so the
       * front of the expansion is not a perfect circle. */
      const threshold = (reach / maxReach) * SPREAD * (0.75 + hash01(n, 5) * 0.5);
      const local = easeOutQuint(ramp(c, threshold, threshold + (1 - SPREAD)));

      return {
        dx: -flatX * local * OVERSHOOT,
        dy: -lineY * local * OVERSHOOT,
        rot: 0,
        sx: 1 - local * 0.55,
        sy: 1 - local * 0.55,
        o: 1 - local,
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
