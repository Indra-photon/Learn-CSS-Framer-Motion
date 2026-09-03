import React from "react";
import Image from "next/image";

import LogoFlip, { type Mark } from "./LogoFlip";
import SignalField from "./SignalField";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import {
  IconArrowUpRight,
  IconChartBar,
  IconChevronDown,
  IconCornerDownRight,
  IconFileDescription,
  IconFilter,
} from "@tabler/icons-react";

const NAV = [
  { label: "Data", caret: true },
  { label: "Benchmarks" },
  { label: "Pricing" },
  { label: "Resources", caret: true },
  { label: "API Docs", external: true },
];

/* Customer wordmarks, typeset rather than dropped in as logo SVGs — swap each
 * for the real mark when the assets land. Names are the ones akta.pro lists as
 * customers on its own site. */
const SERIF = "font-[family-name:var(--font-instrument-serif)] text-[26px]";

const LOGOS: Mark[] = [
  {
    label: "KPMG",
    className:
      "font-akta-sans text-akta-heading-24 sm:text-akta-heading-24-sm tracking-tight",
  },
  {
    label: "Adobe",
    className: "font-akta-sans text-akta-heading-24 sm:text-akta-heading-24-sm",
  },
  {
    label: "JLL",
    className:
      "font-akta-sans text-akta-heading-24 sm:text-akta-heading-24-sm tracking-[0.08em]",
  },
  { label: "Chicago Booth", className: SERIF },
  {
    label: "BabyAGI",
    className: "font-akta-sans text-akta-heading-20 sm:text-akta-heading-20-sm",
  },
];

const TAGLINE = [
  "Pay-as-you-go",
  "Built for AI agents",
  "Universal entity resolution",
];

/* One resolved company, shown as a datasheet rather than as JSON. */
const RECORD: [string, string][] = [
  ["ENTITY", "ACME_CORP"],
  ["SECTOR", "SaaS · Fintech"],
  ["HEADCOUNT", "\u221212%"],
  ["LAST SIGNAL", "4m ago"],
  ["SOURCES", "4"],
];

/* A button label that re-states itself on hover: the visible face rolls up and
 * an identical copy arrives from below. The duplicate is aria-hidden so the
 * accessible name stays single. */
function RollLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="akta-roll whitespace-nowrap">
      <span className="akta-roll-face">{children}</span>
      <span className="akta-roll-face akta-roll-face-next" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

function LandingHero() {
  return (
    <div>
      <section className="akta-section bg-akta-canvas font-akta-sans relative isolate min-h-screen overflow-hidden">
        <div className="max-w-akta lg:shadow-akta-rule-x relative mx-auto w-full">
          {/* nav */}
          <header className="flex items-stretch justify-between">
            <div className="lg:shadow-akta-rule-r flex items-center px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
              <span className="font-akta-sans text-akta-heading-20 sm:text-akta-heading-20-sm text-akta-gray-text-high">
                akta<span className="text-akta-brand-text-low">.pro</span>
              </span>
            </div>

            <nav className="hidden items-center gap-9 lg:flex">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="font-akta-mono text-akta-nav sm:text-akta-nav-sm text-akta-gray-text-low hover:text-akta-gray-text-high flex items-center gap-1.5 uppercase transition-colors"
                >
                  {item.label}
                  {item.caret && (
                    <IconChevronDown className="size-3.5" aria-hidden="true" />
                  )}
                  {item.external && (
                    <IconArrowUpRight className="size-3.5" aria-hidden="true" />
                  )}
                </a>
              ))}
            </nav>

            <div className="lg:shadow-akta-rule-l flex items-center p-2 sm:p-3">
              <a
                href="#"
                className="font-akta-mono text-akta-cta sm:text-akta-cta-sm akta-roll-host akta-notch akta-notch-reveal bg-akta-brand-solid text-akta-brand-on-solid hover:bg-akta-brand-solid-hover focus-visible:outline-akta-brand-border-hover flex items-center px-3 py-2.5 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-[10px] sm:px-5 sm:py-3"
              >
                <RollLabel>
                  <IconCornerDownRight className="size-4" aria-hidden="true" />
                  Try for free
                </RollLabel>
              </a>
            </div>
          </header>
        </div>

        {/* announcement — the band itself is full-bleed so its two rules cross
            the whole viewport past the 1440 grid, while the hatch fill and the
            corner notches stay on the grid. The notches land exactly where the
            vertical rails meet the full-bleed rules, marking the junction
            instead of running the rails through the band. */}
        <div className="shadow-akta-rule-y relative">
          <div className="akta-hatch akta-notch max-w-akta mx-auto flex w-full items-center justify-center px-4 py-3 [--akta-hatch-color:var(--akta-gray-ui-hover)] [--akta-notch-arm:0px] [--akta-notch-color:var(--akta-gray-border-subtle)] [--akta-notch-inset:0px] [--akta-notch-weight:1px] sm:px-6 sm:py-5 lg:[--akta-notch-arm:14px]">
            <a
              href="#"
              className="akta-roll-host bg-akta-gray-bg-subtle shadow-akta-border hover:bg-akta-gray-ui focus-visible:outline-akta-brand-border-hover flex items-center gap-2 px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 sm:gap-3 sm:px-4 sm:py-2"
            >
              <span className="font-akta-mono text-akta-nav sm:text-akta-nav-sm text-akta-gray-text-high uppercase">
                We&apos;re live on <strong>Product Hunt</strong>
              </span>
              <span
                className="akta-roll akta-roll-diagonal bg-akta-brand-solid text-akta-brand-on-solid size-7 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <span className="akta-roll-face">
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    strokeWidth={2}
                  />
                </span>
                <span className="akta-roll-face akta-roll-face-next">
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    strokeWidth={2}
                  />
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="max-w-akta lg:shadow-akta-rule-x relative mx-auto w-full">
          {/* hero */}
          <div className="flex flex-col items-center gap-18 px-4 py-12 text-center sm:gap-16 sm:px-6 sm:py-16 md:py-20 lg:gap-20 lg:px-10 lg:py-24 xl:gap-24 xl:py-28">
            <div className="w-full">
              <h1
                data-akta-enter="1"
                className="font-akta-sans text-akta-display sm:text-akta-display-sm md:text-akta-display-md lg:text-akta-display-lg xl:text-akta-display-xl text-akta-gray-text-high mx-auto mt-6 max-w-md text-balance sm:mt-8 sm:max-w-xl md:max-w-2xl xl:max-w-4xl"
              >
                Private company data and signals API
              </h1>

              {/* Phrases are separated by a rule, never by a `|` glyph — a pipe
                  brings its own font metrics and sits on a different baseline
                  from the labels either side, which throws the row's vertical
                  centring. The rule is a hairline the exact height of the cell
                  and costs no layout space. Below sm the phrases cannot share a
                  row, so the column drops the rules with them. */}
              <div
                data-akta-enter="2"
                className="mt-5 flex flex-col items-center justify-center sm:mt-7 sm:flex-row sm:flex-wrap"
              >
                {TAGLINE.map((item, i) => (
                  <span
                    key={item}
                    className={`font-akta-mono text-akta-nav sm:text-akta-nav-sm text-akta-gray-text-low py-1 uppercase sm:px-3 lg:px-4 ${
                      i > 0 ? "sm:shadow-akta-rule-l" : ""
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div
                data-akta-enter="3"
                className="mt-8 flex flex-nowrap justify-center gap-3 sm:mt-12 sm:gap-6"
              >
                <a
                  href="#"
                  className="font-akta-mono text-akta-cta sm:text-akta-cta-sm akta-roll-host akta-notch akta-notch-reveal bg-akta-brand-solid text-akta-brand-on-solid hover:bg-akta-brand-solid-hover focus-visible:outline-akta-brand-border-hover flex items-center px-3 py-2.5 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-[10px] sm:px-6 sm:py-3.5"
                >
                  <RollLabel>
                    <IconCornerDownRight
                      className="size-4"
                      aria-hidden="true"
                    />
                    Try for free
                  </RollLabel>
                </a>
                <a
                  href="#"
                  className="font-akta-mono text-akta-cta sm:text-akta-cta-sm akta-roll-host akta-notch akta-notch-reveal bg-akta-gray-ui text-akta-gray-text-high hover:bg-akta-gray-ui-hover focus-visible:outline-akta-gray-border-hover active:bg-akta-gray-ui-active flex items-center px-3 py-2.5 uppercase transition-colors [--akta-notch-color:var(--akta-gray-border-subtle)] focus-visible:outline-2 focus-visible:outline-offset-[10px] sm:px-6 sm:py-3.5"
                >
                  <RollLabel>Talk to an engineer</RollLabel>
                </a>
              </div>
            </div>

            {/* panels — the code window sits in flow and sets the stage height; the
                two cards flank it, overlapping its edges */}
            <div className="relative isolate flex w-full max-w-2xl flex-col gap-4 text-left sm:gap-6 md:max-w-4xl lg:block lg:max-w-5xl">
              {/* Background plate — a mat the panel sits on, bled past the
                  stage top and bottom so it frames the cluster rather than
                  hiding behind it. No scrim: the panel and both cards are
                  opaque, so the texture only ever shows in the margin.

                  It bleeds out of the 980 stage to the full width of the 1440
                  grid: the stage, the grid and the viewport all share a centre
                  line, so `left-1/2 -translate-x-1/2` plus `w-screen` capped at
                  1440 lands the plate exactly on the rails at every width.

                  It clips inside its own wrapper rather than on the stage,
                  because the cards and the panel's notch brackets all sit
                  outside the stage box — overflow-hidden on the stage itself
                  would cut them off. */}
              <div
                className="akta-plate absolute -top-10 -bottom-10 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden sm:-top-16 sm:-bottom-16"
                aria-hidden="true"
              >
                <Image
                  src="/AIHero01.png"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1440px) 1440px, 100vw"
                  className="object-cover"
                />
              </div>

              <div
                data-akta-enter="5"
                className="bg-akta-gray-ui shadow-akta-panel z-20 order-2 w-full p-4 lg:absolute lg:-top-6 lg:left-0 lg:order-none lg:w-56"
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-akta-brand-ui shadow-akta-ring-brand flex size-7 items-center justify-center">
                    <IconChartBar
                      className="text-akta-brand-text-low size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-high uppercase">
                    Sentiment
                    <br />
                    analysis
                  </span>
                </div>
                <div
                  className="mt-4 flex h-10 items-end gap-2"
                  aria-hidden="true"
                >
                  {[40, 65, 100, 55, 30, 70].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className={
                        h === 100
                          ? "bg-akta-brand-solid-hover w-1.5"
                          : "bg-akta-gray-ui-active w-1.5"
                      }
                    />
                  ))}
                </div>
                <p className="font-akta-mono text-akta-label-12-mono text-akta-brand-text-low mt-3 uppercase">
                  Positive trend detected
                </p>
              </div>

              <div
                data-akta-enter="4"
                className="akta-notch akta-notch-diagonal bg-akta-gray-bg-subtle shadow-akta-panel relative z-10 order-1 mx-auto w-full [--akta-notch-arm:22px] [--akta-notch-inset:10px] lg:order-none lg:max-w-2xl"
              >
                <div className="bg-akta-gray-ui shadow-akta-rule-b flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5">
                  <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-high flex items-center gap-2 uppercase">
                    <IconFilter
                      className="text-akta-brand-solid size-4"
                      aria-hidden="true"
                    />
                    Signal extraction
                  </span>
                  <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
                    Last 24h
                  </span>
                </div>

                <SignalField />

                <p className="sr-only">
                  Of 1,000 articles ingested in the last 24 hours, 197 were
                  retained as signals — 80 percent were filtered out as noise.
                </p>

                <div className="shadow-akta-rule-t grid grid-cols-2">
                  <div className="shadow-akta-rule-r px-4 py-3 sm:px-5 sm:py-4">
                    <p className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
                      Articles ingested
                    </p>
                    <p className="font-akta-sans text-akta-heading-24 sm:text-akta-heading-24-sm text-akta-gray-text-high mt-1 tabular-nums">
                      1,000
                    </p>
                  </div>
                  <div className="px-4 py-3 sm:px-5 sm:py-4">
                    <p className="font-akta-mono text-akta-label-12-mono text-akta-brand-text-low uppercase">
                      Signals retained
                    </p>
                    <p className="font-akta-sans text-akta-heading-24 sm:text-akta-heading-24-sm text-akta-brand-solid mt-1 tabular-nums">
                      197
                    </p>
                  </div>
                </div>
              </div>

              <div
                data-akta-enter="6"
                className="bg-akta-gray-ui shadow-akta-panel z-20 order-3 w-full p-4 lg:absolute lg:right-0 lg:-bottom-6 lg:order-none lg:w-64"
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-akta-brand-ui shadow-akta-ring-brand flex size-7 items-center justify-center">
                    <IconFileDescription
                      className="text-akta-brand-text-low size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-high uppercase">
                    Canonical record
                  </span>
                </div>
                <dl className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low mt-4 space-y-1.5">
                  {RECORD.map(([field, value]) => (
                    <div key={field} className="flex justify-between gap-4">
                      <dt>{field}</dt>
                      <dd className="text-akta-gray-text-high tabular-nums">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="font-akta-mono text-akta-label-12-mono text-akta-brand-text-low shadow-akta-rule-t mt-3 pt-3 uppercase">
                  + 65 more data points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* logo wall — the row is full-bleed so its rules cross the viewport,
            while the cells sit on the 1440 grid. Every cell carries a flush
            notch, so each divider is bracketed top and bottom where it meets
            the row's rules. */}
        <div className="bg-akta-gray-bg-subtle shadow-akta-rule-t relative z-10 px-2">
          <div
            data-akta-reveal
            className="max-w-akta mx-auto grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          >
            <div className="akta-notch shadow-akta-rule-cell flex flex-col justify-center gap-1 px-4 py-6 text-left [--akta-notch-arm:8px] [--akta-notch-color:var(--akta-gray-border-subtle)] [--akta-notch-inset:0px] [--akta-notch-weight:1px] sm:px-6 sm:py-8 lg:[--akta-notch-arm:10px]">
              <span className="font-akta-mono text-akta-label-12-mono text-akta-gray-text-low uppercase">
                Trusted by{" "}
                <span className="text-akta-brand-solid tabular-nums">
                  5,000+
                </span>{" "}
                top companies
              </span>
            </div>

            {LOGOS.map((mark, i) => (
              <div
                key={mark.label}
                className="akta-notch text-akta-gray-text-high shadow-akta-rule-cell flex items-center justify-center gap-2 px-3 py-6 [--akta-notch-arm:8px] [--akta-notch-color:var(--akta-gray-border-subtle)] [--akta-notch-inset:0px] [--akta-notch-weight:1px] sm:px-4 sm:py-8 lg:[--akta-notch-arm:10px]"
              >
                <LogoFlip marks={LOGOS} offset={i} />
              </div>
            ))}
          </div>
        </div>

        {/* hatch seam closing the wall */}
        <div className="bg-akta-gray-bg-subtle shadow-akta-rule-y relative z-10">
          <div className="akta-hatch max-w-akta mx-auto h-6 w-full [--akta-hatch-color:var(--akta-gray-ui-hover)] sm:h-9" />
        </div>
      </section>
    </div>
  );
}

export default LandingHero;
