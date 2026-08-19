"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";

import OpCanvas from "@/app/components/opart/OpCanvas";
import { cn } from "@/lib/utils";
import GpuInfrastructure from "./gpu-infrastructure";

/* ==================================================================== *
 * ART
 *
 * The six loops this section uses, written out here rather than imported
 * from `src/app/components/opart`. Those files still exist and /opart still
 * renders all 26 — this is a self-contained copy of the six, so the section
 * owns its own visuals and can be tuned without touching the gallery.
 *
 * Every draw takes (ctx, size, tau) with tau running 0 → 1, and must land
 * back on its opening frame: these are loops, not animations with an end.
 * ==================================================================== */

const TAU = Math.PI * 2;
const INK = "#111111";

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const frac = (t: number) => t - Math.floor(t);

/** 0 → 1 → 0. Ping-pong, so anything hung off it returns to its start. */
const tri = (t: number) => 1 - Math.abs(2 * frac(t) - 1);

/** Shortest distance to phase 0 on a wrapped [0,1) timeline. */
const wrapDist = (t: number) => {
  const f = frac(t);
  return f < 0.5 ? f : 1 - f;
};

/** C2 at both ends — a cleaner hand-off than smoothstep when looping. */
const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Sharp attack, long decay — a travelling impulse rather than an ease. */
const impulse = (t: number, k = 12) => {
  const h = k * t;
  return h * Math.exp(1 - h);
};

/** Rounded rect that works without Path2D.roundRect. */
function roundRect(
  p: Path2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  p.moveTo(x + rad, y);
  p.arcTo(x + w, y, x + w, y + h, rad);
  p.arcTo(x + w, y + h, x, y + h, rad);
  p.arcTo(x, y + h, x, y, rad);
  p.arcTo(x, y, x + w, y, rad);
  p.closePath();
}

/** Keeps the heavy solve off the first paint — it runs on first draw. */
function lazy<T>(make: () => T) {
  let v: T | undefined;
  return () => (v === undefined ? (v = make()) : v);
}

type Deriv = (t: number, y: Float64Array, out: Float64Array) => void;

/** Classic RK4 with pre-allocated scratch — this runs inside a frame. */
function makeRK4(n: number, f: Deriv) {
  const k1 = new Float64Array(n);
  const k2 = new Float64Array(n);
  const k3 = new Float64Array(n);
  const k4 = new Float64Array(n);
  const yt = new Float64Array(n);
  return (y: Float64Array, t: number, dt: number) => {
    f(t, y, k1);
    for (let i = 0; i < n; i++) yt[i] = y[i] + (dt / 2) * k1[i];
    f(t + dt / 2, yt, k2);
    for (let i = 0; i < n; i++) yt[i] = y[i] + (dt / 2) * k2[i];
    f(t + dt / 2, yt, k3);
    for (let i = 0; i < n; i++) yt[i] = y[i] + dt * k3[i];
    f(t + dt, yt, k4);
    for (let i = 0; i < n; i++)
      y[i] += (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  };
}

/**
 * A numerically-found periodic orbit closes to within some epsilon, never
 * exactly. Spread that residual linearly over the period and the seam
 * disappears without visibly deforming the orbit.
 */
function closeDrift(frames: Float64Array[]): Float64Array[] {
  const n = frames.length;
  const dim = frames[0].length;
  for (let j = 0; j < dim; j++) {
    const drift = frames[n - 1][j] - frames[0][j];
    for (let i = 0; i < n; i++) frames[i][j] -= (i / (n - 1)) * drift;
  }
  return frames.slice(0, n - 1);
}

/** Linear interpolation into a cyclic frame buffer. */
function sampleFrames(frames: Float64Array[], tau: number, out: Float64Array) {
  const n = frames.length;
  const x = frac(tau) * n;
  const i0 = Math.floor(x) % n;
  const i1 = (i0 + 1) % n;
  const f = x - Math.floor(x);
  const a = frames[i0];
  const b = frames[i1];
  for (let j = 0; j < out.length; j++) out[j] = a[j] * (1 - f) + b[j] * f;
}

const lorenzDeriv: Deriv = (t, y, o) => {
  o[0] = 10 * (y[1] - y[0]);
  o[1] = y[0] * (28 - y[2]) - y[1];
  o[2] = y[0] * y[1] - (8 / 3) * y[2];
};

/**
 * The Lorenz trajectory never repeats — that is what the butterfly effect
 * means. But the attractor is built from a skeleton of orbits that DO close.
 * Found by close returns on the z = 27 Poincaré section: integrate, record
 * crossings, and look for one that lands back on a crossing two loops earlier.
 */
const lorenzUPO = lazy(() => {
  const step = makeRK4(3, lorenzDeriv);
  const y = Float64Array.from([1, 1, 20]);
  const dt = 0.002;
  for (let i = 0; i < 15000; i++) step(y, 0, dt); // land on the attractor

  const sect: { x: number; y: number; t: number; s: Float64Array }[] = [];
  let t = 0;
  for (let i = 0; i < 900000 && sect.length < 2200; i++) {
    const pz = y[2];
    step(y, t, dt);
    t += dt;
    if (pz < 27 && y[2] >= 27)
      sect.push({ x: y[0], y: y[1], t, s: Float64Array.from(y) });
  }

  // the LR orbit: a crossing that returns to itself after two wing loops
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i + 2 < sect.length; i++) {
    const d = Math.hypot(sect[i].x - sect[i + 2].x, sect[i].y - sect[i + 2].y);
    if (d < bd) {
      bd = d;
      best = i;
    }
  }

  const T = sect[best + 2].t - sect[best].t;
  const N = 900;
  const h = T / N;
  const s = Float64Array.from(sect[best].s);
  const raw: Float64Array[] = [];
  for (let i = 0; i <= N; i++) {
    raw.push(Float64Array.from(s));
    if (i < N) step(s, 0, h);
  }
  return { frames: closeDrift(raw), T, err: bd };
});

type Art = {
  id: string;
  name: string;
  /** loop length in seconds */
  period: number;
  /** cap the redraw rate; the per-pixel pieces look identical at 30 */
  fps?: number;
  draw: (ctx: CanvasRenderingContext2D, size: number, tau: number) => void;
};

/** FLOW — a wavy vector field advecting diagonally, drawn as tapered dashes. */
const flow: Art = {
  id: "flow",
  name: "Flow",
  period: 9,
  draw(ctx, size, tau) {
    const n = 30;
    const cell = size / n;
    const len = cell * 0.78;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const xn = i / (n - 1);
        const yn = j / (n - 1);
        const a =
          TAU *
          (0.45 * Math.sin(TAU * (1.1 * xn - tau)) +
            0.35 * Math.cos(TAU * (1.3 * yn + tau)) +
            0.3 * Math.sin(TAU * (0.9 * (xn + yn) - 2 * tau)));
        const s = 0.45 + 0.55 * impulse(frac(tau + (xn + yn) * 0.5), 3);
        const l = (len / 2) * Math.min(1.3, s);
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        path.moveTo(cx - l * Math.cos(a), cy - l * Math.sin(a));
        path.lineTo(cx + l * Math.cos(a), cy + l * Math.sin(a));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.2;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/** PULSE — dots swollen by a gaussian front crossing corner to corner. */
const pulse: Art = {
  id: "pulse",
  name: "Pulse",
  period: 5,
  draw(ctx, size, tau) {
    const n = 16;
    const cell = size / n;
    const rMax = cell * 0.46;
    const sigma = 0.11;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const u = (i + j) / (2 * (n - 1));
        const a = wrapDist(tau - u);
        const b = wrapDist(tau - u + 0.5);
        const g =
          Math.exp(-(a * a) / (2 * sigma * sigma)) +
          0.55 * Math.exp(-(b * b) / (2 * sigma * sigma));
        const r = rMax * (0.14 + 0.86 * Math.min(1, g));
        path.moveTo((i + 0.5) * cell + r, (j + 0.5) * cell);
        path.arc((i + 0.5) * cell, (j + 0.5) * cell, r, 0, TAU);
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/** COLUMNS — bars anchored to the floor, a tall band sweeping the diagonal. */
const columns: Art = {
  id: "columns",
  name: "Columns",
  period: 6,
  draw(ctx, size, tau) {
    const n = 13;
    const cell = size / n;
    const bw = cell * 0.46;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const u = (i + j) / (2 * (n - 1));
        const h = 0.1 + 0.9 * smootherstep(tri(tau - u));
        const bh = cell * 0.9 * h;
        const x = i * cell + (cell - bw) / 2;
        const y = j * cell + cell * 0.95 - bh;
        roundRect(path, x, y, bw, bh, bw * 0.5);
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/** LORENZ ORBIT — the one butterfly that closes, with particles riding it. */
const lorenzOrbit: Art = {
  id: "lorenz-upo",
  name: "Lorenz orbit",
  period: 7,
  draw(ctx, size, tau) {
    const { frames } = lorenzUPO();
    const s = size / 60;
    const px = (v: number) => size / 2 + v * s;
    const pz = (v: number) => size * 0.95 - v * s * 0.86;

    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(0.6, size * 0.0035);
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      if (i === 0) ctx.moveTo(px(f[0]), pz(f[2]));
      else ctx.lineTo(px(f[0]), pz(f[2]));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;

    // a comb of particles riding the same closed orbit, one loop apart
    const M = 26;
    const p = new Float64Array(3);
    const path = new Path2D();
    for (let k = 0; k < M; k++) {
      sampleFrames(frames, tau + k / M, p);
      const sp = Math.hypot(10 * (p[1] - p[0]), p[0] * p[1] - (8 / 3) * p[2]);
      const r = size * 0.006 + size * 0.016 * clamp01(sp / 260);
      path.moveTo(px(p[0]) + r, pz(p[2]));
      path.arc(px(p[0]), pz(p[2]), r, 0, TAU);
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/**
 * DIPOLE FIELD — B ∝ [3(m·r̂)r̂ − m] / r³ for two counter-rotating dipoles,
 * every bar the local field direction. One turn against two: equal and
 * opposite rates would just flip the field, which undirected bars can't show.
 */
const dipole: Art = {
  id: "dipole",
  name: "Dipole field",
  period: 10,
  draw(ctx, size, tau) {
    const n = 24;
    const cell = size / n;
    const a = TAU * tau;
    const poles = [
      { x: size * 0.32, y: size * 0.38, mx: Math.cos(a), my: Math.sin(a) },
      {
        x: size * 0.68,
        y: size * 0.64,
        mx: Math.cos(-2 * a),
        my: Math.sin(-2 * a),
      },
    ];
    const path = new Path2D();
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const px = (i + 0.5) * cell;
        const py = (j + 0.5) * cell;
        let bx = 0;
        let by = 0;
        for (const p of poles) {
          const dx = (px - p.x) / size;
          const dy = (py - p.y) / size;
          const r = Math.max(0.04, Math.hypot(dx, dy));
          const rx = dx / r;
          const ry = dy / r;
          const mr = p.mx * rx + p.my * ry;
          const k = 1 / (r * r * r);
          bx += k * (3 * mr * rx - p.mx);
          by += k * (3 * mr * ry - p.my);
        }
        const ang = Math.atan2(by, bx);
        const mag = Math.hypot(bx, by);
        const L = cell * 0.46 * clamp01(0.25 + Math.log1p(mag) / 6);
        path.moveTo(px - L * Math.cos(ang), py - L * Math.sin(ang));
        path.lineTo(px + L * Math.cos(ang), py + L * Math.sin(ang));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.19;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/**
 * LORENZ SLICE — the chaos problem dodged entirely: time never advances. A
 * plane cuts the Lorenz flow and rotates once about z; each tile reads the
 * flow direction where the plane passes through it. The loop closes because
 * the plane came back, not because the system did.
 */
const lorenzSlice: Art = {
  id: "lorenz-slice",
  name: "Lorenz slice",
  period: 13,
  draw(ctx, size, tau) {
    const n = 26;
    const cell = size / n;
    const phi = TAU * tau;
    const cf = Math.cos(phi);
    const sf = Math.sin(phi);
    const S = 46;
    const d = new Float64Array(3);
    const s = new Float64Array(3);
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const p = ((i + 0.5) / n - 0.5) * S;
        // the plane also bobs: Lorenz is symmetric under (x,y,z)→(−x,−y,z), so
        // a pure half turn would reproduce the frame on undirected bars
        const q = (0.5 - (j + 0.5) / n) * S + 25 + 7 * (1 - Math.cos(phi));
        s[0] = p * cf;
        s[1] = p * sf;
        s[2] = q;
        lorenzDeriv(0, s, d);
        // project the 3-vector back onto the plane's own basis
        const vp = d[0] * cf + d[1] * sf;
        const vq = d[2];
        const ang = Math.atan2(-vq, vp);
        const mag = Math.hypot(vp, vq);
        const L = cell * 0.46 * clamp01(0.2 + Math.log1p(mag) / 6);
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        path.moveTo(cx - L * Math.cos(ang), cy - L * Math.sin(ang));
        path.lineTo(cx + L * Math.cos(ang), cy + L * Math.sin(ang));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.18;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

type Capability = {
  word: string;
  art: Art;
  copy: string;
};

const CAPABILITIES: Capability[] = [
  {
    word: "Throughput",
    art: flow,
    copy: "Continuous batching, paged attention, and speculative decoding land more tokens per GPU-second. Same weights, same hardware — up to 3.4× the requests served before you add a single node.",
  },
  {
    word: "Latency",
    art: pulse,
    copy: "Weights stay resident and KV cache stays warm, so there is no cold start to pay for. Sub-200ms time-to-first-token at p99, measured under load rather than on an idle cluster.",
  },
  {
    word: "Scale",
    art: columns,
    copy: "Autoscaling that reads queue depth instead of CPU, from one replica to four hundred across regions. Traffic spikes are absorbed in seconds, and idle capacity is released just as fast.",
  },
  {
    word: "Reliability",
    art: lorenzOrbit,
    copy: "99.99% uptime, multi-region failover, and automatic node drain on hardware faults. In-flight requests are rescheduled, not dropped — an unhealthy GPU never becomes your incident.",
  },
  {
    word: "Observability",
    art: dipole,
    copy: "Every request traced end to end: token counts, cache hit rate, queue time, and per-tenant spend. You see exactly which prompt shape is costing you, down to the individual call.",
  },
  {
    word: "Sovereignty",
    art: lorenzSlice,
    copy: "Run in our cloud, your VPC, or fully air-gapped on your own metal — one control plane, one API. Your weights and your data never leave the perimeter you define.",
  },
];

/**
 * Film grain, generated rather than downloaded: one feTurbulence tile blown up
 * as a background-image. `fractalNoise` (not `turbulence`) keeps it even —
 * turbulence takes the absolute value and reads as clumps rather than film.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")";

/**
 * Two layers, one light source — top-left. The copy lives on the card now, so
 * the surface has to hold body text across its whole width: it runs lit olive
 * to deep olive rather than pale-to-dark, and every mark on it is light ink.
 * A pale end would have forced two ink colours on one surface.
 */
const CARD_GRADIENT = [
  // the highlight, placed at the light source and nowhere else
  "radial-gradient(72% 92% at 6% 6%, rgba(255,255,255,0.28), rgba(255,255,255,0) 62%)",
  "linear-gradient(148deg, #5d6a4f 0%, #414b39 40%, #2b3425 74%, #1f271b 100%)",
].join(",");

/* Enter fast, settle slow; exits get their own curve. An exit on an ease-out
   curve lingers — it should start fast and be gone. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;
const ROLL = { type: "spring", visualDuration: 0.35, bounce: 0 } as const;

/* The swap is one caused event, so it arrives in sequence rather than all at
   once: art, then the label, then the copy. */
const STAGGER = { art: 0, label: 0.06, copy: 0.14 };

/* Long enough to read the copy, short enough that a skimmer sees two or three
   capabilities before scrolling past. */
const AUTOPLAY_MS = 4000;

/** Sub-pixel dot that marks the row under the pointer or the row in play. */
function Marker({ active }: { active: boolean }) {
  return (
    <span className="relative mr-4 inline-flex h-1.5 w-1.5 shrink-0 items-center justify-center sm:mr-6">
      {active && (
        <motion.span
          layoutId="capability-marker"
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 42,
            mass: 0.6,
          }}
          className="absolute inset-0 rounded-full bg-neutral-900"
        />
      )}
    </span>
  );
}

export default function Capabilities() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  /* Sweeping the cursor down six rows used to fire six 500ms crossfades in
     about 400ms — none of them could finish. Preview only once the pointer
     rests; clicking still commits immediately. */
  const restTimer = useRef<number | null>(null);
  const clearRest = () => {
    if (restTimer.current !== null) window.clearTimeout(restTimer.current);
    restTimer.current = null;
  };
  const previewOnRest = (i: number) => {
    clearRest();
    restTimer.current = window.setTimeout(() => setHovered(i), 100);
  };
  useEffect(() => clearRest, []);

  /* Five of six capabilities used to be invisible until someone hovered a word
     that didn't look hoverable — and on touch, never. The card walks itself
     until the first interaction, then hands over control for good: the reader
     gets the content without paying for it, and the browsing is a bonus. */
  const [engaged, setEngaged] = useState(false);
  const engage = () => setEngaged(true);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const autoplaying = !engaged && inView && !reducedMotion;

  useEffect(() => {
    if (!autoplaying) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % CAPABILITIES.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(id);
  }, [autoplaying]);

  // hover previews, click commits — the marker follows whichever is louder
  const shown = hovered ?? index;
  const current = CAPABILITIES[shown];

  return (
    /* One line covers every transition, spring and crossfade in the section:
       under prefers-reduced-motion they all collapse to instant. */
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        className="relative overflow-x-clip bg-[#f1f1ef] py-16 text-neutral-900 lg:py-24"
      >
        {/* `max-w-7xl`, not `w-7xl` — as a fixed width it overflowed every
          viewport under 1280px, and `overflow-x-clip` silently ate the right
          edge instead of scrolling it. Frame is a step heavier than the
          internal dividers so the structure has a hierarchy. */}
        <div className="relative mx-auto max-w-7xl border-x border-neutral-900/[0.14]">
          {/* Full-bleed rules, escaping the container with w-screen so they run
            edge to edge while still landing exactly where the verticals start
            and stop. `overflow-x-clip` on the section eats the overhang. */}
          <Rule className="absolute top-0 left-1/2 w-screen -translate-x-1/2" />
          <Rule className="absolute bottom-0 left-1/2 w-screen -translate-x-1/2" />

          {/* ---------------------------------------------------------- head */}
          {/* Text column takes 1.3 of 2 and the graphic gives way, because the
            heading has to hold at exactly two lines on desktop — at 3.15rem
            that needs ~740px of measure, which a 1fr/0.85fr split can't give. */}
          <header className="grid items-center gap-8 border-b border-neutral-900/[0.08] px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-10 lg:py-10">
            <div>
              <h2 className="text-[clamp(2rem,4.6vw,3.15rem)] leading-[1.04] font-normal tracking-[-0.035em] text-balance">
                Inference infrastructure that holds up in production.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-tight text-neutral-800">
                Serve open and custom models on dedicated GPUs without
                assembling the stack yourself — scheduling, autoscaling,
                caching, and observability arrive as one system, behind a single
                API.
              </p>

              {/* Both buttons carry the same ink; only the ground changes, so
                the pair reads as one control rather than two competing ones.
                Depth is shadow, not border: a 1px tinted ring, two ambient
                layers below, and an inset highlight on the top edge with an
                inset shade on the bottom — that pair is what makes the
                surface read as lit from above rather than as a flat fill. */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {/* Primary — Paper spec transcribed 1:1, one cn() group per
                  inspector panel and in the panel's own order. */}
                <motion.a
                  href="#"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  className={cn(
                    // Layout
                    "inline-flex items-center justify-center",
                    // Padding
                    "px-6 py-3.5",
                    // Typography
                    "text-[15px] font-medium text-white",
                    // Radius — 6. Two-step ramp mapped to hierarchy: controls
                    // (this, from the Paper spec) are 6, surfaces are 12.
                    "rounded-[6px]",
                    // Fill — 7E8675 100% → 3D4535 87% → 2F3927 100%
                    "border-t border-r border-b border-l border-t-[#7E8675] border-r-[rgba(8,20,0,0.07)] border-b-[rgba(6,13,2,0.69)] border-l-[rgba(8,20,0,0.07)] bg-[linear-gradient(180deg,#7E8675_0%,rgba(61,69,53,0.87)_50%,#2F3927_100%)]",
                    // Shadow — 0 · 0 · blur 0 · spread 1 · 363835 43%
                    // Inner shadow — 1 · 1 · 5 · FFFFFF 25%
                    // Inner shadow — −1 · −1 · 5 · FFFFFF 22%
                    "shadow-[inset_1px_1px_5px_rgba(255,255,255,0.25),inset_-1px_-1px_5px_rgba(255,255,255,0.22)]",
                    // Hover — the fill is a gradient, so it darkens by filter
                    "transition-[filter] duration-150 ease-out hover:brightness-[0.94]",
                    // Focus
                    "outline-none focus-visible:ring-2 focus-visible:ring-[#5f6b52]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f1ef]",
                  )}
                >
                  Start building
                </motion.a>

                {/* Secondary — same groups in the same order, so the two can be
                  read side by side and only Fill, Ink and Shadow differ. */}
                <motion.a
                  href="#"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  className={cn(
                    // Layout
                    "inline-flex items-center justify-center",
                    // Padding
                    "px-6 py-3.5",
                    // Typography
                    "text-[15px] font-medium text-[#59654F]",
                    // Radius — 6
                    "rounded-[6px]",
                    // Fill — FFFFFF 100% → 0A0E05 13%
                    "bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(10,14,5,0.13)_100%)]",
                    // Border — 1 · All · 837F7E 9%
                    "",
                    // Shadow — none
                    // Inner shadow — 1 · 1 · 28 · FFFEFE 100%
                    // Inner shadow — −1 · −1 · 2 · FFFFFF 100%
                    "shadow-[inset_0_0_0_1px_rgba(131,127,126,0.09),1px_1px_0px_0px_rgba(4,0,0,0.12),-1px_1px_0px_0px_rgba(4,0,0,0.12)]",
                    // Hover
                    "transition-[filter] duration-150 ease-out hover:brightness-[0.985]",
                    // Focus
                    "outline-none focus-visible:ring-2 focus-visible:ring-[#5f6b52]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f1ef]",
                  )}
                >
                  Talk to an engineer
                </motion.a>
              </div>
            </div>
            <GpuInfrastructure className="mx-auto max-w-[420px] lg:-my-8" />
          </header>

          {/* the column rule only exists once the columns do */}
          <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-neutral-900/[0.08]">
            {/* -------------------------------------------------------- list */}
            <ul
              className="flex flex-col gap-1 px-6 py-12 sm:px-10 lg:gap-2 lg:py-16"
              onMouseLeave={() => {
                clearRest();
                setHovered(null);
              }}
            >
              {CAPABILITIES.map((c, i) => (
                <li key={c.word}>
                  <button
                    type="button"
                    onMouseEnter={() => {
                      engage();
                      previewOnRest(i);
                    }}
                    onFocus={() => {
                      engage();
                      setHovered(i);
                    }}
                    onClick={() => {
                      engage();
                      clearRest();
                      setIndex(i);
                    }}
                    aria-current={i === index}
                    /* A resting ground on every row: the list used to be a
                     typography specimen with no signal that it was a control. */
                    className="group -mx-3 flex w-full cursor-pointer items-center rounded-[12px] px-3 py-1 text-left transition-colors duration-150 ease-out outline-none hover:bg-neutral-900/[0.035] focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                  >
                    <Marker active={i === shown} />
                    <motion.span
                      animate={{
                        /* #9b9b98 on #f1f1ef was 2.4:1 — under the 3:1 large-text
                         floor, on six interactive controls. #6f6f6b is 4.2:1,
                         and weight still carries the active state. */
                        color: i === shown ? "#111111" : "#6f6f6b",
                        x: i === shown ? 2 : 0,
                      }}
                      transition={{ duration: 0.32, ease: EASE_OUT }}
                      className={`text-[clamp(1.5rem,3.2vw,2.2rem)] leading-[1.32] ${i === shown ? "font-normal" : "font-light"} tracking-[-0.02em]`}
                    >
                      {c.word}.
                    </motion.span>
                  </button>
                </li>
              ))}
            </ul>

            {/* -------------------------------------------------------- card */}
            <div className="border-t border-neutral-900/[0.08] px-6 py-12 sm:px-10 lg:border-t-0 lg:py-16">
              <div
                /* No fixed 16/10 any more — the copy lives on the card, so the
                 surface has to be able to grow. Edge is two-tone rather than a
                 flat white ring: light on top, shade on the bottom, same light
                 source as the gradient. */
                className="relative flex aspect-[16/11] w-full flex-col justify-end overflow-hidden rounded-[12px] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(12,18,10,0.3),inset_0_0_0_1px_rgba(12,18,10,0.12)]"
                style={{ backgroundImage: CARD_GRADIENT }}
              >
                {/* A 50%-wide square pinned to the top-right corner, bled 6-7%
                  past both edges so it gains size without eating into the copy
                  below: bleeding up-and-right buys area diagonally rather than
                  vertically. The radial mask holds solid to 58% and dissolves
                  by 92%, so a bigger patch still has no edge to give away. */}
                <AnimatePresence initial={false}>
                  <motion.div
                    key={current.art.id}
                    /* opacity finishes well before scale — running both over one
                     duration is what made the crossfade drift */
                    initial={{ opacity: 0, scale: 1.03 }}
                    /* Held at 0.88: under `screen` that is not a fade, it lets the
                     olive tint the marks so they read as light on this material
                     rather than as pure white pasted on top. */
                    animate={{ opacity: 0.88, scale: 1 }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.22, ease: EASE_IN },
                    }}
                    transition={{
                      opacity: {
                        duration: 0.32,
                        ease: EASE_OUT,
                        delay: STAGGER.art,
                      },
                      scale: {
                        duration: 0.56,
                        ease: EASE_OUT,
                        delay: STAGGER.art,
                      },
                    }}
                    className="pointer-events-none absolute -top-[7%] -right-[6%] aspect-square w-[50%] [mask-image:radial-gradient(125%_125%_at_100%_0%,#000_58%,transparent_92%)] mix-blend-screen"
                  >
                    {/* inverted, the canvas is white-on-black, and `screen` drops
                      that black entirely */}
                    <div className="h-full w-full [filter:invert(1)]">
                      <OpCanvas
                        draw={current.art.draw}
                        period={current.art.period}
                        fps={current.art.fps}
                        label={current.art.name}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* One grain pass, not two: a 180px tile repeated 3× across the
                  card and read as pattern. */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
                  style={{
                    backgroundImage: GRAIN,
                    backgroundSize: "320px 320px",
                  }}
                />

                {/* Number and word share a baseline — the index alone referred to
                  a list nobody counts. Light ink throughout: the surface is one
                  tonal family now, so it needs exactly one ink. */}
                <div className="relative">
                  <div className="flex items-baseline gap-3">
                    <div className="overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={shown}
                          initial={{ y: "100%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{
                            y: "-100%",
                            opacity: 0,
                            transition: { duration: 0.2, ease: EASE_IN },
                          }}
                          transition={{
                            y: { ...ROLL, delay: STAGGER.label },
                            opacity: { duration: 0.22, delay: STAGGER.label },
                          }}
                          className="block text-[28px] leading-none font-normal tracking-tight text-[#eef1e7] tabular-nums"
                        >
                          {String(shown + 1).padStart(2, "0")}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={shown}
                          initial={{ y: "110%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{
                            y: "-110%",
                            opacity: 0,
                            transition: { duration: 0.2, ease: EASE_IN },
                          }}
                          transition={{
                            y: { ...ROLL, delay: STAGGER.label },
                            opacity: { duration: 0.2, delay: STAGGER.label },
                          }}
                          className="block font-mono text-[10px] tracking-[0.18em] text-[#eef1e7]/65 uppercase"
                        >
                          {current.word}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 13px on the card vs 15px in the header: the payoff should not
                    be typeset identically to the static subhead above it. */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={shown}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        transition: { duration: 0.2, ease: EASE_IN },
                      }}
                      transition={{
                        duration: 0.3,
                        ease: EASE_OUT,
                        delay: STAGGER.copy,
                      }}
                      className="mt-3 max-w-[54ch] text-[13px] leading-[1.55] text-[#eef1e7]/75"
                    >
                      {current.copy}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

/** Hairline rule. Kept as a component so every line in the section is one weight. */
function Rule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none block h-px bg-neutral-900/[0.14]",
        className,
      )}
    />
  );
}
