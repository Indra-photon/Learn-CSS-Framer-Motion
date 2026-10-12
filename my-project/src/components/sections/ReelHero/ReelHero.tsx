"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

import type { CSSProperties, ReactNode } from "react";
import type { MotionValue } from "motion/react";

import { COPY, NAV, PROOF, REELS } from "./content";
import { BevelButton } from "./BevelButton";
import { ProofFigure } from "./ProofFigure";
import { ReelCard } from "./ReelCard";
import { ReelLabel } from "./ReelLabel";
import {
  clamp,
  crestReelAt,
  REEL_PRESETS,
  accentAt,
  resolveRing,
  rgba,
  RING_DEFAULTS,
  swungPhi,
  type CopyBox,
  type Reel,
  type ReelFalloff,
  type ReelPresetName,
} from "./reel-geometry";

const DEG = Math.PI / 180;

const GRAIN_PLATE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * The type scale. Five steps, and every one of them a real ratio apart.
 *
 * Before this there were six sizes — 111, 19, 17, 14, 13, 12 — which is one
 * shout and then a 12-to-19px mush where nav, eyebrow, subhead and two
 * buttons all read as the same tier. The display size is solved separately
 * (it fills the column out to the ring's centre), so these four are what sits
 * under it: 111 / 44 / 26 / 15 / 11.
 *
 * `micro` is deliberately one style for *every* uppercase label in the
 * section — eyebrow, proof label, reel caption, CTA note. Four near-identical
 * label treatments were four chances to look accidental.
 */
const TYPE = {
  /** The proof number. The second voice the scale was missing. */
  figure: 44,
  lead: 22,
  body: 15,
  micro: 11,
} as const;

/* ─────────────────────────────────────────────────────────
 * ENTRANCE STORYBOARD
 *
 *    0ms   stage, vignette and grain only; no gallery, ring held at phi 0
 *  180ms   headline lines rise, 70ms apart
 *  520ms   subhead
 *  660ms   proof figure, when it is shown
 *  780ms   call to action AND gallery, together — the gallery eases 10px
 *          left to right, on the copy's own spring
 * 1240ms   gallery has landed; the ring is released into autoplay
 * 1480ms   crest rail crossfades in
 *
 * The order is the argument. The type states the offer, the action appears,
 * and only then does the work arrive to back it up — rather than everything
 * being present at once and the reader having to choose where to start.
 *
 * Nothing rotates until the gallery has finished travelling. Two motions on
 * one object at the same time read as a glitch: the ring would appear to
 * rotate *and* drift, and neither would be legible. Landing first, then
 * turning, keeps each one a separate statement — even at 10px.
 * ───────────────────────────────────────────────────────── */
const TIMING = {
  headline: 180,
  subhead: 520,
  figure: 660,
  launch: 780,
  settle: 1240,
  rail: 1480,
} as const;

/** Cue numbers, so one integer drives the whole sequence. */
const CUE = {
  headline: 1,
  subhead: 2,
  figure: 3,
  /** The call to action and the gallery share this one — they arrive together. */
  launch: 4,
  settle: 5,
  rail: 6,
} as const;

/**
 * How far the gallery starts off its resting position, in pixels.
 *
 * Negative, so it travels left to right into place — the same direction the
 * eye is already reading. And tiny: the gallery is the largest object on the
 * stage, so a distance that reads as "subtle" on a line of type reads as a
 * lurch on a 400px ring. The job here is to make the gallery feel like it
 * belongs to the same arrival as the text, not to stage a separate entrance
 * for it.
 */
const GALLERY_ENTRY = -10;

const CUES = Object.values(TIMING);

/** Spring the whole entrance shares, so nothing arrives on a different curve. */
const ARRIVE = { type: "spring", visualDuration: 0.5, bounce: 0 } as const;

/** Rise-and-fade, driven by whether the sequence has reached a cue. */
const arrive = (shown: boolean, delay = 0) => ({
  animate: { opacity: shown ? 1 : 0, y: shown ? 0 : 14 },
  initial: false,
  transition: { ...ARRIVE, delay },
});

/**
 * One integer for the whole entrance.
 *
 * Scattered booleans per element drift the moment a timing changes; a single
 * advancing cue number means the storyboard comment above is the source of
 * truth and every element just asks "are we past my cue yet".
 */
const useStoryboard = (start: boolean, skip: boolean): number => {
  const [cue, setCue] = useState(0);

  useEffect(() => {
    if (!start) {
      return;
    }

    if (skip) {
      setCue(CUES.length);

      return;
    }

    const timers = CUES.map((at, index) =>
      setTimeout(() => setCue(index + 1), at),
    );

    return () => timers.forEach(clearTimeout);
  }, [skip, start]);

  return cue;
};

/**
 * Runs marked `*like this*` are set in the display serif, in italic.
 *
 * One word in a contrasting face gives a 128px headline internal hierarchy
 * without adding a size to the scale — the slab stops being one undifferentiated
 * mass and gains a stress, which is the whole trick behind every editorial
 * headline that reads as designed rather than merely large.
 *
 * The serif is optically smaller than the grotesque at the same pixel size and
 * needs far less negative tracking, so both are corrected here rather than
 * being left to look like a mistake.
 */
const EMPHASIS = /(\*[^*]+\*)/g;

const withEmphasis = (line: string, accent: MotionValue<string>): ReactNode[] =>
  line
    .split(EMPHASIS)
    .filter(Boolean)
    .map((run, index) =>
      run.startsWith("*") && run.endsWith("*") ? (
        // The emphasised words carry the colour of whatever reel is on the
        // crest, so the headline is tinted by the work rather than by a
        // constant chosen at design time. This replaced the eyebrow, which
        // was the only other element holding the accent and the weakest
        // place in the hero to spend it.
        <motion.em
          key={index}
          className="font-serif italic"
          style={{
            color: accent,
            fontSize: "1.06em",
            letterSpacing: "-0.015em",
          }}
        >
          {run.slice(1, -1)}
        </motion.em>
      ) : (
        <span key={index}>{run}</span>
      ),
    );

/** Below this the ring moves under the copy instead of beside it. */
const COMPACT = 900;

export interface ReelHeroProps {
  /** Degrees of circle the cards occupy. `360` closes the ring. */
  arcSpan?: number;
  /** Beats per minute. The ring presents one reel per beat. */
  bpm?: number;
  className?: string;
  /** Which way the cards travel past the crest. */
  direction?: "down" | "up";
  falloff?: ReelFalloff;
  /** Shapes the whole falloff. Above `1` collapses the far side faster. */
  gamma?: number;
  /**
   * Strength of the gradient that dims the ring where the copy is, `0`–`1`.
   *
   * With `textVoid` off the far side of the ring travels behind the headline,
   * and at `spotlight`'s `minOpacity` of 0.8 those cards are still bright.
   * This is the honest counterpart to the void: the cards stay visible —
   * that is the look — but the type keeps its contrast. Defaults to nothing
   * when the void is doing the job instead.
   */
  copyScrim?: number;
  preset?: ReelPresetName;
  reels?: Reel[];
  /** Reel name and format on the crest card's left edge. */
  showDetails?: boolean;
  /**
   * How many reels the ring carries. One mounted card per reel, so this is
   * also the slot count — nine keeps most of the gallery legible, where
   * twelve pushed the far side into specks.
   */
  visibleReels?: number;
  /** Vertical radius as a fraction of the horizontal. `1` is a true circle. */
  squash?: number;
  /** How much the ring slows mid-beat, `0`–`0.95`. */
  swing?: number;
  /** Whether the slow part of a beat lands on a card or between two. */
  swingAt?: "gap" | "slot";
  /**
   * Shrink cards to nothing where the copy is, instead of letting them pass
   * behind it. Off by default: the far side of the ring tracking behind the
   * headline is the point of setting the copy inside the circle.
   */
  textVoid?: boolean;
}

/**
 * The reel hero.
 *
 * A ring of thumbnails that presents one reel at a time at its crest, with
 * the copy set inside the circle on the other side. Ported from a rendered
 * video composition — the geometry in `reel-geometry.ts` is unchanged, and
 * only the time source is different: a frame index became a motion value, so
 * the ring animates on the compositor and this component re-renders once per
 * beat rather than once per frame.
 */
export const ReelHero = ({
  arcSpan,
  bpm = 46,
  className,
  copyScrim,
  direction = "up",
  falloff = "arc",
  gamma,
  preset = "spotlight",
  reels = REELS,
  showDetails = true,
  squash,
  swing,
  swingAt = "slot",
  textVoid = false,
  visibleReels = 9,
}: ReelHeroProps) => {
  const shown = useMemo(
    () => reels.slice(0, Math.max(5, visibleReels)),
    [reels, visibleReels],
  );
  const look = REEL_PRESETS[preset];
  const swingAmount = swing ?? look.swing;
  const scrim = copyScrim ?? (textVoid ? 0 : 0.62);

  const [stageRef, stage] = useMeasure();
  const [headerRef, header] = useMeasure();
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hostRef, { amount: 0.25 });
  const reduced = useReducedMotion();

  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  /**
   * The pinned stage's height, read from the viewport rather than measured.
   *
   * Once the stage became `position: sticky` inside a 240svh section, the
   * measured height it laid everything out against stopped matching the one
   * screen it actually occupies — the ring's centre and the copy's centre
   * both ended up far below the fold on first paint.
   *
   * Rather than chase what a `ResizeObserver` reports for a sticky element,
   * this takes the height as the known quantity it is: the stage is exactly
   * one viewport tall. The value is then written back as explicit pixels, so
   * nothing downstream has to agree with a `svh` unit about what a screen is
   * either.
   */
  const [viewport, setViewport] = useState(0);

  useEffect(() => {
    const read = () => setViewport(window.innerHeight);

    read();
    window.addEventListener("resize", read);

    return () => window.removeEventListener("resize", read);
  }, []);

  /** The hero itself: one screen, as it was before anything was pinned. */
  const stageHeight = clamp(viewport || 680, 680, 900);

  const compact = stage.width > 0 && stage.width < COMPACT;

  /* ----------------------------------------------------------- the copy box */

  const copyRef = useRef<HTMLDivElement>(null);
  const [copyRect, setCopyRect] = useState<CopyBox | null>(null);

  useEffect(() => {
    const el = copyRef.current;

    if (!el) {
      return;
    }

    const pad = RING_DEFAULTS.textVoidPad;

    /**
     * Measured, not estimated.
     *
     * The video original had no text metrics — it ran in a worker and in the
     * renderer — so it guessed the copy block from an average glyph advance
     * and leaned on `textVoidPad` to absorb the error. In a browser the box
     * is simply there to be read, so the void is exact and the padding is
     * now only breathing room.
     */
    const measure = () => {
      setCopyRect({
        bottom: el.offsetTop + el.offsetHeight + pad,
        left: el.offsetLeft - pad,
        right: el.offsetLeft + el.offsetWidth + pad,
        top: el.offsetTop - pad,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(el);

    return () => observer.disconnect();
  }, [stage.width]);

  // On a stacked stage the copy sits above the ring rather than inside it, so
  // there is nothing for the cards to get out of the way of.
  const copy = textVoid && !compact ? copyRect : null;

  /* ------------------------------------------------------------- the config */

  const radius = useMemo(() => {
    if (stage.width === 0) {
      return 0;
    }

    return compact
      ? clamp(stage.width * 0.5, 130, 320)
      : clamp(Math.min(stage.width * 0.3, stageHeight * 0.46), 180, 400);
  }, [compact, stageHeight, stage.width]);

  const cardWidth = clamp(Math.min(radius * 0.8, stage.width * 0.21), 140, 380);
  const cardHeight = cardWidth / 1.78;

  /**
   * The crest is placed by the edge it has to clear, not by a fraction.
   *
   * A hardcoded `centerX` is a bet on one viewport width: the crest sits at
   * `centerX + radius`, so the moment the stage is narrower than the bet the
   * hero card — the one card that is actually at full size — hangs off the
   * right edge. Solving for the centre instead pins the crest card's right
   * edge to the gutter at every width, and keeps the composition lopsided,
   * which was the point of moving it off centre in the first place.
   */
  /**
   * One gutter for the whole section.
   *
   * The header and the copy have to start on the same vertical line, and they
   * cannot if one is padded in `rem` and the other offset in `%` — they agree
   * at exactly one viewport width and drift either side of it. A single
   * measured value, used by both, makes the alignment structural.
   */
  const gutter = clamp(stage.width * 0.07, 24, 160);

  /** Clear air between the copy and the crest card on a stacked stage. */
  const STACK_GAP = 28;

  /**
   * Where the ring's centre goes vertically.
   *
   * Side by side the crest sits on the stage's own midline. Stacked, the
   * crest has to clear the copy, so the centre is pushed down by the radius
   * from wherever the copy actually ends — a fraction of the stage height
   * would either overlap the copy on a long headline or leave a gap on a
   * short one.
   */
  const stackTop = copyRect ? copyRect.bottom + STACK_GAP : 0;

  const centerY = useMemo(() => {
    if (!compact || stackTop === 0) {
      return 0.52;
    }

    return (stackTop + cardHeight / 2 + radius) / stageHeight;
  }, [cardHeight, compact, radius, stackTop, stageHeight]);

  const centerX = useMemo(() => {
    if (stage.width === 0) {
      return 0.5;
    }

    if (compact) {
      return 0.5;
    }

    // The crest card is the *popped* one — `crestPop` makes it wider than
    // `cardWidth`, and sizing the fit without that is what let it hang off
    // the right edge. It clears that edge by the same gutter the copy starts
    // on, so the composition is bracketed by one measurement.
    const px =
      stage.width -
      gutter -
      (cardWidth * (1 + RING_DEFAULTS.crestPop)) / 2 -
      radius;

    return clamp(px / stage.width, 0.4, 0.82);
  }, [cardWidth, compact, gutter, radius, stage.width]);

  const headlineLines = useMemo(() => COPY.headline.split("\n"), []);

  /**
   * The copy column reaches the middle of the gallery.
   *
   * Not an arbitrary width: it ends on the ring's own centre line, so the
   * headline runs under the deepest part of the circle and the cards travel
   * behind it rather than beside it.
   */
  const copyWidth = compact
    ? Math.max(260, stage.width - gutter * 2)
    : Math.max(320, centerX * stage.width - gutter);

  /**
   * Headline size, solved so the longest line lands on the ring's centre.
   *
   * A `clamp()` in CSS cannot do this: it scales with the *viewport*, while
   * the column it has to fill is the distance from the gutter to the ring
   * centre, which moves with the radius and the card size too. Tying the size
   * to the measured column — and to the longest line the copy actually
   * contains — is what makes the type reach the gallery instead of stopping
   * a third of the way across and leaving a hole.
   *
   * `ADVANCE` is the average glyph advance for this grotesque at medium
   * weight. It only has to be close: the result is clamped, and a line that
   * lands a few percent off the centre reads as intentional either way.
   */
  const headlineSize = useMemo(() => {
    const ADVANCE = 0.54;
    // Measured without the emphasis markers — they are syntax, not glyphs.
    const longest = headlineLines.reduce(
      (most, line) => Math.max(most, line.replace(/\*/g, "").trim().length),
      1,
    );

    /** What the column wants: the longest line landing on the ring's centre. */
    const byWidth = copyWidth / (longest * ADVANCE);

    /**
     * What the stage can afford.
     *
     * Solving purely for width is how a hero ends up with a headline taller
     * than its own stage on a short, wide window: the column widens as the
     * viewport widens, and nothing in that sum knows about height. The rest
     * of the copy is near enough fixed — eyebrow, subhead, proof, actions and
     * the gaps between them — so what is left over belongs to the headline,
     * and the display size is the smaller of the two answers.
     */
    const REST = 330;
    const rows = headlineLines.length;
    // `header.height` is 0 when there is no header — measured, not assumed,
    // so commenting the header out simply gives the headline its space back.
    const room = Math.max(0, stageHeight - header.height - 56 - REST);
    const byHeight = room / (rows * 1.02);

    return clamp(Math.min(byWidth, byHeight), 34, compact ? 50 : 132);
  }, [compact, copyWidth, header.height, headlineLines, stageHeight]);

  const config = useMemo(
    () =>
      resolveRing({
        arcSpan,
        // Lopsided on purpose: the crest sits right of centre so the copy
        // owns the left. On a compact stage the ring drops below the copy
        // and recentres.
        centerX,
        centerY,
        copy,
        count: shown.length,
        crestAngle: compact ? -90 : 0,
        direction,
        falloff,
        gamma,
        height: stageHeight,
        minOpacity: look.minOpacity,
        radius,
        squash,
        width: stage.width,
      }),
    [
      arcSpan,
      centerX,
      centerY,
      compact,
      copy,
      direction,
      falloff,
      gamma,
      look.minOpacity,
      radius,
      shown.length,
      squash,
      stageHeight,
      stage.width,
    ],
  );

  /* ---------------------------------------------------------------- the drive */

  /** Elapsed beats. Unbounded — on the web there is no loop point to close. */
  const beats = useMotionValue(0);
  const autoPhi = useTransform(beats, (b) => swungPhi(b, swingAmount, swingAt));

  /** Hand-thrown offset, in reel units. */
  const dragTarget = useMotionValue(0);
  const dragPhi = useSpring(dragTarget, {
    damping: 34,
    mass: 0.7,
    stiffness: 130,
  });

  /** Scroll position of the ring, in reel units. */
  const phi = useTransform(
    [autoPhi, dragPhi],
    ([auto, drag]: number[]) => auto + drag,
  );

  /** Bumped on layout change so a paused ring still re-lays-out. */
  const tick = useMotionValue(0);

  useEffect(() => {
    tick.set(tick.get() + 1);
  }, [config, tick]);

  /**
   * The section's accent, as a motion value.
   *
   * Everything that is "the accent colour" in this hero now follows the reel
   * on the crest. The timecode and the crest caption get it for free — each
   * carries its own reel's colour and the existing `land` crossfade does the
   * blending — but the eyebrow has to hold a single colour at a time, so it
   * reads the weighted blend instead.
   */
  const accent = useTransform([phi, tick], ([p]: number[]) =>
    accentAt(p, shown, config, look.accentColor),
  );

  const cue = useStoryboard(inView, Boolean(reduced));

  // Held until the gallery has landed. See the storyboard.
  const running =
    inView && !hovering && !dragging && !reduced && cue >= CUE.settle;

  useAnimationFrame((_, delta) => {
    if (!running) {
      return;
    }

    // Clamp the step so a backgrounded tab does not resume with a jump.
    beats.set(beats.get() + (Math.min(delta, 50) / 60_000) * bpm);
  });

  /* ------------------------------------------------- which reel is where */

  /**
   * Nothing here is state any more.
   *
   * A card's position is a continuous function of `phi` and lives in motion
   * values; its *reel* is now fixed at mount. So the ring has no per-beat
   * React work at all — this component renders once and then never again.
   * The only exception is the crest index below, which exists purely to
   * announce the current reel, and touches two aria attributes on one div.
   */
  const [crestIndex, setCrestIndex] = useState(0);
  const crestRef = useRef(0);

  useMotionValueEvent(phi, "change", (value) => {
    const next = crestReelAt(value, config);

    if (next !== crestRef.current) {
      crestRef.current = next;
      setCrestIndex(next);
    }
  });

  /* ----------------------------------------------------------------- input */

  const grab = useRef({ moved: 0, phi: 0, y: 0 });

  /** Pixels of drag that advance the ring by one reel. */
  const arcPerReel = Math.max(24, radius * config.step * DEG);

  const step = useCallback(
    (by: number) => {
      dragTarget.set(dragTarget.get() + by);
    },
    [dragTarget],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    grab.current = { moved: 0, phi: dragTarget.get(), y: event.clientY };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }

    const dy = event.clientY - grab.current.y;

    grab.current.moved = dy;
    // Dragging up walks the cards up the crest side, which is the direction
    // `phi` already increases in.
    dragTarget.set(grab.current.phi - dy / arcPerReel);
  };

  const onPointerUp = () => {
    if (!dragging) {
      return;
    }

    setDragging(false);
    // A flick keeps going a little. The spring does the settling.
    dragTarget.set(dragTarget.get() - grab.current.moved / arcPerReel / 6);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }

    if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  /* ------------------------------------------------------------------ paint */

  const ready = stage.width > 0 && radius > 0;

  return (
    <section
      ref={hostRef}
      className={cn("relative isolate w-full overflow-hidden", className)}
      style={{ background: look.background, color: look.inkColor }}
    >
      <div
        ref={stageRef}
        className="relative mx-auto w-full"
        style={{ height: stageHeight }}
      >
        {/* ---------------------------------------------------------- cards */}
        {/* One card per reel, keyed by the reel. The key never moves, so the
            element never remounts and its `src` is written exactly once. */}
        {ready ? (
          <motion.div
            animate={{
              opacity: cue >= CUE.launch ? 1 : 0,
              x: cue >= CUE.launch ? 0 : GALLERY_ENTRY,
            }}
            className="absolute inset-0"
            initial={false}
            // The same spring the copy arrives on. The gallery is part of
            // that arrival, not an event of its own, so it must not have a
            // curve of its own either.
            transition={ARRIVE}
          >
            {shown.map((reel, index) => (
              <ReelCard
                key={reel.src}
                cardHeight={cardHeight}
                cardRadius={look.cardRadius}
                cardWidth={cardWidth}
                config={config}
                index={index}
                ink={look.inkColor}
                phi={phi}
                reel={reel}
                showDetails={false}
                stage={look.background}
                tick={tick}
              />
            ))}
          </motion.div>
        ) : null}

        {ready && showDetails && cue >= CUE.rail
          ? shown.map((reel, index) => (
              <ReelLabel
                key={reel.src}
                accent={look.accentColor}
                cardHeight={cardHeight}
                cardWidth={cardWidth}
                config={config}
                gap={20}
                index={index}
                phi={phi}
                reel={reel}
                tick={tick}
              />
            ))
          : null}

        {/* ------------------------------------------------------------ nav */}
        {/* Wordmark and nav sit on the copy's own left edge, so the header
            reads as the top line of the same column rather than a separate
            full-width bar.

            No button here. A header "Book a meeting" and a hero "Book a
            meeting", identically worded 700px apart, made the reader decide
            which one was *the* button — a decision they should never have to
            make. The hero owns the conversion. */}
        <header
          ref={headerRef}
          className="relative z-[2200] flex flex-wrap items-center gap-x-10 gap-y-4 py-7"
          style={{ paddingLeft: gutter, paddingRight: gutter }}
        >
          <a
            className="group flex items-center gap-2.5 leading-none"
            href="#top"
          >
            {/* The same chamfer as the button, at 10px. A mark that repeats
                the one shape the page already has reads as a system; a
                generic circle or rounded square would read as a placeholder. */}
            <motion.span
              aria-hidden
              className="block size-2.5"
              style={{
                backgroundColor: accent,
                clipPath:
                  "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)",
              }}
            />
            <span
              className="font-medium tracking-[-0.02em]"
              style={{ fontSize: TYPE.lead - 6 }}
            >
              Frameline
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item}
                className={cn(
                  "rounded-full px-3 py-2 leading-none tracking-[-0.01em]",
                  "text-[color:var(--nav)] transition-colors duration-200",
                  "hover:bg-[color:var(--nav-bg)] hover:text-[color:var(--nav-on)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
                )}
                href={`#${item.toLowerCase()}`}
                style={
                  {
                    "--nav": rgba(look.inkColor, 0.6),
                    "--nav-bg": rgba(look.inkColor, 0.08),
                    "--nav-on": look.inkColor,
                    fontSize: TYPE.body,
                  } as CSSProperties
                }
              >
                {item}
              </a>
            ))}
          </nav>

          {/* A hairline the full width of the stage, not of the padded row —
              it is the edge of the section, not a border on the nav. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            style={{
              background: `linear-gradient(90deg, ${rgba(look.inkColor, 0.14)}, ${rgba(look.inkColor, 0)} 70%)`,
            }}
          />
        </header>

        {/* The ring itself is decorative — twelve transformed thumbnails are
            not something to navigate with a screen reader. The work is listed
            once, in order, and the grip announces which one is up. */}
        <ol className="sr-only">
          {shown.map((reel) => (
            <li key={reel.src}>
              {reel.label}
              {reel.caption ? ` — ${reel.caption}` : ""}
              {reel.duration ? `, ${reel.duration}` : ""}
            </li>
          ))}
        </ol>

        {/* ---------------------------------------------------------- cards */}
        {/* Dims the ring under the copy column. An ellipse anchored off the
            left edge, so it has no edge of its own anywhere near the type —
            a rectangle here would read as a plate, which is exactly what the
            composition is trying to avoid. */}
        {scrim > 0.01 && ready ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[1800]"
            style={{
              background: `radial-gradient(130% 85% at 0% 50%, ${rgba(look.background, scrim)} 0%, ${rgba(look.background, scrim * 0.92)} 42%, ${rgba(look.background, 0)} 100%)`,
              width: Math.min(stage.width, gutter + copyWidth + 180),
            }}
          />
        ) : null}

        {/* ----------------------------------------------------------- copy */}
        {/* Set *inside* the circle, running out to the ring's centre line, so
            the gallery's far side travels behind the headline. `textVoid`
            would instead shrink those cards to nothing here — the original
            video's choice, and still one prop away. */}
        <motion.div
          ref={copyRef}
          className={cn(
            "absolute z-[2000] flex flex-col",
            compact ? "top-[84px]" : "-translate-y-1/2",
          )}
          style={{
            gap: 22,
            left: gutter,
            // Centred below the header, not inside the whole stage. Centring
            // in the stage ignores the 74px the header already owns, which
            // pushes the copy up into it at large display sizes.
            top: compact
              ? undefined
              : header.height + (stageHeight - header.height) / 2,
            width: copyWidth,
          }}
        >
          {/* The headline is written as lines rather than wrapped, so each one
              can arrive on its own beat — and so the last line can be a live
              element instead of a string. */}
          <h1
            className="flex flex-col"
            style={{
              color: look.inkColor,
              fontSize: headlineSize,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
            }}
          >
            {headlineLines.map((line, index) => (
              <motion.span
                key={line}
                {...arrive(cue >= CUE.headline, index * 0.07)}
              >
                {withEmphasis(line, accent)}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="tracking-[-0.005em]"
            style={{
              color: rgba(look.inkColor, 0.6),
              fontSize: compact ? TYPE.body : TYPE.lead,
              lineHeight: 1.2,
              // The column is sized for the headline, which is far too wide a
              // measure for body copy. The subhead keeps a readable one and
              // simply ends earlier.
              maxWidth: Math.min(copyWidth, 880),
            }}
            {...arrive(cue >= CUE.subhead)}
          >
            {COPY.subhead}
          </motion.p>

          {/* The proof. One number at 44px rather than three at 20px: this is
              the only claim a buyer cannot get from an agency, so it carries
              the whole argument and earns the second-largest type here. */}
          {/* No `arrive` on this wrapper: the numeral brings its own entrance,
              and stacking the two would send it travelling 30px through a
              blur. The label still rises with everything else. */}
          {/* <div className="flex flex-col gap-2">
            <span
              className="leading-none font-medium tracking-[-0.03em]"
              style={{ color: look.inkColor, fontSize: TYPE.figure }}
            >
              <ProofFigure
                reduced={Boolean(reduced)}
                shown={cue >= CUE.figure}
                suffix={PROOF.suffix}
                value={PROOF.value}
              />
            </span>
            <motion.span
              className="leading-none font-medium uppercase"
              style={{
                color: rgba(look.inkColor, 0.6),
                fontSize: TYPE.micro,
                letterSpacing: "0.14em",
              }}
              {...arrive(cue >= CUE.figure)}
            >
              {PROOF.label}
            </motion.span>
          </div> */}

          <motion.div
            className="mt-10 flex flex-col gap-5"
            {...arrive(cue >= CUE.launch)}
          >
            <div className="flex flex-wrap items-center gap-3">
              <BevelButton
                color={look.accentColor}
                href="#book"
                stage={look.background}
              >
                {COPY.primaryCta}
              </BevelButton>

              <BevelButton
                color={look.inkColor}
                href="#work"
                stage={look.background}
                tone="ghost"
              >
                {COPY.secondaryCta}
              </BevelButton>
            </div>
          </motion.div>
        </motion.div>

        {/* -------------------------------------------------------- the grip */}
        {/* One surface for the whole ring. The cards themselves are inert, so
            a flick anywhere over the stage spins it and nothing has to
            hit-test twelve transformed elements. */}
        <div
          aria-label="Showreel. Drag, or use the arrow keys, to change reel."
          aria-valuemax={shown.length - 1}
          aria-valuemin={0}
          aria-valuenow={crestIndex}
          aria-valuetext={shown[crestIndex]?.label ?? ""}
          className="absolute inset-0 z-[1500] cursor-grab touch-pan-y active:cursor-grabbing"
          onKeyDown={onKeyDown}
          onPointerCancel={onPointerUp}
          onPointerDown={onPointerDown}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => {
            setHovering(false);
            onPointerUp();
          }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="slider"
          tabIndex={0}
        />

        {/* ------------------------------------------------------- overlays */}
        {look.vignette > 0.01 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1200]"
            style={{
              background: `radial-gradient(115% 80% at 50% 50%, transparent 40%, ${rgba("#000000", look.vignette)} 100%)`,
            }}
          />
        ) : null}

        {look.grain > 0.001 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1300] mix-blend-overlay"
            style={{ backgroundImage: GRAIN_PLATE, opacity: look.grain }}
          />
        ) : null}

        {/* Only motion that reduced-motion users lose is the autoplay. The
            ring is still theirs to move. */}
        {reduced ? (
          <p
            className="absolute bottom-6 left-1/2 z-[2100] -translate-x-1/2 text-[12px] tracking-[0.08em] uppercase"
            style={{ color: rgba(look.inkColor, 0.4) }}
          >
            Drag or use arrow keys
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default ReelHero;
