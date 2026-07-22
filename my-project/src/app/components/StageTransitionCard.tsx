"use client";

/* ── Original demo version (stage 1 → stage end, generic 2-stage card) ──────
"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
import { useState } from "react";

interface Stage {
  // Card background color for this stage
  color: string;
  // Text lines shown in the stage's list
  items: string[];
  // 0–100, marker position along the track (svg viewBox units == %)
  marker: number;
  // 0–100, horizontal position of the text block
  textPosition: number;
  // 0–100, horizontal position of the play button
  playPosition: number;
}

const stages: Stage[] = [
  {
    color: "#8a3b56",
    items: ["Idea", "Research", "Moodboard", "Requirements"],
    marker: 21,
    textPosition: 20,
    playPosition: 53,
  },
  {
    color: "#b8b96b",
    items: ["Brand Identity", "Logo & Marks", "Typography", "Colors"],
    marker: 75,
    textPosition: 72,
    playPosition: 47,
  },
];

const SPRING = { stiffness: 140, damping: 22, mass: 1 };

export default function StageTransitionCard() {
  const [stageIndex, setStageIndex] = useState(0);
  const [displayedStage, setDisplayedStage] = useState(0);

  const progress = useMotionValue(0);
  const spring = useSpring(progress, SPRING);

  // Swap the rendered text only once the block has fully faded out, so the
  // new list fades back in already showing the correct stage's content.
  useMotionValueEvent(spring, "change", (latest) => {
    setDisplayedStage(latest > 0.5 ? 1 : 0);
  });

  const advance = () => {
    const next = stageIndex === 0 ? 1 : 0;
    setStageIndex(next);
    progress.set(next);
  };

  const bg = useTransform(
    spring,
    [0, 1],
    [stages[0].color, stages[1].color],
  );

  const textLeft = useTransform(spring, (v) =>
    `${stages[0].textPosition + v * (stages[1].textPosition - stages[0].textPosition)}%`,
  );
  const textOpacity = useTransform(spring, [0, 0.45, 0.55, 1], [1, 0, 0, 1]);
  const textScale = useTransform(spring, [0, 0.5, 1], [1, 0.72, 1]);

  const playLeft = useTransform(spring, (v) =>
    `${stages[0].playPosition + v * (stages[1].playPosition - stages[0].playPosition)}%`,
  );

  const markerCx = useTransform(spring, [0, 1], [stages[0].marker, stages[1].marker]);

  return (
    <motion.div
      onClick={advance}
      style={{ backgroundColor: bg }}
      className="relative mx-auto h-[330px] w-full max-w-3xl cursor-pointer select-none overflow-hidden rounded-3xl"
    >
      {/* Text block }
      <motion.div
        style={{ left: textLeft, opacity: textOpacity, scale: textScale }}
        className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-0.5"
      >
        {stages[displayedStage].items.map((item) => (
          <p
            key={item}
            className="text-center text-lg font-medium leading-snug text-white/90"
          >
            {item}
          </p>
        ))}
      </motion.div>

      {/* Play button }
      <motion.div
        style={{ left: playLeft }}
        className="absolute top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20"
      >
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
          <path d="M0 0 L22 13 L0 26 Z" fill="white" fillOpacity={0.85} />
        </svg>
      </motion.div>

      {/* Track + marker }
      <div className="absolute inset-x-8 bottom-9">
        <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none">
          <line
            x1="0"
            y1="6"
            x2="100"
            y2="6"
            stroke="white"
            strokeOpacity={0.35}
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
          />
          <motion.circle
            cx={markerCx}
            cy="6"
            r="3"
            fill="white"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </motion.div>
  );
}
──────────────────────────────────────────────────────────────────────────── */

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useState } from "react";

interface Daypart {
  /** Section label shown above the menu list */
  label: string;
  /** Small time-range caption, e.g. "7 – 11 AM" */
  time: string;
  /** Hero background color for this daypart */
  color: string;
  /** Menu highlights shown in the list */
  items: string[];
  /** 0–100, marker position along the time rail */
  marker: number;
  /** 0–100, horizontal position of the menu list */
  textPosition: number;
  /** 0–100, horizontal position of the toggle button */
  iconPosition: number;
  /** Glyph shown on the toggle button for this daypart */
  icon: string;
}

const dayparts: Daypart[] = [
  {
    label: "Breakfast & Brunch",
    time: "7 – 11 AM",
    color: "#b8703f",
    items: ["Avocado Toast", "Shakshuka", "Fresh Pastries", "Cold Brew"],
    marker: 18,
    textPosition: 20,
    iconPosition: 53,
    icon: "☀️",
  },
  {
    label: "Dinner & Late Night",
    time: "6 – 11 PM",
    color: "#3a1f2b",
    items: ["Grilled Branzino", "Truffle Risotto", "Aged Ribeye", "Wine Pairings"],
    marker: 82,
    textPosition: 72,
    iconPosition: 47,
    icon: "🌙",
  },
];

const SPRING = { stiffness: 140, damping: 22, mass: 1 };

export default function StageTransitionCard() {
  const reduceMotion = useReducedMotion();
  const [daypartIndex, setDaypartIndex] = useState(0);
  const [displayedDaypart, setDisplayedDaypart] = useState(0);

  const progress = useMotionValue(0);
  const spring = useSpring(progress, SPRING);

  // Swap the rendered menu only once the list has fully faded out, so the
  // new items fade back in already showing the correct daypart's content.
  useMotionValueEvent(spring, "change", (latest) => {
    setDisplayedDaypart(latest > 0.5 ? 1 : 0);
  });

  const toggleDaypart = () => {
    const next = daypartIndex === 0 ? 1 : 0;
    setDaypartIndex(next);
    progress.set(next);
  };

  const bg = useTransform(
    spring,
    [0, 1],
    [dayparts[0].color, dayparts[1].color],
  );

  const textLeft = useTransform(spring, (v) =>
    `${dayparts[0].textPosition + v * (dayparts[1].textPosition - dayparts[0].textPosition)}%`,
  );
  const rawTextOpacity = useTransform(spring, [0, 0.45, 0.55, 1], [1, 0, 0, 1]);
  const rawTextScale = useTransform(spring, [0, 0.5, 1], [1, 0.72, 1]);
  const textOpacity = reduceMotion ? 1 : rawTextOpacity;
  const textScale = reduceMotion ? 1 : rawTextScale;

  const iconLeft = useTransform(spring, (v) =>
    `${dayparts[0].iconPosition + v * (dayparts[1].iconPosition - dayparts[0].iconPosition)}%`,
  );

  const markerCx = useTransform(spring, [0, 1], [dayparts[0].marker, dayparts[1].marker]);

  const daypart = dayparts[displayedDaypart];

  return (
    <div className="relative mx-auto h-[380px] w-full max-w-3xl overflow-hidden rounded-3xl">
      <motion.div style={{ backgroundColor: bg }} className="absolute inset-0" />

      <div className="relative flex h-full flex-col justify-between p-8">
        {/* Header: daypart label + CTA */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
              {daypart.time}
            </p>
            <p className="mt-1 text-sm font-medium text-white/80">
              {daypart.label}
            </p>
          </div>

          <a
            href="#menu"
            className="rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/25"
          >
            View Full Menu
          </a>
        </div>

        {/* Menu list */}
        <motion.div
          style={{ left: textLeft, opacity: textOpacity, scale: textScale }}
          className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-0.5"
        >
          {dayparts[displayedDaypart].items.map((item) => (
            <p
              key={item}
              className="text-center text-lg font-medium leading-snug text-white/90"
            >
              {item}
            </p>
          ))}
        </motion.div>

        {/* Toggle button */}
        <motion.button
          type="button"
          onClick={toggleDaypart}
          aria-label={`Switch to ${dayparts[daypartIndex === 0 ? 1 : 0].label}`}
          style={{ left: iconLeft }}
          className="absolute top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl transition-colors hover:bg-white/30"
        >
          {daypart.icon}
        </motion.button>

        {/* Time rail + marker */}
        <div className="relative">
          <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            <span>7 AM</span>
            <span>10 PM</span>
          </div>
          <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none">
            <line
              x1="0"
              y1="6"
              x2="100"
              y2="6"
              stroke="white"
              strokeOpacity={0.35}
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
            <motion.circle
              cx={markerCx}
              cy="6"
              r="3"
              fill="white"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
