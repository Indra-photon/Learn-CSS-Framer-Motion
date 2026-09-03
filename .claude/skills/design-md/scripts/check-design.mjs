#!/usr/bin/env node
/**
 * check-design.mjs — audit components against their DESIGN.md.
 *
 * The contract at the top of a DESIGN.md says every visual decision resolves
 * to a token named in that file. This is the runnable half of that rule: it
 * reads the ✅ rows out of the ledger, then flags anything in the markup that
 * cannot be traced back to one.
 *
 * It reports; it never edits. Each finding is a Gap Request waiting to be
 * raised with the owner — not a lint error to silence.
 *
 * Usage:
 *   node check-design.mjs <design.md> <file…>
 *
 * Exit 0 when clean, 1 when anything needs a decision.
 */

import { readFileSync, existsSync } from "node:fs";

const [designPath, ...files] = process.argv.slice(2);
if (!designPath || !files.length) {
  console.error("usage: check-design.mjs <design.md> <file…>");
  process.exit(2);
}
if (!existsSync(designPath)) {
  console.error(`check-design: no DESIGN.md at ${designPath}`);
  process.exit(2);
}

const design = readFileSync(designPath, "utf8");

/* Everything the doc marks ✅ — variables, type classes, radii, shadows. */
const shipped = new Set();
for (const line of design.split("\n")) {
  /* ◑ counts as allowed: the doc has decided the value exists and is reached
   * by var() rather than by a utility. ➕ does not — that row is a decision
   * nobody has made yet. */
  if (!line.includes("✅") && !line.includes("◑")) continue;
  for (const m of line.matchAll(/`--([a-z0-9-]+)`/g)) shipped.add(`--${m[1]}`);
  for (const m of line.matchAll(/`(type-[a-z0-9-]+)`/g)) shipped.add(m[1]);
}
/* Radii and shadows are prose tables, not always ✅-marked — read the values. */
const radii = new Set(
  [...design.matchAll(/^\|\s*(?:radius|corner|rounded)[^|]*\|\s*`?([0-9]+px|0|9999px|full)`?/gim)].map(
    (m) => m[1]
  )
);
const noRadius = /radius[^|\n]*\|\s*\*?\*?(0|none)\*?\*?\s*\|/i.test(design) ||
  /never add (a )?radius|no border-radius anywhere/i.test(design);

/* ── the rules ─────────────────────────────────────────────────────────
 * Each is a decision the markup is not allowed to make on its own. */

const RULES = [
  {
    id: "raw-color",
    re: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(|\bhsla?\(/g,
    why: "a literal color",
    fix: "Use a palette role: bg-[var(--brand-solid)]. If no role fits, that is a Gap Request.",
  },
  {
    id: "tailwind-palette",
    re: /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
    why: "a stock Tailwind color",
    fix: "The block has its own palette. Map it to a role, or raise a Gap Request.",
  },
  {
    id: "arbitrary-size",
    re: /\b(?:w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|gap|top|left|right|bottom)-\[\s*-?\d*\.?\d+(?:px|rem)\s*\]/g,
    why: "a hand-measured size",
    fix: "Use the spacing scale, or a width from the scale (w-56, max-w-2xl). Pixel widths do not survive a breakpoint change.",
  },
  {
    id: "raw-type",
    re: /\btext-\[\s*\d+(?:px|rem)[^\]]*\]|\bleading-\[[^\]]+\]|\btracking-\[[^\]]+\]/g,
    why: "an off-scale type metric",
    fix: "Every size is a role in the type scale. If the design needs a size between two roles, pick one — do not add a third.",
  },
  {
    id: "tailwind-type",
    re: /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/g,
    why: "a stock Tailwind type step",
    fix: "Use a type-* role, which sets size, leading, weight and tracking together.",
  },
  {
    id: "stock-shadow",
    re: /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g,
    why: "a stock Tailwind shadow",
    fix: "Elevation is defined in this system's shadow table. Use one of those, or raise a Gap Request.",
  },
];

/* ── run ───────────────────────────────────────────────────────────────*/

const findings = [];

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`check-design: skipping missing ${file}`);
    continue;
  }
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; /* comments describe, they don't render */

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      for (const m of line.matchAll(rule.re)) {
        findings.push({ file, line: i + 1, rule, hit: m[0] });
      }
    }

    /* radius, checked against the vocabulary the doc actually declares */
    for (const m of line.matchAll(/\brounded(?:-[a-z]+)?(?:-(\w+|\[[^\]]+\]))?\b/g)) {
      const value = m[1] ?? "DEFAULT";
      if (noRadius) {
        findings.push({
          file, line: i + 1, hit: m[0],
          rule: { id: "radius", why: "a radius in a square-cornered system",
                  fix: "This system declares radius 0 everywhere. Remove it." },
        });
      } else if (radii.size && !/^\[/.test(value)) {
        /* named steps can't be verified here; arbitrary ones can't be tokens */
      } else if (/^\[/.test(value)) {
        findings.push({
          file, line: i + 1, hit: m[0],
          rule: { id: "radius", why: "an arbitrary radius",
                  fix: "Radius is a closed vocabulary in this system. Use a declared step." },
        });
      }
    }

    /* a var that the ledger does not mark ✅ */
    for (const m of line.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
      const name = m[1];
      if (shipped.has(name)) continue;
      if (/^--(tw|font-sans|font-mono)/.test(name)) continue;
      if (!design.includes(name)) {
        findings.push({
          file, line: i + 1, hit: m[0],
          rule: { id: "unknown-token", why: "a token this DESIGN.md never mentions",
                  fix: "Either it belongs in the doc, or the markup should not be using it." },
        });
      } else {
        findings.push({
          file, line: i + 1, hit: m[0],
          rule: { id: "undocumented-token", why: "a token the ledger has not promoted to ✅",
                  fix: "The value ships, but it is not vocabulary yet. Raise a Gap Request and move its ledger row." },
        });
      }
    }
  });
}

/* ── report ────────────────────────────────────────────────────────────*/

if (!findings.length) {
  console.log(`\nclean — every visual decision traces to ${designPath}\n`);
  process.exit(0);
}

const byRule = new Map();
for (const f of findings) {
  if (!byRule.has(f.rule.id)) byRule.set(f.rule.id, []);
  byRule.get(f.rule.id).push(f);
}

console.log(`\n${findings.length} decision${findings.length === 1 ? "" : "s"} the markup made on its own`);
console.log(`checked against ${designPath}\n`);

for (const [id, group] of byRule) {
  console.log(`  ${id} — ${group[0].rule.why}`);
  for (const f of group.slice(0, 12)) {
    console.log(`    ${f.file}:${f.line}  ${f.hit}`);
  }
  if (group.length > 12) console.log(`    … and ${group.length - 12} more`);
  console.log(`    → ${group[0].rule.fix}`);
  console.log("");
}

console.log("Each of these is a Gap Request, not a lint error. Take them to the");
console.log("owner with a recommendation before changing either the markup or the doc.\n");
process.exit(1);
