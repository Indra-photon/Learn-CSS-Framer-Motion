"use client";

import { AnimatePresence, motion } from "motion/react";

interface ProofFigureProps {
  /** Hold the figure back until the storyboard reaches its cue. */
  shown: boolean;
  reduced: boolean;
  suffix: string;
  value: number;
}

/**
 * The proof number, swapped rather than spun.
 *
 * An odometer animates every digit on every change, which is a lot of motion
 * to spend on a figure that changes once — it reads as a gadget and pulls the
 * eye away from the headline, which is the thing that should own the entrance.
 *
 * This animates the numeral only: it rises a little and resolves out of a
 * blur, while the unit beside it never moves. The blur is doing the work the
 * odometer's spinning was doing — signalling that the value settled — without
 * the busyness, and because the suffix is outside the swap there is exactly
 * one moving part.
 */
export const ProofFigure = ({
  reduced,
  shown,
  suffix,
  value,
}: ProofFigureProps) => (
  <span className="inline-flex items-baseline tabular-nums">
    {/* `popLayout` takes the outgoing numeral out of flow, so the suffix does
        not shuffle sideways while the two overlap. */}
    <AnimatePresence initial mode="popLayout">
      {shown ? (
        <motion.span
          key={value}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          exit={
            reduced
              ? { opacity: 0 }
              : { filter: "blur(8px)", opacity: 0, y: -16 }
          }
          initial={
            reduced
              ? { opacity: 0 }
              : { filter: "blur(8px)", opacity: 0, y: 16 }
          }
          transition={{ bounce: 0, type: "spring", visualDuration: 0.45 }}
        >
          {value}
        </motion.span>
      ) : null}
    </AnimatePresence>

    {suffix}
  </span>
);
