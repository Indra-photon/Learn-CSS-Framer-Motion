# The Architect's Decalogue: Ten Rules of Typography

A concise reference for making decisive, high-quality typographic decisions. Apply these rules when setting type for any medium — print, screen, or editorial.

---

## 01. Justify Left, Rag Right

Always align type to the left with a natural, ragged right edge. Western readers scan left-to-right, top-to-bottom — a consistent left edge anchors the eye and reduces cognitive load.

```css
/* Good — natural reading flow */
p {
  text-align: left;
}
```

```css
/* Bad — forced full justification creates rivers of white space */
p {
  text-align: justify;
}
```

**Also avoid:** Indenting the first line of a paragraph. The left-alignment itself already signals a new block of text.

```css
/* Good */
p {
  text-indent: 0;
}

/* Bad */
p {
  text-indent: 1.5em;
}
```

---

## 02. Use One Font

Mastering a single typeface is harder than it looks. Two fonts only work when there is deliberate, studied contrast between them. Until you have achieved full command of one face, do not introduce a second.

**If you must pair fonts:**

- Never combine two typefaces of the same classification (e.g., two sans-serifs, two serifs).
- Seek contrast in structure, not just name.

```css
/* Good — disciplined single-font approach */
body {
  font-family: "Garamond", serif;
}

/* Risky — two serifs fighting each other */
h1 {
  font-family: "Bodoni", serif;
}
p {
  font-family: "Caslon", serif;
}
```

---

## 03. Skip a Weight

Subtle weight changes go unnoticed. When shifting between weights, skip at least one step on the scale to create meaningful contrast.

| Instead of…      | Use…                 |
| ---------------- | -------------------- |
| Light → Regular  | Light → Bold         |
| Regular → Medium | Regular → Extra Bold |
| Medium → Bold    | Medium → Black       |

```css
/* Good — skipping creates clear hierarchy */
h1 {
  font-weight: 700;
} /* Bold headline */
p {
  font-weight: 300;
} /* Light body copy */

/* Bad — difference is imperceptible */
h1 {
  font-weight: 500;
}
p {
  font-weight: 400;
}
```

A bold headline paired with light body copy is one of the most reliable typographic combinations in existence.

---

## 04. Double or Half the Point Size

When scaling type, use a ratio of 2× or ½× as your default. This creates unambiguous hierarchy. For more dramatic contrast, scale by 3× or 4×.

```css
/* Good — clear 2× relationship */
h1 {
  font-size: 30px;
}
body {
  font-size: 15px;
}

/* Good — dramatic 4× effect */
.display {
  font-size: 60px;
}
.caption {
  font-size: 15px;
}

/* Bad — ambiguous, nearly identical sizes */
h2 {
  font-size: 20px;
}
body {
  font-size: 17px;
}
```

**Rule of thumb:** If you have to squint to see the size difference, it is not different enough.

---

## 05. Align to One Axis

Choose a single alignment axis — horizontal or vertical — and build all typographic elements against it. Mixing axes produces visual chaos.

**Vertical axis (most common):**
Align the left edge of all type blocks regardless of size.

```css
/* Good — single left axis */
.headline,
.subhead,
.body-copy {
  margin-left: 0;
  text-align: left;
}
```

**Horizontal axis:**
Align to the strongest horizontal line — typically the baseline or the cap height.

**Bad:** Centering some elements, left-aligning others, with no governing logic.

---

## 06. Pick from a Proven List of Fonts

Any typeface is acceptable, provided it belongs to the canon of professionally recognized, time-tested faces. Avoid novelty or decorative fonts for serious work.

**Recommended typefaces:**

| Classification     | Typefaces                                               |
| ------------------ | ------------------------------------------------------- |
| Grotesque Sans     | Akzidenz Grotesque, Franklin Gothic, Helvetica, Univers |
| Geometric Sans     | Avenir, Futura                                          |
| Humanist Sans      | Gill Sans                                               |
| Transitional Serif | Caslon, Garamond                                        |
| Modern Serif       | Bodoni                                                  |
| Slab Serif         | Rockwell                                                |

These faces have proven their utility across decades of professional practice. When in doubt, choose from this list before reaching for anything else.

---

## 07. Group by Using Rules

Use rules (lines) to organize dissimilar elements and clarify the relationships between blocks of content. A rule creates an invisible boundary that the eye naturally respects.

```css
/* Good — rule separates sections clearly */
.section-header {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

/* Bad — relying on whitespace alone when content is dense */
.section-header {
  margin-bottom: 2rem; /* Insufficient grouping cue in complex layouts */
}
```

Rules are particularly effective when grouping content that differs in type, size, or importance but must share the same compositional space.

---

## 08. Avoid the Corners

Do not place type or significant elements in the corners or at the very edges of a page unless you are deliberately cropping them for effect. Corners are dead zones — the eye does not naturally travel there.

Negative space is not wasted space. It lets the design breathe and directs attention toward the content that matters.

```css
/* Good — comfortable inset from all edges */
.page {
  padding: 4rem;
}

/* Bad — content jammed to the edge */
.page {
  padding: 0;
}
```

**Print equivalent:** Respect your margins. A layout that fills every corner communicates desperation, not richness.

---

## 09. Mind the Gap

Spacing is the invisible structure of typography. Three things to eliminate:

**1. Forced justification (rivers)**
Full justification stretches word spacing unevenly, creating vertical channels of white space ("rivers") that distract the eye.

```css
/* Bad */
p {
  text-align: justify;
}

/* Good */
p {
  text-align: left;
}
```

**2. Widows**
A single word left alone on the last line of a paragraph.

```css
/* Mitigate with: */
p {
  text-wrap: pretty;
}
```

**3. Orphans**
The final line of a paragraph stranded at the top of a new column or page.

```css
/* Good */
p {
  orphans: 3;
  widows: 3;
}
```

**Also:** Always use a single space after punctuation. Always pay attention to the shape of your text rag — the ragged right edge should have a gentle, irregular rhythm, not dramatic peaks and troughs.

---

## 10. Be Bold or Italic, Never Regular

Make decisive choices with type style. Regular weight is the neutral — it carries no emphasis and creates no hierarchy. Favor bold or italic to establish clear typographic intent.

```css
/* Good — decisive hierarchy */
.label {
  font-weight: 700;
} /* Bold: structural, commanding */
.aside {
  font-style: italic;
} /* Italic: nuanced, editorial */

/* Bad — everything at the same weight reads as noise */
.label {
  font-weight: 400;
}
.aside {
  font-weight: 400;
}
```

**When to use each:**

| Style    | Use for                                                       |
| -------- | ------------------------------------------------------------- |
| **Bold** | Headlines, labels, key terms, UI actions                      |
| _Italic_ | Asides, citations, emphasis within body copy, titles of works |
| Regular  | Extended body copy only — never for hierarchy                 |

The goal is not decoration. It is legibility of structure — making the reader understand, at a glance, what matters and what supports it.
