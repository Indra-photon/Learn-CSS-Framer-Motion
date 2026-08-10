import {
  TAU,
  PAPER,
  INK,
  clamp01,
  frac,
  tri,
  wrapDist,
  smootherstep,
  easeInOutBack,
  easeInOutElastic,
  impulse,
  springNorm,
  roundRect,
} from "./math";

export type Variation = {
  id: string;
  name: string;
  /** shape vocabulary → motion law → easing */
  note: string;
  period: number;
  /** cap the redraw rate; the per-pixel pieces look identical at 30 */
  fps?: number;
  draw: (ctx: CanvasRenderingContext2D, size: number, tau: number) => void;
};

/* ------------------------------------------------------------------ 01 */
/** RIDGE — contour lines displaced heightwise by a diagonal two-tone wave. */
const ridge: Variation = {
  id: "ridge",
  name: "Ridge",
  note: "open contour lines · summed sines, no easing at all · occluded front-to-back",
  period: 10,
  draw(ctx, size, tau) {
    const rows = 24;
    const pad = size * 0.1;
    const w = size - pad * 2;
    const step = (size - pad * 2) / (rows - 1);
    const amp = step * 2.1;
    const N = 150;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1, size * 0.0045);
    ctx.strokeStyle = INK;

    for (let r = 0; r < rows; r++) {
      const rn = r / (rows - 1);
      const y0 = pad + r * step;
      const pts: number[] = [];
      for (let k = 0; k <= N; k++) {
        const xn = k / N;
        const env = Math.exp(-Math.pow((xn - 0.5) * 2.5, 2));
        // only the tau coefficients must be whole numbers; space is free
        const h =
          Math.sin(TAU * (1.6 * xn + 0.9 * rn - tau)) * 0.62 +
          Math.sin(TAU * (2.7 * xn - 1.4 * rn + 2 * tau)) * 0.38;
        pts.push(pad + xn * w, y0 - amp * env * h);
      }

      // fill down to the bottom edge so nearer ridges occlude farther ones
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let k = 1; k <= N; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1]);
      ctx.lineTo(pad + w, size);
      ctx.lineTo(pad, size);
      ctx.closePath();
      ctx.fillStyle = PAPER;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let k = 1; k <= N; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1]);
      ctx.stroke();
    }
  },
};

/* ------------------------------------------------------------------ 02 */
/** COLUMNS — bars anchored to the floor, a tall band sweeping the diagonal. */
const columns: Variation = {
  id: "columns",
  name: "Columns",
  note: "bottom-anchored bars · travelling band on the diagonal · smootherstep ping-pong",
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

/* ------------------------------------------------------------------ 03 */
/** PULSE — dots swollen by a gaussian front crossing corner to corner. */
const pulse: Variation = {
  id: "pulse",
  name: "Pulse",
  note: "circles · gaussian impulse, two fronts half a loop apart · no easing curve",
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

/* ------------------------------------------------------------------ 04 */
/** CHEVRON — one zigzag per cell, apex inverting on a travelling wave. */
const chevron: Variation = {
  id: "chevron",
  name: "Chevron",
  note: "open zigzags · apex sign flipped by a diagonal sine · single stroked path",
  period: 7,
  draw(ctx, size, tau) {
    const n = 9;
    const cell = size / n;
    const h = cell * 0.34;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        const u = (i * 0.6 + j * 1.4) / (2 * (n - 1));
        const a = h * Math.sin(TAU * (tau - u));
        path.moveTo(cx - h, cy - a);
        path.lineTo(cx, cy + a);
        path.lineTo(cx + h, cy - a);
      }
    }
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.16;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/* ------------------------------------------------------------------ 05 */
/** BLADES — triangles taking one whole turn on a normalised spring. */
const blades: Variation = {
  id: "blades",
  name: "Blades",
  note: "triangles · one whole turn, staggered diagonally · spring normalised to land on 1",
  period: 4.5,
  draw(ctx, size, tau) {
    const n = 8;
    const cell = size / n;
    const R = cell * 0.44;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const u = (i + j) / (2 * (n - 1));
        const delay = u * 0.55;
        const p = springNorm(clamp01((tau - delay) / (1 - delay)));
        const rot = TAU * p; // whole turn → the loop closes on itself
        const s = R * (0.72 + 0.28 * Math.cos(TAU * (tau - u)));
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        for (let k = 0; k < 3; k++) {
          const a = rot + (k * TAU) / 3;
          const x = cx + s * Math.cos(a);
          const y = cy + s * Math.sin(a);
          if (k === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        path.closePath();
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ------------------------------------------------------------------ 06 */
/** MORPH — superellipse exponent swinging star → circle → square. */
const morph: Variation = {
  id: "morph",
  name: "Morph",
  note: "superellipse · exponent 0.7→6 · easeInOutBack, overshooting past both shapes",
  period: 6,
  draw(ctx, size, tau) {
    const n = 7;
    const cell = size / n;
    const R = cell * 0.42;
    const N = 56;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const u = (i + j) / (2 * (n - 1));
        const p = easeInOutBack(tri(tau - u * 0.9));
        const m = 0.7 + p * 5.3;
        const e = 2 / m;
        const rot = TAU * 0.25 * p;
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);
        for (let k = 0; k <= N; k++) {
          const t = (k / N) * TAU;
          const ct = Math.cos(t);
          const st = Math.sin(t);
          const px = R * Math.sign(ct) * Math.pow(Math.abs(ct), e);
          const py = R * Math.sign(st) * Math.pow(Math.abs(st), e);
          const x = cx + px * cr - py * sr;
          const y = cy + px * sr + py * cr;
          if (k === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        path.closePath();
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ------------------------------------------------------------------ 07 */
/** MOIRE — two ring stacks whose centres orbit once per loop. */
const moire: Variation = {
  id: "moire",
  name: "Moiré",
  note: "concentric rings · two centres, one orbit per loop · interference does the work",
  period: 11,
  draw(ctx, size, tau) {
    const rings = 42;
    const gap = size * 0.026;
    const orbit = size * 0.075;
    const cx = size / 2;
    const cy = size / 2;
    const ax = cx + orbit * Math.cos(TAU * tau);
    const ay = cy + orbit * Math.sin(TAU * tau);
    const bx = cx - orbit * Math.cos(TAU * tau);
    const by = cy - orbit * Math.sin(TAU * tau);

    const path = new Path2D();
    for (let k = 1; k <= rings; k++) {
      const r = k * gap;
      path.moveTo(ax + r, ay);
      path.arc(ax, ay, r, 0, TAU);
      path.moveTo(bx + r, by);
      path.arc(bx, by, r, 0, TAU);
    }
    ctx.save();
    const clip = new Path2D();
    clip.rect(0, 0, size, size);
    ctx.clip(clip);
    ctx.lineWidth = Math.max(1, size * 0.0055);
    ctx.strokeStyle = INK;
    ctx.stroke(path);
    ctx.restore();
  },
};

/* ------------------------------------------------------------------ 08 */
/** LATTICE — a real over/under basket weave, strips sliding along their axis. */
const lattice: Variation = {
  id: "lattice",
  name: "Lattice",
  note: "ribbons with true over/under parity · axial slide, one cycle · sine",
  period: 8,
  draw(ctx, size, tau) {
    const n = 7;
    const cell = size / n;
    const t = cell * 0.62; // ribbon thickness
    const slide = cell * 0.3;
    const out = Math.max(1.5, size * 0.006);

    const strip = (x: number, y: number, w: number, h: number) => {
      const p = new Path2D();
      roundRect(p, x, y, w, h, Math.min(w, h) * 0.28);
      ctx.fillStyle = INK;
      ctx.fill(p);
      ctx.lineWidth = out * 2;
      ctx.strokeStyle = PAPER;
      ctx.stroke(p);
    };

    const hOff = (k: number) => slide * Math.sin(TAU * (tau + k / n));
    const vOff = (k: number) => slide * Math.sin(TAU * (tau - k / n) + Math.PI / 2);

    // 1 — horizontals underneath
    for (let j = 0; j < n; j++) {
      strip(-cell + hOff(j), j * cell + (cell - t) / 2, size + cell * 2, t);
    }
    // 2 — verticals over them
    for (let i = 0; i < n; i++) {
      strip(i * cell + (cell - t) / 2, -cell + vOff(i), t, size + cell * 2);
    }
    // 3 — horizontals again, but only inside the even cells, so the weave alternates
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        if ((i + j) % 2 !== 0) continue;
        ctx.save();
        const c = new Path2D();
        c.rect(i * cell, j * cell, cell, cell);
        ctx.clip(c);
        strip(-cell + hOff(j), j * cell + (cell - t) / 2, size + cell * 2, t);
        ctx.restore();
      }
    }
  },
};

/* ------------------------------------------------------------------ 09 */
/** SHUTTERS — slats flipping edge-on, the fold running down the diagonal. */
const shutters: Variation = {
  id: "shutters",
  name: "Shutters",
  note: "slats seen edge-on · |cos| of a continuous turn · elastic on the tilt",
  period: 7,
  draw(ctx, size, tau) {
    const n = 11;
    const cell = size / n;
    const w = cell * 0.86;
    const hMax = cell * 0.72;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const u = (i + j) / (2 * (n - 1));
        const p = easeInOutElastic(tri(tau - u * 0.8));
        const theta = TAU * (tau - u * 0.8);
        const h = hMax * Math.abs(Math.cos(theta)) * (0.35 + 0.65 * p);
        if (h < 0.4) continue;
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell + Math.sin(theta) * cell * 0.1;
        roundRect(path, cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * 0.3);
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ------------------------------------------------------------------ 10 */
/** FLOW — a wavy vector field advecting diagonally, drawn as tapered dashes. */
const flow: Variation = {
  id: "flow",
  name: "Flow",
  note: "line segments · angle from three summed sines advecting on the diagonal",
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

export const VARIATIONS: Variation[] = [
  ridge,
  columns,
  pulse,
  chevron,
  blades,
  morph,
  moire,
  lattice,
  shutters,
  flow,
];
