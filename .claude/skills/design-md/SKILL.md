---
name: design-md
description: Turn a block's generated palette and type scale into a DESIGN.md that agents can build from without guessing — token tables, a coverage ledger, and a contract that stops the agent and asks when a value is missing. Also audits components against an existing doc. Explicit invocation only.
invoke: /design-md [<block-name>] [--check <file…>] [--retrofit <design.md>]

  Examples:

  /design-md pricing-card
  /design-md akta --ship-colors gray-ui,brand-solid --ship-type heading-48,copy-16
  /design-md --check src/components/sections/ActaHero/BentoGrid.tsx
  /design-md --retrofit src/components/sections/ActaHero/DESIGN.md

  Arguments:
- block-name — the block whose palette and type scale already exist
- --check — audit components against their DESIGN.md and report Gap Requests
- --retrofit — bring an existing hand-written DESIGN.md up to this standard
- --ship-colors / --ship-type — override the v1 vocabulary
- --all — document every generated token instead of a v1 subset
---

# design-md

Third skill in the pipeline. `color-scale` decides the colors, `type-scale`
decides the metrics, `design-md` decides **which of them are vocabulary** and
writes the document an agent builds from.

```
/color-scale blue pricing-card   →  pricing-card.css        22 roles
/type-scale  pricing-card        →  pricing-card-type.css   30 tokens
/design-md   pricing-card        →  DESIGN.md               documents ~17
```

The subsetting is the point. A first roll-out ships the roles the design
actually spends and lists the rest as deferred — visible, available, and
explicitly **not** yet part of the language.

Explicit invocation only. Do not run this unprompted while building a component.

## The one rule this skill exists to enforce

Every generated DESIGN.md carries a **Contract** at the top: if a value is not
in the file, the agent stops and raises a **Gap Request** rather than picking
something plausible. Read `references/contract.md` before writing the file, and
paste that block verbatim — do not paraphrase it, and do not soften "stop" into
"prefer".

This applies to you too, in this session and every later one. When you are
building UI for a block that has a DESIGN.md and you need a value it does not
name: stop and ask. That is the whole reason the file exists.

## Mode 1 — generate (default)

1. **Preflight.** Confirm `<block>.css` and `<block>-type.css` exist. If either
   is missing, **stop** and tell the user to run `/color-scale` or `/type-scale`
   first. Do not invent a palette or a scale to keep moving — this skill only
   ever documents and subsets what those two files already ship.

2. **Interview.** Ask these twelve, in one pass, each with a recommendation so
   the user can answer in a line. Do not guess any of them:

   | | Question | Why it can't be derived |
   |---|---|---|
   | 1 | Voice line — one sentence | Everything downstream is tone |
   | 2 | Theme — light / dark / both | The CSS ships both ramps; the doc has to say which is real |
   | 3 | Radius vocabulary — max 3 values, or `0` | Nothing in the CSS implies it |
   | 4 | Elevation — shadow stack / hairline border / rules-as-shadows / none | The single biggest structural choice |
   | 5 | Density — compact / comfortable | Sets the spacing ladder |
   | 6 | Accent budget — how many uses per viewport | Without a number this is unenforceable |
   | 7 | Signature device, if any | Optional, and inventing one is worse than having none |
   | 8 | Icon set + stroke weight | |
   | 9 | Layout — max-width, gutters, section rhythm | |
   | 10 | Imagery position | "None" is an answer |
   | 11 | Motion — one easing + durations, or none in v1 | |
   | 12 | Which components v1 needs | Drives section 12 |

3. **Generate the tables.** From the project root:

   ```bash
   node .claude/skills/design-md/scripts/build-design.mjs <block> \
     [--palette <path>] [--type <path>] \
     [--ship-colors a,b,…] [--ship-type a,b,…] [--canvas "#fff / #000"] [--all]
   ```

   Markdown to stdout, coverage report to stderr. The defaults ship ten color
   roles and seven type roles; override with `--ship-*` when the interview says
   otherwise.

4. **Assemble the file.** Read `references/anatomy.md` for the section order.
   Paste the contract, write the prose sections from the interview, splice the
   generated tables in at sections 5–7. Write to the block's own folder as
   `DESIGN.md`, beside the component and its two CSS files.

5. **Report** what shipped versus what was deferred, and name the two or three
   deferred roles most likely to be wanted first.

## Mode 2 — check

```bash
node .claude/skills/design-md/scripts/check-design.mjs <design.md> <file…>
```

Reads the ✅ and ◑ rows out of the ledger, then flags every visual decision in
the markup that cannot be traced to one: raw hex, stock Tailwind palette
classes, arbitrary pixel sizes, off-scale type, stock shadows, undeclared radii,
and `var()` references the ledger has not promoted.

Findings are **Gap Requests, not lint errors.** Take each to the user with a
recommendation; do not silently rewrite the markup to dodge the rule, and do not
add a ledger row to make a finding disappear.

## Mode 3 — retrofit

For a DESIGN.md that already exists and was written by hand.

1. Run `--check` against every component the doc governs. The findings are the
   doc's real gaps.
2. Add the **Contract** block at the top if it is missing.
3. Add a **Coverage ledger** and mark every documented role — ✅ for in use,
   ◑ for value-only, ➕ for described but not installed.
4. Reconcile: for each ➕ or ◑, confirm the value genuinely exists in the CSS.
   **A doc that describes a token the build does not ship is worse than no doc**
   — the class silently does nothing and the markup looks correct.
5. Report mismatches to the user. Do not fix a mismatch by editing the CSS
   unless they say so; a doc/code disagreement is a decision, not a typo.

## Constraints

- **Never hand-edit the generated CSS.** Change it through `/color-scale` or
  `/type-scale` and re-run this skill, or the tables start lying.
- **Never invent a token here.** This skill documents; the other two decide.
- **Never write a value twice.** Prose names roles; tables own values.
- **Never edit `src/app/globals.css`.** Same block-scoped premise as the
  siblings.
- **Keep v1 small.** If the ship list passes ~20 tokens, ask whether the extra
  ones are really vocabulary or just available.

## Known strain

The checker cannot see intent. A DESIGN.md that says "roles are overridable —
`tracking-*` on a heading is fine" will still get its `tracking-[0.08em]`
flagged, because the rule is textual and the permission is prose. Treat those as
confirmations rather than defects; two per file is normal, twenty means the doc
and the markup have genuinely diverged.

Radius checking is coarse. It can prove an arbitrary radius wrong and it can
enforce a declared radius of `0`, but it cannot tell `rounded-md` from a
three-value vocabulary without parsing the theme. Named steps pass.

The ledger is only as honest as its last regeneration. `--check` verifies markup
against the doc, not the doc against the CSS — that reconciliation is step 4 of
retrofit, and it is manual on purpose, because every mismatch is a decision.
