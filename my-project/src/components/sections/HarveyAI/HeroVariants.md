# Hero variants — five conversion hypotheses

Paper: "Product Redesign" → page "harveyAI" → artboards **Hero A–E**.
Tokens: `harvey.css` / Paper tokens (`--color-harvey-*`, `--font-harvey-*`, …).
Live-site baseline and critique: `HarveyHero.md`. Decision record: `product.md`.

All five share: the live headline, the serif at 400 / LH 1.05 / −0.0125em, the
ivory ground, the teal-slate primary CTA, one 1.5px icon stroke, 1px ink hairlines,
12 / 8 / 4 radii, flex-only layout, and a **coded** product screen — no images.
What differs is the *argument* each hero makes to a risk-averse legal buyer, and
therefore what it puts within reach of the first click.

---

## A — Single Lane

**Layout.** Left-aligned stack at 64px gutter: eyebrow → 88px headline (720px
measure, breaks "Build a Frontier / Legal Organization") → 20/30 lede → primary +
secondary CTA → risk-reducer row → full-width Vault frame, 12px top radius, cropped
at the fold. Artboard 1440 × 1100.

**Conversion hypothesis.** *Hesitation happens at the button, so put the reasons
not to hesitate directly under it.* The live site's subhead + CTA sit in a separate
right-hand lane the eye skips; here the claim, the pitch, the action and the
reassurance are one paragraph read top-to-bottom. The risk-reducer row (SOC 2 / ISO,
"never used for training", "75+ of the Am Law 100") sits 20px below the primary
button — the exact place a GC pauses.

**Screen.** Vault "Due diligence — data room": document table with review status
lanes + a diligence-agent panel answering a change-of-control question with three
cited sources and two next actions. Shows *legal work*, not adoption analytics.

**Secondary CTA.** "Watch a 2-minute walkthrough" — a step that costs nothing.

**Best for.** The default. Lowest risk; closest to the reference layout the team
already likes.

**Built (2026-09-21) — `HarveyHero01.tsx`, routes `/harvey/01` and `/harvey/01b`
(`focus` variant).** What the build changed from the sketch above:

- **Screen is a full Vault dashboard**, not a cropped table: sidebar with the
  live app's groups (primary + More, Apps, Recents + View history, Spaces with
  monogram tiles), header "Vault / Your saved documents" with Upload (white) and
  Ask Harvey (ink), a KPI row, **Review status** table, **Open flags** list, and
  an **agent run** card. Activity card removed — it was a fourth trust element
  at the cost of the agent's space.
- **KPI tiles show the change, not the total** — `[kind tile][label]` on top,
  `[narrow-wide arrow][212 today]` below at 24/400 in the tone. Absolute values
  dropped: on this screen the delta is the number. Down = the same arrow rotated.
- **Agent card is a run timeline, not a chat** — Task → Index → Extract →
  **Draft (current, 2 of 3, with the three consent letters and a progress bar)**
  → Approve (dim). The Q/A bubble version read as a chat with no composer.
  Actions (Review draft / Open in Agents) sit on the text column.
- **Status badges** replace dots; **Resolve** is a brand primary like Review
  draft; kind-coloured glyph tiles on every row (see `product.md` §7b).
- **Type** locked to 24 / 16 / 14 in the dashboard; `text-low` and `text-high`
  both raised.
- **Ribbon** is now the WebGL port of the Figma shader with slow motion; the
  dashboard sits in a white→green 4px bezel over a gradient + grain wrap.
- Header title centres on the sidebar wordmark line (32px); optical +1px padding
  on icon buttons.

`focus` adds: right column 380, "Running · 72%" pill, `attention`-tinted flags
KPI, High/Med severity badges leading the flag rows. Recommendation stands:
make `focus` the default.

---

## B — Split, Product Right

**Layout.** Two columns: 560px copy (64px headline, lede, CTAs, logo strip) left;
an 860px Assistant frame right that bleeds off the right and bottom edges. Artboard
1440 × 800 — the whole argument is above the fold.

**Conversion hypothesis.** *The thing a sceptical lawyer fears is a confident wrong
answer; show a cited one before they scroll.* The frame is not decoration — it's an
answer to "what is the limitation period…" with [1][2][3] inline and a Sources rail
that names a statute, a case, and a document from the firm's own Vault. The
titlebar says "Firm workspace · zero retention". The hallucination objection is
handled by the hero itself.

**Screen.** Assistant thread: user question, cited answer, "Verify every citation"
action, composer pinned to the fold, 280px sources rail.

**Secondary proof.** Five customer names in the serif under "Trusted by 2,400+
legal organizations" — social proof without a logo wall.

**Best for.** Litigation / research-led buyers; audiences arriving from "is legal
AI reliable?" searches.

---

## C — Proof First

**Layout.** Centred editorial: shield-eyebrow with the four certifications → 96px
headline (900px measure) → centred lede → primary + "Read the security overview" →
a 1120px four-stat strip with hairline rules → a Contract Intelligence frame on a
0 → 8% teal-slate gradient band. Artboard 1440 × 1160.

**Conversion hypothesis.** *For a buyer who needs to justify the decision upward,
peer proof before the ask beats product before the ask.* The live page buries "75+
of the Am Law 100" in section 8 at equal weight with "70+ countries"; here it is the
first number in the strip, in 40px serif, 64px under the buttons. Compliance is the
*eyebrow*, not the footer. The secondary CTA is the security overview — the document
a GC forwards to IT.

**Screen.** Contract Intelligence "Supplier agreements — renewal risk": four
summary tiles (one umber, one positive — the only colour in the frame), then a
portfolio table with risk lanes. Reads as ROI.

**Best for.** In-house GCs and legal-ops leads; enterprise procurement.

---

## D — Choose Your Path

**Layout.** Hero row, vertically centred: copy left (72px headline, 640px; lede;
compact risk-reducer row) and a 440px column of two role cards right — *For law
firms* (brand-filled CTA) and *For in-house teams* (outlined CTA), each with three
outcome bullets. Below, a full-width Space frame. Artboard 1440 × 1100.

**Conversion hypothesis.** *Two small decisions beat one big one.* "Request a demo"
is a single high-commitment door; "Request a firm demo" / "Request an in-house
demo" lets the visitor self-segment, which (a) lowers the perceived size of the
step, (b) routes to a relevant demo, and (c) gives sales the segment before the
call. The card bullets are the value statements the live subhead never makes.

**Screen.** Space "Acme Acquisition" with three organisations, an *Ethical wall
active* badge, workstream cards (one "Agent running"), an activity feed, and a
"Who can see what" rail ending in "Agents inherit each org's permissions. Nothing
crosses the wall." Governance made visible.

**Best for.** Mixed traffic; testing whether segmentation lifts form completion.

---

## E — How It Works

**Layout.** Headline (80px, 700px) left; lede + CTAs right-aligned in a 480px
aside on the same baseline. Below, three equal columns joined by arrow connectors:
**1 Upload the matter** (Vault) → **2 An agent drafts** (Agents, step badge in
brand) → **3 Counsel reviews** (Spaces). Each column is a coded mini-UI, top corners
rounded only on the outer two so the trio reads as one surface. Artboard 1440 × 900.

**Conversion hypothesis.** *The live page argues "trust us" five times and never
once shows "here's what happens".* A buyer who can picture the workflow — data room
in, cited draft out, partner approval logged — has fewer questions left for the
demo and more reason to book it. Step 3 ends on "Partner-approved · audit logged"
and a "Share with client" button: the human stays in charge, which is the sentence
every GC needs to hear.

**Screens.** (1) Upload drop-zone "Drop a data room, or connect iManage" +
indexing file list. (2) Agent memo draft in the serif with [1][2][3] and the line
"Every citation links to the exact clause". (3) Comment thread — co-counsel asks for
a carve-out, the agent redrafts with a citation, the partner approves.

**Best for.** Innovation / knowledge officers; anyone who bounced from the live
page because it didn't explain the product.

---

## Shared decisions (why every variant looks like this)

- **Primary CTA in `brand-solid`, not ink.** The live ink button's hover goes
  *lighter* (gray-500), which reads as disabled. Brand darkens on hover and is the
  one owned colour moment on the page.
- **Secondary CTA is always a lower-commitment step** — walkthrough, security
  overview, or a segmented demo — so the visitor who isn't ready to talk to sales
  still has somewhere to go.
- **Eyebrow register on every hero.** The missing third register from the critique.
- **Coded screens, one stroke language.** 1.5px icons, 1px hairlines, one chart
  vocabulary, concentric radii, fixed icon slots so lanes align across rows.
- **Colour is semantic only inside the frames**: `positive` for done/growth,
  `attention` for flags, `brand` for the agent / the action. Everything else is
  stone.
- **Texture is a whisper.** Only C uses it, as a 0 → 8% gradient band; the product
  sits *above* the material with a real panel shadow.

## Recommended test order

1. **A vs. live** — isolates the composition fix.
2. **A vs. D** — does segmentation lift demo requests?
3. **A vs. E** — does "how it works" reduce bounce for cold traffic?
4. B and C as audience-targeted landing pages (paid litigation / in-house campaigns)
   rather than the default hero.
