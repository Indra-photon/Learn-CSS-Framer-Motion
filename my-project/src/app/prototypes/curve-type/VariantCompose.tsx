"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

import { GlyphLine } from "./GlyphLine";
import { cubicBezier, polylinePlacer, type CurveFactory, type Metrics } from "./engine";

/* ── COMPOSE ──────────────────────────────────────────────────────────
 * Curve: an EDITABLE CUBIC BÉZIER. Not a curve chosen by the designer and
 * animated at the reader — a curve the reader draws. Text rides it via
 * `polylinePlacer`, the general 2D case, so the curve is free to double
 * back on itself in a way none of the y = f(x) variants can.
 *
 * Interaction: AUTHORING. There is no entrance, no scroll coupling, no
 * decay. The only motion in the whole variant is the type following your
 * hands, plus a spring when you reset. This is what the same engine looks
 * like as a TOOL rather than as a display piece — the "type on a path"
 * control from a design app, live.
 *
 * Control points are stored normalised (x as a fraction of the line's
 * half-width, y in px) so the curve survives resize and font swap. */

type Point = { x: number; y: number };

const DEFAULT: Point[] = [
  { x: -1.02, y: 34 },
  { x: -0.42, y: -128 },
  { x: 0.44, y: 118 },
  { x: 1.02, y: -30 },
];

export function VariantCompose() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>(DEFAULT);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const reduce = useReducedMotion() ?? false;

  const half = metrics?.half ?? 0;

  /* Nothing animates by itself here; the value exists so GlyphLine has a
   * subscription, and so Reset has something to spring. */
  const reset = useMotionValue(0);

  const toPixels = useCallback(
    (p: Point) => ({ x: p.x * half, y: p.y }),
    [half],
  );

  const samples = useMemo(
    () =>
      half
        ? cubicBezier(
            toPixels(points[0]),
            toPixels(points[1]),
            toPixels(points[2]),
            toPixels(points[3]),
          )
        : [],
    [points, half, toPixels],
  );

  const curve: CurveFactory = useMemo(
    () => (_, lineHalf) => polylinePlacer(samples, lineHalf, 0.85),
    [samples],
  );

  const onDrag = useCallback(
    (event: React.PointerEvent, index: number) => {
      const box = stageRef.current?.getBoundingClientRect();
      if (!box || !half) return;

      const x = (event.clientX - box.left - box.width / 2) / half;
      const y = event.clientY - box.top - box.height / 2;

      setPoints((prev) =>
        prev.map((p, i) =>
          i === index
            ? { x: Math.max(-1.4, Math.min(1.4, x)), y: Math.max(-190, Math.min(190, y)) }
            : p,
        ),
      );
    },
    [half],
  );

  const restore = () => {
    /* Spring the handles home rather than snapping — the one moment in
     * this variant where the tool animates instead of the hand. */
    if (reduce) {
      setPoints(DEFAULT);
      return;
    }
    const from = points;
    animate(reset, 1, {
      type: "spring",
      visualDuration: 0.55,
      bounce: 0.2,
      onUpdate: (t) => {
        setPoints(
          from.map((p, i) => ({
            x: p.x + (DEFAULT[i].x - p.x) * t,
            y: p.y + (DEFAULT[i].y - p.y) * t,
          })),
        );
      },
      onComplete: () => reset.jump(0),
    });
  };

  return (
    <div className="ct-scene">
      <article className="ct-card ct-card--compose">
        <p className="ct-eyebrow">
          <span className="ct-dot" /> Editor · type on a path
        </p>

        <div className="ct-compose-stage" ref={stageRef}>
          <h1 className="ct-headline ct-headline--compose">
            <GlyphLine
              text="Drag the handles"
              value={reset}
              curve={curve}
              onMeasure={setMetrics}
            />
          </h1>

          {half > 0 ? (
            <svg
              className="ct-handles"
              viewBox={`${-half - 60} -210 ${2 * half + 120} 420`}
              aria-hidden="true"
            >
              <path
                className="ct-handle-curve"
                d={samples
                  .filter((_, i) => i % 4 === 0)
                  .map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                  .join(" ")}
              />
              {[
                [0, 1],
                [3, 2],
              ].map(([a, b]) => (
                <line
                  key={a}
                  className="ct-handle-leg"
                  x1={points[a].x * half}
                  y1={points[a].y}
                  x2={points[b].x * half}
                  y2={points[b].y}
                />
              ))}
              {points.map((p, i) => (
                <circle
                  key={i}
                  className="ct-handle"
                  data-kind={i === 0 || i === 3 ? "anchor" : "control"}
                  data-dragging={dragging === i ? "" : undefined}
                  cx={p.x * half}
                  cy={p.y}
                  r={i === 0 || i === 3 ? 11 : 9}
                  onPointerDown={(e) => {
                    (e.target as SVGElement).setPointerCapture(e.pointerId);
                    setDragging(i);
                  }}
                  onPointerMove={(e) => dragging === i && onDrag(e, i)}
                  onPointerUp={() => setDragging(null)}
                  onPointerCancel={() => setDragging(null)}
                />
              ))}
            </svg>
          ) : null}
        </div>

        <p className="ct-copy">
          Four control points, one cubic Bézier, glyphs distributed along it
          by arc length. Because placement is 2D rather than a function of
          x, the curve may fold back on itself and the text will happily
          follow it backwards.
        </p>

        <button className="ct-button" onClick={restore}>
          Reset curve
        </button>
      </article>
    </div>
  );
}
