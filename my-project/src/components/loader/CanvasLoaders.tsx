"use client";

/* Two canvas particle-field loaders, ported verbatim from the Helios set:
 * "Swarm belt" (ellipseField) and "Nebula dust". The particle maths, counts,
 * speeds, radii and hues are the originals. What changed to fit the set:
 *   • the 180×180 design space is scaled to `size` × devicePixelRatio, so
 *     every hard-coded pixel value still means what it did;
 *   • the nebula's trail fade used an opaque dark fill, which would paint a
 *     square on a light ground — it now fades with `destination-out`, which
 *     is the same decay on a transparent canvas; likewise the core gradients
 *     end on their own colour at alpha 0 rather than transparent black, so
 *     they don't grey out on light grounds;
 *   • the rAF loop is cancelled on unmount and, under reduced motion, draws
 *     one frame and stops (the root then breathes via loader.css). */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { LoaderProps } from "./Loaders";

const DESIGN = 180;

type Draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => () => void;

function useCanvasLoop(setup: Draw, size: number) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform((size / DESIGN) * dpr, 0, 0, (size / DESIGN) * dpr, 0, 0);

    const frame = setup(ctx, DESIGN, DESIGN);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const loop = () => {
      frame();
      if (!still) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [setup, size]);
  return ref;
}

function CanvasRoot({
  variant,
  size = 48,
  className,
  label = "Loading",
  setup,
}: LoaderProps & { variant: string; setup: Draw }) {
  const ref = useCanvasLoop(setup, size);
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("ldr ldr--canvas", `ldr--${variant}`, className)}
      style={{ "--ldr-size": `${size}px` } as React.CSSProperties}
    >
      <canvas ref={ref} />
    </span>
  );
}

/* ── Swarm belt — original `ellipseField(c6, …)` ────────────────────────── */
const swarmSetup: Draw = (ctx, W, H) => {
  const opts = {
    count: 70, speed: 0.018, a: 70, b: 22, rMin: 0.5, rMax: 1.6,
    hue: 28, hueSpread: 30, core: "rgba(255,160,70,0.85)",
  };
  const cx = W / 2, cy = H / 2;
  const parts = Array.from({ length: opts.count }, () => ({
    t: Math.random() * Math.PI * 2,
    speed: opts.speed * (0.55 + Math.random() * 0.9),
    a: opts.a * (0.75 + Math.random() * 0.4),
    b: opts.b * (0.75 + Math.random() * 0.4),
    r: opts.rMin + Math.random() * (opts.rMax - opts.rMin),
    alpha: 0.25 + Math.random() * 0.75,
    hue: opts.hue + Math.random() * opts.hueSpread,
  }));
  return () => {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.4, opts.core);
    g.addColorStop(1, "rgba(255,160,70,0)"); // not rgba(0,0,0,0): canvas fades through black
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    for (const p of parts) {
      p.t += p.speed;
      const x = cx + Math.cos(p.t) * p.a;
      const y = cy + Math.sin(p.t) * p.b;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha})`;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, 0.6)`;
      ctx.shadowBlur = 8;
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };
};

export function SwarmLoader(p: LoaderProps) {
  return <CanvasRoot variant="swarm" setup={swarmSetup} {...p} />;
}

/* ── Nebula dust — original `nebula()` ──────────────────────────────────── */
const nebulaSetup: Draw = (ctx, W, H) => {
  const cx = W / 2, cy = H / 2;
  const parts = Array.from({ length: 80 }, () => ({
    ang: Math.random() * Math.PI * 2,
    rad: 8 + Math.random() * 70,
    spin: 0.004 + Math.random() * 0.01,
    inward: 0.04 + Math.random() * 0.08,
    r: 0.6 + Math.random() * 1.8,
    hue: 220 + Math.random() * 80,
  }));
  return () => {
    // same 0.18 decay as the original dark fill, but on a transparent canvas
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
    g.addColorStop(0, "#fff"); g.addColorStop(0.5, "#8ab4ff"); g.addColorStop(1, "rgba(138,180,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    for (const p of parts) {
      p.ang += p.spin;
      p.rad -= p.inward;
      if (p.rad < 6) p.rad = 8 + Math.random() * 70;
      const x = cx + Math.cos(p.ang) * p.rad * 1.15;
      const y = cy + Math.sin(p.ang) * p.rad * 0.55;
      ctx.fillStyle = `hsla(${p.hue},85%,75%,0.7)`;
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  };
};

export function NebulaDustLoader(p: LoaderProps) {
  return <CanvasRoot variant="nebula-dust" setup={nebulaSetup} {...p} />;
}
