"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  cancelFrame,
  frame,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type Transition,
} from "motion/react";
import "./negroni-card.css";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Italian Negroni card
 *
 *    0ms   card below the fold. The headline is not a straight
 *          line of text — it is laid out along a bell curve, its
 *          middle held level and both ends drooping away.
 *  enter   card crosses the viewport threshold → card springs up
 * +leadIn  the curve FLATTENS: its amplitude A springs from A₀ to
 *          0. Because every glyph is positioned by the curve
 *          equation, they realign onto a flat baseline for free —
 *          no per-glyph target positions anywhere in this file.
 *   exit   card leaves the viewport → the curve re-bows, so the
 *          whole thing replays on every re-entry. It re-bows towards
 *          whichever edge it left by, so scrolling back up plays the
 *          mirrored pose: card from above, line falling, hump inverted.
 *
 * THE MATH (see `buildBell` / `bellOffset`)
 *   The baseline is a bell curve — a Gaussian — not a circle. Flat tails
 *   at both ends, one smooth hump through the middle:
 *
 *     y(x) = A·(1 − e^(−x²∕2σ²))
 *
 *   Written that way the CENTRE is pinned at y = 0 and the tails sag by
 *   A, which is the shape the reference frame shows: the middle of the
 *   word holds its place while the two ends droop away from it. The
 *   `anchor` dial then slides the whole curve by −anchor·A, so the
 *   middle carries a little travel of its own — anchor = 1 pins the
 *   tails instead and lifts the middle by the full A. Either way the
 *   term is proportional to A, so it resolves to nothing at rest. σ sets
 *   how wide the hump is — small σ gives a narrow bump with long flat
 *   tails, large σ approaches the circular arc this replaced.
 *
 *   Glyphs are distributed along that curve BY ARC LENGTH, so the word
 *   never stretches or compresses along its own baseline — it only
 *   bends. Since a curve is longer than its horizontal span, the text's
 *   horizontal extent has to shrink to keep its length fixed, which is
 *   what makes the bowed word look elastically narrowed. Concretely:
 *
 *     s(x) = ∫₀ˣ √(1 + y′(t)²) dt        cumulative arc length
 *     y′(x) = A·(x∕σ²)·e^(−x²∕2σ²)
 *
 *   `buildBell` tabulates s(x) once per frame and inverts it, so a glyph
 *   whose flat centre sits u·(L/2) along the line is placed at the point
 *   that far ALONG THE CURVE, then rotated by atan(y′) to stay tangent.
 *
 *   A is the single animated value. As A → 0: y → 0, y′ → 0, s(x) → x.
 *   The curve becomes a straight line and every glyph lands exactly
 *   where the browser's own centred layout already put it. That limit is
 *   why the text realigns itself rather than being animated into place.
 *
 *   `spread` optionally delays the outer glyphs, so the ends trail the
 *   middle. At spread = 0 the curve stays rigid and flattens as one.
 * ───────────────────────────────────────────────────────── */

const HEADLINE = "Design Engineer";

const COPY =
  "The Italian Negroni is a bold and refined cocktail that captures the essence of classic aperitivo culture. Crafted with a balanced blend of gin, sweet vermouth, and bitter liqueur, it delivers a rich interplay of herbal, citrus, and subtly sweet notes.";

/* Tuned in the DialKit panel, then frozen here. Every value that used to
 * be a dial keeps its name and its place in the tree, so the panel can be
 * put back by wrapping this object in useDialKit and restoring the
 * [default, min, max] tuples. */
const CONFIG = {
  card: {
    /* How far below its resting spot the card starts. */
    enterY: 72,
    /* Card opacity while parked. */
    enterOpacity: 0.73,
    /* Visible fraction that arms the sequence — and, falling back
     * through it on the way out, re-arms it. */
    viewportAmount: 0.1,
    spring: { type: "spring", visualDuration: 0.8, bounce: 0.2 } as Transition,
  },
  arc: {
    /* How far the ends of the line droop, in px, before entry.
     * Negative bows the curve upward instead of down. */
    amplitude: 64,
    /* Width of the bell, as a fraction of the line's half-width.
     * Low = a narrow hump through the middle with long flat tails;
     * high = a broad bow approaching a circular arc. */
    sigma: 0.6,
    /* Where the curve hangs from, as a fraction of its amplitude.
     * 0 pins the middle dead still and only the ends move; 1 pins the
     * flat tails and lifts the middle by the full amplitude — the raw
     * bell. In between, the middle gets its own subtle travel that
     * resolves as the curve flattens. */
    anchor: 0.22,
    /* Scales the tangent rotation. 1 = glyphs sit truly tangent to the
     * curve; 0 = they stay upright and only follow its path. */
    tilt: 1,
    /* Whole line's vertical rise, independent of the curvature. */
    riseY: 130,
    /* Extra delay in seconds at the outermost glyph. 0 keeps the curve
     * rigid; higher values let the ends trail the middle. */
    spread: 0.16,
    /* Exponent on the distance ramp — >1 bunches the middle and throws
     * the lag out to the very ends. */
    curve: 1.5,
    /* Gap between the card landing and the curve releasing. */
    leadIn: 0.08,
    spring: { type: "spring", visualDuration: 0.7, bounce: 0.28 } as Transition,
  },
  scroll: {
    enabled: true,
    /* Slope of the map at rest, in px of amplitude per px/s of velocity.
     * A wheel notch is roughly 800px/s. */
    gain: 0.06,
    /* Ceiling the map curves towards but never reaches. Kept in the same
     * neighbourhood as arc.amplitude so a hard scroll bends the word
     * about as far as the entrance does. */
    max: 90,
    /* How the bend chases the scroll and relaxes back to flat. Stiffness
     * has to be high enough to track the peaks — scroll velocity spikes
     * are brief, and a soft spring averages them away into nothing. */
    stiffness: 380,
    damping: 28,
  },
  direction: {
    /* Off = the card always poses the same way, whichever edge it enters
     * from. On = the pose mirrors when entering from the top, so the
     * motion always reads as coming from the scroll. */
    mirrorOnScrollUp: true,
  },
};

const RAD = 180 / Math.PI;

/* Samples used to tabulate the curve's arc length. 128 puts the
 * inversion error well under a tenth of a pixel at display sizes. */
const SAMPLES = 128;

type Metrics = {
  /** Half the natural width of the line, in px. Half the arc length. */
  half: number;
  /** Per-glyph flat centre, normalised to −1…+1 across the line. */
  u: number[];
};

type Bell = {
  /** Height of the curve at horizontal offset x, in px. */
  y: (x: number) => number;
  /** Gradient of the curve at x — the tangent the glyph is rotated to. */
  slope: (x: number) => number;
  /** Inverse arc length: the x that sits `length` px along the curve. */
  xAtLength: (length: number) => number;
};

/* Tabulate one bell curve and its arc length. Amplitude changes every
 * frame, so this is rebuilt constantly — the cache below means glyphs
 * sharing an amplitude (i.e. spread = 0) only pay for it once. */
function buildBell(half: number, amp: number, sigma: number): Bell {
  const s2 = Math.pow(Math.max(sigma * half, 1), 2);

  const y = (x: number) => amp * (1 - Math.exp((-x * x) / (2 * s2)));
  const slope = (x: number) => (amp * x * Math.exp((-x * x) / (2 * s2))) / s2;

  /* Cumulative arc length over [0, half], by trapezoid. Monotonic, so
   * it inverts by a plain binary search. */
  const step = half / SAMPLES;
  const cum = new Float64Array(SAMPLES + 1);
  let prev = Math.sqrt(1 + slope(0) ** 2);

  for (let i = 1; i <= SAMPLES; i++) {
    const next = Math.sqrt(1 + slope(i * step) ** 2);
    cum[i] = cum[i - 1] + ((prev + next) / 2) * step;
    prev = next;
  }

  const xAtLength = (length: number) => {
    if (length <= 0) return 0;
    if (length >= cum[SAMPLES]) return half;

    let lo = 0;
    let hi = SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] > length) hi = mid;
      else lo = mid;
    }

    /* Linear interpolation inside the bracketing sample. */
    const span = cum[hi] - cum[lo] || 1;
    return (lo + (length - cum[lo]) / span) * step;
  };

  return { y, slope, xAtLength };
}

/* Amplitude is a continuous animated value, so the key is quantised to
 * a tenth of a pixel — finer than the curve is ever drawn. */
const bellCache = new Map<string, Bell>();

function getBell(half: number, amp: number, sigma: number): Bell {
  const key = `${half.toFixed(1)}|${amp.toFixed(1)}|${sigma.toFixed(3)}`;
  const hit = bellCache.get(key);
  if (hit) return hit;

  const bell = buildBell(half, amp, sigma);
  if (bellCache.size > 240) bellCache.clear();
  bellCache.set(key, bell);
  return bell;
}

/* Position of one glyph on the curve, expressed as an offset from where
 * that glyph already sits in flat text flow. */
function bellOffset(
  u: number,
  half: number,
  amp: number,
  sigma: number,
  tilt: number,
  anchor: number,
) {
  /* Flat curve — every term collapses to zero. */
  if (Math.abs(amp) < 0.02 || half === 0) return { dx: 0, dy: 0, rot: 0 };

  const bell = getBell(half, amp, sigma);
  const side = u < 0 ? -1 : 1;
  /* The glyph's flat centre, read as a distance along the curve. */
  const x = bell.xAtLength(Math.abs(u) * half);

  return {
    dx: side * x - u * half,
    /* `anchor` slides the whole curve vertically as a fraction of its
     * own amplitude, so the middle travels too instead of sitting
     * perfectly still. Scaling by amp means it unwinds to zero on its
     * own as the curve flattens. */
    dy: bell.y(x) - anchor * amp,
    rot: Math.atan(side * bell.slope(x)) * RAD * tilt,
  };
}

export default function NegroniCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [inView, setInView] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  /* Which side of the viewport the card is parked on: +1 below (it will
   * enter while scrolling down), −1 above (entering while scrolling up).
   * Read from the observer rather than from scroll deltas, so it is the
   * card's actual position that decides, not a guess about intent. */
  const [entrySide, setEntrySide] = useState(1);
  /* Reduced motion strips the movement and keeps the fade: the card
   * still resolves in, but nothing warps, rotates, or tracks scroll. */
  const reduceMotion = useReducedMotion() ?? false;

  const chars = Array.from(HEADLINE);

  /* Live scroll velocity, in px/s, mapped to its own slice of curve
   * amplitude. Scrolling down (positive velocity) drags the ends of the
   * word downward — the same sense as the entrance pose — and scrolling
   * up inverts it. Springing the mapped amplitude rather than the raw
   * velocity means it relaxes back to flat on its own the moment the
   * page stops moving. */
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  const dragTarget = useTransform(velocity, (v) => {
    /* Gated at the source: off-screen or reduced-motion, the target
     * holds at 0, the spring settles and stops emitting, and the glyph
     * subscriptions go quiet. Otherwise every scroll anywhere on the
     * page would repaint all fifteen glyphs every frame. */
    if (!CONFIG.scroll.enabled || !inView || reduceMotion) return 0;
    /* Saturating map rather than a hard clamp. A clamp wastes most of
     * its range: ordinary scrolling sits far below the ceiling and only
     * a fling ever reaches it, so the bend reads as barely there. tanh
     * spends the gain where the velocities actually are, curves over
     * smoothly, and can never exceed `max` — no clipping to flat-top. */
    const max = CONFIG.scroll.max;
    if (max <= 0) return 0;
    return max * Math.tanh((v * CONFIG.scroll.gain) / max);
  });

  const dragAmp = useSpring(dragTarget, {
    stiffness: CONFIG.scroll.stiffness,
    damping: CONFIG.scroll.damping,
    mass: 1,
  });

  /* Read the browser's own centred layout for the line: each glyph's
   * flat centre and the natural width of the text. Transforms don't
   * affect offsetLeft/offsetWidth, so this stays valid mid-animation. */
  const measure = useCallback(() => {
    const line = headlineRef.current;
    const glyphs = glyphRefs.current;
    const first = glyphs[0];
    const last = glyphs[glyphs.length - 1];
    if (!line || !first || !last) return;

    const width = last.offsetLeft + last.offsetWidth - first.offsetLeft;
    const half = width / 2;
    const mid = first.offsetLeft + half;

    setMetrics({
      half,
      u: glyphs.map((el) =>
        el && half > 0 ? (el.offsetLeft + el.offsetWidth / 2 - mid) / half : 0,
      ),
    });
  }, []);

  useLayoutEffect(() => {
    measure();

    const line = headlineRef.current;
    if (!line) return;

    /* Webfont swap and container resize both change the layout the arc
     * is derived from. */
    const observer = new ResizeObserver(measure);
    observer.observe(line);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, [measure]);

  /* Hand-rolled observer rather than useInView: it reports which side of
   * the viewport the card is parked on, which useInView does not. */
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const threshold = Math.min(Math.max(CONFIG.card.viewportAmount, 0), 1);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const armed = entry.intersectionRatio >= threshold;
        /* Only update the side while the card is parked — once it is on
         * screen the pose is committed and must not flip mid-flight. */
        if (!armed) setEntrySide(entry.boundingClientRect.top > 0 ? 1 : -1);
        setInView(armed);
      },
      { threshold: [0, threshold, 1].sort((a, b) => a - b) },
    );

    observer.observe(node);
    return () => observer.disconnect();
    /* CONFIG is a module constant, so this only ever runs on mount. */
  }, []);

  /* Everything directional is one multiplier. Entering from the top
   * mirrors the whole pose: the card drops in from above, the line falls
   * rather than rises, and the curve bows the other way — the hump
   * inverts, and with it the tangent rotation and the anchor's counter-
   * move, since both are derived from the signed amplitude. */
  const sign = CONFIG.direction.mirrorOnScrollUp ? entrySide : 1;
  /* One multiplier collapses every travelling value at once, so reduced
   * motion cannot miss one. */
  const travel = reduceMotion ? 0 : sign;

  return (
    <>
      <div className="negroni-runway" />

      <section className="negroni-scene">
        <motion.div
          ref={cardRef}
          className="negroni-card"
          initial={false}
          animate={{
            /* Full transform string, not the `y` shorthand — this runs
             * while the user is mid-scroll, which is exactly when the
             * shorthand's non-accelerated path costs frames. */
            transform: `translateY(${inView ? 0 : travel * CONFIG.card.enterY}px)`,
            opacity: inView ? 1 : CONFIG.card.enterOpacity,
          }}
          transition={CONFIG.card.spring}
        >
          <Thumb />

          <motion.h1
            ref={headlineRef}
            className="negroni-headline"
            aria-label={HEADLINE}
            initial={false}
            animate={{
              transform: `translateY(${inView ? 0 : travel * CONFIG.arc.riseY}px)`,
            }}
            transition={CONFIG.arc.spring}
          >
            {chars.map((char, i) => (
              <Glyph
                key={i}
                char={char}
                ref={(el) => {
                  glyphRefs.current[i] = el;
                }}
                u={metrics?.u[i] ?? 0}
                half={metrics?.half ?? 0}
                straight={inView}
                bowed={travel * CONFIG.arc.amplitude}
                sigma={CONFIG.arc.sigma}
                tilt={CONFIG.arc.tilt}
                anchor={CONFIG.arc.anchor}
                drag={dragAmp}
                delay={
                  CONFIG.arc.leadIn +
                  Math.pow(Math.abs(metrics?.u[i] ?? 0), CONFIG.arc.curve) *
                    CONFIG.arc.spread
                }
                transition={CONFIG.arc.spring}
              />
            ))}
          </motion.h1>

          <p className="negroni-copy">{COPY}</p>
        </motion.div>
      </section>

      <div className="negroni-runway" />
    </>
  );
}

type GlyphProps = {
  char: string;
  u: number;
  half: number;
  straight: boolean;
  bowed: number;
  sigma: number;
  tilt: number;
  anchor: number;
  drag: MotionValue<number>;
  delay: number;
  transition: Transition;
};

/* One glyph riding the curve. It owns a single scalar — the curve's
 * amplitude in px — and derives its whole transform from it, so the
 * animation only ever has one degree of freedom. */
const Glyph = React.forwardRef<HTMLSpanElement, GlyphProps>(function Glyph(
  {
    char,
    u,
    half,
    straight,
    bowed,
    sigma,
    tilt,
    anchor,
    drag,
    delay,
    transition,
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLSpanElement>(null);
  /* Starts bowed: the card is below the fold on first paint, so the
   * curve must already be bent rather than animating into its bend. */
  const amp = useMotionValue(bowed);

  /* Tracks whether this glyph is currently promoted, so `will-change` is
   * only written when it actually flips. */
  const promoted = useRef(false);

  /* Paint: amplitude → curve offset → transform. The two amplitudes
   * simply add — the entrance pose and the scroll drag are the same
   * quantity, so one curve carries both and there is still only one
   * shape being solved. Repaints once immediately so a remeasure or a
   * dial change lands without waiting for a frame. */
  useEffect(() => {
    const paint = () => {
      const el = innerRef.current;
      if (!el) return;

      const total = amp.get() + drag.get();
      const { dx, dy, rot } = bellOffset(u, half, total, sigma, tilt, anchor);
      el.style.transform = `translate(${dx.toFixed(3)}px, ${dy.toFixed(3)}px) rotate(${rot.toFixed(3)}deg)`;

      /* Promote only while the curve is actually bent. At rest the line
       * is plain static text and holds no compositor layer. */
      const active = Math.abs(total) > 0.05;
      if (active !== promoted.current) {
        promoted.current = active;
        el.style.willChange = active ? "transform" : "auto";
      }
    };

    /* Both amplitudes tick every frame, so a direct subscription would
     * solve the curve and write the style twice per frame. Scheduling on
     * the render step coalesces them — `frame` dedupes a callback already
     * queued for this frame. */
    const schedule = () => frame.render(paint, false, true);

    paint();
    const stopAmp = amp.on("change", schedule);
    const stopDrag = drag.on("change", schedule);
    return () => {
      stopAmp();
      stopDrag();
      cancelFrame(paint);
    };
  }, [amp, drag, u, half, sigma, tilt, anchor]);

  /* Drive: flatten the curve to 0, or bow it back to A₀.
   * `transition` is a fresh object every render, so the effect keys off
   * its contents — otherwise every unrelated render would restart the
   * spring from wherever it had got to. */
  const transitionKey = JSON.stringify(transition);

  useEffect(() => {
    const controls = animate(amp, straight ? 0 : bowed, {
      ...(JSON.parse(transitionKey) as Transition),
      delay: straight ? delay : 0,
    });
    return () => controls.stop();
  }, [amp, straight, bowed, delay, transitionKey]);

  return (
    <span className="negroni-char" ref={forwardedRef} aria-hidden="true">
      <span className="negroni-char-inner" ref={innerRef}>
        {char}
      </span>
    </span>
  );
});

/* Product tile above the headline — drawn rather than sourced so the
 * block has no image dependency. */
function Thumb() {
  return (
    <svg className="negroni-thumb" viewBox="0 0 88 88" role="presentation">
      <defs>
        <clipPath id="negroni-thumb-clip">
          <rect x="0" y="0" width="88" height="88" rx="19" />
        </clipPath>
        <linearGradient id="negroni-thumb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9cfc4" />
          <stop offset="52%" stopColor="#8e9a88" />
          <stop offset="100%" stopColor="#39463c" />
        </linearGradient>
        <linearGradient id="negroni-thumb-drink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0552c" />
          <stop offset="100%" stopColor="#a81605" />
        </linearGradient>
      </defs>

      <g clipPath="url(#negroni-thumb-clip)">
        <rect width="88" height="88" fill="url(#negroni-thumb-bg)" />
        {/* tumbler */}
        <rect
          x="31"
          y="30"
          width="26"
          height="34"
          rx="4"
          fill="#e8e4da"
          opacity="0.35"
        />
        <rect
          x="33"
          y="36"
          width="22"
          height="26"
          rx="3"
          fill="url(#negroni-thumb-drink)"
        />
        {/* orange twist */}
        <circle cx="50" cy="41" r="5" fill="#f7a63b" />
        <circle cx="50" cy="41" r="2.2" fill="#fdd08a" />
        {/* highlight down the near edge of the glass */}
        <rect
          x="34"
          y="31"
          width="3"
          height="32"
          rx="1.5"
          fill="#ffffff"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
