"use client";

/* The ember art card. Decorative, so the whole panel is aria-hidden: the
 * step caption it shows is already announced by the form's status region.
 *
 * The butterfly is feedback, not wallpaper. It fills in as the user gets
 * closer (35% → 70% → 100%), trembles while the request runs and takes
 * flight on success. Under reduced motion it only ever changes opacity, and
 * it stays put on success.
 *
 * Sizing: the type is set in container units so all 122 columns always fit.
 * Geist Mono advances 0.6em per glyph, so 122 columns are 73.2em wide and
 * the font size is 100cqi / 73.2. Ligatures are off: Geist Mono fuses runs
 * of `#`, which punches holes in the art. */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";

import { RUNS, type GlyphClass } from "./butterfly";
import { DURATION, EASE_OUT, ERROR_CAPTION, PANEL, type Step } from "./content";

const GLYPH: Record<GlyphClass, string> = {
  solid: "text-[#ff5f1f]",
  soft: "text-[#ffb58f]",
  dim: "text-[#ede6d8]/85",
  faint: "text-[#ede6d8]/55",
  space: "",
};

const tMeta =
  "font-(family-name:--font-geist-mono) text-[12px] leading-4 tracking-[0.06em] uppercase tabular-nums";
/* The step caption is the panel's live line, so it is a size up and
 * brighter than the static meta text around it. */
const tState =
  "block font-(family-name:--font-geist-mono) text-[14px] leading-5 tracking-[0.04em] whitespace-nowrap uppercase text-(--fw-panel-fg-strong)";

/* Rendered once: the art never changes, only the transform around it. */
const ART = RUNS.map((runs, i) => (
  <span key={i}>
    {runs.map((run, j) =>
      run.glyph === "space" ? (
        run.text
      ) : (
        <span key={j} className={GLYPH[run.glyph]}>
          {run.text}
        </span>
      ),
    )}
    {"\n"}
  </span>
));

function choreography(
  step: Step,
  reduce: boolean,
): { animate: TargetAndTransition; transition: Transition } {
  const opacity = PANEL[step].opacity;
  const settle: Transition = { duration: DURATION.enter, ease: EASE_OUT };

  // Reduced motion: every change is instant and the butterfly never moves.
  if (reduce) {
    return {
      animate: { opacity, scaleX: 1, y: 0 },
      transition: { duration: 0 },
    };
  }

  if (step !== "signing" && step !== "success") {
    return { animate: { opacity, scaleX: 1, y: 0 }, transition: settle };
  }

  if (step === "signing") {
    // Wings tremble, 1 ↔ 0.96 every 300ms, until the request resolves.
    return {
      animate: { opacity, scaleX: [1, 0.96, 1], y: 0 },
      transition: {
        opacity: settle,
        scaleX: { duration: 0.6, ease: "easeInOut", repeat: Infinity },
      },
    };
  }

  // Success: three wing beats while rising 260px, fading over the last half.
  // The rise is the one deliberate ease-in in the flow: a take-off should
  // gather speed as it leaves, and it plays once per sign-in.
  return {
    animate: {
      scaleX: [1, 0.72, 1, 0.72, 1, 0.72, 1],
      y: [0, -260],
      opacity: [1, 1, 0],
    },
    transition: {
      scaleX: { duration: 0.9, ease: "easeInOut" },
      y: { duration: 1, delay: 0.1, ease: "easeIn" },
      opacity: {
        duration: DURATION.flight,
        times: [0, 0.55, 1],
        ease: EASE_OUT,
      },
    },
  };
}

export function ButterflyPanel({
  step,
  hasError,
}: {
  step: Step;
  hasError: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const { animate, transition } = choreography(step, reduce);
  const caption = hasError ? ERROR_CAPTION : PANEL[step].caption;

  const fade = (d: number) =>
    reduce ? { duration: 0 } : { duration: d, ease: EASE_OUT };

  /* Rows share the page's horizon lines: py-8 matches the left column's
   * lg:py-8, the top row is 24px tall like the header and the bottom row
   * 16px like the footer, so both centre on the same y as their neighbours. */
  return (
    <aside
      aria-hidden
      className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-[40%] max-w-[744px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl bg-(--fw-panel) px-10 py-8 text-(--fw-panel-fg) lg:flex"
    >
      <div className="flex h-6 items-center">
        <div className="flex items-baseline gap-3">
          <span className={tMeta}>[ {PANEL[step].pager} ]</span>
          <span className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={caption}
                className={tState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: fade(DURATION.exit) }}
                transition={fade(DURATION.enter)}
              >
                {caption}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>

      <div className="@container w-full">
        <motion.pre
          className="m-0 origin-center font-(family-name:--font-geist-mono) text-[calc(100cqi/73.2)] leading-[1.283] whitespace-pre [font-variant-ligatures:none]"
          initial={false}
          animate={animate}
          transition={transition}
        >
          {ART}
        </motion.pre>
      </div>

      <div className={`flex h-4 items-center ${tMeta}`}>
        Forms that take flight
      </div>
    </aside>
  );
}
