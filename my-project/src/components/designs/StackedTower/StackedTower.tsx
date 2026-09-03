/**
 * StackedTower — a static SVG illustration of four cylindrical units stacked
 * into a deliberately unsteady tower. Built from PLAN.md in this folder.
 *
 * The whole 3D read comes from ONE constant: every ellipse in the drawing obeys
 * ry = camera.ryRatio * rx. There is no perspective transform, no rotate, no
 * skew. Height is expressed purely as vertical offset between two identical
 * ellipses. Break the ratio on a single shape and it reads as *tilted* rather
 * than as *at a different height* — the one rule here with zero tolerance.
 *
 * This file stays a server component: no hooks, no context, no client deps.
 * The camera is threaded as a `cam` prop rather than via context precisely so
 * that stays true. Live tuning lives in StackedTowerDials.tsx.
 */

/* ------------------------------------------------------------------ canvas */

const VIEW_W = 1230;
const VIEW_H = 738;

/** Card interior — the tower is clipped to this, so the base drum runs off. */
const FRAME = 28;
const CARD = {
  x: FRAME,
  y: FRAME,
  w: VIEW_W - FRAME * 2,
  h: VIEW_H - FRAME * 2,
};

/* ----------------------------------------------------------------- palette */

/** Chrome only. Every unit colour is DERIVED — see `shade` below. */
const C = {
  canvas: "oklch(98.0% 0.009 84.6)",
  frame: "oklch(86.4% 0.050 322.9)",
  ink: "oklch(20.4% 0.012 293.0)",
} as const;

/* ------------------------------------------------------------------ colour */

/** A base colour in OKLCH. `l` is a percentage, `h` degrees. */
export type Lch = { l: number; c: number; h: number };

/**
 * How a colour moves per shading step as it darkens.
 *
 * The trick: don't just drop lightness. Push chroma UP and rotate the hue a
 * little at the same time. Flat lightness-only ramps go muddy and grey in the
 * shadows because that is literally what desaturating toward black does; adding
 * chroma as it darkens keeps shadows feeling like coloured light rather than
 * like someone turned the lamp off.
 */
export type Ramp = {
  /** Lightness removed per step (percentage points). */
  lightness: number;
  /** Chroma ADDED per step. Positive — that is the whole point. */
  chroma: number;
  /** Hue rotation per step, in degrees. Small. Subtle beats clever here. */
  hue: number;
};

export type Palette = {
  ramp: Ramp;
  /** Opacity of the left/right wall falloff. */
  edgeShade: number;
  /** Opacity of the contact occlusion under each resting unit. */
  contactShade: number;
  /**
   * Where ribs sit on the ramp. NEGATIVE walks *up* it — lighter and less
   * saturated than the drum — which turns the ribs from cut grooves into raised
   * highlights. That is the difference between corrugation lit from the front
   * and corrugation lit from behind.
   */
  ribStep: number;
  ribOpacity: number;
  /**
   * Blended rather than painted flat, so ribs pick up the wall's own colour
   * instead of sitting on top of it as a foreign stroke. `plus-lighter` adds
   * channels, so it blows out fast — keep ribOpacity low when using it.
   */
  ribBlend: BlendMode;
};

export type BlendMode = NonNullable<React.CSSProperties["mixBlendMode"]>;

/** Where each surface sits on the ramp. Fractional steps are fine. */
const STEP = {
  lidFace: 0,
  lidWall: 1,
  drumWall: 1.8,
  rib: 3.4,
  contact: 3,
} as const;

const r1 = (n: number) => Math.round(n * 10) / 10;
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Walk a base colour `steps` down the ramp. */
function shade(base: Lch, ramp: Ramp, steps: number): string {
  const l = Math.max(0, Math.min(100, base.l - ramp.lightness * steps));
  const c = Math.max(0, base.c + ramp.chroma * steps);
  const h = (((base.h + ramp.hue * steps) % 360) + 360) % 360;
  return `oklch(${r1(l)}% ${r3(c)} ${r1(h)})`;
}

/* ------------------------------------------------------------------ types */

export type Camera = {
  /** ry / rx for every ellipse in the drawing. The whole illusion. */
  ryRatio: number;
  strokeWidth: number;
};

/**
 * A unit is a `lid` (thin, wide, smooth, accent hue) sitting on a `drum`
 * (taller, main hue, ribbed). The unit above is narrower than the lid below it,
 * so the lid shows as a ring peeking out around the base of whatever stands on
 * it. That ring is what makes the stack read as *stacked* rather than as four
 * shapes pasted on top of each other.
 *
 * Vertical position is expressed as a top edge plus two heights, never as
 * absolute bottoms — otherwise moving one unit forces you to re-derive every
 * unit under it.
 */
export type Unit = {
  id: string;
  label: string;
  /** Which side of the tower the label sits on. */
  side: "left" | "right";
  cx: number;
  rx: number;
  lidTop: number;
  lidH: number;
  drumH: number;
  /** Lids are not co-axial with their drum in the reference. Override to taste. */
  lidCx?: number;
  lidRx?: number;
  /** The single colour this whole unit is derived from. */
  base: Lch;
  ribCount?: number;
  ribWidth?: number;
  /** Nudge the leader anchor off the drum's vertical midpoint. */
  labelYBias?: number;
  /** Second line, set lighter and smaller under the label. */
  support: string;
  /** Declares reading order. "01" is the foundation, "04" the cap. */
  ordinal: string;
};

/** Everything about the callouts: the curve, the ink, and the type. */
export type Annotation = {
  /** Horizontal distance from the shape edge out to the text. */
  lead: number;
  /** Vertical offset of the text from the tip. Negative lifts it. */
  bow: number;
  /** Bezier control strength. Higher = flatter approach, lazier curve. */
  curve: number;
  opacity: number;
  strokeWidth: number;
  labelSize: number;
  labelWeight: number;
  supportSize: number;
  supportWeight: number;
  supportOpacity: number;
};

export type Geometry = {
  camera: Camera;
  palette: Palette;
  annotation: Annotation;
  /** How far each lid overhangs its own drum — this is the visible ring. */
  lidOverhang: number;
  /** Ordered top of the tower → bottom. Painted in reverse. */
  units: Unit[];
};

export const DEFAULT_GEOMETRY: Geometry = {
  camera: { ryRatio: 0.235, strokeWidth: 1.5 },
  palette: {
    ramp: { lightness: 5.5, chroma: 0.016, hue: -3 },
    edgeShade: 0.16,
    contactShade: 0.3,
    ribStep: -0.8,
    ribOpacity: 0.6,
    ribBlend: "overlay",
  },
  annotation: {
    // Blue's left silhouette sits at x=283, leaving ~255px of card before the
    // edge — that gutter, not the right side, is what caps `lead` and how long
    // a support line can be. Widen the viewBox if you want fuller sentences.
    lead: 60,
    bow: -28,
    curve: 54,
    opacity: 0.55,
    strokeWidth: 1.2,
    labelSize: 29,
    labelWeight: 600,
    supportSize: 21,
    supportWeight: 400,
    supportOpacity: 0.6,
  },
  lidOverhang: 14,
  units: [
    {
      id: "rust",
      label: "Target Ads",
      ordinal: "04",
      support: "In-market accounts",
      side: "right",
      cx: 646,
      rx: 176,
      lidTop: 239,
      lidH: 12,
      drumH: 60,
      lidCx: 646,
      lidRx: 190,
      base: { l: 86, c: 0.095, h: 62 },
      ribCount: 30,
      ribWidth: 1.5,
    },
    {
      id: "blue",
      label: "Outreach",
      ordinal: "03",
      support: "Adaptive sends",
      side: "left",
      cx: 499,
      rx: 216,
      lidTop: 295,
      lidH: 12,
      drumH: 126,
      lidCx: 499,
      lidRx: 226,
      base: { l: 78, c: 0.055, h: 238 },
      ribCount: 30,
      ribWidth: 1.5,
    },
    {
      id: "pink",
      label: "Content",
      ordinal: "02",
      support: "Stage-matched assets",
      side: "right",
      cx: 586,
      rx: 224,
      lidTop: 417,
      lidH: 12,
      drumH: 126,
      lidCx: 583,
      lidRx: 236,
      base: { l: 70, c: 0.075, h: 345 },
      ribCount: 30,
      ribWidth: 1.5,
    },
    {
      id: "green",
      label: "Lookalike Audiences",
      ordinal: "01",
      support: "From your best accounts",
      side: "left",
      // Runs past the bottom of the card and is clipped. The crop is what makes
      // the tower feel taller than its frame.
      cx: 668,
      rx: 216,
      lidTop: 539,
      lidH: 12,
      drumH: 180,
      lidCx: 662,
      lidRx: 237,
      base: { l: 62, c: 0.09, h: 149 },
      ribCount: 30,
      ribWidth: 1.5,
      labelYBias: 31,
    },
  ],
};

/* -------------------------------------------------------------- primitives */

type Cyl = { cx: number; rx: number; top: number; bottom: number };

/**
 * Round every derived coordinate. Trig output like 378.48634020712643 serializes
 * to a different decimal string on the server than the client renders from the
 * number, which trips a hydration mismatch the moment this SVG sits inside a
 * client boundary. Three decimals is far below a subpixel at any render size.
 */
const q = (n: number) => Math.round(n * 1000) / 1000;

const ry = (rx: number, cam: Camera) => q(rx * cam.ryRatio);

const lidBottomOf = (u: Unit) => u.lidTop + u.lidH;
const drumBottomOf = (u: Unit) => lidBottomOf(u) + u.drumH;

const drumOf = (u: Unit): Cyl => ({
  cx: u.cx,
  rx: u.rx,
  top: lidBottomOf(u),
  bottom: drumBottomOf(u),
});

const lidOf = (u: Unit, overhang: number): Cyl => ({
  cx: u.lidCx ?? u.cx,
  rx: u.lidRx ?? u.rx + overhang,
  top: u.lidTop,
  bottom: lidBottomOf(u),
});

/**
 * The front wall of a cylinder: down the left silhouette, across the near
 * bottom arc, up the right silhouette, back along the near top arc.
 *
 * Sweep flags are load-bearing. Left→right through the BOTTOM is sweep 0;
 * right→left through the front of the TOP ellipse is sweep 1. Swap them and
 * the wall inverts into a bowtie. The far half of the bottom ellipse is never
 * drawn — it is hidden by the cylinder itself, and drawing it produces the
 * classic "wireframe glass" mistake.
 */
function wallPath(geo: Cyl, cam: Camera) {
  const r = ry(geo.rx, cam);
  const l = geo.cx - geo.rx;
  const rt = geo.cx + geo.rx;
  return [
    `M ${l} ${geo.top}`,
    `V ${geo.bottom}`,
    `A ${geo.rx} ${r} 0 0 0 ${rt} ${geo.bottom}`,
    `V ${geo.top}`,
    `A ${geo.rx} ${r} 0 0 1 ${l} ${geo.top}`,
    "Z",
  ].join(" ");
}

/**
 * Ribs are spaced evenly in ANGLE around the cylinder and then projected —
 * never evenly in x. Three things fall out for free, all visible in the
 * reference: ribs bunch toward the silhouette edges, each rib begins on the
 * *curve* of the top ellipse rather than on a flat line, and ribs are longest
 * at the center because top and bottom arcs curve in parallel.
 */
function ribLines(geo: Cyl, cam: Camera, count: number) {
  const r = ry(geo.rx, cam);
  return Array.from({ length: count }, (_, i) => {
    const theta = (Math.PI * (i + 1)) / (count + 1);
    const dx = -Math.cos(theta) * geo.rx;
    const dy = Math.sin(theta) * r;
    return { x: q(geo.cx + dx), y1: q(geo.top + dy), y2: q(geo.bottom + dy) };
  });
}

function TopFace({ geo, fill, cam }: { geo: Cyl; fill: string; cam: Camera }) {
  return (
    <ellipse
      cx={geo.cx}
      cy={geo.top}
      rx={geo.rx}
      ry={ry(geo.rx, cam)}
      fill={fill}
      stroke={C.ink}
      strokeWidth={cam.strokeWidth}
    />
  );
}

/** One cylinder: top face, front wall, edge falloff, optional ribs. */
function Cylinder({
  geo,
  cam,
  wall,
  face,
  rib,
  ribOpacity = 1,
  ribBlend = "normal",
  edge,
  edgeShade,
  ribCount = 0,
  ribWidth = 3,
  id,
}: {
  geo: Cyl;
  cam: Camera;
  wall: string;
  face: string;
  rib?: string;
  ribOpacity?: number;
  ribBlend?: BlendMode;
  /** Colour of the left/right falloff — a darker shade, never black. */
  edge: string;
  edgeShade: number;
  ribCount?: number;
  ribWidth?: number;
  id: string;
}) {
  const d = wallPath(geo, cam);
  const clipId = `${id}-clip`;
  const edgeId = `${id}-edge`;

  // isolate: without it the blend reaches past the drum and mixes with the
  // canvas and whatever unit is painted underneath.
  return (
    <g style={{ isolation: "isolate" }}>
      <TopFace geo={geo} fill={face} cam={cam} />
      <path d={d} fill={wall} stroke={C.ink} strokeWidth={cam.strokeWidth} />

      {ribCount > 0 && rib && (
        <>
          <clipPath id={clipId}>
            <path d={d} />
          </clipPath>
          <g
            clipPath={`url(#${clipId})`}
            stroke={rib}
            strokeWidth={ribWidth}
            opacity={ribOpacity}
            style={{ mixBlendMode: ribBlend }}
          >
            {ribLines(geo, cam, ribCount).map((l, i) => (
              <line key={i} x1={l.x} y1={l.y1} x2={l.x} y2={l.y2} />
            ))}
          </g>
        </>
      )}

      {/* Edge falloff. Both sides, not one — there is no directional key light
       * in this illustration; the depth comes from geometry, not rendering.
       * Tinted with the unit's own dark shade rather than black, which would
       * desaturate the very chroma the ramp just added. */}
      <defs>
        <linearGradient id={edgeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={edge} stopOpacity={edgeShade} />
          <stop offset="0.35" stopColor={edge} stopOpacity="0" />
          <stop offset="0.65" stopColor={edge} stopOpacity="0" />
          <stop offset="1" stopColor={edge} stopOpacity={edgeShade} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${edgeId})`} />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={cam.strokeWidth} />
    </g>
  );
}

/**
 * Contact occlusion: the unit resting on this lid darkens the ring around its
 * own base. Drawn last inside the unit, so the drum above paints over the
 * middle of it and only the crescent survives.
 */
function ContactShadow({
  lid,
  resting,
  cam,
  fill,
  opacity,
}: {
  lid: Cyl;
  resting: Unit;
  cam: Camera;
  fill: string;
  opacity: number;
}) {
  const clipId = `contact-${resting.id}`;
  const rx = resting.rx + 10;
  return (
    <>
      <clipPath id={clipId}>
        <ellipse cx={lid.cx} cy={lid.top} rx={lid.rx} ry={ry(lid.rx, cam)} />
      </clipPath>
      <ellipse
        clipPath={`url(#${clipId})`}
        cx={resting.cx}
        cy={drumBottomOf(resting) + 6}
        rx={rx}
        ry={ry(rx, cam)}
        fill={fill}
        opacity={opacity}
      />
    </>
  );
}

function StackUnit({
  unit,
  resting,
  cam,
  palette,
  overhang,
}: {
  unit: Unit;
  resting?: Unit;
  cam: Camera;
  palette: Palette;
  overhang: number;
}) {
  const lid = lidOf(unit, overhang);
  const { ramp } = palette;

  // Every surface on this unit is the same colour walked down the ramp.
  const tone = (steps: number) => shade(unit.base, ramp, steps);
  const drumWall = tone(STEP.drumWall);

  return (
    <g>
      {/* Drum first: it sits lower in space than its own lid. */}
      <Cylinder
        id={`${unit.id}-drum`}
        geo={drumOf(unit)}
        cam={cam}
        wall={drumWall}
        face={drumWall}
        rib={tone(palette.ribStep)}
        ribOpacity={palette.ribOpacity}
        ribBlend={palette.ribBlend}
        edge={tone(STEP.rib)}
        edgeShade={palette.edgeShade}
        ribCount={unit.ribCount}
        ribWidth={unit.ribWidth}
      />
      <Cylinder
        id={`${unit.id}-lid`}
        geo={lid}
        cam={cam}
        wall={tone(STEP.lidWall)}
        face={tone(STEP.lidFace)}
        edge={tone(STEP.rib)}
        edgeShade={palette.edgeShade}
      />
      {resting && (
        <ContactShadow
          lid={lid}
          resting={resting}
          cam={cam}
          fill={tone(STEP.contact)}
          opacity={palette.contactShade}
        />
      )}
    </g>
  );
}

/** Strict painter's algorithm — bottom of the tower first, cap last. */
function Tower({ geometry }: { geometry: Geometry }) {
  const bottomUp = [...geometry.units].reverse();
  return (
    <g clipPath="url(#cardClip)">
      {bottomUp.map((unit, i) => (
        <StackUnit
          key={unit.id}
          unit={unit}
          resting={bottomUp[i + 1]} // the unit standing on this one's lid
          cam={geometry.camera}
          palette={geometry.palette}
          overhang={geometry.lidOverhang}
        />
      ))}
    </g>
  );
}

/* -------------------------------------------------------------- annotation */

const ARROW = { len: 13, half: 7.5 };

function Arrowhead({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  // dir = 1 points right, -1 points left. Always points AT the shape.
  // The curve is built to arrive horizontally, so a horizontal head sits flush
  // on its tangent — no rotation maths needed.
  const back = x - dir * ARROW.len;
  return (
    <path
      d={`M ${x} ${y} L ${back} ${y - ARROW.half} L ${back} ${y + ARROW.half} Z`}
      fill={C.ink}
    />
  );
}

/**
 * Anchors are DERIVED from the unit, never authored separately — so the arrows
 * track the shapes when the geometry is tuned instead of silently drifting off
 * them. The tip lands on the drum silhouette at its vertical midpoint, which is
 * exactly cx ± rx because that is where the ellipse is widest.
 */
function leaderAnchor(u: Unit) {
  const y = q((lidBottomOf(u) + drumBottomOf(u)) / 2 + (u.labelYBias ?? 0));
  const x = u.side === "right" ? u.cx + u.rx : u.cx - u.rx;
  return { x, y };
}

/**
 * A curved callout: text sits off to the side and above, and a cubic bezier
 * sweeps down into the shape.
 *
 * Both control points are placed HORIZONTALLY from their anchors, which is what
 * makes the curve leave the text flat and arrive at the shape flat. Angled
 * controls give you a lazy diagonal that reads as a mistake; this reads as a
 * drawn line. It also means the arrowhead needs no rotation, since the tangent
 * at the tip is exactly horizontal.
 */
function Leader({ unit, ann }: { unit: Unit; ann: Annotation }) {
  const { x: tx, y: ty } = leaderAnchor(unit);
  const out = unit.side === "right" ? 1 : -1; // away from the tower

  const sx = q(tx + out * ann.lead); // curve start, beside the text
  const sy = q(ty + ann.bow);
  const ex = q(tx + out * ARROW.len); // curve end, behind the arrowhead
  const d = [
    `M ${sx} ${sy}`,
    `C ${q(sx - out * ann.curve)} ${sy},`,
    `${q(ex + out * ann.curve)} ${ty},`,
    `${ex} ${ty}`,
  ].join(" ");

  const textX = q(sx + out * 14);
  const anchor = unit.side === "right" ? "start" : "end";

  return (
    <g>
      <g opacity={ann.opacity}>
        <path
          d={d}
          fill="none"
          stroke={C.ink}
          strokeWidth={ann.strokeWidth}
          strokeLinecap="round"
        />
        <Arrowhead x={tx} y={ty} dir={(out === 1 ? -1 : 1) as 1 | -1} />
      </g>

      {/* Weight carries the hierarchy, not size alone — the support line is a
       * step down in both, plus a drop in opacity. */}
      <text
        x={textX}
        y={q(sy - 5)}
        fill={C.ink}
        fontSize={ann.labelSize}
        fontWeight={ann.labelWeight}
        fontFamily="var(--font-sans)"
        textAnchor={anchor}
        dominantBaseline="middle"
      >
        <tspan
          fontSize={ann.supportSize}
          fontWeight={700}
          fillOpacity={0.42}
        >
          {unit.ordinal}
        </tspan>
        <tspan dx={11}>{unit.label}</tspan>
      </text>
      <text
        x={textX}
        y={q(sy + ann.supportSize + 5)}
        fill={C.ink}
        fillOpacity={ann.supportOpacity}
        fontSize={ann.supportSize}
        fontWeight={ann.supportWeight}
        fontFamily="var(--font-sans)"
        textAnchor={anchor}
        dominantBaseline="middle"
      >
        {unit.support}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ chrome */

/** The one piece that has to be a hand-authored path. */
function BirdMark({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`}>
      <path
        d="M2 10.2 6.4 8.2c-.4-2.8.8-5.6 3.2-6.8 0 2-.2 3.4-.6 4.6 3-.8 6 .8 7.4 3.6 1.4 2.8 1.2 5.8-.2 8.2l6.2 4.8-8.2-2.2c-3.2.6-6.2-1.2-7.4-4.2-.8-2.2-.8-4.4-.2-6z"
        fill={C.ink}
      />
    </g>
  );
}

function Masthead() {
  return (
    <g>
      <BirdMark x={548} y={62} size={30} />
      <text
        x={586}
        y={88}
        fill={C.ink}
        fontSize={30}
        fontWeight={600}
        fontFamily="var(--font-sans)"
      >
        Cardinal
      </text>
      <text
        x={VIEW_W / 2}
        y={172}
        fill={C.ink}
        fontSize={54}
        fontWeight={400}
        fontFamily="var(--font-sans)"
        textAnchor="middle"
      >
        Your sales motion, built by you
      </text>
    </g>
  );
}

function Frame() {
  return (
    <>
      <rect width={VIEW_W} height={VIEW_H} fill={C.frame} />
      <rect
        x={CARD.x}
        y={CARD.y}
        width={CARD.w}
        height={CARD.h}
        fill={C.canvas}
      />
    </>
  );
}

function Defs() {
  return (
    <defs>
      <clipPath id="cardClip">
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} />
      </clipPath>
    </defs>
  );
}

/* ------------------------------------------------------------------ export */

export default function StackedTower({
  className,
  geometry = DEFAULT_GEOMETRY,
}: {
  className?: string;
  geometry?: Geometry;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="stacked-tower-title stacked-tower-desc"
      className={className}
    >
      <title id="stacked-tower-title">Your sales motion, built by you</title>
      <desc id="stacked-tower-desc">
        Four stacked cylinders labelled, from top to bottom, Target Ads,
        Outreach, Content and Similarities.
      </desc>

      <Defs />
      <Frame />
      <Masthead />
      <Tower geometry={geometry} />

      {/* Annotation always sits on top and is never occluded. */}
      {geometry.units.map((u) => (
        <Leader key={u.id} unit={u} ann={geometry.annotation} />
      ))}
    </svg>
  );
}
