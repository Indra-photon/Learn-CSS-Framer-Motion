#!/usr/bin/env node
/**
 * build-design.mjs — emit the mechanical half of a block's DESIGN.md.
 *
 * Reads the two files the sibling skills already produced — the color-scale
 * palette and the type-scale scale — and turns them into the token tables,
 * the coverage ledger and the wiring snippet. It invents nothing: every value
 * printed is read back out of a real CSS file, so a table can never claim a
 * token the build does not ship.
 *
 * The prose half of DESIGN.md (voice line, Do/Don't, components, prompt guide)
 * is written by hand from the interview. See ../SKILL.md.
 *
 * Usage:
 *   node build-design.mjs <block> [--palette <path>] [--type <path>]
 *                                 [--ship-colors a,b,…] [--ship-type a,b,…]
 *                                 [--canvas <value>] [--all]
 *
 * Prints markdown to stdout and a coverage report to stderr. Writes nothing.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/* ── The v1 floor ──────────────────────────────────────────────────────
 * What a first roll-out documents as installed. Everything else the two
 * generators produced is real and available — it is simply not documented
 * yet, which is what the ➕ rows say. Keep this list short: a DESIGN.md
 * that documents forty roles is a DESIGN.md nobody reads to the end. */

const SHIP_COLORS = [
  "gray-bg-subtle",
  "gray-ui",
  "gray-ui-hover",
  "gray-text-low",
  "gray-text-high",
  "brand-ui",
  "brand-solid",
  "brand-solid-hover",
  "brand-on-solid",
  "brand-text-low",
];

const SHIP_TYPE = [
  "heading-48",
  "heading-32",
  "heading-20",
  "copy-16",
  "copy-14",
  "label-12-mono",
  "button-14",
];

/* Which utility a role is normally spent through. Drives the "Consume as"
 * column — block-scoped variables cannot generate Tailwind utilities, so the
 * doc has to name the arbitrary-value form or the markup will guess. */
const CONSUME = {
  "bg-subtle": "bg", ui: "bg", "ui-hover": "hover:bg", "ui-active": "active:bg",
  "border-subtle": "border", border: "border", "border-hover": "outline",
  solid: "bg", "solid-hover": "hover:bg", "text-low": "text", "text-high": "text",
  "on-solid": "text",
};

const ROLE_NOTE = {
  "gray-bg-subtle": "Panel and card surfaces, one step off the canvas",
  "gray-ui": "Secondary buttons, title bars, inert fills",
  "gray-ui-hover": "Hover on a neutral control",
  "gray-ui-active": "Pressed neutral control, inert chart bars",
  "gray-border-subtle": "Hairline separators, structural edges",
  "gray-border-hover": "Focus rings on neutral controls",
  "gray-text-low": "Secondary text, labels, metadata",
  "gray-text-high": "Primary text, headings",
  "brand-ui": "Icon tiles, chip fills",
  "brand-solid": "Primary buttons, the accent surface",
  "brand-solid-hover": "Primary button hover",
  "brand-on-solid": "Text on the accent surface",
  "brand-text-low": "Accent-tinted labels and icons",
  "brand-border-hover": "Focus rings on accent controls",
};

/* ── args ──────────────────────────────────────────────────────────────*/

const argv = process.argv.slice(2);
const VALUE_FLAGS = ["palette", "type", "ship-colors", "ship-type", "canvas"];
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
};

/* Positional = the block name. Skip flags and the values that belong to them,
 * so `--palette foo.css akta` still finds `akta`. */
let block = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    if (VALUE_FLAGS.includes(a.slice(2))) i++;
    continue;
  }
  block = a;
  break;
}

if (!block) {
  console.error(
    "usage: build-design.mjs <block> [--palette <path>] [--type <path>]\n" +
      "                              [--ship-colors a,b,…] [--ship-type a,b,…]\n" +
      "                              [--canvas <value>] [--all]"
  );
  process.exit(1);
}

const SEARCH = (name) => [
  `src/components/blocks/${name}`,
  `src/components/sections/${block}/${name}`,
  `src/components/${name}`,
  name,
];

function locate(explicit, name, what) {
  if (explicit) {
    if (!existsSync(explicit)) fail(`${what} not found at ${explicit}`);
    return explicit;
  }
  const hit = SEARCH(name).find((p) => existsSync(p));
  if (!hit) {
    fail(
      `${what} not found. Looked for:\n  ` +
        SEARCH(name).join("\n  ") +
        `\n\nRun the sibling skill first — this skill documents what they ship, it does not invent tokens.`
    );
  }
  return hit;
}

function fail(msg) {
  console.error(`\nbuild-design: ${msg}\n`);
  process.exit(1);
}

const palettePath = locate(flag("palette"), `${block}.css`, "Palette");
const typePath = locate(flag("type"), `${block}-type.css`, "Type scale");

const shipColors = flag("ship-colors")?.split(",").map((s) => s.trim()) ?? SHIP_COLORS;
const shipType = flag("ship-type")?.split(",").map((s) => s.trim()) ?? SHIP_TYPE;
const shipAll = argv.includes("--all");
const canvas = flag("canvas") ?? "#fff / #000";

/* ── parse the palette ─────────────────────────────────────────────────*/

function parsePalette(css) {
  /* color-scale emits one light block and one `.dark` block, in that order. */
  const darkAt = css.search(/\.dark\s+\./);
  const lightSrc = darkAt === -1 ? css : css.slice(0, darkAt);
  const darkSrc = darkAt === -1 ? "" : css.slice(darkAt);

  const read = (src) => {
    const out = new Map();
    for (const m of src.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out.set(m[1], m[2].trim());
    return out;
  };

  const light = read(lightSrc);
  const dark = read(darkSrc);
  return [...light.keys()].map((role) => ({
    role,
    light: light.get(role),
    dark: dark.get(role) ?? light.get(role),
  }));
}

/* `var(--color-blue-700)` → `blue-700`, which is what you say out loud to a
 * designer. Anything that isn't a Tailwind reference prints as written. */
function describe(value) {
  const m = value.match(/var\(--color-([a-z]+-\d+)\)/);
  return m ? m[1] : value;
}

/* ── parse the type scale ──────────────────────────────────────────────*/

function parseType(css) {
  const out = [];
  for (const m of css.matchAll(/\.[a-z0-9-]+\s+\.type-([a-z0-9-]+)\s*\{([^}]*)\}/g)) {
    const [, token, body] = m;
    if (/>\s*strong/.test(m[0])) continue;
    const get = (prop) => body.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1]?.trim();
    out.push({
      token,
      size: get("font-size"),
      leading: get("line-height"),
      weight: get("font-weight"),
      tracking: get("letter-spacing") ?? "—",
      mono: /--font-mono/.test(get("font-family") ?? ""),
    });
  }
  return out;
}

const palette = parsePalette(readFileSync(palettePath, "utf8"));
const type = parseType(readFileSync(typePath, "utf8"));

if (!palette.length) fail(`No custom properties found in ${palettePath}.`);
if (!type.length) fail(`No .type-* rules found in ${typePath}.`);

/* ── emit ──────────────────────────────────────────────────────────────*/

const out = [];

out.push("## Coverage ledger");
out.push("");
out.push("| Legend | Meaning |");
out.push("| --- | --- |");
out.push("| ✅ | Documented and in use. Reach for it directly. |");
out.push(
  "| ◑ token only | The value ships in the CSS but no role in this file spends it. Usable, undocumented — say so in the PR that first uses it. |"
);
out.push(
  "| ➕ add | The value ships in the CSS but is **not part of this system's vocabulary yet.** Do not reach for it. Raise a Gap Request first (see the contract at the top of this file), then move its row to ✅ in the same commit. |"
);
out.push("");
out.push(
  `Both CSS files are generated. **Never hand-edit them** — regenerate through \`/color-scale\` and \`/type-scale\`, then re-run \`/design-md\`, or the tables below start lying.`
);
out.push("");

/* colors */
out.push("## Tokens — Colors");
out.push("");
out.push(
  `Block-scoped to \`.${block}\`, so Tailwind cannot generate utilities from them. **Every color reaches markup as an arbitrary value** — the "Consume as" column is the only correct form.`
);
out.push("");
out.push("| Role | Light | Dark | Variable | Consume as | Use for |");
out.push("| --- | --- | --- | --- | --- | --- |");
out.push(
  `| Canvas | \`${canvas.split("/")[0].trim()}\` | \`${(canvas.split("/")[1] ?? canvas).trim()}\` | — | page ground | The surface everything sits on |`
);
const deferredColors = [];
for (const { role, light, dark } of palette) {
  if (!shipAll && !shipColors.includes(role)) {
    deferredColors.push(role);
    continue;
  }
  const bare = role.replace(/^(brand|gray|danger|success|warning)-/, "");
  const util = CONSUME[bare] ?? "bg";
  out.push(
    `| ${role} | \`${describe(light)}\` | \`${describe(dark)}\` | \`--${role}\` | \`${util}-[var(--${role})]\` | ${
      ROLE_NOTE[role] ?? "—"
    } |`
  );
}
if (deferredColors.length) {
  out.push("");
  out.push(
    `**➕ Also in \`${palettePath.split("/").pop()}\`, not vocabulary yet** — ${deferredColors
      .map((r) => `\`--${r}\``)
      .join(", ")}. These values ship, but nothing in this system spends them. Reaching for one is a Gap Request, not a shortcut.`
  );
}
out.push("");

/* type */
out.push("## Tokens — Typography");
out.push("");
out.push(
  `Descendant classes, not variables — each sets size, leading, weight and tracking in one class. **One role per element**; they do not compose, and a Tailwind \`text-*\` on top of one produces a token that is no longer a token.`
);
out.push("");
out.push("| Role | Size / leading | Weight | Tracking | Class | Family |");
out.push("| --- | --- | --- | --- | --- | --- |");
const deferredType = [];
for (const t of type) {
  if (!shipAll && !shipType.includes(t.token)) {
    deferredType.push(t.token);
    continue;
  }
  out.push(
    `| ${t.token} | ${t.size} / ${t.leading} | ${t.weight} | ${t.tracking} | \`type-${t.token}\` | ${
      t.mono ? "mono" : "sans"
    } |`
  );
}
if (deferredType.length) {
  out.push("");
  out.push(
    `**➕ Also in \`${typePath.split("/").pop()}\`, not vocabulary yet** — ${deferredType
      .map((r) => `\`type-${r}\``)
      .join(", ")}. Adding one to the vocabulary is a decision about the system, not about one component.`
  );
}
out.push("");

/* wiring */
out.push("## Wiring");
out.push("");
out.push("```tsx");
out.push(`import "./${palettePath.split("/").pop()}";`);
out.push(`import "./${typePath.split("/").pop()}";`);
out.push("");
out.push(`// Both files are scoped to this class. Off the root element,`);
out.push(`// every token in this document silently resolves to nothing.`);
out.push(`<section className="${block}">…</section>`);
out.push("```");
out.push("");

process.stdout.write(out.join("\n") + "\n");

/* ── report ────────────────────────────────────────────────────────────*/

const shippedC = palette.filter((p) => shipAll || shipColors.includes(p.role));
const shippedT = type.filter((t) => shipAll || shipType.includes(t.token));
const missC = shipColors.filter((r) => !palette.some((p) => p.role === r));
const missT = shipType.filter((r) => !type.some((t) => t.token === r));

const err = ["", `DESIGN.md tables — .${block}`, ""];
err.push(`  palette   ${palettePath}`);
err.push(`  type      ${typePath}`);
err.push("");
err.push(`  colors    ${shippedC.length} shipped of ${palette.length} available`);
err.push(`  type      ${shippedT.length} shipped of ${type.length} available`);
err.push("");
if (missC.length || missT.length) {
  err.push("  warning: asked to ship tokens that do not exist in the CSS —");
  for (const r of missC) err.push(`    color  --${r}`);
  for (const r of missT) err.push(`    type   .type-${r}`);
  err.push("  Regenerate the scale with those roles, or drop them from --ship-*.");
  err.push("");
}
err.push("  Prose sections are yours to write. Read references/anatomy.md for the");
err.push("  section list, and paste the contract from references/contract.md at the");
err.push("  top of the file before anything else.");
err.push("");
process.stderr.write(err.join("\n"));
