# Wellness Hero — Variation 1

> _paper, with two things resting on it_

**Block:** `.wellness-hero` · **Theme:** light (a dark ramp ships but is not designed against) · **Component:** `Wellnesscompany.tsx` · **Image:** `/Images/wellness-bloom.png`

## Contract

**Every visual decision in this section resolves to a token named in this file.**

If the token you need is not here — or its ledger row says ➕ — **stop.** Do not
approximate with an adjacent role, do not write a raw value, do not fall back to
a Tailwind default, and do not "just this once" a hex. A value that is not in
this file is a decision nobody has made yet, and guessing it silently forks the
system.

Instead, raise a **Gap Request** and wait:

> **Gap Request — <what is missing>**
> **Needed for:** <the element, and what it has to do>
> **Nearest existing token:** <role> — <why it does not fit>
> **Candidates:** (a) <value + consequence> (b) <value + consequence>
> **Recommendation:** <one of them, and why>
> **Belongs in:** <section of this file>

Once the owner decides: add the value to the generated CSS, move its ledger row
in this file, and *then* regenerate the UI. Never the other way around — markup
that ships ahead of its token is how a system loses its vocabulary.

**Free — no need to ask:** layout arrangement, flex/grid structure, responsive
ordering, which documented component to use, content and copy, semantic markup,
ARIA, and anything the "Do" list already sanctions.

**Never without asking:** a color, a font size, a weight, a radius, a shadow, a
spacing value, an easing, an icon set, or a new component pattern.

## Overview

This is the **control** of a five-variation set. Its structural idea is physical: **the page is paper, and exactly two things rest on it** — the photograph, and the product bar. Everything else is flat. That single premise is what separates this variation from the other four, which stay strictly flat, and it is what gives the composition depth without turning it into a card grid.

The colour system is almost entirely achromatic. A stone ramp carries every surface, rule and word on a warm cream ground; a single amber is spent once, on the one thing you can click. The photograph is the only saturated object, and it earns that by being the sole piece of evidence that this is a health product at all.

What it refuses: gradients, glass, badges, proof bars, urgency verbs, second CTAs, and shadows on anything that is not one of the two lifted objects. The type does the hierarchy alone — nothing is bold, nothing is uppercase, nothing is centred.

### Revision note — elevation

An earlier version of this document forbade shadows outright ("elevation is a hairline, never a shadow"). **That rule was reversed by the owner.** The block now has a two-level elevation ramp, §8. The hairline survives only where it separates, not where it lifts. This note exists because a doc that quietly changes its mind teaches readers not to trust it.

## How this ships

**One file:** `wellness-hero.css`, beside this document and the component, in three sections.

| Section | Origin | Rule |
| --- | --- | --- |
| 1. Colour | `/color-scale amber wellness-hero --neutral stone` | Generated — never hand-edit |
| 2. Type | `/type-scale wellness-hero --no-mono` | Generated — never hand-edit |
| 3. Elevation + radius | Hand-authored | Neither skill produces shadows; a re-merge must re-append it |

```
node .claude/skills/color-scale/scripts/build-scale.mjs amber wellness-hero --neutral stone
node ../.claude/skills/type-scale/scripts/build-type.mjs wellness-hero --no-mono
```

Note the second path: `type-scale` lives in the **repo-root** `.claude/`, while `color-scale` is project-scoped under `my-project/.claude/`. Running both from the same directory fails on the second.

### Assumptions — and what breaks silently if they are false

| Must be true | What breaks if it isn't |
| --- | --- |
| `className="wellness-hero"` sits on the root element | **Every token in this file resolves to nothing.** No error, no fallback — the hero renders in the browser's default serif and looks merely "unstyled" rather than broken. The most common failure by far. |
| Tailwind's `--color-amber-*` / `--color-stone-*` theme vars are in the build | Colours resolve to nothing and text paints black-on-transparent. Verified to survive v4 tree-shaking, but the theme vars land in a **different CSS chunk** than the block — if colours vanish, look there first. |
| Grid children are given explicit `w-full` / `h-full` | Something in this project sets `justify-items: center` on grids — no rule for it appears in any stylesheet — so grid children size to content instead of stretching, and an absolutely-positioned image inside one collapses to **zero width**. |
| `--font-sans` is defined globally | Type falls back to `ui-sans-serif`. Metrics still apply, so it degrades rather than collapses. |
| The ground stays `--brand-bg-subtle` | The warm shadows and the photograph's cream field were tuned against it. On a cool ground the seam reads as a colour-profile error — which is exactly the defect this ground was promoted to fix. |
| `globals.css` is never edited for this block | Tokens leak into the other four variations, which is what block scoping exists to prevent. |

## Coverage ledger

| Legend | Meaning |
| --- | --- |
| ✅ | Documented and in use. Reach for it directly. |
| ◑ token only | The value ships in the CSS but no role in this file spends it. Usable, undocumented — say so in the PR that first uses it. |
| ➕ add | The value ships in the CSS but is **not part of this system's vocabulary yet.** Do not reach for it. Raise a Gap Request first (see the contract at the top of this file), then move its row to ✅ in the same commit. |

Sections 1 and 2 of `wellness-hero.css` are generated. **Never hand-edit them** — regenerate through `/color-scale` and `/type-scale`, re-merge, then re-run `/design-md`, or the tables below start lying. Section 3 (elevation and radius) is hand-authored, because neither skill produces shadows; a re-merge must re-append it.

## Tokens — Colors

Block-scoped to `.wellness-hero`, so Tailwind cannot generate utilities from them. **Every color reaches markup as an arbitrary value** — the "Consume as" column is the only correct form.

| Role | Light | Dark | Variable | Consume as | Use for |
| --- | --- | --- | --- | --- | --- |
| ✅ Canvas | `amber-50` | `amber-50` | — | page ground | The surface everything sits on |
| ✅ brand-bg-subtle | `amber-50` | `amber-950` | `--brand-bg-subtle` | `bg-[var(--brand-bg-subtle)]` | — |
| ✅ brand-solid | `amber-700` | `amber-600` | `--brand-solid` | `bg-[var(--brand-solid)]` | Primary buttons, the accent surface |
| ✅ brand-solid-hover | `amber-800` | `amber-500` | `--brand-solid-hover` | `hover:bg-[var(--brand-solid-hover)]` | Primary button hover |
| ✅ brand-on-solid | `#fff` | `#000` | `--brand-on-solid` | `text-[var(--brand-on-solid)]` | Text on the accent surface |
| ✅ gray-bg-subtle | `stone-50` | `stone-950` | `--gray-bg-subtle` | `bg-[var(--gray-bg-subtle)]` | Panel and card surfaces, one step off the canvas |
| ✅ gray-ui | `stone-100` | `stone-900` | `--gray-ui` | `bg-[var(--gray-ui)]` | Secondary buttons, title bars, inert fills |
| ✅ gray-border-subtle | `stone-400` | `stone-700` | `--gray-border-subtle` | `border-[var(--gray-border-subtle)]` | Hairline separators, structural edges |
| ✅ gray-solid | `stone-700` | `stone-600` | `--gray-solid` | `bg-[var(--gray-solid)]` | — |
| ✅ gray-text-low | `stone-900` | `stone-400` | `--gray-text-low` | `text-[var(--gray-text-low)]` | Secondary text, labels, metadata |
| ✅ gray-text-high | `stone-950` | `stone-100` | `--gray-text-high` | `text-[var(--gray-text-high)]` | Primary text, headings |

**➕ Also in `wellness-hero.css`, not vocabulary yet** — `--brand-ui`, `--brand-ui-hover`, `--brand-ui-active`, `--brand-border-subtle`, `--brand-border`, `--brand-border-hover`, `--brand-text-low`, `--brand-text-high`, `--gray-ui-hover`, `--gray-ui-active`, `--gray-border`, `--gray-border-hover`, `--gray-solid-hover`, `--gray-on-solid`. These values ship, but nothing in this system spends them. Reaching for one is a Gap Request, not a shortcut.

## Tokens — Typography

Descendant classes, not variables — each sets size, leading, weight and tracking in one class. **One role per element**; they do not compose, and a Tailwind `text-*` on top of one produces a token that is no longer a token.

| Role | Size / leading | Weight | Tracking | Class | Family |
| --- | --- | --- | --- | --- | --- |
| ✅ heading-72 | 72px / 72px | 600 | -4.32px | `type-heading-72` | sans |
| ✅ heading-40 | 40px / 48px | 600 | -2.4px | `type-heading-40` | sans |
| ✅ heading-24 | 24px / 32px | 600 | -0.96px | `type-heading-24` | sans |
| ✅ copy-20 | 20px / 36px | 400 | — | `type-copy-20` | sans |
| ✅ copy-16 | 16px / 24px | 400 | — | `type-copy-16` | sans |
| ✅ label-14 | 14px / 20px | 400 | — | `type-label-14` | sans |
| ✅ label-12 | 12px / 16px | 400 | — | `type-label-12` | sans |
| ✅ button-16 | 16px / 20px | 500 | — | `type-button-16` | sans |

**➕ Also in the type half of `wellness-hero.css`, not vocabulary yet** — `type-heading-64`, `type-heading-56`, `type-heading-48`, `type-heading-32`, `type-heading-20`, `type-heading-16`, `type-heading-14`, `type-copy-24`, `type-copy-18`, `type-copy-14`, `type-copy-13`, `type-label-20`, `type-label-18`, `type-label-16`, `type-label-13`, `type-button-14`, `type-button-12`. Adding one to the vocabulary is a decision about the system, not about one component.

## Wiring

```tsx
import "./wellness-hero.css"; // palette + type + elevation, one merged file

// Scoped to this class. Off the root element, every token in
// this document silently resolves to nothing.
<section className="wellness-hero">…</section>
```


## Spacing, radius, shadows

**Spacing ladder** — 4px base, six rungs are vocabulary: `4 · 8 · 16 · 24 · 48 · 96`. The two large steps do the real work; this design is mostly the gaps.

### Radius — a closed vocabulary of three

| Value | Token | Used for |
| --- | --- | --- |
| `0` | — | Buttons, rules, the ground. The default. |
| ✅ `12px` | `--radius-object` | The two lifted objects, and only those |
| `999px` | — | Reserved; nothing in v1 spends it |

### Elevation — two levels, and a budget of two objects

| Level | Token | Value | Used for |
| --- | --- | --- | --- |
| 0 — paper | — | none | The ground and all type |
| ✅ 1 — resting | `--elevation-resting` | `0 1px 2px rgba(28,25,23,.06), 0 2px 8px rgba(28,25,23,.05)` | The product bar |
| ✅ 2 — lifted | `--elevation-lifted` | `0 2px 4px rgba(28,25,23,.05), 0 18px 40px -8px rgba(28,25,23,.14)` | The photograph |

**Shadows are warm.** Both are tinted from stone-900 `(28,25,23)`, never neutral black. A grey shadow on a cream ground goes muddy and reads instantly as a default `shadow-lg` — the templated tell this block exists to avoid.

**The budget is two objects.** The photograph lifts; the product bar rests; *nothing else in this block casts a shadow* — not the nav, not the button, not the eyebrow. The moment a third object lifts, the page becomes a card grid and the depth stops meaning anything. This is the rule most likely to be broken first.

## Layout

| Property | Value |
| --- | --- |
| Section height | `min-h-screen` (never `h-screen` — short viewports clip) |
| Split | `md:grid-cols-[1.63fr_1fr]` — 62/38, a ratio you feel before you measure |
| Gutters | `72px` desktop, `24px` below `md` |
| Text measure | `560px` max |
| Vertical | Bottom-anchored: nav top, stack pushed down with `mt-auto`, so the void above is a held pause, not leftover |
| Image | Inset object, not a bleed — clear of the top, right and bottom edges |
| Stacking below `md` | text first, image below as a band |
| Icon sizes | `16 / 20 / 24`, always `strokeWidth={1.5}` |

**One vertical governs the right-hand side:** the nav's right edge and the text measure end together. Left edges are flush at the gutter.

## Signature device

**The two lifted objects.** Not an ornament — a physical premise. The photograph sits above the paper at level 2; the product bar rests on it at level 1; everything else is printed flat. The identity is the *restraint of the budget*, not the shadows themselves.

*How it breaks:* give a third element a shadow and the premise collapses into generic card soup — the page reads as a UI kit rather than a printed sheet. Use a neutral-black shadow instead of the warm one and it reads as a Tailwind default. Either failure costs more than having no depth at all.

## Components — v1

**Nav.** Transparent — no border, no background, no backdrop blur, no shadow, and no CTA, because the hero button is the only action on the screen. Wordmark left in `type-heading-24` at `--gray-text-high`, reading "The Wellness Company". Three links right in `type-label-14` at `--gray-solid`, `32px` apart, moving to `--gray-text-high` on hover with no underline. Below `md` the links collapse behind a `Menu01Icon` at `20px`.

**Eyebrow.** `type-label-12` at `--gray-solid`, sentence case, never uppercase. The smallest, most technical thing on the page. It names the product relationship — Tempo as the flagship — rather than company news; a funding figure in the prime pre-headline slot is founder-facing, and nobody's health improved because a round closed.

**Headline.** `type-heading-72` at `--gray-text-high`. The word is **`LiveMore.`** — the brand's own, verbatim, including the period and the closed compound. Set enormous and alone; its scale is the one immodest move the composition is allowed. At 72px Geist's `-4.32px` tracking was drawn for Geist's glyphs, and on this project's Figtree it may read tight. If it does, that is a Gap Request against this row, not a `tracking-*` at the call site.

**Deck.** `type-copy-20` at `--gray-solid`, capped at `440px`. Carries a fact about what the product does, not a category statement. `copy-20` exists to close the 4× jump from headline to body that made the deck read as fine print.

**Primary CTA.** The only accent and the only filled object. `bg-[var(--brand-solid)]`, `text-[var(--brand-on-solid)]`, radius `0`, `32px × 20px` padding, `type-button-16`, with `Message01Icon` at `18px` before the label. **The icon is not decoration:** the link is `sms:+16284687855` and opens the visitor's Messages app, so the button must say so — an unannounced app switch on a first interaction costs more trust than the friction it saves. The real site does the same thing with an iMessage glyph. Hover moves to `--brand-solid-hover`; no transform, no shadow, no glow.

**Product bar.** The fold's floor and the level-1 object. `--gray-bg-subtle` fill — a surface one step off the canvas; filling it with `--brand-bg-subtle` repeats the ground and the bar vanishes except for its shadow. `--radius-object`, `--elevation-resting`, four entries in a `grid-cols-4`. Each entry is a numeral `01`–`04` in `type-label-12` at `--gray-solid`, the product name in `type-label-14` at `--gray-text-high`, and its icon at `20px`: `Activity03Icon` (Tempo), `SnowIcon` (GoPolar), `Sun03Icon` (SunSeek), `Yoga01Icon` (Posture AI). Numerals are lifted from the real site's numbered product entries.

**Image.** `wellness-bloom.png` as an inset object at `--radius-object` and `--elevation-lifted`, cropped so the stamen sits **inboard, near the seam**, pulling the eye back toward the headline — with the out-of-focus haze falling off toward the outer edge. Never feathered: a radial fade turns it into decorative haze and the composition loses its column line.

## Motion

**None in v1.** A position, not an omission. The hero has one accent and two lifted objects; entrance animation would make the restraint look like a loading state. No easing or duration token ships, so adding motion is a Gap Request against this section.

## Accessibility

Contrast was verified by the generator and by hand, not asserted. On the `--brand-bg-subtle` ground: `--gray-text-high` **19.05:1**, `--gray-text-low` **16.86:1**, `--gray-solid` **9.91:1**, `--brand-solid` **4.84:1**. All pass AA; the first three pass AAA.

**`--gray-border-subtle` is a border, never text.** At `2.41:1` on this ground it fails AA outright. An earlier revision used it for the eyebrow and nav; that was a real defect, and `--gray-solid` replaced it — which also supplies the tonal step that `--gray-text-low` (a near-twin of `--gray-text-high`) never could.

**The split `on-solid` is load-bearing.** Amber is a bright family, so no single foreground clears AA at both solid stops: `--brand-on-solid` is `#fff` in light and `#000` in dark. Never hardcode `text-white` on the CTA.

Focus rings: `outline-2 outline-offset-2` in `--gray-text-high` on every interactive element; never `outline-none` without a replacement. Icons beside text labels are `aria-hidden`; the mobile menu button carries an `sr-only` label. The decorative photograph takes an empty `alt`.

## Imagery

One photograph, the only saturated element on screen, never tinted, scrimmed, duotoned or overlaid with text. The position is that the product is about actual living, so the single non-UI thing on the page is a real photograph shown plainly — the opposite of the dashboard screenshot every competitor leads with.

## Do

- Spend amber **once** per viewport, on the CTA.
- Lift exactly two objects. Everything else is flat.
- Tint shadows warm, from stone-900.
- Use `--gray-*` roles for borders. `--brand-border-subtle` is `amber-400`, a saturated mid-tone that does not read as subtle — the known strain in `/color-scale`.
- Let whitespace separate; reach for `48` or `96` before reaching for a rule.
- Keep the headline 1–3 words and declarative.
- Write CTAs as invitations that name the mechanism — "Text us to begin", never "Start your free trial today".
- Give grid children explicit `w-full` / `h-full` in this project.
- Set `strokeWidth={1.5}` on every Hugeicon.

## Don't

- No third shadow. The budget is two objects, and this is the rule most likely to be broken first.
- No neutral-black shadow. Warm or nothing.
- No `--gray-border-subtle` as a text colour — it fails AA at 2.41:1.
- No second CTA and no ghost button beside the primary. One action.
- No proof bar, logo wall, "Trusted by 500+", or testimonial.
- No `↗` arrows, no urgency verbs.
- No uppercase, no letterspaced labels — that is akta's instrument-panel voice, not this one.
- No bold weights; the scale tops out at 600.
- No radius outside `0` / `12px` / `999px`.
- No Tailwind type utility stacked on a `type-*` class — `text-sm` on `type-copy-20` produces a token that is no longer a token.
- No underline *and* a chevron on the same link. One signal.

## Agent prompt guide

| Purpose | Reach for |
| --- | --- |
| Page ground | `bg-[var(--brand-bg-subtle)]` |
| Primary text, headline, product names | `text-[var(--gray-text-high)]` |
| Quiet text — eyebrow, nav, deck, numerals | `text-[var(--gray-solid)]` |
| Borders and separators | `border-[var(--gray-border-subtle)]` |
| Accent surface (CTA only) | `bg-[var(--brand-solid)] hover:bg-[var(--brand-solid-hover)]` |
| Text on the accent | `text-[var(--brand-on-solid)]` |
| The lifted photograph | `rounded-[var(--radius-object)] shadow-[var(--elevation-lifted)]` |
| The resting product bar | `bg-[var(--gray-bg-subtle)] rounded-[var(--radius-object)] shadow-[var(--elevation-resting)]` |
| Headline | `type-heading-72` |
| Section heading | `type-heading-40` / `type-heading-24` |
| Deck / body | `type-copy-20` / `type-copy-16` |
| Nav, product names | `type-label-14` |
| Eyebrow, numerals | `type-label-12` |
| Button label | `type-button-16` |

**Worked prompts** — copy-pasteable, naming only ✅ tokens:

> Build the primary CTA: an `<a href="sms:+16284687855">` with `bg-[var(--brand-solid)] text-[var(--brand-on-solid)] hover:bg-[var(--brand-solid-hover)] px-8 py-5`, radius `0`, no shadow. `Message01Icon` at `size={18} strokeWidth={1.5}` with `aria-hidden`, then the label in `type-button-16`. The label must name the mechanism, because the link opens Messages.

> Build the product bar: `bg-[var(--gray-bg-subtle)] rounded-[var(--radius-object)] shadow-[var(--elevation-resting)]`, `grid-cols-4`. Per entry: numeral `01`–`04` in `type-label-12 text-[var(--gray-solid)]`, icon at `20px strokeWidth={1.5}`, name in `type-label-14 text-[var(--gray-text-high)]`.

> Build the photograph: an inset object — clear of the top, right and bottom edges — with `rounded-[var(--radius-object)] shadow-[var(--elevation-lifted)] overflow-hidden`, image `object-cover` cropped so the stamen sits inboard near the seam. Give the wrapper explicit `w-full h-full`; grid children do not stretch in this project.

> Build the headline block: `<h1 className="type-heading-72 text-[var(--gray-text-high)]">LiveMore.</h1>`, then `24px`, then the deck as `type-copy-20 text-[var(--gray-solid)] max-w-[440px]`. Do not add `tracking-*` — if it reads cramped, raise a Gap Request against the `heading-72` row.

## Similar brands

- **Aesop** — product photography as the only colour against a near-achromatic ground.
- **Ritual** — warm ground, one saturated accent, single-object depth.
- **Linear (marketing)** — declarative short headlines, no proof bars above the fold.
- **Teenage Engineering** — restraint read as competence rather than emptiness.

## Where a new thing goes

Values are tokens, structure is markup. A new colour, size or weight goes through `/color-scale` or `/type-scale` and back through `/design-md`. A new shadow or radius goes into §3 of the CSS **and** the tables above, in the same commit. Arrangement, responsive ordering and copy are free. If it has a value, it is a Gap Request.
