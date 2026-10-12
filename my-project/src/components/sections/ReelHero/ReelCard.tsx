"use client";

import { memo } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import {
  parseHex,
  rgba,
  slotAt,
  stageScrim,
  type Reel,
  type RingConfig,
} from "./reel-geometry";

/**
 * Gradient shown under a card while its artwork is still decoding.
 *
 * A card whose photo has not arrived would otherwise be a hole on the ring.
 * A tint keeps it reading as a card, and the photo covers it the moment it
 * lands.
 */
const CARD_TINTS = [
  ["#f2743a", "#b4341a"],
  ["#3aa0ff", "#1b4fd8"],
  ["#7c5cff", "#4421c4"],
  ["#1fae6b", "#0b6b45"],
  ["#fbd24e", "#c07a08"],
  ["#f2546d", "#a01440"],
];

const tintFor = (index: number): string => {
  const [from, to] = CARD_TINTS[index % CARD_TINTS.length];

  return `linear-gradient(135deg, ${from}, ${to})`;
};

interface ReelCardProps {
  cardHeight: number;
  cardRadius: number;
  cardWidth: number;
  config: RingConfig;
  /** Which reel this card *is*. Fixed for the component's whole life. */
  index: number;
  ink: string;
  /** Scroll position, in reel units. The only thing that drives the card. */
  phi: MotionValue<number>;
  reel: Reel;
  showDetails: boolean;
  stage: string;
  /** Bumped by the parent when the layout changes, so a paused ring still re-lays-out. */
  tick: MotionValue<number>;
}

/**
 * One card on the ring — one card per *reel*, not per ring position.
 *
 * That is the whole reason this does not flicker. The element is welded to
 * its reel, so `src` is written once at mount and never touched again; what
 * moves is the card. Every visual property is a motion value derived from
 * `phi`, so after mounting there is no React work here at all, and `memo`
 * keeps an unrelated parent render from reaching the image.
 *
 * `slotAt` runs once per frame per card and the projections read off that
 * one result.
 */
const ReelCardImpl = ({
  cardHeight,
  cardRadius,
  cardWidth,
  config,
  index,
  ink,
  phi,
  reel,
  showDetails,
  stage,
  tick,
}: ReelCardProps) => {
  const reduced = useReducedMotion();

  const slot = useTransform([phi, tick], ([p]: number[]) =>
    slotAt(p, index, config),
  );

  // Centre the card on its point. A transform beats `left`/`top` here: the
  // whole ring then lives on the compositor and never touches layout.
  const x = useTransform(slot, (s) => s.x - cardWidth / 2);
  const y = useTransform(slot, (s) => s.y - cardHeight / 2);
  // Scale rides the transform so the card and its shadow grow together: a
  // crest card casts the bigger, softer shadow it should.
  const scale = useTransform(slot, (s) => s.scale);
  const zIndex = useTransform(slot, (s) => s.z);
  // Always a blur, never `none`. Toggling between them creates and destroys
  // a compositing layer, and the crest card crosses that threshold on every
  // single beat — which is a flash of its own, independent of the images.
  const filter = useTransform(
    slot,
    (s) => `blur(${(s.blur < config.blurFloor ? 0 : s.blur).toFixed(2)}px)`,
  );
  const land = useTransform(slot, (s) => s.land);

  /* --------------------------------------------------------------- depth */

  /**
   * The card stops being a flat photo.
   *
   * Three things stacked in one `box-shadow`, all keyed off how close the
   * card is to the crest (`near`, 0 far / 1 on it):
   *
   *   ambient  a small constant contact shadow, so even the far cards sit on
   *            the stage rather than floating on it
   *   key      a directional throw that *grows* with the crest — the card the
   *            ring is presenting casts the big, soft shadow of the object
   *            nearest the light, which is what reads as "this one is lifted"
   *   glow     the crest card's own accent, bled out beneath it, so the one
   *            picture that is playing is lit by its own colour
   *
   * And the `inset` layers turn the edge into a bezel: a hairline frame, a
   * specular top edge catching the light, and a soft interior floor at the
   * bottom. That is the whole difference between a photo pasted on the page
   * and a lit, framed object.
   */
  const near = useTransform(slot, (s) => 1 - s.distance);
  const keyY = useTransform(near, (n) => (6 + 46 * n).toFixed(1));
  const keyBlur = useTransform(near, (n) => (16 + 78 * n).toFixed(1));
  const keySpread = useTransform(near, (n) => (-8 - 14 * n).toFixed(1));
  const keyAlpha = useTransform(near, (n) => (0.45 + 0.28 * n).toFixed(3));

  // The accent, static per reel, bled out beneath the crest and faded in on
  // `land` so only the presented card wears its colour.
  const glow = useTransform(land, (l) =>
    rgba(reel.accent ?? "#000000", 0.5 * l),
  );
  // The same accent as a hairline frame on the crest card, so the picture is
  // framed in the colour it gives the rest of the hero.
  const frame = useTransform(land, (l) => rgba(reel.accent ?? ink, 0.85 * l));

  const boxShadow = useMotionTemplate`0 2px 6px rgba(0,0,0,0.42), 0 ${keyY}px ${keyBlur}px ${keySpread}px rgba(0,0,0,${keyAlpha}), 0 26px 90px -16px ${glow}, inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 0 0 1.5px ${frame}, inset 0 1.5px 0 rgba(255,255,255,0.22), inset 0 -18px 34px -18px rgba(0,0,0,0.55)`;

  // Opaque whenever the stage can be blended toward; see `stageScrim`.
  const readable = parseHex(stage) !== null;
  const scrim = useTransform(slot, (s) => stageScrim(stage, s.opacity));
  const opacity = useTransform(slot, (s) => (readable ? 1 : s.opacity));

  // Scrubber fill under the crest, in the reel's own accent.
  const accent = reel.accent ?? ink;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0"
      style={{
        filter,
        height: cardHeight,
        opacity,
        scale,
        transformOrigin: "center center",
        width: cardWidth,
        x,
        y,
        zIndex,
      }}
    >
      <motion.div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: tintFor(index),
          borderRadius: cardRadius,
          boxShadow,
        }}
      >
        {/* A fixed intrinsic size, not `fill` + `sizes`. With `sizes` derived
            from the measured card, a resize rewrites the `srcset` and the
            browser re-picks a candidate — which is a fetch, a decode and a
            flash. A constant 640x360 resolves to one URL for the life of the
            page. */}
        <Image
          alt={reel.alt ?? reel.label ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
          height={360}
          loading="eager"
          src={reel.src}
          width={640}
        />

        {/* Specular sheen. A thin diagonal wash of light across the top-left,
            so the surface reads as glass catching a light rather than a matte
            print. Screen blend keeps it to the highlights and never darkens
            the photo. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 46%)",
          }}
        />

        {/* The crest chrome — the whole "this is a showreel, not a photo"
            signal. Gated on `land`, so only the reel being presented is ever
            marked as playing. */}
        {showDetails ? (
          <motion.div
            className="absolute inset-0"
            style={{ opacity: land }}
          >
            {/* Cinematic floor so the controls stay legible over any frame. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.12) 60%, rgba(0,0,0,0))",
              }}
            />

            {/* NOW PLAYING, top-left, with a live dot in the reel's accent. */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="relative grid place-items-center">
                <span
                  className="block size-1.5 rounded-full"
                  style={{ background: accent }}
                />
                {!reduced ? (
                  <motion.span
                    className="absolute size-1.5 rounded-full"
                    style={{ background: accent }}
                    animate={{ opacity: [0.7, 0], scale: [1, 2.6] }}
                    transition={{
                      duration: 1.6,
                      ease: "easeOut",
                      repeat: Infinity,
                    }}
                  />
                ) : null}
              </span>
              <span
                className="text-[9px] leading-none font-semibold tracking-[0.18em] uppercase"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                Now playing
              </span>
            </div>

            {/* The play affordance: a glass disc ringed in the reel's accent.
                This is the single clearest "these are videos" signal on the
                stage. */}
            <span
              className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full backdrop-blur-md"
              style={{
                background: "rgba(10,10,12,0.32)",
                boxShadow: `inset 0 0 0 1.5px ${rgba(accent, 0.9)}, inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 24px -6px rgba(0,0,0,0.5)`,
                height: 54,
                width: 54,
              }}
            >
              <svg
                aria-hidden
                fill={ink}
                height="15"
                style={{ marginLeft: 2 }}
                viewBox="0 0 8 10"
                width="12"
              >
                <path d="M0 0.6a.6.6 0 0 1 .92-.5l6.3 4.1a.6.6 0 0 1 0 1l-6.3 4.1A.6.6 0 0 1 0 8.8V.6Z" />
              </svg>
            </span>

            {/* Baseline scrubber + timecode. A single thin rail across the
                foot of the frame, filled a third of the way in the accent,
                with the runtime pinned to its right — the frame now reads as
                a player that is mid-clip. */}
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-3">
              <span
                className="relative h-[3px] flex-1 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.22)" }}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: accent, width: "34%" }}
                />
              </span>

              {reel.duration ? (
                <span
                  className="rounded-[3px] px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-tight tabular-nums"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                    color: ink,
                  }}
                >
                  {reel.duration}
                </span>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </motion.div>

      {/* A scrim of the stage colour, not element opacity. Keeps the card
          opaque so it occludes its neighbours properly. */}
      {readable ? (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: scrim, borderRadius: cardRadius }}
        />
      ) : null}
    </motion.div>
  );
};

export const ReelCard = memo(ReelCardImpl);
