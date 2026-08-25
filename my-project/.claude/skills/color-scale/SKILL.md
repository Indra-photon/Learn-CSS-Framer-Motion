---
name: color-scale
description: Generate a block-scoped semantic color palette from a Tailwind color family. Invoke explicitly with /color-scale <color> <block-name> [--status]. Produces 11 semantic roles (Radix's scale structure, Tailwind's colors) as a co-located CSS file, light and dark, contrast-verified.
---

# color-scale

Turns a Tailwind color family into a block-scoped palette of 11 **semantic
roles** — `ui`, `border`, `solid`, `text-low` — instead of raw numeric stops.
The structure is Radix's; every color is a literal Tailwind value.

Explicit invocation only. Do not run this unprompted when building a component.

## Usage

```
/color-scale <family> <block-name> [--neutral <family>] [--status]
```

```
/color-scale blue pricing-card
/color-scale violet hero --status
/color-scale emerald stats --neutral zinc
```

- `family` — any Tailwind color: `blue`, `violet`, `emerald`, `rose`, …
- `block-name` — the block this palette belongs to; becomes the CSS class and
  the filename.
- `--neutral` — override the auto-paired gray. Default picks the Tailwind
  neutral nearest the brand's hue (`slate`, `gray`, `zinc`, `stone`,
  `neutral`).
- `--status` — also emit `danger` / `success` / `warning` from red, green and
  amber. Skip it unless the block actually renders those states.

## Steps

1. **Get the base color.** If the user did not name one, ask which Tailwind
   family to use. Do not guess or improvise a color.

2. **Run the generator.** From the project root:

   ```bash
   node .claude/skills/color-scale/scripts/build-scale.mjs <family> <block-name> [flags]
   ```

   CSS goes to stdout, the contrast report to stderr.

3. **Write the CSS** to `src/components/blocks/<block-name>.css`. If the block
   lives elsewhere, put the file next to the component.

4. **Wire it up.** Add `import "./<block-name>.css";` at the top of the
   component, and put `className="<block-name>"` on its root element — the
   variables are scoped to that class.

5. **Report the contrast results** to the user, including any `note:` line
   about a split `on-solid`. Never present a palette as verified without
   having actually run the check.

6. **Read `references/roles.md`** before writing markup that consumes the
   palette, so the right role gets used for the right job.

## What it generates

11 roles per scale, brand + gray, light and dark:

```
bg-subtle  ui  ui-hover  ui-active  border-subtle  border
border-hover  solid  solid-hover  text-low  text-high
```

Plus `on-solid` — the verified foreground for text on the accent. It is white
for most families and black for bright ones (amber, yellow, lime, sky), and
for those it differs between light and dark mode.

Output references Tailwind's own theme variables:

```css
.pricing-card {
  --brand-solid: var(--color-blue-700);
  --brand-on-solid: #fff;
  --gray-border: var(--color-gray-500);
}
.dark .pricing-card {
  --brand-solid: var(--color-blue-600);
}
```

This survives Tailwind v4's theme-variable tree-shaking — verified: vars
referenced from a co-located CSS file are emitted into the build.

## Consuming it

Tailwind cannot generate `bg-brand-solid` classes from block-scoped variables;
utilities only come from global `@theme`. Use arbitrary values:

```tsx
<button className="bg-[var(--brand-solid)] text-[var(--brand-on-solid)] hover:bg-[var(--brand-solid-hover)]">
```

See `references/roles.md` for the full role table and worked examples.

## Constraints

- **Never edit `src/app/globals.css`.** Palettes are per-block by design; that
  is the whole point of the file living next to the component.
- **Never alias the shadcn tokens** (`--primary`, `--border`, `--muted`). They
  are a separate system and stay untouched.
- **Do not interpolate or invent colors.** Every value is a Tailwind stop. If a
  role feels wrong for a design, change the family or override the role by
  hand in the CSS file — do not synthesize a new value.
- One role is dropped (`bg`) because Tailwind has 11 stops and Radix has 12.
  Page background is white or `--gray-bg-subtle`.

## Known strain

`border-subtle` maps to stop `400` and `border` to `500`. Those are saturated
mid-tones — a "subtle border" in `blue-400` does not read as subtle. This is a
consequence of mapping 1:1 onto Tailwind's ramp, which is bottom-heavy: only
four stops sit above L 0.80, where most of the quiet roles belong. If a block
needs genuinely quiet borders, use the `--gray-*` border roles instead of
`--brand-*`, which is the right call for most layouts anyway.
