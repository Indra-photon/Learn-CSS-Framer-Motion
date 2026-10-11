"use client";

import { memo } from "react";
import Image from "next/image";
import { motion, useTransform, type MotionValue } from "motion/react";

import {
  parseHex,
  slotAt,
  stageScrim,
  type Reel,
  type RingConfig,
} from "./reel-geometry";

/**
 * Gradient shown under a card while its artwork is still decoding.
 *
 * A card whose photo has not arrived would otherwise be a hole on the ring.
 * A tint keeps it reading as a card, and the photo covers it the moment it
 * lands.
 */
const CARD_TINTS = [
  ["#f2743a", "#b4341a"],
  ["#3aa0ff", "#1b4fd8"],
  ["#7c5cff", "#4421c4"],
  ["#1fae6b", "#0b6b45"],
  ["#fbd24e", "#c07a08"],
  ["#f2546d", "#a01440"],
];

const tintFor = (index: number): string => {
  const [from, to] = CARD_TINTS[index % CARD_TINTS.length];

  return `linear-gradient(135deg, ${from}, ${to})`;
};

interface ReelCardProps {
  cardHeight: number;
  cardRadius: number;
  cardWidth: number;
  config: RingConfig;
  /** Which reel this card *is*. Fixed for the component's whole life. */
  index: number;
  ink: string;
  /** Scroll position, in reel units. The only thing that drives the card. */
  phi: MotionValue<number>;
  reel: Reel;
  showDetails: boolean;
  stage: string;
  /** Bumped by the parent when the layout changes, so a paused ring still re-lays-out. */
  tick: MotionValue<number>;
}

/**
 * One card on the ring — one card per *reel*, not per ring position.
 *
 * That is the whole reason this does not flicker. The element is welded to
 * its reel, so `src` is written once at mount and never touched again; what
 * moves is the card. Every visual property is a motion value derived from
 * `phi`, so after mounting there is no React work here at all, and `memo`
 * keeps an unrelated parent render from reaching the image.
 *
 * `slotAt` runs once per frame per card and the projections read off that
 * one result.
 */
const ReelCardImpl = ({
  cardHeight,
  cardRadius,
  cardWidth,
  config,
  index,
  ink,
  phi,
  reel,
  showDetails,
  stage,
  tick,
}: ReelCardProps) => {
  const slot = useTransform([phi, tick], ([p]: number[]) =>
    slotAt(p, index, config),
  );

  // Centre the card on its point. A transform beats `left`/`top` here: the
  // whole ring then lives on the compositor and never touches layout.
  const x = useTransform(slot, (s) => s.x - cardWidth / 2);
  const y = useTransform(slot, (s) => s.y - cardHeight / 2);
  // Scale rides the transform so the card and its shadow grow together: a
  // crest card casts the bigger, softer shadow it should.
  const scale = useTransform(slot, (s) => s.scale);
  const zIndex = useTransform(slot, (s) => s.z);
  // Always a blur, never `none`. Toggling between them creates and destroys
  // a compositing layer, and the crest card crosses that threshold on every
  // single beat — which is a flash of its own, independent of the images.
  const filter = useTransform(
    slot,
    (s) => `blur(${(s.blur < config.blurFloor ? 0 : s.blur).toFixed(2)}px)`,
  );
  const land = useTransform(slot, (s) => s.land);

  // Opaque whenever the stage can be blended toward; see `stageScrim`.
  const readable = parseHex(stage) !== null;
  const scrim = useTransform(slot, (s) => stageScrim(stage, s.opacity));
  const opacity = useTransform(slot, (s) => (readable ? 1 : s.opacity));

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0"
      style={{
        filter,
        height: cardHeight,
        opacity,
        scale,
        transformOrigin: "center center",
        width: cardWidth,
        x,
        y,
        zIndex,
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: tintFor(index),
          borderRadius: cardRadius,
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.55)",
        }}
      >
        {/* A fixed intrinsic size, not `fill` + `sizes`. With `sizes` derived
            from the measured card, a resize rewrites the `srcset` and the
            browser re-picks a candidate — which is a fetch, a decode and a
            flash. A constant 640x360 resolves to one URL for the life of the
            page. */}
        <Image
          alt={reel.alt ?? reel.label ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
          height={360}
          loading="eager"
          src={reel.src}
          width={640}
        />

        {/* The crest chrome. Gated on `land`, so only the reel being
            presented is ever marked as playable. */}
        {showDetails ? (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0))",
              opacity: land,
            }}
          >
            <span
              className="grid size-8 place-items-center rounded-full backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <svg
                aria-hidden
                fill={ink}
                height="10"
                viewBox="0 0 8 10"
                width="8"
              >
                <path d="M0 0.6a.6.6 0 0 1 .92-.5l6.3 4.1a.6.6 0 0 1 0 1l-6.3 4.1A.6.6 0 0 1 0 8.8V.6Z" />
              </svg>
            </span>

            {reel.duration ? (
              <span
                className="rounded-sm px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-tight tabular-nums"
                style={{ background: "rgba(0,0,0,0.5)", color: ink }}
              >
                {reel.duration}
              </span>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      {/* A scrim of the stage colour, not element opacity. Keeps the card
          opaque so it occludes its neighbours properly. */}
      {readable ? (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: scrim, borderRadius: cardRadius }}
        />
      ) : null}
    </motion.div>
  );
};

export const ReelCard = memo(ReelCardImpl);
