# Anatomy of a DESIGN.md

Fifteen sections, in this order. Six are required; the rest earn their place or
get left out. **A section with nothing to say is worse than a missing one** — it
teaches the reader that this file contains filler, and they start skimming the
parts that matter.

Two reference files are worth reading before writing one: the akta doc
(`my-project/src/components/sections/ActaHero/DESIGN.md`) and any Linear-style
brand reference. They are good at opposite things. akta is a **contract** —
ledger, assumptions, "if this isn't true, here is what breaks". Linear is a
**portrait** — voice, Do/Don't, imagery, similar brands. A good DESIGN.md is
akta's spine wearing Linear's voice.

| # | Section | Required | What it is for |
|---|---|---|---|
| 1 | Title + voice line | ✅ | One line under the title, in italics. `> technical drawing on white paper`. Everything else is downstream of this sentence. |
| 2 | **Contract** | ✅ | The never-guess rules. Verbatim from `contract.md`. Goes above the tokens — a reader who stops after two screens must still have hit it. |
| 3 | Overview paragraph | ✅ | 4–6 sentences. What the system is *made of* and what it refuses. Name the one structural idea (akta: "borders are shadows"). |
| 4 | How this ships + Assumptions | ✅ | Where the CSS lives, what must be true for it to work, and **what breaks silently if it isn't**. The silent failures are the whole point of the table. |
| 5 | Coverage ledger | ✅ | ✅ / ◑ / ➕ legend. Generated. This is what makes the contract checkable rather than aspirational. |
| 6 | Tokens — Colors | ✅ | Generated. Shipped roles as a table; deferred roles as one line. |
| 7 | Tokens — Typography | ✅ | Generated. Same shape. |
| 8 | Spacing, radius, shadows, easing | ✅ | Short tables. Radius is a **closed vocabulary** — three values maximum, or the single word `0`. |
| 9 | Layout | ✅ | Max-width, gutters, section rhythm, z-index, icon sizes. Written as utilities to copy, not as prose. |
| 10 | Surfaces + Elevation | ○ | Only if the system has more than two surface levels. State the *relationship* between levels, not just the values. |
| 11 | Signature devices | ○ | The one or two ornaments that are the identity (akta's corner notch). Include the tunable properties and the way each one breaks. Omit entirely if the system has none — inventing an ornament to fill this section is how a design language gets a tic. |
| 12 | Components | ✅ | 4–6 in v1. Each: **Role** line, then one paragraph of exact values. Only components the first screens actually render. |
| 13 | Motion | ○ | One easing, two or three durations, and what each motion is *for*. "No motion in v1" is a legitimate and useful entry. |
| 14 | Accessibility | ✅ | Focus rings, contrast pairs that were verified, what carries an `sr-only` label. Specific to this system — generic a11y advice belongs in a skill, not here. |
| 15 | Do's and Don'ts | ✅ | 5–7 each, all specific enough to fail a review. "Do not use bold weights (700+)" is a rule; "use type consistently" is a mood. |
| 16 | Imagery | ○ | Only if the system has a position. "No photography, no illustration; every graphic is drawn from data" is a position. |
| 17 | Agent prompt guide | ✅ | Quick-reference table (purpose → utility) plus 4–5 worked component prompts. **This is the section agents actually read.** Every prompt must be copy-pasteable and name only ✅ tokens. |
| 18 | Similar brands | ○ | 3–5, each with one clause on what specifically is shared. Useful for calibration; cheap to write; first thing to cut. |

## The rules that make it work

**Every value appears exactly once.** The moment a hex is written in both a
table and a prose paragraph, one of them is wrong within a month. Prose refers
to roles by name; the table owns the value.

**Say what breaks.** akta's best lines are the failure modes: "overflow-hidden
shears the brackets off", "the class will silently do nothing otherwise",
"inset shadows paint below child backgrounds". A doc that only lists what to do
gets read once. A doc that names the trap gets kept open in a tab.

**Give the extension rule.** One sentence covering where a *new* thing goes —
akta's "values are utilities, mechanism is CSS". Without it, every addition is
argued from scratch.

**Write the components as paragraphs, not bullets.** A component entry is a
spec, and a spec reads as one continuous sentence of values: background, text,
radius, padding, type, states. Bullets invite half-specified components.

**Keep v1 small.** Ten color roles, six or seven type roles, four components.
The deferred list keeps everything else visible without pretending it has been
decided. A first roll-out that documents forty roles has documented none of
them, because nobody finished reading.
