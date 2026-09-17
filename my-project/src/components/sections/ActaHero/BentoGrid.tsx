import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartAverageIcon,
  CheckmarkCircle02Icon,
  Coins01Icon,
  Radar01Icon,
} from "@hugeicons/core-free-icons";

/* Benchmark readouts. Every figure is drawn from its own value — `ratio` is the
 * value normalised against the largest in its column, so each field reads as
 * data rather than as decoration. `brand` marks the one row the section is
 * actually about; it is the only place blue is spent inside a cell.
 *
 * `chart` picks the form. The four metrics tell four different stories — a
 * blowout, a tight cluster, a near-miss, a ratio — and one shared bar list
 * flattened all of them into the same shape. `short` is the iso cell's rotated
 * axis label, which has a 66px lane to live in; `n` is the raw number for forms
 * that need to place a value on an absolute scale rather than a 0–1 ratio. */
type Row = {
  name: string;
  short?: string;
  value: string;
  ratio: number;
  n?: number;
  brand?: boolean;
};

type Metric = {
  title: string;
  qualifier: string;
  direction: string;
  icon: typeof ChartAverageIcon;
  /* Unit line beside the headline figure. The figure itself is always the
   * brand row's own value, so there is one source for the number. */
  headline: string;
  blurb: string;
  chart: "iso" | "units" | "radar" | "slab" | "bars";
  rows: Row[];
};

const METRICS: Metric[] = [
  {
    title: "F1 Score",
    headline: "top F1 score",
    qualifier: "accuracy × recall",
    direction: "Higher is better",
    icon: ChartAverageIcon,
    chart: "iso",
    blurb:
      "The combined measure of what we find and what we get right, scored against every major provider.",
    rows: [
      {
        name: "akta.pro",
        short: "akta.pro",
        value: "81.3",
        ratio: 1,
        brand: true,
      },
      { name: "GPT-5.5", short: "GPT-5.5", value: "62.5", ratio: 0.769 },
      { name: "SerpAPI", short: "SerpAPI", value: "52.6", ratio: 0.647 },
      { name: "Perigon", short: "Perigon", value: "48.6", ratio: 0.598 },
      {
        name: "Claude Sonnet 4.5",
        short: "Sonnet 4.5",
        value: "47.8",
        ratio: 0.588,
      },
      { name: "Parallel", short: "Parallel", value: "46.4", ratio: 0.571 },
    ],
  },
  {
    title: "Accuracy",
    headline: "of 100 verified",
    qualifier: "precision",
    direction: "Higher is better",
    icon: CheckmarkCircle02Icon,
    chart: "units",
    blurb:
      "How much of what we return is correct — the share of articles that survive verification.",
    rows: [
      {
        name: "akta.pro",
        short: "akta.pro",
        value: "93%",
        ratio: 1,
        n: 93,
        brand: true,
      },
      {
        name: "Claude Opus 4.8",
        short: "Opus 4.8",
        value: "88%",
        ratio: 0.946,
        n: 88,
      },
      {
        name: "GPT-5.4 mini",
        short: "GPT-5.4",
        value: "86%",
        ratio: 0.925,
        n: 86,
      },
      {
        name: "Claude Sonnet 4.5",
        short: "Sonnet 4.5",
        value: "82%",
        ratio: 0.882,
        n: 82,
      },
      { name: "GPT-5.5", short: "GPT-5.5", value: "81%", ratio: 0.871, n: 81 },
      {
        name: "Parallel",
        short: "Parallel",
        value: "72%",
        ratio: 0.774,
        n: 72,
      },
    ],
  },
  {
    title: "Coverage",
    headline: "of all news reached",
    qualifier: "recall",
    direction: "Higher is better",
    icon: Radar01Icon,
    chart: "radar",
    blurb:
      "How much of the news that exists we actually reach, across every source in the index.",
    rows: [
      { name: "Perigon", value: "73.7%", ratio: 1, n: 73.7 },
      { name: "akta.pro", value: "72.7%", ratio: 0.986, n: 72.7, brand: true },
      { name: "Exa", value: "68.7%", ratio: 0.932, n: 68.7 },
      { name: "NewsAPI", value: "59.4%", ratio: 0.806, n: 59.4 },
      { name: "GPT-5.5", value: "55.9%", ratio: 0.758, n: 55.9 },
      { name: "SerpAPI", value: "50.6%", ratio: 0.686, n: 50.6 },
    ],
  },
  {
    title: "Cost",
    headline: "per 1,000 verified",
    qualifier: "per 1K accurate articles",
    direction: "Lower is better",
    icon: Coins01Icon,
    chart: "slab",
    blurb:
      "What a thousand verified articles costs you — priced on results, not on requests made.",
    rows: [
      { name: "akta.pro", value: "$0.50", ratio: 0.175, brand: true },
      { name: "SerpAPI", value: "$0.67", ratio: 0.235 },
      { name: "NewsAPI", value: "$0.72", ratio: 0.253 },
      { name: "Perigon", value: "$0.73", ratio: 0.256 },
      { name: "Parallel", value: "$1.52", ratio: 0.533 },
      { name: "GPT-5.4 mini", value: "$2.85", ratio: 1 },
    ],
  },
];

/* Eyebrow — a notched chip carrying a solid brand square and one mono label.
 * The square is the section's single decorative use of blue; everything else
 * structural in this section is gray. */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="akta-notch text-akta-gray-text-high shadow-akta-border bg-akta-gray-bg-subtle inline-flex items-center gap-2 px-3 py-1.5 [--akta-notch-arm:8px] [--akta-notch-color:var(--akta-gray-border-subtle)] [--akta-notch-inset:4px] [--akta-notch-weight:1px]">
      <span
        className="bg-akta-brand-solid size-2 shrink-0"
        aria-hidden="true"
      />
      <span className="font-akta-mono text-akta-label-12-mono uppercase">
        {children}
      </span>
    </span>
  );
}

/* Section header — eyebrow, h2, one paragraph of body copy, centred on the
 * grid and capped at a readable measure. */
function SectionHeader() {
  return (
    <div
      data-akta-reveal
      className="flex flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20 lg:px-10 lg:py-24"
    >
      <SectionEyebrow>Benchmarks</SectionEyebrow>

      <h2 className="text-akta-heading-48 sm:text-akta-heading-48-sm lg:text-akta-heading-48-lg text-akta-gray-text-high mt-6 max-w-3xl text-balance sm:mt-8">
        We Ranked Top as News Provider
      </h2>

      <p className="text-akta-copy-16 sm:text-akta-copy-16-sm text-akta-gray-text-low mt-4 max-w-[65ch] text-balance sm:mt-5">
        Best news quality at the lowest cost across News APIs, Agentic Search
        APIs, LLMs, and Bulk Scrapers.
      </p>
    </div>
  );
}

/* Type inside the charts.
 *
 * An SVG's text scales with its viewBox, so the same `fontSize` renders at a
 * different pixel size in every chart unless the charts share a scale. Two
 * rules keep all four cells on one size:
 *
 *   1. every chart SVG uses the same viewBox WIDTH of 330, so one user
 *      unit is one user unit everywhere — geometry is scaled to fit that box
 *      rather than the box being fitted to the geometry;
 *   2. every chart SVG is capped at that same 330px, so the scale factor stays
 *      between 0.97 (a 320px column at lg) and 1.00, never above.
 *
 * Together those hold every label at 11.6-12px — the same as the HTML cells'
 * --text-akta-label-12-mono, which is the section's one mono label size. */
const LABEL = 12;
const CHART_SVG = "w-full max-w-[330px]";

/* Every graphic form is drawn, so every graphic form needs a text equivalent.
 * This is the one the screen reader gets; the visual is hidden from it. */
function MetricTable({ metric }: { metric: Metric }) {
  return (
    <ul className="sr-only">
      {metric.rows.map((row) => (
        <li key={row.name}>
          {row.name}: {row.value}
        </li>
      ))}
    </ul>
  );
}

/* The cell's claim, stated in words and figures before the graphic argues it.
 * Every cell carries one, so the four read as a set however different their
 * bodies are. */
/* Splits a headline value into its digits and whatever symbol sits against
 * them — "$0.50" -> "$" + "0.50", "93%" -> "93" + "%" — so the symbol can be
 * held off the number. The display step carries -0.06em tracking, which eats
 * into any gap set here, so 0.16em lands at roughly 4px of actual air at 40px.
 * Headline only: the chart labels are left alone. */
const FIGURE_PARTS = /^(\D*)([\d.,]+)(\D*)$/;

function Figure({ value }: { value: string }) {
  const parts = FIGURE_PARTS.exec(value);
  if (!parts) return <>{value}</>;

  const [, prefix, digits, suffix] = parts;
  return (
    <>
      {prefix && <span className="mr-[0.16em]">{prefix}</span>}
      {digits}
      {suffix && <span className="ml-[0.16em]">{suffix}</span>}
    </>
  );
}

function MetricHeadline({ metric }: { metric: Metric }) {
  const brand = metric.rows.find((row) => row.brand) ?? metric.rows[0];
  return (
    <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-akta-display text-akta-brand-solid font-akta-mono tabular-nums">
        <Figure value={brand.value} />
      </span>
      <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
        {metric.headline}
      </span>
    </p>
  );
}

/* Shared chrome for the graphic half of a cell: the direction qualifier, then
 * whichever form the metric asked for. Keeping this out of the forms means the
 * four cells stay aligned to each other however different their bodies get. */
function ChartFrame({
  metric,
  children,
}: {
  metric: Metric;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-5 sm:py-6">
      {/* Top group: qualifier, then the claim. */}
      <div>
        <p className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
          {metric.direction}
        </p>
        <MetricHeadline metric={metric} />
      </div>

      {/* The figure floats in the middle of the space the claim leaves, so the slack
       * chart falls between the claim and the graphic rather than pooling
       * under it. pt-10 is the floor on that gap when a chart is tall. */}
      <div className="my-auto py-10">{children}</div>

      <MetricTable metric={metric} />
    </div>
  );
}

/* ── Form 1 · isometric bar city ────────────────────────────────────────────
 *
 * 2:1 dimetric rather than true 30° isometric: the shallower angle costs half
 * the vertical drop across six bars, which is the difference between fitting a
 * 1/4-width cell and not.
 *
 *   project(x, y, z) = [x - y, (x + y) / 2 - z]
 *
 * 3D is a poor instrument for comparing close values — foreshortening and the
 * top face both read as extra length — so it is spent on F1 and only F1, where
 * the winning margin is 30% and precision is not what the cell is for.
 *
 * Labels are the whole difficulty here: in isometric, the space below-right of
 * every bar is occupied by the next bar, so nothing can sit under a bar. They
 * drop instead on vertical leaders to a lane below the ground line, rotated
 * -90°. A leader at the front vertex of bar i has x = i * PITCH, and bar i+1
 * starts at i * PITCH + 12, so no leader ever crosses a solid. */
/* PITCH must clear BW + BD (48) or adjacent bars overlap in projection: a bar
 * spans +/-BW from its own centre while centres sit PITCH apart, so at 36 every
 * bar ran 12px into its neighbour and a centred label floated over two solids
 * at once. 50 leaves a 2px gap. */
const ISO = { BW: 24, BD: 24, PITCH: 50, HMAX: 84, BASE: 162, LANE: 66 };

/* Faces recede toward the canvas rather than toward a darker token, because the
 * brand ramp inverts between themes — brand-solid-hover is *lighter* than
 * brand-solid in dark mode, which would flip the shading. Mixing with
 * --akta-canvas keeps the top face the most saturated in both. */
function faceFills(brand?: boolean) {
  const base = brand ? "var(--akta-brand-solid)" : "var(--akta-gray-ui-active)";
  return {
    base,
    left: `color-mix(in oklab, ${base} 74%, var(--akta-canvas))`,
    right: `color-mix(in oklab, ${base} 50%, var(--akta-canvas))`,
  };
}

const project = (x: number, y: number, z: number) => [x - y, (x + y) / 2 - z];
const pt = (x: number, y: number, z: number) => project(x, y, z).join(",");

function IsoBar({ row, i }: { row: Row; i: number }) {
  const { BW, BD, PITCH, HMAX, BASE } = ISO;
  const x0 = i * PITCH;
  const x1 = x0 + BW;
  const h = row.ratio * HMAX;

  const { base, left, right } = faceFills(row.brand);

  /* The front-most ground vertex: where the leader starts. */
  const [lx, ly] = project(x1, BD, 0);
  /* Centre of the top face: mean of its four projected corners. */
  const [tx, ty] = project(x0 + BW / 2, BD / 2, h);

  return (
    <g>
      <title>{`${row.name}: ${row.value}`}</title>

      <polygon
        points={`${pt(x0, BD, h)} ${pt(x1, BD, h)} ${pt(x1, BD, 0)} ${pt(x0, BD, 0)}`}
        style={{ fill: left }}
      />
      <polygon
        points={`${pt(x1, 0, h)} ${pt(x1, BD, h)} ${pt(x1, BD, 0)} ${pt(x1, 0, 0)}`}
        style={{ fill: right }}
      />
      <polygon
        points={`${pt(x0, 0, h)} ${pt(x1, 0, h)} ${pt(x1, BD, h)} ${pt(x0, BD, h)}`}
        style={{ fill: base }}
      />

      <line
        x1={lx}
        y1={ly}
        x2={lx}
        y2={BASE}
        strokeWidth={1}
        style={{ stroke: "var(--akta-gray-border-subtle)" }}
        strokeOpacity={0.5}
      />

      {/* Straight on top of the bar — seated on the top face, which binds the
       * figure to its own solid. The face is a constant 2*BW wide whatever the
       * bar's height, so this never crowds. */}
      <text
        x={tx}
        y={ty}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={LABEL}
        className="font-akta-mono"
        style={{
          fill: row.brand
            ? "var(--akta-brand-on-solid)"
            : "var(--akta-gray-text-high)",
        }}
      >
        {row.value}
      </text>

      <text
        x={lx}
        y={BASE + 7}
        textAnchor="end"
        fontSize={LABEL}
        transform={`rotate(-90 ${lx} ${BASE + 7})`}
        className="font-akta-mono"
        style={{
          fill: row.brand
            ? "var(--akta-brand-solid)"
            : "var(--akta-gray-text-low)",
        }}
      >
        {row.short ?? row.name}
      </text>
    </g>
  );
}

function IsoBars({ metric }: { metric: Metric }) {
  const { BD, PITCH } = ISO;
  const span = (metric.rows.length - 1) * PITCH + ISO.BW;
  const [gx1, gy1] = project(-12, BD, 0);
  const [gx2, gy2] = project(span + 12, BD, 0);

  return (
    <svg
      viewBox="-40 -94 330 352"
      className={CHART_SVG}
      role="img"
      aria-label={`${metric.title} by provider, isometric bar chart`}
    >
      {/* Ground plane: one hairline the bars stand on and the leaders drop from. */}
      <line
        x1={gx1}
        y1={gy1}
        x2={gx2}
        y2={gy2}
        strokeWidth={1}
        style={{ stroke: "var(--akta-gray-border-subtle)" }}
        strokeOpacity={0.5}
      />

      {/* Back to front. Bars never overlap at these spacings, but painting in
       * depth order keeps that true if PITCH is ever tightened. */}
      {metric.rows.map((row, i) => (
        <IsoBar key={row.name} row={row} i={i} />
      ))}
    </svg>
  );
}

/* ── Form 2 · unit field ───────────────────────────────────────────────────
 *
 * One cell per article, a hundred per provider, filled by how many come back
 * correct. Counted in the direction the cell's own qualifier promises: the
 * column says HIGHER IS BETTER, so the longer comb has to be the better one.
 *
 * The trade this makes: accuracy only runs 72-93%, so the combs differ by 21
 * units out of 100 rather than dramatically. Read as errors the same data
 * spreads 4x and separates far harder — but it inverts the direction, and a
 * chart that contradicts its own label costs more than the contrast is worth.
 *
 * The track takes the full width with its label above rather than beside it;
 * at a hundred units a name column would squeeze each unit under a pixel.
 * Units flex, so the comb stays true at any column width. */
const UNITS = 100;

function UnitField({ metric }: { metric: Metric }) {
  const rows = metric.rows.filter((row) => row.n != null);

  return (
    <div>
      <p className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
        Correct per 100
      </p>

      <ul className="mt-3 space-y-3">
        {rows.map((row) => {
          const correct = Math.round(row.n as number);
          const ink = row.brand
            ? "text-akta-brand-solid"
            : "text-akta-gray-text-low";

          return (
            <li
              key={row.name}
              title={`${row.name}: ${correct} correct per 100`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`font-akta-mono text-akta-label-12-mono truncate ${ink}`}
                >
                  {row.short ?? row.name}
                </span>
                <span
                  className={`font-akta-mono text-akta-label-12-mono shrink-0 tabular-nums ${ink}`}
                >
                  {correct}
                </span>
              </div>

              <span className="mt-1.5 flex gap-px" aria-hidden="true">
                {Array.from({ length: UNITS }, (_, k) => (
                  <span
                    key={k}
                    className={`h-2 flex-1 ${
                      k < correct
                        ? row.brand
                          ? "bg-akta-brand-solid"
                          : "bg-akta-gray-ui-active"
                        : "bg-akta-gray-ui"
                    }`}
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Form 3 · ring radar ────────────────────────────────────────────────────
 *
 * Coverage is the one column akta does not win, and a bar list said so twice —
 * once by rank, once by putting a visibly shorter bar under the brand name. A
 * polar plot states the same fact more fairly: two dots a hair apart on the
 * outer ring read as "tied at the top of the field", which is what a 1.0-point
 * gap on 73.7 actually is.
 *
 * The rings are the grid, not the data — providers sit at their own bearings,
 * and the dots are deliberately NOT joined into a spider polygon. Six rival
 * vendors are not one series, and connecting them would draw a shape whose
 * area means nothing.
 *
 * The radial scale starts at 40%, not 0. On a radial axis that is a real
 * distortion (area goes as r squared), so the grid rings are drawn and
 * labelled — the truncation is stated on the chart rather than hidden in it. */
const RADAR = {
  R: 92,
  MIN: 40,
  MAX: 80,
  RINGS: [50, 60, 70, 80],
  SWEEP: 24,
  LABEL_R: 116,
  HUB: 14,
};

/* Rounded, because cos(-90 deg) lands on 6.1e-17 and SVG then carries an
 * exponent-notation coordinate through to the DOM. */
const round2 = (n: number) => Math.round(n * 100) / 100;

const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [round2(r * Math.cos(a)), round2(r * Math.sin(a))];
};

const radarR = (n: number) =>
  ((n - RADAR.MIN) / (RADAR.MAX - RADAR.MIN)) * RADAR.R;

function RingRadar({ metric }: { metric: Metric }) {
  const { R, RINGS, SWEEP, LABEL_R, HUB } = RADAR;

  /* Brand takes 12 o'clock; the rest follow in the order they were ranked. */
  const brand = metric.rows.find((row) => row.brand) ?? metric.rows[0];
  const ordered = [brand, ...metric.rows.filter((row) => !row.brand)];
  const bearing = (i: number) => -90 + i * (360 / ordered.length);

  const rBrand = radarR(brand.n ?? 0);
  const [wx1, wy1] = polar(rBrand, -90 - SWEEP);
  const [wx2, wy2] = polar(rBrand, -90 + SWEEP);

  return (
    <svg
      viewBox="-165 -130 330 268"
      className={CHART_SVG}
      role="img"
      aria-label={`${metric.title} by provider, polar plot`}
    >
      <defs>
        <pattern
          id="akta-radar-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="3"
            cy="3"
            r="1.1"
            style={{ fill: "var(--akta-brand-solid)" }}
            fillOpacity="0.45"
          />
        </pattern>
      </defs>

      <g
        style={{ stroke: "var(--akta-gray-border-subtle)" }}
        strokeOpacity="0.45"
        fill="none"
      >
        {RINGS.map((v) => (
          <circle key={v} r={radarR(v)} strokeWidth={1} />
        ))}
        {/* Spokes stay well under the rings — they associate a marker with its
         * label without competing with either. */}
        <g strokeOpacity="0.3">
          {ordered.map((row, i) => {
            const [x, y] = polar(R, bearing(i));
            return (
              <line
                key={row.name}
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                strokeWidth={1}
              />
            );
          })}
        </g>
      </g>

      {/* Tick dots where each ring meets the crosshair, and one at each axis
       * end — the reference's way of making a grid read as measured. */}
      <g style={{ fill: "var(--akta-gray-border-subtle)" }} fillOpacity="0.7">
        {[90, 270].map((deg) => (
          <g key={deg}>
            {RINGS.map((v) => {
              const [x, y] = polar(radarR(v), deg);
              return <circle key={v} cx={x} cy={y} r={1.8} />;
            })}
          </g>
        ))}
      </g>

      {/* Brand reach as area, in a halftone the grid cannot be mistaken for. */}
      <path
        d={`M 0 0 L ${wx1} ${wy1} A ${rBrand} ${rBrand} 0 0 1 ${wx2} ${wy2} Z`}
        fill="url(#akta-radar-hatch)"
      />

      {ordered.map((row, i) => {
        const deg = bearing(i);
        const [x, y] = polar(radarR(row.n ?? 0), deg);
        const [lx, ly] = polar(LABEL_R, deg);
        const cos = Math.cos((deg * Math.PI) / 180);
        const anchor =
          Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
        const ink = row.brand
          ? "var(--akta-brand-solid)"
          : "var(--akta-gray-text-low)";

        return (
          <g key={row.name}>
            <title>{`${row.name}: ${row.value}`}</title>

            {/* Markers carry the data, so they outweigh every grid mark: a halo
             * on the brand, a 2.5px canvas ring on all of them so a dot stays
             * legible where it lands on a ring or a spoke. */}
            {row.brand && (
              <circle
                cx={x}
                cy={y}
                r={12}
                fill="none"
                strokeWidth={1}
                style={{ stroke: "var(--akta-brand-solid)" }}
                strokeOpacity={0.35}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={row.brand ? 7 : 5.5}
              strokeWidth={2.5}
              style={{
                fill: row.brand
                  ? "var(--akta-brand-solid)"
                  : "var(--akta-gray-ui-active)",
                stroke: "var(--akta-canvas)",
              }}
            />

            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              fontSize={LABEL}
              className="font-akta-mono"
              style={{
                fill: row.brand
                  ? "var(--akta-brand-solid)"
                  : "var(--akta-gray-text-high)",
              }}
            >
              {row.name}
            </text>
            <text
              x={lx}
              y={ly + 14}
              textAnchor={anchor}
              fontSize={LABEL}
              className="font-akta-mono"
              style={{ fill: ink }}
            >
              {row.value}
            </text>
          </g>
        );
      })}

      {/* Hub, drawn last so the spokes tuck under it. Same treatment as the
       * icon chip in the cell's title band. */}
      <circle
        r={HUB}
        strokeWidth={1}
        style={{
          fill: "var(--akta-brand-ui)",
          stroke: "var(--akta-brand-border)",
        }}
        strokeOpacity={0.6}
      />
      <g
        transform="translate(-8,-8)"
        style={{ color: "var(--akta-brand-text-low)" }}
      >
        <HugeiconsIcon icon={metric.icon} size={16} strokeWidth={1.5} />
      </g>
    </svg>
  );
}

/* ── Form 4 · isometric slab stack ──────────────────────────────────────────
 *
 * Cost is a ratio story, not a rank story: $0.50 against $2.85 is 5.7x, and
 * six bars sorted cheapest-first buried that under their own ordering. Stacked
 * slabs of identical footprint put thickness — the only thing that varies —
 * directly against thickness.
 *
 * Every slab projects to the same rhombus, so a gap in z is a clean vertical
 * gap on screen: nothing occludes anything, and each slab shows its top face
 * and both edges. Cheapest rides on top, so cost reads as weight piling up
 * underneath it. */
/* Scaled to the shared 330-unit box (x1.5 from the 220 this was drawn in) so
 * the stack keeps its physical size while its labels join the common scale. */
const SLAB = { W: 69, D: 69, TMAX: 69, GAP: 18 };

function SlabStack({ metric }: { metric: Metric }) {
  const { W, D, TMAX, GAP } = SLAB;

  /* Rows arrive cheapest-first; the stack builds from the bottom, so the most
   * expensive is laid down first and the brand wafer ends up on top. */
  const stack = [...metric.rows].reverse();
  let z = 0;
  const slabs = stack.map((row) => {
    const t = row.ratio * TMAX;
    const z0 = z;
    z += t + GAP;
    return { row, t, z0 };
  });

  return (
    <svg
      viewBox="-190 -270 330 345"
      className={CHART_SVG}
      role="img"
      aria-label={`${metric.title} by provider, stacked isometric slabs`}
    >
      {slabs.map(({ row, t, z0 }) => {
        const { base, left, right } = faceFills(row.brand);
        const z1 = z0 + t;
        /* The left and right vertical edges project to (D/2 - z) and (W/2 - z),
         * not to the front edge's (W+D)/2 - z. Using the front edge put every
         * label 23px low — one plate out of step with its own slab. */
        const [, midY] = project(0, D, z0 + t / 2);

        return (
          <g key={row.name}>
            <title>{`${row.name}: ${row.value}`}</title>

            <polygon
              points={`${pt(0, D, z1)} ${pt(W, D, z1)} ${pt(W, D, z0)} ${pt(0, D, z0)}`}
              style={{ fill: left }}
            />
            <polygon
              points={`${pt(W, 0, z1)} ${pt(W, D, z1)} ${pt(W, D, z0)} ${pt(W, 0, z0)}`}
              style={{ fill: right }}
            />
            <polygon
              points={`${pt(0, 0, z1)} ${pt(W, 0, z1)} ${pt(W, D, z1)} ${pt(0, D, z1)}`}
              style={{ fill: base }}
            />

            <text
              x={-(W + D) / 2 - 8}
              y={midY + 3}
              textAnchor="end"
              fontSize={LABEL}
              className="font-akta-mono"
              style={{
                fill: row.brand
                  ? "var(--akta-brand-solid)"
                  : "var(--akta-gray-text-low)",
              }}
            >
              {row.name}
            </text>
            <text
              x={(W + D) / 2 + 8}
              y={midY + 3}
              textAnchor="start"
              fontSize={LABEL}
              className="font-akta-mono"
              style={{
                fill: row.brand
                  ? "var(--akta-brand-solid)"
                  : "var(--akta-gray-text-low)",
              }}
            >
              {row.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Form 5 · ranked bars ───────────────────────────────────────────────────
 * One ranked row: name and figure on a line, the bar beneath it. The bar is a
 * track plus a fill rather than a border, so it survives any surface. */
function MetricBar({ row }: { row: Row }) {
  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`font-akta-mono text-akta-label-12-mono truncate uppercase ${
            row.brand ? "text-akta-gray-text-high" : "text-akta-gray-text-low"
          }`}
        >
          {row.name}
        </span>
        <span
          className={`font-akta-mono text-akta-label-12-mono shrink-0 tabular-nums ${
            row.brand ? "text-akta-brand-solid" : "text-akta-gray-text-low"
          }`}
        >
          {row.value}
        </span>
      </div>

      <div className="bg-akta-gray-ui-hover h-1.5 w-full">
        <div
          className={`h-full ${
            row.brand ? "bg-akta-brand-solid" : "bg-akta-gray-ui-active"
          }`}
          style={{ width: `${Math.round(row.ratio * 100)}%` }}
        />
      </div>
    </li>
  );
}

function RankedBars({ metric }: { metric: Metric }) {
  return (
    <ul className="mt-5 space-y-3" aria-hidden="true">
      {metric.rows.map((row) => (
        <MetricBar key={row.name} row={row} />
      ))}
    </ul>
  );
}

const CHARTS: Record<
  Metric["chart"],
  React.ComponentType<{ metric: Metric }>
> = {
  iso: IsoBars,
  units: UnitField,
  radar: RingRadar,
  slab: SlabStack,
  bars: RankedBars,
};

function MetricChart({ metric }: { metric: Metric }) {
  const Form = CHARTS[metric.chart];
  return (
    <ChartFrame metric={metric}>
      <Form metric={metric} />
    </ChartFrame>
  );
}

/* One bento cell: graphic, then a title band, then a caption band — each
 * separated by a rule rather than by a box. The cell's own right and bottom
 * rules come from `shadow-akta-rule-cell`, so the grid keeps separating
 * correctly at one, two or four columns. */
function MetricCell({ metric }: { metric: Metric }) {
  return (
    <article className="akta-notch shadow-akta-rule-cell flex flex-col [--akta-notch-arm:0px] [--akta-notch-color:var(--akta-gray-border-subtle)] [--akta-notch-inset:0px] [--akta-notch-weight:1px] lg:[--akta-notch-arm:10px]">
      <MetricChart metric={metric} />

      <div className="shadow-akta-rule-t flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <span
          className="bg-akta-brand-ui shadow-akta-ring-brand text-akta-brand-text-low flex size-7 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <HugeiconsIcon icon={metric.icon} size={16} strokeWidth={1.5} />
        </span>

        <h3 className="text-akta-heading-20 sm:text-akta-heading-20-sm text-akta-gray-text-high">
          {metric.title}{" "}
          <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
            ({metric.qualifier})
          </span>
        </h3>
      </div>

      <div className="shadow-akta-rule-t px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-akta-copy-14 sm:text-akta-copy-14-sm text-akta-gray-text-low max-w-[42ch]">
          {metric.blurb}
        </p>
      </div>
    </article>
  );
}

/* Benchmarks section — header on the grid, then a full-bleed band whose top
 * and bottom rules cross the viewport while the cells stay on the 1440 grid. */
export default function BentoGrid() {
  return (
    <section className="bg-akta-canvas font-akta-sans relative isolate overflow-hidden pb-20">
      <div className="max-w-akta lg:shadow-akta-rule-x relative mx-auto w-full">
        <SectionHeader />
      </div>

      <div className="shadow-akta-rule-y relative">
        <div
          data-akta-reveal
          className="max-w-akta lg:shadow-akta-rule-l relative mx-auto grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {METRICS.map((metric) => (
            <MetricCell key={metric.title} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
