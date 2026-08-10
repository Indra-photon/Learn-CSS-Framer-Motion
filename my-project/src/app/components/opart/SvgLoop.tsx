"use client";

import { useEffect, useRef } from "react";
import type { GlassVariation } from "./glass";

/**
 * Same loop contract as OpCanvas, driving SVG filter attributes instead of
 * pixels: tau runs 0 → 1 and every animated value must land back where it
 * started. Filters are expensive, so this pauses entirely when scrolled out
 * of view — a static filter costs nothing, it is the re-evaluation that hurts.
 */
export default function SvgLoop({ v }: { v: GlassVariation }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let raf = 0;
    let visible = true;
    let last = -1e9;
    const start = performance.now();
    const cap = v.fps ?? 30;

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    io.observe(root);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let parked = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (reduced.matches) {
        if (parked) return;
        parked = true;
        v.apply(root, v.frame(0));
        return;
      }
      if (now - last < 1000 / cap - 1) return;
      last = now;
      const tau = ((((now - start) / 1000 / v.period) % 1) + 1) % 1;
      v.apply(root, v.frame(tau));
    };

    v.apply(root, v.frame(0));
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [v]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      role="img"
      aria-label={v.name}
      style={{ width: "100%", aspectRatio: "1 / 1", display: "block" }}
    >
      {v.render(v.id)}
    </svg>
  );
}
