"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Transition,
} from "motion/react";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — covers ⇄ cylinder
 *
 *  browsing   five category covers in a grid. Each carries a `layoutId`.
 *  on select  the pressed cover TRAVELS AND GROWS into the centre card of a
 *             cylinder that fills the panel. It does not fade out and back
 *             in — it is the same element, somewhere else and bigger.
 *  folding    the cylinder cannot exist during that flight (see THE DEPTH
 *             GATE), so the card lands flat and the ring folds in behind it.
 *  switching  changing category swaps the whole stage. There is nothing to
 *             travel between, so it crossfades — AnimatePresence popLayout,
 *             the outgoing stage pulled out of flow so the incoming one takes
 *             the panel immediately.
 *  chrome     filters and close ride ON TOP of the morph, never inside it.
 *             A shared layout animation cannot be steered, so they arrive
 *             once the card has nearly landed.
 * ───────────────────────────────────────────────────────── */

const SELECT: Transition = { type: "spring", duration: 0.52, bounce: 0.16 };
const RETURN: Transition = { type: "spring", duration: 0.4, bounce: 0 };
const LEAVE: Transition = { type: "spring", duration: 0.16, bounce: 0 };

// Navigating the ring. No bounce — a photo settling past its
// mark and coming back reads as a wobble, not as weight.
const NAV: Transition = { type: "spring", duration: 0.44, bounce: 0 };

const FOLD_IN: Transition = {
  type: "spring",
  duration: 0.46,
  bounce: 0,
  delay: 0.1,
};

const FOLD_OUT: Transition = { type: "spring", duration: 0.28, bounce: 0 };

const px = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

type Photo = { id: number; caption: string };

type Category = { id: string; name: string; photos: Photo[] };

const categories: Category[] = [
  {
    id: "living",
    name: "Living room",
    photos: [
      { id: 6480707, caption: "Leather sofa and bay windows" },
      { id: 2062431, caption: "Day bed and reading nook" },
      { id: 1457842, caption: "Looking out over the bay" },
      { id: 2635038, caption: "Rug, floor lamp, low table" },
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    photos: [
      { id: 6585757, caption: "Marble headboard wall" },
      { id: 7018391, caption: "Dressing corner and mirror" },
      { id: 6585601, caption: "Glazed partition to the hall" },
      { id: 6412834, caption: "Second room, two singles" },
    ],
  },
  {
    id: "bathroom",
    name: "Bathroom",
    photos: [
      { id: 342800, caption: "Stone arch and vanity" },
      { id: 1454804, caption: "Double sink, freestanding tub" },
      { id: 3935350, caption: "Round mirror, tiled shower" },
      { id: 3316918, caption: "Glass shower and towel rail" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen & dining",
    photos: [
      { id: 2724749, caption: "Island and range" },
      { id: 1080696, caption: "Dining table under the skylight" },
      { id: 2029722, caption: "Breakfast bar" },
      { id: 6316065, caption: "Garden door and prep counter" },
    ],
  },
  {
    id: "shared",
    name: "Shared space",
    photos: [
      { id: 3705529, caption: "Stairs down to the lounge" },
      { id: 1571460, caption: "Entrance and landing" },
      { id: 8082553, caption: "Communal TV corner" },
      { id: 1571468, caption: "Long table, shared dining" },
    ],
  },
];

const totalPhotos = categories.reduce((n, c) => n + c.photos.length, 0);

const coverIdFor = (categoryId: string) => `cover-${categoryId}`;

/* ── Primitives ─────────────────────────────────────────── */

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => lerp(outMin, outMax, clamp((value - inMin) / (inMax - inMin)));

const smoothStep = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

/* ── Geometry ───────────────────────────────────────────────
 *
 * Photos sit on a cylinder. A photo's angle on it is
 *
 *   theta = offset * SPACING
 *
 * ...which makes position and depth the same sin/cos pair:
 *
 *   x = R * sin(theta)
 *   z = R * cos(theta) - R
 *
 * The -R keeps the front photo at z = 0. R is measured from
 * the panel rather than hard-coded, so the neighbours keep the
 * same peek at any width.
 * ───────────────────────────────────────────────────────── */

const RADIUS_RATIO = 0.42;
const SPACING = 0.62;
const ROTATION_DAMP = 0.55;

const SIGMA = 0.95;
const MIN_SCALE = 0.78;
const MIN_OPACITY = 0.25;
const MAX_BLUR = 2.5;
const CULL_START = 1.5;
const CULL_END = 2.6;

const focusAt = (offset: number) =>
  Math.exp(-(offset * offset) / (2 * SIGMA * SIGMA));

/* ── THE DEPTH GATE ─────────────────────────────────────────
 *
 * layoutId is FLIP: motion measures the element's box before
 * and after, then animates the difference through transform.
 * Its projection model is 2D — translate and uniform scale.
 *
 * rotateY and translateZ under a perspective are not
 * representable there, and a plain motion.div is not a
 * projection node, so motion cannot compensate for an
 * ancestor's scale either.
 *
 * All three are therefore gated behind a `depth` scalar:
 *
 *   depth = 0   flat, axis-aligned, scale 1. FLIP is exact.
 *   depth = 1   the full cylinder.
 *
 * The cover flies in face-on, then the ring folds. x is never
 * gated, so the fold is a fold and not a re-shuffle.
 * ───────────────────────────────────────────────────────── */

function Slide({
  index,
  photo,
  position,
  depth,
  radius,
  morphId,
  onSelect,
}: {
  index: number;
  photo: Photo;
  position: MotionValue<number>;
  depth: MotionValue<number>;
  radius: number;
  morphId?: string;
  onSelect: () => void;
}) {
  // Signed, fractional. 0 = centred, 0.43 = mid-flight.
  const offset = useTransform(position, (p) => index - p);

  const x = useTransform(offset, (o) => radius * Math.sin(o * SPACING));

  const z = useTransform(
    [offset, depth],
    ([o, d]: number[]) => (radius * Math.cos(o * SPACING) - radius) * d,
  );

  const rotateY = useTransform(
    [offset, depth],
    ([o, d]: number[]) => -o * SPACING * (180 / Math.PI) * ROTATION_DAMP * d,
  );

  const scale = useTransform([offset, depth], ([o, d]: number[]) =>
    lerp(1, mapRange(focusAt(o), 0, 1, MIN_SCALE, 1), d),
  );

  const opacity = useTransform(offset, (o) => {
    const d = Math.abs(o);
    const edge = 1 - smoothStep((d - CULL_START) / (CULL_END - CULL_START));
    return mapRange(focusAt(o), 0, 1, MIN_OPACITY, 1) * edge;
  });

  // filter repaints rather than riding the compositor, so it
  // drops out to `none` the moment it would round to zero.
  const filter = useTransform(offset, (o) => {
    const blur = smoothStep((Math.abs(o) - 1) / 1.5) * MAX_BLUR;
    return blur < 0.05 ? "none" : `blur(${blur.toFixed(2)}px)`;
  });

  const zIndex = useTransform(offset, (o) => Math.round(100 - Math.abs(o) * 10));

  const pointerEvents = useTransform(offset, (o) =>
    Math.abs(o) < 2 ? "auto" : "none",
  );

  const boxShadow = useTransform(offset, (o) => {
    const f = focusAt(o);
    return `0 ${lerp(12, 30, f).toFixed(1)}px ${lerp(30, 70, f).toFixed(1)}px rgba(0,0,0,${lerp(0.16, 0.34, f).toFixed(3)})`;
  });

  const captionOpacity = useTransform(
    [offset, depth],
    ([o, d]: number[]) => smoothStep(1 - Math.abs(o) / 0.8) * d,
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ zIndex, opacity, filter }}
    >
      {/* Height-driven, so the panel has no dead air. */}
      <motion.div
        className="aspect-[3/2] h-[78%]"
        style={{
          x,
          z,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.button
          type="button"
          onClick={onSelect}
          aria-label={photo.caption}
          whileTap={{ scale: 0.98 }}
          className="block h-full w-full cursor-pointer outline-none"
          style={{ pointerEvents }}
        >
          <motion.div
            layoutId={morphId}
            transition={SELECT}
            className="relative h-full w-full overflow-hidden bg-[#e8e8e8]"
            style={{ borderRadius: 16, boxShadow }}
          >
            <img
              src={px(photo.id, 1200)}
              alt={photo.caption}
              className="h-full w-full object-cover"
              draggable={false}
            />

            {/* Rides on top of the morph rather than inside it. */}
            <motion.div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pt-12 pb-4 text-left"
              style={{ opacity: captionOpacity }}
            >
              <div className="text-[13px] font-medium text-white">
                {photo.caption}
              </div>
            </motion.div>
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── One category's ring ────────────────────────────────────
 *
 * Each stage owns its own `position` and `depth`. That is what
 * lets the outgoing stage hold its place while it fades: a
 * shared scalar would snap it back to zero mid-exit.
 * ───────────────────────────────────────────────────────── */

function CategoryStage({
  category,
  radius,
  morphArmed,
  closing,
  onClose,
}: {
  category: Category;
  radius: number;
  morphArmed: boolean;
  closing: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  const position = useMotionValue(0);
  const depth = useMotionValue(morphArmed ? 0 : 1);

  const reduceMotion = useReducedMotion();

  const goTo = (next: number) => {
    const target = Math.round(clamp(next, 0, category.photos.length - 1));

    setIndex(target);
    animate(position, target, reduceMotion ? { duration: 0 } : NAV);
  };

  // Only the stage you opened into folds. The rest arrive at
  // depth 1 and simply crossfade.
  useEffect(() => {
    if (!morphArmed) return;

    if (reduceMotion) {
      depth.set(1);
      return;
    }

    animate(depth, 1, FOLD_IN);
  }, [depth, morphArmed, reduceMotion]);

  /*
   * Unfold before the viewer unmounts. The card has to fly
   * home flat for the same reason it flew in flat — FLIP
   * cannot measure a rotated box.
   */
  useEffect(() => {
    if (!closing || reduceMotion) return;

    animate(depth, 0, FOLD_OUT);
  }, [closing, depth, reduceMotion]);

  // No dependency array: the handler closes over `index`.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const arrow =
    "absolute top-1/2 z-[150] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#0b0b0b] backdrop-blur transition-colors duration-150 ease-out outline-none hover:bg-white disabled:pointer-events-none disabled:opacity-0";

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: LEAVE }}
      transition={SELECT}
    >
      <div
        className="absolute inset-0"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
      >
        {category.photos.map((photo, i) => (
          <Slide
            key={photo.id}
            index={i}
            photo={photo}
            position={position}
            depth={depth}
            radius={radius}
            morphId={i === 0 && morphArmed ? coverIdFor(category.id) : undefined}
            onSelect={() => goTo(i)}
          />
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous photo"
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SELECT, delay: 0.14 }}
        className={`${arrow} left-4`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M14.5 5.5L8 12l6.5 6.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => goTo(index + 1)}
        disabled={index === category.photos.length - 1}
        aria-label="Next photo"
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SELECT, delay: 0.14 }}
        className={`${arrow} right-4`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M9.5 5.5L16 12l-6.5 6.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
}

/* ── Viewer ─────────────────────────────────────────────────
 *
 * No AnimatePresence around this one. The cover grid stays
 * mounted underneath, so when this unmounts motion hands the
 * shared layoutId straight back and the card flies home.
 * Close is driven manually: fade the ground and unfold the
 * depth, then unmount.
 * ───────────────────────────────────────────────────────── */

function Viewer({
  startCategory,
  onClose,
}: {
  startCategory: number;
  onClose: () => void;
}) {
  const [categoryIndex, setCategoryIndex] = useState(startCategory);
  const [closing, setClosing] = useState(false);

  /*
   * The shared id is one-shot. It belongs to the cover you
   * opened from and is dropped the first time you change
   * category, permanently.
   *
   * Removing and re-adding a layoutId on a live element is the
   * thing to avoid here: motion re-registers the node, finds
   * the cover tile still mounted under the ground, and flies
   * the card in from it.
   */
  const [morphArmed, setMorphArmed] = useState(true);

  const ground = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  const category = categories[categoryIndex];

  // R is measured, so the peek holds at any panel width.
  const panelRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(460);

  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setRadius(entry.contentRect.width * RADIUS_RATIO);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      ground.set(1);
      return;
    }

    animate(ground, 1, { duration: 0.24, ease: "easeOut" });
  }, [ground, reduceMotion]);

  const requestClose = () => {
    if (closing) return;

    setClosing(true);

    if (reduceMotion) {
      onClose();
      return;
    }

    animate(ground, 0, { duration: 0.2, ease: [0.5, 0, 0.75, 0] });

    // The stage unfolds on `closing`; unmount once it is flat,
    // so the return flight is measured on an axis-aligned box.
    window.setTimeout(onClose, 260);
  };

  return (
    <div className="absolute inset-0">
      {/*
       * The ground is its own element. If the whole viewer
       * faded, the morphing card would fade with it.
       */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-[#f4f4f4]"
        style={{ opacity: ground }}
      />

      {/* Clipped, so a neighbour swinging wide never spills
          out of the panel. */}
      <div
        ref={panelRef}
        className="absolute inset-0 overflow-hidden rounded-2xl"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <CategoryStage
            key={category.id}
            category={category}
            radius={radius}
            morphArmed={morphArmed}
            closing={closing}
            onClose={requestClose}
          />
        </AnimatePresence>
      </div>

      {/* Chrome rides on top of the morph, never inside it. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-start justify-between gap-3 p-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SELECT, delay: 0.12 }}
      >
        <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-full bg-white/80 p-1 backdrop-blur">
          {categories.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (index === categoryIndex) return;
                setMorphArmed(false);
                setCategoryIndex(index);
              }}
              className={`relative cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-medium outline-none transition-colors duration-150 ${
                index === categoryIndex
                  ? "text-white"
                  : "text-[#666] hover:text-[#111]"
              }`}
            >
              {index === categoryIndex && (
                <motion.span
                  layoutId="filter-pill"
                  transition={SELECT}
                  className="absolute inset-0 rounded-full bg-[#111]"
                />
              )}
              <span className="relative">{item.name}</span>
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={requestClose}
          aria-label="Close gallery"
          whileTap={{ scale: 0.96 }}
          className="pointer-events-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#0b0b0b] backdrop-blur transition-colors duration-150 ease-out outline-none hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ── Cover grid ─────────────────────────────────────────────
 *
 * One cover per category, so the grid is a chooser rather than
 * a second copy of the gallery.
 *
 * Corner radius lives in `style`, not a class: motion only
 * counter-scales borderRadius when it owns the value. There is
 * no overflow-hidden on the grid either — on the way back the
 * cover is the animating element, and a clipping parent would
 * swallow the return flight.
 * ───────────────────────────────────────────────────────── */

function Cover({
  category,
  onClick,
  className,
  large,
}: {
  category: Category;
  onClick: () => void;
  className: string;
  large?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Show ${category.name}`}
      whileTap={{ scale: 0.98 }}
      className={`group relative cursor-pointer outline-none ${className}`}
    >
      <motion.div
        layoutId={coverIdFor(category.id)}
        transition={SELECT}
        className="relative h-full w-full overflow-hidden bg-[#eee]"
        style={{ borderRadius: 16 }}
      >
        <img
          src={px(category.photos[0].id, large ? 1200 : 600)}
          alt={category.name}
          className="h-full w-full object-cover transition duration-200 group-hover:brightness-[0.9]"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pt-10 pb-2.5 text-left">
          <div
            className={`font-medium text-white ${large ? "text-[15px]" : "text-[12px]"}`}
          >
            {category.name}
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

export default function GalleryCarousel() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <MotionConfig transition={open !== null ? SELECT : RETURN} reducedMotion="user">
      <main
        className="min-h-screen bg-white px-5 py-10 text-[#111] md:px-8"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#999] uppercase">
            Casa Azul · {totalPhotos} photos
          </div>

          <p className="mt-3 max-w-[560px] text-[13px] leading-[1.6] text-[#777]">
            Pick a room. Its cover travels and grows into the centre of a
            cylinder, then the ring folds in behind it.
          </p>

          {/*
           * The cover grid stays mounted while the viewer is
           * open. The ground washes in over it, so the four
           * covers you did not click lift off rather than
           * vanishing.
           */}
          <div className="relative mt-6 h-[480px] md:h-[520px]">
            <div className="grid h-full grid-cols-2 grid-rows-[2fr_1fr_1fr] gap-2 md:grid-cols-4 md:grid-rows-2">
              <Cover
                category={categories[0]}
                onClick={() => setOpen(0)}
                className="col-span-2 h-full w-full md:row-span-2"
                large
              />

              {categories.slice(1).map((category, index) => (
                <Cover
                  key={category.id}
                  category={category}
                  onClick={() => setOpen(index + 1)}
                  className="h-full w-full"
                />
              ))}
            </div>

            {open === null && (
              <motion.button
                type="button"
                onClick={() => setOpen(0)}
                whileTap={{ scale: 0.98 }}
                className="absolute right-4 bottom-4 z-10 flex cursor-pointer items-center gap-2 rounded-lg border border-[#111] bg-white px-4 py-2 text-[13px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.15)] outline-none transition-colors duration-150 hover:bg-[#f5f5f5]"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
                  <circle cx="3" cy="3" r="1.4" />
                  <circle cx="8" cy="3" r="1.4" />
                  <circle cx="13" cy="3" r="1.4" />
                  <circle cx="3" cy="8" r="1.4" />
                  <circle cx="8" cy="8" r="1.4" />
                  <circle cx="13" cy="8" r="1.4" />
                  <circle cx="3" cy="13" r="1.4" />
                  <circle cx="8" cy="13" r="1.4" />
                  <circle cx="13" cy="13" r="1.4" />
                </svg>
                Show all photos
              </motion.button>
            )}

            {open !== null && (
              <Viewer startCategory={open} onClose={() => setOpen(null)} />
            )}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
