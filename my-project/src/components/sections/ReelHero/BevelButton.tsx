"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Chamfered corners, cut on opposite diagonals.
 *
 * Cutting all four reads as a stop sign; cutting top-left and bottom-right
 * gives the shape a direction, which is what makes it look drawn rather than
 * rounded-off. The cut is the same 45° on both, so the two edges stay
 * parallel and the button reads as a machined part.
 */
const chamfer = (size: number): string =>
  `polygon(${size}px 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%, 0 ${size}px)`;

type Rgb = [number, number, number];

const parse = (hex: string): Rgb => {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const css = (c: Rgb): string => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

/** Mix toward white (`amount > 0`) or black (`amount < 0`). */
const mix = (c: Rgb, amount: number): Rgb => {
  const to = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);

  return c.map((v) => Math.round(v + (to - v) * t)) as Rgb;
};

const channel = (v: number): number => {
  const s = v / 255;

  return s <= 0.039_28 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (c: Rgb): number =>
  0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);

const contrast = (a: Rgb, b: Rgb): number => {
  const x = luminance(a);
  const y = luminance(b);

  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const FACE_LIGHT = 0.2;
const FACE_DARK = -0.16;
const AA = 4.5;

/**
 * A face the label can actually be read on.
 *
 * Two things make this worth solving rather than eyeballing. The label sits
 * on a *gradient*, so the colour it has to survive is the worst stop, not the
 * base — white on this hero's accent measures 3.08:1 against the base and
 * worse against the light end. And the fill is a preset value that can
 * change, so a colour typed in once goes quietly wrong the next time someone
 * edits the palette.
 *
 * So: pick the better label for the fill, then shift the face until the
 * weakest stop clears AA. A mid-tone fill — `editorial`'s #b4411b — has no
 * readable label at all until the face moves, which is exactly the case that
 * would have shipped unnoticed. Fills that already pass are left untouched.
 */
const faceFor = (hex: string): { base: Rgb; label: Rgb } => {
  const fill = parse(hex);
  const white: Rgb = [255, 255, 255];
  const dark = mix(fill, -0.9);
  const useWhite = contrast(white, fill) >= contrast(dark, fill);
  const label = useWhite ? white : dark;
  const step = 0.04 * (useWhite ? -1 : 1);

  for (let i = 0; i <= 25; i += 1) {
    const base = mix(fill, i * step);
    const stops: Rgb[] = [mix(base, FACE_LIGHT), base, mix(base, FACE_DARK)];

    if (Math.min(...stops.map((s) => contrast(label, s))) >= AA) {
      return { base, label };
    }
  }

  return { base: fill, label };
};

export type BevelTone = "accent" | "ghost";

interface BevelButtonProps {
  /** Depth of the corner cut, in pixels. */
  bevel?: number;
  children: ReactNode;
  className?: string;
  /** The fill for `accent`, and the rim and label for `ghost`. */
  color: string;
  href: string;
  /** The stage colour. The ghost's face is the stage, so only its rim shows. */
  stage: string;
  tone?: BevelTone;
}

/**
 * The call to action.
 *
 * A pill with a flat fill is the default SaaS button and reads as a component
 * someone installed. This is built from three stacked layers instead:
 *
 *   edge   the full shape, carrying a light-to-dark diagonal gradient
 *   face   inset 1.5px, carrying its own vertical gradient
 *   label  unclipped, so the type is never cut by the chamfer
 *
 * That layering is what produces a real bevel. A `border` cannot do it —
 * `clip-path` cuts the border along with the box, so the chamfered corners
 * would lose their outline. Insetting a second clipped layer leaves exactly
 * 1.5px of the edge gradient showing all the way around, including along the
 * diagonals, and because the edge runs light at the top-left to dark at the
 * bottom-right it reads as a lit edge rather than as a stroke.
 *
 * Both tones are the same object under different light: `accent` fills the
 * face, `ghost` sets the face to the stage so only the rim survives. Two
 * variants of one shape, rather than a second button that happens to sit
 * beside the first.
 *
 * The drop shadow is a `filter`, not a `box-shadow`: a box-shadow is clipped
 * away with everything else, while `drop-shadow` follows the chamfered
 * silhouette.
 */
export const BevelButton = ({
  bevel = 13,
  children,
  className,
  color,
  href,
  stage,
  tone = "accent",
}: BevelButtonProps) => {
  const accent = tone === "accent";
  const { base, label } = faceFor(color);
  const fill = css(base);
  const stageRgb = parse(stage);

  return (
    <a
      className={cn(
        "group relative inline-flex items-center justify-center",
        "px-8 py-4 text-[15px] leading-none font-medium tracking-[-0.01em]",
        "transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0",
        // The outline sits on the unclipped anchor: anything painted inside
        // is cut by the chamfer, focus rings included.
        "focus-visible:outline-2 focus-visible:outline-offset-[3px]",
        className,
      )}
      href={href}
      style={{
        color: accent ? css(label) : color,
        filter: accent
          ? `drop-shadow(0 10px 26px ${css(mix(base, -0.55))}66)`
          : "none",
        outlineColor: color,
      }}
    >
      {/* edge */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: accent
            ? `linear-gradient(135deg, ${css(mix(base, 0.45))} 0%, ${fill} 48%, ${css(mix(base, -0.45))} 100%)`
            : `linear-gradient(135deg, ${css(mix(stageRgb, 0.34))} 0%, ${css(mix(stageRgb, 0.2))} 50%, ${css(mix(stageRgb, 0.1))} 100%)`,
          clipPath: chamfer(bevel),
        }}
      />

      {/* face */}
      <span
        aria-hidden
        className="absolute inset-[1.5px] transition-[filter] duration-200 ease-out group-hover:brightness-110"
        style={{
          background: accent
            ? `linear-gradient(180deg, ${css(mix(base, FACE_LIGHT))} 0%, ${fill} 45%, ${css(mix(base, FACE_DARK))} 100%)`
            : `linear-gradient(180deg, ${css(mix(stageRgb, 0.07))} 0%, ${stage} 100%)`,
          clipPath: chamfer(bevel - 2),
        }}
      />

      <span className="relative">{children}</span>
    </a>
  );
};
