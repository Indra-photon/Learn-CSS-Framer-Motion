/* Command Center mock for the Harvey hero. Pure markup + inline SVG — no chart
 * library, no client state. Every number is deterministic so the render is
 * stable across server and client. Consumes only harvey-* tokens; the sidebar
 * gets its dark palette by flipping the `.dark` class locally. */

import type { ReactNode } from "react";

/* ─── icons ─────────────────────────────────────────────────────────────── */

type IconProps = { className?: string };
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const Icon = {
  Plus: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  ),
  Bot: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <rect x="2.5" y="4.5" width="11" height="8" rx="2.5" />
      <path d="M8 2v2.5M6 8.5h.01M10 8.5h.01" />
    </svg>
  ),
  Vault: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M2.5 5.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
    </svg>
  ),
  Chart: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M3 3v10h10M5.5 10l2.5-3 2 2 3-4" />
    </svg>
  ),
  Dots: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <circle cx="3.5" cy="8" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="12.5" cy="8" r="1" />
    </svg>
  ),
  Contract: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <circle cx="6" cy="6.5" r="3.5" />
      <circle cx="10" cy="9.5" r="3.5" />
    </svg>
  ),
  Clock: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  ),
  Stack: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M3 5.5h10M3 8h10M3 10.5h10" />
    </svg>
  ),
  Bell: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M4 11V7.5a4 4 0 0 1 8 0V11l1 1.5H3zM6.5 13.5a1.5 1.5 0 0 0 3 0" />
    </svg>
  ),
  Search: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l3 3" />
    </svg>
  ),
  Chevron: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M5 6.5l3 3 3-3" />
    </svg>
  ),
  Filter: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M3 5h10M5 8h6M7 11h2" />
    </svg>
  ),
  Download: ({ className }: IconProps) => (
    <svg viewBox="0 0 16 16" className={className} {...stroke}>
      <path d="M8 3v7M5 7.5l3 3 3-3M3.5 12.5h9" />
    </svg>
  ),
};

/* ─── data ──────────────────────────────────────────────────────────────── */

/* Slow start, hockey-stick finish. 110 bars across six months. */
const DAU_BARS = Array.from({ length: 110 }, (_, i) => {
  const t = i / 109;
  const curve = 0.04 + 0.18 * t + 0.62 * Math.pow(t, 3.2);
  const wobble = 0.03 * Math.sin(i * 1.7) + 0.02 * Math.sin(i * 0.37);
  return Math.min(1, Math.max(0.02, curve + wobble));
});

/* Peer benchmark — a smooth s-curve that the org overtakes at the end. */
const PEER_LINE = [0.18, 0.36, 0.47, 0.52, 0.5, 0.49, 0.53, 0.6, 0.72, 0.88];

/* Three plateaus, then a climb. */
const ACTIVE_BARS = Array.from({ length: 110 }, (_, i) => {
  const t = i / 109;
  let v: number;
  if (t < 0.28) v = 0.08 + t * 0.15;
  else if (t < 0.36) v = 0.12 + (t - 0.28) * 5.5;
  else if (t < 0.6) v = 0.56 + (t - 0.36) * 0.1;
  else if (t < 0.72) v = 0.58 + (t - 0.6) * 3.2;
  else v = 0.96 + (t - 0.72) * 0.12;
  return Math.min(1, v + 0.015 * Math.sin(i * 2.1));
});

const USAGE = [
  { label: "Assistant", org: 0.7, peers: 0.88 },
  { label: "Workflow agents", org: 0.6, peers: 0.4 },
  { label: "Playbooks", org: 0.49, peers: 0.4 },
  { label: "Word", org: 0.48, peers: 0.52 },
  { label: "Shared Spaces", org: 0.32, peers: 0.27 },
  { label: "Review tables", org: 0.25, peers: 0.46, attention: true },
  { label: "Outlook", org: 0.15, peers: 0.27, attention: true },
];

const POWER_USERS = [
  ["Ben Morrison", 31],
  ["Keith Whittaker", 27],
  ["Amy Applegate", 20],
  ["Jackson Gates", 19],
  ["Badrul Rupak", 16],
  ["Jackie Whitehall", 14],
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

/* ─── charts ────────────────────────────────────────────────────────────── */

const W = 520;
const H = 180;

function smoothPath(points: number[], w: number, h: number) {
  const step = w / (points.length - 1);
  const pts = points.map((v, i) => [i * step, h - v * h] as const);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

function BarLineChart({
  bars,
  line,
  id,
}: {
  bars: number[];
  line?: number[];
  id: string;
}) {
  const gap = W / bars.length;
  return (
    <svg
      viewBox={`0 0 ${W} ${H + 24}`}
      className="h-auto w-full text-harvey-gray-text-low"
      aria-hidden
    >
      <defs>
        <pattern
          id={`${id}-dots`}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="0.7" fill="currentColor" />
        </pattern>
      </defs>
      {/* baseline */}
      <rect
        x="0"
        y={H}
        width={W}
        height="1"
        fill={`url(#${id}-dots)`}
        opacity="0.6"
      />
      {bars.map((v, i) => (
        <rect
          key={i}
          x={i * gap + gap * 0.3}
          y={H - v * H}
          width={gap * 0.4}
          height={v * H}
          fill="currentColor"
          opacity="0.85"
        />
      ))}
      {line && (
        <path
          d={smoothPath(line, W, H)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-harvey-gray-ui-active"
        />
      )}
      {MONTHS.map((m, i) => (
        <text
          key={m}
          x={i * (W / (MONTHS.length - 1))}
          y={H + 18}
          fontSize="11"
          textAnchor={i === 0 ? "start" : i === MONTHS.length - 1 ? "end" : "middle"}
          fill="currentColor"
          opacity="0.7"
          fontFamily="var(--harvey-font-sans)"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

function GroupedBarChart() {
  const cw = 660;
  const ch = 190;
  const padL = 40;
  const padB = 24;
  const plotW = cw - padL;
  const plotH = ch - padB;
  const groupW = plotW / USAGE.length;
  const barW = 14;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <svg
      viewBox={`0 0 ${cw} ${ch}`}
      className="h-auto w-full text-harvey-gray-text-low"
      aria-hidden
    >
      <defs>
        <pattern
          id="usage-dots"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="0.8" fill="currentColor" opacity="0.55" />
        </pattern>
      </defs>
      {ticks.map((t) => {
        const y = plotH - (t / 100) * plotH;
        return (
          <g key={t}>
            <line
              x1={padL}
              x2={cw}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeDasharray={t === 0 ? undefined : "1 3"}
            />
            <text
              x={padL - 8}
              y={y + 3.5}
              fontSize="10"
              textAnchor="end"
              fill="currentColor"
              opacity="0.6"
              fontFamily="var(--harvey-font-sans)"
            >
              {t}%
            </text>
          </g>
        );
      })}
      {USAGE.map((u, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const orgH = u.org * plotH;
        const peerH = u.peers * plotH;
        return (
          <g key={u.label}>
            <rect
              x={cx - barW - 2}
              y={plotH - orgH}
              width={barW}
              height={orgH}
              rx="1.5"
              fill="currentColor"
              className={u.attention ? "text-harvey-attention" : undefined}
              opacity={u.attention ? 0.85 : 1}
            />
            <rect
              x={cx + 2}
              y={plotH - peerH}
              width={barW}
              height={peerH}
              rx="1.5"
              fill="url(#usage-dots)"
            />
            <text
              x={cx}
              y={ch - 6}
              fontSize="10"
              textAnchor="middle"
              fill="currentColor"
              opacity="0.7"
              fontFamily="var(--harvey-font-sans)"
            >
              {u.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── pieces ────────────────────────────────────────────────────────────── */

function Select({ children }: { children: ReactNode }) {
  return (
    <span className="type-label-13 inline-flex h-8 items-center gap-1.5 rounded-md bg-harvey-canvas px-3 text-harvey-gray-text-high shadow-harvey-border">
      {children}
      <Icon.Chevron className="size-3.5 text-harvey-gray-text-low" />
    </span>
  );
}

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg bg-harvey-canvas shadow-harvey-border ${className}`}
    >
      {children}
    </div>
  );
}

function Legend({
  items,
}: {
  items: { label: string; swatch: "solid" | "dots" | "attention"; underline?: boolean }[];
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 shadow-harvey-rule-t">
      <ul className="flex items-center gap-4">
        {items.map((it) => (
          <li
            key={it.label}
            className="type-label-12 flex items-center gap-1.5 text-harvey-gray-text-low"
          >
            <span
              className={`size-2 rounded-full ${
                it.swatch === "solid"
                  ? "bg-harvey-gray-text-low"
                  : it.swatch === "attention"
                    ? "bg-harvey-attention"
                    : "bg-harvey-gray-ui-active"
              }`}
            />
            <span className={it.underline ? "underline decoration-dotted underline-offset-2" : ""}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 text-harvey-gray-text-low">
        <Icon.Filter className="size-4" />
        <Icon.Download className="size-4" />
      </div>
    </div>
  );
}

function Stat({
  value,
  delta,
  label,
}: {
  value: string;
  delta: string;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="type-heading-48 type-serif text-harvey-gray-text-high">
          {value}
        </span>
        <span className="type-label-13 text-harvey-positive">↑ {delta}</span>
      </div>
      <p className="type-label-14 mt-0.5 text-harvey-gray-text-low">{label}</p>
    </div>
  );
}

const NAV = [
  { icon: Icon.Plus, label: "New Thread" },
  { icon: Icon.Bot, label: "Agents" },
  { icon: Icon.Vault, label: "Vaults" },
  { icon: Icon.Chart, label: "Command Center", active: true },
  { icon: Icon.Dots, label: "More" },
];

const SPACES = [
  ["A", "Acme Acquisition"],
  ["P", "Project Compass"],
  ["D", "Delphi Litigation"],
] as const;

function Sidebar() {
  return (
    <aside className="dark flex w-[280px] shrink-0 flex-col bg-harvey-gray-bg-subtle px-6 pt-8 pb-6 text-harvey-gray-text-high max-lg:hidden">
      <div className="flex items-center justify-between">
        <span className="type-heading-24 type-serif">Harvey</span>
        <div className="flex items-center gap-3 text-harvey-gray-text-low">
          <Icon.Bell className="size-4" />
          <Icon.Search className="size-4" />
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-0.5">
        {NAV.map(({ icon: I, label, active }) => (
          <a
            key={label}
            href="#"
            className={`type-label-14 flex h-9 items-center gap-3 rounded-md px-2.5 ${
              active
                ? "bg-harvey-gray-ui text-harvey-gray-text-high"
                : "text-harvey-gray-text-low hover:text-harvey-gray-text-high"
            }`}
          >
            <I className="size-4" />
            {label}
          </a>
        ))}
      </nav>

      <SidebarGroup title="Apps">
        <SidebarLink icon={<Icon.Contract className="size-4" />}>
          Contract Intelligence
        </SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Recents">
        {["Overview of Transaction", "Key Issues in Transaction", "Essential Points in"].map(
          (t) => (
            <SidebarLink
              key={t}
              icon={<span className="mx-auto block size-1 bg-harvey-gray-text-low" />}
            >
              <span className="truncate">{t}</span>
            </SidebarLink>
          ),
        )}
        <SidebarLink icon={<Icon.Clock className="size-4" />}>View History</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Spaces">
        {SPACES.map(([k, name]) => (
          <SidebarLink
            key={name}
            icon={
              <span className="type-label-12 type-serif flex size-4 items-center justify-center rounded-[3px] bg-harvey-gray-ui-hover text-harvey-gray-text-low">
                {k}
              </span>
            }
          >
            {name}
          </SidebarLink>
        ))}
        <SidebarLink icon={<Icon.Stack className="size-4" />}>View Spaces</SidebarLink>
      </SidebarGroup>

      <div className="mt-auto pt-8">
        <SidebarLink
          icon={
            <span className="type-label-12 type-serif flex size-4 items-center justify-center rounded-[3px] bg-harvey-gray-ui-hover text-harvey-gray-text-high">
              M
            </span>
          }
        >
          Maya Sterling
        </SidebarLink>
      </div>
    </aside>
  );
}

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <p className="type-label-12 px-2.5 text-harvey-gray-text-low">{title}</p>
      <div className="mt-2 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <a
      href="#"
      className="type-label-14 flex h-9 items-center gap-3 rounded-md px-2.5 text-harvey-gray-text-low hover:text-harvey-gray-text-high"
    >
      <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
      {children}
    </a>
  );
}

function HMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`type-label-12 type-serif flex size-5 items-center justify-center rounded-[4px] bg-harvey-gray-text-high font-medium text-harvey-canvas ${className}`}
    >
      H
    </span>
  );
}

/* ─── dashboard ─────────────────────────────────────────────────────────── */

export default function HarveyDashboard() {
  return (
    <div className="flex overflow-hidden rounded-xl bg-harvey-gray-bg-subtle shadow-harvey-panel">
      <Sidebar />

      <div className="min-w-0 flex-1 px-6 pt-7 pb-8 lg:px-12 lg:pt-8">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="type-heading-40 type-serif text-harvey-gray-text-high">
            Whitford Lane&rsquo;s Command Center
          </h2>
          <div className="flex items-center gap-2.5">
            <label className="type-label-13 flex items-center gap-2 text-harvey-gray-text-high">
              <span className="relative inline-block h-4 w-7 rounded-full bg-harvey-gray-text-high">
                <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-harvey-canvas" />
              </span>
              Peers
            </label>
            <span className="type-button-14 inline-flex h-9 items-center rounded-md bg-harvey-canvas px-3.5 text-harvey-gray-text-high shadow-harvey-border">
              View all analytics
            </span>
            <span className="type-button-14 inline-flex h-9 items-center gap-2 rounded-md bg-harvey-gray-text-high px-3.5 text-harvey-canvas">
              <span className="type-serif">H</span>
              Ask Harvey
            </span>
          </div>
        </div>

        {/* banner */}
        <div className="type-label-14 mt-6 flex items-center gap-3 rounded-lg bg-harvey-canvas px-4 py-3.5 text-harvey-gray-text-high shadow-harvey-border">
          <HMark />
          There are 15 recommended actions to increase your Harvey usage
        </div>

        {/* grid */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Card>
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between gap-4">
                <Stat value="49.5%" delta="5%" label="DAU/MAU" />
                <div className="flex gap-1.5">
                  <Select>6 months</Select>
                  <Select>2026</Select>
                </div>
              </div>
              <div className="mt-8">
                <BarLineChart bars={DAU_BARS} line={PEER_LINE} id="dau" />
              </div>
            </div>
            <div className="mt-auto">
              <Legend
                items={[
                  { label: "Your organization", swatch: "solid" },
                  { label: "Peers", swatch: "dots", underline: true },
                ]}
              />
            </div>
          </Card>

          <Card>
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="type-heading-20 text-harvey-gray-text-high">
                    Product usage
                  </h3>
                  <p className="type-label-13 mt-1 text-harvey-gray-text-low">
                    Based on percentage of users using each product
                  </p>
                </div>
                <Select>This week</Select>
              </div>
              <div className="mt-8">
                <GroupedBarChart />
              </div>
            </div>
            <div className="mt-auto">
              <Legend
                items={[
                  { label: "Your organization", swatch: "solid" },
                  { label: "Peers", swatch: "dots", underline: true },
                  { label: "Needs attention", swatch: "attention" },
                ]}
              />
            </div>
          </Card>

          <Card>
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between gap-4">
                <Stat value="305" delta="10%" label="Active users" />
                <div className="flex gap-1.5">
                  <Select>Weekly</Select>
                  <Select>This week</Select>
                </div>
              </div>
              <div className="mt-8">
                <BarLineChart bars={ACTIVE_BARS} id="active" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="type-heading-20 text-harvey-gray-text-high">
                    Top power users
                  </h3>
                  <p className="type-label-13 mt-1 text-harvey-gray-text-low">
                    Based on number of active days
                  </p>
                </div>
                <Select>Past month</Select>
              </div>
              <ul className="mt-7 flex flex-col gap-4">
                {POWER_USERS.map(([name, days]) => (
                  <li
                    key={name}
                    className="type-label-12 grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 text-harvey-gray-text-low"
                  >
                    <span className="truncate">{name}</span>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-3 rounded-[2px] bg-harvey-gray-text-low"
                        style={{ width: `${(days / 31) * 88}%` }}
                      />
                      <span className="whitespace-nowrap">{days} days</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
