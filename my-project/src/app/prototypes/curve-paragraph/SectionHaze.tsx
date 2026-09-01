"use client";

import React, { useEffect, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";

import { PARAGRAPH } from "./copy";

/* ── HAZE ─────────────────────────────────────────────────────────────
 * Text resolving out of blur, a line at a time. The cheapest effect in
 * the set and deliberately so: it is here as the control case.
 *
 * Everything else on this surface animates three hundred and forty
 * elements. This animates SIX — blur, lift and opacity on whole lines —
 * and at reading distance most people cannot tell you which one had the
 * per-glyph machinery. That is worth knowing before you spend the frame
 * budget somewhere it will not be seen.
 *
 * Blur is the one property here that genuinely costs: it is a filter, it
 * is not free on the GPU, and Safari in particular dislikes large radii.
 * 12px over six elements is affordable; the same effect per glyph would
 * not be. */

const BLUR = 12;
const LIFT = 26;
const STAGGER = 0.1; // seconds between lines

export function SectionHaze() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="cp-section">
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Haze · six elements, not three hundred
      </p>

      <div className="cp-column">
        {PARAGRAPH.map((line, i) => (
          <HazeLine key={i} text={line} index={i} reduce={reduce} />
        ))}
      </div>

      <p className="cp-note">
        The control case. Line-level blur and lift, six animated elements
        in total — worth comparing against the per-glyph effects before
        deciding one of them is necessary.
      </p>
    </section>
  );
}

function HazeLine({
  text,
  index,
  reduce,
}: {
  text: string;
  index: number;
  reduce: boolean;
}) {
  const progress = useMotionValue(reduce ? 1 : 0);
  const [state, setState] = useState(reduce ? 1 : 0);

  useMotionValueEvent(progress, "change", setState);

  useEffect(() => {
    if (reduce) return;
    progress.jump(0);
    const controls = animate(progress, 1, {
      type: "spring",
      visualDuration: 0.72,
      bounce: 0,
      delay: 0.2 + index * STAGGER,
    });
    return () => controls.stop();
  }, [progress, reduce, index]);

  const blur = (1 - state) * BLUR;

  return (
    <p
      className="cp-line"
      style={{
        opacity: state,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        transform: `translateY(${((1 - state) * LIFT).toFixed(2)}px)`,
        willChange: state < 1 ? "filter, transform, opacity" : undefined,
      }}
    >
      {text}
    </p>
  );
}
