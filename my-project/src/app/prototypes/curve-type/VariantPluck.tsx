"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

import { GlyphLine } from "./GlyphLine";
import { transversePlacer, type CurveFactory } from "./engine";

/* ── PLUCK ────────────────────────────────────────────────────────────
 * Shape source: PHYSICS. The headline is a string clamped at both ends,
 * and the curve is its standing wave:
 *
 *     y(ξ, t) = A · sin(nπξ) · e^(−t∕τ) · cos(2πft)
 *
 * sin(nπξ) is zero at ξ = 0 and 1, so the ends stay pinned — the letters
 * at the edges never move, which is exactly how a plucked string behaves
 * and is the detail that makes it read as physical rather than as an
 * effect. Where you click sets the harmonic: the middle gives the
 * fundamental, the edges excite higher modes with visible nodes.
 *
 * Driver: DIRECT MANIPULATION. Nothing happens on scroll. The reader has
 * to touch it, which is the whole proposition. */

const AMPLITUDE = 52;
/** Oscillations per second. */
const FREQUENCY = 2.6;
/** Decay constant, in seconds. */
const TAU = 0.62;
/** Seconds of ring-out before the value is parked. */
const RING = 2.6;

export function VariantPluck() {
  const reduce = useReducedMotion() ?? false;

  /* Seconds since the pluck. One value drives the whole line. */
  const time = useMotionValue(RING);
  const mode = useRef(1);
  const [struck, setStruck] = useState(0);

  const pluck = useCallback(
    (harmonic: number) => {
      if (reduce) return;
      mode.current = harmonic;
      time.jump(0);
      /* Linear, deliberately: this is a clock feeding a physical model,
       * not an easing curve. All the shaping lives in the equation. */
      animate(time, RING, { duration: RING, ease: "linear" });
      setStruck((n) => n + 1);
    },
    [reduce, time],
  );

  /* Sound it once on mount so the idea lands before anyone clicks. */
  useEffect(() => {
    const id = setTimeout(() => pluck(1), 420);
    return () => clearTimeout(id);
  }, [pluck]);

  const onStrike = (event: React.MouseEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const p = ((event.clientX - box.left) / box.width) * 2 - 1;
    /* Centre → fundamental; towards either end → higher modes. */
    pluck(1 + Math.round(2 * Math.abs(p)));
  };

  const curve: CurveFactory = (t, half) => {
    const envelope =
      AMPLITUDE * Math.exp(-t / TAU) * Math.cos(2 * Math.PI * FREQUENCY * t);
    const n = mode.current;

    /* Transverse, not arc-length: the ends are clamped nodes and must
     * stay exactly put, and a string's points displace across it rather
     * than sliding along it. */
    return transversePlacer((x) => {
      const xi = (x + half) / (2 * half);
      if (xi < 0 || xi > 1) return 0;
      return Math.sin(n * Math.PI * xi) * envelope;
    }, half);
  };

  return (
    <div className="ct-scene">
      <article className="ct-card ct-card--pluck">
        <p className="ct-eyebrow">
          <span className="ct-dot" /> Interaction study · standing wave
        </p>

        <h1
          className="ct-headline ct-headline--pluck"
          onClick={onStrike}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              pluck(1);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Perfectly in tune — activate to pluck the headline"
        >
          <GlyphLine text="Perfectly in tune" value={time} curve={curve} />
        </h1>

        <p className="ct-copy">
          Click anywhere along the words. The ends are clamped, so they never
          move; where you strike picks the harmonic, and the wave rings down
          on a real decay envelope rather than an easing curve.
        </p>

        <p className="ct-hint" aria-live="polite">
          {struck === 0
            ? "Click the headline"
            : `Mode ${mode.current} · ${struck} pluck${struck === 1 ? "" : "s"}`}
        </p>
      </article>
    </div>
  );
}
