"use client";

import React, { useEffect, useMemo } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { type CurveFactory } from "../curve-type/engine";

/* ── FLIP ─────────────────────────────────────────────────────────────
 * COMPOSITION: a stat block. Three figures in a row, the shape of a
 * metrics band rather than a hero — the piece of a marketing page that
 * has to carry numbers.
 *
 * MOTION PATTERN: MECHANICAL. Everything else in both sets is springs and
 * smooth fields; this is a split-flap board. Position, rotation and the
 * flap itself are all QUANTISED — glyphs cannot occupy an in-between
 * state, they can only be on a step. The arc they arrive along is
 * quantised too, so the curve straightens in visible detents.
 *
 * EASING: linear time, quantised output. This is the one legitimate use
 * of steps() thinking — the character comes from the quantisation, and a
 * spring here would destroy it outright. Note the deliberate asymmetry
 * with every other variant: no bounce, no overshoot, no settle.
 *
 * The stagger is by column, not by distance from centre, because a board
 * flips left to right — that is the reference. */

const STATS = [
  { value: "2.4M", label: "Requests / day" },
  { value: "99.99%", label: "Uptime, 90d" },
  { value: "38ms", label: "p95 latency" },
];

/** Detents the arc collapses through. */
const STEPS = 7;
const ARC = 54; // px of lift at the ends
const FLAP_DURATION = 1.15; // seconds

export function SectionFlip() {
  return (
    <section className="cs-section cs-flip">
      <p className="cs-eyebrow">
        <span className="cs-dot" /> Platform · last 90 days
      </p>

      <div className="cs-flip-row">
        {STATS.map((stat, i) => (
          <FlipStat key={stat.label} {...stat} index={i} />
        ))}
      </div>

      <p className="cs-copy cs-copy--center">
        Quantised on purpose. Position, tilt and the flap are all snapped
        to detents, and time runs linearly — there is no spring anywhere in
        this section. Mechanical is a personality, not a failure to smooth.
      </p>
    </section>
  );
}

function FlipStat({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const reduce = useReducedMotion() ?? false;
  /* 1 = fully flapped open on the arc, 0 = landed flat. */
  const progress = useMotionValue(reduce ? 0 : 1);

  useEffect(() => {
    if (reduce) return;
    progress.jump(1);
    const controls = animate(progress, 0, {
      duration: FLAP_DURATION,
      /* Linear: all shaping is in the quantisation, not the curve. */
      ease: "linear",
      delay: 0.18 + index * 0.26,
    });
    return () => controls.stop();
  }, [progress, reduce, index]);

  const curve: CurveFactory = useMemo(
    () => (p) => {
      /* Snap the whole animation to detents. Everything downstream is a
       * function of this one quantised value. */
      const step = Math.ceil(p * STEPS) / STEPS;

      return (u: number) => {
        /* Board order: left to right, not centre-out. */
        const column = (u + 1) / 2;
        const local = Math.max(0, Math.min(1, step * 1.6 - column * 0.6));
        const snapped = Math.ceil(local * STEPS) / STEPS;

        return {
          dx: 0,
          dy: -snapped * ARC * (0.4 + 0.6 * Math.abs(u)),
          rot: snapped * 26 * Math.sign(u || 1),
          /* The flap: the card is edge-on at the top of its travel and
           * fully open when it lands. Quantised, so it reads as discrete
           * leaves turning rather than a scale tween. */
          sy: 1 - snapped * 0.85,
        };
      };
    },
    [],
  );

  return (
    <div className="cs-flip-stat">
      <p className="cs-flip-value">
        <GlyphLine text={value} value={progress} curve={curve} />
      </p>
      <p className="cs-flip-label">{label}</p>
    </div>
  );
}
