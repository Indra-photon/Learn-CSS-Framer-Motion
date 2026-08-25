#!/usr/bin/env node
/**
 * build-scale.mjs — generate a block-scoped semantic palette from a Tailwind
 * color family.
 *
 * The structure is Radix's (semantic roles, not a bare lightness ramp); the
 * colors are Tailwind's, used verbatim. Tailwind ships 11 stops and Radix
 * defines 12 roles, so exactly one role is dropped: `bg`. Radix's own docs
 * note that steps 1 and 2 are interchangeable and suggest plain white for a
 * light-mode app background, so the scale starts at `bg-subtle`.
 *
 * Output references Tailwind's theme variables (`var(--color-blue-700)`)
 * rather than hardcoding oklch values — verified to survive Tailwind v4's
 * theme-variable tree-shaking when referenced from a co-located CSS file.
 *
 * Usage:
 *   node build-scale.mjs <family> [selector] [--neutral <family>] [--status]
 *
 * Prints CSS to stdout and a contrast report to stderr. Writes nothing.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/* ── Role tables ───────────────────────────────────────────────────────
 * Light is a straight 1:1 walk up Tailwind's ramp. Dark inverts the
 * surface, border and text roles, but pins `solid`/`solid-hover` near
 * their light-mode stops so the accent keeps one identity — and one
 * foreground color — across both themes. Pinning means a few stops serve
 * two roles in dark mode, which is harmless: a border and a button fill
 * sharing a value reads fine. */

const LIGHT = {
  "bg-subtle": 50,
  ui: 100,
  "ui-hover": 200,
  "ui-active": 300,
  "border-subtle": 400,
  border: 500,
  "border-hover": 600,
  solid: 700,
  "solid-hover": 800,
  "text-low": 900,
  "text-high": 950,
};

const DARK = {
  "bg-subtle": 950,
  ui: 900,
  "ui-hover": 800,
  "ui-active": 700,
  "border-subtle": 700,
  border: 600,
  "border-hover": 500,
  solid: 600,
  "solid-hover": 500,
  "text-low": 400,
  "text-high": 100,
};

const ROLES = Object.keys(LIGHT);

/* ── Tailwind palette ──────────────────────────────────────────────────
 * Parsed from the installed tailwindcss so contrast checks run against the
 * exact values the build will ship. */

function findThemeCss() {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    const p = resolve(dir, "node_modules/tailwindcss/theme.css");
    if (existsSync(p)) return p;
    dir = resolve(dir, "..");
  }
  throw new Error(
    "Could not find node_modules/tailwindcss/theme.css — run from inside the project."
  );
}

function loadPalette() {
  const css = readFileSync(findThemeCss(), "utf8");
  const re =
    /--color-([a-z]+)-(\d+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s*([\d.]+)?\)/g;
  const families = {};
  for (const m of css.matchAll(re)) {
    const [, family, stop, l, c, h] = m;
    (families[family] ??= {})[Number(stop)] = {
      L: Number(l) / 100,
      C: Number(c),
      H: h === undefined ? 0 : Number(h),
    };
  }
  return families;
}

/* ── Contrast ──────────────────────────────────────────────────────────
 * OKLCH → OKLab → linear sRGB → gamma sRGB → WCAG 2.1 relative luminance.
 * Every text and solid role is checked rather than assumed. */

function oklchToRgb({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((v) => {
    v = Math.max(0, Math.min(1, v));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  });
}

function luminance(color) {
  const [r, g, b] = oklchToRgb(color).map((v) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = { L: 1, C: 0, H: 0 };
const BLACK = { L: 0, C: 0, H: 0 };
const AA = 4.5;

/* ── on-solid ──────────────────────────────────────────────────────────
 * The one value the table cannot supply: which foreground sits on the
 * accent. Prefer a single color that clears AA in both modes so the
 * component does not switch text color between themes; fall back to
 * per-mode only when no single choice works. */

function chooseForeground(stops) {
  const lightSolid = stops[LIGHT.solid];
  const darkSolid = stops[DARK.solid];

  const score = (fg) => ({
    light: contrast(lightSolid, fg),
    dark: contrast(darkSolid, fg),
  });
  const w = score(WHITE);
  const b = score(BLACK);

  const whiteBoth = w.light >= AA && w.dark >= AA;
  const blackBoth = b.light >= AA && b.dark >= AA;

  if (whiteBoth && blackBoth) {
    // Both work; take the one with more headroom at the light-mode solid.
    return w.light >= b.light
      ? { light: "white", dark: "white", ratios: w, shared: true }
      : { light: "black", dark: "black", ratios: b, shared: true };
  }
  if (whiteBoth) return { light: "white", dark: "white", ratios: w, shared: true };
  if (blackBoth) return { light: "black", dark: "black", ratios: b, shared: true };

  return {
    light: w.light >= b.light ? "white" : "black",
    dark: w.dark >= b.dark ? "white" : "black",
    ratios: { light: Math.max(w.light, b.light), dark: Math.max(w.dark, b.dark) },
    shared: false,
  };
}

const FG_VALUE = { white: "#fff", black: "#000" };
const FG_COLOR = { white: WHITE, black: BLACK };

/* ── Neutral pairing ───────────────────────────────────────────────────
 * Tailwind's grays are already hue-tinted — slate ≈257, gray ≈262,
 * zinc ≈286, stone ≈58 — so pairing by nearest hue makes surfaces feel
 * related to the accent without generating a bespoke gray. */

const NEUTRALS = ["slate", "gray", "zinc", "stone", "neutral"];

function pairNeutral(palette, family) {
  const stops = palette[family];
  const mid = [400, 500, 600, 700].map((s) => stops[s]);
  const brandHue = mid.reduce((a, s) => a + s.H, 0) / mid.length;
  const brandChroma = Math.max(...mid.map((s) => s.C));

  if (brandChroma < 0.02) return "neutral";
  if (NEUTRALS.includes(family)) return family === "neutral" ? "neutral" : family;

  let best = "slate";
  let bestDist = Infinity;
  for (const name of NEUTRALS) {
    if (name === "neutral") continue;
    const n = [400, 500, 600, 700].map((s) => palette[name][s]);
    const hue = n.reduce((a, s) => a + s.H, 0) / n.length;
    let d = Math.abs(hue - brandHue) % 360;
    if (d > 180) d = 360 - d;
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

/* ── Emission ──────────────────────────────────────────────────────────*/

function emitScale(prefix, family, table, fg) {
  const lines = [`  /* ${prefix} — ${family} */`];
  for (const role of ROLES) {
    const stop = table[role];
    const name = `--${prefix}-${role}:`.padEnd(24);
    lines.push(`  ${name} var(--color-${family}-${stop});`);
  }
  if (fg) {
    lines.push(`  ${`--${prefix}-on-solid:`.padEnd(24)} ${FG_VALUE[fg]};`);
  }
  return lines.join("\n");
}

function report(palette, entries) {
  const lines = [];
  for (const { prefix, family, fg } of entries) {
    const stops = palette[family];
    lines.push(`  ${prefix} — ${family}`);

    for (const [mode, table] of [
      ["light", LIGHT],
      ["dark", DARK],
    ]) {
      const bg = stops[table["bg-subtle"]];
      const checks = [
        [`text-low  on bg-subtle`, contrast(stops[table["text-low"]], bg), AA],
        [`text-high on bg-subtle`, contrast(stops[table["text-high"]], bg), 7],
        [`border    on bg-subtle`, contrast(stops[table.border], bg), 1.5],
      ];
      if (fg) {
        checks.push([
          `on-solid  on solid    `,
          contrast(stops[table.solid], FG_COLOR[fg[mode]]),
          AA,
        ]);
      }
      lines.push(`    ${mode}`);
      for (const [label, ratio, min] of checks) {
        lines.push(
          `      ${label}  ${ratio.toFixed(2).padStart(6)}:1  min ${String(
            min
          ).padEnd(4)} ${ratio >= min ? "PASS" : "FAIL"}`
        );
      }
    }
  }
  return lines.join("\n");
}

/* ── CLI ───────────────────────────────────────────────────────────────*/

function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const positional = argv.filter((a) => !a.startsWith("--"));

  const brand = positional[0];
  if (!brand) {
    console.error(
      "usage: build-scale.mjs <tailwind-family> [selector] [--neutral <family>] [--status]"
    );
    process.exit(1);
  }
  const selector = positional[1] ?? "palette";

  const palette = loadPalette();
  if (!palette[brand]) {
    console.error(
      `Unknown Tailwind color "${brand}".\nAvailable: ${Object.keys(palette).join(", ")}`
    );
    process.exit(1);
  }

  const nIdx = argv.indexOf("--neutral");
  const neutralFamily =
    nIdx !== -1 && argv[nIdx + 1] ? argv[nIdx + 1] : pairNeutral(palette, brand);
  if (!palette[neutralFamily]) {
    console.error(`Unknown neutral family "${neutralFamily}".`);
    process.exit(1);
  }

  const entries = [
    { prefix: "brand", family: brand, fg: chooseForeground(palette[brand]) },
    { prefix: "gray", family: neutralFamily, fg: chooseForeground(palette[neutralFamily]) },
  ];
  if (flags.has("--status")) {
    for (const [prefix, family] of [
      ["danger", "red"],
      ["success", "green"],
      ["warning", "amber"],
    ]) {
      entries.push({ prefix, family, fg: chooseForeground(palette[family]) });
    }
  }

  const out = [];
  out.push(`/* Palette: ${brand} + ${neutralFamily}${
    flags.has("--status") ? " + status" : ""
  }
 * Generated by .claude/skills/color-scale
 * Regenerate: node .claude/skills/color-scale/scripts/build-scale.mjs ${argv.join(" ")}
 *
 * 11 semantic roles mapped 1:1 onto Tailwind's 11 stops. Radix's "bg" role is
 * dropped — use white or --gray-bg-subtle for the page background. */`);

  out.push(`.${selector} {`);
  out.push(
    entries
      .map((e) => emitScale(e.prefix, e.family, LIGHT, e.fg.light))
      .join("\n\n")
  );
  out.push("}");
  out.push("");
  out.push(`.dark .${selector} {`);
  out.push(
    entries.map((e) => emitScale(e.prefix, e.family, DARK, e.fg.dark)).join("\n\n")
  );
  out.push("}");

  console.log(out.join("\n"));

  console.error("\nContrast report");
  console.error(report(palette, entries));
  const split = entries.filter((e) => !e.fg.shared);
  if (split.length) {
    console.error(
      `\n  note: ${split
        .map((e) => e.prefix)
        .join(", ")} needs a different on-solid per mode — no single ` +
        `foreground clears AA at both solid stops.`
    );
  }
}

main();
