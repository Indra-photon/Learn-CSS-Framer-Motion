"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import useMeasure from "react-use-measure";

type Stage = 1 | 2;

const CARD_W = 320;
const CARD_H = 560;

interface ImageFrame {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
  radius: number;
  zIndex: number;
}

const PHOTOS = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80",
];

// Stacked deck (idle) → even horizontal fan (expanded)
const frameConfig: Record<Stage, ImageFrame[]> = {
  1: [
    { top: 70, left: 46, width: 180, height: 240, rotate: -8, radius: 8, zIndex: 1 },
    { top: 56, left: 66, width: 190, height: 250, rotate: 0, radius: 8, zIndex: 2 },
    { top: 70, left: 94, width: 180, height: 240, rotate: 8, radius: 8, zIndex: 3 },
  ],
  2: [
    { top: 24, left: 20, width: 88, height: 150, rotate: 0, radius: 0, zIndex: 1 },
    { top: 24, left: 116, width: 88, height: 150, rotate: 0, radius: 0, zIndex: 1 },
    { top: 24, left: 212, width: 88, height: 150, rotate: 0, radius: 0, zIndex: 1 },
  ],
};

const ctaConfig: Record<
  Stage,
  { top: number; left: number; width: number; height: number; radius: number }
> = {
  1: { top: 268, left: 228, width: 60, height: 60, radius: 0 },
  2: { top: CARD_H - 76, left: 20, width: CARD_W - 40, height: 56, radius: 0 },
};

export default function HotelStackFanCard() {
  const [stage, setStage] = useState<Stage>(1);
  const expanded = stage === 2;
  const frames = frameConfig[stage];

  // Hidden mirrors of each stage's real content, laid out in normal flow so
  // their natural size can be measured instead of hardcoding CARD_W/CARD_H.
  const [stage1Ref, stage1Bounds] = useMeasure();
  const [stage2Ref, stage2Bounds] = useMeasure();

  const width = (expanded ? stage2Bounds.width : stage1Bounds.width) || CARD_W;
  const height = (expanded ? stage2Bounds.height : stage1Bounds.height) || CARD_H;

  // Stage 2's CTA is bottom-anchored (76px reserved: 56px button + 20px
  // margin) and full-width, so it tracks the measured height/width instead
  // of the fixed CARD_H/CARD_W the rest of the layout still assumes.
  const cta =
    stage === 1
      ? ctaConfig[1]
      : { ...ctaConfig[2], top: height - 76, width: width - 40 };

  const toggle = () => setStage((s) => (s === 1 ? 2 : 1));

  const morphTransition = {
    type: "spring" as const,
    duration: expanded ? 0.5 : 0.45,
    bounce: 0.25,
  };

  const ctaTransition = {
    type: "spring" as const,
    duration: expanded ? 0.35 : 0.25,
    bounce: 0.25,
  };

  const detailTransition = {
    duration: expanded ? 0.15 : 0.08,
    ease: [0.77, 0, 0.175, 1] as const,
  };

  return (
    <div className="relative select-none">
      {/* Hidden content mirrors — normal document flow, measured via
          useMeasure, so the card's width/height are derived from what's
          actually inside it rather than pre-built constants. */}
      <div
        ref={stage1Ref}
        aria-hidden
        className="invisible absolute top-0 left-0 -z-10"
        style={{ width: CARD_W }}
      >
        <div style={{ paddingTop: 56, paddingBottom: 24 }}>
          <div style={{ height: 250 }} />
          <div className="mt-5 flex justify-center gap-1.5">
            <span className="h-1.5 w-4" />
            <span className="h-1.5 w-1.5" />
            <span className="h-1.5 w-1.5" />
          </div>
        </div>
      </div>

      <div
        ref={stage2Ref}
        aria-hidden
        className="invisible absolute top-0 left-0 -z-10 px-5"
        style={{ width: CARD_W }}
      >
        <div style={{ height: 24 + 150 }} />
        <div style={{ marginTop: 16 }}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">
              Aurora Bay Resort
            </h3>
            <span className="shrink-0 px-3 py-1 text-sm font-medium">
              $189/night
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            A quiet stretch of coastline, three rooms curated for slow
            mornings and long dinners.
          </p>
          <div className="mt-3 flex gap-2">
            <span className="px-3 py-1 text-xs font-medium">
              Free Cancellation
            </span>
            <span className="px-3 py-1 text-xs font-medium">Ocean View</span>
          </div>
        </div>
        <div style={{ marginTop: 24, height: 56 }} />
        <div style={{ height: 20 }} />
      </div>

      <motion.div
        animate={{ width, height }}
        transition={{
          width: morphTransition,
          height: morphTransition,
        }}
        className="relative overflow-hidden rounded-[8px] bg-white shadow-xl"
      >
        {/* Photo deck → fan */}
        {PHOTOS.map((src, i) => {
          const f = frames[i];
          return (
            <motion.div
              key={src}
              animate={{
                top: f.top,
                left: f.left,
                width: f.width,
                height: f.height,
                rotate: f.rotate,
                borderRadius: f.radius,
              }}
              style={{ zIndex: f.zIndex }}
              transition={{
                ...morphTransition,
                delay: expanded ? i * 0.05 : (2 - i) * 0.05,
              }}
              className="absolute overflow-hidden shadow-md"
            >
              <img
                src={src}
                alt={`Room view ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </motion.div>
          );
        })}

        {/* Idle-only pagination dots under the deck */}
        <motion.div
          animate={{ opacity: expanded ? 0 : 1, y: expanded ? 8 : 0 }}
          transition={detailTransition}
          className="absolute left-1/2 top-[326px] flex -translate-x-1/2 items-center gap-1.5"
        >
          <span className="h-1.5 w-4 rounded-[4px] bg-[#0d1b26]" />
          <span className="h-1.5 w-1.5 rounded-[4px] bg-[#0d1b26]/30" />
          <span className="h-1.5 w-1.5 rounded-[4px] bg-[#0d1b26]/30" />
        </motion.div>

        {/* Detail content, revealed in stage 2 */}
        <div className="absolute inset-x-0 top-[190px] px-5">
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ ...detailTransition, delay: 0.15 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-[#0d1b26]">
                    Aurora Bay Resort
                  </h3>
                  <span className="shrink-0 rounded-[4px] bg-[#f0f0f0] px-3 py-1 text-sm font-medium text-[#0d1b26]">
                    $189/night
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-[#5b6570]">
                  A quiet stretch of coastline, three rooms curated for slow
                  mornings and long dinners.
                </p>

                <div className="mt-3 flex gap-2">
                  <span className="rounded-[4px] bg-[#f0f0f0] px-3 py-1 text-xs font-medium text-[#0d1b26]">
                    Free Cancellation
                  </span>
                  <span className="rounded-[4px] bg-[#f0f0f0] px-3 py-1 text-xs font-medium text-[#0d1b26]">
                    Ocean View
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA — gallery icon morphs into full-width Book Now */}
        <motion.button
          type="button"
          onClick={toggle}
          aria-label={expanded ? "Book now" : "View all rooms"}
          animate={{
            top: cta.top,
            left: cta.left,
            width: cta.width,
            height: cta.height,
            borderRadius: cta.radius,
          }}
          transition={ctaTransition}
          style={{ zIndex: 10 }}
          className="absolute flex items-center justify-center gap-2 bg-[#0d1b26] text-white shadow-lg"
        >
          <AnimatePresence mode="wait" initial={false}>
            {expanded ? (
              <motion.span
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold"
              >
                Book Now
              </motion.span>
            ) : (
              <motion.span
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="3" width="8" height="8" rx="2" stroke="white" strokeWidth={1.7} />
                  <rect x="13" y="3" width="8" height="8" rx="2" stroke="white" strokeWidth={1.7} />
                  <rect x="3" y="13" width="8" height="8" rx="2" stroke="white" strokeWidth={1.7} />
                  <rect x="13" y="13" width="8" height="8" rx="2" stroke="white" strokeWidth={1.7} />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
}
