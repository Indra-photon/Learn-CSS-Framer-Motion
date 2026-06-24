"use client";

import React from "react";
import Image from "next/image";
import { Albert_Sans } from "next/font/google";
import { motion } from "framer-motion";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-albert-sans",
});

const NAV_LINKS = ["Explore", "Trails", "Guides", "About"];

const STATS = [
  { value: "240+", label: "Trails Mapped" },
  { value: "48", label: "Mountain Huts" },
  { value: "12K+", label: "Trekkers Joined US" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 8, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function TourisomHero01() {
  return (
    <div
      className={`${albertSans.variable} relative h-screen min-h-[600px] w-full overflow-hidden antialiased`}
    >
      {/* Background image */}
      <Image
        src="/paper-image/TourismHero01.png"
        alt="Mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(in oklab 90deg, oklab(17.6% -0.023 0.014 / 72%) 0%, oklab(17.6% -0.023 0.014 / 35%) 55%, oklab(17.6% -0.023 0.014 / 0%) 100%)",
        }}
      />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute top-6 left-1/2 box-border flex h-[60px] -translate-x-1/2 items-center justify-between rounded-2xl border border-[#FFFFFF59] bg-[#FFFFFF26] px-9 shadow-[#0000002E_0px_4px_24px] backdrop-blur-[18px]"
        style={{ width: "calc(100% - 2 * clamp(32px, 5.5vw, 80px))" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3L26 23H2L14 3Z" fill="#2D6A4F" />
            <path d="M19 17L23 23H12L16 16L19 17Z" fill="#1B4332" />
          </svg>
          <span className="[font-family:var(--font-albert-sans)] text-[28px] leading-7 font-bold text-[#FFFFFFD1]">
            Summit
          </span>
        </div>

        {/* Nav links + divider + CTA */}
        <div className="flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="[font-family:var(--font-albert-sans)] text-[18px] leading-7 font-medium text-[#FFFFFFD1] no-underline"
            >
              {link}
            </a>
          ))}

          <div className="h-5 w-px shrink-0 bg-[#FFFFFF4D]" />

          {/* Rule 02: Albert Sans replaces DM Sans here */}
          <button className="cursor-pointer rounded-lg border-none bg-[#2D6A4F] px-[22px] py-[11px] [font-family:var(--font-albert-sans)] text-sm leading-[18px] font-semibold tracking-[0.01em] text-white transition-transform duration-150 active:scale-[0.96]">
            Book Now
          </button>
        </div>
      </motion.nav>

      {/* Hero content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute inset-0 flex flex-col items-start justify-center gap-7 px-[clamp(32px,5.5vw,80px)] pt-[clamp(60px,12vh,140px)] pb-[clamp(140px,22vh,200px)]"
      >
        <motion.h1
          variants={item}
          className="m-0 max-w-[40%] [font-family:var(--font-albert-sans)] text-[clamp(44px,5vw,72px)] leading-[1.05] font-semibold tracking-tight whitespace-pre-wrap text-white"
        >
          {"Where the Path\nLeads Up"}
        </motion.h1>

        <motion.p
          variants={item}
          className="text-wrap-pretty m-0 max-w-[35%] [font-family:var(--font-albert-sans)] text-[clamp(16px,1.4vw,20px)] leading-7 font-normal text-[#FFFFFFF2]"
        >
          Discover alpine trails, mountain refuges, and guided expeditions
          across the Dolomites.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={item} className="flex items-center gap-4">
          <button className="cursor-pointer rounded-[10px] bg-gradient-to-b from-[#2D6A4F] to-[#2D6A4F]/80 px-8 py-[9px] [font-family:var(--font-albert-sans)] text-[18px] font-medium text-white ring ring-white/20 transition-[background-color,transform] duration-150 ring-inset active:scale-[0.96]">
            Plan Your Trek
          </button>

          <button className="cursor-pointer rounded-[10px] border border-white/50 bg-transparent px-8 py-[9px] [font-family:var(--font-albert-sans)] text-[18px] font-medium tracking-[0.01em] text-white transition-[background-color,transform] duration-150 hover:bg-white/10 active:scale-[0.96]">
            Watch How We Trek
          </button>
        </motion.div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          delay: 0.5,
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="absolute right-0 bottom-0 left-0 flex h-[clamp(100px,16.5vh,148px)] items-center px-[clamp(32px,5.5vw,80px)]"
      >
        <div className="flex items-center">
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <div className="mx-[clamp(24px,2.8vw,40px)] h-14 w-px shrink-0 bg-[#FFFFFF4D]" />
              )}
              <div className="flex shrink-0 flex-col gap-1">
                {/* Rule 10: font-bold (700) — stat numbers are structural, not decorative */}
                <span className="[font-family:var(--font-albert-sans)] text-[clamp(32px,3.3vw,48px)] leading-[52px] font-normal tracking-[-0.03em] text-white tabular-nums">
                  {stat.value}
                </span>
                <span className="[font-family:var(--font-albert-sans)] text-[clamp(12px,1.25vw,18px)] leading-[22px] font-normal tracking-[0.03em] text-white uppercase">
                  {stat.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default TourisomHero01;
