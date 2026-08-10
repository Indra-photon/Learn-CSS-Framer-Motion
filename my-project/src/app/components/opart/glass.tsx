import type { ReactNode } from "react";
import { oklchCss } from "./color";

/**
 * Glass, done with SVG filters rather than shaders.
 *
 * The recipe underneath most of these: a copy of the backdrop is pushed
 * through feDisplacementMap, and the map decides what kind of glass it is.
 * A blurred alpha isolated to the rim gives a lens; turbulence gives poured
 * glass; a channel-split map gives dispersion at the edges.
 *
 * Two things are set deliberately everywhere:
 *   colorInterpolationFilters — sRGB when colours are being mixed to match
 *   what you expect on screen, linearRGB where a blur should behave like
 *   light. The default is linearRGB, which is why untouched SVG blurs so
 *   often look washed out.
 *   Every animated value is periodic, so the loop closes.
 */

const TAU = Math.PI * 2;

export type GlassVariation = {
  id: string;
  name: string;
  note: string;
  /** loop length, seconds */
  period: number;
  fps?: number;
  /** pure: tau → the numbers that get written to the DOM */
  frame: (tau: number) => Record<string, number>;
  /** attributes that close by wrapping rather than returning: attr → modulus */
  wrap?: Record<string, number>;
  /** true when element identities rotate through the same set each loop */
  rotates?: boolean;
  render: (id: string) => ReactNode;
  apply: (root: SVGSVGElement, f: Record<string, number>) => void;
};

const attr = (
  root: SVGSVGElement,
  name: string,
  a: Record<string, string | number>
) => {
  const el = root.querySelector(`[data-a="${name}"]`);
  if (!el) return;
  for (const k in a) el.setAttribute(k, String(a[k]));
};

/** Four gradient stops, animated in OKLCH from apply(). */
const Stops = ({ p }: { p: string }) => (
  <>
    <stop offset="0" data-a={`${p}0`} />
    <stop offset="0.35" data-a={`${p}1`} />
    <stop offset="0.7" data-a={`${p}2`} />
    <stop offset="1" data-a={`${p}3`} />
  </>
);

/** Write a four-stop OKLCH ramp: hue walks, lightness arcs. */
const setStops = (
  root: SVGSVGElement,
  p: string,
  h: number,
  span = 2.2,
  L0 = 0.55,
  C = 0.16
) => {
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    attr(root, `${p}${i}`, {
      "stop-color": oklchCss(L0 + 0.18 * Math.sin(t * Math.PI), C, h + t * span),
    });
  }
};

/* ==================================================================== 01 */

const lens: GlassVariation = {
  id: "lens",
  name: "Lens",
  note: "a blurred alpha minus the alpha isolates the rim, so the bend happens only at the edge",
  period: 11,
  frame: (t) => ({
    h: TAU * t,
    cx: 100 + 34 * Math.cos(TAU * t),
    cy: 100 + 34 * Math.sin(TAU * t),
    sc: 40 + 22 * Math.sin(TAU * 2 * t),
    lx: 100 + 70 * Math.cos(TAU * t + 1),
    ly: 100 + 70 * Math.sin(TAU * t + 1),
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <Stops p="s" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="11" result="b" />
          {/* b − alpha + 0.5 → exactly 0.5 (no displacement) except in the rim band */}
          <feComposite
            in="b"
            in2="SourceAlpha"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-1"
            k4="0.5"
            result="rim"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="rim"
            xChannelSelector="A"
            yChannelSelector="A"
            scale="46"
            data-a="disp"
            result="ref"
          />
          <feSpecularLighting
            in="b"
            surfaceScale="5"
            specularConstant="0.9"
            specularExponent="24"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="60" y="50" z="70" data-a="light" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="sIn" />
          <feMerge>
            <feMergeNode in="ref" />
            <feMergeNode in="sIn" />
          </feMerge>
        </filter>
        <clipPath id={`${id}-c`}>
          <circle cx="100" cy="100" r="54" data-a="clip" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`}>
        <g clipPath={`url(#${id}-c)`}>
          <rect width="200" height="200" fill={`url(#${id}-bg)`} />
        </g>
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h);
    attr(root, "clip", { cx: f.cx, cy: f.cy });
    attr(root, "disp", { scale: f.sc });
    attr(root, "light", { x: f.lx, y: f.ly });
  },
};

/* ==================================================================== 02 */

const liquid: GlassVariation = {
  id: "liquid",
  wrap: { dx: 100, dy: 100 },
  name: "Liquid",
  note: "stitched turbulence tiled and offset by exactly one tile, so the flow has no seam",
  period: 14,
  fps: 24,
  frame: (t) => ({
    h: TAU * t + 2,
    dx: 100 * t, // one full tile of the stitched noise
    dy: -100 * t,
    sc: 26 + 10 * Math.sin(TAU * t),
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="1" x2="1" y2="0">
          <Stops p="s" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="0"
          y="0"
          width="200"
          height="200"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves={2}
            seed={9}
            stitchTiles="stitch"
            x="0"
            y="0"
            width="100"
            height="100"
            result="n"
          />
          <feTile in="n" result="t" />
          <feOffset in="t" dx="0" dy="0" data-a="flow" result="nf" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="nf"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="26"
            data-a="disp"
          />
        </filter>
      </defs>
      <g filter={`url(#${id}-f)`}>
        <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 2.8);
    attr(root, "flow", { dx: f.dx, dy: f.dy });
    attr(root, "disp", { scale: f.sc });
  },
};

/* ==================================================================== 03 */

const frost: GlassVariation = {
  id: "frost",
  name: "Frost",
  note: "blur in linearRGB so it behaves like light, then grain composited back in sRGB",
  period: 12,
  fps: 24,
  frame: (t) => ({
    h: TAU * t + 4,
    y: 30 + 60 * (0.5 - 0.5 * Math.cos(TAU * t)),
    blur: 3.5 + 2.5 * Math.sin(TAU * t),
    sc: 8 + 5 * Math.sin(TAU * 2 * t),
  }),
  render: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.35" cy="0.3" r="0.85">
          <Stops p="s" />
        </radialGradient>
        <filter
          id={`${id}-f`}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="linearRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="4"
            data-a="blur"
            result="soft"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={3}
            result="grain"
          />
          <feDisplacementMap
            in="soft"
            in2="grain"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="9"
            data-a="disp"
            result="rough"
          />
          {/* the grain itself, dropped to a whisper and added back in sRGB */}
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.07 0"
            result="g2"
          />
          <feComposite in="g2" in2="rough" operator="atop" result="grained" />
          <feMerge>
            <feMergeNode in="rough" />
            <feMergeNode in="grained" />
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`} data-a="panel">
        <g clipPath={`url(#${id}-c)`}>
          <rect width="200" height="200" fill={`url(#${id}-bg)`} />
        </g>
      </g>
      <defs>
        <clipPath id={`${id}-c`}>
          <rect x="24" y="30" width="152" height="90" rx="26" data-a="plate" />
        </clipPath>
      </defs>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 1.9, 0.62);
    attr(root, "plate", { y: f.y });
    attr(root, "blur", { stdDeviation: f.blur });
    attr(root, "disp", { scale: f.sc });
  },
};

/* ==================================================================== 04 */

const bevel: GlassVariation = {
  id: "bevel",
  name: "Bevel",
  note: "feSpecularLighting on a blurred alpha — the height field is the blur, the light orbits",
  period: 9,
  frame: (t) => ({
    h: TAU * t + 1,
    lx: 100 + 90 * Math.cos(TAU * t),
    ly: 100 + 90 * Math.sin(TAU * t),
    lz: 40 + 25 * Math.sin(TAU * 2 * t),
    surf: 6 + 3 * Math.sin(TAU * t),
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <Stops p="s" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="h" />
          <feSpecularLighting
            in="h"
            surfaceScale="6"
            specularConstant="1.1"
            specularExponent="20"
            lightingColor="#ffffff"
            data-a="spec"
            result="s"
          >
            <fePointLight x="40" y="40" z="60" data-a="light" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn" />
          <feComposite
            in="SourceGraphic"
            in2="sIn"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="0.9"
            k4="0"
          />
        </filter>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`}>
        <g data-a="tiles">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={22 + (i % 2) * 82}
              y={22 + Math.floor(i / 2) * 82}
              width="74"
              height="74"
              rx="22"
              fill={`url(#${id}-bg)`}
              opacity="0.92"
            />
          ))}
        </g>
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 2.4, 0.5, 0.17);
    attr(root, "light", { x: f.lx, y: f.ly, z: f.lz });
    attr(root, "spec", { surfaceScale: f.surf });
  },
};

/* ==================================================================== 05 */

const fringe: GlassVariation = {
  id: "fringe",
  name: "Fringe",
  note: "three displacements at different strengths, recombined per channel — dispersion at the rim",
  period: 10,
  frame: (t) => ({
    h: TAU * t + 3,
    r: 30 + 16 * Math.sin(TAU * t),
    g: 24 + 13 * Math.sin(TAU * t),
    b: 18 + 10 * Math.sin(TAU * t),
    cx: 100 + 26 * Math.cos(TAU * t),
    cy: 100 + 26 * Math.sin(TAU * 2 * t),
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="0.6">
          <Stops p="s" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b" />
          <feComposite
            in="b"
            in2="SourceAlpha"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-1"
            k4="0.5"
            result="rim"
          />
          {/* shorter wavelengths bend more — three passes, one per channel */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="rim"
            xChannelSelector="A"
            yChannelSelector="A"
            scale="30"
            data-a="dr"
            result="R"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="rim"
            xChannelSelector="A"
            yChannelSelector="A"
            scale="24"
            data-a="dg"
            result="G"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="rim"
            xChannelSelector="A"
            yChannelSelector="A"
            scale="18"
            data-a="db"
            result="B"
          />
          <feColorMatrix
            in="R"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="Ro"
          />
          <feColorMatrix
            in="G"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="Go"
          />
          <feColorMatrix
            in="B"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="Bo"
          />
          <feBlend in="Ro" in2="Go" mode="screen" result="RG" />
          <feBlend in="RG" in2="Bo" mode="screen" />
        </filter>
        <clipPath id={`${id}-c`}>
          <rect x="45" y="45" width="110" height="110" rx="34" data-a="plate" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`}>
        <g clipPath={`url(#${id}-c)`}>
          <rect width="200" height="200" fill={`url(#${id}-bg)`} />
        </g>
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 3.1);
    attr(root, "dr", { scale: f.r });
    attr(root, "dg", { scale: f.g });
    attr(root, "db", { scale: f.b });
    attr(root, "plate", { x: f.cx - 55, y: f.cy - 55 });
  },
};

/* ==================================================================== 06 */

const causticGlass: GlassVariation = {
  id: "caustic-glass",
  wrap: { dx: 100, dy: 100 },
  name: "Caustic",
  note: "turbulence pushed through a spiked feComponentTransfer — the ridges are where the transfer clips",
  period: 13,
  fps: 24,
  frame: (t) => ({
    h: TAU * t + 5,
    freq: 0.014 + 0.005 * Math.sin(TAU * t),
    dx: 100 * t,
    sc: 20 + 12 * Math.sin(TAU * 2 * t),
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.6" y2="1">
          <Stops p="s" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="0"
          y="0"
          width="200"
          height="200"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="turbulence"
            baseFrequency="0.016"
            numOctaves={2}
            seed={11}
            stitchTiles="stitch"
            x="0"
            y="0"
            width="100"
            height="100"
            data-a="turb"
            result="n"
          />
          <feTile in="n" result="tn" />
          <feOffset in="tn" dx="0" dy="0" data-a="flow" result="fn" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="fn"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="22"
            data-a="disp"
            result="warped"
          />
          {/* a narrow spike in the transfer function turns the noise into ribs */}
          <feComponentTransfer in="fn" result="ridge">
            <feFuncR type="table" tableValues="0 0 0.15 1 0.15 0 0" />
            <feFuncG type="table" tableValues="0 0 0.15 1 0.15 0 0" />
            <feFuncB type="table" tableValues="0 0 0.2 1 0.2 0 0" />
            <feFuncA type="table" tableValues="0 0 0 0.85 0 0 0" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="warped" />
            <feMergeNode in="ridge" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id}-f)`}>
        <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 2.0, 0.42, 0.15);
    attr(root, "turb", { baseFrequency: f.freq.toFixed(5) });
    attr(root, "flow", { dx: f.dx, dy: -f.dx });
    attr(root, "disp", { scale: f.sc });
  },
};

/* ==================================================================== 07 */

const ripple: GlassVariation = {
  id: "ripple",
  name: "Ripple",
  note: "concentric rings expanding by exactly one spacing per loop, read through poured glass",
  period: 8,
  wrap: { r: 198 },
  rotates: true,
  frame: (t) => ({
    h: TAU * t + 0.6,
    grow: 18 * t, // one ring spacing — the set of radii repeats
    sc: 14 + 9 * Math.sin(TAU * t),
  }),
  render: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.75">
          <Stops p="s" />
        </radialGradient>
        <filter
          id={`${id}-f`}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.03"
            numOctaves={1}
            seed={2}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="16"
            data-a="disp"
          />
        </filter>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`}>
        <g data-a="rings" fill="none" strokeWidth="7" opacity="0.85">
          {Array.from({ length: 11 }, (_, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={i * 18}
              data-a={`r${i}`}
              stroke="#fff"
            />
          ))}
        </g>
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 2.6, 0.5);
    for (let i = 0; i < 11; i++) {
      const r = (i * 18 + f.grow) % 198;
      attr(root, `r${i}`, {
        r: r.toFixed(2),
        stroke: oklchCss(0.9, 0.09, f.h + r * 0.02),
        // the envelope must vanish at both ends of the wrap, or the ring that
        // jumps from the outside back to the centre is visible doing it
        "stroke-opacity": (
          0.92 * Math.pow(Math.sin((Math.PI * r) / 198), 1.3)
        ).toFixed(3),
      });
    }
    attr(root, "disp", { scale: f.sc });
  },
};

/* ==================================================================== 08 */

const facets: GlassVariation = {
  id: "facets",
  wrap: { azimuth: 360 },
  name: "Facets",
  note: "one filter, sixteen tiles — each facet samples the backdrop from a different offset",
  period: 12,
  fps: 24,
  frame: (t) => ({
    h: TAU * t + 2.6,
    rot: 360 * t,
    sc: 26 + 14 * Math.sin(TAU * t),
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <Stops p="s" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves={1}
            seed={5}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="30"
            data-a="disp"
            result="w"
          />
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="hh" />
          <feSpecularLighting
            in="hh"
            surfaceScale="3"
            specularConstant="0.8"
            specularExponent="30"
            lightingColor="#fff"
            result="sp"
          >
            <feDistantLight azimuth="220" elevation="55" data-a="light" />
          </feSpecularLighting>
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi" />
          <feMerge>
            <feMergeNode in="w" />
            <feMergeNode in="spi" />
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`}>
        <g data-a="grid">
          {Array.from({ length: 16 }, (_, i) => {
            const x = (i % 4) * 50;
            const y = Math.floor(i / 4) * 50;
            return (
              <g key={i} clipPath={`url(#${id}-c${i})`}>
                <rect
                  x={x - 6}
                  y={y - 6}
                  width="62"
                  height="62"
                  fill={`url(#${id}-bg)`}
                />
              </g>
            );
          })}
        </g>
      </g>
      <defs>
        {Array.from({ length: 16 }, (_, i) => (
          <clipPath key={i} id={`${id}-c${i}`}>
            <rect
              x={(i % 4) * 50 + 3}
              y={Math.floor(i / 4) * 50 + 3}
              width="44"
              height="44"
              rx="10"
            />
          </clipPath>
        ))}
      </defs>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 2.9);
    attr(root, "disp", { scale: f.sc });
    attr(root, "light", { azimuth: f.rot });
  },
};

/* ==================================================================== 09 */

const goo: GlassVariation = {
  id: "goo",
  name: "Goo",
  note: "blur then a steep alpha ramp in feColorMatrix — surface tension out of two primitives",
  period: 10,
  frame: (t) => {
    const o: Record<string, number> = { h: TAU * t + 1.5 };
    for (let i = 0; i < 5; i++) {
      const p = i / 5;
      o[`x${i}`] = 100 + 46 * Math.cos(TAU * ((1 + (i % 2)) * t + p));
      o[`y${i}`] = 100 + 46 * Math.sin(TAU * ((1 + ((i + 1) % 3)) * t + p * 1.4));
      o[`r${i}`] = 22 + 8 * Math.sin(TAU * (t + p));
    }
    return o;
  },
  render: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.8">
          <Stops p="s" />
        </radialGradient>
        <filter id={`${id}-f`} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
          {/* push alpha through a steep line: 0.55 → 0, 0.75 → 1 */}
          <feColorMatrix
            in="b"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
            result="g"
          />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-f)`}>
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx="100" cy="100" r="24" data-a={`b${i}`} />
        ))}
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 2.2, 0.3, 0.12);
    for (let i = 0; i < 5; i++)
      attr(root, `b${i}`, {
        cx: f[`x${i}`],
        cy: f[`y${i}`],
        r: f[`r${i}`],
        fill: oklchCss(0.72, 0.18, f.h + i * 1.1),
      });
  },
};

/* ==================================================================== 10 */

const hueEngines: GlassVariation = {
  id: "hue",
  wrap: { values: 360 },
  name: "Two hue rotations",
  note: "left: feColorMatrix hueRotate, a linear approximation that dips in lightness · right: the same turn in OKLCH",
  period: 14,
  frame: (t) => ({ deg: 360 * t, h: TAU * t }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e14b2a" />
          <stop offset="0.33" stopColor="#e8c33a" />
          <stop offset="0.66" stopColor="#2fa36b" />
          <stop offset="1" stopColor="#3a63c8" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <Stops p="s" />
        </linearGradient>
        <filter id={`${id}-f`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="hueRotate" values="0" data-a="hue" />
        </filter>
      </defs>
      <g filter={`url(#${id}-f)`}>
        <rect width="100" height="200" fill={`url(#${id}-a)`} />
      </g>
      <rect x="100" width="100" height="200" fill={`url(#${id}-b)`} />
      <line x1="100" y1="0" x2="100" y2="200" stroke="#00000030" />
    </>
  ),
  apply: (root, f) => {
    attr(root, "hue", { values: f.deg.toFixed(1) });
    // the same four hues, but rotated where hue actually means something
    const base = [0.55, 1.5, 2.6, 4.4];
    for (let i = 0; i < 4; i++)
      attr(root, `s${i}`, {
        "stop-color": oklchCss(0.66 - i * 0.04, 0.15, base[i] + f.h),
      });
  },
};

/* ==================================================================== 11 */

const dichroic: GlassVariation = {
  id: "dichroic",
  wrap: { dx: 100, dy: 100 },
  name: "Dichroic",
  note: "two tinted copies blended screen and multiply — the film passes one hue and reflects its opposite",
  period: 12,
  fps: 24,
  frame: (t) => ({
    h: TAU * t,
    sc: 24 + 14 * Math.sin(TAU * t),
    dx: 100 * t,
  }),
  render: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" data-a="t0" />
          <stop offset="1" data-a="t1" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" data-a="r0" />
          <stop offset="1" data-a="r1" />
        </linearGradient>
        <filter
          id={`${id}-f`}
          x="0"
          y="0"
          width="200"
          height="200"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018"
            numOctaves={2}
            seed={13}
            stitchTiles="stitch"
            x="0"
            y="0"
            width="100"
            height="100"
            result="n"
          />
          <feTile in="n" result="tn" />
          <feOffset in="tn" dx="0" dy="0" data-a="flow" result="fn" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="fn"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="24"
            data-a="disp"
          />
        </filter>
      </defs>
      <rect width="200" height="200" fill="#0b0b12" />
      <g filter={`url(#${id}-f)`}>
        <rect width="200" height="200" fill={`url(#${id}-t)`} />
        <rect
          width="200"
          height="200"
          fill={`url(#${id}-r)`}
          style={{ mixBlendMode: "screen" }}
        />
      </g>
    </>
  ),
  apply: (root, f) => {
    attr(root, "t0", { "stop-color": oklchCss(0.45, 0.17, f.h) });
    attr(root, "t1", { "stop-color": oklchCss(0.3, 0.12, f.h + 0.9) });
    // reflection sits opposite the transmission on the hue circle
    attr(root, "r0", { "stop-color": oklchCss(0.5, 0.17, f.h + Math.PI) });
    attr(root, "r1", { "stop-color": oklchCss(0.28, 0.1, f.h + Math.PI + 0.9) });
    attr(root, "flow", { dx: f.dx, dy: f.dx });
    attr(root, "disp", { scale: f.sc });
  },
};

/* ==================================================================== 12 */

const bubble: GlassVariation = {
  id: "bubble",
  name: "Bubble",
  note: "rim refraction plus a banded transfer function — interference colours without leaving the filter",
  period: 11,
  frame: (t) => ({
    h: TAU * t + 3.4,
    cx: 100 + 18 * Math.cos(TAU * t),
    cy: 100 + 14 * Math.sin(TAU * 2 * t),
    sc: 34 + 18 * Math.sin(TAU * t),
    lx: 100 + 60 * Math.cos(TAU * t + 2),
    ly: 100 + 60 * Math.sin(TAU * t + 2),
    band: t,
  }),
  render: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.4" cy="0.35" r="0.9">
          <Stops p="s" />
        </radialGradient>
        <filter
          id={`${id}-f`}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="13" result="b" />
          <feComposite
            in="b"
            in2="SourceAlpha"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-1"
            k4="0.5"
            result="rim"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="rim"
            xChannelSelector="A"
            yChannelSelector="A"
            scale="40"
            data-a="disp"
            result="ref"
          />
          {/* sinusoidal tables per channel, offset in phase → interference bands */}
          <feComponentTransfer in="ref" result="iris">
            <feFuncR type="table" tableValues="0.9 0.2 0.7 1 0.3 0.9" data-a="fr" />
            <feFuncG type="table" tableValues="0.2 0.9 0.4 0.8 1 0.2" data-a="fg" />
            <feFuncB type="table" tableValues="0.6 0.4 1 0.3 0.8 0.6" data-a="fb" />
          </feComponentTransfer>
          <feSpecularLighting
            in="b"
            surfaceScale="4"
            specularConstant="1.2"
            specularExponent="40"
            lightingColor="#ffffff"
            result="sp"
          >
            <fePointLight x="70" y="60" z="60" data-a="light" />
          </feSpecularLighting>
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi" />
          <feMerge>
            <feMergeNode in="iris" />
            <feMergeNode in="spi" />
          </feMerge>
        </filter>
        <clipPath id={`${id}-c`}>
          <circle cx="100" cy="100" r="62" data-a="clip" />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill="#0a0a10" />
      <rect width="200" height="200" fill={`url(#${id}-bg)`} opacity="0.55" />
      <g filter={`url(#${id}-f)`}>
        <g clipPath={`url(#${id}-c)`}>
          <rect width="200" height="200" fill={`url(#${id}-bg)`} />
        </g>
      </g>
    </>
  ),
  apply: (root, f) => {
    setStops(root, "s", f.h, 3.4, 0.5, 0.16);
    attr(root, "clip", { cx: f.cx, cy: f.cy });
    attr(root, "disp", { scale: f.sc });
    attr(root, "light", { x: f.lx, y: f.ly });
    const table = (ph: number) =>
      Array.from({ length: 7 }, (_, i) =>
        (0.5 + 0.45 * Math.sin(TAU * (i / 6 + f.band + ph))).toFixed(3)
      ).join(" ");
    attr(root, "fr", { tableValues: table(0) });
    attr(root, "fg", { tableValues: table(0.33) });
    attr(root, "fb", { tableValues: table(0.66) });
  },
};

export const GLASS: GlassVariation[] = [
  lens,
  liquid,
  frost,
  bevel,
  fringe,
  causticGlass,
  ripple,
  facets,
  goo,
  hueEngines,
  dichroic,
  bubble,
];
