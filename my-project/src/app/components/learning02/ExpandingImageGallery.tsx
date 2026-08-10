"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useDialKit } from "dialkit";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after its trigger.
 *
 * ── ENTRANCE (trigger: strip scrolls into view) ──
 *    0ms   strip hidden, cards parked 28px below the baseline
 *  120ms   strip container fades in
 *  160ms   cards rise into place, y 10 → 0 (staggered 30ms, 400ms each)
 *          card 1 rises already at full width — see INITIAL_OPEN
 *  180ms   card 1's label + scrim fade in
 *  550ms   idle height dip settles — cards sit at uneven heights
 *
 * ── EXPAND (trigger: click a card) ──
 *    0ms   clicked card widens 54 → 320px over 300ms, image held still
 *  100ms   every card normalizes to full height (dip 0.65 → 1.0)
 *  180ms   label + scrim fade in on the open card, y 10 → 0
 *
 * ── COLLAPSE (trigger: click the open card again) ──
 *    0ms   label + scrim fade out immediately
 *   60ms   widths and heights return to the idle storyboard
 * ───────────────────────────────────────────────────────── */

/* Default timing — every value is overridable from the DialKit panel */
const TIMING = {
  stripFade: 120, // strip container fades in
  cardsRise: 160, // cards rise into place
  cardStagger: 30, // ms between each card
  heightDip: 550, // uneven idle heights settle

  expandHeight: 100, // heights normalize after a click
  expandLabel: 180, // label + scrim fade in
  collapseReset: 60, // widths/heights return on collapse
};

/* Which card is already open when the strip mounts — null for none.
 * It enters at full width, so only its label animates in. */
const INITIAL_OPEN: number | null = 0;

/* Card geometry defaults */
const CARD = {
  collapsedWidth: 54, // px, resting card width
  expandedWidth: 320, // px, width of the open card
  gap: 9, // px between cards
  radius: 14, // px corner radius
  stripHeight: 300, // px, tallest a card can be
  idleDip: 0.65, // shortest idle card as a fraction of stripHeight
  riseOffset: 10, // px each card rises from on entrance
};

/* Easing curves — no springs, nothing overshoots */
const EASE = {
  snappy: [0.32, 0.72, 0, 1], // fast off the line, hard settle
  quart: [0.165, 0.84, 0.44, 1], // classic ease-out-quart
  standard: [0.22, 1, 0.36, 1], // softer tail
} as const;

/* Durations in ms — one per animated property group */
const MOTION = {
  width: 300, // card widens / narrows
  height: 290, // card height settles
  rise: 400, // entrance rise + fade
  label: 240, // label + scrim
  ease: "quart" as keyof typeof EASE,
};

/* DialKit returns a widened union; Motion only wants the object */
const tx = (t: unknown) => t as Transition;

/* Pexels delivery — cropped tall so the collapsed sliver keeps the subject */
const photo = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=1200&fit=crop`;

/* Gallery data — interiors, ordered light/dark for rhythm across the strip.
 * `tint` is the fallback color behind the image, `dip` its idle height
 * as a fraction of stripHeight. */
const GALLERY = [
  { label: "Biophilic", src: photo(18108651), tint: "#6d7a5e", dip: 1.0 },
  { label: "Heritage", src: photo(33803734), tint: "#a8757a", dip: 1 },
  { label: "Quiet Luxury", src: photo(28853343), tint: "#b9b2ac", dip: 1 },
  { label: "Edison Glow", src: photo(37930117), tint: "#17181a", dip: 1 },
  { label: "Sage Living", src: photo(31737841), tint: "#8a9683", dip: 1 },
  { label: "Velvet Accent", src: photo(12379606), tint: "#14653f", dip: 1.0 },
  { label: "Open Loft", src: photo(28456460), tint: "#e3e5e6", dip: 1 },
  { label: "Powder Room", src: photo(37859439), tint: "#3b1f1c", dip: 1 },
  { label: "Marble & Brass", src: photo(14613821), tint: "#cfd3d2", dip: 1 },
  { label: "Dining", src: photo(17947888), tint: "#6b2b33", dip: 1.0 },
];

export default function ExpandingImageGallery() {
  const [replayTrigger, setReplayTrigger] = useState(0);

  const params = useDialKit(
    "Expanding Gallery",
    {
      entrance: {
        stripFade: [TIMING.stripFade, 0, 1200],
        cardsRise: [TIMING.cardsRise, 0, 1600],
        cardStagger: [TIMING.cardStagger, 0, 200],
        heightDip: [TIMING.heightDip, 0, 2000],
        riseOffset: [CARD.riseOffset, 0, 120],
      },
      expand: {
        expandHeight: [TIMING.expandHeight, 0, 600],
        expandLabel: [TIMING.expandLabel, 0, 800],
        collapseReset: [TIMING.collapseReset, 0, 600],
      },
      size: {
        collapsedWidth: [CARD.collapsedWidth, 20, 120],
        expandedWidth: [CARD.expandedWidth, 140, 520],
        gap: [CARD.gap, 0, 40],
        radius: [CARD.radius, 0, 48],
        stripHeight: [CARD.stripHeight, 160, 480],
        idleDip: [CARD.idleDip, 0.4, 1],
      },
      motion: {
        widthMs: [MOTION.width, 80, 700],
        heightMs: [MOTION.height, 80, 700],
        riseMs: [MOTION.rise, 80, 900],
        labelMs: [MOTION.label, 60, 600],
        ease: {
          type: "select" as const,
          options: Object.keys(EASE),
          default: MOTION.ease,
        },
      },
      replay: { type: "action" as const, label: "Replay entrance" },
    },
    {
      onAction: (action: string) => {
        if (action === "replay") setReplayTrigger((n) => n + 1);
      },
    },
  );

  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  /* One integer drives the entrance: 0 idle → 1 strip → 2 cards → 3 dip */
  const [stage, setStage] = useState(0);

  /* Selection + its own stage: 0 none → 1 width → 2 height → 3 label.
   * `geomSelected` lags behind `selected` on collapse so the label can
   * clear before the widths snap back (TIMING.collapseReset). */
  const [selected, setSelected] = useState<number | null>(INITIAL_OPEN);
  const [geomSelected, setGeomSelected] = useState<number | null>(INITIAL_OPEN);
  const [openStage, setOpenStage] = useState(0);

  /* Entrance sequence */
  useEffect(() => {
    if (!isInView) {
      setStage(0);
      return;
    }
    if (reduceMotion) {
      setStage(3);
      return;
    }

    setStage(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage(1), params.entrance.stripFade));
    timers.push(setTimeout(() => setStage(2), params.entrance.cardsRise));
    timers.push(setTimeout(() => setStage(3), params.entrance.heightDip));
    return () => timers.forEach(clearTimeout);
  }, [
    isInView,
    reduceMotion,
    replayTrigger,
    params.entrance.stripFade,
    params.entrance.cardsRise,
    params.entrance.heightDip,
  ]);

  /* Expand / collapse sequence — re-runs whenever the selection changes */
  useEffect(() => {
    /* Collapse: label leaves now, geometry follows after collapseReset */
    if (selected === null) {
      setOpenStage(0);
      if (reduceMotion) {
        setGeomSelected(null);
        return;
      }
      const t = setTimeout(
        () => setGeomSelected(null),
        params.expand.collapseReset,
      );
      return () => clearTimeout(t);
    }

    /* Expand: geometry moves on the same frame as the click */
    setGeomSelected(selected);
    if (reduceMotion) {
      setOpenStage(3);
      return;
    }

    setOpenStage(1);
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setOpenStage(2), params.expand.expandHeight));
    timers.push(setTimeout(() => setOpenStage(3), params.expand.expandLabel));
    return () => timers.forEach(clearTimeout);
  }, [
    selected,
    reduceMotion,
    params.expand.expandHeight,
    params.expand.expandLabel,
    params.expand.collapseReset,
  ]);

  const toggle = (i: number) => setSelected((cur) => (cur === i ? null : i));

  const { collapsedWidth, expandedWidth, gap, radius, stripHeight, idleDip } =
    params.size;

  /* One curve, four durations — read once per render */
  const ease = EASE[params.motion.ease as keyof typeof EASE] ?? EASE.snappy;
  const T = {
    width: tx({ duration: params.motion.widthMs / 1000, ease }),
    height: tx({ duration: params.motion.heightMs / 1000, ease }),
    label: tx({ duration: params.motion.labelMs / 1000, ease }),
    rise: (delay: number) =>
      tx({ duration: params.motion.riseMs / 1000, ease, delay }),
  };

  return (
    <div
      ref={ref}
      className="flex w-full items-center justify-center px-4 py-16"
    >
      <motion.div
        role="tablist"
        aria-label="Photo collections"
        className="flex items-center"
        style={{ gap, height: stripHeight }}
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 1 ? 1 : 0 }}
        transition={T.rise(0)}
      >
        {GALLERY.map((item, i) => {
          const isWide = geomSelected === i; // drives width
          const isLabelled = selected === i && openStage >= 3; // drives label
          const isVisible = stage >= 2;

          /* Idle cards sit at uneven heights; a selection flattens them all */
          const flattened = geomSelected !== null && openStage >= 2;
          const heightFactor = flattened
            ? 1
            : stage >= 3
              ? idleDip + (1 - idleDip) * item.dip
              : item.dip;

          return (
            <motion.button
              key={item.label + i}
              type="button"
              role="tab"
              aria-selected={isWide}
              aria-label={item.label}
              onClick={() => toggle(i)}
              className="relative shrink-0 cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              style={{ borderRadius: radius, backgroundColor: item.tint }}
              initial={{
                opacity: 0,
                y: params.entrance.riseOffset,
                width: i === INITIAL_OPEN ? expandedWidth : collapsedWidth,
              }}
              animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : params.entrance.riseOffset,
                width: isWide ? expandedWidth : collapsedWidth,
                height: stripHeight * heightFactor,
              }}
              transition={{
                opacity: T.rise(riseDelay(i, params)),
                y: T.rise(riseDelay(i, params)),
                width: T.width,
                height: T.height,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt=""
                aria-hidden
                draggable={false}
                className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
                /* Fixed to the expanded size and centered: the card widens
                 * around a stationary image instead of rescaling it. */
                style={{ width: expandedWidth, height: stripHeight }}
              />

              {/* Scrim + label — only on the open card, last beat of the sequence */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent"
                initial={false}
                animate={{ opacity: isLabelled ? 1 : 0 }}
                transition={T.label}
              />
              <motion.span
                className="pointer-events-none absolute bottom-4 left-4 text-left text-lg font-medium whitespace-nowrap text-white"
                initial={false}
                animate={{
                  opacity: isLabelled ? 1 : 0,
                  y: isLabelled ? 0 : 10,
                }}
                transition={T.label}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

/* Per-card entrance delay in seconds, read from the tuned stagger */
function riseDelay(
  index: number,
  params: { entrance: { cardStagger: number } },
) {
  return (index * params.entrance.cardStagger) / 1000;
}
