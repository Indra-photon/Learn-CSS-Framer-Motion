"use client";

/* The "choose your path" window — one card, two datasets.
 *
 * Replaces the two side-by-side cards of the first 03 pass. Two cards cost the
 * hero ~600px of horizontal lane and forced the claim column down to 460px and
 * 52px type; they also made the reader parse 120 words to answer a one-word
 * question. One window asks the question in the segmented control instead, and
 * the card below it only ever holds the answer — so the claim gets its full
 * width back and the panel can sit far right with air around it.
 *
 * The swap is AnimatePresence mode="popLayout": the outgoing body is pulled
 * out of flow the moment the new one mounts, so the two never stack and the
 * window never jumps height mid-transition. Everything else — glyph tiles,
 * button recipes, tokens, type scale — is imported from 01b. */

import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Briefcase01Icon,
  Building03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { Glyph, t14, t14m } from "./HarveyHero01";

const t16 = "type-copy-16";
const t16m = "type-copy-16 font-medium";

/* ─── data ──────────────────────────────────────────────────────────────── */

type Outcome = { lead: string; rest: string };

type Path = {
  icon: typeof Building03Icon;
  /* kind-tile fill — the two doors stay tellable apart even though they now
     share one window */
  fill: string;
  kicker: string;
  /* short label for the segmented control */
  tab: string;
  /* the proof number, promoted out of 14px footnote into the card header */
  proof: string;
  proofLabel: string;
  title: string;
  outcomes: Outcome[];
  uses: string[];
  cta: string;
  quote: string;
  who: string;
};

/* Copy lifted from harvey.ai/solutions/* — their headline, their three
 * capability lines, their numbers, their use-case names. Each outcome is split
 * at the em dash so the claim can carry the weight and the detail can drop to
 * text-low: same words, half the reading time. */
export const PATHS: Path[] = [
  {
    icon: Building03Icon,
    fill: "var(--harvey-brand-solid)",
    kicker: "For law firms",
    tab: "Law firms",
    proof: "80%",
    proofLabel: "of the AmLaw 100",
    title: "Raise the bar on every matter",
    outcomes: [
      {
        lead: "Reclaim time for billable work",
        rest: "agents take first-pass review and drafting, your lawyers keep the judgment",
      },
      {
        lead: "Apply firm expertise on every matter",
        rest: "your templates, style, playbooks and workflows",
      },
      {
        lead: "Deploy with confidence",
        rest: "1,400+ firms, enterprise security, white-glove support",
      },
    ],
    uses: [
      "Research",
      "File creation",
      "Document review",
      "Client collaboration",
      "Firm administration",
    ],
    cta: "Request a firm demo",
    quote:
      "By far the most successful firm technology adoption story I have ever been a part of.",
    who: "Rich Robbins · Director of Applied AI, Reed Smith",
  },
  {
    icon: Briefcase01Icon,
    fill: "var(--harvey-info)",
    kicker: "For in-house teams",
    tab: "In-house teams",
    proof: "1,000+",
    proofLabel: "legal departments",
    title: "Legal at the speed of business",
    outcomes: [
      {
        lead: "Accelerate legal work",
        rest: "delegate first-pass contract review, research and drafting to agents that know your business",
      },
      {
        lead: "Expand capacity, optimise spend",
        rest: "see where AI creates value and where outside counsel is most effective",
      },
      {
        lead: "Connect across the business",
        rest: "intake to resolution in one secure platform, everyone in the loop",
      },
    ],
    uses: [
      "Contract review",
      "Information synthesis",
      "Regulatory compliance",
      "Litigation & risk",
      "Legal operations",
    ],
    cta: "Request an in-house demo",
    quote:
      "Over 80% of our legal professionals report significant improvements in work quality and speed.",
    who: "Stefan Sulzer · Group General Counsel, The Adecco Group",
  },
];

/* ─── pieces ────────────────────────────────────────────────────────────── */

/* Segmented control — this is where the choice actually lives now, so it is
 * the one element in the panel allowed to look interactive. The active pill
 * carries the path's own colour as a 6px dot, the same hue as its glyph tile
 * and (for firms) its CTA. */
function Switch({
  value,
  onChange,
}: {
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Choose your path"
      className="rounded-harvey-control relative flex w-max gap-1 p-1"
      style={{
        background:
          "color-mix(in oklab, var(--harvey-gray-text-high) 5%, transparent)",
        boxShadow:
          "inset 0 0 0 1px color-mix(in oklab, var(--harvey-gray-text-high) 6%, transparent)",
      }}
    >
      {PATHS.map((p, i) => {
        const on = i === value;
        return (
          <button
            key={p.tab}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(i)}
            className={`${t14m} rounded-harvey-control focus-visible:outline-harvey-brand-solid relative flex h-9 items-center gap-2 px-3.5 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ${
              on ? "text-harvey-gray-text-high" : "text-harvey-gray-text-low"
            }`}
          >
            {on && (
              /* one shared element sliding between the two tabs — the motion
                 that tells the reader these are two states of one thing */
              <motion.span
                layoutId="harvey-path-pill"
                className="rounded-harvey-control bg-harvey-canvas absolute inset-0 shadow-[0_1px_2px_rgba(20,16,8,0.06),0_0_0_1px_var(--harvey-hairline)]"
              />
            )}
            <span
              className="relative size-1.5 rounded-full"
              style={{
                background: on ? p.fill : "var(--harvey-gray-border)",
              }}
            />
            <span className="relative whitespace-nowrap">{p.tab}</span>
          </button>
        );
      })}
    </div>
  );
}

function Bullet({ lead, rest }: Outcome) {
  return (
    <li className={`${t14} flex gap-2.5`}>
      <span className="flex h-5 w-4 shrink-0 items-center justify-center">
        <HugeiconsIcon
          icon={Tick02Icon}
          size={14}
          strokeWidth={2}
          className="text-harvey-brand-text-low"
          aria-hidden
        />
      </span>
      <span>
        <span className={`${t14m} text-harvey-gray-text-high`}>{lead}</span>
        <span className="text-harvey-gray-text-low"> — {rest}</span>
      </span>
    </li>
  );
}

function Body({ path }: { path: Path }) {
  return (
    <motion.div
      key={path.kicker}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.26 }}
      className="flex flex-col gap-5"
    >
      {/* who this is for, and the number that proves it — the number is the
          most persuasive thing on the card for its reader, so it is sized
          like one instead of hiding at 14px */}
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2.5 whitespace-nowrap">
          <Glyph icon={path.icon} fill={path.fill} />
          <span className={`${t16m} text-harvey-gray-text-high`}>
            {path.kicker}
          </span>
        </span>
        <span className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="type-heading-24 text-harvey-gray-text-high font-medium">
            {path.proof}
          </span>
          <span className={`${t14} text-harvey-gray-text-low`}>
            {path.proofLabel}
          </span>
        </span>
      </div>

      {/* their own page headline, so the card speaks the reader's language */}
      <p className={`${t16m} text-harvey-gray-text-high`}>{path.title}</p>

      {/* the "is my work in here?" answer, directly under the headline where
          it is read — as plain text, not chips: five boxes would out-shout
          the CTA, and these are scanned, not clicked */}
      <p className={`${t14} text-harvey-gray-text-low -mt-2`}>
        {path.uses.join(" · ")}
      </p>

      <ul className="flex flex-col gap-3">
        {path.outcomes.map((o) => (
          <Bullet key={o.lead} {...o} />
        ))}
      </ul>

      <figure
        className={`${t14} rounded-harvey-control p-4`}
        style={{
          background:
            "color-mix(in oklab, var(--harvey-gray-text-high) 4%, transparent)",
        }}
      >
        <blockquote className="text-harvey-gray-text-high">
          “{path.quote}”
        </blockquote>
        <figcaption className="text-harvey-gray-text-low pt-2">
          {path.who}
        </figcaption>
      </figure>
    </motion.div>
  );
}

/* ─── panel ─────────────────────────────────────────────────────────────── */

export default function HarveyPathPanel() {
  const [i, setI] = useState(0);
  const path = PATHS[i];

  return (
    /* reducedMotion="user" switches every animation here to an instant
       transition when the OS asks for it — the swap still reads, it just does
       not travel. */
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.9 }}
    >
      <div className="flex w-[500px] shrink-0 flex-col items-end gap-4">
        <Switch value={i} onChange={setI} />

        {/* one window. It hugs its content rather than holding a floor height:
            a floor sized to the taller dataset left a ~50px hole above the CTA
            in the shorter one, which is exactly the dead space the two-card
            version was criticised for. Instead `layout` animates the height
            between the two states on the shared spring, so the card resizes
            visibly and deliberately while popLayout keeps the outgoing body
            out of flow during the crossfade. */}
        <motion.div
          layout
          className="rounded-harvey-card bg-harvey-canvas shadow-harvey-border flex w-full flex-col gap-5 p-6"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <Body key={path.kicker} path={path} />
          </AnimatePresence>

          {/* the ask stays put across the swap — only its label changes, so
              the button never re-enters and the eye keeps its anchor */}
          <motion.a
            layout
            href="#"
            className="type-button-16 rounded-harvey-control btn-primary text-harvey-brand-on-solid flex h-12 items-center justify-center gap-2 pr-[19px] pl-5"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={path.cta}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {path.cta}
              </motion.span>
            </AnimatePresence>
            <span className="rounded-harvey-control flex size-6 items-center justify-center bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={14}
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          </motion.a>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
