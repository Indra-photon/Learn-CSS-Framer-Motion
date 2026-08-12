import { cn } from "@/lib/utils";

/* ==================================================================== *
 * Isometric projection
 *
 * World axes: +x runs right-and-down, +y runs LEFT-and-down, +z is up.
 * For any box the two visible faces are:
 *   · constant-y → recedes left-and-down  → the FRONT (all detail here)
 *   · constant-x → recedes right-and-down → the FLANK (shaded, plain)
 *
 * Three data boxes, exploded upward off a plinth. Everything is world
 * space and goes through p(); nothing is placed by eye.
 * ==================================================================== */

const K = 0.8660254; // cos 30°
const S = 13; // px per world unit
const OX = 190;
const OY = 250;

type Pt = readonly [number, number];

const p = (x: number, y: number, z = 0): Pt => [
  (x - y) * K * S + OX,
  ((x + y) / 2 - z) * S + OY,
];

const poly = (pts: Pt[], close = true) =>
  pts
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ") + (close ? "Z" : "");

/**
 * Same polygon, corners softened. Isometric corners are sharp by nature and
 * read as brittle at this weight — a 4px fillet is what makes the solids look
 * moulded rather than wireframed.
 */
const roundPoly = (pts: Pt[], r = 4) => {
  const n = pts.length;
  const lerp = (a: Pt, b: Pt, t: number): Pt => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
  const at = (a: Pt, b: Pt) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return Math.min(0.5, r / (len || 1));
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const a = lerp(cur, prev, at(cur, prev));
    const b = lerp(cur, next, at(cur, next));
    d +=
      i === 0
        ? `M${a[0].toFixed(2)} ${a[1].toFixed(2)}`
        : `L${a[0].toFixed(2)} ${a[1].toFixed(2)}`;
    d += `Q${cur[0].toFixed(2)} ${cur[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }
  return d + "Z";
};

const quad = (x: number, y: number, z: number, w: number, d: number) =>
  [p(x, y, z), p(x + w, y, z), p(x + w, y + d, z), p(x, y + d, z)] as Pt[];

const boxFaces = (
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
) => ({
  top: quad(x, y, z + h, w, d),
  front: [
    p(x, y + d, z),
    p(x + w, y + d, z),
    p(x + w, y + d, z + h),
    p(x, y + d, z + h),
  ] as Pt[],
  flank: [
    p(x + w, y, z),
    p(x + w, y + d, z),
    p(x + w, y + d, z + h),
    p(x + w, y, z + h),
  ] as Pt[],
});

/** A rectangle painted onto the front plane (constant y). */
const onFront = (yc: number, x0: number, x1: number, z0: number, z1: number) =>
  [p(x0, yc, z0), p(x1, yc, z0), p(x1, yc, z1), p(x0, yc, z1)] as Pt[];

/** A rectangle painted onto the flank plane (constant x). */
const onFlank = (xc: number, y0: number, y1: number, z0: number, z1: number) =>
  [p(xc, y0, z0), p(xc, y1, z0), p(xc, y1, z1), p(xc, y0, z1)] as Pt[];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* --------------------------------------------------------------- paint */

const INK = "#243027";
const ACCENT = "#6f7a62";
/* Opaque — the back-to-front paint order is what does the occluding. */
const TOP = "#ffffff";
const FRONT = "#f3f4f0";
const FLANK = "#e3e5de";

const LINE = { stroke: INK, fill: "none", strokeLinejoin: "round" } as const;

/* --------------------------------------------------------------- box */

/**
 * One data box: bay slots and an accent status bar on the front, a single
 * service panel on the flank. Deliberately sparse — three of these need to
 * read as one system, and detail repeated three times becomes noise.
 */
function DataBox({ z, index }: { z: number; index: number }) {
  const x = 0,
    y = 0,
    w = 11,
    d = 8,
    h = 2.3;
  const f = boxFaces(x, y, z, w, d, h);
  const yf = y + d;

  return (
    <g>
      <path d={roundPoly(f.flank)} fill={FLANK} />
      <path d={roundPoly(f.front)} fill={FRONT} />
      <path d={roundPoly(f.top)} fill={TOP} />

      <g {...LINE} strokeWidth={0.75} opacity={0.45}>
        {/* bay slots */}
        {range(16).map((i) => {
          const gx = 0.7 + i * 0.42;
          return (
            <path
              key={i}
              d={poly(onFront(yf, gx, gx + 0.2, z + 0.5, z + 1.8))}
            />
          );
        })}
        {/* two drive carriers */}
        <path d={roundPoly(onFront(yf, 7.9, 9.1, z + 0.5, z + 1.8), 2)} />
        <path d={roundPoly(onFront(yf, 9.4, 10.4, z + 0.5, z + 1.8), 2)} />
        {/* service panel on the flank */}
        <path
          d={roundPoly(
            onFlank(x + w, y + 1.1, y + d - 1.1, z + 0.6, z + 1.7),
            2,
          )}
        />
        {/* lid seam */}
        <path d={roundPoly(quad(x + 0.5, y + 0.5, z + h, w - 1, d - 1), 3)} />
      </g>

      {/* the one piece of colour: an activity bar, brightest on the live box */}
      <path
        d={poly(onFront(yf, 0.7, 7.1, z + 2.0, z + 2.15))}
        fill={ACCENT}
        opacity={0.85 - index * 0.25}
      />

      <g {...LINE} strokeWidth={1.3}>
        <path d={roundPoly(f.flank)} />
        <path d={roundPoly(f.front)} />
        <path d={roundPoly(f.top)} />
      </g>
    </g>
  );
}

/* ==================================================================== */

export default function GpuInfrastructure({
  className,
}: {
  className?: string;
}) {
  const w = 11,
    d = 8;
  // the three visible vertical edges — where the exploded guides hang
  const edges = [
    [0, d],
    [w, d],
    [w, 0],
  ] as const;
  /* 6 units of lift is the threshold: below it the box above drops its bottom
     vertex into the front face of the box below and the stack reads as mush.
     At 6 every front face is fully clear. */
  const levels = [0, 6, 12];

  return (
    <svg
      viewBox="0 0 420 450"
      className={cn("h-auto w-full", className)}
      fill="none"
      stroke={INK}
      strokeLinecap="round"
      role="img"
      aria-label="Isometric diagram: three stacked GPU compute units on a plinth"
    >
      {/* ------------------------------------------------------- footprint */}
      <path
        d={roundPoly(quad(-4, -4, 0, w + 8, d + 8), 14)}
        strokeWidth={1}
        strokeDasharray="6 7"
        opacity={0.3}
      />

      {/* ----------------------------------------------------------- plinth */}
      {(() => {
        const f = boxFaces(-2.2, -2.2, -0.9, w + 4.4, d + 4.4, 0.9);
        return (
          <g>
            <path d={roundPoly(f.flank)} fill={FLANK} />
            <path d={roundPoly(f.front)} fill={FRONT} />
            <path d={roundPoly(f.top)} fill={TOP} />
            <g {...LINE} strokeWidth={1.3}>
              <path d={roundPoly(f.flank)} />
              <path d={roundPoly(f.front)} />
              <path d={roundPoly(f.top)} />
            </g>
          </g>
        );
      })()}

      {/* Assembly guides, drawn before the solids so they read as running
          behind and between the boxes rather than over them. */}
      <g strokeWidth={1} strokeDasharray="4 6" opacity={0.32}>
        {edges.map(([ex, ey], i) => {
          const a = p(ex, ey, 0);
          const b = p(ex, ey, levels[2] + 2.3);
          return <path key={i} d={`M${a[0]} ${a[1]}V${b[1]}`} />;
        })}
      </g>

      {/* --------------------------------------------- boxes, bottom to top */}
      {levels.map((z, i) => (
        <DataBox key={z} z={z} index={levels.length - 1 - i} />
      ))}

      {/* node pips on the guides, between the boxes */}
      <g fill={ACCENT} stroke="none" opacity={0.6}>
        {[4.4, 10.4].map((z) => {
          const a = p(0, d, z);
          return <circle key={z} cx={a[0]} cy={a[1]} r={2.6} />;
        })}
      </g>
    </svg>
  );
}
