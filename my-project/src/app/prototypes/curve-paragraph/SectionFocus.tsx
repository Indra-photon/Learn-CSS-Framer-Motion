"use client";

import React, { useMemo, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { GlyphLine } from "../curve-type/GlyphLine";
import { transversePlacer, type CurveFactory } from "../curve-type/engine";
import { PARAGRAPH } from "./copy";

/* ── FOCUS ────────────────────────────────────────────────────────────
 * Depth of field for reading. One line is sharp and dead level; the
 * further a line sits from it the more it blurs, dims and bows away —
 * as if the paragraph were a physical page and only the line under your
 * eye were in the plane of focus. Scrolling walks the focal line down
 * the block, so the effect tracks your reading rather than the viewport.
 *
 * This is the only variant in the round where motion carries FUNCTION
 * rather than character: it tells you where you are in the text. That
 * also makes it the one with the sharpest accessibility edge — blur on
 * body copy is hostile if it is not gentle, so out-of-focus lines stay
 * legible at 2.4px and the whole thing collapses to nothing under
 * reduced motion.
 *
 * Blur is applied PER LINE, not per glyph: six filtered elements instead
 * of three hundred and forty. */

const MAX_BLUR = 2.4; // px
const BOW = 13; // px of bend at full defocus
const DIM = 0.42;

export function SectionFocus() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [focus, setFocus] = useState(1.2);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* The focal line walks from the top of the block to the bottom across
   * the middle 60% of the pass. */
  const focal = useSpring(
    useTransform(scrollYProgress, [0.2, 0.8], [-0.6, PARAGRAPH.length - 0.4], {
      clamp: true,
    }),
    { stiffness: 140, damping: 26 },
  );

  useMotionValueEvent(focal, "change", setFocus);

  return (
    <section className="cp-section" ref={ref}>
      <p className="cp-eyebrow">
        <span className="cp-dot" /> Focus · depth of field
      </p>

      <div className="cp-column">
        {PARAGRAPH.map((line, i) => {
          const distance = reduce ? 0 : Math.abs(i - focus);
          const defocus = Math.min(1, distance / 2.1);

          return (
            <FocusLine
              key={i}
              text={line}
              defocus={defocus}
              focal={focal}
              index={i}
            />
          );
        })}
      </div>

      <p className="cp-note">
        Six filtered elements, not three hundred and forty — the blur sits
        on the line, never on the glyph. Out-of-focus copy stays readable
        at 2.4px, and reduced motion removes it entirely.
      </p>
    </section>
  );
}

function FocusLine({
  text,
  defocus,
  focal,
  index,
}: {
  text: string;
  defocus: number;
  focal: MotionValue<number>;
  index: number;
}) {
  const curve: CurveFactory = useMemo(
    () => (_, half) => {
      const distance = index - focal.get();
      const away = Math.min(1, Math.abs(distance) / 2.1);
      /* Defocused lines bow away from the focal plane, and the direction
       * of the bow says which side of focus they are on. */
      return transversePlacer(
        (x) => Math.cos((x / half) * Math.PI * 0.5) * BOW * away * Math.sign(distance || 1),
        half,
        0,
      );
    },
    [index, focal],
  );

  return (
    <p
      className="cp-line cp-line--focus"
      style={{
        filter: defocus > 0.01 ? `blur(${(defocus * MAX_BLUR).toFixed(2)}px)` : undefined,
        opacity: 1 - defocus * DIM,
      }}
    >
      <GlyphLine text={text} value={focal} curve={curve} />
    </p>
  );
}
