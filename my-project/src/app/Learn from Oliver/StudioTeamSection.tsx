"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const members = [
  {
    name: "Sarah Chen",
    role: "Creative Director",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&auto=format&fit=crop&q=80",
    imageW: 220,
    imageH: 320,
    imageRadius: 12,
    rotate: -4,
  },
  {
    name: "James Park",
    role: "Lead Developer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80",
    imageW: 360,
    imageH: 240,
    imageRadius: 10,
    rotate: 3,
  },
  {
    name: "Mia Torres",
    role: "Product Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=700&auto=format&fit=crop&q=80",
    imageW: 200,
    imageH: 360,
    imageRadius: 100,
    rotate: -5,
  },
];

const FONT_SIZE = 118;

const morph = {
  ease: [0.77, 0, 0.175, 1] as const,
  duration: 0.65,
};

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const styles: Record<string, string> = {
    tl: "top-5 left-5 border-t border-l",
    tr: "top-5 right-5 border-t border-r",
    bl: "bottom-5 left-5 border-b border-l",
    br: "bottom-5 right-5 border-b border-r",
  };
  return (
    <div
      className={`pointer-events-none absolute h-4 w-4 border-black/20 ${styles[pos]}`}
    />
  );
}

export default function StudioTeamSection() {
  const [active, setActive] = useState(0);
  const cfg = members[active];

  const advance = () => setActive((a) => (a + 1) % members.length);

  return (
    <section className="relative grid min-h-screen select-none overflow-hidden bg-[#f0efeb] grid-cols-[2fr_3fr]">
      <style>{`
        :root {
          --resize-dur: 650ms;
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

      {/* Corner marks */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* Section counter */}
      <div className="absolute left-9 top-9 font-mono text-[10px] tracking-[0.18em] text-black/30 uppercase">
        [ 0{active + 1} of 0{members.length} ] · Team
      </div>

      {/* ── LEFT COLUMN ── */}
      <div className="flex flex-col justify-center border-r border-black/10 px-14 py-24">

        {/* Badge */}
        <div className="mb-8 flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] bg-[#111]" />
          <span className="font-mono text-[10px] tracking-[0.22em] text-black/40 uppercase">
            Design Studio
          </span>
        </div>

        {/* Heading */}
        <h2 className="mb-4 text-[2.5rem] font-bold leading-[1.1] tracking-tight text-[#111]">
          Meet the people<br />behind the work.
        </h2>

        {/* Description */}
        <p className="mb-14 max-w-xs text-sm leading-relaxed text-black/45">
          A small, dedicated team obsessed with craft, clarity, and the details that make the difference.
        </p>

        {/* Member list */}
        <div className="border-t border-black/10">
          {members.map((m, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              animate={{ opacity: active === i ? 1 : 0.28 }}
              transition={{ duration: 0.35 }}
              className="flex w-full cursor-pointer items-center gap-5 border-b border-black/10 py-4 text-left"
            >
              <span className="w-5 font-mono text-[10px] text-black/35">
                0{i + 1}
              </span>

              <div className="flex flex-col gap-0.5">
                <span className={`text-sm text-[#111] ${active === i ? "font-semibold" : "font-normal"}`}>
                  {m.name}
                </span>
                <span className="text-[11px] text-black/40">{m.role}</span>
              </div>

              {/* sliding active dot */}
              <div className="ml-auto h-5 w-5 flex items-center justify-center">
                {active === i && (
                  <motion.div
                    layoutId="active-dot"
                    className="h-1.5 w-1.5 rounded-full bg-[#111]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div
        onClick={advance}
        className="flex cursor-pointer flex-col items-center justify-center gap-10"
      >
        {/* T [image] EAM */}
        <div
          className="grid w-full items-center px-10"
          style={{ gridTemplateColumns: "1fr auto 1fr", gap: "0 1rem" }}
        >
          <motion.span
            animate={{ fontSize: FONT_SIZE }}
            transition={{ ...morph, delay: 0.04 }}
            className="text-right font-black font-sans leading-none tracking-tighter text-[#111]"
          >
            T
          </motion.span>

          {/* Image */}
          <motion.div
            animate={{ borderRadius: cfg.imageRadius, rotate: cfg.rotate }}
            style={{ width: cfg.imageW, height: cfg.imageH }}
            transition={morph}
            className="t-resize relative shrink-0 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={cfg.image}
                alt={cfg.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 block h-full w-full object-cover"
              />
            </AnimatePresence>
          </motion.div>

          <motion.span
            animate={{ fontSize: FONT_SIZE }}
            transition={{ ...morph, delay: 0.04 }}
            className="text-left font-black font-sans leading-none tracking-tighter text-[#111]"
          >
            EAM
          </motion.span>
        </div>

        {/* Member name + role */}
        <div className="flex h-10 flex-col items-center justify-center gap-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-base font-semibold tracking-tight text-[#111]">
                {cfg.name}
              </p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-black/35 uppercase">
                {cfg.role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Click hint */}
        <p className="absolute bottom-8 right-10 font-mono text-[10px] tracking-[0.18em] text-black/20 uppercase">
          Click to advance →
        </p>
      </div>
    </section>
  );
}
