"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

const CATEGORIES = [
  "Garden",
  "Toys",
  "Antiques",
  "Comics",
  "Sports",
  "Electronics",
  "Fashion",
  "Motors",
  "Collectibles",
  "Home & Garden",
  "Business & Industrial",
  "Health & Beauty",
];

const ROW_HEIGHT = 110;
const ACTIVE_ROW = 2;
const ARROW_OFFSET = 88;
const INTERVAL_MS = 1800;

export default function EbayCategoryTicker() {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(ACTIVE_ROW);
  const isResetting = useRef(false);

  const extended = [...CATEGORIES, ...CATEGORIES.slice(0, ACTIVE_ROW + 2)];
  const totalItems = CATEGORIES.length;

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next >= totalItems + ACTIVE_ROW) {
          isResetting.current = true;
          return ACTIVE_ROW;
        }
        isResetting.current = false;
        return next;
      });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [totalItems]);

  const yOffset = -(activeIndex - ACTIVE_ROW) * ROW_HEIGHT;

  const scrollTransition =
    shouldReduceMotion || isResetting.current
      ? { duration: 0 }
      : {
          type: "tween" as const,
          ease: [0.645, 0.045, 0.355, 1] as const,
          duration: 0.55,
        };

  const wordTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: "tween" as const,
        ease: [0.645, 0.045, 0.355, 1] as const,
        duration: 0.55,
      };

  return (
    <div className="box-border flex min-h-screen w-full flex-col overflow-hidden bg-[#F5C518] px-8 py-6 font-sans">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <span className="text-3xl font-bold tracking-tight text-[#1a0f00]">
          ebay
        </span>
        <span className="text-base font-semibold tracking-wide text-[#1a0f00]">
          Things.People.Love.
        </span>
      </div>

      {/* Main content grid */}
      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* Left: Ticker area */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{ height: ROW_HEIGHT * 5 }}
        >
          {/* Arrow — absolutely fixed at the active row, never moves */}
          <div
            className="pointer-events-none absolute left-0 z-10 flex items-center"
            style={{
              top: ACTIVE_ROW * ROW_HEIGHT,
              height: ROW_HEIGHT,
              width: ARROW_OFFSET,
            }}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={64}
              color="#1a0f00"
              strokeWidth={2}
            />
          </div>

          {/* Scrolling word list */}
          <motion.div
            animate={{ y: yOffset }}
            transition={scrollTransition}
            className="absolute top-0 left-0 w-full"
            aria-live="polite"
            aria-atomic="true"
          >
            {extended.map((category, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={`${category}-${i}`}
                  className="flex items-center overflow-visible"
                  style={{ height: ROW_HEIGHT }}
                  aria-hidden={!isActive}
                >
                  {/*
                    Inactive words: x=0, sit directly under the arrow.
                    Active word: slides right by ARROW_OFFSET to clear the arrow.
                  */}
                  <motion.span
                    animate={{
                      x: isActive ? ARROW_OFFSET : 0,
                      color: isActive ? "#1a0f00" : "#b38a00",
                      opacity: isActive ? 1 : 0.58,
                      fontSize: isActive ? 72 : 64,
                      fontWeight: isActive ? 800 : 500,
                    }}
                    transition={wordTransition}
                    className="block leading-none tracking-tight whitespace-nowrap"
                  >
                    {category}
                  </motion.span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
