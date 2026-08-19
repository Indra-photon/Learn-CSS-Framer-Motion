import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * TUNED VALUES
 *
 * Settled during design and frozen here. Colour work happens
 * in OKLCH throughout — see the colour section below.
 * ───────────────────────────────────────────────────────── */

const CARD = {
  width: 362,
  radius: 32,
  padding: 28,
  background: "#F9DBC6",
  ink: "#181716",
  headingSize: 45,
} as const;

const DOTS = {
  pitch: 11,
  size: 2.6,
  /** Near the wake: the base pigment. Far from it: one ramp step lighter. */
  colorNear: "#CE5B3C",
  colorFar: "#E67751",
  shadeFalloff: 90,
  shadeSteps: 3,
  fieldHeight: 320,
} as const;

const CONE = {
  corner: "bottom-left",
  nudgeX: -19,
  nudgeY: 0,
  axisDeg: -44,
  spreadDeg: 18,
  length: 262,
  curve: -0.2,
  tipWidth: 6,
  /** The cone is a void carved from the dots, not a drawn shape. */
  visible: false,
  color: "#CE5B3C",
} as const;

const BALL = {
  scale: 0.55,
  color: "#CE5B3C",
} as const;

/**
 * Ball shading, expressed as OKLCH offsets from the ball's own colour.
 * `lightness` is an absolute OKLab step; `chroma` scales the base chroma;
 * `hue` rotates in degrees.
 *
 * The chroma multipliers below reproduce the previously hand-tuned look. sRGB
 * has real headroom above them at these lightnesses — highlight could reach
 * x1.79, rim x1.77, shadow x1.21 before clipping — so raising them is the
 * cheapest way to make the ball read as pigment rather than tinted plastic.
 * Hue rotation is near zero for the same reason: it preserves the tuned look.
 * Rotating shadow negative and highlight positive is what makes shading read
 * as light rather than opacity.
 */
const SHADING = {
  azimuth: 265,
  offset: 0.85,
  midpoint: 0.7,
  highlight: { lightness: 0.211, chroma: 0.37, hue: -1.3 },
  shadow: { lightness: -0.042, chroma: 1.06, hue: -0.4 },
  rim: { lightness: 0.059, chroma: 0.82, hue: 0.2 },
} as const;

const SCATTER = {
  clearance: 4.5,
  feather: 14,
  stragglers: 0,
  seed: 28,
} as const;

const CTA = {
  labelSize: 15,
  paddingX: 22,
  paddingY: 6,
  radius: 40,
  /** Lightness drop from the dot ramp. Below ~0.13 the label fails AA. */
  depth: 0.14,
  inset: 1,
  badgeSize: 34,
  iconSize: 16,
  labelColor: "#FFF6F0",
} as const;

/** Inner shadow stack: y, blur, spread, colour, opacity. */
const CTA_INNER_SHADOW = [
  { y: 1, blur: 0, spread: 0, color: "#E09980", opacity: 0.5 },
  { y: -1, blur: 0, spread: 0, color: "#832F17", opacity: 0.06 },
  { y: 9, blur: 14, spread: -9, color: "#B78E7F", opacity: 0.65 },
  { y: -11, blur: 16, spread: -11, color: "#4F1A0B", opacity: 0.7 },
] as const;

const CORNERS = {
  "bottom-left": { x: 0, y: 1 },
  "bottom-right": { x: 1, y: 1 },
  "top-left": { x: 0, y: 0 },
  "top-right": { x: 1, y: 0 },
} as const;

const FIELD_WIDTH = CARD.width - CARD.padding * 2;
const SHADE_ID = "insight-ball-shade";

type Dot = { x: number; y: number; distance: number };
type Oklch = { l: number; c: number; h: number };

/**
 * Deterministic value hash in [0, 1). Used instead of Math.random so the field
 * is identical on the server and the client.
 */
function hash(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/* ── colour: OKLCH in, CSS oklch() out ────────────────────
 *
 * Nothing converts back to hex. Out-of-gamut values are handed to the browser
 * as oklch(), which gamut-maps by reducing chroma while holding lightness and
 * hue (CSS Color 4). Clipping in JS would have to clamp RGB channels
 * independently, which shifts both hue and lightness.
 * ───────────────────────────────────────────────────────── */

function srgbToLinear(c: number) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** Parses #RGB or #RRGGBB into OKLCH. Hex is only ever an input format. */
function hexToOklch(hex: string): Oklch {
  let value = hex.replace("#", "").slice(0, 6);
  if (value.length === 3) value = value.replace(/./g, (c) => c + c);

  const r = srgbToLinear(parseInt(value.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(value.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(value.slice(4, 6), 16));

  const lp = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mp = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const sp = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const l = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
  const a = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;

  return {
    l,
    c: Math.hypot(a, bb),
    h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
  };
}

function oklch({ l, c, h }: Oklch, alpha = 1) {
  const lightness = Math.min(Math.max(l, 0), 1).toFixed(4);
  const chroma = Math.max(c, 0).toFixed(4);
  const hue = (((h % 360) + 360) % 360).toFixed(2);
  return alpha >= 1
    ? `oklch(${lightness} ${chroma} ${hue})`
    : `oklch(${lightness} ${chroma} ${hue} / ${alpha})`;
}

/** Interpolates in OKLCH, taking the shorter way around the hue circle. */
function mixOklch(from: Oklch, to: Oklch, t: number): Oklch {
  let delta = to.h - from.h;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return {
    l: from.l + (to.l - from.l) * t,
    c: from.c + (to.c - from.c) * t,
    h: from.h + delta * t,
  };
}

function shiftLightness(color: Oklch, delta: number): Oklch {
  return { ...color, l: color.l + delta };
}

/** Applies an alpha to a literal hex, for shadow layers with fixed colours. */
function withAlpha(hex: string, alpha: number) {
  let value = hex.replace("#", "").slice(0, 6);
  if (value.length === 3) value = value.replace(/./g, (c) => c + c);

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgb(${r} ${g} ${b} / ${Math.min(Math.max(alpha, 0), 1)})`;
}

/**
 * Light and dark variants of the ball's own colour. Lightness, chroma and hue
 * each move deliberately — unlike HSL, where raising lightness silently
 * collapses chroma and the hue you asked for is not the hue you perceive.
 */
function buildTints(base: Oklch) {
  const variant = (spec: { lightness: number; chroma: number; hue: number }) =>
    oklch({
      l: base.l + spec.lightness,
      c: base.c * spec.chroma,
      h: base.h + spec.hue,
    });

  return {
    highlight: variant(SHADING.highlight),
    shadow: variant(SHADING.shadow),
    rim: variant(SHADING.rim),
  };
}

/* ── geometry ─────────────────────────────────────────── */

type Geometry = {
  apex: { x: number; y: number };
  ball: { x: number; y: number; r: number };
  tangents: [{ x: number; y: number }, { x: number; y: number }];
  dir: { x: number; y: number };
  perp: { x: number; y: number };
  reach: number;
  /** Half-width of the cone at a distance along its axis. The single source of
   *  truth for both the drawn outline and the dot clearing. */
  halfWidthAt: (along: number) => number;
};

function buildGeometry(): Geometry {
  const corner = CORNERS[CONE.corner];
  const apex = {
    x: corner.x * FIELD_WIDTH + CONE.nudgeX,
    y: corner.y * DOTS.fieldHeight + CONE.nudgeY,
  };

  const axis = (CONE.axisDeg * Math.PI) / 180;
  const dir = { x: Math.cos(axis), y: Math.sin(axis) };
  const perp = { x: -dir.y, y: dir.x };

  const center = {
    x: apex.x + dir.x * CONE.length,
    y: apex.y + dir.y * CONE.length,
  };

  const radius = Math.min(
    CONE.length * Math.sin((CONE.spreadDeg * Math.PI) / 180) * BALL.scale,
    CONE.length * 0.999,
  );

  // Sides run tangent to the ball, so no triangle corner pokes past the head.
  const beta = Math.asin(radius / CONE.length);
  const tangentDistance = Math.sqrt(CONE.length ** 2 - radius ** 2);
  const reach = tangentDistance * Math.cos(beta);
  const spread = tangentDistance * Math.sin(beta);
  const slope = reach === 0 ? 0 : spread / reach;

  const along = { x: apex.x + dir.x * reach, y: apex.y + dir.y * reach };

  // The bulge vanishes at both ends, so the sides always meet the tangent
  // points exactly however the curve is set.
  const halfWidthAt = (d: number) => {
    const t = reach === 0 ? 0 : d / reach;
    return (
      CONE.tipWidth * (1 - t) +
      d * slope +
      CONE.curve * spread * Math.sin(Math.PI * t)
    );
  };

  return {
    apex,
    ball: { ...center, r: radius },
    tangents: [
      { x: along.x + perp.x * spread, y: along.y + perp.y * spread },
      { x: along.x - perp.x * spread, y: along.y - perp.y * spread },
    ],
    dir,
    perp,
    reach,
    halfWidthAt,
  };
}

/**
 * Signed distance to the cone-plus-ball silhouette: negative inside, positive
 * outside. Used both to clear dots and to feather the dots just beyond the edge.
 */
function distanceToShape(x: number, y: number, g: Geometry) {
  const toBall = Math.hypot(x - g.ball.x, y - g.ball.y) - g.ball.r;

  const ax = x - g.apex.x;
  const ay = y - g.apex.y;
  const along = ax * g.dir.x + ay * g.dir.y;
  const across = Math.abs(ax * g.perp.x + ay * g.perp.y);

  const toCone =
    along < 0 || along > g.reach
      ? Number.POSITIVE_INFINITY
      : across - g.halfWidthAt(along);

  return Math.min(toBall, toCone) - SCATTER.clearance;
}

function buildGrid(g: Geometry): Dot[] {
  const inset = DOTS.size + 1;
  const cols = Math.floor((FIELD_WIDTH - inset * 2) / DOTS.pitch) + 1;
  const rows = Math.floor((DOTS.fieldHeight - inset * 2) / DOTS.pitch) + 1;
  const offsetX = (FIELD_WIDTH - (cols - 1) * DOTS.pitch) / 2;

  const dots: Dot[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * DOTS.pitch;
      const y = inset + row * DOTS.pitch;
      const distance = distanceToShape(x, y, g);

      if (distance < 0) {
        // Swept clean, apart from whatever stragglers are dialled back in.
        if (hash(col, row, SCATTER.seed) > SCATTER.stragglers) continue;
      } else if (SCATTER.feather > 0 && distance < SCATTER.feather) {
        // Thin the dots just outside the edge so the silhouette isn't a hard cut.
        if (hash(col, row, SCATTER.seed) > distance / SCATTER.feather) continue;
      }

      // Distance is kept so the shade ramp can read it.
      dots.push({ x, y, distance: Math.max(distance, 0) });
    }
  }

  return dots;
}

/* ── rendering ────────────────────────────────────────── */

function DotField() {
  const geometry = buildGeometry();
  const dots = buildGrid(geometry);
  const { apex, dir, perp, reach, halfWidthAt, ball } = geometry;

  // Bucket the dots by distance from the wake so the halftone carries depth:
  // near dots hold the base pigment, far dots step up the ramp toward the light.
  const near = hexToOklch(DOTS.colorNear);
  const far = hexToOklch(DOTS.colorFar);
  const bands: { color: string; dots: Dot[] }[] = Array.from(
    { length: DOTS.shadeSteps },
    (_, i) => ({
      color: oklch(mixOklch(near, far, i / (DOTS.shadeSteps - 1))),
      dots: [],
    }),
  );

  for (const dot of dots) {
    const t = Math.min(dot.distance / DOTS.shadeFalloff, 0.9999);
    bands[Math.floor(t * DOTS.shadeSteps)].dots.push(dot);
  }

  const lightAngle = (SHADING.azimuth * Math.PI) / 180;
  const lightDir = { x: Math.cos(lightAngle), y: Math.sin(lightAngle) };
  const base = hexToOklch(BALL.color);
  const tints = buildTints(base);

  // Walk up one side and back down the other, sampling the same half-width the
  // dot clearing uses, so the outline and the cleared region can never diverge.
  const SAMPLES = 24;
  const side = (sign: number) =>
    Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const along = (i / SAMPLES) * reach;
      const half = halfWidthAt(along) * sign;
      return `${apex.x + dir.x * along + perp.x * half} ${apex.y + dir.y * along + perp.y * half}`;
    });
  const conePath = `M ${side(1).join(" L ")} L ${side(-1).reverse().join(" L ")} Z`;

  return (
    <svg
      viewBox={`0 0 ${FIELD_WIDTH} ${DOTS.fieldHeight}`}
      width="100%"
      className="block h-auto"
      aria-hidden="true"
    >
      {bands.map((band, b) => (
        <g key={b} fill={band.color}>
          {band.dots.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={DOTS.size} />
          ))}
        </g>
      ))}

      {CONE.visible && <path d={conePath} fill={CONE.color} />}

      <defs>
        {/* Focal point pushed toward the light, so the gradient reads as a lit
            sphere rather than a flat concentric ring. */}
        <radialGradient
          id={SHADE_ID}
          gradientUnits="userSpaceOnUse"
          cx={ball.x}
          cy={ball.y}
          r={ball.r}
          fx={ball.x + lightDir.x * ball.r * SHADING.offset}
          fy={ball.y + lightDir.y * ball.r * SHADING.offset}
        >
          <stop offset={0} stopColor={tints.highlight} />
          <stop offset={SHADING.midpoint} stopColor={oklch(base)} />
          <stop offset={0.93} stopColor={tints.shadow} />
          <stop offset={1} stopColor={tints.rim} />
        </radialGradient>
      </defs>

      <circle cx={ball.x} cy={ball.y} r={ball.r} fill={`url(#${SHADE_ID})`} />
    </svg>
  );
}

function LearnMore({ label, href }: { label: string; href: string }) {
  // Same two colours as the dot ramp, stepped down so light text clears AA,
  // and running along the wake's own axis so the button reads as part of it.
  const from = shiftLightness(hexToOklch(DOTS.colorNear), -CTA.depth);
  const to = shiftLightness(hexToOklch(DOTS.colorFar), -CTA.depth);
  const gradientAngle = 90 + CONE.axisDeg;

  const insetShadow = CTA_INNER_SHADOW.map(
    (layer) =>
      `inset 0 ${layer.y}px ${layer.blur}px ${layer.spread}px ${withAlpha(layer.color, layer.opacity * CTA.inset)}`,
  ).join(", ");

  return (
    <a
      href={href}
      className="group inline-flex w-fit items-center font-semibold tracking-[-0.01em] transition-transform duration-200 ease-out active:scale-[0.98]"
      style={{
        gap: CTA.paddingX * 0.6,
        paddingLeft: CTA.paddingX,
        paddingRight: CTA.paddingY,
        paddingTop: CTA.paddingY,
        paddingBottom: CTA.paddingY,
        borderRadius: CTA.radius,
        fontSize: CTA.labelSize,
        color: CTA.labelColor,
        backgroundImage: `linear-gradient(${gradientAngle}deg, ${oklch(from)}, ${oklch(to)})`,
        boxShadow: insetShadow,
      }}
    >
      {label}
      <span
        className="flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{
          width: CTA.badgeSize,
          height: CTA.badgeSize,
          background: CARD.background,
          color: oklch(from),
        }}
      >
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={CTA.iconSize}
          strokeWidth={2.2}
        />
      </span>
    </a>
  );
}

/**
 * Hand-drawn flower: petals, stem, leaf and ground. Every element carries a
 * deliberate wobble — the petals differ in length, width and spacing, and the
 * stem and ground are drawn with uneven curves. Perfect symmetry is what makes
 * a mark read as machine-drawn.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ color: BALL.color }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* petals — offset loops, uneven in size and spacing */}
      <path d="M12.00 2.65C12.80 2.65 13.45 3.57 13.45 4.70C13.45 5.83 12.80 6.75 12.00 6.75C11.20 6.75 10.55 5.83 10.55 4.70C10.55 3.57 11.20 2.65 12.00 2.65ZM16.54 6.14C16.78 6.84 16.15 7.70 15.13 8.05C14.12 8.40 13.09 8.11 12.85 7.41C12.61 6.70 13.24 5.85 14.26 5.50C15.27 5.15 16.30 5.43 16.54 6.14ZM15.17 11.76C14.52 12.27 13.41 11.94 12.70 11.03C11.98 10.11 11.93 8.96 12.58 8.45C13.24 7.94 14.35 8.27 15.06 9.18C15.77 10.09 15.82 11.25 15.17 11.76ZM9.37 11.60C8.75 11.18 8.73 10.14 9.32 9.27C9.90 8.40 10.88 8.03 11.50 8.45C12.11 8.86 12.14 9.91 11.55 10.78C10.97 11.65 9.99 12.01 9.37 11.60ZM7.24 6.34C7.45 5.59 8.49 5.24 9.55 5.54C10.61 5.85 11.30 6.69 11.09 7.44C10.87 8.18 9.84 8.54 8.78 8.23C7.72 7.93 7.03 7.08 7.24 6.34Z" />
      {/* seed head, sitting in the gap the petals leave open */}
      <circle cx="12" cy="7.7" r="1.15" fill="currentColor" stroke="none" />
      {/* stem, starting clear of the petals and leaning off true */}
      <path d="M12.15 12.4c-.35 2.2-.25 4.4 0 6.1" />
      {/* one leaf, low on the stem */}
      <path
        d="M12.05 17.1C9.85 16.7 8.3 15.15 7.95 13.05C10.35 13.15 11.75 14.85 12.05 17.1Z"
        fill="currentColor"
        stroke="none"
      />
      {/* ground — uneven, and broken the way a sketched line is */}
      <path d="M4.9 19.1c2.3-.45 4.4.2 7.2.15 2.5-.05 4.7-.55 7-.3" />
      <path d="M7.6 21.2c.95-.15 1.75-.1 2.5 0M14.2 21.15c.85-.1 1.55-.05 2.25.05" />
    </svg>
  );
}

type InsightCardProps = {
  brand?: string;
  heading?: ReactNode;
  ctaLabel?: string;
  href?: string;
  className?: string;
};

export default function InsightCard({
  brand = "NORTHBEAM",
  heading = (
    <>
      Draw <span className="font-semibold">Insights</span> From Your{" "}
      <span className="font-semibold">Data</span>
    </>
  ),
  ctaLabel = "Learn More",
  href = "#",
  className,
}: InsightCardProps) {
  return (
    <article
      className={cn("flex w-full flex-col overflow-hidden", className)}
      style={{
        maxWidth: CARD.width,
        borderRadius: CARD.radius,
        padding: CARD.padding,
        background: CARD.background,
        color: CARD.ink,
      }}
    >
      <div className="flex items-center gap-2">
        <BrandMark className="h-6 w-6" />
        <span className="text-[15px] font-bold tracking-[0.08em]">{brand}</span>
      </div>

      <h2
        className="mt-10 font-medium tracking-[-0.025em]"
        style={{ fontSize: CARD.headingSize, lineHeight: 0.95 }}
      >
        {heading}
      </h2>

      <div className="mt-3">
        <LearnMore label={ctaLabel} href={href} />
      </div>

      <div className="mt-11">
        <DotField />
      </div>
    </article>
  );
}
