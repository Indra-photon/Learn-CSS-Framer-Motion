import React from "react";
import {
  IconArrowUpRight,
  IconChartBar,
  IconChevronDown,
  IconCornerDownRight,
  IconShieldHalfFilled,
} from "@tabler/icons-react";

import "./landing-hero.css";
import "./landing-hero-type.css";

const NAV = [
  { label: "Data", caret: true },
  { label: "Benchmarks" },
  { label: "Pricing" },
  { label: "Resources", caret: true },
  { label: "API Docs", external: true },
];

const TAGLINE = [
  "Pay-as-you-go",
  "Built for AI agents",
  "Universal entity resolution",
];

const CODE = `from akta_core import client

# Initialize agentic endpoint
client = akta_core.Agent(api_key="ak_live_acme8407")

# Query with semantic context resolution
response = client.signals.stream(
    entity="ACME_CORP",
    intent="risk_and_liquidity_signals",
    sources=["wsj", "ft", "reuters", "layoffs_fyi"],
    filters={
        "event_types": ["equity_fundraising", "workforce"],
        "sentiment": ["positive", "negative"],
        "impact": "high",
        "geo": ["USA", "GBR", "SGP", "ARE"]
    },
)`;

/* Four tones, all palette roles — no syntax colors invented outside the scale. */
const TONE = {
  plain: "var(--gray-text-high)",
  comment: "var(--gray-border-hover)",
  keyword: "var(--brand-text-low)",
  string: "var(--brand-text-high)",
} as const;

function highlight(line: string) {
  if (line.trimStart().startsWith("#"))
    return [{ text: line, tone: "comment" as const }];

  const parts: { text: string; tone: keyof typeof TONE }[] = [];
  const pattern = /("[^"]*")|\b(from|import)\b/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > cursor) {
      parts.push({ text: line.slice(cursor, match.index), tone: "plain" });
    }
    parts.push({ text: match[0], tone: match[1] ? "string" : "keyword" });
    cursor = match.index + match[0].length;
  }
  if (cursor < line.length)
    parts.push({ text: line.slice(cursor), tone: "plain" });
  return parts;
}

function LandingHero() {
  return (
    <div className="dark">
      <section className="landing-hero relative isolate min-h-screen overflow-hidden bg-[var(--gray-bg-subtle)]">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-[1440px] border-[var(--gray-ui-hover)] lg:border-x">
          {/* nav */}
          <header className="flex items-stretch justify-between border-b border-[var(--gray-ui-hover)]">
            <div className="flex items-center border-[var(--gray-ui-hover)] px-6 py-5 lg:border-r lg:px-10">
              <span className="type-heading-20 text-[var(--gray-text-high)]">
                akta<span className="text-[var(--brand-text-low)]">.pro</span>
              </span>
            </div>

            <nav className="hidden items-center gap-9 lg:flex">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="type-nav flex items-center gap-1.5 text-[var(--gray-text-low)] transition-colors hover:text-[var(--gray-text-high)]"
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

            <div className="flex items-center border-[var(--gray-ui-hover)] p-3 lg:border-l">
              <a
                href="#"
                className="type-cta flex items-center gap-2.5 bg-[var(--brand-solid)] px-5 py-3 text-[var(--brand-on-solid)] transition-colors hover:bg-[var(--brand-solid-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-border-hover)]"
              >
                <IconCornerDownRight className="size-4" aria-hidden="true" />
                Try for free
              </a>
            </div>
          </header>

          {/* announcement */}
          <div className="flex items-center justify-center gap-3 border-b border-[var(--gray-ui-hover)] bg-[var(--gray-ui)] px-6 py-3.5">
            <span className="type-copy-14 text-[var(--gray-text-high)]">
              We&apos;re live on <strong>Product Hunt</strong>
            </span>
            <span className="type-label-12-mono flex items-center gap-2 border border-[var(--brand-border)] bg-[var(--brand-ui)] px-2.5 py-1 text-[var(--brand-text-high)]">
              #1 Developer Tools
              <span className="text-[var(--brand-text-low)]">277</span>
            </span>
          </div>

          {/* hero */}
          <div className="grid gap-16 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:px-10 lg:py-28">
            <div>
              <span
                data-enter="1"
                className="type-label-12-mono inline-flex items-center gap-2 border border-[var(--brand-border)] px-3 py-1.5 text-[var(--brand-text-low)] uppercase"
              >
                <span
                  className="size-1.5 bg-[var(--brand-solid-hover)]"
                  aria-hidden="true"
                />
                By Akta Labs
              </span>

              <h1
                data-enter="2"
                className="type-display mt-8 max-w-[15ch] text-balance text-[var(--gray-text-high)]"
              >
                Private company data and signals API
              </h1>

              <div
                data-enter="3"
                className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2"
              >
                {TAGLINE.map((item, i) => (
                  <React.Fragment key={item}>
                    {i > 0 && (
                      <span
                        className="text-[var(--gray-border)]"
                        aria-hidden="true"
                      >
                        |
                      </span>
                    )}
                    <span className="type-copy-18 text-[var(--gray-text-low)]">
                      {item}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              <div
                data-enter="4"
                className="mt-12 inline-flex flex-wrap gap-3 border border-[var(--gray-ui-hover)] p-3"
              >
                <a
                  href="#"
                  className="type-cta flex items-center gap-2.5 bg-[var(--brand-solid)] px-6 py-3.5 text-[var(--brand-on-solid)] transition-colors hover:bg-[var(--brand-solid-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-border-hover)]"
                >
                  <IconCornerDownRight className="size-4" aria-hidden="true" />
                  Try for free
                </a>
                <a
                  href="#"
                  className="type-cta flex items-center bg-[var(--gray-ui)] px-6 py-3.5 text-[var(--gray-text-high)] transition-colors hover:bg-[var(--gray-ui-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gray-border-hover)] active:bg-[var(--gray-ui-active)]"
                >
                  Talk to an engineer
                </a>
              </div>
            </div>

            {/* panels */}
            <div className="relative min-h-[380px] lg:min-h-[560px]">
              <div
                data-enter="3"
                className="absolute -top-4 left-0 z-20 hidden w-[220px] border border-[var(--gray-ui-hover)] bg-[var(--gray-ui)] p-4 shadow-2xl shadow-black/40 lg:block"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center border border-[var(--brand-border)] bg-[var(--brand-ui)]">
                    <IconChartBar
                      className="size-4 text-[var(--brand-text-low)]"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="type-label-12-mono text-[var(--gray-text-high)] uppercase">
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
                          ? "w-1.5 bg-[var(--brand-solid-hover)]"
                          : "w-1.5 bg-[var(--gray-ui-active)]"
                      }
                    />
                  ))}
                </div>
                <p className="type-label-12-mono mt-3 text-[var(--brand-text-low)] uppercase">
                  Positive trend detected
                </p>
              </div>

              <div
                data-enter="4"
                className="relative z-10 border border-[var(--gray-ui-hover)] bg-[var(--gray-bg-subtle)] shadow-2xl shadow-black/50 lg:absolute lg:top-8 lg:-right-6 lg:w-[620px]"
              >
                <div className="flex items-center justify-between border-b border-[var(--gray-ui-hover)] bg-[var(--gray-ui)] px-4 py-2.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 rounded-full bg-[var(--gray-border)]" />
                    <span className="size-2.5 rounded-full bg-[var(--gray-border)]" />
                    <span className="size-2.5 rounded-full bg-[var(--brand-solid)]" />
                  </span>
                  <span className="type-label-12-mono text-[var(--gray-text-low)]">
                    agent_query.py
                  </span>
                </div>
                <pre className="type-copy-13-mono overflow-x-auto p-5">
                  <code>
                    {CODE.split("\n").map((line, i) => (
                      <span key={i} className="block whitespace-pre">
                        {highlight(line).map((part, j) => (
                          <span key={j} style={{ color: TONE[part.tone] }}>
                            {part.text}
                          </span>
                        ))}
                        {line === "" ? " " : null}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>

              <div
                data-enter="5"
                className="absolute -bottom-6 left-0 z-20 hidden w-[240px] border border-[var(--gray-ui-hover)] bg-[var(--gray-ui)] p-4 shadow-2xl shadow-black/40 lg:block"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center border border-[var(--brand-border)] bg-[var(--brand-ui)]">
                    <IconShieldHalfFilled
                      className="size-4 text-[var(--brand-text-low)]"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="type-label-12-mono text-[var(--gray-text-high)] uppercase">
                    Global blacklist
                  </span>
                </div>
                <dl className="type-label-12-mono mt-4 space-y-1.5 text-[var(--gray-text-low)]">
                  <div className="flex justify-between gap-4">
                    <dt>IP_RESOLVE</dt>
                    <dd className="text-[var(--gray-text-high)]">
                      192.168.1.1
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>AS_ORIGIN</dt>
                    <dd className="text-[var(--gray-text-high)]">42091</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingHero;
