"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  animate,
} from "motion/react";

import { GlyphLine } from "./GlyphLine";
import { arcPlacer, monotoneSpline, type CurveFactory, type Metrics } from "./engine";

/* ── SIGNAL ───────────────────────────────────────────────────────────
 * Shape source: DATA. The headline's baseline is the series it reports.
 * Driver: scroll position. The reading flattens into plain typography as
 * the section settles into the middle of the viewport, so the sentence
 * is shaped by its own statistic while you are arriving at it.
 *
 * Net revenue retention, twelve months. Real-looking, not random: a dip
 * through the spring, recovery into Q3. */

const SERIES = [104, 106, 103, 99, 97, 101, 108, 112, 115, 113, 117, 118];

const AMPLITUDE = 74;

export function VariantSignal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const reduce = useReducedMotion() ?? false;

  /* Normalise the series to −1…+1 around its own midpoint, then smooth it
   * with a monotone spline so the curve never invents a peak the data
   * does not contain. */
  const shape = useMemo(() => {
    const min = Math.min(...SERIES);
    const max = Math.max(...SERIES);
    const mid = (min + max) / 2;
    const span = (max - min) / 2 || 1;
    /* Screen y grows downward, so a rise in the data is a negative y. */
    return monotoneSpline(SERIES.map((v) => -(v - mid) / span));
  }, []);

  /* One-shot release on mount, so the effect is legible without having to
   * scroll first. */
  const demo = useMotionValue(reduce ? 0 : 1);
  React.useEffect(() => {
    if (reduce) return;
    const controls = animate(demo, 0, {
      type: "spring",
      visualDuration: 0.9,
      bounce: 0.22,
      delay: 0.25,
    });
    return () => controls.stop();
  }, [demo, reduce]);

  /* Scrub: fully bowed at either edge of the pass, flat through the
   * middle. Springing the scroll input keeps the curve from tracking
   * wheel jitter one-to-one. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const scrubRaw = useTransform(scrollYProgress, (p) =>
    reduce ? 0 : Math.min(1, Math.abs(2 * p - 1)),
  );
  const scrub = useSpring(scrubRaw, { stiffness: 260, damping: 34 });

  /* Whichever wants more bend wins, so the mount demo reads first and
   * scroll takes over the moment you move. */
  const value = useTransform([demo, scrub], (input: number[]) =>
    Math.max(input[0], input[1]),
  );

  /* Tilt is damped hard. Twelve monthly readings make a genuinely kinky
   * curve, and glyphs sitting truly tangent to it swing past 35° — the
   * data is honest but the line stops being readable. 0.4 keeps the lean
   * as a cue to the gradient without tipping the letters over. */
  const curve: CurveFactory = (v, half) =>
    arcPlacer((x) => shape((x + half) / (2 * half)) * AMPLITUDE * v, half, 0.4);

  return (
    <div className="ct-scene" ref={sectionRef}>
      <div className="ct-runway" />

      <article className="ct-card ct-card--signal">
        <p className="ct-eyebrow">
          <span className="ct-dot" /> Net revenue retention · trailing 12mo
        </p>

        <h1 className="ct-headline">
          <GlyphLine
            text="Retention held at 118%"
            value={value}
            curve={curve}
            onMeasure={setMetrics}
          />
        </h1>

        {metrics ? <SeriesChart half={metrics.half} shape={shape} /> : null}

        <p className="ct-copy">
          The line above is not decoration. Each glyph sits at its own arc
          length along the series it describes — the spring contraction, the
          recovery through Q3, the flat month before it. Scroll and the
          baseline resolves back into plain type.
        </p>
      </article>

      <div className="ct-runway" />
    </div>
  );
}

/* The same function, drawn — so the claim that the type rides the data is
 * checkable rather than asserted. */
function SeriesChart({
  half,
  shape,
}: {
  half: number;
  shape: (t: number) => number;
}) {
  const width = half * 2;
  const height = 92;
  const steps = 96;

  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return `${(t * width).toFixed(1)},${(height / 2 + shape(t) * (height / 2 - 8)).toFixed(1)}`;
  }).join(" ");

  const last = SERIES.length - 1;
  const min = Math.min(...SERIES);
  const max = Math.max(...SERIES);
  const mid = (min + max) / 2;
  const span = (max - min) / 2 || 1;

  return (
    <svg
      className="ct-chart"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Net revenue retention, twelve months, ending at 118 percent"
    >
      <polyline className="ct-chart-line" points={points} />
      {SERIES.map((v, i) => {
        const t = i / last;
        const y = height / 2 + -((v - mid) / span) * (height / 2 - 8);
        return (
          <circle
            key={i}
            className={i === last ? "ct-chart-dot ct-chart-dot--last" : "ct-chart-dot"}
            cx={t * width}
            cy={y}
            r={i === last ? 4 : 2}
          />
        );
      })}
    </svg>
  );
}
