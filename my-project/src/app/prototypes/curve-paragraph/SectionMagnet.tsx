"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH } from "./copy";
import { useLineHeight } from "./useLineHeight";

/* ── MAGNET ───────────────────────────────────────────────────────────
 * The paragraph is aware of the cursor. Letters near the pointer are
 * pushed aside and shrink slightly; the effect falls off smoothly so
 * there is a soft dent in the text that follows your hand.
 *
 * Falloff is a Gaussian in TWO dimensions, so the dent is round rather
 * than a column — a letter three lines up and slightly left is displaced
 * exactly as much as one the same actual distance away on the same line.
 * Doing this per line with a 1D falloff is the usual shortcut and it
 * always reads as a lift, never as a dent.
 *
 * The pointer is springed, not read raw. A cursor produces a jagged
 * sequence of positions and the dent has to have some mass or it snaps
 * around like a cheap hover state.
 *
 * There is no entrance and no exit. It only exists while you are in it. */

const RADIUS = 130; // px
const PUSH = 26; // px at the centre of the dent

export function SectionMagnet() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { columnRef, offsetOf } = useLineHeight(PARAGRAPH.length);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(-9999);
  const pointerX = useSpring(rawX, { stiffness: 340, damping: 32 });
  const pointerY = useSpring(rawY, { stiffness: 340, damping: 32 });

  const onMove = useCallback(
    (event: React.PointerEvent) => {
      if (reduce) return;
      const box = columnRef.current?.getBoundingClientRect();
      if (!box) return;
      rawX.set(event.clientX - (box.left + box.width / 2));
      rawY.set(event.clientY - (box.top + box.height / 2));
    },
    [rawX, rawY, columnRef, reduce],
  );

  return (
    <section className="cp-section" ref={fieldRef}>
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Magnet · pointer proximity
      </p>

      <div
        className="cp-column cp-column--magnet"
        ref={columnRef}
        onPointerMove={onMove}
        onPointerLeave={() => rawY.set(-9999)}
      >
        {PARAGRAPH.map((line, i) => (
          <MagnetLine
            key={i}
            text={line}
            lineY={offsetOf(i)}
            pointerX={pointerX}
            pointerY={pointerY}
          />
        ))}
      </div>

      <p className="cp-note">
        A round dent, not a column: falloff is two-dimensional, so a letter
        three lines up is displaced by its real distance from the cursor.
        The pointer is springed so the dent carries some mass.
      </p>
    </section>
  );
}

function MagnetLine({
  text,
  lineY,
  pointerX,
  pointerY,
}: {
  text: string;
  lineY: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (px, half) => {
      const py = pointerY.get();

      return (u: number) => {
        const flatX = u * half;
        const dx = flatX - px;
        const dy = lineY - py;
        const distance = Math.hypot(dx, dy);

        const falloff = Math.exp(-(distance * distance) / (2 * RADIUS * RADIUS));
        if (falloff < 0.004) return { dx: 0, dy: 0, rot: 0 };

        /* Push directly away from the cursor. */
        const norm = distance || 1;
        return {
          dx: (dx / norm) * PUSH * falloff,
          dy: (dy / norm) * PUSH * falloff,
          rot: 0,
          sx: 1 - falloff * 0.16,
          sy: 1 - falloff * 0.16,
          o: 1 - falloff * 0.45,
        };
      };
    },
    [lineY, pointerY],
  );

  return (
    <p className="cp-line">
      <GlyphLine text={text} value={pointerX} also={[pointerY]} curve={curve} />
    </p>
  );
}
