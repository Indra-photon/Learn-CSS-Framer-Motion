"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Add01Icon,
  UserMultiple02Icon,
  Share08Icon,
  Cancel01Icon,
  Github01Icon,
  NewTwitterIcon,
  InstagramIcon,
  Linkedin01Icon,
  ThreadsIcon,
  Mail01Icon,
  SnapchatIcon,
} from "@hugeicons/core-free-icons";

type State = "initial" | "expanded" | "profile" | "social";

const SOCIAL = [
  { icon: Github01Icon, label: "GitHub" },
  { icon: NewTwitterIcon, label: "X" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: Linkedin01Icon, label: "LinkedIn" },
  { icon: ThreadsIcon, label: "Threads" },
  { icon: Mail01Icon, label: "Email" },
  { icon: SnapchatIcon, label: "Snapchat" },
];

const spring = { type: "spring" as const, duration: 0.5, bounce: 0.1 };

// Concentric border radius: outer pill = 28px, inner circles = 9999 (full)
const PILL_RADIUS = 28;

export default function DynamicPortfolio01() {
  const [view, setView] = useState<State>("initial");
  const noMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5]">
      <AnimatePresence mode="popLayout" initial={false}>
        {view === "initial" && (
          <motion.div
            key="initial"
            layoutId="dp-pill"
            transition={spring}
            className="flex items-center gap-2.5 bg-black p-2"
            style={{ borderRadius: PILL_RADIUS }}
          >
            {/* Avatar — morphs to back button in social state */}
            <motion.div
              layoutId="dp-avatar"
              transition={spring}
              className="relative h-10 w-10 flex-shrink-0 overflow-hidden bg-stone-200"
              style={{ borderRadius: 9999 }}
            >
              <img
                src="/Indranil.png"
                alt="Indranil avatar"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Green + button — morphs to orange contact button in expanded state */}
            <motion.button
              layoutId="dp-primary-btn"
              transition={spring}
              onClick={() => setView("expanded")}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center bg-[#22c55e]"
              style={{ borderRadius: 9999 }}
              whileTap={noMotion ? {} : { scale: 0.93 }}
            >
              <motion.span
                initial={noMotion ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.15 }}
              >
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={22}
                  color="white"
                  strokeWidth={2.5}
                />
              </motion.span>
            </motion.button>
          </motion.div>
        )}

        {view === "expanded" && (
          <motion.div
            key="expanded"
            layoutId="dp-pill"
            transition={spring}
            className="flex items-center gap-2.5 bg-black px-2.5 py-2"
            style={{ borderRadius: PILL_RADIUS }}
          >
            {/* Avatar */}
            <motion.div
              layoutId="dp-avatar"
              transition={spring}
              className="h-10 w-10 flex-shrink-0 overflow-hidden bg-stone-200"
              style={{ borderRadius: 9999 }}
            >
              <img
                src="/Indranil.png"
                alt="Indranil avatar"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Name text */}
            <motion.div
              initial={
                noMotion ? false : { opacity: 0, filter: "blur(5px)", x: -10 }
              }
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              exit={{ opacity: 0, filter: "blur(5px)", x: -10 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className="flex flex-col pr-1"
            >
              <span className="text-xs leading-none font-medium text-white/50">
                Hello, I'm
              </span>
              <span className="text-[22px] leading-tight font-semibold tracking-tight text-white">
                Indranil
              </span>
            </motion.div>

            {/* Orange contact button — morphs from green +, morphs to X in profile state */}
            <motion.button
              layoutId="dp-primary-btn"
              transition={spring}
              onClick={() => setView("profile")}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center bg-[#f97316]"
              style={{ borderRadius: 9999 }}
              whileTap={noMotion ? {} : { scale: 0.93 }}
            >
              <motion.span
                initial={noMotion ? false : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.15 }}
              >
                <HugeiconsIcon
                  icon={UserMultiple02Icon}
                  size={22}
                  color="white"
                  strokeWidth={2}
                />
              </motion.span>
            </motion.button>

            {/* Blue share button — fades in */}
            <motion.button
              initial={
                noMotion
                  ? false
                  : { opacity: 0, scale: 0.5, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{
                delay: 0.25,
                duration: 0.2,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              onClick={() => setView("social")}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center bg-[#3b82f6]"
              style={{ borderRadius: 9999 }}
              whileTap={noMotion ? {} : { scale: 0.93 }}
            >
              <HugeiconsIcon
                icon={Share08Icon}
                size={22}
                color="white"
                strokeWidth={2}
              />
            </motion.button>
          </motion.div>
        )}

        {view === "profile" && (
          <motion.div
            key="profile"
            layoutId="dp-pill"
            transition={spring}
            className="flex items-center gap-3 bg-black px-2.5 py-2.5"
            style={{ borderRadius: PILL_RADIUS }}
          >
            {/* Avatar — stays in place */}
            <motion.div
              layoutId="dp-avatar"
              transition={spring}
              className="h-10 w-10 flex-shrink-0 self-start overflow-hidden bg-stone-200"
              style={{ borderRadius: 9999 }}
            >
              <img
                src="/Indranil.png"
                alt="Indranil avatar"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Description content */}
            <motion.div
              initial={
                noMotion ? false : { opacity: 0, filter: "blur(6px)", y: 6 }
              }
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(6px)", y: 6 }}
              transition={{ delay: 0.18, duration: 0.22 }}
              className="flex flex-col gap-1 py-0.5"
            >
              <span className="text-sm leading-none font-bold text-white">
                Indranil Maiti
              </span>
              <span className="text-xs font-medium text-white/70">
                Full Stack Developer
              </span>
              <span className="text-[11px] leading-snug text-white/45">
                React · Next.js · Node.js · TypeScript
              </span>
              <span className="text-[11px] leading-snug text-white/45">
                Building scalable web & mobile products
              </span>
              <span className="text-[11px] leading-snug text-white/45">
                Open to collaborations & freelance
              </span>
            </motion.div>

            {/* X close button — morphs from orange contact button */}
            <motion.button
              layoutId="dp-primary-btn"
              transition={spring}
              onClick={() => setView("expanded")}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center self-start bg-white/12"
              style={{ borderRadius: 9999 }}
              whileTap={noMotion ? {} : { scale: 0.93 }}
            >
              <motion.span
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.22, duration: 0.18 }}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={18}
                  color="white"
                  strokeWidth={2}
                />
              </motion.span>
            </motion.button>
          </motion.div>
        )}

        {view === "social" && (
          <motion.div
            key="social"
            layoutId="dp-pill"
            transition={spring}
            className="flex items-center gap-1 bg-black px-2.5 py-2"
            style={{ borderRadius: PILL_RADIUS }}
          >
            {/* Back button — avatar morphs into this */}
            <motion.button
              layoutId="dp-avatar"
              transition={spring}
              onClick={() => setView("expanded")}
              className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center bg-white/15"
              style={{ borderRadius: 9999 }}
              whileTap={noMotion ? {} : { scale: 0.93 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.2 }}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={20}
                  color="white"
                  strokeWidth={2}
                />
              </motion.span>
            </motion.button>

            {/* Social icons — stagger in */}
            {SOCIAL.map(({ icon, label }, i) => (
              <motion.button
                key={label}
                initial={
                  noMotion
                    ? false
                    : { opacity: 0, scale: 0.4, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.4, filter: "blur(6px)" }}
                transition={{
                  delay: i * 0.04 + 0.08,
                  duration: 0.22,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center"
                whileTap={noMotion ? {} : { scale: 0.85 }}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={22}
                  color="white"
                  strokeWidth={1.8}
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
