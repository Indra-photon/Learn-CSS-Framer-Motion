# The 11 roles

Radix's semantic scale, mapped 1:1 onto Tailwind's 11 stops. Every value is a
literal Tailwind color — nothing is computed or interpolated.

Radix defines 12 roles; Tailwind ships 11 stops. The dropped role is `bg`
(Radix step 1, "app background"), because Radix's own docs call steps 1 and 2
interchangeable and recommend plain white for a light-mode app background. So
the scale starts at `bg-subtle`, and the page behind a block is white or
`--gray-bg-subtle`.

## Lookup

| Role | Light | Dark | Use it for |
|---|---|---|---|
| `bg-subtle` | 50 | 950 | the block's own surface — cards, panels, sidebars |
| `ui` | 100 | 900 | component background at rest: buttons, inputs, chips |
| `ui-hover` | 200 | 800 | that component, hovered |
| `ui-active` | 300 | 700 | that component, pressed or selected |
| `border-subtle` | 400 | 700 | dividers and borders on **non-interactive** things |
| `border` | 500 | 600 | borders on **interactive** things; focus rings |
| `border-hover` | 600 | 500 | that border, hovered; stronger focus rings |
| `solid` | 700 | 600 | filled buttons, badges, the accent itself |
| `solid-hover` | 800 | 500 | that fill, hovered |
| `text-low` | 900 | 400 | secondary text, icons, captions |
| `text-high` | 950 | 100 | primary text, headings |
| `on-solid` | — | — | text/icons sitting **on** `solid` (contrast-verified) |

`solid` and `solid-hover` are pinned in dark mode rather than inverted, so the
accent keeps one identity across themes. That makes a few dark stops serve two
roles (`700` is both `ui-active` and `border-subtle`, `600` is both `border`
and `solid`). That is intentional and reads fine — a border and a button fill
sharing a value is not a conflict.

## Which scale

Most of a UI is gray. Reach for `--gray-*` by default and `--brand-*` only
where the accent genuinely belongs: the primary action, a focus ring, a link,
a selected state. If a block is mostly brand-colored, the accent stops meaning
anything.

## Writing the markup

Tailwind cannot generate `bg-brand-solid` utilities from these — class names
only come from global `@theme`, and these vars are block-scoped by design. Use
arbitrary value syntax:

```tsx
<article className="bg-[var(--gray-bg-subtle)] border border-[var(--gray-border-subtle)] rounded-xl p-6">
  <h3 className="text-[var(--gray-text-high)] font-medium">Starter</h3>
  <p className="text-[var(--gray-text-low)] text-sm">For side projects.</p>

  <button
    className="bg-[var(--brand-solid)] text-[var(--brand-on-solid)]
               hover:bg-[var(--brand-solid-hover)]
               focus-visible:outline-2 focus-visible:outline-[var(--brand-border)]"
  >
    Get started
  </button>

  <button
    className="bg-[var(--gray-ui)] text-[var(--gray-text-high)]
               border border-[var(--gray-border)]
               hover:bg-[var(--gray-ui-hover)] active:bg-[var(--gray-ui-active)]"
  >
    Compare plans
  </button>
</article>
```

## Common mistakes

- **`border-subtle` on an interactive element.** It is the non-interactive
  one. Buttons and inputs take `border`.
- **Hardcoding text on a solid fill.** Use `--brand-on-solid`; it is the one
  value the table cannot supply, and it is white for some families and black
  for others. For bright families (amber, yellow, lime, sky, emerald, cyan,
  teal) it differs between light and dark mode.
- **Using `text-low` for body copy.** It is the *secondary* role. Body text is
  `text-high`.
- **Reaching for a raw Tailwind class** (`bg-blue-100`) inside a block that has
  a palette. That value will not follow the block when the palette changes.
- **`--gray-solid` as a surface.** It is a mid-tone fill for a neutral button,
  not a background. Surfaces are `bg-subtle` and `ui`.

## Regenerating

```
node .claude/skills/color-scale/scripts/build-scale.mjs <family> <selector> [--neutral <family>] [--status]
```

Prints CSS to stdout, a contrast report to stderr. Writes nothing itself.
