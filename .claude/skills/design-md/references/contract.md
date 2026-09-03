# The agent contract

Paste this block into every generated `DESIGN.md`, immediately under the voice
line and before any token table. It is short on purpose — it is the part that
has to survive being skimmed.

The rules live **in the artifact**, not only in this skill, because the file is
what gets read six weeks later by a different agent, a different editor, or a
subagent that never loaded a skill at all.

---

## Copy this verbatim

```markdown
## Contract

**Every visual decision in this section resolves to a token named in this file.**

If the token you need is not here — or its ledger row says ➕ — **stop.** Do not
approximate with an adjacent role, do not write a raw value, do not fall back to
a Tailwind default, and do not "just this once" a hex. A value that is not in
this file is a decision nobody has made yet, and guessing it silently forks the
system.

Instead, raise a **Gap Request** and wait:

> **Gap Request — <what is missing>**
> **Needed for:** <the element, and what it has to do>
> **Nearest existing token:** <role> — <why it does not fit>
> **Candidates:** (a) <value + consequence> (b) <value + consequence>
> **Recommendation:** <one of them, and why>
> **Belongs in:** <section of this file>

Once the owner decides: add the value to the generated CSS, move its ledger row
in this file, and *then* regenerate the UI. Never the other way around — markup
that ships ahead of its token is how a system loses its vocabulary.

**Free — no need to ask:** layout arrangement, flex/grid structure, responsive
ordering, which documented component to use, content and copy, semantic markup,
ARIA, and anything the "Do" list already sanctions.

**Never without asking:** a color, a font size, a weight, a radius, a shadow, a
spacing value, an easing, an icon set, or a new component pattern.
```

---

## Why it is worded this way

**"Stop" beats "prefer".** An agent reading "prefer existing tokens" will find a
reason its case is the exception. There is no soft form of this rule that
survives contact with a deadline.

**The Gap Request has a fixed shape** because the failure mode is not that the
agent asks — it is that the agent asks badly. "What color should this be?" hands
the whole problem back. A request that names the nearest existing token, two
candidates and a recommendation is a thirty-second decision.

**The free list is load-bearing.** Without it the rule reads as "ask about
everything", the owner gets interrupted twice a minute, and the contract is
switched off within a day. Arrangement is not a token decision. Say so.

**Ledger row before markup.** If the UI ships first and the doc catches up, the
doc becomes a description of what happened rather than a constraint on what may
happen — which is the difference between a design system and a changelog.
