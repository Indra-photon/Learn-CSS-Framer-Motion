"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CropIcon,
  FavouriteIcon,
  Folder01Icon,
  FolderIcon,
  ArrowRight01Icon,
  GameController01Icon,
  MusicNote01Icon,
  PlayIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { rgba, type Reel } from "./reel-geometry";
import { REELS } from "./content";

/* ─────────────────────────────────────────────────────────
 * REELARC — the left wheel, and only the left wheel.
 *
 * One circle, centred far off the LEFT edge, carries four concentric things:
 *
 *   back lip      a thick dark arc behind the rail, the back of the drum
 *   icon rail     category icons on their own inner arc
 *   image strip   the reels, bent along the arc — each frame rotated to the
 *                 tangent so the band reads as a filmstrip wrapped on a drum,
 *                 frames flush edge-to-edge with no gaps
 *   front rim     a blue hairline where the band meets the content side,
 *                 with radial spokes fanning out toward the page and the
 *                 crest reel's metadata sitting in the slab between two of
 *                 them
 *
 * THE MATH
 *
 * Every frame is placed by the same two lines:
 *
 *     x = cx + R·cos θ
 *     y = cy + R·sin θ
 *
 * and then rotated by θ, which puts its local +x along the radius and its
 * local +y along the tangent. The whole placement is `translate(x, y)
 * rotate(θ)` — nothing else.
 *
 * But a frame is not a box. It is an ANNULAR SECTOR, cut out of its box with
 * `clip-path: path()`: two radial edges and two real `A` arcs, at
 *
 *     outer radius   Ro = radius + imgW / 2
 *     inner radius   Ri = Ro − imgW          ← the strip's width, exactly
 *
 * so both long sides curve with the wheel. Straight chords are what made
 * frames overlap: two chords meeting at one radius must cross at every other
 * one. Two sectors sharing a radial edge agree at every radius, so the
 * overlap stops existing rather than being tuned around.
 *
 * The angular width follows from arc length, s = R·θ: a frame that runs
 * `imgH` along the band spans `imgH / radius`. With true sectors that width
 * IS the step between frames, which is why the band tiles exactly — and why
 * the whole strip is a function of `radius` alone.
 * ───────────────────────────────────────────────────────── */

/** The one accent. Locked to blue-700; nothing here follows the reel colour. */
const BLUE = "#1d4ed8";
const BLUE_LIT = "#3b82f6";

/** The one circle everything is hung on. Distances are in pixels. */
const WHEEL = {
  /** Radius to the centre line of the image band. */
  radius: 1000,
  /** Where the crest frame's centre sits, measured from the stage's left. */
  crestX: 300,
  /** Image band: `w` is radial (its thickness), `h` is tangential (arc run). */
  imgW: 176,
  imgH: 136,
  /** The dark bezel riding on the outer side of every frame. */
  stripW: 56,
  /** How far the icon arc sits inside the band, and the lip behind it. */
  iconGap: 70,
  lipGap: 34,
};

const DEG = Math.PI / 180;

/** Outer and inner edge of the picture band. `Ri = Ro − imgW`. */
const PIC_OUTER = WHEEL.radius + WHEEL.imgW / 2;
const PIC_INNER = PIC_OUTER - WHEEL.imgW;

/**
 * Outer edge of the whole band — picture plus the bezel strip bolted to its
 * right. Concentric by construction: `radius + imgW/2 + stripW`.
 */
const RIM_R = PIC_OUTER + WHEEL.stripW;

/**
 * Angular width of one frame, in degrees — and, because the frames are true
 * sectors now, the step between them too. Arc length is s = R·θ, so a frame
 * that should run `imgH` along the band spans `imgH / radius`.
 */
const STEP = WHEEL.imgH / WHEEL.radius / DEG;

/**
 * A sliver of angle added to each side of a sector, so neighbours overlap by
 * a hair instead of meeting on an exact edge where antialiasing would show
 * the background through as a seam.
 */
const BLEED = 0.05;

/** Half a frame's angular width, in radians — the unit the clip maths uses. */
const HALF = (STEP / 2 + BLEED) * DEG;

/**
 * One ring of the band, as a box plus the curved shape cut out of it.
 *
 * A sector between radii r0 and r1 over ±HALF has its leftmost points where
 * the INNER arc ends (r0·cos HALF), its rightmost at the outer arc's midpoint
 * (r1), and stands 2·r1·sin HALF tall. That box is what the element is sized
 * to; `clip` then cuts the sector out of it with two real `A` arcs, so both
 * long sides curve with the wheel and neighbouring frames share an exact
 * radial edge — no corner left to poke through, at any radius.
 *
 * Coordinates are local to the box, so the shape is identical for every
 * frame and is built once.
 */
const ring = (r0: number, r1: number) => {
  const cosH = Math.cos(HALF);
  const sinH = Math.sin(HALF);
  const xMin = r0 * cosH;
  const yMax = r1 * sinH;

  // A point on the ring, in the box's own coordinates.
  const at = (r: number, phi: number) =>
    `${(r * Math.cos(phi) - xMin).toFixed(2)} ${(r * Math.sin(phi) + yMax).toFixed(2)}`;

  return {
    /** Size of the box the sector is cut from. */
    w: r1 - xMin,
    h: 2 * yMax,
    /** Where the box's centre sits on the wheel, and its extents. */
    rc: (xMin + r1) / 2,
    xMin,
    yMax,
    clip: `path("M ${at(r1, -HALF)} A ${r1} ${r1} 0 0 1 ${at(r1, HALF)} L ${at(r0, HALF)} A ${r0} ${r0} 0 0 0 ${at(r0, -HALF)} Z")`,
  };
};

/** The picture ring, and the bezel ring bolted to its outer edge. */
const PIC = ring(PIC_INNER, PIC_OUTER);
const BEZEL = ring(PIC_OUTER, RIM_R);

/** The bezel's box, placed in the picture box's coordinates. */
const BEZEL_AT = {
  left: BEZEL.xMin - PIC.xMin,
  top: PIC.yMax - BEZEL.yMax,
};

/** Half the arc the wheel is drawn over. Beyond this the stage has clipped it. */
const SPAN = 44;

/**
 * Spokes leave the rim at the seams BETWEEN frames — one per image edge, at
 * `(k + 1/2)·STEP` — so each slab on the content side is the continuation of
 * exactly one frame, and the crest's two spokes are that frame's own edges.
 */
const FAN_COUNT = 7;
const FAN_LEN = 1600;

const SPRING: Transition = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0.14,
};

/**
 * How far the hero's column sits beyond the rim. Wide enough to clear the
 * crest caption, which takes the space between the rim and this line.
 */
const HERO_X = 390;

/** Pixels of vertical drag that advance the wheel by one frame. */
const DRAG_PER = 70;

const RAIL = [
  { icon: Folder01Icon, label: "Projects" },
  { icon: FolderIcon, label: "Archive" },
  { icon: FavouriteIcon, label: "Saved" },
  { icon: CropIcon, label: "Frames" },
  { icon: Video01Icon, label: "Films" },
  { icon: MusicNote01Icon, label: "Sound" },
  { icon: GameController01Icon, label: "Play" },
];
const RAIL_ACTIVE = 3;
/** Rail spacing is set in pixels of arc, so it survives a radius change. */
const RAIL_GAP = 96;

/**
 * The claim this section is making. Kept as data so the copy can be read and
 * argued with in one place, rather than hunted for in the markup.
 *
 * It says the one thing the wheel cannot: that the work on it is for sale,
 * what it costs in TIME — the differentiator for a launch team with a date —
 * and what to do next. The wheel is then evidence for the claim instead of
 * an exhibit standing on its own.
 */
const HERO = {
  eyebrow: "Product video studio",
  title: ["Your launch film,", "cut in two weeks."],
  body: "Launch films, feature tours and onboarding for software teams. Briefed on Monday, scripted, shot and delivered inside a fortnight.",
  primary: "Book a 15-minute call",
  secondary: "See how we work",
  proof: "Twelve reels below. Every one shipped to a launch date.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export interface ReelArcProps {
  className?: string;
  reels?: Reel[];
}

export const ReelArc = ({ className, reels = REELS }: ReelArcProps) => {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [railOn, setRailOn] = useState(RAIL_ACTIVE);

  const stageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(820);

  useEffect(() => {
    const read = () => setHeight(stageRef.current?.offsetHeight ?? 820);

    read();
    window.addEventListener("resize", read);

    return () => window.removeEventListener("resize", read);
  }, []);

  // Centre sits off the LEFT edge, so the arc opens to the right.
  const cx = WHEEL.crestX - WHEEL.radius;
  const cy = height / 2;

  const frontR = RIM_R; // content-facing edge of the band (right)
  const iconR = PIC_INNER - WHEEL.iconGap;
  const lipR = iconR - WHEEL.lipGap;
  const railStep = RAIL_GAP / iconR / DEG;

  /** A point on the wheel at angular offset `a` (deg) from the crest. */
  const at = (a: number, r: number) => ({
    x: cx + r * Math.cos(a * DEG),
    y: cy + r * Math.sin(a * DEG),
  });

  /** Arc of radius `r` swept from `a0` to `a1`, as a path command. */
  const arc = (r: number, a0: number, a1: number) => {
    const p = at(a0, r);
    const q = at(a1, r);

    return `M ${p.x} ${p.y} A ${r} ${r} 0 0 1 ${q.x} ${q.y}`;
  };

  const trans = reduced ? { duration: 0 } : SPRING;
  const current = reels[active];

  /* ---- drag / wheel to spin the strip ---- */

  const drag = useRef({ y: 0, from: 0, down: false });

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, from: active, down: true };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) {
      return;
    }

    const steps = Math.round((e.clientY - drag.current.y) / DRAG_PER);
    const next =
      (((drag.current.from - steps) % reels.length) + reels.length) %
      reels.length;

    if (next !== active) {
      setActive(next);
    }
  };

  const onPointerUp = () => {
    drag.current.down = false;
  };

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + reels.length) % reels.length),
    [reels.length],
  );

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 8) {
      go(e.deltaY > 0 ? 1 : -1);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }

    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  /* ---- the slab the metadata sits in: the crest frame's own two edges ---- */

  const slab = STEP / 2;
  const meta = at(0, frontR);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-[#0a0a0b] text-[#f4f5f7]",
        className,
      )}
    >
      <div
        ref={stageRef}
        className="relative z-10 w-full"
        style={{ height: "clamp(760px, 100svh, 1000px)" }}
      >
        {/* ───────────── concentric rims + fan lines (one SVG) ───────────── */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            {/* Spokes fade along their length and are gone by the hero's
                column, so the fan reads as structure on the empty side
                rather than as rules struck through the copy. */}
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="arc-spoke"
              x1={meta.x}
              x2={meta.x + HERO_X - 40}
              y1={cy}
              y2={cy}
            >
              <stop offset="0" stopColor="#ffffff" stopOpacity={0.14} />
              <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.07} />
              <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Back lip — the dark back of the drum, behind the rail. */}
          <path
            d={arc(lipR, -SPAN, SPAN)}
            fill="none"
            stroke="#141416"
            strokeWidth={WHEEL.lipGap * 2 + 120}
          />

          {/* A darker shoulder right behind the strip. */}
          <path
            d={arc(PIC_INNER - 6, -SPAN, SPAN)}
            fill="none"
            stroke="#101013"
            strokeWidth={26}
          />

          {/* The bezel's continuous backing, so the band still reads as one
              dark ring past where the frames have faded out. */}
          <path
            d={arc(PIC_OUTER + WHEEL.stripW / 2, -SPAN, SPAN)}
            fill="none"
            stroke="#121216"
            strokeWidth={WHEEL.stripW}
          />

          {/* Front rim — blue hairline where the band meets the page. */}
          <path
            d={arc(frontR, -SPAN, SPAN)}
            fill="none"
            stroke={rgba(BLUE, 0.85)}
            strokeWidth={2}
          />

          {/* Radial spokes, one per frame edge, carrying the strip's rhythm
              out across the content side. The crest's own two edges are the
              brightest, and they are what bracket the metadata. */}
          {Array.from(
            { length: FAN_COUNT * 2 + 2 },
            (_, k) => k - FAN_COUNT - 1,
          ).map((k) => {
            // Seam between frame k and frame k + 1 — the edge of an image.
            const a = (k + 0.5) * STEP;
            const p = at(a, frontR + 2);
            const q = at(a, frontR + FAN_LEN);
            const edge = Math.abs(k + 0.5) < 1; // an edge of the crest frame
            const dim = Math.max(0.02, 0.1 - Math.abs(k) * 0.011);

            return (
              <line
                key={a}
                opacity={edge ? 1.6 * (dim + 0.06) : dim * 10}
                stroke="url(#arc-spoke)"
                strokeWidth={1}
                x1={p.x}
                x2={q.x}
                y1={p.y}
                y2={q.y}
              />
            );
          })}

          {/* Crest tick on the rim itself — the strip's reading line. */}
          <path
            d={arc(frontR, -slab, slab)}
            fill="none"
            stroke={BLUE_LIT}
            strokeWidth={4}
          />
        </svg>

        {/* ───────────────────────── image strip ───────────────────────── */}
        {/* One drag surface over the whole wheel. */}
        <div
          aria-label="Reel strip. Drag vertically, scroll, or press a frame."
          className="absolute inset-0 z-20 cursor-grab touch-none select-none active:cursor-grabbing"
          onKeyDown={onKeyDown}
          onPointerCancel={onPointerUp}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          role="listbox"
          tabIndex={0}
        >
          {reels.map((r, i) => {
            // Signed, wrapped offset so the strip is an endless loop.
            let off = i - active;
            const spread = reels.length / 2;

            if (off > spread) {
              off -= reels.length;
            }

            if (off < -spread) {
              off += reels.length;
            }

            // θ for this frame, and the one formula.
            const a = off * STEP;
            const p = at(a, PIC.rc);
            const away = Math.abs(off);
            const fade = away > 7 ? 0 : 1 - Math.min(away / 8, 1) * 0.8;
            const isCrest = off === 0;

            return (
              <motion.button
                key={r.src}
                aria-label={r.label}
                aria-selected={isCrest}
                className="absolute top-0 left-0"
                style={{
                  // The box the picture sector is cut from.
                  width: PIC.w,
                  height: PIC.h,
                  marginLeft: -PIC.w / 2,
                  marginTop: -PIC.h / 2,
                  transformOrigin: "center center",
                  zIndex: 40 - away,
                }}
                initial={false}
                animate={{
                  // translate(R·cosθ, R·sinθ) to the sector's centre …
                  x: p.x,
                  y: p.y,
                  // … then rotate by the same θ, which lays the sector on
                  // the wheel: local +x radial, local +y along the arc.
                  rotate: a,
                  opacity: fade,
                }}
                transition={trans}
                onClick={() => setActive(i)}
                role="option"
                type="button"
              >
                {/* The picture, cut to the curved sector. */}
                <span
                  className="absolute inset-0"
                  style={{ clipPath: PIC.clip }}
                >
                  <Image
                    alt={r.alt ?? r.label ?? ""}
                    className="h-full w-full object-cover"
                    height={Math.round(PIC.h * 2)}
                    src={r.src}
                    width={Math.round(PIC.w * 2)}
                  />
                  {/* Everything off the crest sits back in shadow. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: "#06060a",
                      opacity: isCrest ? 0 : Math.min(0.12 + away * 0.07, 0.5),
                    }}
                  />
                </span>

                {/* The bezel: the next ring out, over the same two angles, so
                    it is concentric with the picture by construction. Its box
                    is taller than the picture's — the same angle subtends more
                    arc further out — which is why it is placed by `BEZEL_AT`
                    rather than simply butted against `left: 100%`. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    left: BEZEL_AT.left,
                    top: BEZEL_AT.top,
                    width: BEZEL.w,
                    height: BEZEL.h,
                    clipPath: BEZEL.clip,
                    // The first stop is the crease where bezel meets picture.
                    background: isCrest
                      ? "linear-gradient(90deg, rgba(0,0,0,0.6) 0 3px, #212126 3px, #1a1a1f 62%, #141418 100%)"
                      : "linear-gradient(90deg, rgba(0,0,0,0.6) 0 3px, #1b1b20 3px, #141418 62%, #0f0f13 100%)",
                  }}
                />
              </motion.button>
            );
          })}
        </div>

        {/* ───────────────────── crest caption (on the rim) ───────────────────── */}
        {/* A caption on the wheel, not a content block: it hugs the rim at
            θ = 0, so it tracks the geometry rather than a hand-placed offset,
            and it stays small so the hero can carry the page. */}
        <div
          className="absolute z-40 flex -translate-y-1/2 items-center gap-4"
          style={{ left: meta.x + 36, top: meta.y, width: HERO_X - 100 }}
        >
          <span
            aria-hidden
            className="h-11 w-[3px] shrink-0 rounded-full"
            style={{ background: BLUE_LIT }}
          />

          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={current?.src}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-0"
              exit={{ opacity: 0, y: -5 }}
              initial={{ opacity: 0, y: 5 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            >
              <p className="truncate text-[15px] leading-tight font-medium tracking-[0.02em] uppercase">
                {current?.label}
              </p>
              <p className="mt-1 truncate text-[13px] text-[#f4f5f7]/50 tabular-nums">
                {current?.caption} · {current?.duration} ·{" "}
                {pad(active + 1)}/{pad(reels.length)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* An inline glyph, not a second call to action: the hero's button
              owns the accent, this one just plays what is on the crest. */}
          <button
            aria-label={`Play ${current?.label ?? "reel"}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-[#f4f5f7]/55 transition-colors hover:text-[#f4f5f7]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(244,245,247,0.14)" }}
            type="button"
          >
            <HugeiconsIcon icon={PlayIcon} size={15} strokeWidth={2} />
          </button>
        </div>

        {/* ───────────────────────────── the hero ───────────────────────────── */}
        {/* Anchored to the spoke grid: its left edge is the rim plus a gutter,
            so the fan lines band the copy instead of running past it. */}
        <div
          className="absolute z-40 flex -translate-y-1/2 flex-col items-start"
          style={{
            left: meta.x + HERO_X,
            top: cy,
            // Never wider than what is left of the stage: the column starts
            // at a fixed distance from the rim, so on a narrow screen the
            // copy has to give way rather than run off the edge.
            maxWidth: `min(34rem, calc(100vw - ${Math.round(meta.x + HERO_X)}px - 3rem))`,
          }}
        >
          <p
            className="text-[12px] font-medium tracking-[0.16em] uppercase"
            style={{ color: BLUE_LIT }}
          >
            {HERO.eyebrow}
          </p>

          <h2 className="mt-5 text-[clamp(2.5rem,3.4vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.025em] text-balance">
            {HERO.title[0]}
            <br />
            <span className="text-[#f4f5f7]/55">{HERO.title[1]}</span>
          </h2>

          <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.6] text-[#f4f5f7]/60 text-pretty">
            {HERO.body}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              className="group inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-medium text-white transition-[transform,background-color] hover:-translate-y-px active:translate-y-0"
              style={{ background: BLUE }}
              type="button"
            >
              {HERO.primary}
              <HugeiconsIcon
                className="transition-transform group-hover:translate-x-0.5"
                icon={ArrowRight01Icon}
                size={17}
                strokeWidth={2}
              />
            </button>

            <button
              className="inline-flex h-12 items-center rounded-xl px-5 text-[15px] font-medium text-[#f4f5f7]/75 transition-colors hover:text-[#f4f5f7]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(244,245,247,0.16)" }}
              type="button"
            >
              {HERO.secondary}
            </button>
          </div>

          <p className="mt-8 text-[13px] text-[#f4f5f7]/35">{HERO.proof}</p>
        </div>

        {/* ─────────────────────────── icon rail ─────────────────────────── */}
        {/* On its own inner arc. Icons stay upright for legibility; only their
            positions follow the curve. */}
        <div className="pointer-events-none absolute inset-0 z-30">
          {RAIL.map((item, i) => {
            // First icon at the top: negative angle is up on this wheel.
            const a = (i - (RAIL.length - 1) / 2) * railStep;
            const p = at(a, iconR);
            const on = i === railOn;

            return (
              <button
                key={item.label}
                aria-label={item.label}
                aria-pressed={on}
                className="pointer-events-auto absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl"
                onClick={() => setRailOn(i)}
                style={{ left: p.x, top: p.y }}
                type="button"
              >
                {/* Plain span, not a `layoutId` pill: the rail's buttons are
                    positioned off `height`, which is read after mount, and a
                    shared-layout animation latches onto that first, wrong
                    layout and never lets go of the offset. */}
                {on ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: rgba(BLUE, 0.16),
                      boxShadow: `inset 0 0 0 1px ${rgba(BLUE, 0.6)}`,
                    }}
                  />
                ) : null}
                <HugeiconsIcon
                  className="relative"
                  color={on ? "#5b8def" : "rgba(244,245,247,0.42)"}
                  icon={item.icon}
                  size={on ? 23 : 20}
                  strokeWidth={1.8}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReelArc;
