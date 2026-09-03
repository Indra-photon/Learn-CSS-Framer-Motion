/**
 * MobileFrame — an iPhone-proportioned device shell to present a screen in.
 *
 * Dimensions are the real logical ones (390 × 844), which matters more than it
 * sounds: mock a screen at an invented size and every spacing decision inside
 * it is calibrated to a phone that does not exist. The bezel and corner radii
 * below are hardware, so they are stated as raw px here rather than pulled
 * from ./tokens — the device is the thing holding the design system, not part
 * of it. Everything *inside* the screen obeys the tokens.
 *
 * Two nested radii, not one: the screen's corner is the shell's corner minus
 * the bezel width. Matching them instead would leave the bezel visibly thicker
 * at the corners than along the edges, which is the usual tell of a mockup
 * drawn rather than measured.
 *
 * Server component: no hooks, no client directives.
 */

import {
  BatteryFullIcon,
  CellularNetworkIcon,
  Wifi01Icon,
} from "@hugeicons/core-free-icons";

import Icon from "./icon";

import { t } from "./tokens";

/* ---------------------------------------------------------------- hardware */

const SCREEN_W = 390;
const SCREEN_H = 844;

/** Bezel thickness. The shell is the screen plus this on every side. */
const BEZEL = 12;

/** Screen corner. The shell corner is this plus the bezel — see the header. */
const SCREEN_RADIUS = 44;

/* --------------------------------------------------------------- fragments */

/**
 * Status bar. Sized to `t.bodyInk` like everything else — a real iOS status
 * bar is a touch larger, but a third font size to gain two points of clock is
 * a bad trade against the constraint.
 */
function StatusBar({ time }: { time: string }) {
  return (
    <div className="relative flex h-[54px] shrink-0 items-center justify-between px-7">
      <span className={t.bodyInk}>{time}</span>

      {/* Dynamic island — centred against the screen, not the flex row, so an
          uneven clock width can never nudge it off axis. */}
      <div className="absolute top-2.5 left-1/2 h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-[oklch(14%_0.010_264)]" />

      <div className="flex items-center gap-1 text-[oklch(23%_0.015_264)]">
        <Icon icon={CellularNetworkIcon} size={17} />
        <Icon icon={Wifi01Icon} size={16} />
        <Icon icon={BatteryFullIcon} size={19} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- component */

export default function MobileFrame({
  children,
  time = "9:41",
  className = "",
}: {
  children: React.ReactNode;
  time?: string;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 bg-[oklch(18%_0.008_264)] shadow-[0_32px_64px_-16px_oklch(20%_0.02_264/0.35)] ${className}`}
      style={{
        padding: BEZEL,
        borderRadius: SCREEN_RADIUS + BEZEL,
      }}
    >
      <div
        className={`${t.screen} flex flex-col overflow-hidden`}
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: SCREEN_RADIUS,
        }}
      >
        <StatusBar time={time} />

        {/* The screen body — one screen, no scrolling. `min-h-0` stops the
            flex child from flooring at its content height, so the screen
            stays exactly SCREEN_H tall and the child is handed a real bounded
            height to fill rather than growing the phone. Content is sized to
            fit inside this; anything that outgrows it gets clipped, which is
            the intended failure mode here rather than a scrollbar. */}
        <div className="flex min-h-0 flex-1 px-1.5 pb-2">{children}</div>

        {/* Home indicator. */}
        <div className="flex h-[34px] shrink-0 items-center justify-center">
          <div className="h-[5px] w-[140px] rounded-full bg-[oklch(60%_0.010_264)]" />
        </div>
      </div>
    </div>
  );
}
