/* Harvey hero — variant A "Single Lane". Mirrors Figma → Design-System-01 →
 * HarveyAI → "Hero A — Single Lane" node for node.
 *
 * Structure: nav → eyebrow / headline / lede / CTAs / risk reducers → a
 * gradient + grain wrap holding a 4px bezel holding the full Vault dashboard.
 * The ribbon behind the copy is the "Harvey Ribbon Wash" Figma shader
 * re-created as SVG (gradient band + turbulence folds + blur + bottom fade);
 * the shader is the design reference, this SVG is the source of truth in code.
 *
 * Dashboard rules (from the Figma build): one family (Inter), two sizes
 * (14 / 24), two weights (400 / 500), Hugeicons at 14px / 1.5 stroke on 24px muted tiles, no borders —
 * every edge is a shadow. Tokens only, via harvey.css utilities. */

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import HarveyRibbon from "./HarveyRibbon";
import {
  Add01Icon,
  Agreement01Icon,
  Archive01Icon,
  Clock01Icon,
  AiMagicIcon,
  Analytics01Icon,
  ArrowUp02Icon,
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  File01Icon,
  FilterHorizontalIcon,
  Flag02Icon,
  MoreHorizontalIcon,
  Folder01Icon,
  Notification03Icon,
  PlayCircleIcon,
  Search01Icon,
  SecurityCheckIcon,
  Settings02Icon,
  SquareLock01Icon,
  Upload03Icon,
  UserMultipleIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

/* ─── icons ─────────────────────────────────────────────────────────────── */

/* Hugeicons (stroke set), one weight everywhere. `Glyph` is the only way an
 * icon appears: a 14px icon on a 24px muted tile. Inside filled buttons the
 * tile is dropped (`bare`) so a button doesn't carry a second box. */

type IconDef = typeof Add01Icon;

export const I = {
  Arrow: ArrowUpRight01Icon,
  Play: PlayCircleIcon,
  Shield: SecurityCheckIcon,
  Lock: SquareLock01Icon,
  Check: CheckmarkCircle02Icon,
  Plus: Add01Icon,
  Spark: AiMagicIcon,
  Folder: Folder01Icon,
  Users: UserMultipleIcon,
  Chart: Analytics01Icon,
  Bell: Notification03Icon,
  Search: Search01Icon,
  Gear: Settings02Icon,
  File: File01Icon,
  Filter: FilterHorizontalIcon,
  Up: ArrowUp02Icon,
  Flag: Flag02Icon,
  Upload: Upload03Icon,
  More: MoreHorizontalIcon,
  Contract: Agreement01Icon,
  Clock: Clock01Icon,
  Archive: Archive01Icon,
  Tick: Tick01Icon,
};

type GlyphTone =
  | "default"
  | "muted"
  | "ground"
  | "brand"
  | "positive"
  | "attention"
  | "dark";

/* tile background + icon colour per tone; dark = on the sidebar. The tile's
 * edge is `shadow-harvey-glyph` — a neutral inset ring in canvas / ground plus a
 * hairline outside — never a border (see make-interfaces-feel-better/surfaces). */
const GLYPH: Record<GlyphTone, string> = {
  default: "bg-harvey-gray-ui text-harvey-gray-text-high shadow-harvey-glyph",
  muted: "bg-harvey-gray-ui text-harvey-gray-text-low shadow-harvey-glyph",
  /* on the ivory ground (outside cards) gray/ui vanishes; use canvas */
  ground: "bg-harvey-canvas text-harvey-gray-text-low shadow-harvey-glyph",
  brand: "bg-harvey-brand-ui text-harvey-brand-text-high shadow-harvey-glyph",
  positive: "bg-harvey-brand-ui text-harvey-positive shadow-harvey-glyph",
  attention: "bg-harvey-gray-ui text-harvey-attention shadow-harvey-glyph",
  dark: "bg-harvey-gray-solid text-harvey-gray-ui-active shadow-harvey-glyph-dark",
};

/* Kind tiles (main area only, never the sidebar): the tile takes the kind's
 * colour, the icon goes white, and a soft 4px halo of the same colour sits
 * outside — the Draft-step style. file green · folder yellow · AI blue ·
 * lock ink · search violet · check green · flag red. State tones (positive, negative, brand…) are
 * untouched. */
const KIND: Map<IconDef, string> = new Map([
  [File01Icon, "var(--harvey-positive)"],
  [Folder01Icon, "var(--harvey-warning)"],
  [AiMagicIcon, "var(--harvey-info)"],
  [SquareLock01Icon, "var(--harvey-gray-text-high)"],
  [Search01Icon, "var(--harvey-insight)"],
  [CheckmarkCircle02Icon, "var(--harvey-positive)"],
  [Flag02Icon, "var(--harvey-negative)"],
]);

export function Glyph({
  icon,
  tone = "default",
  bare = false,
  size = 14,
  className = "",
  kinded = true,
  fill,
}: {
  icon: IconDef;
  tone?: GlyphTone;
  bare?: boolean;
  size?: number;
  className?: string;
  /** false = never use the kind colour tile (outside the dashboard) */
  kinded?: boolean;
  /** explicit solid tile colour (CSS value); forces the kind-style tile */
  fill?: string;
}) {
  if (bare) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={size}
        strokeWidth={1.5}
        className={`shrink-0 ${className}`}
        aria-hidden
      />
    );
  }
  const kind =
    fill ??
    (kinded && (tone === "default" || tone === "muted")
      ? KIND.get(icon)
      : undefined);
  if (kind) {
    return (
      <span
        className={`rounded-harvey-control text-harvey-canvas flex size-6 shrink-0 items-center justify-center ${className}`}
        style={{
          background: kind,
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${kind} 10%, transparent)`,
        }}
      >
        <HugeiconsIcon icon={icon} size={size} strokeWidth={1.5} aria-hidden />
      </span>
    );
  }
  return (
    <span
      className={`rounded-harvey-control flex size-6 shrink-0 items-center justify-center ${GLYPH[tone]} ${className}`}
    >
      <HugeiconsIcon icon={icon} size={size} strokeWidth={1.5} aria-hidden />
    </span>
  );
}

/* ─── data ──────────────────────────────────────────────────────────────── */

export const NAV = [
  "Platform",
  "Solutions",
  "Customers",
  "Security",
  "Resources",
  "Company",
];

/* risk reducers: all ink — one green on the hero row (the CTA) */
export const RISK = [
  {
    icon: I.Shield,
    label: "SOC 2 Type II ISO 27001 ISO 42001",
    fill: "var(--harvey-gray-text-high)",
  },
  {
    icon: I.Lock,
    label: "Your data is never used for training",
    fill: "var(--harvey-gray-text-high)",
  },
];

/* Sidebar groups mirror the live Harvey app: primary nav, Apps, Recents
 * (threads), Spaces (matters with a monogram tile), then the user. */
const SIDEBAR = [
  { icon: I.Plus, label: "New thread" },
  { icon: I.Spark, label: "Agents" },
  { icon: I.Folder, label: "Vault", active: true },
  { icon: I.Users, label: "Spaces" },
  { icon: I.Chart, label: "Command Center" },
  { icon: I.More, label: "More" },
];
const APPS = [{ icon: I.Contract, label: "Contract Intelligence" }];
const RECENTS = [
  "Transaction overview",
  "Key transaction issues",
  "Essential points in SPA",
];
const SPACES = [
  { mark: "A", label: "Acme Acquisition" },
  { mark: "P", label: "Project Compass" },
  { mark: "D", label: "Delphi Litigation" },
];

type Tone = "positive" | "attention" | "negative" | "muted";
type Status = "green" | "yellow" | "red" | "gray";
const KPIS: {
  icon: IconDef;
  label: string;
  value: string;
  delta?: string;
  tone?: Tone;
}[] = [
  {
    icon: I.File,
    label: "Documents",
    value: "1,284",
    delta: "212 today",
    tone: "positive",
  },
  {
    icon: I.Check,
    label: "Reviewed",
    value: "62%",
    delta: "9% this wk",
    tone: "positive",
  },
  {
    icon: I.Flag,
    label: "Open flags",
    value: "14",
    delta: "3 high",
    tone: "negative",
  },
  { icon: I.Spark, label: "Agents running", value: "2" },
];

const DOCS: {
  icon: IconDef;
  name: string;
  type: string;
  status: string;
  kind: Status;
  owner: string;
  when: string;
}[] = [
  {
    icon: I.File,
    name: "SPA — v7 (execution)",
    type: "Agreement",
    status: "Reviewed",
    kind: "green",
    owner: "M. Sterling",
    when: "Today",
  },
  {
    icon: I.File,
    name: "Disclosure letter",
    type: "Disclosure",
    status: "3 flags",
    kind: "red",
    owner: "J. Khan",
    when: "Today",
  },
  {
    icon: I.Folder,
    name: "Material contracts (40)",
    type: "Bundle · 40",
    status: "In review",
    kind: "yellow",
    owner: "Agent",
    when: "Yesterday",
  },
  {
    icon: I.Folder,
    name: "Employment — CoC",
    type: "Bundle · 112",
    status: "In review",
    kind: "yellow",
    owner: "Agent",
    when: "Yesterday",
  },
  {
    icon: I.File,
    name: "IP assignment register",
    type: "Schedule",
    status: "Reviewed",
    kind: "green",
    owner: "C. Bonnet",
    when: "Mon",
  },
  {
    icon: I.Folder,
    name: "Regulatory — CMA",
    type: "Bundle · 18",
    status: "Not started",
    kind: "gray",
    owner: "—",
    when: "—",
  },
];

const FLAGS: { text: string; doc: string; high: boolean; age: string }[] = [
  {
    text: "Uncapped liability — no cap in cl. 14",
    doc: "Nordic Metals",
    high: true,
    age: "2h",
  },
  {
    text: "CoC termination right — 90 days",
    doc: "Halden GmbH",
    high: true,
    age: "2h",
  },
  {
    text: "Undisclosed side letter — schedule 9",
    doc: "Disclosure Letter",
    high: true,
    age: "1d",
  },
  {
    text: "Governing law inconsistent",
    doc: "Meridian",
    high: false,
    age: "3d",
  },
];

const ACTIVITY: {
  icon: typeof I.Spark;
  tone: "brand" | "positive" | "muted";
  text: string;
  when: string;
}[] = [
  {
    icon: I.Spark,
    tone: "muted",
    text: "Agent flagged 6 CoC clauses",
    when: "2m",
  },
  {
    icon: I.Check,
    tone: "positive",
    text: "SPA v7 reviewed · M. Sterling",
    when: "41m",
  },
  {
    icon: I.Users,
    tone: "muted",
    text: "Bredin Prat joined SPA stream",
    when: "2h",
  },
  {
    icon: I.Upload,
    tone: "muted",
    text: "212 docs added from iManage",
    when: "5h",
  },
];

const TONE_DOT: Record<Tone, string> = {
  positive: "bg-harvey-positive",
  attention: "bg-harvey-attention",
  negative: "bg-harvey-negative",
  muted: "bg-harvey-gray-border-subtle",
};
const TONE_TEXT: Record<Tone, string> = {
  positive: "text-harvey-positive",
  attention: "text-harvey-attention",
  negative: "text-harvey-negative",
  muted: "text-harvey-gray-text-low",
};

/* ─── primitives ────────────────────────────────────────────────────────── */

/* Shadow-only edges. `ring` is the 1px hairline; `card` adds the soft lift;
 * `rule` is the inset divider between rows. All three use the ink-derived
 * hairline token so they stay warm on the ivory ground. */
const ring = "shadow-[0_0_0_1px_var(--harvey-hairline)]";
const card = "shadow-harvey-border";
const rule = "shadow-harvey-rule-b";

/* Status badge: a top→bottom gradient of the tone itself (lighter → the
 * tone), white text, a 1px inset ring one step darker so the edge holds. */
const BADGE: Record<Status, string> = {
  green: "var(--harvey-positive)",
  yellow: "var(--harvey-warning)",
  red: "var(--harvey-negative)",
  gray: "var(--harvey-gray-text-low)",
};

function Badge({ kind, children }: { kind: Status; children: ReactNode }) {
  /* flat tint + tone text, deliberately not the button recipe: a badge is a
   * state, a button is an action, and they share a row 300px apart */
  const tone = BADGE[kind];
  return (
    <span
      className={`${t14m} rounded-harvey-control inline-flex h-6 items-center px-2`}
      style={{
        color: tone,
        background: `color-mix(in oklab, ${tone} 14%, var(--harvey-canvas))`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tone} 22%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

/* Recessed list: plain p-2 outer; the inner list is tinted with the sidebar
 * colour at 4% and ringed, on the control radius. */
function Tray({ children }: { children: ReactNode }) {
  return (
    <div className="p-2">
      <div
        className={`rounded-harvey-control overflow-hidden bg-[color-mix(in_oklab,var(--harvey-gray-text-high)_4%,transparent)] ${ring}`}
      >
        {children}
      </div>
    </div>
  );
}

function Dot({ tone }: { tone: Tone }) {
  return (
    <span className={`size-1.5 shrink-0 rounded-full ${TONE_DOT[tone]}`} />
  );
}

/* Dashboard type — three sizes, locked:
 *   24  title (500) and the KPI metric (400)
 *   16  subtitle (400); card headers and KPI label row (500 / 400)
 *   14  sidebar and all list data (400), buttons and monograms (500)
 */
export const t14 = "type-label-14";
export const t14m = "type-label-14 font-medium";
const t16 = "type-copy-16";
const t16m = "type-copy-16 font-medium";
const t24 = "type-heading-24 font-normal";
const t24m = "type-heading-24 font-medium";

/* ─── ribbon ────────────────────────────────────────────────────────────── */

/* The Figma "Harvey Ribbon Wash" shader, approximated. One wide band curving
 * from the top-right corner down behind the dashboard; three tints across its
 * width; turbulence displacement for the silk folds; a blur so edges are soft;
 * a vertical mask so it fades out by the time it meets the frame. Brand hue
 * only — the whole thing sits at ~55% and reads as a wash, not a graphic. */
function RibbonFallback() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 1440 1700"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden
    >
      <defs>
        {/* across the ribbon: highlight → brand → mid tone */}
        <linearGradient id="hv-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--harvey-brand-ui-hover)" />
          <stop offset="0.42" stopColor="var(--harvey-brand-solid)" />
          <stop offset="0.7" stopColor="var(--harvey-brand-border)" />
          <stop offset="1" stopColor="var(--harvey-brand-ui)" />
        </linearGradient>
        {/* along the ribbon: opaque at the top, gone by the frame */}
        <linearGradient id="hv-ribbon-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="hv-ribbon-mask">
          <rect width="1440" height="1700" fill="url(#hv-ribbon-fade)" />
        </mask>
        {/* folds + softness */}
        <filter
          id="hv-ribbon-silk"
          x="-20%"
          y="-10%"
          width="140%"
          height="120%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0022 0.006"
            numOctaves="3"
            seed="7"
          />
          <feDisplacementMap
            in="SourceGraphic"
            scale="120"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="hv-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
        </filter>
      </defs>

      <g
        mask="url(#hv-ribbon-mask)"
        opacity="0.55"
        filter="url(#hv-ribbon-silk)"
      >
        {/* the band: a thick stroke along a curve from top-right to behind the frame */}
        <path
          d="M1480 -80 C 1380 260, 1140 420, 1010 640 S 840 1000, 860 1240"
          fill="none"
          stroke="url(#hv-ribbon)"
          strokeWidth="300"
          strokeLinecap="round"
        />
        {/* a narrower highlight fold riding inside it */}
        <path
          d="M1500 -40 C 1420 300, 1210 430, 1080 660 S 900 1010, 900 1220"
          fill="none"
          stroke="var(--harvey-brand-ui-hover)"
          strokeWidth="90"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
      <rect
        width="1440"
        height="1700"
        filter="url(#hv-grain)"
        style={{ mixBlendMode: "multiply" }}
        opacity="0.25"
      />
    </svg>
  );
}

/* ─── dashboard ─────────────────────────────────────────────────────────── */

function SideRow({
  icon,
  label,
  active = false,
}: {
  icon: IconDef;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`rounded-harvey-control flex h-8 items-center gap-3 px-2 ${
        active
          ? `${t14m} bg-harvey-gray-solid-hover text-harvey-canvas`
          : `${t14} hover:bg-harvey-gray-solid`
      }`}
    >
      <Glyph
        icon={icon}
        tone="dark"
        className={active ? "!bg-harvey-gray-solid !text-harvey-canvas" : ""}
      />
      {label}
    </a>
  );
}

function SideLabel({ children }: { children: ReactNode }) {
  return (
    <p className={`${t14} text-harvey-gray-border px-2 pt-5 pb-1`}>
      {children}
    </p>
  );
}

function Sidebar() {
  return (
    <aside className="bg-harvey-gray-text-high text-harvey-gray-ui-active flex w-[232px] shrink-0 flex-col gap-1 px-3 py-5">
      <div className="flex items-center justify-between px-2 pb-4">
        <span className={`${t14m} text-harvey-canvas`}>Harvey</span>
        <div className="flex gap-2">
          <Glyph icon={I.Bell} tone="dark" />
          <Glyph icon={I.Search} tone="dark" />
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {SIDEBAR.map((r) => (
          <SideRow key={r.label} {...r} />
        ))}

        <SideLabel>Apps</SideLabel>
        {APPS.map((r) => (
          <SideRow key={r.label} {...r} />
        ))}

        <SideLabel>Recents</SideLabel>
        {RECENTS.map((m) => (
          <a
            key={m}
            href="#"
            className={`${t14} rounded-harvey-control hover:bg-harvey-gray-solid flex h-8 items-center gap-3 px-2`}
          >
            <span className="flex size-6 shrink-0 items-center justify-center">
              <span className="bg-harvey-gray-border size-1.5 rounded-[1px]" />
            </span>
            <span className="min-w-0 truncate">{m}</span>
          </a>
        ))}
        <SideRow icon={I.Clock} label="View history" />

        <SideLabel>Spaces</SideLabel>
        {SPACES.map((sp) => (
          <a
            key={sp.label}
            href="#"
            className={`${t14} rounded-harvey-control hover:bg-harvey-gray-solid flex h-8 items-center gap-3 px-2`}
          >
            <span
              className={`${t14m} rounded-harvey-control bg-harvey-gray-solid text-harvey-gray-ui-active shadow-harvey-glyph-dark flex size-6 shrink-0 items-center justify-center`}
            >
              {sp.mark}
            </span>
            {sp.label}
          </a>
        ))}
        <SideRow icon={I.Archive} label="View spaces" />
      </nav>

      <div className="grow" />

      <div className="flex h-8 items-center gap-3 px-2">
        <span
          className={`${t14m} rounded-harvey-control bg-harvey-gray-ui-active text-harvey-gray-text-high flex size-6 shrink-0 items-center justify-center`}
        >
          M
        </span>
        <span className={`${t14} min-w-0 grow truncate`}>Maya Sterling</span>
        <Glyph icon={I.Gear} tone="dark" />
      </div>
    </aside>
  );
}

function CardHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${rule}`}>
      <span
        className={`${t16m} text-harvey-gray-text-high flex items-center gap-2`}
      >
        {title}
      </span>
      {right}
    </div>
  );
}

function Documents() {
  return (
    <div
      className={`rounded-harvey-card bg-harvey-canvas overflow-hidden ${card}`}
    >
      <CardHeader
        title="Review status"
        right={
          <button
            className={`${t14} rounded-harvey-control btn-ghost text-harvey-gray-text-low flex h-7 items-center gap-2 pr-[9px] pl-2`}
          >
            <Glyph icon={I.Filter} bare />
            Filter
          </button>
        }
      />
      <Tray>
        <div
          className={`${t14} text-harvey-gray-text-low flex items-center gap-3 px-4 py-2 ${rule}`}
        >
          <span className="w-6 shrink-0" />
          <span className="grow">Name</span>
          <span className="w-24 shrink-0">Type</span>
          <span className="w-[84px] shrink-0">Owner</span>
          <span className="w-24 shrink-0">Status</span>
          <span className="w-[72px] shrink-0 text-right">Reviewed</span>
        </div>
        {DOCS.map((d, i) => (
          <div
            key={d.name}
            className={`${t14} text-harvey-gray-text-high flex h-11 items-center gap-3 px-4 ${i < DOCS.length - 1 ? rule : ""}`}
          >
            {/* the tile colour is a kind signal (file vs bundle), but on a row
                whose status is neutral it reads as a status signal — an amber
                folder next to "Not started" says two different things. Rows
                with no status colour get a neutral tile. */}
            <Glyph icon={d.icon} tone="default" kinded={d.kind !== "gray"} />
            <span className="min-w-0 grow truncate">{d.name}</span>
            <span className="w-24 shrink-0">{d.type}</span>
            <span className="w-[84px] shrink-0">{d.owner}</span>
            <span className="flex w-24 shrink-0 items-center">
              <Badge kind={d.kind}>{d.status}</Badge>
            </span>
            <span className="w-[72px] shrink-0 text-right">{d.when}</span>
          </div>
        ))}
      </Tray>
    </div>
  );
}

function OpenFlags() {
  return (
    <div
      className={`rounded-harvey-card bg-harvey-canvas overflow-hidden ${card}`}
    >
      <CardHeader
        title="Open flags"
        right={
          <span className={`${t14} text-harvey-gray-text-low`}>
            14 · 3 high
          </span>
        }
      />
      <Tray>
        {FLAGS.map((f, i) => (
          <div
            key={f.text}
            className={`${t14} text-harvey-gray-text-high flex h-11 items-center gap-3 px-4 ${i < FLAGS.length - 1 ? rule : ""}`}
          >
            {/* severity leads and the row adds age — the list differentiates;
                the KPI tile already raised the alarm */}
            <Badge kind={f.high ? "red" : "yellow"}>
              {f.high ? "High" : "Med"}
            </Badge>
            <span className="min-w-0 grow truncate">{f.text}</span>
            <span className="text-harvey-gray-text-low shrink-0">{f.doc}</span>
            <span className="text-harvey-gray-text-low w-7 shrink-0 text-right">
              {f.age}
            </span>
            <button
              className={`${t14m} btn-primary text-harvey-brand-on-solid rounded-harvey-control flex h-7 shrink-0 items-center px-2`}
            >
              Resolve
            </button>
          </div>
        ))}
      </Tray>
    </div>
  );
}

/* Agent run — a vertical timeline, not a chat. Each step: glyph on the rail,
 * 16/500 title, 14 text-low meta on the right, a 14 detail line, and for the
 * current step its progress. done = neutral, current = positive, next = dim. */
type StepState = "done" | "current" | "next";
const RUN: {
  icon: IconDef;
  title: string;
  meta?: string;
  detail: string;
  state: StepState;
}[] = [
  {
    icon: I.Check,
    title: "Task",
    detail:
      "Find change-of-control clauses in the 40 material contracts and draft consent letters.",
    state: "done",
  },
  {
    icon: I.Check,
    title: "Index",
    meta: "2 min",
    detail: "1,284 documents read",
    state: "done",
  },
  {
    icon: I.Check,
    title: "Extract",
    meta: "7 min",
    detail: "6 clauses triggered · 3 need consent",
    state: "done",
  },
  {
    icon: I.File,
    title: "Draft",
    meta: "2 of 3",
    detail: "Consent letters, each cited to its clause",
    state: "current",
  },
  {
    icon: I.Lock,
    title: "Approve",
    detail: "Send to Space · requires M. Sterling",
    state: "next",
  },
];
const CONSENTS = [
  { name: "Nordic Metals supply", ref: "cl. 18.2", done: true },
  { name: "Halden distribution", ref: "cl. 21", done: true },
  { name: "Meridian services", ref: "cl. 24.1(b)", done: false },
];

function Step({ step, last }: { step: (typeof RUN)[number]; last: boolean }) {
  const dim = step.state === "next";
  const tile =
    step.state === "current"
      ? "bg-harvey-positive text-harvey-canvas shadow-[0_0_0_4px_color-mix(in_oklab,var(--harvey-positive)_18%,transparent)]"
      : dim
        ? "bg-harvey-gray-ui text-harvey-gray-text-low shadow-harvey-glyph"
        : "bg-harvey-gray-ui text-harvey-gray-text-high shadow-harvey-glyph";
  return (
    <div className="flex gap-3">
      {/* rail: tile + connector */}
      <div className="flex w-6 shrink-0 flex-col items-center">
        {step.state === "current" ? (
          <span
            className={`rounded-harvey-control flex size-6 shrink-0 items-center justify-center ${tile}`}
          >
            <HugeiconsIcon
              icon={step.icon}
              size={14}
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
        ) : (
          <Glyph
            icon={step.icon}
            tone="default"
            className={dim ? "opacity-60" : ""}
          />
        )}
        {/* connector: solid positive after a done step (the path travelled),
            dotted after the current / next steps (the path ahead) */}
        {!last &&
          (step.state === "done" ? (
            <span className="bg-harvey-positive w-px grow" />
          ) : (
            <span className="border-harvey-gray-border-subtle w-0 grow border-l border-dotted" />
          ))}
      </div>
      {/* done and next steps recede; only the current step is full strength */}
      <div
        className={`flex min-w-0 grow flex-col gap-1 ${last ? "" : "pb-4"} ${
          step.state === "done" ? "opacity-60" : dim ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={`${t16m} ${dim ? "text-harvey-gray-text-low" : "text-harvey-gray-text-high"}`}
          >
            {step.title}
          </span>
          {step.meta && (
            <span className={`${t14} text-harvey-gray-text-low`}>
              {step.meta}
            </span>
          )}
        </div>
        <p
          className={`${t14} ${dim ? "text-harvey-gray-text-low" : "text-harvey-gray-text-high"}`}
        >
          {step.detail}
        </p>
        {step.state === "current" && (
          <div className="flex flex-col gap-2 pt-1">
            {CONSENTS.map((c, i) => (
              <div key={c.name} className={`${t14} flex items-center gap-2`}>
                <span
                  className={`${t14m} rounded-harvey-control bg-harvey-brand-ui text-harvey-brand-text-high flex size-5 shrink-0 items-center justify-center`}
                >
                  {i + 1}
                </span>
                <span
                  className={`min-w-0 grow truncate ${c.done ? "text-harvey-gray-text-high" : "text-harvey-gray-text-low"}`}
                >
                  {c.name}
                </span>
                <span className="text-harvey-gray-text-low shrink-0">
                  {c.done ? c.ref : "drafting…"}
                </span>
              </div>
            ))}
            <div className="bg-harvey-gray-ui-active mt-1 flex h-1 overflow-hidden rounded-full">
              <span className="bg-harvey-positive w-2/3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentPanel({ focus }: { focus: boolean }) {
  return (
    <div
      className={`rounded-harvey-card bg-harvey-canvas overflow-hidden ${card}`}
    >
      <CardHeader
        title={
          <>
            <Glyph icon={I.Spark} />
            Diligence agent
          </>
        }
        right={
          <span
            className={`${t14m} rounded-harvey-control text-harvey-positive flex h-6 items-center gap-2 px-2`}
            style={{
              background:
                "color-mix(in oklab, var(--harvey-positive) 14%, var(--harvey-canvas))",
            }}
          >
            <span className="bg-harvey-positive size-1.5 rounded-full" />
            {focus ? "Running · 72%" : "Running"}
          </span>
        }
      />
      <Tray>
        <div className="flex flex-col p-3">
          {RUN.map((st, i) => (
            <Step key={st.title} step={st} last={i === RUN.length - 1} />
          ))}
          {/* actions sit on the text column, not the rail */}
          <div className="flex gap-2 pt-4 pl-9 whitespace-nowrap">
            <button
              className={`${t14m} rounded-harvey-control btn-primary text-harvey-brand-on-solid flex h-8 items-center px-3`}
            >
              Review draft
            </button>
            <button
              className={`${t14m} rounded-harvey-control btn-ghost flex h-8 items-center px-3`}
            >
              Open in Agents
            </button>
          </div>
        </div>
      </Tray>
    </div>
  );
}

function Activity() {
  return (
    <div
      className={`rounded-harvey-card bg-harvey-canvas overflow-hidden ${card}`}
    >
      <CardHeader
        title="Activity"
        right={
          <span className={`${t14} text-harvey-gray-text-low`}>Today</span>
        }
      />
      <Tray>
        {ACTIVITY.map((a, i) => (
          <div
            key={a.text}
            className={`${t14} text-harvey-gray-text-high flex h-11 items-center gap-3 px-4 ${i < ACTIVITY.length - 1 ? rule : ""}`}
          >
            <Glyph
              icon={a.icon}
              tone={a.tone === "muted" ? "default" : a.tone}
            />
            <span className="min-w-0 grow truncate">{a.text}</span>
            <span className="shrink-0">{a.when}</span>
          </div>
        ))}
      </Tray>
    </div>
  );
}

export function Dashboard({ focus }: { focus: boolean }) {
  return (
    <div
      className={`rounded-harvey-frame bg-harvey-canvas flex overflow-hidden ${ring}`}
    >
      <Sidebar />
      <main className="bg-harvey-ground flex min-w-0 grow flex-col">
        {/* header — title is the active sidebar item with a one-line
           description. Row is top-aligned so the *title* (not the block)
           centres on the sidebar wordmark line: sidebar py-5 + 24px tile = 32;
           here pt-3.5 + title pt-1 + 14 = 32, and pt-3.5 + h-9/2 = 32. */}
        <div className="flex items-start justify-between px-8 pt-3.5 pb-5">
          <div className="flex flex-col gap-1 pt-1">
            <h2 className={t24m}>Vault</h2>
            <p className={t16}>Your saved documents</p>
          </div>
          <div className="flex items-center gap-2">
            {/* icon-left buttons: +1px on the text side (optical) */}
            <button
              className={`${t14m} rounded-harvey-control btn-ghost flex h-9 items-center gap-2 pr-[13px] pl-3`}
            >
              <Glyph icon={I.Plus} bare />
              Upload
            </button>
            <button
              className={`${t14m} rounded-harvey-control btn-ink text-harvey-canvas flex h-9 items-center gap-2 pr-[13px] pl-3`}
            >
              <Glyph icon={I.Spark} bare />
              Ask Harvey
            </button>
          </div>
        </div>

        {/* kpis — two rows on the same two columns: [tile][label] on top,
           [arrow][change] below. No absolute value — the change is the
           number. Arrow sits in the tile's 24px column at 20px. */}
        <div className="flex gap-4 px-8 pb-5">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className={`rounded-harvey-card bg-harvey-canvas flex grow basis-0 flex-col gap-2 p-4 ${card}`}
            >
              <span className={`${t16} flex items-center gap-2`}>
                <Glyph icon={k.icon} tone="default" kinded={false} />
                {k.label}
              </span>
              {k.delta && k.tone ? (
                <span
                  className={`${t24} flex items-center gap-2 whitespace-nowrap ${TONE_TEXT[k.tone]}`}
                >
                  <span className="flex w-6 shrink-0 items-center justify-center">
                    <Glyph
                      icon={I.Up}
                      bare
                      size={20}
                      className={k.tone === "negative" ? "rotate-180" : ""}
                    />
                  </span>
                  {k.delta}
                </span>
              ) : (
                <span className={`${t24} flex items-center gap-2`}>
                  <span className="w-6 shrink-0" />
                  {k.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* body */}
        <div className="flex gap-4 px-8 pb-8">
          <div className="flex min-w-0 grow flex-col gap-4">
            <Documents />
            <OpenFlags />
          </div>
          <div
            className={`flex shrink-0 flex-col gap-4 ${focus ? "w-[380px]" : "w-[320px]"}`}
          >
            <AgentPanel focus={focus} />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── hero ──────────────────────────────────────────────────────────────── */

/* `focus` = the agent-first variant from the critique: wider right column so
 * nothing truncates, "Running · 72%" pill in brand on the agent header, the
 * Open flags KPI tinted attention, and a severity lane leading each flag row. */
export default function HarveyHero01({ focus = false }: { focus?: boolean }) {
  return (
    <section className="harvey harvey-section bg-harvey-ground text-harvey-gray-text-high relative isolate overflow-hidden">
      {/* the ribbon: WebGL shader (HarveyRibbon); the SVG version is the
          no-WebGL fallback. */}
      <HarveyRibbon intensity={0.7} fallback={<RibbonFallback />} />

      {/* nav */}
      <header className="shadow-harvey-rule-b relative flex h-[72px] items-center justify-between px-16">
        <a href="#" className="type-heading-24 type-serif">
          Harvey
        </a>
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              className="type-button-14 hover:text-harvey-brand-text-high"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <a href="#" className="type-button-14">
            Sign in
          </a>
          <a
            href="#"
            className="type-button-14 rounded-harvey-control btn-primary text-harvey-brand-on-solid flex h-10 items-center px-4"
          >
            Request a demo
          </a>
        </div>
      </header>

      {/* copy */}
      <div className="relative flex flex-col items-start gap-4 px-16 pt-16">
        <p className="type-eyebrow-13">
          AI for legal and professional services
        </p>
        <h1 className="type-heading-display ml-[-4px] text-balance">
          Build a Frontier <br /> Legal Organization
        </h1>
        <p className="type-copy-20 text-harvey-gray-text-low max-w-[820px] text-balance">
          Harvey puts agents, your documents, and your team on one secure
          platform, so every matter moves faster without leaving your standards
          behind.
        </p>

        <div className="flex flex-col gap-5 pt-3">
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="type-button-16 rounded-harvey-control btn-primary text-harvey-brand-on-solid flex h-12 items-center gap-2 pr-5 pl-[21px]"
            >
              Request a demo
              <span className="rounded-harvey-control flex size-6 items-center justify-center bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
                <Glyph icon={I.Arrow} bare size={14} />
              </span>
            </a>
            <a
              href="#"
              className={`type-button-16 rounded-harvey-control btn-ghost flex h-12 items-center gap-2 pr-[21px] pl-5`}
            >
              <Glyph icon={I.Play} tone="muted" kinded={false} />
              Watch the walkthrough
              <span
                className={`${t14} text-harvey-gray-text-low rounded-harvey-control bg-harvey-gray-ui px-1.5 leading-5`}
              >
                2:04
              </span>
            </a>
          </div>
          <p className={`${t14} text-harvey-gray-text-low font-medium`}>
            A 30-minute call on your own practice area. No deck, no commitment.
          </p>
          <ul className="text-harvey-gray-text-low flex items-center gap-6">
            {RISK.map(({ icon: Icon, label, fill }) => (
              <li key={label} className={`${t14m} flex items-center gap-2`}>
                <Glyph icon={Icon} fill={fill} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* wrap: ground → texture tint, with grain; holds the bezel */}
      <div className="relative mt-12 px-16 pb-16">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--harvey-texture) 8%, transparent) 100%)",
          }}
        />
        <div
          className="rounded-[16px] p-1 shadow-[0_1px_2px_rgba(20,16,8,0.06),0_12px_24px_-8px_rgba(20,16,8,0.08),0_32px_64px_-16px_color-mix(in_oklab,var(--harvey-brand-solid)_18%,transparent)]"
          style={{
            background:
              "linear-gradient(180deg, #fff 0%, #fff 45%, var(--harvey-brand-solid) 100%)",
          }}
        >
          <Dashboard focus={focus} />
        </div>
      </div>
    </section>
  );
}
