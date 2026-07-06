"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  MotionValue,
} from "motion/react";
import Lenis from "lenis";

const jobs = [
  {
    company: "Stripe",
    role: "Senior Frontend Engineer",
    period: "2023 – Present",
    location: "San Francisco, CA",
    type: "Full-time",
    description:
      "Led the redesign of the Dashboard's core metrics surface, cutting p95 load time by 40% and unblocking the enterprise tier launch.",
    skills: ["React", "TypeScript", "WebGL", "Design Systems"],
    highlight: "40% faster dashboard",
    accent: "#635BFF",
  },
  {
    company: "Linear",
    role: "Frontend Engineer",
    period: "2021 – 2023",
    location: "Remote",
    type: "Full-time",
    description:
      "Built the command palette and keyboard shortcut system used by 200k+ daily active users across web and Electron.",
    skills: ["React", "Electron", "Framer Motion", "GraphQL"],
    highlight: "200k+ DAU feature",
    accent: "#5E6AD2",
  },
  {
    company: "Figma",
    role: "UI Engineer",
    period: "2019 – 2021",
    location: "New York, NY",
    type: "Full-time",
    description:
      "Developed the prototyping toolbar and Smart Animate engine, enabling designers to preview transitions without writing code.",
    skills: ["C++", "WebAssembly", "Canvas API", "TypeScript"],
    highlight: "Smart Animate launch",
    accent: "#FF7262",
  },
  {
    company: "Airbnb",
    role: "Software Engineer",
    period: "2017 – 2019",
    location: "San Francisco, CA",
    type: "Full-time",
    description:
      "Shipped the host onboarding flow that increased host conversion rate by 18%, directly impacting supply growth in key markets.",
    skills: ["React Native", "Ruby on Rails", "A/B Testing", "Redux"],
    highlight: "+18% host conversion",
    accent: "#FF5A5F",
  },
  {
    company: "Shopify",
    role: "Junior Developer",
    period: "2015 – 2017",
    location: "Ottawa, ON",
    type: "Full-time",
    description:
      "Contributed to the Polaris design system and built merchant-facing checkout components used across 500k+ stores.",
    skills: ["React", "SCSS", "Liquid", "Storybook"],
    highlight: "Polaris contributor",
    accent: "#96BF48",
  },
];

type Job = (typeof jobs)[0];

// ── Slide Text ─────────────────────────────────────────────────────────────────

const SLIDE_SPRING = { type: "spring", stiffness: 280, damping: 28 } as const;

function SlideText({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string | number;
}) {
  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={SLIDE_SPRING}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

function TimeLineScroll() {
  const container = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.round(latest * (jobs.length - 1));
    setActiveIndex(index);
  });

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  const activeJob = jobs[activeIndex];

  return (
    <main ref={container} style={{ height: `${jobs.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#F5F4F0] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-14 pt-10 pb-0 flex-shrink-0">
          <div className="flex items-center gap-2">
            <motion.span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              animate={{ backgroundColor: activeJob.accent }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <SlideText id={`meta-${activeIndex}`}>
              <p className="text-[11px] tracking-[0.2em] uppercase text-stone-500">
                {activeJob.type} · {activeJob.location}
              </p>
            </SlideText>
          </div>
          <SlideText id={`counter-${activeIndex}`}>
            <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(jobs.length).padStart(2, "0")}
            </p>
          </SlideText>
        </div>

        {/* Card area + ghost text */}
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Ghost company name — decorative background */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="select-none text-[18vw] font-black leading-none tracking-tighter text-stone-200 whitespace-nowrap"
              >
                {activeJob.company}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Card strip */}
          <div
            className="relative w-full"
            style={{ height: "420px", zIndex: 1 }}
          >
            {jobs.map((job, i) => (
              <JobCard
                key={job.company}
                job={job}
                index={i}
                total={jobs.length}
                activeIndex={activeIndex}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* Timeline rail */}
        <TimelineRail
          jobs={jobs}
          activeIndex={activeIndex}
          scrollYProgress={scrollYProgress}
        />
      </div>
    </main>
  );
}

export default TimeLineScroll;

// ── Job Card ───────────────────────────────────────────────────────────────────

const CARD_W = 304;
const CARD_H = 400;

function JobCard({
  job,
  index,
  total,
  activeIndex,
  scrollYProgress,
}: {
  job: Job;
  index: number;
  total: number;
  activeIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  const offset = useTransform(
    scrollYProgress,
    [0, 1],
    [index, index - (total - 1)],
  );

  const x = useTransform(
    offset,
    [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    [
      "-310%",
      "-230%",
      "-160%",
      "-115%",
      "0%",
      "115%",
      "160%",
      "230%",
      "310%",
    ],
  );
  const scale = useTransform(
    offset,
    [-3, -2, -1, 0, 1, 2, 3],
    [0.18, 0.44, 0.72, 1, 0.72, 0.44, 0.18],
  );
  const opacity = useTransform(
    offset,
    [-2.5, -1.8, -0.6, 0, 0.6, 1.8, 2.5],
    [0, 0.28, 0.65, 1, 0.65, 0.28, 0],
  );
  const detailOpacity = useTransform(offset, [-0.65, 0, 0.65], [0, 1, 0]);

  const zIndex = jobs.length - Math.abs(index - activeIndex);

  return (
    <motion.div
      style={{
        x,
        scale,
        opacity,
        position: "absolute",
        left: `calc(50% - ${CARD_W / 2}px)`,
        top: `calc(50% - ${CARD_H / 2}px)`,
        width: `${CARD_W}px`,
        zIndex,
        transformOrigin: "center center",
      }}
    >
      <div
        className="rounded-2xl bg-white overflow-hidden"
        style={{
          height: `${CARD_H}px`,
          boxShadow:
            "0 2px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Accent bar */}
        <motion.div
          className="h-1.5 w-full"
          animate={{ backgroundColor: job.accent }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        <div
          className="flex flex-col p-7"
          style={{ height: `calc(100% - 6px)` }}
        >
          {/* Period — always visible */}
          <p className="mb-4 text-[11px] tracking-[0.18em] uppercase text-stone-400">
            {job.period}
          </p>

          {/* Role + Company — always visible */}
          <div>
            <h3 className="text-[21px] font-semibold leading-tight text-stone-900">
              {job.role}
            </h3>
            <p className="mt-1 text-sm font-medium text-stone-400">
              {job.company}
            </p>
          </div>

          {/* Detail content — fades based on proximity to active */}
          <motion.div
            style={{ opacity: detailOpacity }}
            className="flex flex-col gap-4 mt-auto"
          >
            <p className="text-[13px] leading-relaxed text-stone-500">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] text-stone-600"
                >
                  {s}
                </span>
              ))}
            </div>

            <p
              className="text-[11px] font-semibold tracking-wide uppercase"
              style={{ color: job.accent }}
            >
              ↑ {job.highlight}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Timeline Rail ──────────────────────────────────────────────────────────────

function TimelineRail({
  jobs,
  activeIndex,
  scrollYProgress,
}: {
  jobs: Job[];
  activeIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <div className="flex-shrink-0 px-14 pb-10 pt-4">
      {/* Rail line */}
      <div className="relative h-px bg-stone-200 mb-3">
        <motion.div
          className="absolute inset-0 origin-left"
          style={{
            scaleX: scrollYProgress,
            backgroundColor: jobs[activeIndex].accent,
          }}
        />

        {/* Dot markers — sit on the rail */}
        <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-between">
          {jobs.map((job, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={job.company}
                animate={{
                  width: isActive ? 10 : 5,
                  height: isActive ? 10 : 5,
                  backgroundColor: isActive ? job.accent : "#D6D3CE",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="rounded-full"
                style={{ translateY: "-50%" }}
              />
            );
          })}
        </div>
      </div>

      {/* Year labels */}
      <div className="flex justify-between">
        {jobs.map((job, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.p
              key={job.company}
              animate={{
                opacity: isActive ? 1 : 0.35,
                y: isActive ? 0 : 3,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="text-[11px] tracking-widest uppercase text-stone-500"
            >
              {job.period.split(" – ")[0]}
            </motion.p>
          );
        })}
      </div>
    </div>
  );
}
