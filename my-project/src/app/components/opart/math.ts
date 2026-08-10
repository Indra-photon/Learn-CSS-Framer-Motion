/** Shared loop math for the op-art canvases. */

export const TAU = Math.PI * 2;
export const PAPER = "#FFFFFF";
export const INK = "#111111";

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const frac = (t: number) => t - Math.floor(t);

/** 0 → 1 → 0. Ping-pong, so any easing hung off it returns to its start. */
export const tri = (t: number) => 1 - Math.abs(2 * frac(t) - 1);

/** Shortest distance to phase 0 on a wrapped [0,1) timeline. */
export const wrapDist = (t: number) => {
  const f = frac(t);
  return f < 0.5 ? f : 1 - f;
};

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** C2 at both ends — a cleaner hand-off than smoothstep for looping. */
export const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Overshoots both ways. Derivative is 0 at both ends, so it ping-pongs cleanly. */
export const easeInOutBack = (t: number) => {
  const c = 1.70158 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
};

export const easeInOutElastic = (t: number) => {
  const c = (2 * Math.PI) / 4.5;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c)) / 2 + 1;
};

export const easeOutExpo = (t: number) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

/**
 * Underdamped spring, NORMALISED. A spring only asymptotes toward 1, so the raw
 * curve never actually arrives — divide by its own value at t=1 and it lands
 * exactly, which is what keeps the loop from clunking.
 */
export function springNorm(t: number, omega = 15, zeta = 0.4) {
  const raw = (x: number) => {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * omega * x) *
        (Math.cos(wd * x) + ((zeta * omega) / wd) * Math.sin(wd * x))
    );
  };
  const end = raw(1);
  return raw(clamp01(t)) / end;
}

/** Sharp attack, long decay — a travelling impulse rather than an ease. */
export const impulse = (t: number, k = 12) => {
  const h = k * t;
  return h * Math.exp(1 - h);
};

/** Rounded rect that works without Path2D.roundRect. */
export function roundRect(
  p: Path2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  p.moveTo(x + rad, y);
  p.arcTo(x + w, y, x + w, y + h, rad);
  p.arcTo(x + w, y + h, x, y + h, rad);
  p.arcTo(x, y + h, x, y, rad);
  p.arcTo(x, y, x + w, y, rad);
  p.closePath();
}
