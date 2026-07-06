"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const members = [
  {
    name: "Sarah Chen",
    role: "Creative Director",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&auto=format&fit=crop&q=80",
    imageW: 280,
    imageH: 400,
    imageRadius: 16,
    rotate: -4,
    fontSize: 160,
  },
  {
    name: "James Park",
    role: "Lead Developer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80",
    imageW: 460,
    imageH: 300,
    imageRadius: 12,
    rotate: 3,
    fontSize: 160,
  },
  {
    name: "Mia Torres",
    role: "Product Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=700&auto=format&fit=crop&q=80",
    imageW: 240,
    imageH: 460,
    imageRadius: 120,
    rotate: -6,
    fontSize: 160,
  },
];

const intro = {
  imageW: 60,
  imageH: 90,
  imageRadius: 30,
  rotate: 0,
  fontSize: 90,
};

const morph = {
  ease: [0.77, 0, 0.175, 1] as const,
  duration: 0.7,
};

export default function StudioTeam() {
  const [active, setActive] = useState<number>(-1);

  const isIntro = active === -1;
  const cfg = isIntro ? intro : members[active];

  const advance = () =>
    setActive((a) => (a >= members.length - 1 ? -1 : a + 1));

  return (
    <div
      onClick={advance}
      className="relative flex min-h-screen cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0e0e0d] select-none"
    >
      <style>{`
        :root {
          --resize-dur: 700ms;
          --resize-ease: cubic-bezier(0.77, 0, 0.175, 1);
        }
        .t-resize {
          transition:
            width  var(--resize-dur) var(--resize-ease),
            height var(--resize-dur) var(--resize-ease);
          will-change: width, height;
        }
        @media (prefers-reduced-motion: reduce) {
          .t-resize { transition: none !important; }
        }
      `}</style>

      {/* Studio label */}
      <p className="fixed top-10 left-1/2 -translate-x-1/2 text-xs tracking-[0.25em] text-white/25 uppercase">
        Studio — About
      </p>

      {/* T [image] EAM */}
      <div
        className="grid w-full items-center px-10"
        style={{ gridTemplateColumns: "1fr auto 1fr", gap: "0 1.25rem" }}
      >
        {/* T */}
        <motion.span
          animate={{ fontSize: cfg.fontSize }}
          transition={{ ...morph, delay: 0.04 }}
          className="text-right font-black leading-none tracking-tighter text-white font-sans"
        >
          T
        </motion.span>

        {/* Image container — t-resize owns size, Motion owns radius + rotate */}
        <motion.div
          animate={{ borderRadius: cfg.imageRadius, rotate: cfg.rotate }}
          style={{ width: cfg.imageW, height: cfg.imageH }}
          transition={morph}
          className="t-resize relative shrink-0 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={isIntro ? "intro" : active}
              src={isIntro ? members[0].image : members[active].image}
              alt={isIntro ? "team" : members[active].name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 block h-full w-full object-cover"
            />
          </AnimatePresence>
        </motion.div>

        {/* EAM */}
        <motion.span
          animate={{ fontSize: cfg.fontSize }}
          transition={{ ...morph, delay: 0.04 }}
          className="text-left font-black leading-none tracking-tighter text-white font-sans"
        >
          EAM
        </motion.span>
      </div>

      {/* Member info */}
      <div className="mt-10 flex h-16 flex-col items-center justify-center gap-1.5">
        <AnimatePresence mode="wait">
          {!isIntro ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5"
            >
              <p className="text-xl font-semibold tracking-tight text-white">
                {members[active].name}
              </p>
              <p className="text-xs tracking-[0.2em] text-white/35 uppercase">
                {members[active].role}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-xs tracking-[0.2em] text-white/25 uppercase"
            >
              Click to meet the team
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Member counter */}
      <AnimatePresence>
        {!isIntro && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-white/25 uppercase"
          >
            0{active + 1} — 0{members.length}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Member dots */}
      <div className="fixed bottom-10 right-10 flex gap-2">
        {members.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: i === active ? "#ffffff" : "rgba(255,255,255,0.15)",
              scale: i === active ? 1.3 : 1,
            }}
            className="h-[6px] w-[6px] rounded-full"
            transition={{ duration: 0.25 }}
          />
        ))}
      </div>
    </div>
  );
}
