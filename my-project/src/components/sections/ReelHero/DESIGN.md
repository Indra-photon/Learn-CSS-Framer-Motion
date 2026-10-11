# ReelHero

A ring of showreel thumbnails that presents one reel at a time at its crest,
with the copy set _inside_ the circle on the opposite side. Ported from an
Editframe video composition; the geometry is unchanged, the time source is not.

## The one formula

Every card centre is a point on a circle. Nothing else about a card is chosen:
its size, its fade and its blur are all read off a single number — how far it
is from the crest — through one curve.

```
d  = distance(card, crest)  normalised to [0, 1]
f  = (1 - d) ** gamma
scale   = minScale + (maxScale - minScale) * f
opacity = minOpacity + (1 - minOpacity) * (1 - d) ** (gamma / 2)
blur    = depthBlur * d
```

`gamma` is the whole character of the piece. At `1` the ring is a ramp and every
card is legible; at `2.3` — the default — the crest card is an order of magnitude
bigger than the one a quarter-turn behind it, which is what makes the far side
read as a scatter of specks rather than a row of small pictures.

`falloff` only picks the metric. `arc` steps down evenly and reads as a
sequence; `chord` reads as one hero and a field of dust. At a quarter turn with
`gamma: 2.3`, `arc` sizes a card at 0.203 and `chord` at 0.059.

## What the port changed

| Editframe                                                    | Here                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| `useTimingInfo()` → integer `frame`                          | `useAnimationFrame` → `beats` motion value                      |
| `planCrest(props, frame)` each frame; React re-renders 60×/s | geometry runs inside `useTransform`, straight to the compositor |
| a card per ring _position_, reels rotating through them      | a card per _reel_, travelling the ring — no `src` ever changes  |
| `durationInFrames`, loop must close                          | `phi` unbounded — there is no loop point on the web             |
| `out.toSorted()` assigns `zIndex`                            | `z = round((1 - distance) * 1000)`                              |
| copy box estimated from an average glyph advance             | copy box measured with a `ResizeObserver`                       |
| fixed `1280 × 720`                                           | measured stage; radius, card size and `centerX` all derived     |

Three of those are worth more than a line.

**Paint order.** The original sorted slots by distance to assign `zIndex`, and
its own comment conceded that the pair straddling the crest has to trade the top
slot at some frame, with nothing to interpolate the handover away. `distance` is
already a continuous function of `phi`, so reading `zIndex` off it directly
removes the discrete event rather than excusing it — and removes the sort.

**Re-render count.** A card's _position_ is continuous and lives in motion
values. _Which reel it shows_ is not: it steps as `floor(phi)` steps, and an
`<img src>` cannot be a motion value. So that index is the component's only
state, updated from a `useMotionValueEvent` guard — once per beat, not once per
frame. Twelve cards animate with zero React work between beats.

**The type is sized, not clamped.** A CSS `clamp()` scales the headline with
the _viewport_, but the column it has to fill is the distance from the gutter to
the ring's centre — which moves with the radius and the card size too. So the
headline size is solved from the measured column and the longest line the copy
actually contains, and the longest line lands on the ring's centre line at every
width (verified: 52–60% of the screen, 1024px up to 2000px). Caps like
`max-w-[20ch]` undo this silently — the column is wide, the text just refuses to
fill it — so there are none on the headline. The subhead keeps a readable
measure and simply ends earlier.

**`centerX` is solved, not chosen.** The crest sits at `centerX + radius`, so a
hardcoded fraction is a bet on one viewport width — and the moment the stage is
narrower than the bet, the one card at full size hangs off the right edge.
Solving for the centre from the gutter pins the crest card's right edge at every
width and keeps the composition lopsided, which was the point of moving it off
centre at all. The card to fit is the _popped_ one — `crestPop` makes the crest
wider than `cardWidth`, and leaving that out of the fit is exactly how it ends
up hanging off the edge. It clears the edge by the same gutter the copy starts
on, so one measurement brackets the whole composition.

## Two other flickers, while we were here

**The filter.** `filter` was emitted as `none` below a threshold and
`blur(Npx)` above it. Toggling between the two creates and destroys a
compositing layer — and the crest card crosses that threshold on _every beat_,
because its blur passes through zero exactly when it is largest on screen. It
now always emits a blur, `0px` included, so the layer is stable.

**The `srcset`.** `fill` plus a `sizes` derived from the measured card width
means a resize rewrites `sizes`, the browser re-picks a candidate, and that is a
fetch, a decode and a flash. A fixed intrinsic `640x360` resolves to one URL for
the life of the page.

## Why the fade is painted, not applied

`opacity` on a card makes the _card_ translucent, so wherever two cards overlap
you see the far one through the near one — and stacking order becomes visible,
since `A over B` and `B over A` composite differently when both carry alpha.

Instead each card stays fully opaque and takes a scrim of the stage colour on
top. A distant card still looks faded — it is blended toward the background it
sits on — but it occludes properly. This needs a stage that can be parsed as a
hex colour; without one the component falls back to element opacity.

## The text void

The copy sits inside the circle, so the ring's far side runs straight through the
headline column. The cards get out of the way of the type, not the other way
round: `veilAt` ramps a card's **scale** to zero inside the copy box. Scale, not
opacity — a card fading out over type washes it for the whole fade, whereas one
shrinking to nothing has already stopped covering anything by the time it
arrives. That is why the copy needs no plate, no scrim and no box behind it.

Below `900px` the stage stacks: the copy goes to the top, the ring's centre is
pushed down from the _measured_ copy bottom by one radius, and the stage height
is derived to hold copy + crest card + label. The void is switched off there,
because there is nothing left to dodge.

## Swing

```
phi(t) = t -+ (swing / 2pi) * sin(2pi * t)
dphi   = 1 -+ swing * cos(2pi * t)
```

Runs at `1 + swing` at the beat edges and `1 - swing` in the middle, and lands
on `phi(0) = 0`, `phi(1) = 1` exactly. No normalisation, no drift, nothing to
snap. `swingAt: "slot"` slows on a card; `"gap"` slows between two.

Verified numerically: monotonic, rate range exactly `0.5 → 1.5` at
`swing: 0.5`, and whole beats land on integers.

## Interaction

- **Autoplay** at `bpm`, paused when out of view (`useInView`), on hover, and
  while dragging. A backgrounded tab's frame delta is clamped to 50ms so the
  ring does not resume with a jump.
- **Drag** anywhere on the stage. One grip surface covers the whole ring — the
  cards are `pointer-events: none`, so nothing hit-tests twelve transformed
  elements. Drag distance converts through the arc length of one slot, and
  release adds a sixth of the travel as momentum for the spring to settle.
- **Arrow keys** step one reel. The grip is a focusable `role="slider"` carrying
  `aria-valuenow` and the crest reel's name.
- **Reduced motion** stops the autoplay only. Drag and keys still work, and a
  hint says so — a frozen component would be worse than a manual one.
- The ring is `aria-hidden`; the reels are listed once in an `sr-only` list.

## The type scale

Five steps, and every one a real ratio apart:

| Role    | Size           | Notes                                          |
| ------- | -------------- | ---------------------------------------------- |
| Display | solved, 34–132 | Longest line lands on the ring's centre        |
| Figure  | 44             | The proof number, when it is shown             |
| Lead    | 26             | Subhead                                        |
| Body    | 15             | Buttons                                        |
| Micro   | 11             | **One** uppercase label style, used everywhere |

Before this there were six sizes — 111, 19, 17, 14, 13, 12 — one shout and then
a 12-to-19px mush where nav, eyebrow, subhead and two buttons all read as the
same tier. The gap from display to the next size was 5.8×, so the hero had two
levels of hierarchy, not a scale.

Opacity is no longer doing hierarchy's job. It carried five tiers — 100%, 72%,
62%, 24%, 22% — two of which were the same value reached twice by accident. It
now has two: full, and 60% for supporting text.

`spotlight.accentColor` was `#ffffff` against `#f5f5f5` ink: ten units of
lightness apart, invisible at label sizes. The design had no accent at all.

## The headline is solved twice

Once for width — the longest line landing on the ring's centre — and once for
height, against what the stage has left after the header, subhead and actions.
The display size is the smaller answer.

Solving only for width is how a hero ends up with a headline taller than its own
stage on a short, wide window: the column widens as the viewport widens, and
nothing in that sum knows about height. The solve reads the copy's real line
count and strips the emphasis markers before counting characters — they are
syntax, not glyphs — so rewriting the headline re-sizes it with nothing else
touched. Verified landing on the ring's centre line to the pixel from 1024px to
2000px.

The copy block centres in the space _below_ the header, measured rather than
assumed, so commenting the header out simply gives the headline its space back.

## A serif in the display

Runs of the headline wrapped in asterisks are set in Instrument Serif italic. A
display-size grotesque slab is one undifferentiated mass; a contrasting face
gives it a stress and internal hierarchy **without adding a size to the scale**.

The serif is optically smaller than the grotesque at the same pixel size and
needs far less negative tracking, so both are corrected at the run — `1.06em`
and `-0.015em` against the headline's `-0.04em`. Left uncorrected it reads as a
mistake rather than a decision.

## Colour follows the crest

The accent is not a constant. Every reel carries an `accent` pulled from its
artwork, and the hero's accent is whatever is currently being presented.

The crest caption gets it for free — it renders in its _own_ reel's colour, so
the `land` crossfade that was already swapping captions is the colour
transition too. The headline's emphasised words need a single colour at a time,
so they read `accentAt`, which sums every reel's accent weighted by its `land`.

That works because `land` sums to exactly `1`: the weights are already a
partition. Verified — exact match on a reel's own colour at every beat, a
maximum single-step change of 1/255 across 90,000 samples, and midpoints that
are the arithmetic mean of the two neighbouring accents rather than a drift
toward grey.

## The call to action

One button, and it is not a pill. A pill with a flat fill is the default SaaS
button and reads as a component someone installed — the wrong note under a
display headline this size.

`BevelButton` is three stacked layers:

| Layer     | Role                                            |
| --------- | ----------------------------------------------- |
| **edge**  | the full shape, light-to-dark diagonal gradient |
| **face**  | inset 1.5px, its own vertical gradient          |
| **label** | unclipped, so type is never cut by the chamfer  |

The layering is what makes the bevel real. A `border` cannot do it: `clip-path`
cuts the border along with the box, so the chamfered corners lose their outline
entirely. Insetting a second clipped layer leaves exactly 1.5px of the edge
gradient showing the whole way around — including along the diagonals — and
because that gradient runs light at the top-left to dark at the bottom-right it
reads as a lit edge rather than as a stroke.

Corners are cut on opposite diagonals. Cutting all four reads as a stop sign;
cutting two gives the shape a direction.

Two details that are easy to get wrong:

- The drop shadow is a **`filter`**, not a `box-shadow`. A box-shadow is clipped
  away with everything else; `drop-shadow` follows the chamfered silhouette.
- The focus ring sits on the **unclipped anchor**. Anything painted inside the
  clipped layers is cut by the chamfer, outlines included.

The secondary action is gone. Two buttons side by side made the reader rank them
before acting; one does not.

## The proof figure

Currently commented out of the hero — it made a fourth block in an already tall
column — but `ProofFigure` stands ready.

Swapped, not spun. An odometer animates every digit on every change, which is a
lot of motion for a figure that changes once, and it competes with the headline
during the entrance. `AnimatePresence` keyed on the value swaps the numeral
alone: it rises 16px and resolves out of an 8px blur, while the unit beside it
never moves. `popLayout` takes the outgoing numeral out of flow so the unit does
not shuffle sideways while the two overlap.

## The scroll hand-off

`phi` is the sum of three terms — the autoplay clock, the drag offset, and the
page's own scroll. Because `running` is gated on `inView`, the clock stops as
the section leaves and the scroll term is the only thing still turning the ring.

So the gallery neither freezes on its way out nor keeps ticking where nobody can
see it: it hands over, and the page finishes the rotation. The term is sprung so
a trackpad flick does not snap it, and it is zeroed under reduced motion.

## Entrance

```
   0ms   stage, vignette and grain only; no gallery, ring held at phi 0
 180ms   headline lines rise, 70ms apart
 520ms   subhead
 660ms   proof figure, when it is shown
 780ms   call to action AND gallery, together — the gallery eases 10px
         left to right, on the copy's own spring
1240ms   gallery has landed; the ring is released into autoplay
1480ms   crest rail crossfades in
```

**The order is the argument.** The type states the offer, the action appears,
and only then does the work arrive to back it up — rather than everything being
present at once and the reader having to choose where to start.

**The gallery arrives with the copy, not as its own event.** Same spring, same
direction of travel, 10px. It moves left to right, the way the eye is already
reading. Distance is the thing to get right here: the gallery is the largest
object on the stage, so a value that reads as subtle on a line of type reads as
a lurch on a 400px ring. An earlier pass had it sweeping in proportionally from
off-stage right — far too strong, and it made the gallery a separate
performance instead of part of one arrival.

**Nothing rotates until it has finished travelling.** Two motions on one object
at once read as a glitch: the ring would appear to rotate *and* drift, and
neither would be legible. Landing first, then turning, keeps each a separate
statement — even at 10px.

That hand-over is timed, not hoped for. Simulated against Motion's own spring
generator, the 10px entry is within half a pixel of rest 454ms after launch, so
`settle` sits at 460ms after it (`-0.471px`). The earlier 420ms gap left it at
`-0.664px` — invisible, but the point of a storyboard is that the timings are
known rather than assumed.

One integer drives the whole sequence; the storyboard comment at the top of
`ReelHero.tsx` is the source of truth and each element only asks whether its cue
has passed. Scattered booleans drift the moment a timing changes. Under
`prefers-reduced-motion` the sequence jumps straight to its last cue, so the
gallery is simply in place.

## The credit rail

Under the crest card: the client's real mark on the left, the format on the
right, the rail spanning the card's own width and pushing the two to its ends.
That is what makes it read as a caption _belonging to_ the card rather than a
label floating near it — the rail's edges are the card's edges, so the eye
reads one object instead of two.

The marks are real, from `tech-stack-icons`. A logo does work a set name
cannot: it is recognised before it is read, and for a studio the client list
_is_ the credential. The reel's `label` survives as the accessible name, used
by the `sr-only` listing and `aria-valuetext`, and is never drawn.

`StackIcon` renders its own wrapper span and sizes the svg at 100%/100% of it,
so the size has to go on the component — wrapping it and styling `> svg`
matches nothing and collapses the mark to zero. The `dark` variant is the one
drawn for dark stages: mostly white fills, with the few marks that would be
unreadable in mono keeping their brand colours.

Type and logo stay one size while the card behind them grows ten times between
the far side and the crest. They sit outside the card's transform, so only the
rail's _width_ tracks it. `land` is a raised cosine over one slot's angular
width and sums to exactly `1` across all slots, so the pair straddling the
crest crossfades perfectly: no flicker, and never two credits at once.

## Where the accent goes

The eyebrow is gone. It was the weakest place in the hero to spend a colour —
a 11px uppercase line at the top of the column, read once and never again.

The accent now paints the **emphasised words in the headline**. Runs marked
`*like this*` take the live blended accent, so the display type is tinted by
whatever reel is on the crest and shifts as the ring turns. It is the largest
element on the page, which is where a colour tied to the work belongs, and it
means the headline and the gallery share a property rather than merely sharing
a viewport.

## Tuning

Everything in `reel-geometry.ts` is pure, so the knobs can be swept without
React. The ones that change the character, in order: `gamma`, `falloff`,
`minScale`, `swing`, `preset`. `arcSpan < 360` opens the ring into an arc and
switches on the end fades and the off-span margin positions.

The number of cards is the number of reels. That is now load-bearing, not a
default — see the inversion above.
