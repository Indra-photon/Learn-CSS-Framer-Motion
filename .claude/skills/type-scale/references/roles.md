# The four roles

Geist's type scale, transcribed from the CSS that `vercel.com/geist/typography`
ships. Nothing here is computed — every value is a Geist value.

The scale is organised by **job**, not by size. Three of the four scales define
a 14px token, and they are all different: `heading-14` is 600 weight with
negative tracking, `copy-14` is 400 at 20px leading, `button-14` is 500. Picking
the role first is the whole method.

## heading — 600 weight, the only scale with tracking

| Token | Size / leading | Tracking |
|---|---|---|
| `type-heading-72` | 72 / 72 | −4.32 |
| `type-heading-64` | 64 / 64 | −3.84 |
| `type-heading-56` | 56 / 56 | −3.36 |
| `type-heading-48` | 48 / 56 | −2.88 |
| `type-heading-40` | 40 / 48 | −2.40 |
| `type-heading-32` | 32 / 40 | −1.28 |
| `type-heading-24` | 24 / 32 | −0.96 |
| `type-heading-20` | 20 / 26 | −0.40 |
| `type-heading-16` | 16 / 24 | −0.32 |
| `type-heading-14` | 14 / 20 | −0.28 |

Introduces a page or a section. Tracking tightens in three bands as size grows
— −2% up to 20px, −4% at 24–32px, −6% at 40px and above — and leading collapses
to 1.0 at 56px and up. That is what keeps a 72px headline from reading as a
loose banner.

`<strong>` inside `heading-20`, `-24` and `-32` is Geist's **Subtle** modifier.
It drops to weight 500 and `--gray-text-low`; it de-emphasizes. Nothing else in
the system works that way, and it is the one modifier people misuse — putting
`<strong>` in a heading to make part of it *louder* makes it quieter.

## copy — 400 weight, no tracking, for text that wraps

| Token | Size / leading |
|---|---|
| `type-copy-24` | 24 / 36 |
| `type-copy-20` | 20 / 36 |
| `type-copy-18` | 18 / 28 |
| `type-copy-16` | 16 / 24 |
| `type-copy-14` | 14 / 20 |
| `type-copy-14-mono` | 14 / 20 |
| `type-copy-13` | 13 / 18 |
| `type-copy-13-mono` | 13 / 18 |

Multiple lines of text: paragraphs, descriptions, card bodies. Higher leading
than `label` at the same size, which is the entire reason both exist.

`<strong>` → weight **550** (not 600 — Geist uses the variable axis) and
`--gray-text-high`.

## label — 400 weight, no tracking, for text that does not wrap

| Token | Size / leading |
|---|---|
| `type-label-20` | 20 / 32 |
| `type-label-18` | 18 / 20 |
| `type-label-16` | 16 / 20 |
| `type-label-14` | 14 / 20 |
| `type-label-14-mono` | 14 / 20 |
| `type-label-13` | 13 / 16 |
| `type-label-13-mono` | 13 / 20 |
| `type-label-12` | 12 / 16 |
| `type-label-12-mono` | 12 / 16 |

Single-line text — table headers, badges, form labels, metadata, anything
sitting beside an icon. The tighter leading is what lets it centre against a
16px icon without the row growing.

`<strong>` → weight **500** and `--gray-text-high`.

**`copy-16` is 16/24. `label-16` is 16/20.** Same size, four pixels of leading
apart. If the text can wrap to a second line, it is `copy`.

## button — 500 weight, buttons only

| Token | Size / leading | Use |
|---|---|---|
| `type-button-16` | 16 / 20 | large buttons |
| `type-button-14` | 14 / 20 | the default |
| `type-button-12` | 12 / 16 | micro-buttons inside input fields |

Do not use these outside a button. A 500-weight 14px label is `label-14` with a
`<strong>`, not `button-14`.

## Pairing with color-scale

The `> strong` rules reference `--gray-text-high` / `--gray-text-low` from a
`color-scale` palette, with `currentColor` as the fallback. Generate both under
the same block name and they compose:

```tsx
<article className="pricing-card bg-[var(--gray-bg-subtle)]">
  <h3 className="type-heading-20 text-[var(--gray-text-high)]">Pro</h3>
  <p className="type-copy-14 text-[var(--gray-text-low)]">
    For teams shipping <strong>every week</strong>.
  </p>
</article>
```

Type carries size, leading, weight and tracking. Color carries color. Neither
file sets the other's properties.

## Common mistakes

- **`label` for something that wraps.** At 18/20 a wrapped label's lines nearly
  touch. Wrapping text is `copy`.
- **`font-semibold` / `font-medium` on a `type-*` class.** Weight is part of the
  token. Use a nested `<strong>`.
- **`<strong>` in a large heading to add emphasis.** It subtracts emphasis.
- **Tailwind type utilities layered on top** — `text-lg`, `leading-6`,
  `tracking-tight`. They win the cascade and the token stops being a token.
- **Reaching for a size the scale lacks** (28, 36, 44). Round to a real token.
- **Mono for emphasis.** The mono variants are for code, IDs, hashes and
  measurements — content that is actually monospaced data.
