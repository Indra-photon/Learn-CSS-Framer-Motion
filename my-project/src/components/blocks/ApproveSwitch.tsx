"use client";

import { useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import "./approve-switch.css";

// "use client";

// import { useState } from "react";
// import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
// import "./approve-switch.css";

// /* ─────────────────────────────────────────────────────────
//  * ANIMATION STORYBOARD — approve / reject switch
//  *
//  *  screen 1   two equal pills sit side by side: Reject, Approve.
//  *  on click   THE PRESSED PILL EXPANDS IN PLACE — its colour floods, it
//  *             stretches wide — while the other pill collapses into an undo
//  *             circle. Both are shared-layout morphs (`layoutId`), so the two
//  *             screens are never two components fading past each other: the
//  *             same two boxes change shape.
//  *  the word   "Reject" does not cross-fade into "Rejected". Every letter of
//  *             the base word is its own span carrying its own `layoutId`, so
//  *             the six letters of Reject GLIDE to their new positions inside
//  *             the wider pill, and only the conditional suffix — "ed", "d" —
//  *             is mounted, blurring and scaling in at the end of the word.
//  *  undo       plays the whole thing in reverse.
//  *
//  * WHY popLayout
//  *   During a swap the outgoing element leaves flow immediately, so the
//  *   surviving sibling reflows to its final position on frame one and glides
//  *   there, instead of waiting for the exit and then jumping.
//  * ───────────────────────────────────────────────────────── */

// type Decision = "idle" | "approved" | "rejected";

// /* Deciding is a deliberate act, so it carries a little weight and a little
//  * bounce; undo is a correction the user wants over with, so it snaps back
//  * flat. Same family of spring either way — the block still reads as one
//  * object, it just knows which direction it is travelling. */
// const DECIDE: Transition = { type: "spring", duration: 0.42, bounce: 0.18 };
// const UNDO: Transition = { type: "spring", duration: 0.3, bounce: 0 };

// /* Content swaps are quicker and bounce-free: they are changes of substance,
//  * not physical moves, and overshoot on text looks like a glitch. */
// const SWAP: Transition = { type: "spring", duration: 0.32, bounce: 0 };

// /* Blur is what sells a swap — the thing dissolves rather than cuts. A few
//  * pixels does the whole job; heavy animated blur only buys Safari jank. */
// const swapVariants = {
//   initial: { opacity: 0, filter: "blur(4px)", scale: 0.86 },
//   active: { opacity: 1, filter: "blur(0px)", scale: 1 },
//   exit: { opacity: 0, filter: "blur(4px)", scale: 0.86 },
// };

// /* Suffix letters have no previous position to morph from, so they arrive on
//  * their own. They claim their full width from frame one — the pill is already
//  * growing around them, so there is room, and animating each letter's `width`
//  * would put a Layout+Paint property on the one path that is already running
//  * two layout morphs. Only transform and opacity move here. */
// const letterVariants = {
//   initial: { opacity: 0, filter: "blur(4px)", scale: 0.9 },
//   active: { opacity: 1, filter: "blur(0px)", scale: 1 },
//   exit: { opacity: 0, filter: "blur(4px)", scale: 0.9 },
// };

// const RADIUS = 999;

/* Leaving is shorter than arriving: while the pill shrinks, a label still
 * fading is wider than the box around it and reads as text escaping. */
const LEAVE: Transition = { type: "spring", duration: 0.16, bounce: 0 };

/* The glyph swap is the fastest thing in the block — a crossfade in a
 * fixed-size box, not a move. Short and bounce-free so the icon lands with
 * the pill instead of trailing it; the length is what fixed the late-arriving
 * back arrow, and it holds whether the curve is a spring or a tween. */
const MARK: Transition = { type: "spring", duration: 0.2, bounce: 0 };

// function CheckMark({ bg, fg }: { bg: string; fg: string }) {
//   return (
//     <svg className="approve-mark" viewBox="0 0 24 24" aria-hidden="true">
//       <circle cx="12" cy="12" r="12" fill={bg} />
//       <path
//         d="M6.8 12.4 10.4 16 17.2 8.8"
//         fill="none"
//         stroke={fg}
//         strokeWidth="2.6"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// function CrossMark({ bg, fg }: { bg: string; fg: string }) {
//   return (
//     <svg className="approve-mark" viewBox="0 0 24 24" aria-hidden="true">
//       <circle cx="12" cy="12" r="12" fill={bg} />
//       <path
//         d="M8.2 8.2 15.8 15.8M15.8 8.2 8.2 15.8"
//         fill="none"
//         stroke={fg}
//         strokeWidth="2.6"
//         strokeLinecap="round"
//       />
//     </svg>
//   );
// }

// function UndoMark() {
//   return (
//     <svg className="approve-mark" viewBox="0 0 24 24" aria-hidden="true">
//       <path
//         d="M9 6 4.5 10.5 9 15"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2.6"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M4.5 10.5h9a5.5 5.5 0 0 1 0 11H10"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2.6"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// /* The badge swaps wholesale (green circle → white circle), so it gets the
//  * blur crossfade. `layout="position"` keeps it centred while the pill grows
//  * instead of being stretched by the parent's layout animation. */
// function Badge({ id, children }: { id: string; children: React.ReactNode }) {
//   return (
//     <AnimatePresence mode="popLayout" initial={false}>
//       <motion.span
//         key={id}
//         className="approve-badge"
//         layout="position"
//         variants={swapVariants}
//         initial="initial"
//         animate="active"
//         exit="exit"
//         transition={SWAP}
//       >
//         {children}
//       </motion.span>
//     </AnimatePresence>
//   );
// }

// /* "Reject" → "Rejected": the base letters are the SAME letters in both
//  * states, each with a stable layoutId, so they morph across the button swap
//  * rather than fading out and back in. Only `suffix` is conditional. */
// function MorphWord({
//   slot,
//   base,
//   suffix,
// }: {
//   slot: string;
//   base: string;
//   suffix?: string;
// }) {
//   return (
//     <span className="approve-word">
//       {base.split("").map((char, i) => (
//         <motion.span
//           key={`${slot}-base-${i}`}
//           layoutId={`${slot}-letter-${i}`}
//           className="approve-letter"
//         >
//           {char}
//         </motion.span>
//       ))}
//       <AnimatePresence mode="popLayout" initial={false}>
//         {suffix
//           ? suffix.split("").map((char, i) => (
//               <motion.span
//                 key={`${slot}-suffix-${i}`}
//                 className="approve-letter"
//                 variants={letterVariants}
//                 initial="initial"
//                 animate="active"
//                 exit="exit"
//                 transition={{ ...SWAP, delay: i * 0.04 }}
//               >
//                 {char}
//               </motion.span>
//             ))
//           : null}
//       </AnimatePresence>
//     </span>
//   );
// }

// export default function ApproveSwitch({ className }: { className?: string }) {
//   const [decision, setDecision] = useState<Decision>("idle");
//   /* Returning to idle IS the undo, whichever slot the user came from. */
//   const travel = decision === "idle" ? UNDO : DECIDE;

//   /* Each slot is the same box across all three states — which state it is in
//    * decides whether it is the labelled pill, the wide result, or the undo. */
//   const slots = [
//     {
//       id: "reject",
//       role:
//         decision === "rejected" ? "result" : decision === "approved" ? "undo" : "choice",
//       tone: "rejected" as const,
//       base: "Reject",
//       suffix: "ed",
//       mark: (onColor: boolean) => (
//         <CrossMark bg={onColor ? "#ffffff" : "var(--reject)"} fg={onColor ? "var(--reject)" : "#ffffff"} />
//       ),
//     },
//     {
//       id: "approve",
//       role:
//         decision === "approved" ? "result" : decision === "rejected" ? "undo" : "choice",
//       tone: "approved" as const,
//       base: "Approve",
//       suffix: "d",
//       mark: (onColor: boolean) => (
//         <CheckMark bg={onColor ? "#ffffff" : "var(--approve)"} fg={onColor ? "var(--approve)" : "#ffffff"} />
//       ),
//     },
//   ];

//   return (
//     <MotionConfig transition={travel} reducedMotion="user">
//       <div className={`approve-stage${className ? ` ${className}` : ""}`}>
//         <div className="approve-row">
//           {slots.map((slot) => (
//             <AnimatePresence key={slot.id} mode="popLayout" initial={false}>
//               {slot.role === "undo" ? (
//                 <motion.button
//                   key={`${slot.id}-undo`}
//                   layoutId={`${slot.id}-pill`}
//                   type="button"
//                   className="approve-button approve-button--icon"
//                   style={{ borderRadius: RADIUS }}
//                   onClick={() => setDecision("idle")}
//                   whileTap={{ scale: 0.96 }}
//                   aria-label="Undo decision"
//                 >
//                   <Badge id={`${slot.id}-undo`}>
//                     <UndoMark />
//                   </Badge>
//                 </motion.button>
//               ) : slot.role === "result" ? (
//                 <motion.div
//                   key={`${slot.id}-result`}
//                   layoutId={`${slot.id}-pill`}
//                   className={`approve-button approve-button--wide approve-button--${slot.tone}`}
//                   style={{ borderRadius: RADIUS }}
//                   role="status"
//                 >
//                   <Badge id={`${slot.id}-result`}>{slot.mark(true)}</Badge>
//                   <MorphWord slot={slot.id} base={slot.base} suffix={slot.suffix} />
//                 </motion.div>
//               ) : (
//                 <motion.button
//                   key={`${slot.id}-choice`}
//                   layoutId={`${slot.id}-pill`}
//                   type="button"
//                   className="approve-button"
//                   style={{ borderRadius: RADIUS }}
//                   onClick={() => setDecision(slot.tone)}
//                   whileTap={{ scale: 0.96 }}
//                 >
//                   <Badge id={`${slot.id}-choice`}>{slot.mark(false)}</Badge>
//                   <MorphWord slot={slot.id} base={slot.base} />
//                 </motion.button>
//               )}
//             </AnimatePresence>
//           ))}
//         </div>
//       </div>
//     </MotionConfig>
//   );
// }

/* ═════════════════════════════════════════════════════════
 * V2 — one node per slot
 *
 * v1 above swapped THREE different nodes per slot (choice / result / undo)
 * through AnimatePresence, then stitched identity back together with a
 * `layoutId` on the pill and one more per letter. The letters only had to be
 * split because the node was genuinely being destroyed.
 *
 * v2 keeps ONE persistent button per slot. State changes its class and its
 * children, never its identity, so:
 *   · `layout` replaces `layoutId` — same element, Motion just measures
 *     before and after and interpolates
 *   · the word is plain text again; it glides because its wrapper does
 *   · the badge recolours in place instead of cross-fading, because on the
 *     pressed slot it is the same <svg> the whole way through
 *
 * Only two things still mount and unmount, and both are content:
 *   · the suffix "d" / "ed" — drops in from above, blurred, on press
 *   · the whole label on the slot that collapses to the undo circle
 * ═════════════════════════════════════════════════════════ */

/* Deciding is a deliberate act, so it carries a little weight and a little
 * bounce; undo is a correction the user wants over with, so it snaps back
 * flat. Same family of spring either way — the block still reads as one
 * object, it just knows which direction it is travelling. */
const DECIDE: Transition = { type: "spring", duration: 0.42, bounce: 0.18 };
const UNDO: Transition = { type: "spring", duration: 0.3, bounce: 0 };

/* Content swaps are quicker and bounce-free: they are changes of substance,
 * not physical moves, and overshoot on text looks like a glitch. */
const SWAP: Transition = { type: "spring", duration: 0.32, bounce: 0 };

const RADIUS = 999;

/* Motion interpolates colours, and it cannot read a CSS custom property, so
 * the animated values live here as literals. The CSS keeps the same colours
 * as tokens for everything that is not animated. */
const INK = { rest: "#0a0a0a", onColor: "#ffffff", pill: "#f2f2f2" };
const TONE = { approve: "#4cc85c", reject: "#f0392b" };

/* Colour is not a physical move, so it gets no bounce — but it is still a
 * spring, like everything else in the block: nothing here is a tween. A
 * bounce-free spring settles on a fill without the flicker an overshooting
 * one would give it. */
const TINT: Transition = { type: "spring", duration: 0.24, bounce: 0 };

/* The suffix is the whole point of the swap: it arrives from above and
 * leaves downward, so the past tense reads as dropping into place. */
const suffixVariants = {
  initial: { opacity: 0, y: "-0.55em", filter: "blur(4px)" },
  active: { opacity: 1, y: "0em", filter: "blur(0px)" },
  exit: { opacity: 0, y: "0.55em", filter: "blur(4px)", transition: LEAVE },
};

/* ── Reward layer ──────────────────────────────────────────
 * Two one-shot flourishes, mounted only while a slot is expanded and torn
 * down on undo, so they replay on every fresh decision.
 *
 * Approve gets confetti: a fan of particles thrown upward that arc over and
 * fall. Reject deliberately gets NO particles — a burst is a celebration, and
 * celebrating a rejection is the wrong feeling. It gets impact instead: a
 * short shake and a single ring pulsing out of the pill.
 *
 * Both are rare, deliberate, once-per-decision moments, which is the only
 * place this much motion is earned.
 * ───────────────────────────────────────────────────────── */

/* Deterministic pseudo-random: Math.random() would render different values on
 * the server and the client and blow up hydration. Seeded by index, this is
 * the same field every time — and a fixed field is easier to art-direct. */
function frac(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const CONFETTI_COLORS = [
  "#4cc85c",
  "#2fa8ff",
  "#ffc531",
  "#ff6f91",
  "#8b5cf6",
  "#ffffff",
];

const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  /* Fan the throw across the upper half only — particles leaving downward
   * out of a pill look like debris, not celebration. */
  const angle = (-166 + (142 * i) / 17 + frac(i) * 12) * (Math.PI / 180);
  const dist = 68 + frac(i + 9) * 78;
  const round = frac(i + 3) > 0.55;
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    drift: (frac(i + 5) - 0.5) * 46,
    fall: 96 + frac(i + 7) * 92,
    spin: (frac(i + 11) - 0.5) * 620,
    w: round ? 7 + frac(i + 2) * 3 : 5 + frac(i + 4) * 4,
    h: round ? 7 + frac(i + 2) * 3 : 9 + frac(i + 6) * 5,
    round,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    dur: 0.78 + frac(i + 13) * 0.34,
    delay: frac(i + 17) * 0.06,
  };
});

function Confetti() {
  return (
    <span className="approve-burst" aria-hidden="true">
      {CONFETTI.map((p, i) => (
        <motion.span
          key={i}
          className="approve-confetti"
          style={{
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
          }}
          initial={{ x: 0, y: 0, scale: 0.4, rotate: 0, opacity: 0 }}
          /* Three keyframes per axis: launch, apex, fall. Splitting x and y
           * lets gravity live only on y — the horizontal throw keeps its
           * ease-out while the vertical leg eases IN on the way down, which
           * is what makes it read as weight rather than a fade. */
          animate={{
            x: [0, p.dx, p.dx + p.drift],
            y: [0, p.dy, p.dy + p.fall],
            scale: [0.4, 1, 0.92],
            rotate: [0, p.spin],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            delay: p.delay,
            x: {
              duration: p.dur,
              times: [0, 0.42, 1],
              ease: [0.16, 1, 0.3, 1],
            },
            y: {
              duration: p.dur,
              times: [0, 0.42, 1],
              ease: ["easeOut", "easeIn"],
            },
            scale: { duration: p.dur, times: [0, 0.24, 1], ease: "easeOut" },
            rotate: { duration: p.dur, ease: "linear" },
            opacity: {
              duration: p.dur,
              times: [0, 0.06, 0.62, 1],
              ease: "linear",
            },
          }}
        />
      ))}
    </span>
  );
}

/* The rejection's answer to confetti: one ring leaving the pill and gone.
 * `boxShadow` rather than a border so it costs no layout and can be scaled. */
function ImpactRing({ tone }: { tone: string }) {
  return (
    <motion.span
      className="approve-ring"
      aria-hidden="true"
      style={{ borderRadius: RADIUS, boxShadow: `0 0 0 2px ${tone}` }}
      initial={{ opacity: 0.5, scale: 1 }}
      animate={{ opacity: 0, scale: 1.14 }}
      transition={{ type: "spring", duration: 0.45, bounce: 0 }}
    />
  );
}

type SlotId = "reject" | "approve";
type Clicked = SlotId | null;

const SLOTS: {
  id: SlotId;
  label: string;
  suffix: string;
  tone: string;
  glyph: "cross" | "check";
}[] = [
  {
    id: "reject",
    label: "Reject",
    suffix: "ed",
    tone: TONE.reject,
    glyph: "cross",
  },
  {
    id: "approve",
    label: "Approve",
    suffix: "d",
    tone: TONE.approve,
    glyph: "check",
  },
];

/* One <svg> for the life of the slot. Idle it is a tinted disc with a white
 * glyph; expanded the two swap — animated, not re-rendered, so the badge
 * never blinks. Only the slot that LOSES has to change glyph, and that one
 * swap is the single crossfade left in the component. */
function SlotMark({
  glyph,
  tone,
  expanded,
  collapsed,
}: {
  glyph: "cross" | "check";
  tone: string;
  expanded: boolean;
  collapsed: boolean;
}) {
  const path =
    glyph === "check"
      ? "M6.8 12.4 10.4 16 17.2 8.8"
      : "M8.2 8.2 15.8 15.8M15.8 8.2 8.2 15.8";

  /* No `mode` — the two glyphs are stacked in the same fixed box and fade
     through each other. `mode="wait"` would hold the incoming one back until
     the outgoing had finished leaving, which is exactly the lag being fixed. */
  return (
    <AnimatePresence initial={false}>
      {collapsed ? (
        <motion.svg
          key="undo"
          className="approve-mark"
          viewBox="0 0 24 24"
          aria-hidden="true"
          initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
          transition={MARK}
        >
          <path
            d="M9 6 4.5 10.5 9 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 10.5h9a5.5 5.5 0 0 1 0 11H10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      ) : (
        <motion.svg
          key="glyph"
          className="approve-mark"
          viewBox="0 0 24 24"
          aria-hidden="true"
          initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
          transition={MARK}
        >
          <motion.circle
            cx="12"
            cy="12"
            r="12"
            initial={false}
            animate={{ fill: expanded ? INK.onColor : tone }}
            transition={TINT}
          />
          <motion.path
            d={path}
            fill="none"
            initial={false}
            animate={{ stroke: expanded ? tone : INK.onColor }}
            transition={TINT}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

export default function ApproveSwitch({ className }: { className?: string }) {
  const [clicked, setClicked] = useState<Clicked>(null);
  /* Confetti and a shake are decoration, so under reduced motion they are not
   * softened — they are simply not mounted. The decision still reads without
   * them; the pill and the word carry it. */
  const reduced = useReducedMotion();
  /* Returning to idle IS the undo, whichever slot the press came from. */
  const travel = clicked === null ? UNDO : DECIDE;

  return (
    <MotionConfig transition={travel} reducedMotion="user">
      <div className={`approve-stage${className ? ` ${className}` : ""}`}>
        <div className="approve-row">
          {SLOTS.map((slot) => {
            const expanded = clicked === slot.id;
            const collapsed = clicked !== null && !expanded;
            const state = expanded
              ? "expanded"
              : collapsed
                ? "collapsed"
                : "idle";

            const celebrate = expanded && slot.id === "approve" && !reduced;
            const rebuff = expanded && slot.id === "reject" && !reduced;

            return (
              /* The wrapper does not participate in the layout animation, so
                 it is a stable frame to hang the flourishes on — and shaking
                 it leaves the button's own transform free for `layout`, which
                 would otherwise fight an `x` animation on the same node. */
              <motion.span
                key={slot.id}
                className="approve-slot-wrap"
                animate={{ x: rebuff ? [0, -7, 6, -4, 3, -1.5, 0] : 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <AnimatePresence>
                  {rebuff && <ImpactRing key="ring" tone={slot.tone} />}
                </AnimatePresence>
                <AnimatePresence>
                  {celebrate && <Confetti key="confetti" />}
                </AnimatePresence>
                <motion.button
                  type="button"
                  layout
                  data-state={state}
                  className="approve-slot"
                  /* Radius must be an inline pixel value — a layout animation
                   * scales the box, and Motion can only undo the corner
                   * distortion when it knows the radius in px. */
                  style={{ borderRadius: RADIUS }}
                  animate={{
                    backgroundColor: expanded ? slot.tone : INK.pill,
                    color: expanded ? INK.onColor : INK.rest,
                  }}
                  transition={{
                    layout: travel,
                    backgroundColor: TINT,
                    color: TINT,
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setClicked(clicked === null ? slot.id : null)}
                  aria-label={collapsed ? "Undo decision" : undefined}
                  aria-pressed={expanded}
                >
                  <motion.span layout="position" className="approve-badge">
                    <SlotMark
                      glyph={slot.glyph}
                      tone={slot.tone}
                      expanded={expanded}
                      collapsed={collapsed}
                    />
                  </motion.span>

                  {/* popLayout takes the label out of flow the instant it starts
                    leaving, so the collapsing pill shrinks around it instead
                    of waiting for the fade to finish and then snapping. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {!collapsed && (
                      <motion.span
                        key="label"
                        layout="position"
                        className="approve-slot-label"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)", transition: LEAVE }}
                        transition={SWAP}
                      >
                        {slot.label}
                        <AnimatePresence mode="popLayout" initial={false}>
                          {expanded && (
                            <motion.span
                              key="suffix"
                              className="approve-suffix"
                              variants={suffixVariants}
                              initial="initial"
                              animate="active"
                              exit="exit"
                              transition={SWAP}
                            >
                              {slot.suffix}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.span>
            );
          })}
        </div>
      </div>
    </MotionConfig>
  );
}
