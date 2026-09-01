"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { hash01, ramp, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH, TOTAL_GLYPHS, readingIndex } from "./copy";

/* ── SCRAMBLE ─────────────────────────────────────────────────────────
 * The only effect in the set that changes the LETTERS rather than moving
 * them. Each glyph churns through junk characters and then locks to the
 * one it is supposed to be, left to right through the paragraph.
 *
 * Two constraints shape the whole implementation:
 *
 * MONOSPACE IS NOT A STYLE CHOICE. Swapping a character changes its
 * width, which would invalidate the flat layout that every measurement
 * here is derived from and reflow the line sixty times a second. In a
 * monospaced face every substitution is the same width, so nothing moves
 * that was not asked to move.
 *
 * THE CHURN IS DERIVED, NOT RANDOM. The junk character is a hash of the
 * glyph's index and the current time STEP, so it is stable within a step
 * and identical on replay. Calling Math.random() per glyph per frame
 * would also work, but it could not be scrubbed backwards.
 *
 * Spaces are never scrambled — churning the gaps between words destroys
 * the shape of the paragraph, which is the one thing that should survive
 * the effect. */

const JUNK = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@?/\\<>=+*";
const WINDOW = 0.2; // fraction of the timeline a glyph spends churning
const DURATION = 2.6;
const CHURN_RATE = 22; // substitutions per second

export function SectionScramble() {
  const reduce = useReducedMotion() ?? false;
  const progress = useMotionValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) return;
    progress.jump(0);
    const controls = animate(progress, 1, {
      duration: DURATION,
      ease: "linear",
      delay: 0.15,
    });
    return () => controls.stop();
  }, [progress, reduce]);

  return (
    <section className="cp-section">
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Scramble · resolves left to right
      </p>

      <div className="cp-column cp-column--mono">
        {PARAGRAPH.map((line, i) => (
          <ScrambleLine key={i} text={line} line={i} progress={progress} />
        ))}
      </div>

      <p className="cp-note">
        Monospaced out of necessity, not taste — a proportional face would
        reflow every line on every substitution. Junk characters are hashed
        from index and time step, so the churn replays identically.
      </p>
    </section>
  );
}

function ScrambleLine({
  text,
  line,
  progress,
}: {
  text: string;
  line: number;
  progress: MotionValue<number>;
}) {
  const lockOf = useCallback(
    (glyph: number) => {
      const n = readingIndex(line, glyph);
      return (n / TOTAL_GLYPHS) * (1 - WINDOW);
    },
    [line],
  );

  const charAt = useCallback(
    (glyph: number, p: number) => {
      const real = text[glyph] ?? "";
      if (real === " ") return real;

      const lock = lockOf(glyph);
      if (p >= lock + WINDOW) return real;
      if (p < lock) return real === " " ? " " : pick(glyph, p, 3);

      /* Inside its window the glyph churns faster as it approaches its
       * lock, then stops dead — no fade, it simply becomes correct. */
      return pick(glyph, p, 1);
    },
    [text, lockOf],
  );

  const curve: CurveFactory = useMemo(
    () => (p) => (u: number) => {
      const glyph = Math.round(((u + 1) / 2) * (text.length - 1));
      const lock = lockOf(glyph);
      const settled = ramp(p, lock, lock + WINDOW);

      return {
        dx: 0,
        dy: 0,
        rot: 0,
        /* Unresolved characters sit back; locked ones are full strength.
         * The dim is what makes the resolve legible as progress. */
        o: 0.24 + settled * 0.76,
      };
    },
    [text.length, lockOf],
  );

  return (
    <p className="cp-line cp-line--mono">
      <GlyphLine text={text} value={progress} charAt={charAt} curve={curve} />
    </p>
  );
}

/* Deterministic junk: stable within a time step, identical on replay. */
function pick(glyph: number, p: number, seedShift: number) {
  const step = Math.floor(p * DURATION * CHURN_RATE);
  return JUNK[Math.floor(hash01(glyph * 131 + step, seedShift) * JUNK.length)];
}
