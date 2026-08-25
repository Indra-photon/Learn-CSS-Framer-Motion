---
name: type-scale
description: Emit Vercel Geist's typography scale as block-scoped classes — heading, copy, label and button roles with exact Geist metrics, mapped onto the project's own fonts. Explicit invocation only.
---

# type-scale

Gives a block Vercel's [Geist type scale](https://vercel.com/geist/typography) as
**semantic roles** — `heading`, `copy`, `label`, `button` — instead of ad-hoc
`text-2xl leading-tight tracking-tighter` stacks. Every metric is transcribed
from Geist's compiled CSS. Sibling of `color-scale`, same block-scoped premise.

Explicit invocation only. Do not run this unprompted when building a component.

## Usage

```
/type-scale <block-name> [--include heading,copy,label,button] [--no-mono]
```

```
/type-scale pricing-card
/type-scale docs-page --include heading,copy
/type-scale toolbar --include label,button --no-mono
```

- `block-name` — the block this scale belongs to; becomes the CSS class prefix
  and the filename. Use the same block name as its `color-scale` palette.
- `--include` — emit only these scales. Default is all four. A block that has
  no headings should not carry ten heading classes.
- `--no-mono` — drop the five mono variants.

## Steps

1. **Run the generator.** From the project root:

   ```bash
   node .claude/skills/type-scale/scripts/build-type.mjs <block-name> [flags]
   ```

   CSS goes to stdout, the metrics report to stderr.

2. **Write the CSS** to `src/components/blocks/<block-name>-type.css`, next to
   the block's `<block-name>.css` palette if it has one.

3. **Wire it up.** Add `import "./<block-name>-type.css";` to the component and
   put `className="<block-name>"` on its root element — the classes are scoped
   to that ancestor and do nothing outside it.

4. **Report the metrics** to the user, including any `note:` about tokens whose
   leading is too tight to wrap.

5. **Read `references/roles.md`** before writing markup, so `copy` and `label`
   don't get swapped — that is the one distinction the scale exists to make.

## What it generates

Descendant classes, not variables:

```css
.pricing-card .type-heading-32 {
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  font-size: 32px;
  line-height: 40px;
  font-weight: 600;
  letter-spacing: -1.28px;
}
.pricing-card .type-heading-32 > strong {
  font-weight: 500;
  color: var(--gray-text-low, currentColor);
}
```

Classes rather than `--type-*` variables, because a var can only carry one
value — it cannot carry the `> strong` modifier, which is how Geist expresses
weight variants. Four properties as four arbitrary-value utilities at every
call site is also unreadable.

**30 tokens:** 10 heading (72→14), 8 copy (24→13, two mono), 9 label (20→12,
three mono), 3 button (16/14/12).

## Consuming it

```tsx
import "./pricing-card-type.css";

<article className="pricing-card">
  <h3 className="type-heading-20">Pro</h3>
  <p className="type-copy-14">For teams shipping every week.</p>
  <span className="type-label-13">Billed annually</span>
  <button className="type-button-14">Get started</button>
</article>
```

Weight variants come from a nested `<strong>`, never a `font-*` utility:

```tsx
<p className="type-copy-16">
  Deploys finish in <strong>under 40 seconds</strong>.
</p>
```

## Fonts

Geist's metrics are emitted; Geist's *fonts* are not. Families resolve to this
project's `--font-sans` / `--font-mono`. Nothing to install.

The tradeoff is real and worth stating once: Geist's tracking (−6% at 40px and
above) was drawn for Geist's own glyphs. On a wider face those top sizes will
read tight. If a heading looks cramped, raise `letter-spacing` on that one rule
in the generated file — do not scale the whole ramp.

## Constraints

- **Never edit `src/app/globals.css`.** Scales are per-block, same as palettes.
- **Never touch the shadcn type tokens** or the `@theme` block. Separate system.
- **Do not invent sizes.** Every token is a Geist token. If a design needs 28px,
  pick 24 or 32 — an off-ramp size defeats the scale.
- **Do not stack Tailwind type utilities on a `type-*` class.** `text-sm` and
  `tracking-tight` on top of `type-copy-16` produce a token that is no longer a
  token. Change the token instead.

## Known strain

`label-18` is `18/20` and `label-16` is `16/20` — ratios of 1.11 and 1.25. They
are single-line roles and they wrap badly, by design. The generator flags them.
If the text can wrap, it is `copy`, not `label`.

Geist's docs page claims 14 heading and 11 label sizes; its shipped CSS defines
10 and 9. This skill follows the CSS.
