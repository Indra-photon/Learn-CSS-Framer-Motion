/* Shared curve-type engine — prototype surface, not production.
 *
 * One idea, three shapes: a line of text is distributed along a curve BY
 * ARC LENGTH, so the word bends without ever stretching along its own
 * baseline. Every curve here is written so that its flat state is a real
 * member of the family — at value 0 the maths collapses to the browser's
 * own centred layout, which is what stops any of this looking like
 * WordArt when it comes to rest. */

export type Offset = {
  dx: number;
  dy: number;
  rot: number;
  /** Optional per-glyph scale, for placers that do more than displace. */
  sx?: number;
  sy?: number;
  /** Optional per-glyph opacity, for placers that dissolve rather than move. */
  o?: number;
};

/** Places one glyph, given its normalised centre u ∈ [−1, +1]. */
export type Placer = (u: number) => Offset;

/** Builds a placer for the current animated value and line half-width. */
export type CurveFactory = (value: number, half: number) => Placer;

export type Metrics = {
  /** Half the natural width of the line, in px. */
  half: number;
  /** Per-glyph flat centre, normalised to −1…+1 across the line. */
  u: number[];
};

const RAD = 180 / Math.PI;

/* ── Arc-length table over an arbitrary y(x) ──────────────────────────
 *
 * The Negroni block could exploit symmetry; a data series can't, so this
 * tabulates the full domain and anchors the text at the curve's midpoint
 * rather than mirroring around it. Domain runs wider than the line so a
 * curve longer than its chord never clamps at the table's edge. */

export type ArcTable = {
  yAt: (x: number) => number;
  slopeAt: (x: number) => number;
  /** x at a given cumulative arc length, measured from the left edge. */
  xAtLength: (length: number) => number;
  /** Arc length at x = 0, i.e. the middle of the line. */
  midLength: number;
};

export function buildArc(
  f: (x: number) => number,
  half: number,
  samples = 192,
): ArcTable {
  /* 30% headroom: a bent curve is longer than the straight line it spans,
   * so the outermost glyph reaches past ±half. */
  const reach = half * 1.3;
  const step = (2 * reach) / samples;

  const ys = new Float64Array(samples + 1);
  const cum = new Float64Array(samples + 1);

  for (let i = 0; i <= samples; i++) ys[i] = f(-reach + i * step);

  for (let i = 1; i <= samples; i++) {
    const dy = ys[i] - ys[i - 1];
    cum[i] = cum[i - 1] + Math.hypot(step, dy);
  }

  const indexOf = (x: number) =>
    Math.min(samples, Math.max(0, (x + reach) / step));

  const yAt = (x: number) => {
    const i = indexOf(x);
    const lo = Math.min(samples - 1, Math.floor(i));
    return ys[lo] + (ys[lo + 1] - ys[lo]) * (i - lo);
  };

  /* Central difference on the sample grid. */
  const slopeAt = (x: number) => {
    const i = Math.round(indexOf(x));
    const lo = Math.max(0, i - 1);
    const hi = Math.min(samples, i + 1);
    return (ys[hi] - ys[lo]) / ((hi - lo) * step);
  };

  const xAtLength = (length: number) => {
    if (length <= 0) return -reach;
    if (length >= cum[samples]) return reach;

    let lo = 0;
    let hi = samples;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] > length) hi = mid;
      else lo = mid;
    }
    const span = cum[hi] - cum[lo] || 1;
    return -reach + (lo + (length - cum[lo]) / span) * step;
  };

  /* Where x = 0 falls along the curve — the anchor the text hangs from. */
  const midIndex = samples / 2;
  const midLength =
    cum[Math.floor(midIndex)] +
    (cum[Math.ceil(midIndex)] - cum[Math.floor(midIndex)]) *
      (midIndex - Math.floor(midIndex));

  return { yAt, slopeAt, xAtLength, midLength };
}

/** Turns any y(x) into a placer: glyphs ride the curve, tangent to it. */
export function arcPlacer(
  f: (x: number) => number,
  half: number,
  tilt = 1,
): Placer {
  const table = buildArc(f, half);

  return (u: number) => {
    /* The glyph's flat centre, read as a distance along the curve from
     * the line's midpoint. */
    const x = table.xAtLength(table.midLength + u * half);
    return {
      dx: x - u * half,
      dy: table.yAt(x),
      rot: Math.atan(table.slopeAt(x)) * RAD * tilt,
    };
  };
}

/* Places glyphs by TRANSVERSE displacement — no arc-length
 * redistribution. Correct whenever the curve is a medium being displaced
 * rather than a track being laid: a point on a vibrating string moves
 * across the string, it does not slide along it. It also means a node of
 * the wave is a node in the text — the clamped ends really do stay put,
 * which arc-length placement quietly breaks by pulling the outer glyphs
 * inward off the nodes. */
export function transversePlacer(
  f: (x: number) => number,
  half: number,
  tilt = 1,
): Placer {
  const h = Math.max(half / 200, 0.5);

  return (u: number) => {
    const x = u * half;
    return {
      dx: 0,
      dy: f(x),
      rot: Math.atan((f(x + h) - f(x - h)) / (2 * h)) * RAD * tilt,
    };
  };
}

/* ── Monotone cubic interpolation ─────────────────────────────────────
 * For the data-driven variant: a series of readings has to become a
 * smooth continuous curve without the overshoot a plain cubic spline
 * would invent between points. Fritsch–Carlson keeps it honest — the
 * curve never rises above a local maximum the data doesn't contain. */

export function monotoneSpline(values: number[]): (t: number) => number {
  const n = values.length;
  const h = 1 / (n - 1);

  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) slopes.push((values[i + 1] - values[i]) / h);

  const m: number[] = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) m.push(0);
    else m.push((slopes[i - 1] + slopes[i]) / 2);
  }
  m.push(slopes[n - 2]);

  /* Clamp tangents so no segment can overshoot its own endpoints. */
  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slopes[i];
    const b = m[i + 1] / slopes[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = (3 / Math.sqrt(s)) * slopes[i];
      m[i] = t * a;
      m[i + 1] = t * b;
    }
  }

  return (t: number) => {
    const clamped = Math.min(1, Math.max(0, t));
    const i = Math.min(n - 2, Math.floor(clamped * (n - 1)));
    const local = (clamped - i * h) / h;
    const l2 = local * local;
    const l3 = l2 * local;

    return (
      (2 * l3 - 3 * l2 + 1) * values[i] +
      (l3 - 2 * l2 + local) * h * m[i] +
      (-2 * l3 + 3 * l2) * values[i + 1] +
      (l3 - l2) * h * m[i + 1]
    );
  };
}

/* ── SVG path sampling ────────────────────────────────────────────────
 * getPointAtLength is a real layout call — cheap once, ruinous per glyph
 * per frame. Sample the path into a table on mount, then interpolate. */

export type PathSample = { x: number; y: number; angle: number };

export function samplePath(
  path: SVGPathElement,
  half: number,
  samples = 256,
): PathSample[] {
  const total = path.getTotalLength();
  /* Scale so the path's ARC LENGTH equals the text's natural width. The
   * mark is therefore drawn smaller than the line it unfurls into, and
   * letter spacing is preserved exactly through the morph. */
  const scale = (2 * half) / total;

  const raw: PathSample[] = [];
  for (let i = 0; i <= samples; i++) {
    const at = (i / samples) * total;
    const p = path.getPointAtLength(at);
    const q = path.getPointAtLength(Math.min(total, at + 1));
    raw.push({ x: p.x, y: p.y, angle: Math.atan2(q.y - p.y, q.x - p.x) * RAD });
  }

  /* Centre the mark on the line it will become. */
  const cx = raw.reduce((sum, p) => sum + p.x, 0) / raw.length;
  const cy = raw.reduce((sum, p) => sum + p.y, 0) / raw.length;

  return raw.map((p) => ({
    x: (p.x - cx) * scale,
    y: (p.y - cy) * scale,
    angle: p.angle,
  }));
}

/** Blends between a sampled path (k = 1) and flat text (k = 0). */
export function pathPlacer(
  samples: PathSample[],
  half: number,
  k: number,
): Placer {
  return (u: number) => {
    if (!samples.length) return { dx: 0, dy: 0, rot: 0 };

    const at = ((u + 1) / 2) * (samples.length - 1);
    const lo = Math.min(samples.length - 2, Math.floor(at));
    const t = at - lo;
    const a = samples[lo];
    const b = samples[lo + 1];

    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const angle = a.angle + (b.angle - a.angle) * t;

    /* Flat is just the k = 0 end of the same expression. */
    return {
      dx: (x - u * half) * k,
      dy: y * k,
      rot: angle * k,
    };
  };
}

/* ── 2D polyline placement ────────────────────────────────────────────
 * The general case. Everything above assumes a curve that is a function
 * of x; this one takes an arbitrary sequence of points — a Bézier, a
 * sampled path, a coastline — and distributes glyphs along it by arc
 * length, anchored so the middle of the text sits at the middle of the
 * curve. It is what `arcPlacer` would be if a curve were allowed to
 * double back on itself. */
export function polylinePlacer(
  points: { x: number; y: number }[],
  half: number,
  tilt = 1,
): Placer {
  if (points.length < 2) return () => ({ dx: 0, dy: 0, rot: 0 });

  const cum = new Float64Array(points.length);
  for (let i = 1; i < points.length; i++) {
    cum[i] =
      cum[i - 1] +
      Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  /* Anchor: the point on the curve nearest x = 0, so the line's middle
   * glyph stays put while the ends run out along the curve. */
  let anchor = 0;
  let best = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = Math.abs(points[i].x);
    if (d < best) {
      best = d;
      anchor = cum[i];
    }
  }

  const at = (length: number) => {
    const total = cum[cum.length - 1];
    const clamped = Math.min(total, Math.max(0, length));

    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] > clamped) hi = mid;
      else lo = mid;
    }

    const span = cum[hi] - cum[lo] || 1;
    const t = (clamped - cum[lo]) / span;
    const a = points[lo];
    const b = points[hi];

    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      angle: Math.atan2(b.y - a.y, b.x - a.x) * RAD,
    };
  };

  return (u: number) => {
    const p = at(anchor + u * half);
    return { dx: p.x - u * half, dy: p.y, rot: p.angle * tilt };
  };
}

/** Samples a cubic Bézier. Control points in px, relative to line centre. */
export function cubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  samples = 220,
) {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const m = 1 - t;
    const a = m * m * m;
    const b = 3 * m * m * t;
    const c = 3 * m * t * t;
    const d = t * t * t;

    points.push({
      x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
      y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    });
  }

  return points;
}

/* ── Fixed-end reflection ─────────────────────────────────────────────
 * Folds a travelling pulse back into the line when it runs off an end.
 * A wave reflecting off a FIXED boundary comes back inverted — that sign
 * flip is the whole reason a reflected wake reads as a real reflection
 * rather than as the pulse politely turning around. */
export function fold(position: number, half: number) {
  let x = position;
  let sign = 1;

  for (let i = 0; i < 6; i++) {
    if (x > half) {
      x = 2 * half - x;
      sign = -sign;
    } else if (x < -half) {
      x = -2 * half - x;
      sign = -sign;
    } else break;
  }

  return { x, sign };
}

/* ── Travelling-wave field ────────────────────────────────────────────
 * The sum of every live pulse at one instant. Each pulse emits one crest
 * in each direction at a fixed speed; both fold back off the ends, and
 * the fold inverts them. Pulses simply add, so wakes interfere.
 *
 * `now` and `born` must share a time base — mixing performance.now()
 * with a frame clock that starts at mount silently kills every pulse. */
export type Pulse = { x0: number; born: number };

export function wakeField(
  pulses: Pulse[],
  now: number,
  half: number,
  { speed, life, amplitude, width }: {
    speed: number;
    life: number;
    amplitude: number;
    width: number;
  },
) {
  return (x: number) => {
    let sum = 0;

    for (const pulse of pulses) {
      const age = now - pulse.born;
      if (age < 0 || age > life) continue;

      const decay = (1 - age / life) ** 2;
      const travel = speed * age;

      for (const direction of [-1, 1]) {
        const { x: cx, sign } = fold(pulse.x0 + direction * travel, half);
        const d = (x - cx) / width;
        sum += sign * amplitude * decay * Math.exp(-d * d);
      }
    }

    return sum;
  };
}

/* ── Ring placement ───────────────────────────────────────────────────
 * Text on a closed loop. The radius is derived from the text's own width
 * so the line closes on itself exactly — set the phrase, and the circle
 * sizes itself to fit it once around. `phase` is an arc-length offset, so
 * advancing it walks the whole line around the ring: a marquee with no
 * seam and no reset, because there is no end to reset to. */
export function ringPlacer(
  half: number,
  phase: number,
  squash = 1,
  tilt = 1,
): Placer {
  /* Circumference equals the natural line width. */
  const radius = (2 * half) / (2 * Math.PI);

  return (u: number) => {
    const theta = (u * half + phase) / radius;
    const x = radius * Math.sin(theta);
    const y = -radius * Math.cos(theta) * squash + radius * squash;

    return {
      dx: x - u * half,
      dy: y,
      rot: (theta * 180) / Math.PI * tilt,
    };
  };
}

/* ── Deterministic scatter ────────────────────────────────────────────
 * A dissolve needs every glyph to fly somewhere different, but it must
 * fly to the SAME somewhere on every frame and every reload — Math.random
 * would reshuffle the paragraph 60 times a second. This is a cheap
 * integer hash: stable, uniform enough, and free. */
export function hash01(n: number, seed = 1): number {
  let h = Math.imul(n ^ seed, 2654435761);
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 4294967296;
}

/** Strong ease-out — the entrance curve, expressed once. */
export function easeOutQuint(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 5);
}

/** Smooth 0→1 ramp between two thresholds. */
export function ramp(value: number, from: number, to: number): number {
  if (to === from) return value >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

/* Sum of sines at incommensurate periods — noise that never repeats,
 * without shipping a noise library. */
export function drift(x: number, t: number): number {
  return (
    Math.sin(x * 1.7 + t * 0.9) * 0.5 +
    Math.sin(x * 2.9 - t * 0.61) * 0.3 +
    Math.sin(x * 4.7 + t * 1.31) * 0.2
  );
}
