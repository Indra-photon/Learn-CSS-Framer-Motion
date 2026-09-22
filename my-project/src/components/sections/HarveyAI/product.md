# Harvey — landing page redesign

Source: https://www.harvey.ai/ · Working file: Paper → "Product Redesign" / page "harveyAI"
Tokens: `harvey.css` (this folder) · Fonts: `app/layout.tsx` (Inter, Newsreader)
Hero, measured from the live CSS: `HarveyHero.md`

> **Correction (2026-09-20).** The first critique was made from a Paper screenshot that
> had rendered the headline in a fallback grotesk. The live site's headline is
> `HarveySerifFont` at 72/80/96px, weight 400, line-height 1.05, tracking −0.0125em
> — a serif. The "marketing hides the product's serif" finding was wrong; the two
> voices are already unified on the live site. Their sans is ABC Diatype Variable,
> their neutral is a warm stone ramp (ivory `#FAFAF9` → ink `#0F0E0D`), and they own
> a slate accent (`dark-casal #333F40`) that they only ever use as a texture. Every
> other finding stands, and this changes the goal: **not a rebrand — the same
> aesthetic, executed 100× better for conversion.** See `HarveyHero.md` for values.

This document is the reasoning behind every token in `harvey.css`. If a value
changes there, the "why" changes here.

---

## 1. Product

Harvey is an enterprise legal-AI platform. Named products: **Agents** (orchestrated
legal work), **Vault** (thousands of documents, one query), **Spaces** (shared
workspace with firms, clients, co-counsel, ethical walls), **Contract Intelligence**,
**Command Center** (usage analytics for partners/IT), **Knowledge**, **Memory**,
**Harvey Mobile**. Customers: 2,400+ organizations, 200,000+ professionals, 75+ of the
Am Law 100, 70+ countries. Compliance: SOC 2 II, ISO 27001/27701/42001, GDPR, CCPA,
AIUC-1.

### Who the page is for

The page is a **demo-request funnel for buyers, not users.** People who land here:

- General Counsels and Heads of Legal Ops at large in-house teams
- Chief Innovation / Knowledge Officers and managing partners at Am Law firms
- IT and security reviewers doing vendor diligence

**Emotional context:** high-stakes, risk-averse, sceptical of AI. They are spending
millions and betting the firm's reputation on confidentiality. They don't want to be
*wowed* — they want to be *reassured* that this is serious, secure, and already trusted
by their peers. Privately they're worried about a hallucinated citation ending up in a
filing.

**Comparison set they carry:** Stripe, Linear, Vercel for craft; Palantir, Anduril,
Ramp for "serious enterprise."

### What the page must do (in order)

1. Make the claim with authority — "Build a Frontier Legal Organization."
2. Prove the product is real and considered (coded UI, not a screenshot).
3. Show *how it works* for a matter — not just *that* people trust it.
4. Lower personal risk: security posture visible early, a low-commitment CTA.
5. Let peer proof (logos, Am Law 100 number) close.

---

## 2. Critique of the live page

### First impressions

The page reads as competent and safe but generic. It's the "2024 enterprise SaaS
template": big sans headline top-left, one-line subhead top-right, black pill button,
giant product screenshot on a tinted background, then logo wall → feature cards →
testimonials → stats → security badges → CTA. Nothing in the composition says *legal*,
*frontier*, or *Harvey* specifically — swap the screenshot and it could be a fintech.
The single distinctive move — the grainy slate-green brushed texture behind the product
shot — is also the thing fighting the product for attention. The headline is a strong,
ambitious claim, but the layout gives it no authority: it sits cramped against the
subhead with no breathing room, and the visual weight of the page is entirely in the
screenshot below, not in the promise.

### Visual design

- **Texture out-proportioned to its role** — occupies ~70% of the hero viewport and is
  higher contrast than the UI it frames. The product becomes the quieter element.
  Texture should be a whisper of materiality at 5–10% presence.
- **Typographic hierarchy is two-step, not three** — headline (~64px regular) and
  subhead (~18px). No eyebrow, no caption register. The page never feels *composed*.
- ~~Headline weight is wrong for the claim~~ — **withdrawn.** The live headline is a
  400-weight serif at 72–96px; it is the strongest decision on the page. Keep it.
- **Cramped hero, misaligned baselines** — headline and subhead are top-aligned to the
  same y; the 18px cap-height sits beside the 64px cap-height.
- **Color carries no meaning** — white, black, slate-green texture, off-white app,
  green delta, one brown bar. No owned accent; the black button is the generic default.
  The texture's slate-green is available as an accent and is used only as decoration.
- **Product shot: mixed stroke language** — hatched, dotted, solid, and line charts;
  outlined icons at inconsistent optical size. Needs to be coded, not imaged.
- **No elevation logic** — the app window neither sits flat nor lifts.

### Interface design

- **No focusing mechanism** — the eye lands on the screenshot's dark sidebar first (a
  nav for a product the visitor hasn't bought), not on the claim.
- **"Trust us" ×5, "here's how it works" ×0** — logo wall, testimonials, videos, stats,
  badges; nothing walks a GC through a matter (Vault → Agent → Space → Command Center).
- **Six identical feature cards** — Research (a blog category) gets equal weight with
  Agents (the core product). No hierarchy = no story.
- **Dead-end CTA** — "Request a Demo" ×3 with no low-commitment alternative. The ROI
  calculator and security overview exist but are buried in dropdowns.
- **Undifferentiated stats** — "75+ of the Am Law 100" is the single most persuasive
  number for this audience and gets the same weight as "70+ countries."
- **Redundancy** — "2,400+" twice; "law firms and in-house" three times.

### Consistency

- **Shared type, unshared surface** — product and marketing already share the serif
  (corrected, see top). What they don't share is surface: ivory page, a different
  off-white app frame, a dark sidebar, and a textured fourth world — four surfaces in
  one viewport. And no shared *action* colour: the button is ink, the texture is
  slate, the deltas are a third green.
- **Four CTA treatments** for two intents (primary / secondary).
- **Card-everything** — information that could live on the surface is boxed.

### User context

A GC lands here after a partner forwarded the link at 9pm. The page says *the market
has decided* but does nothing to lower *their* personal risk. Emotion produced:
reassured but uninformed. Uncommon care: security posture in the hero, a visible
provenance / citation moment, practice areas named, a two-field demo form.

### Top opportunities

1. Add the missing registers — eyebrow and caption — around the serif they already
   have, so a section reads as composed rather than "big text + body text."
2. Rebuild the hero — headline authority, subhead at baseline, coded single-stroke UI on
   a texture at ~8% presence, deliberate type-to-frame relationship.
3. Add one "how it works" narrative; demote Research; rank Agents / Vault / Spaces.
4. Two-tier CTA system used everywhere.
5. Claim one accent from the texture; drop the generic black button.

---

## 3. Mood

**Bookish / chambers.** Plaster wall, ink, oak, one green-shaded lamp.

Why not the first instinct (industrial / editorial / brutalist): a legal buyer's
reference set is a partner's office, not a startup. Plaster + ink says *considered,
permanent, quiet*. The single green-lamp accent is the one intense colour moment — and
it's already latent in Harvey's own texture, so the redesign feels like a revelation
of the brand rather than a replacement. Every colour below is derived from an object in
that room.

| Role | Object in the scene |
| --- | --- |
| Ground | Harvey's own ivory — the plaster wall, as they already paint it |
| Canvas | a sheet of white paper on the desk |
| Gray ramp | stone — the same wall in shadow; text-high is Harvey's ink |
| Brand ramp | the lamp shade — teal-slate, between their `casal` and a true green |
| Highlighter | Harvey's fluorescent marker on a brief — their token, used once |
| Positive | the lamp's light on paper |
| Attention | oak, warm umber |
| Texture | ink wash on plaster |

---

## 4. Color — decisions

### Two surfaces, not one — and the ground is theirs

`--harvey-ground` is **Harvey's ivory, `#FAFAF9`** (`oklch(0.985 0.001 106)`, their
`--color-gray-50-ivory`). The first pass used a warmer "plaster" (`#F9F6F2`, hue 75);
converting theirs to oklch showed it is a near-neutral ivory at hue 106, and ours read
visibly pinker beside it. This is an improvement, not a rebrand, so the ground snaps to
the brand. `--harvey-canvas` (`#fff`) is the raised white for cards, controls, and the
app frame. The live site uses ivory for *everything* and therefore boxes content to
make surfaces; with white cards on ivory, lift is real (1.5% L) and information can sit
directly on the page.

`--harvey-page-max: 1728px` matches their page grid so the hero frame spans the same
width theirs does; `--harvey-measure: 1120px` stays for prose bands.

### Gray ramp: Tailwind `stone`, not `gray`

The previous file used Tailwind `gray` (hue ≈ 260, blue-leaning) — the SaaS dashboard
gray. Harvey's product is warm: off-white app, ink sidebar, umber attention bar. A cool
ramp under a serif on a plaster ground reads faintly blue everywhere. `stone` (hue
50–75) is the same wall in shadow. Harvey's own ramp (`#F2F1F0 … #1F1D1A`) sits at hue
68–106, chroma ≤ 0.01 — the same family, so stone is a faithful stand-in. Values are
literal Tailwind v4 oklch stops so the file has no dependency on the app's Tailwind
theme. One exception: **`gray-text-high` is Harvey's ink `#0F0E0D`**
(`oklch(0.165 0.003 68)`), not stone-950 — stone-950 was a hair darker and redder, and
ink is the colour every hairline and the texture tint are derived from, so it has to be
theirs. Generated with `.claude/skills/color-scale` (`stone harvey`), all 8 role pairs
pass contrast.

### Brand ramp: hand-tuned teal-slate, hue 185

Harvey already owns this colour and never uses it for an action. Their
`--color-dark-casal #333F40` is `oklch(0.357 0.016 203)` — the slate in the hero
texture — and it appears *only* as a background. At chroma 0.016 it is too gray to be
a button: white on it passes contrast, but next to ink it reads as "disabled," not
"go." The first pass put the accent at hue 165 (a clearly green lamp); that was
greener and 3× the chroma of anything they ship. **Hue 185, chroma 0.04** is the
deliberate midpoint: unmistakably the texture's colour, saturated just enough to be
an action. `solid` lands at ≈ `#284945`. No Tailwind family fits — `emerald` and
`teal` are far too saturated for a product whose job is to feel *calm*. The previous
token file had `brand == gray` "so an accent can be swapped in later"; this is that
swap. `brand-solid` is the CTA fill (replacing their ink button, whose hover goes
*lighter* and reads as disabled); `brand-text-high` is link / accent text on the
ground.

Contrast, checked with the same WCAG thresholds the color-scale script uses:

| Pair | Light | Dark | Min |
| --- | --- | --- | --- |
| brand text-low on bg-subtle | 12.5 | 7.6 | 4.5 |
| brand text-high on bg-subtle | 16.0 | 15.6 | 7 |
| brand border on bg-subtle | 3.9 | 3.1 | 1.5 |
| white on brand-solid | 9.8 | 5.4 | 4.5 |
| positive on canvas | 5.8 | 7.9 | 4.5 |
| attention on canvas | 8.5 | 7.4 | 4.5 |
| gray text-high on ground | 18.5 | 18.1 | 7 |
| gray text-low on ground | 7.3 | 7.6 | 4.5 |

### Status: positive is the brand family, not a second green

The old `positive` was `green-700` (chroma 0.154) — a fintech "up" green that would sit
next to the slate-green brand as two unrelated greens. Now `oklch(0.5 0.08 160)`: same
family, slightly more chroma so a delta still *reads* as growth. Brand = action = growth
becomes one semantic thread. `attention` stays warm umber (`oklch(0.42 0.03 55)`) —
oak, from the same room.

### Highlighter: their token, kept

`--harvey-highlighter: #F6F202` with `--harvey-radius-highlighter: 3px` and a
`highlighter-ink` for the text on it — lifted directly from Harvey's `:root`. It's
the one playful element in their system and it's *very* legal: a marker on a brief.
Not a second accent — budget is one use, on copy, in the hero.

### Texture as a token

The wash is hard-coded SVG in `HarveyHero.tsx`. `--harvey-texture-tint` is
`brand-solid` mixed 60% into ink, and `--harvey-texture-opacity` is `0.08` — the
"whisper" the critique asked for. Every section that uses the wash reads as the same
material.

### Hairlines inherit warmth

Rules and border shadows were `rgba(0,0,0,0.08)` — neutral black, which reads *cold* on
a warm ground. `--harvey-hairline` is ink at 10% via `color-mix`, so every rule is in
the scene. Shadow drop colours are `rgba(20,16,8,…)` for the same reason.

### Dark mode

Same roles. Ground is warm charcoal `oklch(0.15 0.008 70)`, not `#000` — the room at
night, not a void. Brand ramp lifted two stops; `solid` at L 0.52 so white-on-solid
clears 4.5.

---

## 5. Typography — decisions

**Families:** Inter (sans) and Newsreader (serif, with `opsz` axis and true italics),
loaded in `app/layout.tsx`. Newsreader's optical-size axis means the same family holds
up as a 96px headline and a 20px dashboard stat.

### Serif by default at ≥ 32px, sans at ≤ 24px

The live site already sets its headlines in a 400-weight serif (see correction at
top); our tokens match that rather than fight it. The old token file made every heading
a 600-weight, tightly tracked Inter (Geist metrics) with a `.type-serif` opt-in you had
to remember. Now the split is by size, mirroring theirs: `heading-display` through `heading-32` are Newsreader 400 (500 at 32),
tracking −0.02em → −0.01em. `heading-24` and below are Inter 600 for UI-scale headings
inside the dashboard mock and marketing chrome. `.type-serif` remains for ≤ 24 sizes
that want the product voice (stats, page titles in the mock); `.type-sans` is the rare
inverse.

Why 400 weight, not bold: a serif at display size carries authority through *size and
contrast* — bold serif reads as newspaper. Regular Newsreader at 96px next to 18px Inter
is the "very large headline next to small muted text" contrast the design guide asks for.

### Four registers, not two

The live site has headline + body. The scale now has **eyebrow → display → lede →
caption**:

| Register | Token | Family / weight | Tracking |
| --- | --- | --- | --- |
| Eyebrow | `type-eyebrow-13 / -12` | Inter 500, uppercase | +0.08em |
| Display | `type-heading-display` (`clamp(56px, 6.4vw, 96px)`) | Newsreader 400, LH 1.05 | −0.0125em |
| Section head | `type-heading-72 … -32` | Newsreader 400/500, LH 1.05 | −0.0125 → −0.01em |
| UI head | `type-heading-24 … -14` | Inter 600 | −0.01em |
| Lede | `type-copy-24 / -20` | Inter 400 | 0 |
| Body | `type-copy-18 … -13` | Inter 400 | 0 |
| Label | `type-label-20 … -12` | Inter 400 | 0 |
| Button | `type-button-16 / -14 / -12` | Inter 500 | 0 |

`type-eyebrow` is the register the live site lacks — it's what turns "big text + body
text" into a composed section.

### Leading re-fitted for Inter

Geist's scale had `copy-20` at 36px leading (1.8) and `copy-24` at 36 (1.5). Inter sets
wider than Geist; the lede under the hero headline is the most visible copy on the page
and 1.8 reads loose. Now `copy-24` → 34, `copy-20` → 30 (Harvey's own `text-body-1` is 20px at 1.3 = 26px;
ours is one step airier because our lede sits *under* the headline, not beside it).

### Display metrics are Harvey's

The live `text-heading-1` is line-height **1.05**, tracking **−0.0125em**, and
`text-heading-2/3` are −0.01em (measured, see `HarveyHero.md`). The first pass guessed
−0.02em and leading ≈ 1.06–1.19; those were replaced with theirs. Reason: the tracking
was tuned for their letterforms and their eye, and since we are improving their page —
not rebranding it — the headline must feel like *their* headline. Now: 1.05 leading on
every serif heading; −0.0125em at ≥ 56 (display, 72, 64, 56); −0.01em at 48, 40, 32.
Geist's `-4.32px`-style absolute tracking is gone — it was drawn for a grotesk and
crushes a serif.

---

## 6. Shape, stroke, rhythm — decisions

### Radius: 4 / 8 / 12, nothing pill-shaped

Components were using Tailwind's `rounded-md/lg/xl` (6/8/12). Harvey's own control
radius is 4px and their image radius is 8px — we keep both and add 12px for the coded
app frame so frame > card > control nests concentrically. `control: 4px`, `card: 8px`, `frame: 12px` — concentric
(inner radius = outer − padding) so a control inside a card inside the frame nests
cleanly. Tighter radii read as *drafted*, which is the register a legal buyer trusts.

### Stroke: 1px rules, 1.5px icons

The live product shot mixes hatched, dotted, and solid fills with icons at varying
weights. One `--harvey-stroke: 1px` for every rule and border, `--harvey-icon-stroke:
1.5px` for every icon — the coded dashboard enforces what the screenshot couldn't.

### Rhythm

- `--harvey-gutter: clamp(20px, 4vw, 64px)` — one side gutter for every section.
- `--harvey-page-max: 1728px` — the full page grid, same as Harvey's, for the hero
  frame and logo wall. `--harvey-measure: 1120px` — content band; `--harvey-measure-prose:
  60ch` for running copy.
- `--harvey-section-y: clamp(96px, 10vw, 160px)` — one vertical beat between sections.
  The live page has ~10 sections with inconsistent gaps; one beat makes the scroll feel
  authored.
- `--harvey-space-*`: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Tight (4–12) inside a
  group, generous (48–96) between groups — "vary spacing deliberately."

### Elevation

Two shadows only. `shadow-border` = 1px hairline + a 2–4px lift for cards.
`shadow-panel` = hairline + a 24/48px directional drop for the app frame. This answers
the critique's "neither flat nor lifted": cards are *barely* lifted, the frame is
*clearly* lifted, nothing in between.

---

## 7. What was kept from the previous token file

- Radix role structure (`bg-subtle → ui → border → solid → text`) and the `@theme
  inline` bridge into Tailwind utilities.
- The inset `rule-*` hairline system — ideal for the dashboard grid, and now warm.
- `.harvey-section` reset guard.
- Light / dark split on `.dark`.
- Geist's *size* ladder (72 → 12) as the base scale.

## 7b. Changes locked 2026-09-21 (Hero A build)

These came out of building Hero A in code and reviewing it at 2×. Each is in
`harvey.css`, Figma (`Harvey / Colors`) and Paper.

### Colour

| Token | Was | Now | Why |
| --- | --- | --- | --- |
| `gray/text-low` | stone-600 `oklch(0.444 0.011 73.6)` | `oklch(0.405 0.011 73)` | Read too faint at 14px on ivory. ≈9:1 now. |
| `gray/text-high` | Harvey ink `oklch(0.165 0.003 68)` | `oklch(0.135 0.003 68)` | With text-low raised, the pair needed a step more distance. Still warm, not #000. The one place we now deviate from Harvey's measured ink; hairline and the sidebar fill follow it. |
| `warning` | — | `oklch(0.55 0.12 80)` · dark `0.78 0.12 85` | Status amber. Needed for the green / yellow / red badge trio. L 0.55 so white on it clears AA (≈4.6:1). |
| `negative` | — | `oklch(0.52 0.17 25)` · dark `0.7 0.14 25` | Status red. Chroma 0.17 — at 0.12 it read as brick when set as thin text. |
| `info` | — | `oklch(0.55 0.14 250)` · dark `0.75 0.12 250` | Icon accent: AI / agent. |
| `insight` | — | `oklch(0.55 0.15 300)` · dark `0.76 0.12 300` | Icon accent: search. |

`attention` (umber) is unchanged and now only owns callouts — badges and flag
tiles use `negative`. Seven accents in total (brand, positive, warning, negative,
attention, info, insight); a later pass should decide whether `attention` still
earns its place.

**Colour semantics, dashboard:** `brand` = action (primary buttons, citation
chips). `positive` = state (running, done, up). `negative` / `warning` = status.
`info` / `insight` = icon kind only. Never a second green for an action.

### Glyph tiles

Every standalone icon in the dashboard is a Hugeicon at 14px / 1.5 stroke on a
24px tile (`radius/control`). Two tile modes:

- **Neutral** — `gray/ui` fill, icon `text-high` or `text-low`, edge is
  `--harvey-shadow-glyph`: a 1px inset ring of `canvas` (a white bevel inside the
  gray tile) + a hairline outer ring of ink at 6%. On the ivory ground the tile
  fill vanishes, so ground-surface tiles use `canvas` fill (`tone="ground"`). On
  the dark sidebar: `gray/solid` fill with a 1px inset ring of `ground` at 10%.
  A tinted (green) ring was tried and went muddy against white — rejected.
- **Kind** — solid tile in the kind's colour, white icon, 4px halo of the same
  colour at 18%. file → `positive`, folder → `warning`, AI → `info`, search →
  `insight`, lock → `text-high`, check → `positive`, flag → `negative`. Main
  dashboard only; the sidebar stays neutral. Hero risk reducers use the same tile
  with explicit fills (ink, ink, positive).

Inside filled buttons the icon is `bare` (no tile) so a button never carries a
second box; buttons get +1px padding on the side without the icon.

### Status badges

Green / yellow / red / gray. A top→bottom gradient of the tone (lightened 18% →
the tone), white text, 1px inset ring one step darker, faint top highlight. 24px
tall, 14/400, `radius/control`. Replaces the status dots.

### Type — dashboard locked to three sizes

| Size | Weight | Where |
| --- | --- | --- |
| 24 | 500 · 400 | header title · KPI metric |
| 16 | 500 · 400 | card headers · header subtitle, KPI label row |
| 14 | 400 · 500 | sidebar, all list data · buttons, monograms, badges |

One family (Inter) inside the dashboard. `type-copy-14` and `type-label-14` are
identical for plain text (14/20/400); they differ only in `<strong>` weight.

### Two CSS bugs found and fixed

1. **Fonts never resolved.** `harvey.css` set `--harvey-font-serif: var(--font-harvey-serif)` on `:root`, but next/font puts its variable on `<body>`, and the name collided with the `@theme` key, making it circular. Every serif rendered as system sans. Fix: next/font variables renamed to `--harvey-sans-src` / `--harvey-serif-src` (`layout.tsx`) and resolved on `.harvey`.
2. **Weight utilities never applied.** The `.harvey .type-*` scale was unlayered CSS, which always beats Tailwind's `@layer utilities` — so `font-medium` / `font-normal` silently lost and every "500" rendered at 400. Fix: the type scale now lives in `@layer components`.

### Buttons

Three recipes (`btn-primary`, `btn-ink`, `btn-ghost` in `harvey.css`, `@layer
components`), one construction: a top→bottom gradient of the fill (lightened
14–16% → the fill), a 1px inner highlight on top, a 1px inner shade at the
bottom, a ring one step darker than the fill, a 1px lift. Hover deepens the fill.
Ghost = canvas → ground with a white inner highlight and the hairline ring. Icon
inside a filled button sits in a 24px box (white at 15% on primary; the neutral
glyph tile on ghost); the hero CTA arrow is the 45° `ArrowUpRight01`. Text side
gets +1px padding.

### Agent run rail

Connector is solid `positive` after a completed step (the path travelled) and
dotted `gray/border-subtle` from the current step on (the path ahead). Done
steps' text sits at 60% opacity, the next step at 50%; only the current step is
full strength. Kind tiles stay at full so the rail keeps its colour.

### Surfaces

- **Tray** — lists sit in a `p-2` well: inner list tinted with the sidebar colour (`text-high`) at 4% + hairline ring, `radius/control`. Used by Review status, Open flags and the agent run.
- **Bezel** — the dashboard sits in a 4px frame: gradient white → `brand/solid` top to bottom, 16px radius (concentric with the 12px frame), three shadows incl. a brand-tinted ambient. The bottom stop is a literal `#284945` — Figma can't bind a gradient stop to a variable.
- **Ribbon** — the Figma shader "Harvey Ribbon Wash" (`16905aa4…`) is ported to WebGL in `HarveyRibbon.tsx` (same math, same defaults). Motion: sway ±0.05 / ~19 s, breathe ±6% / ~13 s, sheen travel ~30 s, fold drift. Static under reduced motion; paused off-screen; SVG fallback. Colours are sRGB copies of `brand/ui-active`, `brand/solid`, `brand/border-hover` — update the three hexes if those tokens move.

## 7c. Critique pass, 2026-09-22

A full Interface Craft critique of the built Hero A, and what each finding
changed. All applied in code and Figma.

### Visual design

| Finding | Change |
| --- | --- |
| 22 kind tiles with 18% halos — the loudest thing on the screen; in the table the tile repeats the Type column | Halo 18% → 10% everywhere; KPI tiles demoted to neutral so the row stops competing with the agent card |
| Two greens on the hero row — `positive` trust tile 60px from a `brand` CTA, with no way for the reader to learn the rule | Trust tile → ink, like its siblings. One green above the fold: the CTA |
| Badge and button were the same object — gradient, ring, control radius, 24 vs 28px, 300px apart. "In review" looked clickable | Badges are now a flat 14% tint with tone text and a 22% ring. The gradient recipe belongs to buttons only |
| Ribbon faded out exactly where the right column starts, washing the agent card but not the left | Shader `fade` 0.75 → 0.85 |

### Interface design

| Finding | Change |
| --- | --- |
| Four identical red flag tiles repeated the KPI's alarm and added nothing | Rows now lead with a severity badge (High / Med) and carry an age column — the list differentiates instead of repeating |
| Nothing told the reader what "Request a demo" costs | One `text-low` line under the CTAs: "A 30-minute call on your own practice area. No deck, no commitment." |
| "2-minute" lived only in the button label | Duration is now a chip inside the ghost button ("Watch the walkthrough · 2:04") |
| The KPI row — first proof of substance — sat below the fold at 1440×900 | Hero stack tightened (padding 88 → 64, gap 40 → 16, wrap 64 → 48); artboard 1647 → 1575 |

### Consistency

| Finding | Change |
| --- | --- |
| Two arrow families 250px apart; `ArrowUpNarrowWide` reads as a sort control | KPI deltas use plain `ArrowUp02`; the 45° `ArrowUpRight01` stays the CTA arrow |
| "Not started" was a gray-solid badge — looked like a disabled button | Solved by the flat-tint badge: `gray/text-low` at 14% with tone text |

### Not changed

The structure. Hero order, dashboard composition, the run timeline and the
token set all held up under the critique; every fix above is second-order.

## 8. Redesign posture

This is an **improvement**, not a rebrand. Keep: the serif at 72/80/96, the ivory
ground, the ink text, the warm stone neutrals, the 4px control radius, the 12-column
grid. Change: composition, hierarchy registers, one owned action colour, a two-tier
CTA, texture dialled to a whisper, a coded product frame with one stroke language,
and a hero screen that shows legal work. The measure of success is conversion — the
demo request and a new lower-commitment step — not novelty.

## 9. Not yet decided

- Whether the nav is on ground or canvas (affects whether it needs a rule-b).
- Exact texture SVG parameters once the tint/opacity tokens are wired into
  `HarveyHero.tsx`.
- Section order for the rebuilt page (hero → how it works → products → proof → security
  → CTA is the working assumption).
