"use client";

import { useEffect, useRef } from "react";

/**
 * WEAVE — a looping op-art grid.
 *
 * Vocabulary: every tile is a square window clipped by ONE half-plane.
 * Triangle, trapezoid, sliver and solid block are all the same primitive; the
 * only two variables in the whole piece are the ANGLE of that edge and its
 * SIGNED DISTANCE from the tile's centre.
 *
 * Rest state:  linear field — every tile rests at the SAME angle, so the still
 *              frame reads as one parallel grating, not a starburst.
 * Motion:      whole-number turns, staggered along the DIAGONAL. Everyone lands
 *              on the same frame, so mid-run one corner is a full turn ahead of
 *              the other and the field of mismatched angles is the "vortex".
 * Offset:      the edge also slides along its own normal, a whole number of
 *              cycles per loop, phase gained by radius — rings of heavier and
 *              lighter black. Damped toward the centre; clamped so no tile ever
 *              saturates to solid.
 *
 * Seamlessness is the constraint: every law returns to its start at tau = 1.
 */

export type WeaveGridProps = {
  /** tiles per side */
  cols?: number;
  /** fraction of a cell given to the gutter */
  gutter?: number;
  /** loop length, seconds */
  period?: number;
  /** rest angle of every edge, degrees (linear field) */
  fieldAngle?: number;
  /** WHOLE number of turns each tile makes per loop */
  turns?: number;
  /** fraction of the loop spent handing the motion across the diagonal */
  spread?: number;
  /** WHOLE number of offset cycles per loop */
  offsetCycles?: number;
  /** WHOLE number of offset rings across the radius */
  ripples?: number;
  /** peak edge offset as a fraction of the tile half-width (keep < 1.0) */
  offsetAmount?: number;
  paper?: string;
  ink?: string;
  className?: string;
};

const TAU = Math.PI * 2;

/** Ease in-out — the tiles are MOVING on screen, not entering or leaving. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/**
 * Sutherland–Hodgman against a single half-plane: keep the part of the polygon
 * where dot(p, n) <= d. Points are flat [x0,y0,x1,y1,...] in tile-local space.
 * Returns the clipped polygon, or null if nothing survives.
 */
function clipHalfPlane(
  poly: number[],
  nx: number,
  ny: number,
  d: number
): number[] | null {
  const out: number[] = [];
  const n = poly.length / 2;
  for (let i = 0; i < n; i++) {
    const ax = poly[i * 2];
    const ay = poly[i * 2 + 1];
    const j = (i + 1) % n;
    const bx = poly[j * 2];
    const by = poly[j * 2 + 1];

    const da = ax * nx + ay * ny - d;
    const db = bx * nx + by * ny - d;
    const aIn = da <= 0;
    const bIn = db <= 0;

    if (aIn) out.push(ax, ay);
    if (aIn !== bIn) {
      const t = da / (da - db);
      out.push(ax + (bx - ax) * t, ay + (by - ay) * t);
    }
  }
  return out.length >= 6 ? out : null;
}

export default function WeaveGrid({
  cols = 10,
  gutter = 0.19,
  period = 9,
  fieldAngle = 45,
  turns = 1,
  spread = 0.5,
  offsetCycles = 1,
  ripples = 2,
  offsetAmount = 0.62,
  paper = "#FFFFFF",
  ink = "#111111",
  className,
}: WeaveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Props the loop reads every frame without re-subscribing.
  const cfg = useRef({
    cols,
    gutter,
    period,
    fieldAngle,
    turns,
    spread,
    offsetCycles,
    ripples,
    offsetAmount,
    paper,
    ink,
  });
  cfg.current = {
    cols,
    gutter,
    period,
    fieldAngle,
    turns,
    spread,
    offsetCycles,
    ripples,
    offsetAmount,
    paper,
    ink,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let size = 0;
    let dpr = 1;
    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const s = Math.max(1, Math.min(rect.width, rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = s;
      canvas.width = Math.round(s * dpr);
      canvas.height = Math.round(s * dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = (now: number) => {
      const c = cfg.current;
      const n = Math.max(2, Math.round(c.cols));

      // tau ∈ [0,1) — the loop. Reduced motion parks it on the rest frame.
      const tau = reduced.matches
        ? 0
        : (((now - start) / 1000 / c.period) % 1 + 1) % 1;

      const cell = size / n;
      const half = (cell * (1 - c.gutter)) / 2; // tile half-width

      // Origin ON a tile, never on a gutter: an even tile count would otherwise
      // put the field centre on a 4-way seam.
      const ci = Math.floor(n / 2);
      const ox = (ci + 0.5) * cell;
      const oy = (ci + 0.5) * cell;
      const maxR = Math.hypot(
        Math.max(ox, size - ox),
        Math.max(oy, size - oy)
      );

      const rest = (c.fieldAngle * Math.PI) / 180;
      const wholeTurns = Math.round(c.turns);
      const wholeCycles = Math.round(c.offsetCycles);
      const wholeRipples = Math.round(c.ripples);
      const spreadAmt = Math.min(0.95, Math.max(0, c.spread));
      const diagMax = (n - 1) * 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = c.paper;
      ctx.fillRect(0, 0, size, size);

      // ONE path for the entire grid — every tile is the same colour.
      const path = new Path2D();

      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          const cx = (i + 0.5) * cell;
          const cy = (j + 0.5) * cell;
          const r = Math.hypot(cx - ox, cy - oy) / maxR;

          // --- stagger: delay runs on the diagonal, everyone lands together ---
          const delay = ((i + j) / diagMax) * spreadAmt;
          const p = easeInOut(clamp01((tau - delay) / (1 - delay)));

          // --- angle: rest angle + a WHOLE number of turns (a half turn would
          // map the half-plane onto its complement and wrap with a flash) ---
          const a = rest + wholeTurns * TAU * p;
          const nx = Math.cos(a);
          const ny = Math.sin(a);

          // --- offset: slides along its own normal, whole cycles per loop,
          // phase gained by radius, damped toward the centre, clamped so the
          // tile can never fill solid or empty out ---
          const amp =
            c.offsetAmount * half * smoothstep(0.05, 0.75, r) * 0.86;
          const phase = wholeRipples * r;
          const d = amp * Math.sin(TAU * (wholeCycles * tau + phase));

          const poly = clipHalfPlane(
            [-half, -half, half, -half, half, half, -half, half],
            nx,
            ny,
            d
          );
          if (!poly) continue;

          path.moveTo(cx + poly[0], cy + poly[1]);
          for (let k = 1; k < poly.length / 2; k++) {
            path.lineTo(cx + poly[k * 2], cy + poly[k * 2 + 1]);
          }
          path.closePath();
        }
      }

      ctx.fillStyle = c.ink;
      ctx.fill(path); // one fill for the whole field
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Weave — looping op-art grid"
      className={className}
      style={{ width: "100%", aspectRatio: "1 / 1", display: "block" }}
    />
  );
}
