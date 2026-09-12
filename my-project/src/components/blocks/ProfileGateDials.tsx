"use client";

/**
 * Live tuning harness for ProfileGate.
 *
 * Deliberately a separate file from the block, the same way StackedTowerDials
 * is separate from StackedTower: ProfileGate ships to /approve with no idea a
 * panel exists, and this is the only file that imports dialkit.
 *
 * The config is DERIVED from DEFAULT_FLIGHT rather than hand-written, so the
 * panel cannot silently drift out of sync with the arc it is tuning. Add a
 * field to Flight and it appears here.
 *
 * Workflow: Fly → tune → "Copy flight" → paste the emitted object back over
 * DEFAULT_FLIGHT in ProfileGate.tsx. Without that last step the tuning is
 * throwaway, which is why the action exists.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDialKit, type DialConfig } from "dialkit";
import ProfileGate, {
  DEFAULT_FLIGHT,
  type Bulge,
  type Flight,
  type Leg,
} from "./ProfileGate";

const BULGES: Bulge[] = ["cw", "ccw", "auto"];

/* The four handles of the pacing bezier, as four sliders. y may travel outside
 * 0–1 — that overshoot is the only way to get anticipation out of a bezier. */
const BEZIER = (v: number, min: number, max: number): [number, number, number, number] => [
  v,
  min,
  max,
  0.01,
];

/* One leg of the journey. Both legs get the same four dials because they are
 * the same four options — the asymmetry between out and home is something you
 * tune, not something the shape of the panel decides for you. */
function legDials(leg: Leg): DialConfig {
  return {
    /* 0 is a straight line; 1 peaks at a height equal to the whole distance
       travelled. Past about 0.8 the face leaves the stage. */
    strength: [leg.strength, 0, 1.2, 0.01],
    /* Where the bulge peaks. Early = flung out and coasting in. */
    peak: [leg.peak, 0.1, 0.9, 0.01],
    /* Locked to the direction of travel, which is why leaving both legs on
       "cw" already gives the return its own road: the same side of a reversed
       journey is the other side of the screen. */
    direction: { type: "select" as const, options: BULGES, default: leg.direction },
    /* Tangent following. The lean is the path's now, not a keyframe's. */
    rotate: [leg.rotate, 0, 1, 0.01],
    duration: [leg.duration, 0.2, 1.6, 0.01],
  };
}

/* One panel, in the order you actually tune it: each leg's shape, then the
 * pacing over it, then the spring riding on top. */
function buildConfig(): DialConfig {
  const f = DEFAULT_FLIGHT;

  return {
    fly: { type: "action", label: "Fly / return" },
    /* On by default HERE and nowhere else. The trace is why this route
       exists, but DEFAULT_FLIGHT keeps it false so /approve never ships a
       tuning overlay. */
    showPath: true,

    out: legDials(f.out),
    home: legDials(f.home),

    pacing: {
      /* The arc decides the shape; this decides how fast you move over it. */
      x1: BEZIER(f.ease[0], 0, 1),
      y1: BEZIER(f.ease[1], -0.6, 1.6),
      x2: BEZIER(f.ease[2], 0, 1),
      y2: BEZIER(f.ease[3], -0.6, 1.6),
    },

    stage: {
      rise: [f.rise, 0.15, 0.5, 0.01],
      growth: [f.growth, 1.2, 3.2, 0.01],
    },

    /* Fractions of the leg, not seconds. Retime a flight and the pad follows
       it without a second number to keep in sync. */
    pad: {
      enterAt: [f.pad.enterAt, 0, 1, 0.01],
      exitBy: [f.pad.exitBy, 0.05, 1, 0.01],
      spring: {
        type: "spring",
        visualDuration: f.pad.visualDuration,
        bounce: f.pad.bounce,
      },
    },

    scale: {
      grow: { type: "spring", visualDuration: f.grow.visualDuration, bounce: f.grow.bounce },
      shrink: {
        type: "spring",
        visualDuration: f.shrink.visualDuration,
        bounce: f.shrink.bounce,
      },
    },

    copy: { type: "action", label: "Copy flight" },
    reset: { type: "action" },
  };
}

type LegValues = {
  strength: number;
  peak: number;
  direction: Bulge;
  rotate: number;
  duration: number;
};

type Values = {
  showPath: boolean;
  out: LegValues;
  home: LegValues;
  pacing: { x1: number; y1: number; x2: number; y2: number };
  stage: { rise: number; growth: number };
  pad: {
    enterAt: number;
    exitBy: number;
    spring: { visualDuration: number; bounce: number };
  };
  scale: {
    grow: { visualDuration: number; bounce: number };
    shrink: { visualDuration: number; bounce: number };
  };
};

function toFlight(v: Values): Flight {
  return {
    rise: v.stage.rise,
    growth: v.stage.growth,
    out: { ...v.out },
    home: { ...v.home },
    ease: [v.pacing.x1, v.pacing.y1, v.pacing.x2, v.pacing.y2],
    grow: { visualDuration: v.scale.grow.visualDuration, bounce: v.scale.grow.bounce },
    pad: {
      enterAt: v.pad.enterAt,
      exitBy: v.pad.exitBy,
      visualDuration: v.pad.spring.visualDuration,
      bounce: v.pad.spring.bounce,
    },
    shrink: {
      visualDuration: v.scale.shrink.visualDuration,
      bounce: v.scale.shrink.bounce,
    },
    showPath: v.showPath,
  };
}

const round = (n: number) => Number(n.toFixed(3));

const emitLeg = (leg: Leg) =>
  `{ strength: ${round(leg.strength)}, peak: ${round(leg.peak)}, direction: "${leg.direction}", rotate: ${round(leg.rotate)}, duration: ${round(leg.duration)} }`;

/* Emitted in the exact shape of DEFAULT_FLIGHT, so tuning ends in a paste
 * rather than in transcribing a dozen numbers by eye. showPath is forced off:
 * the trace is a tool, never a thing to ship. */
function emit(f: Flight) {
  return `export const DEFAULT_FLIGHT: Flight = {
  rise: ${round(f.rise)},
  growth: ${round(f.growth)},
  out: ${emitLeg(f.out)},
  home: ${emitLeg(f.home)},
  ease: [${f.ease.map(round).join(", ")}],
  grow: { visualDuration: ${round(f.grow.visualDuration)}, bounce: ${round(f.grow.bounce)} },
  shrink: { visualDuration: ${round(f.shrink.visualDuration)}, bounce: ${round(f.shrink.bounce)} },
  pad: { enterAt: ${round(f.pad.enterAt)}, exitBy: ${round(f.pad.exitBy)}, visualDuration: ${round(f.pad.visualDuration)}, bounce: ${round(f.pad.bounce)} },
  showPath: false,
};`;
}

function Tuner({ className }: { className?: string }) {
  const config = useMemo(buildConfig, []);
  const [runToken, setRunToken] = useState(0);

  /* onAction is registered before the derived flight exists, so it reads the
     latest value through a ref rather than closing over a stale render. */
  const latest = useRef<Flight>(DEFAULT_FLIGHT);

  const onAction = useCallback((action: string) => {
    if (action === "fly") {
      setRunToken((t) => t + 1);
      return;
    }
    if (action === "reset") {
      window.location.reload();
      return;
    }
    if (action !== "copy") return;

    const text = emit(latest.current);
    console.log(text);
    navigator.clipboard?.writeText(text).catch(() => {
      /* clipboard blocked — the console copy above is the fallback */
    });
  }, []);

  const values = useDialKit("Profile gate · flight", config, {
    onAction,
  }) as unknown as Values;

  const flight = useMemo(() => toFlight(values), [values]);

  useEffect(() => {
    latest.current = flight;
  }, [flight]);

  return <ProfileGate className={className} flight={flight} runToken={runToken} />;
}

export default function ProfileGateDials({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Pre-mount the block still renders at its source flight, so the route is
     never blank and the panel simply arrives after hydration. Calling
     useDialKit during SSR puts a subtree in the client tree that is not in the
     server HTML, and that mismatch is not fixable from inside the component. */
  if (!mounted) return <ProfileGate className={className} />;
  return <Tuner className={className} />;
}
