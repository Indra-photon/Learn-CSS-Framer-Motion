"use client";

import { memo } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import StackIcon from "tech-stack-icons";

import { slotAt, type Reel, type RingConfig } from "./reel-geometry";

/** Every mark is square, so one number sizes it. */
const LOGO = 18;

interface ReelLabelProps {
  accent: string;
  cardHeight: number;
  cardWidth: number;
  config: RingConfig;
  gap: number;
  index: number;
  phi: MotionValue<number>;
  reel: Reel;
  tick: MotionValue<number>;
}

/**
 * The credit rail under the crest card.
 *
 * It spans the card's own width and pushes its two pieces to the ends: the
 * client's real mark on the left, the format on the right. That is what makes
 * it read as a caption *belonging to* the card rather than a label floating
 * near it — the rail's edges are the card's edges, so the eye reads one
 * object, not two.
 *
 * A logo does work a set name cannot. "Vercel" in the body face is a word;
 * the mark is recognised before it is read, which for a studio's client list
 * is the entire point.
 *
 * The type and the logo stay one size while the card behind them grows ten
 * times between the far side and the crest — they sit outside the card's
 * transform, so only the rail's *width* tracks the card. `land` gates the
 * whole thing, so only the reel being presented is ever credited.
 */
const ReelLabelImpl = ({
  accent,
  cardHeight,
  cardWidth,
  config,
  gap,
  index,
  phi,
  reel,
  tick,
}: ReelLabelProps) => {
  const slot = useTransform([phi, tick], ([p]: number[]) =>
    slotAt(p, index, config),
  );

  const land = useTransform(slot, (s) => s.land);
  // The card's left edge and width, both of which move as the card grows.
  const x = useTransform(slot, (s) => s.x - (cardWidth * s.scale) / 2);
  const width = useTransform(slot, (s) => cardWidth * s.scale);
  const y = useTransform(
    slot,
    (s) => s.y + (cardHeight * s.scale) / 2 + gap * s.veil,
  );
  // A few pixels of rise as it arrives, so the credit lands rather than fades.
  const settled = useTransform(
    [y, land],
    ([top, l]: number[]) => top + (1 - l) * 10,
  );

  if (!(reel.logo || reel.caption)) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-[1100] flex items-center justify-between gap-4 whitespace-nowrap"
      style={{ opacity: land, width, x, y: settled }}
    >
      {reel.logo ? (
        // `StackIcon` renders its own wrapper span and sizes the svg at
        // 100%/100% of it, so the size has to go on the component itself —
        // wrapping it and styling `> svg` matches nothing and collapses the
        // mark to zero. Every mark ships on a square 100x100 viewBox.
        //
        // `dark` is the variant drawn for dark stages: mostly white fills,
        // with the handful of marks that are unreadable in mono keeping their
        // brand colours.
        <StackIcon
          name={reel.logo}
          style={{ height: LOGO, width: LOGO }}
          variant="dark"
        />
      ) : (
        <span />
      )}

      {reel.caption ? (
        <span
          className="text-[11px] leading-none font-medium tracking-[0.14em] uppercase"
          style={{ color: reel.accent ?? accent }}
        >
          {reel.caption}
        </span>
      ) : null}
    </motion.div>
  );
};

export const ReelLabel = memo(ReelLabelImpl);
