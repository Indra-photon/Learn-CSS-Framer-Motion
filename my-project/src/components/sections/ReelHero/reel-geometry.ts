/**
 * Ring geometry for the reel hero.
 *
 * No React in here. Everything is a pure function of the scroll position
 * `phi` and a config resolved once per layout, which is what lets the whole
 * ring animate inside motion values without a single re-render: the render
 * pass mounts the cards, and `slotAt` feeds the compositor from then on.
 */

const DEG = Math.PI / 180;
export const TAU = Math.PI * 2;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/* ------------------------------------------------------------------ colour */

interface Rgb {
  b: number;
  g: number;
  r: number;
}

export const parseHex = (value: string): Rgb | null => {
  const hex = value.trim().replace("#", "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;

  if (!/^[0-9a-f]{6}$/i.test(full)) {
    return null;
  }

  return {
    b: Number.parseInt(full.slice(4, 6), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    r: Number.parseInt(full.slice(0, 2), 16),
  };
};

export const rgba = (hex: string, alpha: number): string => {
  const c = parseHex(hex);

  return c ? `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})` : hex;
};

/* ----------------------------------------------------------------- presets */

export interface ReelPreset {
  accentColor: string;
  background: string;
  cardRadius: number;
  grain: number;
  inkColor: string;
  minOpacity: number;
  swing: number;
  vignette: number;
}

/**
 * Three stages for the same geometry. The ring never changes — what changes
 * is whether the hero reads as a campaign billboard, a product page or a
 * print contact sheet.
 */
export const REEL_PRESETS = {
  /** Warm paper, soft corners, gentle fade. */
  editorial: {
    accentColor: "#b4411b",
    background: "#efebe4",
    cardRadius: 6,
    grain: 0.03,
    inkColor: "#121212",
    minOpacity: 0.3,
    swing: 0.45,
    vignette: 0,
  },
  /** Near-black, hard corners, barely any fade. The default. */
  spotlight: {
    // A real accent. White on near-black is not one: at #f5f5f5 ink the old
    // #ffffff "accent" differed by ten units of lightness, which is invisible
    // at label sizes, so colour was doing no hierarchy work at all.
    accentColor: "#ff5c2b",
    background: "#080808",
    cardRadius: 4,
    grain: 0.04,
    inkColor: "#f5f5f5",
    minOpacity: 0.8,
    swing: 0.5,
    vignette: 0.1,
  },
  /** Cold, rounded, the far side genuinely receding. */
  studio: {
    accentColor: "#6ea8ff",
    background: "#06070d",
    cardRadius: 12,
    grain: 0.05,
    inkColor: "#eef2ff",
    minOpacity: 0.35,
    swing: 0.65,
    vignette: 0.28,
  },
} as const satisfies Record<string, ReelPreset>;

export type ReelPresetName = keyof typeof REEL_PRESETS;

/* ------------------------------------------------------------------- types */

export interface Reel {
  src: string;
  /**
   * Colour pulled from this reel's artwork.
   *
   * The hero's accent is a function of what is currently on the crest rather
   * than a constant, which ties colour to the motion instead of leaving it as
   * decoration applied once at design time.
   */
  accent?: string;
  alt?: string;
  /** Client name. Used for the accessible listing, not drawn on the stage. */
  label?: string;
  /** A `tech-stack-icons` name — the client's real mark, drawn on the crest. */
  logo?: string;
  /** Format line under the label, set in the accent colour. */
  caption?: string;
  /** Runtime, rendered as a timecode chip on the crest card. */
  duration?: string;
  /** Multiplies this card's size wherever it sits on the ring. */
  weight?: number;
}

/** How a card's remoteness from the crest is measured. */
export type ReelFalloff = "arc" | "chord";

export interface CopyBox {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

/* ──────────────────────────────────────────────────────────────────────────
 * THE ONE FORMULA
 *
 * Every card centre is a point on a circle. Nothing else about a card is
 * chosen: its size, its fade and its blur are all read off a single number —
 * how far it is from the crest — through one curve.
 *
 *     d  = distance(card, crest)  normalised to [0, 1]
 *     f  = (1 - d) ** gamma
 *     scale   = minScale + (maxScale - minScale) * f
 *     opacity = minOpacity + (1 - minOpacity) * (1 - d) ** (gamma / 2)
 *     blur    = depthBlur * d
 *
 * `gamma` is the whole character of the piece. At `1` the ring is a ramp and
 * every card is legible; at `2.3` — the default — the crest card is an order
 * of magnitude bigger than the one a quarter-turn behind it, which is what
 * makes the far side read as a scatter of specks rather than as a row of
 * small pictures.
 *
 * `falloff` only picks the metric:
 *
 *   arc    d = |dtheta| / halfSpan     even along the circle
 *   chord  d = sin(|dtheta| / 2)       how far it *looks*, straight-line
 *
 * They agree at both ends and differ everywhere in between. A chord is
 * shorter than the arc it subtends, but *normalising* both to 1 at the far
 * end inverts that: the chord reaches a given fraction of its maximum
 * sooner, so `chord` is the more aggressive metric at every angle off the
 * crest. At a quarter turn with `gamma: 2.3`, `arc` sizes a card at 0.203
 * and `chord` at 0.059 — a third of it. `arc` steps down evenly and reads as
 * a sequence; `chord` reads as one hero and a field of dust.
 * ────────────────────────────────────────────────────────────────────────── */

/** Normalised remoteness from the crest, `0` on it and `1` at the far end. */
export const crestDistance = (
  deltaAngle: number,
  halfSpan: number,
  falloff: ReelFalloff,
): number => {
  const away = Math.min(Math.abs(deltaAngle), halfSpan);

  if (falloff === "chord") {
    // Chord of the circle, normalised by the chord at `halfSpan`. Collapses
    // to `sin(|dtheta| / 2)` on a closed ring, where the far chord is the
    // diameter.
    const far = Math.sin((halfSpan / 2) * DEG);

    return far <= 1e-6 ? 0 : Math.sin((away / 2) * DEG) / far;
  }

  return halfSpan <= 1e-6 ? 0 : away / halfSpan;
};

/** The curve the distance is read through. `0` at the far end, `1` on it. */
export const crestFalloff = (distance: number, gamma: number): number =>
  (1 - clamp(distance, 0, 1)) ** Math.max(0.05, gamma);

/** Sharp peak on the crest, shared by the pop, the label and the timecode. */
export const landAt = (absAngle: number, band: number): number => {
  if (absAngle >= band || band <= 0) {
    return 0;
  }

  return 0.5 + 0.5 * Math.cos(Math.PI * (absAngle / band));
};

/**
 * How much of a card survives where it is.
 *
 * `1` in the clear, `0` anywhere inside the copy box, ramping across
 * `feather` pixels in between. The ramp is on *scale*, not opacity: a card
 * fading out over type still washes it for the whole fade, whereas one
 * shrinking to nothing has already stopped covering anything by the time it
 * reaches the text. It also matches what the rest of the component does —
 * size is the only thing that carries meaning here.
 */
export const veilAt = (
  x: number,
  y: number,
  box: CopyBox | null,
  feather: number,
): number => {
  if (!box) {
    return 1;
  }

  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  const outside = Math.hypot(dx, dy);

  // A hard edge is a legitimate setting, not a degenerate one: the cards
  // crossing here are already small, so a feather of zero reads as a clean
  // mask rather than as a pop.
  if (feather <= 0) {
    return outside > 0 ? 1 : 0;
  }

  return clamp(outside / feather, 0, 1);
};

/* --------------------------------------------------------------- the swing */

/**
 * Scroll position from elapsed time.
 *
 * `swing` is a closed form rather than a sampled easing:
 *
 *     phi(t) = t -+ (swing / 2pi) * sin(2pi * t)
 *     dphi   = 1 -+ swing * cos(2pi * t)
 *
 * which runs at `1 + swing` at the beat edges and `1 - swing` in the middle,
 * and lands on `phi(0) = 0`, `phi(1) = 1` exactly. No normalisation, no
 * drift, and nothing to snap at a loop point — because on the web there is
 * no loop point. `phi` just keeps counting, and the arithmetic means every
 * beat is identical anyway.
 */
export const swungPhi = (
  beats: number,
  swing: number,
  swingAt: "gap" | "slot",
): number => {
  const whole = Math.floor(beats);
  const t = beats - whole;
  // Slow on a card, or slow between two. Only the sign differs.
  const sign = swingAt === "slot" ? -1 : 1;

  return whole + t + (sign * clamp(swing, 0, 0.95) * Math.sin(TAU * t)) / TAU;
};

/* --------------------------------------------------------------- the config */

export interface RingConfig {
  /** Number of mounted cards. Always equal to the reel count. */
  rendered: number;
  blurFloor: number;
  count: number;
  centerX: number;
  centerY: number;
  closed: number;
  copy: CopyBox | null;
  crestAngle: number;
  crestBand: number;
  crestPop: number;
  depthBlur: number;
  dir: number;
  edge: number;
  fadeSlots: number;
  falloff: ReelFalloff;
  feather: number;
  gamma: number;
  half: number;
  halfSpan: number;
  margin: number;
  maxScale: number;
  minOpacity: number;
  minScale: number;
  radiusX: number;
  radiusY: number;
  slots: number;
  step: number;
}

export interface RingInput {
  arcSpan?: number;
  centerX?: number;
  centerY?: number;
  copy?: CopyBox | null;
  count: number;
  crestAngle?: number;
  crestBand?: number;
  crestPop?: number;
  depthBlur?: number;
  direction?: "down" | "up";
  fadeSlots?: number;
  falloff?: ReelFalloff;
  gamma?: number;
  height: number;
  maxScale?: number;
  minOpacity?: number;
  minScale?: number;
  radius: number;
  squash?: number;
  textVoidFeather?: number;
  width: number;
}

const MAX_SLOTS = 48;
const CLOSED = 359.99;

export const RING_DEFAULTS = {
  arcSpan: 360,
  centerX: 0.62,
  centerY: 0.52,
  crestAngle: 0,
  crestPop: 0.06,
  depthBlur: 2.4,
  fadeSlots: 1.5,
  // 2.3 put nine of twelve cards under a quarter scale — a field of dust
  // rather than a body of work. At 1.7 the ring steps down as a sequence and
  // most of the gallery stays legible.
  gamma: 1.7,
  maxScale: 1,
  minScale: 0.09,
  squash: 1,
  textVoidFeather: 70,
  textVoidPad: 28,
};

/**
 * Resolve the ring once per layout.
 *
 * The circle is *not* auto-fitted. A ring that centres itself on its own
 * bounds is the right default when the ring is the whole picture — it is the
 * wrong one here, because the composition is deliberately lopsided: the
 * crest is pushed to one side so the copy has the other. Fitting would drag
 * it back to the middle and undo the only layout decision this makes.
 */
export const resolveRing = (input: RingInput): RingConfig => {
  const arcSpan = clamp(input.arcSpan ?? RING_DEFAULTS.arcSpan, 30, 360);
  const closed = arcSpan >= CLOSED;

  // An open arc gains a card at one end and loses one at the other on every
  // beat, and both of those positions lie *outside* the visible span — so a
  // fade measured against `arcSpan / 2` is still partly opaque where it
  // matters. One margin position past each end, with the fade reaching zero
  // before them, is what makes the swap unobservable.
  const margin = closed ? 0 : 1;

  /**
   * One mounted card per reel. Not negotiable — see `slotAt`.
   *
   * The video original mounted a card per ring *position* and rotated the
   * reels through them, which meant every card's `src` changed on every beat.
   * A renderer does not care: it inlines and decodes everything before it
   * rasterises. A browser very much does — twelve simultaneous image swaps per
   * beat, each flashing its placeholder while the new file decodes. Welding
   * each element to one reel costs the freedom to choose `slots` separately
   * from the reel count, and buys a `src` that is written once and never
   * touched again.
   */
  const count = Math.max(5, input.count);
  const slots = Math.max(3, Math.min(MAX_SLOTS, count - 2 * margin));
  const step = arcSpan / slots;
  const edge = (slots - 1) / 2;

  return {
    blurFloor: 0.08,
    centerX: (input.centerX ?? RING_DEFAULTS.centerX) * input.width,
    centerY: (input.centerY ?? RING_DEFAULTS.centerY) * input.height,
    closed: closed ? 1 : 0,
    copy: input.copy ?? null,
    count,
    crestAngle: input.crestAngle ?? RING_DEFAULTS.crestAngle,
    // One slot spacing. A fixed width would overlap its neighbours the moment
    // `arcSpan` or the reel count changed the spacing, popping and labelling
    // two cards at once.
    crestBand: input.crestBand ?? step,
    crestPop: input.crestPop ?? RING_DEFAULTS.crestPop,
    depthBlur: input.depthBlur ?? RING_DEFAULTS.depthBlur,
    dir: (input.direction ?? "up") === "up" ? 1 : -1,
    edge,
    fadeSlots: Math.max(1, input.fadeSlots ?? RING_DEFAULTS.fadeSlots),
    falloff: input.falloff ?? "arc",
    feather: input.textVoidFeather ?? RING_DEFAULTS.textVoidFeather,
    gamma: Math.max(0.05, input.gamma ?? RING_DEFAULTS.gamma),
    half: Math.floor(slots / 2),
    // How far a card can get from the crest before the ring stops. A closed
    // ring runs to the far side; an open arc only as far as it is drawn.
    halfSpan: closed ? 180 : Math.max(1e-6, edge * step),
    margin,
    maxScale: input.maxScale ?? RING_DEFAULTS.maxScale,
    minOpacity: input.minOpacity ?? REEL_PRESETS.spotlight.minOpacity,
    minScale: input.minScale ?? RING_DEFAULTS.minScale,
    radiusX: input.radius,
    radiusY: input.radius * (input.squash ?? RING_DEFAULTS.squash),
    rendered: count,
    slots,
    step,
  };
};

/* ----------------------------------------------------------------- the slot */

export interface SlotState {
  angle: number;
  blur: number;
  distance: number;
  /** Sharp peak at the crest: drives the pop, the label and the timecode. */
  land: number;
  opacity: number;
  scale: number;
  /**
   * `1` in the clear, `0` where the copy block is. Already folded into
   * `scale` — reported so a caller can tell a card that is hidden from one
   * that is merely far away.
   */
  veil: number;
  x: number;
  y: number;
  /**
   * Paint order, straight off the distance.
   *
   * The editframe original sorted the slots to assign this, which made the
   * handover between the pair straddling the crest a discrete event that no
   * amount of interpolation could hide. Reading it off `distance` instead
   * costs nothing and has no handover at all: `zIndex` is just another
   * continuous function of the one number everything else comes from.
   */
  z: number;
}

/**
 * Where reel `index` sits at scroll position `phi`.
 *
 * The element is welded to its reel; it is the *position* that is computed.
 * `w` is how many slots the reel currently sits ahead of the far end, wrapped
 * into `[0, count)`, so it decreases smoothly as `phi` rises and the reel
 * walks up the ring to the crest and away again.
 *
 * The wrap itself is free. `w` jumps from `0` to just under `count`, which is
 * `rel` jumping from `-halfSpan` to `+halfSpan` — and those are the same point
 * on the circle (`cos` and `sin` do not care which way you got to 180°), at
 * the same distance, so the same scale and the same opacity. On a closed ring
 * the card teleports to a pixel-identical state; on an open arc it does so
 * where `spanFade` has already reached zero. Either way there is nothing to
 * see, and nothing to cross-fade.
 */
export const slotAt = (
  phi: number,
  index: number,
  c: RingConfig,
): SlotState => {
  const w = (((index - phi) % c.count) + c.count) % c.count;
  const place = w - c.half - c.margin;
  const rel = place * c.step;
  const angle = c.crestAngle + c.dir * rel;

  const distance = crestDistance(rel, c.halfSpan, c.falloff);
  const near = crestFalloff(distance, c.gamma);
  // Fade on half the exponent, so a card dissolves markedly slower than it
  // shrinks: the far side should read as *small*, not as absent.
  const seen = crestFalloff(distance, c.gamma / 2);
  const land = landAt(Math.abs(rel), c.crestBand);

  const spanFade = c.closed
    ? 1
    : clamp((c.edge - Math.abs(place)) / c.fadeSlots, 0, 1);

  const x = c.centerX + c.radiusX * Math.cos(angle * DEG);
  const y = c.centerY + c.radiusY * Math.sin(angle * DEG);
  const veil = veilAt(x, y, c.copy, c.feather);

  return {
    angle,
    blur: c.depthBlur * distance,
    distance,
    land,
    opacity: (c.minOpacity + (1 - c.minOpacity) * seen) * spanFade,
    scale:
      (c.minScale + (c.maxScale - c.minScale) * near) *
      (1 + c.crestPop * land) *
      veil,
    veil,
    x,
    y,
    z: Math.round((1 - distance) * 1000),
  };
};

/**
 * The accent colour for this instant, blended across whatever is at the crest.
 *
 * `land` sums to exactly `1` across all slots, so it is already a set of
 * weights — summing each reel's accent against it gives a colour that crosses
 * smoothly from one reel to the next with no easing to tune and no state to
 * keep. Where one reel is dead on the crest it is simply that reel's colour.
 */
export const accentAt = (
  phi: number,
  reels: Reel[],
  c: RingConfig,
  fallback: string,
): string => {
  let r = 0;
  let g = 0;
  let b = 0;
  let weight = 0;

  for (let i = 0; i < reels.length; i += 1) {
    const { land } = slotAt(phi, i, c);

    if (land <= 0) {
      continue;
    }

    const hex = parseHex(reels[i].accent ?? fallback);

    if (!hex) {
      continue;
    }

    r += hex.r * land;
    g += hex.g * land;
    b += hex.b * land;
    weight += land;
  }

  if (weight <= 1e-6) {
    return fallback;
  }

  return `rgb(${Math.round(r / weight)}, ${Math.round(g / weight)}, ${Math.round(b / weight)})`;
};

/** Which reel is being presented at the crest. For announcing it, only. */
export const crestReelAt = (phi: number, c: RingConfig): number => {
  const index = Math.round(phi) + c.half + c.margin;

  return ((index % c.count) + c.count) % c.count;
};

/**
 * Depth fade, painted on rather than applied to the element.
 *
 * `opacity` on a card makes the card itself translucent, so wherever two
 * cards overlap you see the far one through the near one. It also makes
 * stacking order visible: `A over B` and `B over A` composite to different
 * pixels when both carry alpha, so the frame where two cards cross and swap
 * z changes abruptly across the whole overlap instead of only where one
 * truly occludes the other.
 *
 * Laying a scrim of the stage colour over the card instead keeps every card
 * fully opaque. A distant card still *looks* faded — it is blended toward
 * the background it sits on — but it occludes properly.
 *
 * This needs a stage it can read. If the background is not a plain colour
 * there is nothing to blend toward, so the caller falls back to element
 * opacity and the old overlap behaviour.
 */
export const stageScrim = (stage: string, opacity: number): string =>
  rgba(stage, clamp(1 - opacity, 0, 1));
