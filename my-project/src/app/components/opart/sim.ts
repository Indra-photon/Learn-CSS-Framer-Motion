/**
 * Simulation kit for the physics loops.
 *
 * The hard constraint everywhere is the same: the piece must return to its
 * starting frame. Three tools here serve that:
 *   - closeDrift()  removes the tiny residual of a *nearly* closed orbit
 *   - sampleFrames() plays a precomputed period back cyclically
 *   - lazy()        keeps the heavy solves off the first paint
 */

export const TAU = Math.PI * 2;
export const INK = "#111111";
export const PAPER = "#FFFFFF";

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const frac = (t: number) => t - Math.floor(t);

/** Deterministic RNG — a stochastic piece still has to render identically. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lazy<T>(make: () => T) {
  let v: T | undefined;
  return () => (v === undefined ? (v = make()) : v);
}

export type Deriv = (t: number, y: Float64Array, out: Float64Array) => void;

/** Classic RK4 with pre-allocated scratch — these run in an animation frame. */
export function makeRK4(n: number, f: Deriv) {
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
 * A numerically-found periodic orbit closes to within some small epsilon, never
 * exactly. Spread that residual linearly over the whole period and the seam
 * disappears without visibly deforming the orbit. Returns the trimmed cycle.
 */
export function closeDrift(frames: Float64Array[]): Float64Array[] {
  const n = frames.length;
  const dim = frames[0].length;
  for (let j = 0; j < dim; j++) {
    const drift = frames[n - 1][j] - frames[0][j];
    for (let i = 0; i < n; i++) frames[i][j] -= (i / (n - 1)) * drift;
  }
  return frames.slice(0, n - 1);
}

/** Linear interpolation into a cyclic frame buffer. */
export function sampleFrames(
  frames: Float64Array[] | Float32Array[],
  tau: number,
  out: Float64Array
) {
  const n = frames.length;
  const x = frac(tau) * n;
  const i0 = Math.floor(x) % n;
  const i1 = (i0 + 1) % n;
  const f = x - Math.floor(x);
  const a = frames[i0];
  const b = frames[i1];
  for (let j = 0; j < out.length; j++) out[j] = a[j] * (1 - f) + b[j] * f;
}

/** Offscreen scalar-field raster, blitted up with smoothing off. */
export function makeField(w: number, h: number) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  const img = c.createImageData(w, h);
  const d = img.data;
  return {
    w,
    h,
    set(fn: (x: number, y: number) => number) {
      let p = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const v = clamp01(fn(x, y));
          d[p] = 17;
          d[p + 1] = 17;
          d[p + 2] = 17;
          d[p + 3] = (v * 255) | 0;
          p += 4;
        }
      }
      c.putImageData(img, 0, 0);
    },
    blit(ctx: CanvasRenderingContext2D, size: number, smooth = false) {
      ctx.imageSmoothingEnabled = smooth;
      ctx.drawImage(cv, 0, 0, size, size);
    },
  };
}

/** 5-point Laplacian on a periodic grid, in place into `out`. */
export function laplacian(
  u: Float64Array,
  out: Float64Array,
  nx: number,
  ny: number,
  inv2: number
) {
  for (let y = 0; y < ny; y++) {
    const yp = ((y + 1) % ny) * nx;
    const ym = ((y - 1 + ny) % ny) * nx;
    const y0 = y * nx;
    for (let x = 0; x < nx; x++) {
      const xp = (x + 1) % nx;
      const xm = (x - 1 + nx) % nx;
      out[y0 + x] =
        (u[y0 + xp] + u[y0 + xm] + u[yp + x] + u[ym + x] - 4 * u[y0 + x]) *
        inv2;
    }
  }
}
