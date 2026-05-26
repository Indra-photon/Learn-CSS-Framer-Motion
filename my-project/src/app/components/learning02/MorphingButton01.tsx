"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeftDoubleIcon,
  FolderAddIcon,
  SmartPhoneLandscapeIcon,
  LaptopIcon,
  TelevisionTableIcon,
} from "@hugeicons/core-free-icons";

const OPTIONS = [
  { label: "iOS", icon: SmartPhoneLandscapeIcon },
  { label: "macOS", icon: LaptopIcon },
  { label: "tvOS", icon: TelevisionTableIcon },
];

const springConfig = {
  type: "spring" as const,
  duration: 0.45,
  bounce: 0.1,
};

export default function MorphingButton01() {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <AnimatePresence mode="popLayout" initial={false}>
        {!isOpen ? (
          <motion.button
            key="closed"
            layoutId="morph-pill"
            onClick={() => setIsOpen(true)}
            transition={springConfig}
            className="flex cursor-pointer items-center gap-2.5 rounded-full bg-stone-100 px-6 py-3.5 select-none"
            style={{ borderRadius: 9999 }}
          >
            <motion.span
              initial={
                shouldReduceMotion ? false : { opacity: 0, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <HugeiconsIcon
                icon={FolderAddIcon}
                size={20}
                color="currentColor"
                strokeWidth={1.95}
                className="text-stone-700"
              />
              <span className="text-base font-medium text-stone-700">
                New Project
              </span>
            </motion.span>
          </motion.button>
        ) : (
          <motion.div
            key="open"
            className="flex items-center gap-2.5"
            initial={false}
          >
            {/* Back button — shares layoutId with "New Project" pill */}
            <motion.button
              layoutId="morph-pill"
              onClick={() => setIsOpen(false)}
              transition={springConfig}
              className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-stone-100 select-none"
              style={{ borderRadius: 9999 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            >
              <motion.span
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.15 }}
              >
                <HugeiconsIcon
                  icon={ArrowLeftDoubleIcon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.95}
                  className="text-stone-700"
                />
              </motion.span>
            </motion.button>

            {/* Option buttons stagger in */}
            {OPTIONS.map(({ label, icon }, i) => (
              <motion.button
                key={label}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 0.85, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                transition={{
                  duration: 0.2,
                  delay: i * 0.05 + 0.08,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-stone-100 px-5 py-3.5 select-none"
                style={{ borderRadius: 9999 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.95}
                  className="text-stone-700"
                />
                <span className="text-base font-medium whitespace-nowrap text-stone-700">
                  {label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
