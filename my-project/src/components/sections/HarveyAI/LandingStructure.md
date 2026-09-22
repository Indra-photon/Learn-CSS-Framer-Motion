# Landing page — structure audit and restructure plan

Source: https://www.harvey.ai/ (HTML fetched 2026-09-20; section classes read from markup).
Companions: `product.md` (tokens, decisions), `HarveyHero.md` (hero critique),
`HeroVariants.md` (five hero directions). Paper: "Product Redesign" → harveyAI.
Figma: Design-System-01 → HarveyAI.

---

## 1. What's there now

| # | Their component | Content | Job |
| --- | --- | --- | --- |
| 1 | `HeadlineHeroSection` | h1, subhead, one CTA, Command Center screenshot | Claim |
| 2 | `CustomerLogoGridSection` | "2,400+ Legal Organizations Build on Harvey" + ~36 logos | Trust |
| 3 | `AudienceRouterSection` | "One Platform for Legal Work" → For Law Firms / For In-House | Segment |
| 4 | `CenteredMediaHeroSection` | "Introducing Harvey II" (New) + demo CTA | Announce |
| 5 | Product carousel | Agents · Spaces · Vault · Contract Intelligence · Command Center · Research — six identical cards (h3s duplicated in DOM by the carousel) | Features |
| 6 | `QuoteCarouselSection` | 3 quotes: Deutsche Telekom GC, Reed Smith AI director, Syngenta legal ops | Trust |
| 7 | `CaseStudyCarouselSection` | "Real Impact for Real Clients" — 7 video thumbnails | Trust |
| 8 | `StatsSection` | 25+ hrs · 200,000+ · 2,400+ · 70+ countries · 75+ Am Law 100 | Trust |
| 9 | `PolicyLinkGridSection` | "Enterprise-Grade Security and Controls" + 7 badges + "More About Security" | Reassure |
| 10 | Final CTA | "Unlock Professional Class AI for Your Organization" + demo | Ask |

Ten sections. Five are trust (2, 6, 7, 8, 9). One explains the product (5), as six
equal cards. Zero show how it works. CTAs on the whole page: "Request a Demo" ×3,
"More About Security", "See More Videos".

The argument as sequenced: claim → everyone uses it → pick your side → new version →
six nouns → people like it → videos → numbers → badges → ask.

---

## 2. Gaps

1. **No "how it works."** The sceptical buyer's first question — what happens to my
   matter? — is never answered anywhere on the page.
2. **No outcome in the buyer's terms.** "25+ hours saved" sits unexplained in a stat
   row at section 8. Nothing connects a number to a mechanism.
3. **Product section has no hierarchy.** Agents (the core), four supporting products,
   and Research (a blog category) get identical cards. No relationship between them
   is shown: Vault feeds Agents, Agents work inside Spaces, Command Center watches.
4. **Trust is fragmented into five sections** at equal weight. Logos, quotes, videos,
   stats, badges — five ways to say "others trust us." Spread out they're wallpaper.
5. **Security is section 9.** For a GC it's a gate, not a footnote. Badges without
   the controls behind them don't clear the objection.
6. **"Introducing Harvey II" interrupts the funnel.** A version announcement between
   "pick your audience" and "here are the products" reads as a press release.
7. **Audience router is too early.** Segmenting at section 3, before the visitor
   knows what the product is, asks them to choose blind — with one sentence per card.
8. **Video as the proof format.** Seven thumbnails ask for 2–5 minutes each. The
   skimming buyer wants a name, a number and a quote in five seconds.
9. **Single, high-commitment CTA.** "Request a Demo" three times; no lower step.
10. **No objection handling.** Hallucination, confidentiality, associate adoption,
    jurisdiction / practice-area fit — none addressed except by implication.
11. **Redundancy.** "2,400+" in sections 2 and 8. "Law firms and in-house" in hero,
    section 3 and footer. "Request a Demo" ×3.
12. **`:Harvey:` markup leak.** The wordmark token renders literally inside h2s in
    some contexts ("Build on :Harvey:", "Introducing :Harvey: II").

---

## 3. Restructure

Principle: **one lane, one argument — each section answers the next question the
buyer would ask.** Claim → what is it → how does it work → what do I get → who says
so → is it safe → which door is mine → what's next.

| # | Section | Question | Content | Change |
| --- | --- | --- | --- | --- |
| 1 | **Hero** | What is this? | Chosen hero variant (A default). Risk-reducers + secondary CTA live here | Rebuilt (see `HeroVariants.md`) |
| 2 | **Logo strip** | Who else? | One row, ~10 logos ranked by recognition; caption "75+ of the Am Law 100" | Compressed from a 36-logo wall; the wall moves to /customers |
| 3 | **How it works** | What happens to my matter? | 3–4 steps: Upload → Agent works → Counsel reviews → Firm-wide view. Each step a coded mini-UI | **New.** The narrative spine |
| 4 | **Platform** | What are the parts? | Agents as the lead (large); Vault · Spaces · Contract Intelligence · Command Center as supporting (smaller); Knowledge / Memory as one line | Six equal cards → a hierarchy. Research → footer |
| 5 | **Outcomes** | What do I get? | Three blocks: number + mechanism. "25 hrs/month back — because agents draft first." "More matters per lawyer — because…" "Fewer citation errors — because every claim is sourced." | Replaces the bare stats row |
| 6 | **Proof** | Who says so, in my seat? | One section, three columns / tabs: GC (in-house), partner (firm), innovation lead (adoption). Each: quote, name, title, org, one metric, "Read the story →" | Consolidates quotes + case studies + videos. Videos become a link |
| 7 | **Security & governance** | Is it safe? | Two halves: *controls* (SSO, audit logs, ethical walls, zero retention, IP allow-listing, data lifecycle) and *proof* (7 badges, small row). One coded UI: the permissions panel from Hero D. Secondary CTA: "Read the security overview" | Moved 9 → 7, expanded from badges to substance |
| 8 | **For your role** | Which door is mine? | Law firms / In-house / Mid-sized: three outcomes each, own CTA | Moved 3 → 8 — segmentation converts after value, not before |
| 9 | **Final CTA** | What's next? | "See Harvey on your own matter." Primary demo + secondary walkthrough; one line setting expectations ("30-minute call, your practice area") | Rewritten to state the click's cost |
| — | Harvey II | — | Slim announcement bar under the nav, or a "New" pill on the Agents card | Removed as a section |
| — | Research, video wall, 36-logo wall | — | Nav / footer / customers page | Removed from the landing page |

Ten sections → nine. Five trust sections → two (logo strip, proof). Three new
answers added (how it works, outcomes, governance).

### Why this order converts

- **2 → 3** Logos raise "everyone's doing it" pressure; "how it works" immediately
  relieves it.
- **3 → 4** Product names land after the flow — Vault, Agents, Spaces are now things
  the reader saw in action.
- **4 → 5** Parts → results. Numbers land because the mechanism preceded them.
- **5 → 6** Results → someone in my seat confirming them.
- **6 → 7** Belief → the last objection, placed where the reader is ready for it.
- **7 → 8** Objection cleared → choose your door.
- **8 → 9** The ask, with its cost stated.

### CTA system across the page

- **Primary** (`brand/solid`): "Request a demo" — hero, role cards, final.
- **Secondary** (ghost): one lower-commitment step per section where it fits —
  walkthrough (hero, final), security overview (7), customer story (6).
- No other button styles. Text links with `→` only inside proof cards.

---

## 4. Build order

1. **How it works** — the new spine; hardest, most valuable.
2. **Platform** — Agents-led hierarchy.
3. **Proof** — the consolidated trust block.
4. **Security & governance** — with the permissions UI.
5. **Outcomes**, **For your role**, **Logo strip**, **Final CTA** — smaller, mostly
   typographic.

Each section gets: a Paper artboard on the harveyAI page, a Figma frame on the
HarveyAI page bound to the Harvey collections, and a short entry in this file
recording the decision and the conversion reason.

---

## 5. Section log

_(filled in as each section is designed)_

### 03 — How it works  ·  Paper: "Section 03 — How It Works"

**Layout.** Section header as a two-column row: eyebrow + 56px serif h2 ("One
matter, start to finish — with a lawyer at every gate.", 760px measure) left, 18/28
lede right on the same baseline. Below, a **stepper**: 400px left rail with four
numbered steps separated by hairlines, the active step (2) expanded with a
description and a text link; to the right, one large coded screen for the active
step, 12px top radius, panel shadow, cropped at the fold. In code the rail is sticky
and the screen swaps on scroll — the static frame shows step 2. Artboard 1440 × 940.

**Why this and not the three-panel strip.** Hero E already uses equal panels; a
second copy would flatten the page. The rail-plus-screen gives the whole flow at a
glance (four titles, four product names) *and* one screen with enough depth to
answer "what does the agent actually do." Only the active step carries body copy, so
the rail reads as a table of contents, not four paragraphs.

**Screen (step 2 — an agent run).** Header: agent name, matter, who started it, the
request in the serif as a quote, a "Running · 72%" pill in brand. Body: a five-step
plan — three done (positive ticks), one active (brand outline, three sub-drafts each
citing a clause), and a final **gate** row: "Send to Space for partner approval ·
Requires Maya Sterling" with a lock. Right rail: three serif numbers — *Sources read
1,284 · Claims with a citation 100% · Left the workspace: Nothing* — and an audit
note.

**Conversion reason.** This is the section the live page lacks. It answers the
three unspoken questions in order: *what does it do* (the plan), *can I trust the
output* (100% cited, sources count), *who is in control* (the approval gate, the
audit note). "Nothing left the workspace" as a stat is deliberate — it turns the
security promise into a number the reader sees while looking at the product working.

**Colour budget.** Brand for the active step and the running state only; positive
for done; everything else stone. The screen has one accent moment.
