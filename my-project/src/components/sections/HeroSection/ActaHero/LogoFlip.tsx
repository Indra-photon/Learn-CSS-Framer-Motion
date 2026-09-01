"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  usePageInView,
  useReducedMotion,
} from "motion/react";

export type Mark = { label: string; className: string };

/* One cell of the logo wall, cycling through the full set of wordmarks.
 *
 * Each cell starts at a different index, so at any moment all five names are on
 * screen at once — the wall keeps reading as a wall, it just re-deals itself.
 * The interval is also staggered per cell, so they flip in a ripple rather than
 * snapping over in unison.
 *
 * Motion is suspended when the wall scrolls out of view and when the tab is
 * backgrounded (usePageInView), so a wall far below the fold is not animating
 * against a hidden tab for the life of the session. */
export default function LogoFlip({
  marks,
  offset,
  interval = 2600,
}: {
  marks: Mark[];
  offset: number;
  interval?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);
  const isPageInView = usePageInView();
  const prefersReducedMotion = useReducedMotion();
  const play = isInView && isPageInView && !prefersReducedMotion;

  const [index, setIndex] = useState(offset);
  const base = useRef<number | null>(null);

  /* Every cell derives its index from one shared wall clock rather than from a
   * counter of its own. With per-cell counters the staggered starts drift the
   * cells out of phase and two of them eventually land on the same wordmark —
   * the duplicate "KPMG" bug. Reading the same clock keeps the offsets distinct
   * forever, while the staggered timer still gives the ripple. */
  useEffect(() => {
    if (!play) return;

    const step = () => {
      const now = Math.floor(Date.now() / interval);
      base.current ??= now;
      setIndex(offset + now - base.current);
    };

    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      step();
      timer = setInterval(step, interval);
    }, offset * 400);

    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [play, interval, offset]);

  const mark = marks[index % marks.length];

  return (
    <span ref={ref} className="relative inline-grid overflow-hidden">
      {/* Every mark, rendered invisibly on the same grid cell. The grid sizes to
          the widest and tallest of them, so the column never resizes mid-flip
          and all six cells share one width. */}
      {marks.map((m) => (
        <span
          key={m.label}
          aria-hidden="true"
          className={`invisible col-start-1 row-start-1 ${m.className}`}
        >
          {m.label}
        </span>
      ))}

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={mark.label}
          className={`col-start-1 row-start-1 flex items-center justify-center ${mark.className}`}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", duration: 0.5, bounce: 0 }}
        >
          {mark.label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
