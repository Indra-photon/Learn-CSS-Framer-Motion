# Three heroes, and why each one beats the live Harvey hero

Built variants, as shipped in code:

| # | Name | Route | File | Figma / Paper |
| --- | --- | --- | --- | --- |
| A | Single Lane | `/harvey/01b` | `HarveyHero01.tsx` | mirrored in both |
| B | Offset | `/harvey/01` | `HarveyHero02.tsx` + `HarveyRibbon.tsx` | code only |
| C | Choose Your Path | `/harvey/01c` | `HarveyHero03.tsx` + `HarveyPathPanel.tsx` | code only |

Baseline for every comparison below is the measured teardown in
[`HarveyHero.md`](./HarveyHero.md) — values read from harvey.ai's own stylesheet
on 2026-09-20, not from a screenshot. Token reasoning lives in
[`product.md`](./product.md); the five original hypotheses (including the two we
did not build) live in [`HeroVariants.md`](./HeroVariants.md).

---

## 0. The diagnosis all three answer

The live hero is a strong opening sentence in a weak composition. Five things go
wrong, and they go wrong together:

1. **Two lanes that never touch.** The headline occupies columns 2–7; the subhead
   and button are pinned `self-end` in columns 7–10. The eye runs headline →
   image and skips the pitch and the action entirely.
2. **The image out-shouts the claim.** A 1648px shot whose slate texture covers
   ~55% of its pixels, with the darkest pixels on the page in its corners, and no
   shadow on the app frame — so the product sits *on* the texture rather than
   above it.
3. **It is the wrong screen.** Command Center is adoption analytics: a chart about
   people using software, shown to someone who has not bought the software. The
   alt text still describes an Acme Acquisitions *space* — the image was swapped
   and the alt was not.
4. **One door, and it is a sales form.** `Request a Demo → /contact-sales` is the
   only action, with nothing telling the visitor what happens after the click. A
   security reviewer in diligence mode has nowhere to go.
5. **The brand colour does no work.** `dark-casal #333F40` exists, appears only as
   texture, and the button is ink. Harvey owns a colour and spends it on a
   background.

Every variant fixes 1–5. They differ in *how they earn the click*.

---

## 1. Variant A — Single Lane (`/harvey/01b`)

**Hypothesis:** the live hero's failure is structural, not conceptual. Put the
claim, the pitch and the action in one column on one left edge, and the same
words work.

### Decisions

**One lane, not two.** Eyebrow → headline → lede → CTA row → expectation line →
risk reducers, all flush left at `px-16`, `gap-4`. The subhead is `max-w-[820px]`
with `text-balance`, so it breaks where the headline breaks and the block reads as
one paragraph rather than two columns.

**An eyebrow the live site does not have.** `type-eyebrow-13` — 13px, 500, 0.08em
tracking, uppercase, `gray-text-low`. It is the third register the live hero lacks
and it costs 16px of height. Without it the 96px serif arrives with no run-up.

**Two-tier CTA.** Primary `btn-primary` in `brand-solid` — the slate-green, finally
doing a job — at 48px with a 24px arrow tile, beside a `btn-ghost` "Watch the
walkthrough". The ghost is the whole point: the sceptic gets a step that is not a
form. Hover **darkens** on both; the live button hovers to `gray-500`, lighter than
its fill, which reads as disabled.

**Expectation setting.** "A 30-minute call on your own practice area. No deck, no
commitment." The live hero never states the cost of the click, and this buyer is in
diligence mode about everything, including the meeting.

**Risk reducers inline.** SOC 2 / ISO 27001 / ISO 42001 and "Your data is never
used for training" as 14/500 rows with ink glyph tiles. On the live page this
material is a whole section three scrolls down; here it is the last thing read
before the product.

**The product shot is code, not a screenshot.** A full Vault dashboard —
sidebar, KPI row, Review status table, Open flags, a running Diligence agent — in
a 4px bezel with a white→`brand-solid` gradient and a brand-tinted drop shadow. It
shows a *matter*, not analytics about matters. Being code, it holds one icon stroke
(1.5px), one type register (14/16/24, weights 400/500) and concentric radii, where
the live screenshot carries five chart fill treatments and at least two icon stroke
weights.

**Texture as a whisper.** `--harvey-texture` at ~8–10% behind the frame instead of
a painting behind everything, and a real shadow under the bezel so the product
reads as the top layer.

### Why it beats the live hero

Same claim, same serif, same ivory — but the claim, the pitch and the two doors
are one object, the product below shows legal work with a shadow under it, and the
sceptic has somewhere to go that is not sales. It is the minimum honest fix, and
it is the one we mirrored into Figma and Paper because everything else is built
from its parts.

---

## 2. Variant B — Offset (`/harvey/01`)

**Hypothesis:** the strongest thing Harvey can show is that the product is bigger
than the page. Mintlify's composition, Harvey's language.

### Decisions

**Copy held to the left half, frame bleeding off two edges.** The copy column caps
at 720px; the frame is 1240px wide, positioned `top-[360px] left-[45%]`, running
off the right and bottom. The page becomes a window onto a larger tool instead of a
framed screenshot. (45%, not 42% — the two risk reducers need 568px of lane and 42%
clipped the second. Documented in the file, because it looks arbitrary and is not.)

**Headline capped at 64px.** The display token is tuned for a full-width lane; in a
half-width column it wrapped to four lines. The cap is a composition decision, not
a scale change — the token is untouched.

**A stat pill above the headline.** "Am Law 100 firms on Harvey · 75+". The first
thing read is peer proof, which is what this buyer actually weighs. On the live
page the logo wall carries this and arrives 200px too late.

**A real shader, not an image.** `HarveyRibbon` in `lines` mode: a bundle of thin
rays in straightened polar space around a node just off the top-right corner,
`a = th + bend·r² + drift`, windowed to a wedge so it reads as a bundle rather than
a starburst, with a copy mask holding the rays to 18% opacity behind the headline.
Colours are sRGB copies of the brand tokens. Static under
`prefers-reduced-motion`, paused off-screen, DPR capped at 1.5, SVG fallback.

**The texture moves from the frame to the section.** In A, the bezel's green lip
closes the composition at the bottom. Here the frame bleeds off-screen so that lip
is cropped away, and a 560px ground wash fills the empty lower-left quadrant the
copy leaves behind. The gradient is tilted 190° and compressed to a 38% stop so
the green lands on the *visible* left ring.

### Why it beats the live hero

The live hero's image is large and passive: it sits inside the grid, fully
contained, with nothing above it. Here the frame is larger still but *cropped*,
which implies depth rather than claiming it, and the background is generative and
tied to the brand colour instead of a static slate painting that outweighs the UI.
The copy column stays legible because the rays are explicitly masked away from it —
the failure mode of every hero shader is that it fights the headline, and this one
is told not to.

---

## 3. Variant C — Choose Your Path (`/harvey/01c`)

**Hypothesis:** a managing partner and a GC want genuinely different things, and
the live hero makes them read the same sentence. Segment in the first three
seconds instead of the fourth scroll.

### Decisions

**Real copy, not invented marketing.** Every line in the panel is Harvey's own,
from `/solutions/law-firms` and `/solutions/in-house`: the headline, the three
capability lines, the proof numbers, the use-case names, the Reed Smith and Adecco
quotes. A partner recognises their own vocabulary — "billable work", "playbooks",
"AmLaw 100" — in under a second.

**One window, not two cards.** The first build put two cards side by side. It cost
the hero ~600px of horizontal lane, squeezed the claim to 460px and 52px type, and
made the reader parse ~120 words of near-identical body copy to answer a one-word
question. The choice now lives in a segmented control and the card below it only
ever holds the answer — so the claim gets its full 748px back at 80px, and the
panel sits far right with real air between them.

**The switch is the interaction, so it gets the motion.** The active pill is a
single `layoutId` element sliding between the two tabs — the motion itself says
"two states of one thing" rather than "two separate buttons". The card body swaps
with `AnimatePresence mode="popLayout"`, which pulls the outgoing body out of flow
the instant the new one mounts, so the two never stack mid-transition. The card
carries `layout`, so its height animates between the two datasets on the shared
spring instead of holding a floor height — a floor sized to the taller dataset left
a ~50px hole above the CTA in the shorter one, which is the exact dead space the
two-card version was criticised for. `reducedMotion="user"` makes all of it
instant when the OS asks.

**The CTA never re-enters.** It sits outside the presence boundary; only its label
crossfades. The eye keeps its anchor across the swap, and the button is always
`btn-primary` — the earlier primary/ghost pairing implied Harvey preferred you
were a law firm, which on a fork is a real signal and the wrong one.

**Proof number promoted.** "80%" / "1,000+" at 24/500 in the card header, beside a
14px label. In the first pass they were 14px `text-low` in the top-right corner —
smaller than the bullet text, despite being the single most persuasive thing on
screen for their reader.

**Bullets split at the em dash.** Claim in 14/500 `text-high`, detail in
`text-low`. Same words, roughly half the reading time, and the differentiator stops
being buried in the middle of a three-line sentence.

**Use cases directly under the card headline.** "Research · File creation ·
Document review · …" is the "is my work in here?" answer, so it reads before the
detail rather than as a footnote after it.

**Headline at weight 500.** The only place we deviate from Harvey's 400 serif. Next
to a ruled card with its own edges, the 400 display read as a quiet caption; 500
gives the claim the weight the two-column composition needs without leaving the
family. Documented as a deliberate exception in the component.

### Why it beats the live hero

The live hero asks one question of two audiences and routes both to the same form.
This one asks which audience you are, answers in your own words, shows the number
that matters to your seat, and hands you a CTA already routed to your segment. Two
small decisions instead of one large one — and the small one costs a click, not a
form.

---

## 4. What all three inherit

These are variant-independent and live in `harvey.css` + `HarveyHero01.tsx`. The
full reasoning is in `product.md`; the short version of why each one answers a
specific live-site failure:

| Decision | Live-site failure it answers |
| --- | --- |
| `brand-solid oklch(0.38 0.04 185)` on every primary action | the brand colour existed only as texture; the button was ink |
| Buttons hover **darker**, with gradient + inner highlight + ring | live hover goes to `gray-500`, lighter than the fill, reading as disabled |
| Shadow-only edges — no CSS `border` anywhere | four surfaces and five radii in one viewport |
| Concentric radii, controls at 4px | radius drift: 4 / 6 / 8 / 8 / 12 |
| Three sizes (14 / 16 / 24) and two weights (400 / 500) in the product shot | five chart fill treatments and two icon stroke weights in one screenshot |
| One icon family at 1.5px stroke, on 24px tiles | visibly mixed stroke weights in the live sidebar |
| Colour semantics: brand = action, positive = state, negative/warning = status, info/insight = icon kind | two unrelated greens doing unrelated jobs |
| Glyph tile goes neutral when the row's status is neutral | — (our own bug: an amber folder beside "Not started" said two things) |
| `gray-text-low oklch(0.405 0.011 73)` for secondary copy | live subhead is `gray-800`, 13:1 — hierarchy by size only |

---

## 5. Scorecard

| | Live | A · Single Lane | B · Offset | C · Choose Your Path |
| --- | --- | --- | --- | --- |
| Claim, pitch, action in one lane | ✗ | ✓ | ✓ | ✓ |
| Second, non-sales door | ✗ | ✓ walkthrough | ✓ walkthrough | — one routed CTA by design |
| Cost of the click stated | ✗ | ✓ | ✓ | ✓ |
| Peer proof above the fold | ✗ | ✓ reducers | ✓ stat pill | ✓ proof number + quote |
| Product shows legal work | ✗ analytics | ✓ Vault | ✓ Vault | ✓ Vault |
| Product above the texture | ✗ | ✓ | ✓ | ✓ |
| Brand colour on actions | ✗ | ✓ | ✓ | ✓ |
| Segmented for role | ✗ | ✗ | ✗ | ✓ |
| Keeps their serif, ivory, ink | — | ✓ | ✓ | ✓ 500 weight |

---

## 6. What we deliberately kept from Harvey

Serif headline at 72/80/96 weight 400, line-height 1.05, tracking −0.0125em ·
`text-wrap: balance` on headlines and `pretty` on body · ivory `#FAFAF9` ground
and near-ink text · the warm stone ramp · 4px control radius · the
12-column / 10-column inner band. The redesign is an improvement, not a rebrand —
every token traces back to something measured on their live site.

## 7. Open

- Variant B's "Watch the walkthrough" still uses a "2:04" chip as a stopgap; it
  wants a real 16:9 thumbnail.
- Variant C shows the same Vault screen behind both doors. The honest version
  swaps the screen with the panel, so each door visibly leads somewhere.
- B and C are code-only; only A is mirrored in Figma and Paper.
