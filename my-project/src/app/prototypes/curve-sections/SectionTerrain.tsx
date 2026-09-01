"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { transversePlacer, type CurveFactory } from "../curve-type/engine";

/* ── TERRAIN ──────────────────────────────────────────────────────────
 * COMPOSITION: full-bleed FIELD. Not a line of type on a page — twenty
 * lines that together are the page. The type is the background, the
 * texture and the artwork at once, which is a poster idea rather than a
 * component idea.
 *
 * MOTION PATTERN: ambient and never-triggered. A 2D bump drifts across
 * the field on a slow Lissajous path, and every line is a horizontal
 * slice through it — so what you read as a contour map moving is really
 * one surface being sampled at twenty heights. The pointer pulls the
 * bump towards it; if nobody touches it, it carries on regardless.
 *
 * EASING: none anywhere. Two sines of incommensurate period, so the
 * drift never visibly repeats and never restarts. The only eased thing
 * in the whole section is the pointer's pull on the peak. */

const ROWS = 20;
const WORD = "SURFACE ";
const PEAK = 46; // px
/** Falloff of the bump, in rows and in fractions of the line width. */
const SPREAD_ROWS = 4.4;
const SPREAD_X = 0.3;

export function SectionTerrain() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  /* Bump centre: x in −1…1 across the field, y in row units. */
  const peakX = useMotionValue(0);
  const peakY = useMotionValue(ROWS / 2);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useAnimationFrame((t) => {
    if (reduce) return;
    const s = t / 1000;

    /* Incommensurate periods: the path never closes, so the field never
     * visibly loops. */
    const driftX = Math.sin(s * 0.31) * 0.72;
    const driftY = ROWS / 2 + Math.sin(s * 0.21) * (ROWS * 0.3);

    const target = pointer.current;
    /* Ease towards the pointer when there is one, drift when there is
     * not. The only easing in the section. */
    peakX.set(peakX.get() + ((target ? target.x : driftX) - peakX.get()) * 0.08);
    peakY.set(peakY.get() + ((target ? target.y : driftY) - peakY.get()) * 0.08);
  });

  const onMove = useCallback((event: React.PointerEvent) => {
    const box = fieldRef.current?.getBoundingClientRect();
    if (!box) return;
    pointer.current = {
      x: ((event.clientX - box.left) / box.width) * 2 - 1,
      y: ((event.clientY - box.top) / box.height) * ROWS,
    };
  }, []);

  return (
    <section className="cs-section cs-terrain">
      <div
        className="cs-terrain-field"
        ref={fieldRef}
        onPointerMove={onMove}
        onPointerLeave={() => (pointer.current = null)}
        aria-label="Surface — a typographic contour field"
        role="img"
      >
        {Array.from({ length: ROWS }, (_, row) => (
          <TerrainRow key={row} row={row} peakX={peakX} peakY={peakY} />
        ))}
      </div>

      <div className="cs-terrain-caption">
        <p className="cs-eyebrow">
          <span className="cs-dot" /> Surface · contour field
        </p>
        <p className="cs-copy">
          Twenty lines slicing one drifting bump. Move across it and the
          peak follows you; leave it alone and it carries on along a path
          built from two sines that never come back into step.
        </p>
      </div>
    </section>
  );
}

function TerrainRow({
  row,
  peakX,
  peakY,
}: {
  row: number;
  peakX: MotionValue<number>;
  peakY: MotionValue<number>;
}) {
  const curve: CurveFactory = useMemo(
    () => (_, half) => {
      /* How strongly this row is lifted depends on its distance from the
       * bump's row — this is what turns a row of lines into a surface. */
      const dRow = (row - peakY.get()) / SPREAD_ROWS;
      const rowWeight = Math.exp(-dRow * dRow);
      const cx = peakX.get() * half;

      return transversePlacer((x) => {
        const dx = (x - cx) / (SPREAD_X * half * 2);
        return -PEAK * rowWeight * Math.exp(-dx * dx);
      }, half, 0.5);
    },
    [row, peakX, peakY],
  );

  return (
    <div className="cs-terrain-row" data-row={row}>
      <GlyphLine
        text={WORD.repeat(9)}
        value={peakX}
        also={[peakY]}
        curve={curve}
      />
    </div>
  );
}
