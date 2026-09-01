"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type MotionValue } from "motion/react";

import type { CurveFactory, Metrics } from "./engine";

/* Splits a line into per-glyph boxes, measures the browser's own centred
 * layout, then paints every glyph from ONE subscription to one motion
 * value. The curve factory is called once per frame for the whole line —
 * not once per glyph — so a 15-character headline costs one table build.
 *
 * The outer span holds the glyph's untransformed slot in normal text
 * flow, which is what the geometry is measured from; the inner span
 * carries the transform. Measuring and painting never fight. */
export function GlyphLine({
  text,
  className,
  value,
  also,
  charAt,
  curve,
  onMeasure,
}: {
  text: string;
  className?: string;
  value: MotionValue<number>;
  /** Extra values the curve reads; changes to these repaint too. */
  also?: MotionValue<number>[];
  /* Rewrites a glyph's character each frame. Only safe in a monospaced
   * face: swapping characters changes their widths, which would
   * invalidate the flat layout every measurement here is derived from. */
  charAt?: (index: number, value: number) => string;
  curve: CurveFactory;
  onMeasure?: (metrics: Metrics) => void;
}) {
  const lineRef = useRef<HTMLSpanElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  /* The factory closes over fresh props every render; a ref keeps the
   * paint loop on the latest one without resubscribing each time. */
  const curveRef = useRef(curve);
  curveRef.current = curve;

  const chars = Array.from(text);

  const measure = useCallback(() => {
    const glyphs = glyphRefs.current;
    const first = glyphs[0];
    const last = glyphs[glyphs.length - 1];
    if (!first || !last) return;

    const width = last.offsetLeft + last.offsetWidth - first.offsetLeft;
    const half = width / 2;
    const mid = first.offsetLeft + half;

    const next: Metrics = {
      half,
      u: glyphs.map((el) =>
        el && half > 0 ? (el.offsetLeft + el.offsetWidth / 2 - mid) / half : 0,
      ),
    };

    setMetrics(next);
    onMeasure?.(next);
  }, [onMeasure]);

  useLayoutEffect(() => {
    measure();

    const line = lineRef.current;
    if (!line) return;

    /* Webfont swap and container resize both change the layout the curve
     * is derived from. */
    const observer = new ResizeObserver(measure);
    observer.observe(line);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, [measure]);

  const promoted = useRef(false);
  const written = useRef<string[]>([]);
  const paintRef = useRef<((v: number) => void) | null>(null);

  useEffect(() => {
    if (!metrics) return;

    const paint = (v: number) => {
      const place = curveRef.current(v, metrics.half);
      const glyphs = glyphRefs.current;

      for (let i = 0; i < glyphs.length; i++) {
        const el = glyphs[i]?.firstElementChild as HTMLElement | null;
        if (!el) continue;
        const { dx, dy, rot, sx, sy, o } = place(metrics.u[i]);
        const scale =
          sx !== undefined || sy !== undefined
            ? ` scale(${(sx ?? 1).toFixed(3)}, ${(sy ?? 1).toFixed(3)})`
            : "";
        el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)${scale}`;
        if (o !== undefined) el.style.opacity = o.toFixed(3);

        if (charAt) {
          const next = charAt(i, v);
          /* Only touch the DOM when the character actually changes —
           * a scramble rewrites a handful of glyphs per frame, not all
           * of them. */
          if (written.current[i] !== next) {
            written.current[i] = next;
            el.textContent = next;
          }
        }
      }

      /* Promote only while the line is actually bent. At rest it is plain
       * static text holding no compositor layer. */
      const active = Math.abs(v) > 0.001;
      if (active !== promoted.current) {
        promoted.current = active;
        for (const glyph of glyphs) {
          const el = glyph?.firstElementChild as HTMLElement | null;
          if (el) el.style.willChange = active ? "transform" : "auto";
        }
      }
    };

    paintRef.current = paint;
    paint(value.get());

    const stops = [value, ...(also ?? [])].map((mv) =>
      mv.on("change", () => paint(value.get())),
    );
    return () => stops.forEach((stop) => stop());
  }, [value, also, charAt, metrics]);

  /* Repaint after any render. Curves driven by React state rather than by
   * a motion value — an editor's dragged control points, say — change
   * without any value ticking, and would otherwise not be redrawn. */
  useEffect(() => {
    paintRef.current?.(value.get());
  });

  return (
    <span ref={lineRef} className={className} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="ct-glyph"
          aria-hidden="true"
          ref={(el) => {
            glyphRefs.current[i] = el;
          }}
        >
          <span className="ct-glyph-inner">{char}</span>
        </span>
      ))}
    </span>
  );
}
