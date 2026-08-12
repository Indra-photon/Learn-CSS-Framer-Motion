"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconArrowsDiagonal, IconZoomScan } from "@tabler/icons-react";

import OpCanvas from "@/app/components/opart/OpCanvas";
import { VARIATIONS, type Variation } from "@/app/components/opart/variations";
import { PHYSICS } from "@/app/components/opart/physics";
import { cn } from "@/lib/utils";
import GpuInfrastructure from "./gpu-infrastructure";

const BY_ID = new Map<string, Variation>(
  [...PHYSICS, ...VARIATIONS].map((v) => [v.id, v]),
);

const pick = (id: string) => {
  const v = BY_ID.get(id);
  if (!v) throw new Error(`unknown op-art variation: ${id}`);
  return v;
};

type Capability = {
  word: string;
  art: Variation;
  copy: string;
};

const CAPABILITIES: Capability[] = [
  {
    word: "Throughput",
    art: pick("flow"),
    copy: "Continuous batching, paged attention, and speculative decoding land more tokens per GPU-second. Same weights, same hardware — up to 3.4× the requests served before you add a single node.",
  },
  {
    word: "Latency",
    art: pick("pulse"),
    copy: "Weights stay resident and KV cache stays warm, so there is no cold start to pay for. Sub-200ms time-to-first-token at p99, measured under load rather than on an idle cluster.",
  },
  {
    word: "Scale",
    art: pick("columns"),
    copy: "Autoscaling that reads queue depth instead of CPU, from one replica to four hundred across regions. Traffic spikes are absorbed in seconds, and idle capacity is released just as fast.",
  },
  {
    word: "Reliability",
    art: pick("lorenz-upo"),
    copy: "99.99% uptime, multi-region failover, and automatic node drain on hardware faults. In-flight requests are rescheduled, not dropped — an unhealthy GPU never becomes your incident.",
  },
  {
    word: "Observability",
    art: pick("dipole"),
    copy: "Every request traced end to end: token counts, cache hit rate, queue time, and per-tenant spend. You see exactly which prompt shape is costing you, down to the individual call.",
  },
  {
    word: "Sovereignty",
    art: pick("lorenz-slice"),
    copy: "Run in our cloud, your VPC, or fully air-gapped on your own metal — one control plane, one API. Your weights and your data never leave the perimeter you define.",
  },
];

/**
 * Film grain, generated rather than downloaded: one feTurbulence tile blown up
 * as a background-image. `fractalNoise` (not `turbulence`) keeps it even —
 * turbulence takes the absolute value and reads as clumps rather than film.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")";

/**
 * Four overlapping radial stops over a diagonal base — a mesh gradient without
 * the mesh. Dark olive anchored bottom-left under the number, opening out to a
 * pale sage at the right edge where the pattern sits.
 */
const CARD_GRADIENT = [
  "radial-gradient(115% 135% at 8% 92%, #2f382c 0%, rgba(47,56,44,0) 62%)",
  "radial-gradient(90% 110% at 0% 8%, #5d6a52 0%, rgba(93,106,82,0) 58%)",
  "radial-gradient(120% 120% at 100% 30%, #b6bfa6 0%, rgba(182,191,166,0) 64%)",
  "radial-gradient(80% 90% at 72% 100%, #7d8a6e 0%, rgba(125,138,110,0) 70%)",
  "linear-gradient(112deg, #414b39 0%, #66715a 46%, #929c81 78%, #aab39a 100%)",
].join(",");

/** Sub-pixel dot that marks the row under the pointer or the row in play. */
function Marker({ active }: { active: boolean }) {
  return (
    <span className="relative mr-4 inline-flex h-1.5 w-1.5 shrink-0 items-center justify-center sm:mr-6">
      {active && (
        <motion.span
          layoutId="capability-marker"
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 42,
            mass: 0.6,
          }}
          className="absolute inset-0 rounded-full bg-neutral-900"
        />
      )}
    </span>
  );
}

export default function Capabilities() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // hover previews, click commits — the marker follows whichever is louder
  const shown = hovered ?? index;
  const current = CAPABILITIES[shown];

  return (
    <section className="relative overflow-x-clip bg-[#f1f1ef] py-16 text-neutral-900 lg:py-24">
      <div className="relative mx-auto w-7xl border-x border-neutral-900/10">
        {/* Full-bleed rules, escaping the container with w-screen so they run
            edge to edge while still landing exactly where the verticals start
            and stop. `overflow-x-clip` on the section eats the overhang. */}
        <Rule className="absolute top-0 left-1/2 w-screen -translate-x-1/2" />
        <Rule className="absolute bottom-0 left-1/2 w-screen -translate-x-1/2" />

        {/* ---------------------------------------------------------- head */}
        {/* Text column takes 1.3 of 2 and the graphic gives way, because the
            heading has to hold at exactly two lines on desktop — at 3.15rem
            that needs ~740px of measure, which a 1fr/0.85fr split can't give. */}
        <header className="grid items-center gap-8 border-b border-neutral-900/10 px-6 py-8 sm:px-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-10 lg:py-5">
          <div>
            <h2 className="text-[clamp(2rem,4.6vw,3.15rem)] leading-[1.04] font-normal tracking-[-0.035em] text-balance">
              Inference infrastructure that holds up in production.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-tight text-neutral-800">
              Serve open and custom models on dedicated GPUs without assembling
              the stack yourself — scheduling, autoscaling, caching, and
              observability arrive as one system, behind a single API.
            </p>

            {/* Both buttons carry the same ink; only the ground changes, so
                the pair reads as one control rather than two competing ones.
                Depth is shadow, not border: a 1px tinted ring, two ambient
                layers below, and an inset highlight on the top edge with an
                inset shade on the bottom — that pair is what makes the
                surface read as lit from above rather than as a flat fill. */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {/* Primary — Paper spec transcribed 1:1, one cn() group per
                  inspector panel and in the panel's own order. */}
              <motion.a
                href="#"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                className={cn(
                  // Layout
                  "inline-flex items-center justify-center",
                  // Padding
                  "px-6 py-3.5",
                  // Typography
                  "text-[15px] font-medium text-white",
                  // Radius — 3
                  "rounded-[6px]",
                  // Fill — 7E8675 100% → 3D4535 87% → 2F3927 100%
                  "border-t border-r border-b border-l border-t-[#7E8675] border-r-[rgba(8,20,0,0.07)] border-b-[rgba(6,13,2,0.69)] border-l-[rgba(8,20,0,0.07)] bg-[linear-gradient(180deg,#7E8675_0%,rgba(61,69,53,0.87)_50%,#2F3927_100%)]",
                  // Shadow — 0 · 0 · blur 0 · spread 1 · 363835 43%
                  // Inner shadow — 1 · 1 · 5 · FFFFFF 25%
                  // Inner shadow — −1 · −1 · 5 · FFFFFF 22%
                  "shadow-[inset_1px_1px_5px_rgba(255,255,255,0.25),inset_-1px_-1px_5px_rgba(255,255,255,0.22)]",
                  // Hover — the fill is a gradient, so it darkens by filter
                  "transition-[filter] duration-150 ease-out hover:brightness-[0.94]",
                  // Focus
                  "outline-none focus-visible:ring-2 focus-visible:ring-[#5f6b52]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f1ef]",
                )}
              >
                Start building
              </motion.a>

              {/* Secondary — same groups in the same order, so the two can be
                  read side by side and only Fill, Ink and Shadow differ. */}
              <motion.a
                href="#"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                className={cn(
                  // Layout
                  "inline-flex items-center justify-center",
                  // Padding
                  "px-6 py-3.5",
                  // Typography
                  "text-[15px] font-medium text-[#59654F]",
                  // Radius — 6
                  "rounded-[6px]",
                  // Fill — FFFFFF 100% → 0A0E05 13%
                  "bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(10,14,5,0.13)_100%)]",
                  // Border — 1 · All · 837F7E 9%
                  "",
                  // Shadow — none
                  // Inner shadow — 1 · 1 · 28 · FFFEFE 100%
                  // Inner shadow — −1 · −1 · 2 · FFFFFF 100%
                  "shadow-[inset_0_0_0_1px_rgba(131,127,126,0.09),1px_1px_0px_0px_rgba(4,0,0,0.12),-1px_1px_0px_0px_rgba(4,0,0,0.12)]",
                  // Hover
                  "transition-[filter] duration-150 ease-out hover:brightness-[0.985]",
                  // Focus
                  "outline-none focus-visible:ring-2 focus-visible:ring-[#5f6b52]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f1ef]",
                )}
              >
                Talk to an engineer
              </motion.a>
            </div>
          </div>
          <GpuInfrastructure className="mx-auto max-w-[420px] lg:-my-8" />
        </header>

        {/* the column rule only exists once the columns do */}
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-neutral-900/10">
          {/* -------------------------------------------------------- list */}
          <ul
            className="flex flex-col gap-1 px-6 py-12 sm:px-10 lg:gap-2 lg:py-16"
            onMouseLeave={() => setHovered(null)}
          >
            {CAPABILITIES.map((c, i) => (
              <li key={c.word}>
                <button
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  className="group flex w-full items-center rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                >
                  <Marker active={i === shown} />
                  <motion.span
                    animate={{
                      color: i === shown ? "#111111" : "#9b9b98",
                      x: i === shown ? 2 : 0,
                    }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className={`text-[clamp(1.9rem,4.4vw,2.9rem)] leading-[1.28] ${i === shown ? "font-normal" : "font-light"} tracking-[-0.02em]`}
                  >
                    {c.word}.
                  </motion.span>
                </button>
              </li>
            ))}
          </ul>

          {/* -------------------------------------------------------- card */}
          <div className="border-t border-neutral-900/10 px-6 py-12 sm:px-10 lg:border-t-0 lg:py-16">
            <div
              className="relative aspect-[16/10] w-full overflow-hidden rounded-xl ring-1 ring-white/10 ring-inset"
              style={{ backgroundImage: CARD_GRADIENT }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.art.id}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 right-0 w-[55%] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_22%)] mix-blend-screen"
                >
                  {/* inverted the canvas is white-on-black, and `screen` drops that
                    black entirely — the marks sit in the gradient instead of on a
                    black panel pasted over it.
                    square canvas sized off the card's height, so the pattern fills
                    the right half and crops rather than letterboxing */}
                  <div className="absolute top-1/2 left-1/2 aspect-square h-[112%] -translate-x-1/2 -translate-y-1/2 [filter:invert(1)]">
                    <OpCanvas
                      draw={current.art.draw}
                      period={current.art.period}
                      fps={current.art.fps}
                      label={current.art.name}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* a single soft sheen raking across the middle, and a darkened
                bottom-left so the number always has something to sit on */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(78deg,transparent_18%,rgba(255,255,255,0.16)_44%,transparent_66%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_6%_100%,rgba(24,30,22,0.55),transparent_60%)]" />

              {/* grain last, over the pattern too — otherwise the art reads as a
                cleaner layer pasted onto a textured one */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
                style={{
                  backgroundImage: GRAIN,
                  backgroundSize: "180px 180px",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-soft-light"
                style={{
                  backgroundImage: GRAIN,
                  backgroundSize: "300px 300px",
                }}
              />

              <span className="absolute top-5 left-5 h-1.5 w-1.5 rounded-full bg-white/80" />

              <div className="absolute bottom-4 left-5 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={shown}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    className="block text-3xl font-normal tracking-tight text-white/90"
                  >
                    {String(shown + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* ------------------------------------------------ copy + tools */}
            <div className="mt-8 flex items-start justify-between gap-8">
              <div className="max-w-full">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={shown}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[15px] leading-tight text-neutral-800"
                  >
                    {current.copy}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Hairline rule. Kept as a component so every line in the section is one weight. */
function Rule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none block h-px bg-neutral-900/10",
        className,
      )}
    />
  );
}

function ToolButton({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 560, damping: 30 }}
      className={cn(
        "grid h-[76px] w-[76px] place-items-center rounded-2xl bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
