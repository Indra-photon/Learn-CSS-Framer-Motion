# Harvey hero — as shipped, and critique

Source: https://www.harvey.ai/ fetched 2026-09-20 (HTML + all Next.js CSS chunks).
Values below are read from their stylesheet, not eyeballed. Where a value is from
the hero image it says so.

> Correction to the earlier critique in `product.md`: the live headline is **not** a
> regular-weight grotesk. It is `HarveySerifFont` at 72–96px, weight 400. The Paper
> frame "Hero Section" is an older capture (or rendered with a fallback font). The
> serif-vs-marketing-sans split is therefore *already closed* on the live site; what
> remains is everything else below.

---

## 1. What is there

### Structure (DOM order)

```
header  (h = 72px, blurred ivory tint, nav: Platform · Solutions · Customers · Security · Resources · Company)
main
  section.HeadlineHeroSection  [data-theme=white]  padding-top: 72px
    .page-width grid (12 col, gutter 20px, max-w 1728px, px 40px)
      inner: col 2 → 12 (10 cols), subgrid
        h1.text-heading-1            col-span 5      "Build a Frontier Legal Organization"
        div  (flex col, gap 36px)    col 7 → 10      self-end
          p.text-body-1.text-secondary   "The world's top law firms and in-house legal teams
                                           trust Harvey with their highest-stakes work."
          a  "Request a Demo"  → /contact-sales
    .mt-lg (72px)
      img  3296×1796 px, full 12 cols, rounded 8px, alt "Harvey UI showing Acme
           Acquisitions space with shared documents, agents, and more"
```

There is no eyebrow, no secondary CTA, no proof line, no caption on the image.

### Measured tokens

| Thing | Value |
| --- | --- |
| Page ground | `--color-gray-50-ivory` `#FAFAF9` |
| Text primary | `--color-gray-950-ink` `#0F0E0D` |
| Text secondary (subhead) | `--color-gray-800` `#33312C` |
| Button bg / text | `#0F0E0D` / `#FAFAF9`, hover `#8F8B85` (gray-500) |
| Button | h 48px, px 20px, radius 4px (`--radius-sm`), weight 500, `transition-colors 300ms ease-out` |
| Headline family | `HarveySerifFont` (custom; 400 regular + 400 italic only) |
| Headline size | 48px base → **72px ≥1025** → **80px ≥1445** → **96px ≥1730** |
| Headline | weight 400, line-height 1.05, tracking −0.0125em, `liga`+`calt` on, `text-wrap: balance` |
| Subhead family | `HarveySansFont` = **ABC Diatype Variable** |
| Subhead | 20px (`--text-md`), weight 400, line-height 1.3, `text-wrap: pretty`, max-w 560px on mobile |
| Section top pad | `--spacing-lg` = 64px, 72px ≥1445 |
| Gap headline → image | `--spacing-lg` = 64 / 72px |
| Gap subhead → button | `--spacing-md` = 32 / 36px (desktop) |
| Image radius | 4px mobile, 8px ≥1025 |
| Grid | 2 / 6 / 12 cols; gutter 14 / 16 / 18 / 20px; side padding 28 / 32 / 36 / 40px |

### Their full palette (from `:root`)

```
gray-50-ivory #FAFAF9   gray-100 #F2F1F0   gray-200 #E5E5E3   gray-300 #CCCAC6
gray-400 #ADABA5        gray-500 #8F8B85   gray-600 #706D66   gray-700 #524F49
gray-800 #33312C        gray-900 #1F1D1A   gray-950-ink #0F0E0D

dark-casal   #333F40   ← the slate in the hero texture
dark-bronze  #593D3A
dark-velvet  #373340
light-blush  #D9CDCC
highlighter  #F6F202   (radius 3px, used for text highlights)
green #16A34A   yellow #EAB308   red-500 #F26161   red-50 #FEEAEA
```

Their neutral is a **warm stone ramp** — ivory to ink — with named accent colours
(`casal`, `bronze`, `velvet`, `blush`) that appear only as texture backgrounds. No
accent is used for actions. The action colour is ink.

### Hero image (1648 × 898 as served; read from the image)

- Full-bleed brushed texture: `casal` slate-green fading to a pale sage on the upper
  left, heavy grain, near-black at the lower left and right edges.
- App frame: ~1370 × 735, radius ~12px, no visible shadow, centred with ~80px of
  texture visible top/bottom and ~140px left/right.
- Sidebar: 248px wide, `#1F1D1A`-ish, serif wordmark "Harvey", 15 nav rows across
  four groups (main · Apps · Recents · Spaces), one selected state, avatar footer.
- Content: serif page title "Whitford Lane's Command Center" (~32px); an
  ink-on-white notice bar; a 2×2 card grid — DAU/MAU stat 49.5% ↑5% with a line chart
  over a hatched area chart; Product usage grouped bars (solid ink, dotted gray, one
  umber); Active users 305 ↑10% with a hatched area chart; Top power users
  horizontal bars.
- Chart vocabulary counted: solid fills, dotted fills, hatched fills, a thin
  line, a thicker smoothed line. **Five** fill/stroke treatments in one screenshot.
- Icons: outlined, ~16px, stroke weights visibly differ (the "Command Center" chart
  glyph is heavier than "Agents" / "Vaults").
- Two greens: chart delta green `#16A34A`-class and the texture's slate `#333F40`.

---

## 2. Critique

### Context

Buyer-facing demo funnel for GCs, innovation partners and security reviewers at
large firms. Risk-averse, sceptical of AI, diligence mindset. The hero has one job:
make the claim credible in three seconds and give them a first step they can take
without talking to sales.

### First impression

The type is right and the composition is not. A 96px regular serif on ivory is a
confident, editorial opening — this is the best decision on the page. Then the
layout undercuts it: the subhead + button are pinned to the headline's *bottom*
edge in the right half of a 10-column band, so the claim and the pitch sit in two
lanes that never touch, with a 72px void beneath them before a 1648px image
arrives and takes over. The eye goes headline → image, skipping the subhead and the
button entirely. The image is doing the persuading, and the image is a screenshot
of an analytics dashboard — the least legal-feeling screen in the product.

### Visual design

**Texture outweighs product** — In the image the slate texture covers ~55% of the
pixels and its darkest corners are darker than any UI element. The app frame has no
shadow, so it sits *on* the grain rather than *above* it. The product is the quieter
layer. Texture should be ≤10% presence: a tint behind the frame, not a painting.

**Two greens, no owned accent** — `casal` `#333F40` is in the texture; `#16A34A` is
the delta green in the stat cards. Neither is used on the button (ink) or anywhere
in the marketing chrome. Harvey has a brand colour and doesn't use it for a single
action.

**Five fill treatments in one screenshot** — solid, dotted, hatched, thin line,
smoothed line. Each was presumably chosen to differentiate series, but together
they read as five different chart libraries. One fill, one line weight, series
differentiated by *value* (ink / gray-400) would read as one system.

**Icon stroke inconsistency** — outlined 16px glyphs at at least two stroke
weights in the same sidebar. A buyer won't name it; they'll feel "not quite
finished."

**Subhead colour is barely secondary** — `gray-800` `#33312C` on ivory is 13:1
contrast, two stops from ink. It's hierarchy by *size* only. Either it's secondary
(gray-600, `#706D66`, still 6.6:1) or it's not.

**Button is the generic default** — ink fill, 4px radius, 48px tall, 20px side
padding, `hover → gray-500`. Hover to a *lighter* gray on an ink button reads as
disabled, not active. There is no secondary treatment at all.

**Headline column is too narrow for the size** — 5 of 10 columns ≈ 680px at 1440.
At 80px the headline breaks "Build a Frontier / Legal Organization" — fine — but at
1730px+ (96px) it's 5 cols ≈ 820px and breaks the same way, leaving the right half
of the band empty above the subhead. Width and size scale together but the
*composition* doesn't change.

### Interface design

**No focusing mechanism** — headline (96px serif), button (ink block), and a
1648px dark-edged image compete. The darkest pixels on screen are the texture
corners, so the image wins. The claim should win.

**Subhead is a trust statement, not a value statement** — "The world's top law
firms … trust Harvey with their highest-stakes work" restates the logo wall that
follows 200px later. We're missing the opportunity to say *what Harvey does* in
one line before asking for a demo.

**Single, high-commitment CTA** — "Request a Demo" → `/contact-sales` is the only
action. A security reviewer or a sceptical GC has nowhere to go that isn't a sales
form. We're missing a second, lower-stakes step: security overview, 2-minute
walkthrough, ROI calculator (which exists in the nav dropdown).

**Wrong screen for the hero** — the image is Command Center: adoption analytics
for a partner who already bought. The visitor hasn't. Vault, an Agent drafting, or a
Space with co-counsel would show *legal work*, not *usage of legal work*. The alt
text even says "Acme Acquisitions space with shared documents, agents" — the image
was swapped and the alt wasn't.

**No expectation setting** — nothing tells the visitor what happens after
"Request a Demo" (a form? a call? how long?). Buyers in diligence mode want to know
the cost of the click.

**Image has no caption or anchor** — 1648px of UI with no label saying what
you're looking at. A single eyebrow ("Command Center · Firm-wide adoption
analytics") would turn decoration into evidence.

### Consistency & conventions

**Marketing and product now share type but not surface** — headline and app title
are the same serif (good). But marketing ground is ivory `#FAFAF9`, the app frame
is a different off-white, the sidebar is a third dark, and the texture is a fourth
world. Four surfaces in one viewport.

**Radius drift** — button 4px, image 8px, app frame in the image ~12px, cards
inside it ~8px, sidebar selected-state ~6px. Five radii.

**`text-wrap: balance` on the headline, `pretty` on the body** — correct, and
worth keeping.

### User context

The GC feels *impressed and unlocated*. The serif says "we're serious"; the
analytics dashboard says "here's a chart about people using software"; the single
button says "talk to sales." Nothing lowers their personal risk or shows them a
matter. Uncommon care here: name the practice areas in the hero, show a legal
artefact (a redlined clause, a cited answer), and give the reviewer a path that
doesn't start with a form.

---

## 3. What to keep

- Serif headline at 72/80/96, weight 400, line-height 1.05, tracking −0.0125em.
- `text-wrap: balance` / `pretty`.
- Ivory ground and ink text; the warm stone ramp.
- 12-column page grid with a 10-column inner band.
- 4px radius on controls.
- ABC Diatype as the sans (we substitute Inter; Diatype is licensed).

## 4. Top opportunities for the rebuild

1. **One lane, not two** — headline full 10-col width; eyebrow above; subhead and
   CTAs *below* the headline on the same left edge. The claim, the pitch and the
   action read as one paragraph.
2. **Two-tier CTA** — primary in `brand-solid` (slate-green, not ink), secondary as a
   ghost/text link to security or a walkthrough. Hover darkens, never lightens.
3. **Texture as a whisper** — `--harvey-texture-tint` at `0.08` behind a coded app
   frame with a real `shadow-panel`; the product sits above the material.
4. **Code the product shot** — one 1.5px icon stroke, one chart fill, one line
   weight, concentric 12/8/4 radii, and a screen that shows legal work (Vault or an
   Agent thread), captioned with an eyebrow.
5. **Subhead says what Harvey does** — one line of value, then let the logo wall
   carry trust.
