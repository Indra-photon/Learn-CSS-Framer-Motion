# Stacked Tower — build plan (static SVG + live text)

Status: **plan only, no implementation.** All numbers are measured off the
reference at 615 × 369 and doubled into a 1230 × 738 working space. Treat them
as ±6px starting values, not gospel — the tuning pass is step 8.

---

## 1. What the picture actually is

Four **cylindrical units** stacked into a deliberately unsteady tower, seen from
slightly above. Every unit is the same primitive, only the proportions and
colors change:

```
  ┌ collar ─┐   thin wide cylinder, accent hue, no ribs
  │  drum   │   taller cylinder, main hue, vertical ribs on the front wall
```

The unit above is **narrower** than the collar below it, so the collar shows as
a ring peeking out around the base of whatever is standing on it. That ring is
the single detail that makes the stack read as stacked rather than as four
shapes pasted on top of each other.

Bottom-to-top: green drum + violet collar → pink drum + light-pink collar →
blue drum + amber collar → rust drum (smooth, no ribs, it's the cap).

**One ambiguity, flagged:** the violet band could be read either as the collar
of the green drum or as a separate base plate under the pink drum. I'm building
it as green's collar — it keeps the primitive uniform across all four units and
is visually indistinguishable at this size. Say the word if you read it the
other way.

---

## 2. The camera — one constant, obeyed everywhere

There is no SVG perspective transform here and there shouldn't be. The whole 3D
read comes from a **single fixed ellipse ratio**:

```
ry = 0.26 × rx        // for every ellipse in the drawing, no exceptions
```

Break this on one shape and the eye immediately reads that shape as tilted
rather than as sitting at a different height. It is the one rule with zero
tolerance.

Consequences that follow from it:
- Nothing gets a `rotate()` or a `skew()`. Height is expressed purely as
  vertical offset between two identical ellipses.
- Wider shapes automatically look like they're at the same eye level as narrow
  ones, because the ratio holds.
- Because 0.26 is shallow, the camera is low — we're barely above the top of the
  stack. That's why the rust cap shows only a sliver of top face.

---

## 3. Geometry table

Working space: `viewBox="0 0 1230 738"`.
`cx` = center x, `rx` = drum half-width. Collar `rx` = drum `rx` + 14.

| # | Unit | cx | drum rx | ry | lid top | lid h | drum h | drum bottom | lid cx | lid rx |
|---|------|----|---------|-----|---------|-------|--------|-------------|--------|--------|
| 04 | amber (cap) | 646 | 176 | 41.4 | 239 | 12 | 60 | 311 | 646 | 190 |
| 03 | blue | 499 | 216 | 50.8 | 295 | 12 | 126 | 433 | 499 | 226 |
| 02 | pink | 586 | 224 | 52.6 | 417 | 12 | 126 | 555 | 583 | 236 |
| 01 | green | 668 | 216 | 50.8 | 539 | 12 | 180 | 731 → clipped | 662 | 237 |

**A lid's topmost point is `lidTop − ry`, not `lidTop`** — the cap reaches 45px
above its own number. Ignore that and it collides with the headline, which is
exactly what happened at lidTop 228: the cap topped out at y183 against a
headline descending to y184. Every lidTop then shifted +11 together, which moves
the tower without disturbing any of the four sinks.

Ordinals run 01 at the foundation to 04 at the cap, and are printed in the
callouts. A stack implies an order; without the numbers both readings are
available and they mean opposite things.

**Stacking rule:** `collar_top_cy(N) = drum_bottom_cy(N−1 above) − sink`, sink
14–20. The upper drum's bottom ellipse is drawn but then covered by nothing —
it simply sits inside the collar's mouth, and the collar ring shows in the band
between the two bottom arcs.

**The wobble:** cx runs 604 → 544 → 586 → 688. Deltas −60, +42, +102. This
zig-zag is load-bearing; an aligned stack loses the hand-stacked charm entirely.
Optionally give each collar its own ±8 cx jitter off its drum.

The green drum runs **past the bottom of the card and is clipped**. Keep that —
the crop is what makes the tower feel taller than the frame.

---

## 4. Drum construction

Each unit is exactly three drawn pieces, in this order:

1. **Top face** — a full `<ellipse>` at `(cx, top_cy)`, `rx`/`ry`.
2. **Front wall** — one path:
   ```
   M (cx−rx, top_cy)
   V (bottom_cy)
   A rx ry 0 0 0  (cx+rx, bottom_cy)     ← front arc, bulges DOWN
   V (top_cy)
   A rx ry 0 0 1  (cx−rx, top_cy)        ← back up along the top ellipse's front arc
   Z
   ```
   Sweep flags matter: left→right through the bottom is `sweep 0`;
   right→left through the front of the top ellipse is `sweep 1`. Get these
   backwards and the wall inverts into a bowtie.
3. **Ribs** — see below, clipped to the wall path.

The back half of the bottom ellipse is never drawn. It's hidden by the drum
itself, and drawing it produces the classic "wireframe glass" mistake.

---

## 5. Ribs — the detail that sells it

Do **not** space ribs evenly in x. Space them evenly in *angle* around the
cylinder, then project:

```
for i in 1 … N:
    θ  = π · i / (N + 1)
    x  = cx − rx · cos θ
    y1 = top_cy    + ry · sin θ
    y2 = bottom_cy + ry · sin θ
    line (x, y1) → (x, y2)
```

Three things fall out of this for free and all three are visible in the
reference:
- ribs bunch up toward the left and right silhouette edges (foreshortening),
- each rib **starts on the curve of the top ellipse**, not on a flat line,
- ribs are longest at the center and shortest at the edges, because top and
  bottom arcs curve in parallel.

Ribs are not painted flat. They take their colour from the same ramp as the
drum, then blend into it:

```
ribStep    -0.8          the drum wall sits at 1.8, so ribs land lighter than it
ribOpacity  0.6
ribBlend    overlay
```

What matters is the step RELATIVE to the drum wall's 1.8, not its sign. Below
that number the ribs are lighter than the wall and read as raised ridges
catching light; above it they are darker and read as grooves cut into it. Same
geometry, opposite object. Blending rather than stroking flat lets each rib pick
up the wall colour underneath instead of sitting on it as a foreign line.

At −0.8 the ribs sit 2.6 steps clear of the drum wall, which is what makes the
corrugation actually visible. An earlier 0.8 put them only 1.0 step away and the
ribs disappeared at viewing size — 120 line elements for no payoff. `plus-lighter` is also on the dial but adds channel
values and blows out to white quickly — keep `ribOpacity` low with it.

The rib group must sit inside an `isolation: isolate` group. Without it the
blend reaches past the drum and mixes with the canvas and with whatever unit is
painted underneath — which, in a stack that overlaps by design, is very visible.

All four drums carry 30 ribs at 1.5 weight, the cap included — it is no longer
the smooth exception it is in the reference.

Wrap all ribs in a `<clipPath>` built from the wall path so nothing bleeds past
the silhouette. Collars are never ribbed.

---

## 6. Shading and contact

Subtle. The reference is nearly flat and gets its depth from geometry, not from
rendering. Four passes, all low-opacity:

1. **Wall gradient** — horizontal `linearGradient`, base color in the middle,
   ~8% black at both x-extremes. Both edges, not one; there's no directional key
   light in this illustration.
2. **Contact crescent** — on each collar's top face, a soft dark ellipse where
   the drum above lands, offset ~6px down. Clip it to the collar's top face.
3. **Top-face lift** — each top face is 6–8% lighter than its wall, so the lid
   reads as catching more sky.
4. **No drop shadows on the page.** The tower has no ground plane; a cast
   shadow would invent one and break the floating crop at the bottom.

---

## 7. Line, color, type

**Stroke:** every silhouette and every top-face rim gets `#17161C` at 3px
(in the 1230-wide space). Ribs and shading get no stroke. Uniform weight —
no line-weight hierarchy, that's what makes it read as flat vector illustration
rather than as a render.

**Palette — derived, not authored.** Each unit carries ONE base colour in
OKLCH. Every surface on it is that colour walked down a shared ramp:

| Surface | Ramp step |
|---------|-----------|
| lid top face | 0 (the base) |
| lid wall | 1 |
| drum wall | 1.8 |
| ribs, edge falloff | 3.4 |
| contact shadow | 3.0 |

The ramp does three things per step, and the second and third are the point:

```
lightness  −5.5      darker
chroma     +0.016    MORE saturated, not less
hue        −3°       small rotation
```

Dropping lightness alone is what makes shadows go muddy — desaturating toward
black is literally what it does. Climbing chroma into the shade keeps them
reading as coloured light, and the hue rotation stops the ramp looking computed.
Base lightness also ORDERS the stack: 62 → 70 → 78 → 86 from foundation to cap,
even 8-point steps. Chroma is not the ordering channel and stays low; a steep
chroma ramp over darker bases compounds into neon very fast.

Consequences worth knowing:
- The edge falloff is tinted with the unit's own dark shade. A black overlay
  would cancel exactly the chroma the ramp just added.
- Same for the contact shadow — tinted, never black.
- This makes each unit monochrome, which **departs from the reference**, where
  the blue drum wears an amber lid and the green drum a violet one.
- High chroma at high lightness can leave sRGB; browsers gamut-map it, so it
  renders, but two units tuned past ~0.2 may converge on screen.

Base colours: 01 green `62% 0.09 149`, 02 pink `70% 0.075 345`,
03 blue `78% 0.055 238`, 04 amber `86% 0.095 62`. edgeShade 0.16,
contactShade 0.3. Surround: canvas `oklch(98% 0.009 84.6)`, frame
`oklch(86.4% 0.05 322.9)`, ink `oklch(20.4% 0.012 293)`.

**Type — real `<text>`, not outlined paths.** Selectable, translatable,
searchable, and it survives font-size changes.

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| brand "Cardinal" | 30 | 600 | centered, small bird glyph to its left |
| headline | 54 | 400 | centered, "Your sales motion, built by you" |
| labels | 30 | 500 | flanking the tower |

The bird glyph is the one piece that must be a hand-authored path.

**Leaders — curved, and derived.** Each callout is a cubic bezier sweeping from
the text down into the shape, with an arrowhead at the tip.

Both control points are placed **horizontally** from their anchors. That is what
makes the curve leave the text flat and arrive at the shape flat; angled
controls give a lazy diagonal that reads as a mistake rather than as a drawn
line. It also means the arrowhead needs no rotation — the tangent at the tip is
exactly horizontal by construction.

Anchors are derived from the unit (`cx ± rx` at the drum's vertical midpoint),
never authored, so the arrows track the shapes when the geometry is tuned.

```
lead    60     shape edge → text
bow    -28     text rides above the tip
curve   54     control strength
opacity 0.55   the leader is subordinate to the drawing
stroke  1.2    thinner than the 1.5 silhouette line
```

**Type carries hierarchy by weight, not size alone.** Label 29px/600; support
21px/400 at 0.6 opacity. The support line was 17px and vanished at projection
size — 1.4% of slide width. The ordinal rides inline ahead of the label at
support size, weight 700, 0.42 opacity. Three axes moving together separate the two lines far
more cleanly than shrinking the second one.

| # | Label | Side | Support |
|---|-------|------|---------|
| 04 | Target Ads | right | In-market accounts |
| 03 | Outreach | left | Adaptive sends |
| 02 | Content | right | Stage-matched assets |
| 01 | Lookalike Audiences | left | From your best accounts |

"Similarities" was renamed — it was a data concept sitting among three channels
and actions, and it was the foundation layer, where the register matters most.

Support copy is **placeholder** — invented, not supplied.

**The layout constraint worth knowing:** blue's left silhouette sits at x=283,
leaving ~255px of card before the edge. That left gutter — not the right side —
is what caps both `lead` and how long a support line can be, and it tightened
again when the support type went up to 21px. At 21px that gutter holds ~164px,
or about 15 characters — "Adaptive sequences" needed 196px and ran into the
frame. Check new support copy against that budget before using it. Widen the
viewBox if fuller sentences are wanted.

## 8. Draw order

Strict painter's algorithm, **bottom of the tower first**:

```
frame + canvas
brand, headline
clipPath (card interior)  ─┐
  green collar → green drum │
  pink collar  → pink drum  │  each unit fully drawn before the next
  amber collar → blue drum  │
  rust collar  → rust drum  │
                          ─┘
leaders + labels           ← always on top, never occluded
```

Every occlusion in the picture is produced by paint order alone. There is no
masking anywhere except the two `clipPath`s (ribs-to-wall, tower-to-card).

---

## 9. File shape

```
sections/StackedTower/
  geometry.ts       camera constant, unit table, rib projection helper
  StackedTower.tsx  pure presentational SVG, maps over the table
  tokens.css        block-scoped color vars
```

Driving the SVG from `geometry.ts` rather than hand-authoring 40 magic numbers
is the difference between "we can retune this in a minute" and "nobody touches
it again." The rib helper and the wall-path builder are each a five-line pure
function.

**Accessibility:** `role="img"` on the root with a `<title>`/`<desc>`; the four
labels stay as live `<text>`.
**Responsive:** one `viewBox`, `preserveAspectRatio="xMidYMid meet"`, no fixed
pixel dimensions anywhere.
**Static:** no motion in v1.

---

## 10. Build order

1. `geometry.ts` — camera constant + table + the two helpers.
2. One unit, flat fill, no ribs. Verify the wall path doesn't bowtie.
3. All four units stacked. Verify collar rings show and the wobble reads.
4. Ribs with angular spacing. This is where it starts looking right.
5. Strokes.
6. Shading passes.
7. Frame, type, leaders.
8. Tuning pass against the reference — expect to move cx offsets and drum
   heights by 10–20px each. Everything else should hold.

---

## Open questions

1. Violet band — green's collar (my reading) or a separate plate under pink?
2. Headline font — the reference is a geometric grotesque. Match to whatever the
   project already ships, or pull a specific face?
3. Leader arrows — I read a chevron + rule + arrowhead. Confirm against the
   source if you have it larger.
