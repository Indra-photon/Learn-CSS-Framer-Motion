"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Globe02Icon,
  Location01Icon,
  SparklesIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RowIconProps = { className?: string };

const ROW_ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function BookingsIcon({ className }: RowIconProps) {
  return (
    <svg
      viewBox="0 0 21.332 21.332"
      className={className}
      aria-hidden="true"
      {...ROW_ICON_PROPS}
    >
      <path d="M14.223 1.777V5.332M7.109 1.777V5.332" />
      <path d="M11.555 3.555H9.777C6.427 3.555 4.75 3.555 3.709 4.596 2.668 5.637 2.668 7.314 2.668 10.668V12.445C2.668 15.795 2.668 17.473 3.709 18.513 4.75 19.555 6.427 19.555 9.777 19.555H11.555C14.909 19.555 16.582 19.555 17.627 18.513 18.668 17.473 18.668 15.795 18.668 12.445V10.668C18.668 7.314 18.668 5.637 17.627 4.596 16.582 3.555 14.909 3.555 11.555 3.555Z" />
      <path d="M2.668 8.891H18.668" />
      <path d="M8.891 16.445L8.891 12.307C8.891 12.14 8.767 12 8.619 12H8M12.445 16.444L13.764 12.349C13.774 12.322 13.777 12.293 13.777 12.268 13.777 12.118 13.66 12 13.509 12L11.555 12" />
    </svg>
  );
}

function OrdersIcon({ className }: RowIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...ROW_ICON_PROPS}
    >
      <path d="M8 7L16 7C17.886 7 18.828 7 19.414 7.586C20 8.172 20 9.114 20 11L20 15C20 18.3 20 19.95 18.975 20.975C17.95 22 16.3 22 13 22L11 22C7.7 22 6.05 22 5.025 20.975C4 19.95 4 18.3 4 15L4 11C4 9.114 4 8.172 4.586 7.586C5.172 7 6.114 7 8 7Z" />
      <path d="M16 9.5C16 5.634 14.209 2 12 2C9.791 2 8 5.634 8 9.5" />
    </svg>
  );
}

function LeadsIcon({ className }: RowIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...ROW_ICON_PROPS}
    >
      <path d="M9 5L21 5" />
      <path d="M3 5L5 5" />
      <path d="M9 12L21 12" />
      <path d="M3 12L5 12" />
      <path d="M9 19L21 19" />
      <path d="M3 19L5 19" />
    </svg>
  );
}

function LogicIcon({ className }: RowIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...ROW_ICON_PROPS}
    >
      <path
        d="M3 4C3 2.345 3.345 2 5 2H9C10.655 2 11 2.345 11 4C11 5.655 10.655 6 9 6H5C3.345 6 3 5.655 3 4Z"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <path
        d="M13 13C13 11.345 13.345 11 15 11H19C20.655 11 21 11.345 21 13C21 14.655 20.655 15 19 15H15C13.345 15 13 14.655 13 13Z"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <path
        d="M13 20C13 18.345 13.345 18 15 18H19C20.655 18 21 18.345 21 20C21 21.655 20.655 22 19 22H15C13.345 22 13 21.655 13 20Z"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <path d="M17 11C17 10.535 17 10.303 16.962 10.11C16.804 9.316 16.184 8.696 15.39 8.538C15.197 8.5 14.965 8.5 14.5 8.5H9.5C9.035 8.5 8.803 8.5 8.61 8.462C7.816 8.304 7.196 7.684 7.038 6.89C7 6.697 7 6.465 7 6" />
      <path d="M17 15V18" />
    </svg>
  );
}

const CONFIG_ROWS = [
  {
    id: "bookings",
    label: "Bookings",
    Icon: BookingsIcon,
    defaultOn: true,
  },
  {
    id: "orders",
    label: "Orders",
    Icon: OrdersIcon,
    defaultOn: true,
  },
  {
    id: "leads",
    label: "Leads",
    Icon: LeadsIcon,
    defaultOn: true,
  },
  {
    id: "logic",
    label: "Logic",
    Icon: LogicIcon,
    defaultOn: true,
  },
] as const;

function SoundWaveBadge() {
  return (
    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-neutral-200 shadow-sm">
      <svg
        viewBox="0 0 16 12"
        className="size-2.5 text-neutral-500"
        aria-hidden="true"
      >
        <rect x="0" y="4" width="2" height="4" rx="1" fill="currentColor" />
        <rect x="4" y="2" width="2" height="8" rx="1" fill="currentColor" />
        <rect x="8" y="0" width="2" height="12" rx="1" fill="currentColor" />
        <rect x="12" y="3" width="2" height="6" rx="1" fill="currentColor" />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Stage geometry — single source of truth.
 * Both the connector SVG and the absolutely-positioned nodes read from these,
 * so the lines always terminate exactly on the edges they point at.
 * ------------------------------------------------------------------------ */
const STAGE_W = 560;
const STAGE_H = 188;
const TILE = 48; // source tiles and avatars
const PILL_W = 104;
const CARD_X = 155;
const CARD_W = 250;
const CARD_RIGHT = CARD_X + CARD_W;
const RIGHT_CX = 508; // centre line of the output column
const ELBOW_R = 10;

/** Vertical centre of each outer node, top to bottom. */
const LANES = [24, 94, 164];
/** Where each connector meets the card's left/right edge. */
const PORTS = [47, 94, 141];

/** Elbow path between two points: horizontal out, rounded turn, horizontal in. */
function elbow(x1: number, y1: number, x2: number, y2: number) {
  if (y1 === y2) return `M${x1} ${y1} H${x2}`;
  const midX = (x1 + x2) / 2;
  const dir = y2 > y1 ? 1 : -1;
  return [
    `M${x1} ${y1}`,
    `H${midX - ELBOW_R}`,
    `Q${midX} ${y1} ${midX} ${y1 + dir * ELBOW_R}`,
    `V${y2 - dir * ELBOW_R}`,
    `Q${midX} ${y2} ${midX + ELBOW_R} ${y2}`,
    `H${x2}`,
  ].join(" ");
}

function ConnectorLines() {
  const paths = [
    // Sources → card left edge.
    ...LANES.map((lane, i) => elbow(TILE, lane, CARD_X, PORTS[i])),
    // Card right edge → outputs. The middle lane lands on the wider pill.
    ...LANES.map((lane, i) =>
      elbow(
        CARD_RIGHT,
        PORTS[i],
        RIGHT_CX - (i === 1 ? PILL_W : TILE) / 2,
        lane,
      ),
    ),
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={STAGE_W}
      height={STAGE_H}
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      fill="none"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="#e5e5e5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function SourceIcon({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay }}
      className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]"
    >
      {children}
    </motion.div>
  );
}

function ConfigRow({
  label,
  Icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex w-full items-end justify-between px-5 py-3.5">
      <div className="flex items-end gap-[5px]">
        <Icon className="size-[18px] shrink-0 text-neutral-800" />
        <span className="block text-[18px] leading-[18px] font-medium text-neutral-800">
          {label}
        </span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-checked:bg-neutral-800 data-unchecked:bg-neutral-200"
      />
    </div>
  );
}

function AvatarOutput({
  src,
  alt,
  delay = 0,
}: {
  src: string;
  alt: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay }}
      className="relative z-10"
    >
      <div className="size-12 overflow-hidden rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
        <img src={src} alt={alt} className="size-full object-cover" />
      </div>
      <SoundWaveBadge />
    </motion.div>
  );
}

function BookedPill({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay }}
      className="relative z-10"
    >
      <div className="flex w-[104px] items-center justify-center gap-2 rounded-full bg-white py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
        <HugeiconsIcon
          icon={Calendar01Icon}
          size={16}
          strokeWidth={ROW_ICON_PROPS.strokeWidth}
          className="text-neutral-800"
        />
        <span className="text-[14px] font-medium text-neutral-800">Booked</span>
      </div>
      <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
        <HugeiconsIcon
          icon={Tick01Icon}
          size={12}
          strokeWidth={2.5}
          className="text-white"
        />
      </span>
    </motion.div>
  );
}

export default function WorkflowPipeline({
  className,
}: {
  className?: string;
}) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONFIG_ROWS.map((row) => [row.id, row.defaultOn])),
  );

  const setToggle = (id: string, checked: boolean) =>
    setToggles((prev) => ({ ...prev, [id]: checked }));

  return (
    <section
      className={cn(
        "flex min-h-screen items-center justify-center overflow-x-auto bg-neutral-50 px-6 py-16",
        className,
      )}
    >
      {/* Fixed-size stage: every node is placed on the same coordinate system
          the connector SVG draws in. */}
      <div
        className="relative shrink-0"
        style={{ width: STAGE_W, height: STAGE_H }}
      >
        <ConnectorLines />

        {/* Left — input sources, left edge at x=0, centred on each lane */}
        {[
          { key: "globe", icon: Globe02Icon, size: 22 },
          { key: "maps", icon: Location01Icon, size: 22 },
          { key: "sparkles", icon: SparklesIcon, size: 22 },
        ].map(({ key, icon, size }, i) => (
          <div
            key={key}
            className="absolute left-0 -translate-y-1/2"
            style={{ top: LANES[i] }}
          >
            <SourceIcon delay={0.05 + i * 0.05}>
              <HugeiconsIcon
                icon={icon}
                size={size}
                strokeWidth={ROW_ICON_PROPS.strokeWidth}
                className="text-neutral-800"
              />
            </SourceIcon>
          </div>
        ))}

        {/* Center — config card, left edge at CARD_X */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-[7px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]"
          style={{ left: CARD_X, width: CARD_W }}
        >
          {CONFIG_ROWS.map((row, i) => (
            <div key={row.id}>
              <ConfigRow
                label={row.label}
                Icon={row.Icon}
                checked={toggles[row.id] ?? false}
                onCheckedChange={(checked) => setToggle(row.id, checked)}
              />
              {i < CONFIG_ROWS.length - 1 && (
                <Separator className="bg-neutral-100" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Right — outputs, centred on RIGHT_CX and on each lane */}
        {[
          <AvatarOutput
            key="agent-on-call"
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
            alt="Agent on call"
            delay={0.2}
          />,
          <BookedPill key="booked" delay={0.25} />,
          <AvatarOutput
            key="agent-available"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
            alt="Agent available"
            delay={0.3}
          />,
        ].map((node, i) => (
          <div
            key={node.key}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: RIGHT_CX, top: LANES[i] }}
          >
            {node}
          </div>
        ))}
      </div>
    </section>
  );
}
