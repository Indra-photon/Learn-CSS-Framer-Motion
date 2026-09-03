"use client";

/**
 * Live tuning harness for StackedTower.
 *
 * Deliberately a separate file from the illustration. StackedTower.tsx has no
 * hooks and no client dependencies, so it renders as a server component and
 * ships zero JS; pulling `useDialKit` into it would forfeit that for a panel
 * nobody sees in production. This file is the only thing that imports dialkit.
 *
 * The dial config is DERIVED from DEFAULT_GEOMETRY rather than hand-written, so
 * the panel cannot silently drift out of sync with the source it is tuning.
 *
 * Workflow: tune → "Copy geometry" → paste the emitted values back into
 * DEFAULT_GEOMETRY in StackedTower.tsx. Without that last step the tuning is
 * throwaway, which is why the action exists.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDialKit, type DialConfig } from "dialkit";
import StackedTower, {
  DEFAULT_GEOMETRY,
  type BlendMode,
  type Geometry,
  type Unit,
} from "./StackedTower";

/** Blend modes worth reaching for on ribs. The rest are novelty here. */
const BLEND_MODES = [
  "plus-lighter",
  "screen",
  "soft-light",
  "overlay",
  "lighten",
  "color-dodge",
  "multiply",
  "normal",
];

/* -------------------------------------------------------------- dial config */

/** [default, min, max, step] */
const span = (v: number, r: number, step = 1): [number, number, number, number] => [
  v,
  v - r,
  v + r,
  step,
];

/**
 * Lid position is exposed RELATIVE to its drum (`lidDx`, `lidPad`) rather than
 * as absolute cx/rx. Tune it absolutely and every drum nudge silently
 * de-registers the lid that sits on it.
 */
function unitDials(u: Unit): DialConfig {
  const dials: DialConfig = {
    cx: span(u.cx, 200),
    rx: [u.rx, 60, 360, 1],
    lidTop: span(u.lidTop, 160),
    lidH: [u.lidH, 4, 90, 1],
    drumH: [u.drumH, 10, 320, 1],
    lidDx: span((u.lidCx ?? u.cx) - u.cx, 120),
    lidPad: [(u.lidRx ?? u.rx + DEFAULT_GEOMETRY.lidOverhang) - u.rx, 0, 90, 1],
    // The single base colour. Lid, drum, ribs and contact shadow are all walked
    // down the ramp from here, so this one hue moves the whole unit.
    color: {
      l: [u.base.l, 20, 98, 0.5],
      c: [u.base.c, 0, 0.37, 0.005],
      h: [u.base.h, 0, 360, 1],
    },
  };
  if (u.ribCount !== undefined) {
    dials.ribCount = [u.ribCount, 0, 60, 1];
    dials.ribWidth = [u.ribWidth ?? 3, 1, 10, 0.5];
  }
  if (u.labelYBias !== undefined) dials.labelYBias = span(u.labelYBias, 160);
  return dials;
}

function buildConfig(): DialConfig {
  const config: DialConfig = {
    camera: {
      // The one rule with zero tolerance — every ellipse obeys this ratio.
      ryRatio: [DEFAULT_GEOMETRY.camera.ryRatio, 0.1, 0.45, 0.005],
      strokeWidth: [DEFAULT_GEOMETRY.camera.strokeWidth, 0.5, 6, 0.1],
    },
    // How every colour moves as it darkens. `chroma` and `hue` are the trick:
    // chroma climbing into the shadows is what stops them going muddy, and the
    // small hue rotation is what keeps them from looking computed.
    shading: {
      lightness: [DEFAULT_GEOMETRY.palette.ramp.lightness, 0, 16, 0.25],
      chroma: [DEFAULT_GEOMETRY.palette.ramp.chroma, -0.02, 0.06, 0.001],
      hue: [DEFAULT_GEOMETRY.palette.ramp.hue, -30, 30, 0.5],
      edgeShade: [DEFAULT_GEOMETRY.palette.edgeShade, 0, 0.6, 0.01],
      contactShade: [DEFAULT_GEOMETRY.palette.contactShade, 0, 0.8, 0.01],
    },
    // Negative ribStep walks UP the ramp — lighter than the drum, so the ribs
    // read as raised highlights rather than cut grooves.
    ribs: {
      ribStep: [DEFAULT_GEOMETRY.palette.ribStep, -4, 4, 0.1],
      ribOpacity: [DEFAULT_GEOMETRY.palette.ribOpacity, 0, 1, 0.01],
      ribBlend: {
        type: "select",
        options: BLEND_MODES,
        default: DEFAULT_GEOMETRY.palette.ribBlend,
      },
    },
    // Curve shape, ink weight, and the type hierarchy of the callouts.
    annotation: {
      lead: [DEFAULT_GEOMETRY.annotation.lead, 60, 320, 2],
      bow: [DEFAULT_GEOMETRY.annotation.bow, -140, 140, 1],
      curve: [DEFAULT_GEOMETRY.annotation.curve, 0, 200, 1],
      opacity: [DEFAULT_GEOMETRY.annotation.opacity, 0.1, 1, 0.01],
      strokeWidth: [DEFAULT_GEOMETRY.annotation.strokeWidth, 0.4, 5, 0.1],
      labelSize: [DEFAULT_GEOMETRY.annotation.labelSize, 12, 48, 0.5],
      labelWeight: [DEFAULT_GEOMETRY.annotation.labelWeight, 300, 800, 100],
      supportSize: [DEFAULT_GEOMETRY.annotation.supportSize, 10, 34, 0.5],
      supportWeight: [DEFAULT_GEOMETRY.annotation.supportWeight, 300, 800, 100],
      supportOpacity: [DEFAULT_GEOMETRY.annotation.supportOpacity, 0.15, 1, 0.01],
    },
  };
  for (const u of DEFAULT_GEOMETRY.units) config[u.id] = unitDials(u);
  config.copy = { type: "action", label: "Copy geometry" };
  config.reset = { type: "action", label: "Reset to source" };
  return config;
}

/* ---------------------------------------------------------------- resolving */

type UnitValues = {
  cx: number;
  rx: number;
  lidTop: number;
  lidH: number;
  drumH: number;
  lidDx: number;
  lidPad: number;
  ribCount?: number;
  ribWidth?: number;
  labelYBias?: number;
  color: { l: number; c: number; h: number };
};

type TunerValues = {
  camera: { ryRatio: number; strokeWidth: number };
  shading: {
    lightness: number;
    chroma: number;
    hue: number;
    edgeShade: number;
    contactShade: number;
  };
  ribs: { ribStep: number; ribOpacity: number; ribBlend: string };
  annotation: {
    lead: number;
    bow: number;
    curve: number;
    opacity: number;
    strokeWidth: number;
    labelSize: number;
    labelWeight: number;
    supportSize: number;
    supportWeight: number;
    supportOpacity: number;
  };
} & Record<string, UnitValues>;

function applyValues(values: TunerValues): Geometry {
  const { lightness, chroma, hue, edgeShade, contactShade } = values.shading;
  return {
    camera: { ...values.camera },
    palette: {
      ramp: { lightness, chroma, hue },
      edgeShade,
      contactShade,
      ribStep: values.ribs.ribStep,
      ribOpacity: values.ribs.ribOpacity,
      ribBlend: values.ribs.ribBlend as BlendMode,
    },
    annotation: { ...values.annotation },
    lidOverhang: DEFAULT_GEOMETRY.lidOverhang,
    units: DEFAULT_GEOMETRY.units.map((u) => {
      const v = values[u.id];
      if (!v) return u;
      return {
        ...u,
        cx: v.cx,
        rx: v.rx,
        lidTop: v.lidTop,
        lidH: v.lidH,
        drumH: v.drumH,
        lidCx: v.cx + v.lidDx,
        lidRx: v.rx + v.lidPad,
        base: { ...v.color },
        ...(v.ribCount !== undefined
          ? { ribCount: v.ribCount, ribWidth: v.ribWidth }
          : null),
        ...(v.labelYBias !== undefined ? { labelYBias: v.labelYBias } : null),
      };
    }),
  };
}

/* ----------------------------------------------------------------- emitting */

const num = (n: number) => (Number.isInteger(n) ? `${n}` : `${+n.toFixed(3)}`);

/** Emits a paste-ready fragment of DEFAULT_GEOMETRY. */
function emit(g: Geometry): string {
  const units = g.units
    .map((u) => {
      const lines = [
        `    id: "${u.id}",`,
        `    cx: ${num(u.cx)},`,
        `    rx: ${num(u.rx)},`,
        `    lidTop: ${num(u.lidTop)},`,
        `    lidH: ${num(u.lidH)},`,
        `    drumH: ${num(u.drumH)},`,
        `    lidCx: ${num(u.lidCx ?? u.cx)},`,
        `    lidRx: ${num(u.lidRx ?? u.rx)},`,
        `    base: { l: ${num(u.base.l)}, c: ${num(u.base.c)}, h: ${num(u.base.h)} },`,
      ];
      if (u.ribCount !== undefined) {
        lines.push(`    ribCount: ${num(u.ribCount)},`);
        lines.push(`    ribWidth: ${num(u.ribWidth ?? 3)},`);
      }
      if (u.labelYBias !== undefined)
        lines.push(`    labelYBias: ${num(u.labelYBias)},`);
      return `  {\n${lines.join("\n")}\n  },`;
    })
    .join("\n");

  const { ramp } = g.palette;
  return [
    "// Tuned geometry — paste into DEFAULT_GEOMETRY in StackedTower.tsx",
    `camera: { ryRatio: ${num(g.camera.ryRatio)}, strokeWidth: ${num(g.camera.strokeWidth)} },`,
    "palette: {",
    `  ramp: { lightness: ${num(ramp.lightness)}, chroma: ${num(ramp.chroma)}, hue: ${num(ramp.hue)} },`,
    `  edgeShade: ${num(g.palette.edgeShade)},`,
    `  contactShade: ${num(g.palette.contactShade)},`,
    `  ribStep: ${num(g.palette.ribStep)},`,
    `  ribOpacity: ${num(g.palette.ribOpacity)},`,
    `  ribBlend: "${g.palette.ribBlend}",`,
    "},",
    "annotation: {",
    `  lead: ${num(g.annotation.lead)}, bow: ${num(g.annotation.bow)}, curve: ${num(g.annotation.curve)},`,
    `  opacity: ${num(g.annotation.opacity)}, strokeWidth: ${num(g.annotation.strokeWidth)},`,
    `  labelSize: ${num(g.annotation.labelSize)}, labelWeight: ${num(g.annotation.labelWeight)},`,
    `  supportSize: ${num(g.annotation.supportSize)}, supportWeight: ${num(g.annotation.supportWeight)},`,
    `  supportOpacity: ${num(g.annotation.supportOpacity)},`,
    "},",
    "units: [",
    units,
    "]",
  ].join("\n");
}

/* ------------------------------------------------------------------ export */

/**
 * The panel itself. Split out so `useDialKit` is never called during SSR or the
 * first client render — DialRoot renders a panel on the client that does not
 * exist in the server HTML, and the resulting subtree mismatch is not fixable
 * from inside this component. Gating the hook behind a mount flag is.
 */
function Tuner({ className }: { className?: string }) {
  const config = useMemo(buildConfig, []);

  // onAction is registered before the derived geometry exists, so it reads the
  // latest value through a ref rather than closing over a stale render.
  const geomRef = useRef<Geometry>(DEFAULT_GEOMETRY);

  const onAction = useCallback((action: string) => {
    if (action === "reset") {
      window.location.reload();
      return;
    }
    if (action !== "copy") return;
    const text = emit(geomRef.current);
    console.log(text);
    navigator.clipboard?.writeText(text).catch(() => {
      /* clipboard blocked — the console copy above is the fallback */
    });
  }, []);

  const values = useDialKit("Stacked Tower", config, {
    onAction,
  }) as unknown as TunerValues;

  const geometry = useMemo(() => applyValues(values), [values]);

  useEffect(() => {
    geomRef.current = geometry;
  }, [geometry]);

  return <StackedTower className={className} geometry={geometry} />;
}

export default function StackedTowerDials({
  className,
}: {
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pre-mount the illustration still server-renders at its source geometry, so
  // the route is never blank and the panel simply arrives after hydration.
  if (!mounted) return <StackedTower className={className} />;
  return <Tuner className={className} />;
}
