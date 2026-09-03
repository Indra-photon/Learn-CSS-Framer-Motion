/**
 * The design system for the Notes mockup — every constraint, stated once.
 *
 * Lives in its own module because three components now depend on it (the card,
 * the tab bar, and the device shell they sit in), and a token that gets
 * re-declared in the second consumer stops being a token.
 *
 *   TWO SIZES     `name` is 15px, `body` is 13px. Nothing else exists. Tags,
 *                 filters, counts and the status bar are all body-sized —
 *                 small type is separated from large by colour and weight, not
 *                 a third step.
 *
 *   TWO WEIGHTS   600 rides along with 15px, 400 rides along with 13px. Size
 *                 and weight always move together, so every piece of text is
 *                 either "a thing with a name" or "text about that thing" and
 *                 the hierarchy resolves without the eye having to measure.
 *
 *   CONCENTRIC    Three radii, and which one applies is arithmetic, not
 *   RADII         taste: a child's radius is its parent's minus the padding
 *                 between them. 12 on the outermost surfaces (card, tab bar),
 *                 8 one level in (rows, controls, the segmented track — each
 *                 sits 4px inside a 12), 4 for the segmented control's pill
 *                 (4px inside an 8).
 *
 *                 This replaces a flat "one radius everywhere" rule. That rule
 *                 is easy to state and wrong wherever two rounded things touch:
 *                 a 12px well 4px inside a 12px card puts a tighter curve
 *                 outside a looser one, and the corner reads as a mistake even
 *                 to someone who could not say why.
 *
 *                 Pills and circles sit outside the arithmetic — a tag is
 *                 shorter than twice any sensible radius, so it is a pill by
 *                 nature, and avatars are circles. The phone's own shell is
 *                 exempt too: the device is a physical object, not part of the
 *                 UI system, so its corners are sized to the hardware.
 *
 * Colour is OKLCH throughout. Neutrals are all hue 264 carrying a trace of
 * chroma, which keeps the greys cool rather than dead flat.
 *
 * THREE VALUES, NOT TWO. Everything used to live between 96% and 100%
 * lightness, which is why the screen read flat no matter how the boxes were
 * arranged. `solid` is the ink-dark counterweight, and it is spent in exactly
 * two places: the primary action and the selected tab. Those are the only two
 * things on the screen that are *not* a list item, so the dark value carries
 * meaning rather than decoration — and two of them, at opposite corners, is
 * the most the screen can hold before darkness stops being a signal.
 */

export const t = {
  name: "text-[15px] font-semibold text-[oklch(23%_0.015_264)]",
  body: "text-[13px] font-normal text-[oklch(62%_0.012_264)]",
  /** Body size, but ink-coloured — for 13px text that must stay readable. */
  bodyInk: "text-[13px] font-normal text-[oklch(23%_0.015_264)]",
  /**
   * The right rail. Every row ends in a column of this exact width: the status
   * badge, the collaborator cluster, and the swipe action all fill it.
   *
   * Fixed, not shrink-to-fit. Right-aligning three different intrinsic widths
   * gives them a shared right edge and nothing else — "Ongoing" and "Incoming"
   * started at different x, and the badge above a face cluster looked like two
   * unrelated objects that happened to end together. One declared width gives
   * them a left edge, a right edge and a centre line to share, and the labels
   * can then be any length without moving anything.
   *
   * 72px fits the longest status at 13px with its 8px side padding, and is the
   * width the swipe action already wanted to be.
   */
  rail: "w-[72px]",

  /** Outermost surfaces: the card, the tab bar. */
  radius: "rounded-[12px]",
  /** One level in — 4px inside a 12. Rows, controls, the segmented track. */
  radiusInner: "rounded-[8px]",
  /** Two levels in — 4px inside an 8. The segmented control's selected pill. */
  radiusTight: "rounded-[4px]",

  card: "bg-[oklch(100%_0_0)]",
  /** The page behind the card — what shows through as the screen background. */
  screen: "bg-[oklch(96%_0.003_264)]",

  /**
   * A row's fill, published as a custom property rather than applied directly.
   *
   * The avatars inside a row paint a ring in the row's own colour so each
   * circle bites a clean hole out of the one behind it. Hardcoding that ring
   * meant it only matched at rest: the moment `wellHover` moved the row to 95%
   * the three rings stopped matching and the bite turned into three visible
   * pale strokes. Routing both through `--row` means the hover moves the fill
   * and the rings together, and it keeps the colour stated once.
   */
  well: "bg-[var(--row)] [--row:oklch(97%_0.003_264)]",
  wellHover: "hover:[--row:oklch(95%_0.004_264)]",
  /** Ring in the enclosing row's fill; falls back to card white outside one. */
  ringRow: "ring-[var(--row,oklch(100%_0_0))]",

  /**
   * The divider under the header — chrome above, content below — as a 1px
   * shadow rather than a border. Spread 0, blur 0, offset 1: it draws the same
   * line a `border-b` would, without the border participating in layout.
   */
  hairline: "shadow-[0_1px_0_0_oklch(93%_0.004_264)]",

  /**
   * Depth, as three transparent layers instead of a solid line: a 1px ring, a
   * short lift, and an ambient spread. A border is one opaque colour picked
   * against one background — move the element onto a different surface and it
   * reads as drawn-on. These are black at low alpha, so they darken whatever
   * is actually behind them.
   *
   * Pure black on purpose. A tinted near-black (even this file's own hue-264
   * neutrals) picks up the surface underneath and reads as dirt along the
   * edge.
   */
  shadowBorder:
    "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_0_rgba(0,0,0,0.04)]",
  shadowBorderHover:
    "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06)]",

  /**
   * The inset variant, for a surface recessed *into* another one rather than
   * raised above it — the task rows, the segmented track. Ring only, no lift:
   * a well that cast a shadow outward would be claiming to float inside the
   * card it is cut into.
   */
  insetRing: "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]",
  insetRingHover: "hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]",

  /** Box-shadow is not in `transition-colors`, and `transition-all` is never. */
  shadowMove: "transition-[background-color,box-shadow] duration-150 ease-out",

  /**
   * The progress mark's two parts, as SVG paint. Stated here rather than on
   * the element because they are the same two neutrals the rest of the card
   * uses — the outline is the resting circle's stroke, the wedge is ink.
   */
  markTrack: "stroke-[oklch(75%_0.010_264)]",
  markFill: "fill-[oklch(23%_0.015_264)]",

  /** The ink value. Reserved — see the header. */
  solid: "bg-[oklch(23%_0.015_264)] text-[oklch(99%_0_0)]",
  solidHover: "hover:bg-[oklch(30%_0.018_264)]",
} as const;

/**
 * Tag palettes: fixed (background, foreground) pairs stated at one lightness
 * and chroma, varying only in hue — which is what keeps differently coloured
 * chips reading as one family instead of competing accents.
 *
 * These carry *one* meaning: status. Time-until-due used to be a second
 * chip sitting in the same row wearing the same shape, so two unrelated
 * dimensions shared a single visual channel and the eye had no way to tell
 * which chip was which. Time moved out to the date group headers, which is
 * cheaper than teaching a chip to explain itself. `red` is also the swipe
 * action's fill — the one place on the screen where colour means
 * "destructive".
 */
export const tone = {
  amber:
    "bg-[oklch(95%_0.075_92)] text-[oklch(52%_0.115_75)] shadow-[inset_0_0_0_1px_oklch(52%_0.115_75/0.16)]",
  green:
    "bg-[oklch(95%_0.055_155)] text-[oklch(52%_0.115_155)] shadow-[inset_0_0_0_1px_oklch(52%_0.115_155/0.16)]",
  red: "bg-[oklch(95%_0.045_25)] text-[oklch(55%_0.150_25)] shadow-[inset_0_0_0_1px_oklch(55%_0.150_25/0.16)]",
  blue: "bg-[oklch(95%_0.045_240)] text-[oklch(58%_0.130_240)] shadow-[inset_0_0_0_1px_oklch(58%_0.130_240/0.16)]",
  grey: "bg-[oklch(94%_0.004_264)] text-[oklch(48%_0.012_264)] shadow-[inset_0_0_0_1px_oklch(48%_0.012_264/0.16)]",
} as const;

export type Tone = keyof typeof tone;

/**
 * Avatar tints, cycled by index — the fallback for a collaborator with no
 * photo, not the default. Held at low chroma on purpose: they sit directly
 * beside the coloured tags, and saturated avatars would fight them.
 */
export const avatar = [
  "bg-[oklch(88%_0.035_250)] text-[oklch(42%_0.070_250)]",
  "bg-[oklch(88%_0.035_150)] text-[oklch(42%_0.070_150)]",
  "bg-[oklch(88%_0.035_20)] text-[oklch(42%_0.070_20)]",
];
