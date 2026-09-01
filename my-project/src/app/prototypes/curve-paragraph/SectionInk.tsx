"use client";

import React, { useEffect, useMemo } from "react";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { easeOutQuint, ramp, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH, TOTAL_GLYPHS, readingIndex } from "./copy";

/* ── INK ──────────────────────────────────────────────────────────────
 * The paragraph writes itself on, in reading order, one letter behind the
 * next — the way ink lands rather than the way a block fades in.
 *
 * The stagger runs across the WHOLE paragraph, not per line, so the wave
 * of arrival crosses line breaks exactly as reading does. Each glyph
 * drops a few pixels, opens from 0.82 vertically, and fades up.
 *
 * One clock, no per-glyph animations. Three hundred and forty springs
 * would be three hundred and forty animation objects; instead a single
 * linear value sweeps 0→1 and every glyph reads its own slice out of it.
 * The easing lives in the slice, not in the driver — which is also what
 * lets the whole thing be scrubbed or replayed for free. */

const DROP = 15; // px
const WINDOW = 0.16; // fraction of the timeline one glyph takes to land
const DURATION = 2.1; // seconds for the full paragraph

export function SectionInk() {
  const reduce = useReducedMotion() ?? false;
  const progress = useMotionValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) return;
    progress.jump(0);
    const controls = animate(progress, 1, {
      duration: DURATION,
      /* Linear driver: every glyph applies its own ease-out to its own
       * slice, so the paragraph lands evenly instead of the tail
       * bunching up. */
      ease: "linear",
      delay: 0.2,
    });
    return () => controls.stop();
  }, [progress, reduce]);

  return (
    <section className="cp-section">
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Ink · reading-order arrival
      </p>

      <div className="cp-column">
        {PARAGRAPH.map((line, i) => (
          <InkLine key={i} text={line} line={i} progress={progress} />
        ))}
      </div>

      <p className="cp-note">
        One clock drives every letter. The stagger crosses line breaks the
        way reading does, and each glyph eases its own slice — so the tail
        of the paragraph lands as crisply as the head.
      </p>
    </section>
  );
}

function InkLine({
  text,
  line,
  progress,
}: {
  text: string;
  line: number;
  progress: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (p) => (u: number) => {
      const glyph = Math.round(((u + 1) / 2) * (text.length - 1));
      const n = readingIndex(line, glyph);

      /* This glyph's slice of the shared timeline. */
      const start = (n / TOTAL_GLYPHS) * (1 - WINDOW);
      const local = easeOutQuint(ramp(p, start, start + WINDOW));

      return {
        dx: 0,
        dy: (1 - local) * DROP,
        rot: 0,
        sy: 0.82 + local * 0.18,
        o: local,
      };
    },
    [line, text.length],
  );

  return (
    <p className="cp-line">
      <GlyphLine text={text} value={progress} curve={curve} />
    </p>
  );
}
