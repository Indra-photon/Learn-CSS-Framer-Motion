"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTransitionConfig } from "./TransitionConfigContext";

interface ScrollTeletypeClockProps {
  /** Advance the clock by one minute on an interval so ticks happen constantly */
  demo?: boolean;
  /** Milliseconds between demo ticks */
  demoIntervalMs?: number;
  /** 12-hour format instead of 24-hour */
  hour12?: boolean;
  className?: string;
}

function formatDigits(date: Date, hour12: boolean): string[] {
  let hours = date.getHours();
  if (hour12) {
    hours = hours % 12 || 12;
  }
  const hh = String(hours).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return [...hh, ...mm];
}

/** Single odometer window: old digit scrolls up and out, new digit scrolls up from below */
function ScrollDigit({ digit }: { digit: string }) {
  const reduceMotion = useReducedMotion();
  const { transition } = useTransitionConfig();

  return (
    <div className="relative h-24 w-16 overflow-hidden rounded-lg bg-neutral-900 text-6xl sm:h-28 sm:w-20 sm:text-7xl">
      {reduceMotion ? (
        <div className="absolute inset-0 flex items-center justify-center font-bold tabular-nums text-neutral-100">
          {digit}
        </div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={digit}
            className="absolute inset-0 flex items-center justify-center font-bold tabular-nums text-neutral-100"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={transition}
          >
            {digit}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function ScrollTeletypeClock({
  demo = false,
  demoIntervalMs = 3000,
  hour12 = false,
  className = "",
}: ScrollTeletypeClockProps) {
  // Starts at 00:00 (matches the server render), then ticks to the real time
  // on mount — doubles as an entrance animation.
  const [digits, setDigits] = useState(["0", "0", "0", "0"]);
  const demoOffsetRef = useRef(0);
  const { flipSignal } = useTransitionConfig();

  // "Trigger flip" from the control bar force-advances one minute so the
  // current transition settings can be previewed on demand.
  const isFirstFlipSignal = useRef(true);
  useEffect(() => {
    if (isFirstFlipSignal.current) {
      isFirstFlipSignal.current = false;
      return;
    }
    demoOffsetRef.current += 1;
    const now = new Date();
    now.setMinutes(now.getMinutes() + demoOffsetRef.current);
    setDigits(formatDigits(now, hour12));
  }, [flipSignal, hour12]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + demoOffsetRef.current);
      setDigits(formatDigits(now, hour12));
    };
    update();

    const id = setInterval(
      () => {
        if (demo) demoOffsetRef.current += 1;
        update();
      },
      demo ? demoIntervalMs : 1000,
    );
    return () => clearInterval(id);
  }, [demo, demoIntervalMs, hour12]);

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="flex gap-1.5">
        <ScrollDigit digit={digits[0]} />
        <ScrollDigit digit={digits[1]} />
      </div>
      <div className="flex gap-1.5">
        <ScrollDigit digit={digits[2]} />
        <ScrollDigit digit={digits[3]} />
      </div>
    </div>
  );
}
