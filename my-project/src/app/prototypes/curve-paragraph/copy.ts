/* One paragraph, used by every variant in this round, so the comparison
 * is between the effects and not between the words. Pre-broken into lines
 * because each line is measured and animated independently. */
export const PARAGRAPH = [
  "We started with a plain observation about how people",
  "read long-form work on the web: they take in the shape",
  "of a paragraph well before they read a word of it.",
  "So the type system treats that shape as something you",
  "can compose with — a baseline that carries rhythm and",
  "motion without ever costing you the sentence.",
];

export const TOTAL_GLYPHS = PARAGRAPH.reduce((n, line) => n + line.length, 0);

/** Index of a glyph within the whole paragraph, in reading order. */
export function readingIndex(line: number, glyph: number) {
  let n = 0;
  for (let i = 0; i < line; i++) n += PARAGRAPH[i].length;
  return n + glyph;
}
