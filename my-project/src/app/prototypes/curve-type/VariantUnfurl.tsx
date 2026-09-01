"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

import { GlyphLine } from "./GlyphLine";
import { pathPlacer, samplePath, type CurveFactory, type Metrics, type PathSample } from "./engine";

/* ── UNFURL ───────────────────────────────────────────────────────────
 * Shape source: A DRAWN SVG PATH. Any path at all — this one is a mark,
 * but it could be a logo, a signature, a coastline. The browser gives
 * arc-length parameterisation for free via getPointAtLength, so the text
 * is distributed along the drawing exactly as it is along a straight
 * line: the path is SCALED so its arc length equals the sentence's
 * natural width, which means letter spacing is preserved untouched
 * through the entire morph. The mark is the same sentence, coiled.
 *
 * Driver: ONE-SHOT ENTRANCE. It plays when the block arrives and does not
 * respond to anything afterwards — a title sequence, not a toy. */

const MARK =
  "M 8 96 C 40 96 44 20 84 20 C 124 20 120 120 164 120 C 208 120 206 28 250 28 C 286 28 292 84 320 84";

export function VariantUnfurl() {
  const pathRef = useRef<SVGPathElement>(null);
  const [samples, setSamples] = useState<PathSample[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const reduce = useReducedMotion() ?? false;

  /* 1 = fully coiled onto the mark, 0 = flat sentence. */
  const k = useMotionValue(reduce ? 0 : 1);

  /* Sample once per layout — never per frame. getPointAtLength is a real
   * geometry call and would be ruinous inside the paint loop. */
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !metrics?.half) return;
    setSamples(samplePath(path, metrics.half));
  }, [metrics?.half]);

  useEffect(() => {
    if (reduce || !samples.length) return;
    k.jump(1);
    const controls = animate(k, 0, {
      type: "spring",
      visualDuration: 1.1,
      bounce: 0.18,
      delay: 0.45,
    });
    return () => controls.stop();
  }, [k, reduce, samples.length]);

  const curve: CurveFactory = (value, half) =>
    pathPlacer(samples, half, value);

  return (
    <div className="ct-scene">
      <article className="ct-card ct-card--unfurl">
        <p className="ct-eyebrow">
          <span className="ct-dot" /> Studio · identity
        </p>

        <h1 className="ct-headline ct-headline--unfurl">
          <GlyphLine
            text="Built on a single curve"
            value={k}
            curve={curve}
            onMeasure={setMetrics}
          />
        </h1>

        <p className="ct-copy">
          The sentence begins wound onto the studio mark and unwinds into
          itself. Nothing is faked: the path is scaled so its arc length
          equals the line&rsquo;s natural width, so the spacing you read at
          rest is the spacing that was on the curve.
        </p>

        {/* The mark itself — sampled, never rendered. */}
        <svg className="ct-mark" viewBox="0 0 328 140" aria-hidden="true">
          <path ref={pathRef} d={MARK} />
        </svg>
      </article>
    </div>
  );
}
