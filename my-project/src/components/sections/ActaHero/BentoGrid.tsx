import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartAverageIcon,
  CheckmarkCircle02Icon,
  Coins01Icon,
  Radar01Icon,
} from "@hugeicons/core-free-icons";

/* Benchmark readouts. Every bar is drawn from its own figure — `ratio` is the
 * value normalised against the largest in its column, so the field reads as
 * data rather than as decoration. `brand` marks the one row the section is
 * actually about; it is the only place blue is spent inside a cell. */
type Row = {
  name: string;
  value: string;
  ratio: number;
  brand?: boolean;
};

type Metric = {
  title: string;
  qualifier: string;
  direction: string;
  icon: typeof ChartAverageIcon;
  blurb: string;
  rows: Row[];
};

const METRICS: Metric[] = [
  {
    title: "F1 Score",
    qualifier: "accuracy × recall",
    direction: "Higher is better",
    icon: ChartAverageIcon,
    blurb:
      "The combined measure of what we find and what we get right, scored against every major provider.",
    rows: [
      { name: "akta.pro", value: "81.3", ratio: 1, brand: true },
      { name: "GPT-5.5", value: "62.5", ratio: 0.769 },
      { name: "SerpAPI", value: "52.6", ratio: 0.647 },
      { name: "Perigon", value: "48.6", ratio: 0.598 },
      { name: "Claude Sonnet 4.5", value: "47.8", ratio: 0.588 },
      { name: "Parallel", value: "46.4", ratio: 0.571 },
    ],
  },
  {
    title: "Accuracy",
    qualifier: "precision",
    direction: "Higher is better",
    icon: CheckmarkCircle02Icon,
    blurb:
      "How much of what we return is correct — the share of articles that survive verification.",
    rows: [
      { name: "akta.pro", value: "93%", ratio: 1, brand: true },
      { name: "Claude Opus 4.8", value: "88%", ratio: 0.946 },
      { name: "GPT-5.4 mini", value: "86%", ratio: 0.925 },
      { name: "Claude Sonnet 4.5", value: "82%", ratio: 0.882 },
      { name: "GPT-5.5", value: "81%", ratio: 0.871 },
      { name: "Parallel", value: "72%", ratio: 0.774 },
    ],
  },
  {
    title: "Coverage",
    qualifier: "recall",
    direction: "Higher is better",
    icon: Radar01Icon,
    blurb:
      "How much of the news that exists we actually reach, across every source in the index.",
    rows: [
      { name: "Perigon", value: "73.7%", ratio: 1 },
      { name: "akta.pro", value: "72.7%", ratio: 0.986, brand: true },
      { name: "Exa", value: "68.7%", ratio: 0.932 },
      { name: "NewsAPI", value: "59.4%", ratio: 0.806 },
      { name: "GPT-5.5", value: "55.9%", ratio: 0.758 },
      { name: "SerpAPI", value: "50.6%", ratio: 0.686 },
    ],
  },
  {
    title: "Cost",
    qualifier: "per 1K accurate articles",
    direction: "Lower is better",
    icon: Coins01Icon,
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
        Ranked #1 News Provider
      </h2>

      <p className="text-akta-copy-16 sm:text-akta-copy-16-sm text-akta-gray-text-low mt-4 max-w-[65ch] text-balance sm:mt-5">
        Best news quality at the lowest cost across News APIs, Agentic Search
        APIs, LLMs, and Bulk Scrapers.
      </p>
    </div>
  );
}

/* One ranked row: name and figure on a line, the bar beneath it. The bar is a
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

/* The graphic half of a cell — the ranked field itself, drawn from the data
 * the cell is claiming. */
function MetricChart({ metric }: { metric: Metric }) {
  return (
    <div className="px-4 py-5 sm:px-5 sm:py-6">
      <p className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
        {metric.direction}
      </p>

      <ul className="mt-5 space-y-3">
        {metric.rows.map((row) => (
          <MetricBar key={row.name} row={row} />
        ))}
      </ul>
    </div>
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

      <div className="shadow-akta-rule-t mt-auto flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5">
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
    <section className="bg-akta-canvas font-akta-sans relative isolate overflow-hidden">
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
