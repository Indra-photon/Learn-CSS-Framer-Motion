# Akta — Style Reference

> technical drawing on white paper

**Theme:** light, with a complete dark ramp under the `.dark` class

Akta is a drafting system, not a card system. The canvas is pure white, every surface is a **square-cornered plane** separated by **hairline rules** rather than boxes, and the recurring ornament is a **corner notch** — an L-shaped crop mark borrowed from print registration. There is no border-radius anywhere, no gradient, and no decorative colour: a single blue does all the emphasis work against an eleven-step gray ramp, and it is spent only on action and on data. The UI voice is **uppercase monospace** — labels, nav and buttons are all mono — which is what makes the page read as instrument panel rather than marketing site. Sans is reserved for headlines, figures and body copy.

The structural idea underneath everything: **borders are shadows.** Depth is a layered `box-shadow`; separators are single-edge `inset` shadows. Nothing uses the `border` property except the corner notch itself.

---

## How this ships

Installing `akta-hero-01` writes the design language into **your** `globals.css` — the raw values into `:root` / `.dark`, an `@theme inline` block that names them, and six CSS classes in `@layer components`.

**Almost everything is a Tailwind utility.** Palette, shadows, container, fonts, easing and the entire type scale arrive as `bg-akta-brand-solid`, `shadow-akta-panel`, `max-w-akta`, `text-akta-display` — real utilities in `@layer utilities`, overridable like any other.

The `@theme inline` indirection is what makes dark mode work: the utility resolves `var(--akta-brand-solid)` _at use time_, and `.dark` redefines that variable. A literal baked into `@theme` could not switch.

**There is no root class and no reset.** Drop the block anywhere. Tailwind's Preflight already zeroes margins, inherits link colour and resets buttons.

### What stays as CSS, and why

Six things a utility genuinely cannot express. They live in `@layer components`, which sits _before_ `utilities` in the cascade, so a utility at any call site still wins over them.

| Device                                     | Why it can't be a utility                               |
| ------------------------------------------ | ------------------------------------------------------- |
| `.akta-notch`                              | Pseudo-element carrying a four-layer mask               |
| `.akta-hatch`                              | Repeating gradient with four tunable properties         |
| `.akta-roll`                               | Host + two faces + hover states across three elements   |
| `.akta-tick`                               | Per-index stagger: `calc(var(--akta-i) * 3ms)`          |
| `.akta-plate`                              | Two-layer background with graceful-degradation fallback |
| `[data-akta-enter]` / `[data-akta-reveal]` | `@keyframes` has no utility form                        |

**The rule when you extend the system: values are utilities, mechanism is CSS.** A new colour, size or shadow goes in `@theme`. A new pseudo-element or keyframe goes in `@layer components`. Never write a CSS class that only sets values a utility already covers — that is how the two fight, and the markup silently loses.

### Shipped vs. documented

This block installs **only the tokens its own markup touches** — 123 theme entries and 29 raw values, not the full system. The rest of the language is specified here and can be added in a line when a later section needs it.

| Legend       | Meaning                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅           | Installed. Use the utility directly.                                                                                                                                   |
| ◑ token only | The raw `--akta-*` value is installed, but no utility is generated. Reach it with `var(--akta-…)` in an arbitrary property, or add the `@theme` line to get a utility. |
| ➕ add       | Not installed. Add the lines below before using it — **the class will silently do nothing otherwise.**                                                                 |

Two roles are deliberately ◑: `--akta-brand-border` (consumed by `shadow-akta-ring-brand`) and `--akta-gray-border-subtle` (consumed by structural notches via `[--akta-notch-color:var(--akta-gray-border-subtle)]`). Both are referenced by value, never by utility.

#### Adding a role

Colour — one line in `@theme inline`, plus its two values:

```css
@theme inline {
  --color-akta-gray-solid: var(--akta-gray-solid);
}
:root {
  --akta-gray-solid: oklch(0.373 0.034 259.733);
}
.dark {
  --akta-gray-solid: oklch(0.446 0.03 256.802);
}
```

Type — four lines per step, in `@theme inline` only (type carries no light/dark variant). `heading-48`, `heading-32`, `copy-16` and `copy-14` ship installed; the shape below is what a _new_ role costs:

```css
@theme inline {
  /* section headline — h2 */
  --text-akta-heading-48: 32px;
  --text-akta-heading-48--line-height: 1.12;
  --text-akta-heading-48--letter-spacing: -0.06em;
  --text-akta-heading-48--font-weight: 400;
  --text-akta-heading-48-sm: 40px;
  --text-akta-heading-48-sm--line-height: 1.1;
  --text-akta-heading-48-sm--letter-spacing: -0.06em;
  --text-akta-heading-48-sm--font-weight: 400;
  --text-akta-heading-48-lg: 48px;
  --text-akta-heading-48-lg--line-height: 1.08;
  --text-akta-heading-48-lg--letter-spacing: -0.06em;
  --text-akta-heading-48-lg--font-weight: 400;

  /* body copy */
  --text-akta-copy-16: 15px;
  --text-akta-copy-16--line-height: 1.6;
  --text-akta-copy-16--letter-spacing: -0.01em;
  --text-akta-copy-16--font-weight: 400;
  --text-akta-copy-16-sm: 16px;
  --text-akta-copy-16-sm--line-height: 1.625;
  --text-akta-copy-16-sm--letter-spacing: -0.01em;
  --text-akta-copy-16-sm--font-weight: 400;
}
```

`heading-32` and `copy-14` follow the same shape — take their numbers from the **Type Scale** table below, which lists every role at full precision whether shipped or not.

### Assumptions

| Assumption                                                     | If it isn't true                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tailwind v4**                                                | The theme namespaces and the markup are v4-only.                                                                                                                                                                                                                          |
| Preflight enabled (default)                                    | Element margins and link colours return; add `m-0` / `text-*` where it shows.                                                                                                                                                                                             |
| Dark mode toggles a **`.dark`** class                          | The dark ramp never activates. For `[data-theme="dark"]`, duplicate the `.dark { … }` block.                                                                                                                                                                              |
| Geist loaded as `--font-geist-sans` / `--font-geist-mono`      | **Optional.** Falls back to `ui-sans-serif` / `ui-monospace`.                                                                                                                                                                                                             |
| `public/paper-image/AIHero01.png` exists                       | **Optional.** The plate is a CSS background layer; a missing file falls through to the hatch.                                                                                                                                                                             |
| `akta.css` is imported from the **CSS entry**, not a component | Tailwind builds its theme from the entry graph only. An `@theme` in a file imported by a `.tsx` registers nothing, and **every `akta-*` utility silently generates no CSS** — no error, no warning, just unstyled markup. Import it from `globals.css` and keep it there. |

> **Note:** Tailwind scans `.md` and `.json` for class candidates, and this file contains theme-variable names. If you see dead utilities like `.text-akta-display--line-height` in your build, add `@source not "…/*.md";` to your CSS entry.

---

## Tokens — Colors

Two ramps, eleven semantic roles each, as **literal oklch** rather than references to Tailwind's palette — so the block looks identical in a project that customised its own blue. Every role generates `bg-`, `text-`, `border-`, `outline-`, `fill-` and `ring-` utilities.

**Always use the role, never a raw value.** The hex columns are for reference and for talking to designers; writing them into markup breaks dark mode.

### Brand — blue

| Name                | Light     | Dark      | Token                        | Utility                           | Role                                                  | Shipped      |
| ------------------- | --------- | --------- | ---------------------------- | --------------------------------- | ----------------------------------------------------- | ------------ |
| Brand BG Subtle     | `#eff6ff` | `#162456` | `--akta-brand-bg-subtle`     | `bg-akta-brand-bg-subtle`         | Tinted page areas, callout grounds                    | ➕ add       |
| Brand UI            | `#dbeafe` | `#1c398e` | `--akta-brand-ui`            | `bg-akta-brand-ui`                | Icon tile fills, chip fills                           | ✅           |
| Brand UI Hover      | `#bedbff` | `#193cb8` | `--akta-brand-ui-hover`      | `bg-akta-brand-ui-hover`          | Hover on a tinted chip                                | ➕ add       |
| Brand UI Active     | `#8ec5ff` | `#1447e6` | `--akta-brand-ui-active`     | `bg-akta-brand-ui-active`         | Pressed tinted chip                                   | ➕ add       |
| Brand Border Subtle | `#51a2ff` | `#1447e6` | `--akta-brand-border-subtle` | `border-akta-brand-border-subtle` | Faint brand edge                                      | ➕ add       |
| Brand Border        | `#2b7fff` | `#155dfc` | `--akta-brand-border`        | —                                 | Source for `shadow-akta-ring-brand`                   | ◑ token only |
| Brand Border Hover  | `#155dfc` | `#2b7fff` | `--akta-brand-border-hover`  | `outline-akta-brand-border-hover` | **Focus rings on brand controls**                     | ✅           |
| Brand Solid         | `#1447e6` | `#155dfc` | `--akta-brand-solid`         | `bg-akta-brand-solid`             | **Primary buttons, interactive notches, signal data** | ✅           |
| Brand Solid Hover   | `#193cb8` | `#2b7fff` | `--akta-brand-solid-hover`   | `hover:bg-akta-brand-solid-hover` | Primary button hover                                  | ✅           |
| Brand Text Low      | `#1c398e` | `#51a2ff` | `--akta-brand-text-low`      | `text-akta-brand-text-low`        | Brand-tinted labels, icons on tinted fills            | ✅           |
| Brand Text High     | `#162456` | `#dbeafe` | `--akta-brand-text-high`     | `text-akta-brand-text-high`       | Text on brand chips                                   | ➕ add       |
| Brand On Solid      | `#ffffff` | `#ffffff` | `--akta-brand-on-solid`      | `text-akta-brand-on-solid`        | Text on `bg-akta-brand-solid`                         | ✅           |

### Gray

| Name               | Light     | Dark      | Token                       | Utility                          | Role                                                     | Shipped      |
| ------------------ | --------- | --------- | --------------------------- | -------------------------------- | -------------------------------------------------------- | ------------ |
| Gray BG Subtle     | `#f9fafb` | `#030712` | `--akta-gray-bg-subtle`     | `bg-akta-gray-bg-subtle`         | Panel surfaces, chips lifted off a band                  | ✅           |
| Gray UI            | `#f3f4f6` | `#101828` | `--akta-gray-ui`            | `bg-akta-gray-ui`                | Card fills, panel title bars, secondary buttons          | ✅           |
| Gray UI Hover      | `#e5e7eb` | `#1e2939` | `--akta-gray-ui-hover`      | `hover:bg-akta-gray-ui-hover`    | Secondary button hover, hatch stroke                     | ✅           |
| Gray UI Active     | `#d1d5dc` | `#364153` | `--akta-gray-ui-active`     | `active:bg-akta-gray-ui-active`  | Pressed state, inert chart bars                          | ✅           |
| Gray Border Subtle | `#99a1af` | `#364153` | `--akta-gray-border-subtle` | `[--akta-notch-color:…]`         | **Structural notches**                                   | ◑ token only |
| Gray Border        | `#6a7282` | `#4a5565` | `--akta-gray-border`        | `text-akta-gray-border`          | Inert dots, low-contrast marks _(provided, unexercised)_ | ➕ add       |
| Gray Border Hover  | `#4a5565` | `#6a7282` | `--akta-gray-border-hover`  | `outline-akta-gray-border-hover` | Focus rings on neutral controls                          | ✅           |
| Gray Solid         | `#364153` | `#4a5565` | `--akta-gray-solid`         | `bg-akta-gray-solid`             | —                                                        | ➕ add       |
| Gray Solid Hover   | `#1e2939` | `#6a7282` | `--akta-gray-solid-hover`   | —                                | —                                                        | ➕ add       |
| Gray Text Low      | `#101828` | `#99a1af` | `--akta-gray-text-low`      | `text-akta-gray-text-low`        | Secondary text, mono labels                              | ✅           |
| Gray Text High     | `#030712` | `#f3f4f6` | `--akta-gray-text-high`     | `text-akta-gray-text-high`       | Primary text, headlines, noise ticks                     | ✅           |
| Gray On Solid      | `#ffffff` | `#ffffff` | `--akta-gray-on-solid`      | `text-akta-gray-on-solid`        | Text on a solid gray                                     | ➕ add       |
| **Canvas**         | `#ffffff` | `#000000` | `--akta-canvas`             | `bg-akta-canvas`                 | **Page ground**                                          | ✅           |

Canvas is deliberately one step past Gray BG Subtle, so panels separate from the page without a border.

### The blue budget

Blue is scarce on purpose. Six permitted uses, and no others:

1. Primary button fills
2. Corner notches on **interactive** elements and the hero panel
3. Signal data — the retained ticks, the `197` figure
4. Figures that are the point of their sentence — the `5,000+`, the `.pro` in the wordmark
5. Icons sitting on an `akta-brand-ui` tile
6. A bare icon or status line labelling _data as resolved_ — the filter glyph, "Positive trend detected", "+ 65 more data points"
7. The solid square that opens an eyebrow chip or announcement — a `size-2` marker at label scale, a `size-7` square at band scale. One per section, never more.

**Structural notches are `--akta-gray-border-subtle`**, never blue — logo wall cells, band junctions, the secondary button. If blue appears more than a handful of times per viewport, the primary action stops reading as primary.

---

## Tokens — Typography

### Geist Sans — headlines, figures, body copy · `--akta-font-sans` · `font-akta-sans`

- **Substitute:** `ui-sans-serif, system-ui, sans-serif` (automatic fallback — Geist is optional)
- **Weights:** 400, 500, 600
- **Sizes:** 13, 15, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96
- **Letter spacing:** −0.06em at the 40px display step and through the heading roles, opening to **−0.03em once display passes 56px**, easing to −0.01em at copy. Tracking is expressed in `em`, so one value is correct at every step of a responsive ramp. The display ramp is the one place the value changes: at 56px and above, −6% closes the counters, so the large steps hold −0.03em rather than inheriting the base.
- **Weight falls as size rises:** 600 at 20px, 500 at 32px, 400 at 48px and above. Large text needs less weight to carry.

### Geist Mono — all UI chrome · `--akta-font-mono` · `font-akta-mono`

- **Substitute:** `ui-monospace, SFMono-Regular, Menlo, monospace`
- **Weights:** 400, 500
- **Sizes:** 11, 12, 13, 14
- **Letter spacing:** positive — `0.04em`–`0.06em`. Uppercase mono at these sizes needs air, and the tracking is what stops labels reading as compressed.
- **Always uppercase in use.** `text-transform` is not part of a `text-*` utility, so add `uppercase` at the call site.

### Type Scale

Ten roles. Each utility sets **size, line-height, letter-spacing and weight in one class**. Mobile-first: the bare role is the small step and responsive variants step it up.

| Role              | Step | Size | Line Height  | Tracking | Weight | Utility                      |
| ----------------- | ---- | ---- | ------------ | -------- | ------ | ---------------------------- |
| **display**       | base | 40px | 44px (1.1)   | −0.06em  | 400    | `text-akta-display`          |
|                   | sm   | 56px | 56px (1.0)   | −0.03em  | 400    | `sm:text-akta-display-sm`    |
|                   | md   | 64px | 64px (1.0)   | −0.03em  | 400    | `md:text-akta-display-md`    |
|                   | lg   | 80px | 80px (1.0)   | −0.03em  | 400    | `lg:text-akta-display-lg`    |
|                   | xl   | 96px | 96px (1.0)   | −0.03em  | 400    | `xl:text-akta-display-xl`    |
| **heading-48**    | base | 32px | 36px (1.12)  | −0.06em  | 400    | `text-akta-heading-48`       |
|                   | sm   | 40px | 44px (1.1)   | −0.06em  | 400    | `sm:text-akta-heading-48-sm` |
|                   | lg   | 48px | 52px (1.08)  | −0.06em  | 400    | `lg:text-akta-heading-48-lg` |
| **heading-32**    | base | 24px | 30px (1.25)  | −0.05em  | 500    | `text-akta-heading-32`       |
|                   | sm   | 28px | 34px (1.21)  | −0.05em  | 500    | `sm:text-akta-heading-32-sm` |
|                   | lg   | 32px | 38px (1.19)  | −0.05em  | 500    | `lg:text-akta-heading-32-lg` |
| **heading-24**    | base | 20px | 28px (1.4)   | −0.04em  | 600    | `text-akta-heading-24`       |
|                   | sm   | 24px | 32px (1.33)  | −0.04em  | 600    | `sm:text-akta-heading-24-sm` |
| **heading-20**    | base | 18px | 24px (1.33)  | −0.02em  | 600    | `text-akta-heading-20`       |
|                   | sm   | 20px | 26px (1.3)   | −0.02em  | 600    | `sm:text-akta-heading-20-sm` |
| **copy-16**       | base | 15px | 24px (1.6)   | −0.01em  | 400    | `text-akta-copy-16`          |
|                   | sm   | 16px | 26px (1.625) | −0.01em  | 400    | `sm:text-akta-copy-16-sm`    |
| **copy-14**       | base | 13px | 20px (1.54)  | −0.01em  | 400    | `text-akta-copy-14`          |
|                   | sm   | 14px | 22px (1.57)  | −0.01em  | 400    | `sm:text-akta-copy-14-sm`    |
| **label-12-mono** | base | 12px | 16px (1.33)  | 0        | 400    | `text-akta-label-12-mono`    |
| **nav**           | base | 12px | 20px (1.667) | 0.06em   | 400    | `text-akta-nav`              |
|                   | sm   | 13px | 20px (1.538) | 0.06em   | 400    | `sm:text-akta-nav-sm`        |
| **cta**           | base | 11px | 20px (1.82)  | 0.04em   | 500    | `text-akta-cta`              |
|                   | sm   | 14px | 20px (1.43)  | 0.06em   | 500    | `sm:text-akta-cta-sm`        |

### When to use which

| Role              | Use for                             | Copy this                                                                                                           |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **display**       | Hero `h1`, once per page            | `text-akta-display sm:text-akta-display-sm md:text-akta-display-md lg:text-akta-display-lg xl:text-akta-display-xl` |
| **heading-48**    | Section `h2`                        | `text-akta-heading-48 sm:text-akta-heading-48-sm lg:text-akta-heading-48-lg`                                        |
| **heading-32**    | Sub-section `h3`                    | `text-akta-heading-32 sm:text-akta-heading-32-sm lg:text-akta-heading-32-lg`                                        |
| **heading-24**    | Panel figures, stat values          | `text-akta-heading-24 sm:text-akta-heading-24-sm tabular-nums`                                                      |
| **heading-20**    | Wordmark, card titles               | `text-akta-heading-20 sm:text-akta-heading-20-sm`                                                                   |
| **copy-16**       | Body paragraphs                     | `text-akta-copy-16 sm:text-akta-copy-16-sm max-w-[65ch]`                                                            |
| **copy-14**       | Dense body, captions under figures  | `text-akta-copy-14 sm:text-akta-copy-14-sm`                                                                         |
| **label-12-mono** | Every UI label, eyebrows, data keys | `font-akta-mono text-akta-label-12-mono uppercase`                                                                  |
| **nav**           | Nav links, microcopy, taglines      | `font-akta-mono text-akta-nav uppercase sm:text-akta-nav-sm`                                                        |
| **cta**           | All buttons                         | `font-akta-mono text-akta-cta uppercase sm:text-akta-cta-sm`                                                        |

**Family is inherited.** Put `font-akta-sans` once on the section root; only the three mono roles add `font-akta-mono` at the call site.

**Roles are overridable.** They compile to `letter-spacing: var(--tw-tracking, -0.06em)` and the same pattern for leading and weight — so `tracking-tight`, `leading-none` or `font-bold` behaves normally. That is how the logo wall gives KPMG and JLL their own letterforms.

**One role per element.** `text-akta-copy-14 text-akta-nav` does not compose — both set every property and the later one in the stylesheet wins outright.

---

## Tokens — Spacing & Shapes

**Base unit:** 4px · **Density:** comfortable at section scale, compact at control scale

### Spacing Scale

| Name  | Value    | Use                                                |
| ----- | -------- | -------------------------------------------------- |
| 1     | 4px      | Icon-to-label gap in tight rows                    |
| 2     | 8px      | Chip padding, gap between adjacent controls        |
| 2.5–3 | 10–12px  | Button horizontal padding (mobile), card inner gap |
| 4     | 16px     | Card padding, gutter (mobile), panel body padding  |
| 5     | 20px     | Panel cell padding                                 |
| 6     | 24px     | Gutter (tablet), logo cell padding                 |
| 8–10  | 32–40px  | Gutter (desktop), band padding                     |
| 12–28 | 48–112px | Section rhythm                                     |

### Border Radius

| Element        | Value |
| -------------- | ----- |
| **Everything** | **0** |

No exceptions. Square corners plus corner notches _are_ the identity — a rounded corner would take the ornament's job.

### Shadows

| Name         | Light                                                                                       | Dark                                                              | Token                        | Utility                    | Shipped |
| ------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------- | -------------------------- | ------- |
| Border       | `0 0 0 1px rgb(0 0 0/.06), 0 1px 2px -1px rgb(0 0 0/.06), 0 2px 4px rgb(0 0 0/.04)`         | `0 0 0 1px rgb(255 255 255/.08)`                                  | `--akta-shadow-border`       | `shadow-akta-border`       | ✅      |
| Border Hover | same at `.08/.08/.06`                                                                       | `0 0 0 1px rgb(255 255 255/.13)`                                  | `--akta-shadow-border-hover` | `shadow-akta-border-hover` | ➕ add  |
| Panel        | `0 0 0 1px rgb(0 0 0/.06), 0 8px 16px -6px rgb(0 0 0/.08), 0 24px 48px -12px rgb(0 0 0/.1)` | `0 0 0 1px rgb(255 255 255/.08), 0 24px 48px -12px rgb(0 0 0/.6)` | `--akta-shadow-panel`        | `shadow-akta-panel`        | ✅      |
| Ring Brand   | `0 0 0 1px` brand-border @ 45%                                                              | @ 60%                                                             | `--akta-shadow-ring-brand`   | `shadow-akta-ring-brand`   | ✅      |

### Rules — separators

| Name         | Value (light)                     | Token                  | Utility                     |
| ------------ | --------------------------------- | ---------------------- | --------------------------- | ------ |
| Top          | `inset 0 1px 0 0 rgb(0 0 0/.08)`  | `--akta-rule-t`        | `shadow-akta-rule-t`        | ✅     |
| Bottom       | `inset 0 -1px 0 0 rgb(0 0 0/.08)` | `--akta-rule-b`        | `shadow-akta-rule-b`        | ✅     |
| Left / Right | `inset ±1px 0 0 0`                | `--akta-rule-l` / `-r` | `shadow-akta-rule-l` / `-r` | ➕ add |
| X / Y        | both sides / both ends            | `--akta-rule-x` / `-y` | `shadow-akta-rule-x` / `-y` | ➕ add |
| Cell         | right **+** bottom in one value   | `--akta-rule-cell`     | `shadow-akta-rule-cell`     | ✅     |

Dark mode uses `rgb(255 255 255/.1)` for all rules.

`shadow-akta-rule-cell` is what a wrapping grid uses — every cell carries it, so rows and columns separate at any column count and the outer edges land on the container rail where they coincide. **Do not** use `shadow-akta-rule-r` + `last:shadow-none`; that breaks the moment the grid reflows to a different column count.

Two consequences of shadows-as-borders:

- **Inset shadows paint below child backgrounds.** A full-width child with an opaque background covers a parent's rails — which is why the logo wall carries `bg-akta-gray-bg-subtle z-10`.
- **Separators occupy no space.** Converting a `border` to a rule shifts adjacent content by 1px per edge.

### Easing

| Name | Value                                      | Token         | Utility     |
| ---- | ------------------------------------------ | ------------- | ----------- |
| Akta | `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) | `--akta-ease` | `ease-akta` |

One curve for the whole system. Springs use `{ type: "spring", duration: 0.5, bounce: 0 }` — bounce is always `0`.

---

## Layout

| Property           | Value          | Utility                                     |
| ------------------ | -------------- | ------------------------------------------- |
| Page max-width     | 1440px         | `max-w-akta`                                |
| Gutters            | 16 / 24 / 40px | `px-4 sm:px-6 lg:px-10`                     |
| Section rhythm     | 48 → 112px     | `py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28` |
| Stack gap          | 48 → 96px      | `gap-12 sm:gap-16 lg:gap-20 xl:gap-24`      |
| Card padding       | 16px           | `p-4`                                       |
| Panel cell padding | 16–20px        | `px-4 py-3 sm:px-5 sm:py-4`                 |
| Element gap        | 8–12px         | `gap-2` / `gap-3`                           |
| Body measure       | 65ch           | `max-w-[65ch]`                              |

**Padding and gaps only ever grow with the viewport** — never step down at a larger breakpoint.

**Widths come from the scale, not from pixels.** `max-w-2xl md:max-w-4xl lg:max-w-5xl` for a stage, `w-56` / `w-64` for cards. No `w-[620px]`.

### Z-index

| Value | Utility | Use                                             |
| ----- | ------- | ----------------------------------------------- |
| −1    | `-z-10` | Background plates and textures behind content   |
| 10    | `z-10`  | Opaque bands that must clip a neighbour's bleed |
| 20    | `z-20`  | Cards overlapping a panel                       |

### Icon sizes

| Size | Utility    | Use                           |
| ---- | ---------- | ----------------------------- |
| 14px | `size-3.5` | Inline with nav or label text |
| 16px | `size-4`   | Inside buttons; inside a tile |
| 28px | `size-7`   | The tile itself               |

Stroke weight 1.5–2px. **Hugeicons is the set — reach for `@hugeicons/react` first.** Tabler appears in the hero for marks Hugeicons has no equivalent of; don't add new Tabler usage without that reason, since two sets means two silhouettes at the same size.

### Full-bleed bands

A band whose rules must cross the whole viewport is a **sibling of the grid container**, not a child:

```html
<div class="shadow-akta-rule-y relative">
  <!-- rules run edge to edge -->
  <div class="max-w-akta mx-auto w-full …"><!-- content stays on grid --></div>
</div>
```

To bleed a _child_ out to the rails from inside a padded column, centre it on the viewport: `absolute left-1/2 w-screen -translate-x-1/2` plus a `max-w-akta` cap. Stage, grid and viewport share a centre line, so this lands on the rails at every width. `w-screen` includes the scrollbar gutter — clip it with `overflow-hidden` on an ancestor.

---

## Surfaces

| Level | Name             | Light     | Dark      | Purpose                                                     |
| ----- | ---------------- | --------- | --------- | ----------------------------------------------------------- |
| 0     | Canvas           | `#ffffff` | `#000000` | Page ground, broadest layer                                 |
| 1     | Panel / Chip     | `#f9fafb` | `#030712` | Panel bodies, chips lifted off a hatch band                 |
| 2     | Card / Title bar | `#f3f4f6` | `#101828` | Flanking cards, panel title bars, secondary buttons         |
| 3     | Solid            | `#1447e6` | `#155dfc` | Primary buttons, brand squares — the only saturated surface |

The stack runs **light-to-dark in light mode and dark-to-light in dark mode**, but the _relationship_ is constant: each level is one step away from its parent, and separation never needs a border. A card on a panel on the canvas is three tones, no lines.

---

## Elevation

- **Panel / flanking card:** `shadow-akta-panel` — 1px ring + 8px lift + 24px ambient. The only real elevation in the system.
- **Chip / resting surface:** `shadow-akta-border` — 1px ring + 1px lift + 2px ambient. Reads as "sitting on" rather than "floating above".
- **Button (filled):** none. Relies on tonal contrast and the notch, not shadow.
- **Icon tile:** `shadow-akta-ring-brand` — a 1px ring in the brand hue at 45% (60% in dark), no offset.
- **Separators:** `shadow-akta-rule-*`. Not elevation — these are hairlines that cost no layout space.

In dark mode the three-layer stacks collapse to a single white ring, because layered depth is invisible on a dark ground.

---

## Signature Devices

The six CSS classes. Everything else is a utility.

### Corner notch — `.akta-notch`

L-shaped crop marks at an element's corners. One pseudo-element draws a **full border**, then a **four-layer mask** keeps only the corners. No wrapper markup, no four extra spans, and the brackets always track the element's real size.

| Property              | Default              | Purpose                                                  |
| --------------------- | -------------------- | -------------------------------------------------------- |
| `--akta-notch-arm`    | `12px`               | length of each leg of the L                              |
| `--akta-notch-weight` | `1.5px`              | stroke width (`1px` on `.akta-notch-reveal` below sm)    |
| `--akta-notch-color`  | `--akta-brand-solid` | stroke colour                                            |
| `--akta-notch-inset`  | `6px`                | distance outside the box; negative tucks inward          |
| `--akta-notch-rest`   | `6px`                | resting offset for `.akta-notch-reveal` (`4px` below sm) |

Tune with Tailwind arbitrary properties: `[--akta-notch-arm:22px] lg:[--akta-notch-arm:10px]`.

| Variant                | Corners                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| `.akta-notch`          | all four                                                                   |
| `.akta-notch-top`      | top pair                                                                   |
| `.akta-notch-bottom`   | bottom pair                                                                |
| `.akta-notch-diagonal` | top-left + bottom-right — reads as a registration mark rather than a frame |
| `.akta-notch-reveal`   | animates flush on hover / focus-visible                                    |

All variants are modifiers — pair them with `.akta-notch`.

**`overflow-hidden` on a notched element shears the brackets off.** They live outside the box. Put clipping on an inner wrapper.

**Flush notches mark junctions.** `[--akta-notch-inset:0px] [--akta-notch-arm:0px] lg:[--akta-notch-arm:10px]` puts brackets exactly on the corners — used where vertical rails meet full-bleed rules, and on every logo wall cell. Arms collapse to zero below `lg` because the rails are `lg:`-only.

### Hatch — `.akta-hatch`

A repeating 45° rule marking a band as structural rather than content-bearing — the drafting paper between sections. Paints `background-image` only, so the element keeps its own background colour.

| Property              | Default              |
| --------------------- | -------------------- |
| `--akta-hatch-color`  | `currentColor` @ 12% |
| `--akta-hatch-weight` | `1px`                |
| `--akta-hatch-gap`    | `7px`                |
| `--akta-hatch-angle`  | `45deg`              |

Variants: `.akta-hatch-reverse` (mirrored — pairs across a seam), `.akta-hatch-dense` (4px gap).

Content laid on a hatch needs an **opaque box** behind it or it becomes unreadable.

### Rolling label — `.akta-roll`

A label that re-states itself on hover: the visible face rolls up and out while an identical copy arrives from below. `.akta-roll-host` on the interactive element, `.akta-roll` on the label wrapper.

```html
<a class="akta-roll-host akta-notch akta-notch-reveal">
  <span class="akta-roll">
    <span class="akta-roll-face">Try for free</span>
    <span class="akta-roll-face akta-roll-face-next" aria-hidden="true"
      >Try for free</span
    >
  </span>
</a>
```

The clip lives on the label wrapper, never the button — the button is a notch and `overflow: hidden` would shear its brackets.

`.akta-roll-diagonal` sends the face out through the top-right corner and brings its replacement from the bottom-left, for arrows that should leave along the direction they point. In that variant **both** faces are absolutely positioned, so a 100% translate is a full box width rather than a glyph width.

The duplicate is always `aria-hidden` so the accessible name stays single.

### Background plate — `.akta-plate`

A photographic mat for a cluster of panels, painted as a **CSS background layer** rather than an `<img>`, with the hatch as a second layer beneath. A missing or 404'd image simply doesn't paint and the hatch shows through, so the plate can never render broken.

```jsx
<div
  className="akta-plate absolute inset-0 -z-10 overflow-hidden"
  style={{ "--akta-plate-image": "url(/paper-image/AIHero01.png)" }}
/>
```

Leave `--akta-plate-image` unset for a pure hatch plate. The class caps itself at 1440px, so it can carry `w-screen` for a full-bleed mat.

### Signal ticks — `.akta-tick`

A field of ticks that resolves from noise into signal, demonstrating a filter rather than describing one.

| State | Selector                     | Effect                                      |
| ----- | ---------------------------- | ------------------------------------------- |
| Rest  | `.akta-tick-noise`           | 16% opacity — the filtered end state        |
| Armed | `[data-akta-signal="armed"]` | full opacity — the raw field                |
| Run   | `[data-akta-signal="run"]`   | animates back down, staggered by `--akta-i` |

Resting state is the _filtered_ field, so a no-JS or reduced-motion visitor meets the truthful end state rather than a field that never resolves.

### Entrance — `[data-akta-enter]` / `[data-akta-reveal]`

See Motion below.

---

## Components

### Primary Button

**Role:** High-emphasis action (Try for free, Get started)

Background `--akta-brand-solid`, text `--akta-brand-on-solid`, no border, **radius 0**, padding 12px 24px (`px-6 py-3.5`), font mono 14px/500 uppercase at 0.06em. Height ≈ 48px. Classes: `akta-roll-host akta-notch akta-notch-reveal`. Hover moves to `--akta-brand-solid-hover`, the brackets pull flush from 6px to 0, and the label rolls. Focus ring at `outline-offset-[10px]` to clear the brackets. No shadow — the notch and the tonal contrast do the work.

### Secondary Button

**Role:** Low-emphasis paired action (Talk to an engineer)

Identical geometry on `--akta-gray-ui` with `[--akta-notch-color:var(--akta-gray-border-subtle)]` and `active:bg-akta-gray-ui-active`. **Grey brackets are the only thing separating it from primary** — same shape, same type, same size. Keep it that way.

### Announcement Band

**Role:** Full-width notice above the hero

Full-bleed wrapper with `shadow-akta-rule-y` so the rules cross the viewport; hatch fill on the grid; flush notches at the four junctions where the rails meet the rules. Inside, a solid `--akta-gray-bg-subtle` chip with `shadow-akta-border`, carrying nav-role text plus a `size-7` `--akta-brand-solid` square with a diagonal-rolling arrow.

### Panel

**Role:** The centrepiece that demonstrates the product

`bg-akta-gray-bg-subtle shadow-akta-panel`, `akta-notch akta-notch-diagonal` with `[--akta-notch-arm:22px] [--akta-notch-inset:10px]`, `w-full lg:max-w-2xl`. Title bar in `--akta-gray-ui` with a `shadow-akta-rule-b` baseline, label left and context right, both label-12-mono uppercase. Body carries the graphic. Footer is a two-cell grid split by `shadow-akta-rule-r`, figures in heading-24 with `tabular-nums`.

### Flanking Card

**Role:** Secondary evidence beside the panel

`w-56`–`w-64`, `bg-akta-gray-ui p-4 shadow-akta-panel`. **Stacks in flow below `lg`** (`order-2` / `order-3`) and becomes `lg:absolute` overlapping the panel — never hidden, because on mobile it carries content the panel doesn't. Always: `size-7` icon tile (`bg-akta-brand-ui shadow-akta-ring-brand`) beside an uppercase mono title, then content.

### Logo Wall

**Role:** Social proof strip closing the hero

Full-bleed, opaque, `z-10`, `shadow-akta-rule-t`. Grid of `2 / sm:3 / lg:6` cells, each `shadow-akta-rule-cell` with a flush gray notch, `px-4 py-6 sm:px-6 sm:py-8`. Closed by a hatch seam band. Cells that animate are `aria-hidden` with one `sr-only` sentence naming every customer.

### Data List

**Role:** Canonical record, key-value readout

`<dl>` in label-12-mono, `flex justify-between` rows with `space-y-1.5`. Keys in `--akta-gray-text-low`, values in `--akta-gray-text-high` with `tabular-nums`. Footer line separated by `shadow-akta-rule-t` + `pt-3`.

### Data Bar — ranked list

**Role:** A figure compared against its peers — benchmark tables, share-of-total readouts

A row is a label line plus a bar, never a bar with a number floating beside it. Label in `font-akta-mono text-akta-label-12-mono uppercase text-akta-gray-text-low`, figure right-aligned in the same role with `tabular-nums`, then a full-width track beneath: `h-1.5 bg-akta-gray-ui-hover` carrying a fill sized by inline `width` percentage. Rows `space-y-3`, the two lines inside a row `space-y-1.5`.

**The fill colour is the whole argument.** Peer rows fill `bg-akta-gray-ui-active`; the one row the section is about fills `bg-akta-brand-solid` and carries its figure in `text-akta-brand-solid` with the label lifted to `text-akta-gray-text-high`. Exactly one brand row per list — if two rows are blue, neither reads as the claim.

**Width comes from the data.** Normalise every value against the largest in its own column and set `width` from that ratio, so bar length is the figure rather than an eyeballed guess. Where lower is better, the winning row is legitimately the shortest bar — don't invert it to make the brand row longest. Track and fill are square, like everything else.

### Metric Cell — bento grid

**Role:** A row of parallel claims, each with its own graphic — the section that follows a hero

A grid of `1 / sm:2 / lg:4` cells on the `max-w-akta` rail, wrapped in a full-bleed `shadow-akta-rule-y` band so the top and bottom rules cross the viewport. Every cell carries `shadow-akta-rule-cell` and a flush structural notch (`akta-notch [--akta-notch-arm:0px] [--akta-notch-inset:0px] [--akta-notch-weight:1px] [--akta-notch-color:var(--akta-gray-border-subtle)] lg:[--akta-notch-arm:10px]`), so the grid separates correctly at every column count.

Each cell is three bands split by `shadow-akta-rule-t`, in this order: **graphic**, **title**, **caption**. The graphic sits at the top and is the cell's evidence — a data bar list, not an illustration. The title band pairs a `size-7` icon tile (`bg-akta-brand-ui shadow-akta-ring-brand`, 16px Hugeicon inside) with an `h3` in `text-akta-heading-20 sm:text-akta-heading-20-sm`, plus an optional mono qualifier in parentheses. The caption band carries one sentence in `text-akta-copy-14 sm:text-akta-copy-14-sm text-akta-gray-text-low`.

Push the title band down with `mt-auto` so captions align across cells whose graphics differ in height — the rules must line up row to row or the grid stops reading as a grid.

### Tagline Row

**Role:** Three-or-four short claims under a headline

Each phrase in nav-role mono uppercase `text-akta-gray-text-low`, `py-1 sm:px-3 lg:px-4`, with every item after the first carrying `sm:shadow-akta-rule-l`. **Separate with a rule, never with a `|` character** — a pipe is a glyph, so it brings its own font metrics and sits on a different line-height from the labels either side, which throws the row's vertical centring. The rule is a hairline the exact height of the cell and costs no layout space.

Stacks with `flex-col` below `sm`, where the phrases cannot share a row and a leading rule would dangle at the start of a wrapped line.

### Nav Bar

**Role:** Top navigation

Three cells in one row separated by rules, not padding: wordmark cell (`lg:shadow-akta-rule-r`), centred mono nav (`hidden lg:flex`, `gap-9`), CTA cell (`lg:shadow-akta-rule-l`). The nav reads as a grid because the dividers do the work.

### Stat / Figure

**Role:** A number that is the point of its sentence

Label in label-12-mono uppercase `--akta-gray-text-low`; value in heading-24 `tabular-nums`. Gray for context figures, `--akta-brand-solid` for the figure the section is actually about. No card chrome — typographic scale alone establishes the metric.

---

## Motion

| Motion         | Property                                         | Duration                | Trigger                               |
| -------------- | ------------------------------------------------ | ----------------------- | ------------------------------------- |
| Entrance       | `opacity` + `translateY(12px)`                   | 0.6s, delays 0.05→0.41s | Page load, `data-akta-enter="1".."6"` |
| Reveal         | same keyframe                                    | scroll-linked           | In view, `data-akta-reveal`           |
| Notch reveal   | `inset` on `::before`                            | 0.3s                    | hover / focus-visible                 |
| Label roll     | `transform`                                      | 0.3s                    | hover / focus-visible                 |
| Signal denoise | `opacity`, staggered `calc(var(--akta-i) * 3ms)` | 0.45s                   | scroll into view, once                |
| Logo flip      | spring `y`                                       | 0.5s                    | interval, gated on in-view            |

### `data-akta-enter` vs `data-akta-reveal`

**`data-akta-enter="1".."6"`** fires on page load. Use it **only above the fold** — it finishes before anyone scrolls. Steps must be unique and in reading order; duplicated steps make the sequence read as interleaved pairs.

**`data-akta-reveal`** is scroll-linked via `animation-timeline: view()`. Use it for **everything below the fold**, which is every section after the hero. No JavaScript, no observer — a section using it can stay a server component:

```jsx
<div data-akta-reveal>…</div>
```

It sits inside `@supports (animation-timeline: view())`. Where that isn't supported the rule doesn't match and the element renders plain and fully visible — the correct resting state, not a degraded one. Don't add a JS fallback; there is nothing to fall back to.

### Rules

- **Every animation sits inside `@media (prefers-reduced-motion: no-preference)`**, and the resting state outside it must be the meaningful one.
- **Transitions belong on the pseudo-element where possible.** A `transition` on the host competes with `transition-colors` — only one can own the `transition` property.
- **Don't animate the notch with `transform`.** Pushing four corners outward needs a `scale`, and scale is proportional: on a 200×48 button that is ~8px sideways against ~2px vertically. It reads lopsided. Animate `inset` for uniform travel.
- **Derive generated geometry deterministically.** The tick field hashes its index rather than calling `Math.random()`, so server and client markup match.

---

## Accessibility

- Focus rings are **not** replaced by notches. Keep `focus-visible:outline-2` with `outline-akta-brand-border-hover` or `outline-akta-gray-border-hover`; a 1px bracket is too weak to be the only indicator.
- **Outline offset must clear the brackets:** `outline-offset` ≥ `--akta-notch-rest` + `--akta-notch-weight`. On standard buttons that is 6 + 1.5, so `outline-offset-[10px]`. With no notch, `outline-offset-4`.
- Decorative duplicates (`akta-roll-face-next`), schematic graphics (the tick field) and animating wordmarks are `aria-hidden`, with an `sr-only` sentence carrying any claim the graphic makes.
- If an element shows an arrow or a hover affordance, make it a real `<a>` or `<button>`. A hover-animated `<div>` is unreachable by keyboard and the `:focus-visible` half of every interaction is dead.

---

## Imagery

Minimal and schematic. There is no hero photography of people, no illustration, no decorative graphic. The single photographic element is the **background plate** — an abstract texture behind the panel cluster, always partially obscured by opaque panels, functioning as a mat rather than as content. It is decorative, `aria-hidden`, and optional: absent the file, a hatch shows in its place and nothing looks broken.

Everything else that reads as "image" is **drawn from data**: the tick field, the six-bar sentiment chart, the canonical-record list. The visual content _is_ the product's output. Icons are thin-stroke geometric marks at 1.5–2px in `--akta-gray-text-high` or `--akta-brand-text-low`, used only as functional cues — never as decoration.

Customer logos are **typeset, not dropped in as SVGs**, using the system's own heading roles. This keeps the wall coherent when real assets are unavailable, and it means the wall never carries a third typeface.

---

## Agent Prompt Guide

### Quick Reference

| Purpose           | Utility                                                          |
| ----------------- | ---------------------------------------------------------------- |
| Page ground       | `bg-akta-canvas`                                                 |
| Panel surface     | `bg-akta-gray-bg-subtle`                                         |
| Card surface      | `bg-akta-gray-ui`                                                |
| Primary text      | `text-akta-gray-text-high`                                       |
| Muted text        | `text-akta-gray-text-low`                                        |
| Primary action    | `bg-akta-brand-solid text-akta-brand-on-solid`                   |
| Data emphasis     | `text-akta-brand-solid`                                          |
| Separator         | `shadow-akta-rule-t` / `-b` / `-x` / `-y` / `-cell`              |
| Depth             | `shadow-akta-panel` / `shadow-akta-border`                       |
| Interactive notch | `akta-notch akta-notch-reveal`                                   |
| Structural notch  | `akta-notch [--akta-notch-color:var(--akta-gray-border-subtle)]` |
| Grid              | `mx-auto w-full max-w-akta`                                      |
| Radius            | **none — never add one**                                         |

### Example Component Prompts

1. **Stat band.** Full-bleed wrapper with `shadow-akta-rule-y`, inner `mx-auto w-full max-w-akta` holding a four-cell grid. Each cell `shadow-akta-rule-cell px-6 py-8` plus a flush notch: `akta-notch [--akta-notch-arm:0px] [--akta-notch-inset:0px] [--akta-notch-weight:1px] [--akta-notch-color:var(--akta-gray-border-subtle)] lg:[--akta-notch-arm:10px]`. Label in `font-akta-mono text-akta-label-12-mono uppercase text-akta-gray-text-low`, figure in `text-akta-heading-24 sm:text-akta-heading-24-sm tabular-nums text-akta-gray-text-high`. Wrap in `data-akta-reveal`. Square corners, no border.

2. **Primary button.** `bg-akta-brand-solid text-akta-brand-on-solid px-6 py-3.5 font-akta-mono text-akta-cta uppercase sm:text-akta-cta-sm`, plus `akta-roll-host akta-notch akta-notch-reveal`, `hover:bg-akta-brand-solid-hover transition-colors`, `focus-visible:outline-2 focus-visible:outline-offset-[10px] focus-visible:outline-akta-brand-border-hover`. Label wrapped in `.akta-roll` with an `aria-hidden` duplicate face. No radius, no shadow.

3. **Feature panel.** `bg-akta-gray-bg-subtle shadow-akta-panel akta-notch akta-notch-diagonal [--akta-notch-arm:22px] [--akta-notch-inset:10px] w-full lg:max-w-2xl`. Title bar `bg-akta-gray-ui px-4 py-2.5 shadow-akta-rule-b` with `font-akta-mono text-akta-label-12-mono uppercase` left and right. Footer two-cell grid, divider `shadow-akta-rule-r`, figures `text-akta-heading-24 sm:text-akta-heading-24-sm tabular-nums`.

4. **Section header.** `h2` in `text-akta-heading-48 sm:text-akta-heading-48-sm lg:text-akta-heading-48-lg text-akta-gray-text-high text-balance`, eyebrow above in `font-akta-mono text-akta-label-12-mono uppercase text-akta-brand-text-low`, body below in `text-akta-copy-16 sm:text-akta-copy-16-sm text-akta-gray-text-low max-w-[65ch]`. Wrap in `data-akta-reveal`.

5. **Hatch seam.** Full-bleed `bg-akta-gray-bg-subtle shadow-akta-rule-y`, inner `akta-hatch mx-auto w-full max-w-akta h-6 sm:h-9 [--akta-hatch-color:var(--akta-gray-ui-hover)]`. Closes a section without introducing a divider line.

6. **Benchmark grid.** Section header, then a full-bleed `shadow-akta-rule-y` band holding `mx-auto w-full max-w-akta grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Each cell is a **Metric Cell** — graphic / title / caption split by `shadow-akta-rule-t`, with a **Data Bar** list as the graphic and one `bg-akta-brand-solid` row. Wrap header and grid in `data-akta-reveal`. Square corners, no border, no radius.

---

## Design Philosophy

1. **Rules, not boxes.** Structure comes from hairlines and shared edges. A thing is defined by what separates it from its neighbour, not by a container drawn around it.
2. **Square, always.** No radius anywhere. The corner notch is the ornament a rounded corner would otherwise provide.
3. **Blue is a budget.** One accent, spent only on action and on data. Everything structural is gray.
4. **Depth is transparent.** Shadows over borders, so surfaces survive any background — including a photographic plate.
5. **Motion demonstrates.** Animation exists to show a mechanism happening — the filter filtering, the label re-stating — not to decorate an arrival.
6. **Values are utilities, mechanism is CSS.** The moment a stylesheet sets values a utility already covers, the two begin fighting and the markup silently loses.

---

## Similar Brands

- **Vercel** — same Geist pairing, same monospace UI voice, same hairline-rule structure and near-achromatic palette with one accent
- **Linear** — identical tight display tracking and restraint with colour, though Linear rounds its corners where akta refuses to
- **Railway** — same developer-infrastructure register, mono labels over sans headlines, data rendered as the visual content
- **Clay** — closest in subject matter: a data/enrichment API presenting resolved records as the hero graphic rather than describing them
- **Stripe Docs** — same instrument-panel feel from monospace chrome and rule-separated cells, same use of a single blue for emphasis only

---

## Quick Start

Everything below is written into your `globals.css` automatically by `shadcn add`. It is reproduced here so the system can be rebuilt by hand, or ported to a project that isn't using the registry.

### CSS Custom Properties — raw values

```css
:root {
  --akta-canvas: #fff;
  --akta-brand-ui: oklch(0.932 0.032 255.585);
  --akta-brand-border: oklch(0.623 0.214 259.815);
  --akta-brand-border-hover: oklch(0.546 0.245 262.881);
  --akta-brand-solid: oklch(0.488 0.243 264.376);
  --akta-brand-solid-hover: oklch(0.424 0.199 265.638);
  --akta-brand-text-low: oklch(0.379 0.146 265.522);
  --akta-brand-on-solid: #fff;
  --akta-gray-bg-subtle: oklch(0.985 0.002 247.839);
  --akta-gray-ui: oklch(0.967 0.003 264.542);
  --akta-gray-ui-hover: oklch(0.928 0.006 264.531);
  --akta-gray-ui-active: oklch(0.872 0.01 258.338);
  --akta-gray-border-subtle: oklch(0.707 0.022 261.325);
  --akta-gray-border-hover: oklch(0.446 0.03 256.802);
  --akta-gray-text-low: oklch(0.21 0.034 264.665);
  --akta-gray-text-high: oklch(0.13 0.028 261.692);
  --akta-shadow-border:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
  --akta-shadow-panel:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 8px 16px -6px rgba(0, 0, 0, 0.08),
    0px 24px 48px -12px rgba(0, 0, 0, 0.1);
  --akta-shadow-ring-brand: 0 0 0 1px
    color-mix(in oklab, var(--akta-brand-border) 45%, transparent);
  --akta-rule-t: inset 0 1px 0 0 rgba(0, 0, 0, 0.08);
  --akta-rule-b: inset 0 -1px 0 0 rgba(0, 0, 0, 0.08);
  --akta-rule-l: inset 1px 0 0 0 rgba(0, 0, 0, 0.08);
  --akta-rule-r: inset -1px 0 0 0 rgba(0, 0, 0, 0.08);
  --akta-rule-x:
    inset 1px 0 0 0 rgba(0, 0, 0, 0.08), inset -1px 0 0 0 rgba(0, 0, 0, 0.08);
  --akta-rule-y:
    inset 0 1px 0 0 rgba(0, 0, 0, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.08);
  --akta-rule-cell:
    inset -1px 0 0 0 rgba(0, 0, 0, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.08);
  --akta-font-sans: var(
    --font-geist-sans,
    ui-sans-serif,
    system-ui,
    sans-serif
  );
  --akta-font-mono: var(
    --font-geist-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace
  );
  --akta-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

.dark {
  --akta-canvas: #000;
  --akta-brand-ui: oklch(0.379 0.146 265.522);
  --akta-brand-border: oklch(0.546 0.245 262.881);
  --akta-brand-border-hover: oklch(0.623 0.214 259.815);
  --akta-brand-solid: oklch(0.546 0.245 262.881);
  --akta-brand-solid-hover: oklch(0.623 0.214 259.815);
  --akta-brand-text-low: oklch(0.707 0.165 254.624);
  --akta-brand-on-solid: #fff;
  --akta-gray-bg-subtle: oklch(0.13 0.028 261.692);
  --akta-gray-ui: oklch(0.21 0.034 264.665);
  --akta-gray-ui-hover: oklch(0.278 0.033 256.848);
  --akta-gray-ui-active: oklch(0.373 0.034 259.733);
  --akta-gray-border-subtle: oklch(0.373 0.034 259.733);
  --akta-gray-border-hover: oklch(0.551 0.027 264.364);
  --akta-gray-text-low: oklch(0.707 0.022 261.325);
  --akta-gray-text-high: oklch(0.967 0.003 264.542);
  --akta-shadow-border: 0 0 0 1px rgba(255, 255, 255, 0.08);
  --akta-shadow-panel:
    0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 48px -12px rgba(0, 0, 0, 0.6);
  --akta-shadow-ring-brand: 0 0 0 1px
    color-mix(in oklab, var(--akta-brand-border) 60%, transparent);
  --akta-rule-t: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  --akta-rule-b: inset 0 -1px 0 0 rgba(255, 255, 255, 0.1);
  --akta-rule-l: inset 1px 0 0 0 rgba(255, 255, 255, 0.1);
  --akta-rule-r: inset -1px 0 0 0 rgba(255, 255, 255, 0.1);
  --akta-rule-x:
    inset 1px 0 0 0 rgba(255, 255, 255, 0.1),
    inset -1px 0 0 0 rgba(255, 255, 255, 0.1);
  --akta-rule-y:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.1);
  --akta-rule-cell:
    inset -1px 0 0 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.1);
  --akta-font-sans: var(
    --font-geist-sans,
    ui-sans-serif,
    system-ui,
    sans-serif
  );
  --akta-font-mono: var(
    --font-geist-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace
  );
  --akta-ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Tailwind v4 — names the utilities

`inline` is required: it makes each utility resolve `var(--akta-*)` at use time, which is what lets `.dark` switch the palette. A literal baked in here could not.

```css
@theme inline {
  /* Colors */
  --color-akta-canvas: var(--akta-canvas);
  --color-akta-brand-ui: var(--akta-brand-ui);
  --color-akta-brand-border-hover: var(--akta-brand-border-hover);
  --color-akta-brand-solid: var(--akta-brand-solid);
  --color-akta-brand-solid-hover: var(--akta-brand-solid-hover);
  --color-akta-brand-text-low: var(--akta-brand-text-low);
  --color-akta-brand-on-solid: var(--akta-brand-on-solid);
  --color-akta-gray-bg-subtle: var(--akta-gray-bg-subtle);
  --color-akta-gray-ui: var(--akta-gray-ui);
  --color-akta-gray-ui-hover: var(--akta-gray-ui-hover);
  --color-akta-gray-ui-active: var(--akta-gray-ui-active);
  --color-akta-gray-border-hover: var(--akta-gray-border-hover);
  --color-akta-gray-text-low: var(--akta-gray-text-low);
  --color-akta-gray-text-high: var(--akta-gray-text-high);

  /* Shadows & rules */
  --shadow-akta-border: var(--akta-shadow-border);
  --shadow-akta-panel: var(--akta-shadow-panel);
  --shadow-akta-ring-brand: var(--akta-shadow-ring-brand);
  --shadow-akta-rule-t: var(--akta-rule-t);
  --shadow-akta-rule-b: var(--akta-rule-b);
  --shadow-akta-rule-l: var(--akta-rule-l);
  --shadow-akta-rule-r: var(--akta-rule-r);
  --shadow-akta-rule-x: var(--akta-rule-x);
  --shadow-akta-rule-y: var(--akta-rule-y);
  --shadow-akta-rule-cell: var(--akta-rule-cell);

  /* Fonts, easing, container */
  --font-akta-sans: var(--akta-font-sans);
  --font-akta-mono: var(--akta-font-mono);
  --container-akta: 90rem;

  /* Type scale */
  --text-akta-display: 40px;
  --text-akta-display--line-height: 1.1;
  --text-akta-display--letter-spacing: -0.06em;
  --text-akta-display--font-weight: 400;
  --text-akta-display-sm: 56px;
  --text-akta-display-sm--line-height: 1;
  --text-akta-display-sm--letter-spacing: -0.03em;
  --text-akta-display-sm--font-weight: 400;
  --text-akta-display-md: 64px;
  --text-akta-display-md--line-height: 1;
  --text-akta-display-md--letter-spacing: -0.03em;
  --text-akta-display-md--font-weight: 400;
  --text-akta-display-lg: 80px;
  --text-akta-display-lg--line-height: 1;
  --text-akta-display-lg--letter-spacing: -0.03em;
  --text-akta-display-lg--font-weight: 400;
  --text-akta-display-xl: 96px;
  --text-akta-display-xl--line-height: 1;
  --text-akta-display-xl--letter-spacing: -0.03em;
  --text-akta-display-xl--font-weight: 400;
  --text-akta-heading-24: 20px;
  --text-akta-heading-24--line-height: 1.4;
  --text-akta-heading-24--letter-spacing: -0.04em;
  --text-akta-heading-24--font-weight: 600;
  --text-akta-heading-24-sm: 24px;
  --text-akta-heading-24-sm--line-height: 1.33;
  --text-akta-heading-24-sm--letter-spacing: -0.04em;
  --text-akta-heading-24-sm--font-weight: 600;
  --text-akta-heading-20: 18px;
  --text-akta-heading-20--line-height: 1.33;
  --text-akta-heading-20--letter-spacing: -0.02em;
  --text-akta-heading-20--font-weight: 600;
  --text-akta-heading-20-sm: 20px;
  --text-akta-heading-20-sm--line-height: 1.3;
  --text-akta-heading-20-sm--letter-spacing: -0.02em;
  --text-akta-heading-20-sm--font-weight: 600;
  --text-akta-label-12-mono: 12px;
  --text-akta-label-12-mono--line-height: 1.33;
  --text-akta-label-12-mono--letter-spacing: 0em;
  --text-akta-label-12-mono--font-weight: 400;
  --text-akta-nav: 12px;
  --text-akta-nav--line-height: 1.667;
  --text-akta-nav--letter-spacing: 0.06em;
  --text-akta-nav--font-weight: 400;
  --text-akta-nav-sm: 13px;
  --text-akta-nav-sm--line-height: 1.538;
  --text-akta-nav-sm--letter-spacing: 0.06em;
  --text-akta-nav-sm--font-weight: 400;
  --text-akta-cta: 11px;
  --text-akta-cta--line-height: 1.82;
  --text-akta-cta--letter-spacing: 0.04em;
  --text-akta-cta--font-weight: 500;
  --text-akta-cta-sm: 14px;
  --text-akta-cta-sm--line-height: 1.43;
  --text-akta-cta-sm--letter-spacing: 0.06em;
  --text-akta-cta-sm--font-weight: 500;
}
```

### The devices

The six CSS classes go in `@layer components` so Tailwind utilities always win over them. See **Signature Devices** above for their full API; the shipped `css` block in `config.json` is the source of truth.

```css
@layer components {
  .akta-notch { position: relative; --akta-notch-color: var(--akta-brand-solid); … }
  .akta-notch::before { /* full border + four-layer corner mask */ }
  .akta-hatch { /* repeating 45° gradient */ }
  .akta-roll  { /* clip + two faces */ }
  .akta-tick  { /* noise/armed/run states */ }
  .akta-plate { /* image layer over hatch fallback */ }
  [data-akta-enter] { animation: akta-enter 0.6s var(--akta-ease) backwards }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-akta-reveal] {
      animation: akta-enter 1s linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 28%;
    }
  }
}
```
