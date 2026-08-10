"use client";

import { useEffect, useRef } from "react";
import { PAPER } from "./math";

export type OpCanvasProps = {
  draw: (ctx: CanvasRenderingContext2D, size: number, tau: number) => void;
  /** loop length in seconds */
  period?: number;
  /** cap the redraw rate — the per-pixel pieces are indistinguishable at 30 */
  fps?: number;
  className?: string;
  label?: string;
};

/**
 * Square canvas driving one seamless loop: tau runs 0 → 1 and the draw function
 * must land back on its starting frame. Pauses when scrolled out of view and
 * parks on the rest frame under prefers-reduced-motion.
 */
export default function OpCanvas({
  draw,
  period = 8,
  fps,
  className,
  label,
}: OpCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const periodRef = useRef(period);
  periodRef.current = period;
  const fpsRef = useRef(fps);
  fpsRef.current = fps;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let size = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let last = -1e9;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const s = Math.max(1, rect.width);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = s;
      canvas.width = Math.round(s * dpr);
      canvas.height = Math.round(s * dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || size === 0) return;
      const cap = fpsRef.current;
      if (cap && now - last < 1000 / cap - 1) return;
      last = now;

      const tau = reduced.matches
        ? 0
        : ((((now - start) / 1000 / periodRef.current) % 1) + 1) % 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, size, size);
      ctx.save();
      drawRef.current(ctx, size, tau);
      ctx.restore();
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-label={label}
      role="img"
      className={className}
      style={{ width: "100%", aspectRatio: "1 / 1", display: "block" }}
    />
  );
}
