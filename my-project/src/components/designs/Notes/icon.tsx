/**
 * Icon — the one place a stroke width is chosen.
 *
 * Hugeicons ships every glyph with `strokeWidth="1.5"` baked onto each path.
 * `HugeiconsIcon` spreads its own stroke props *after* those attributes, so a
 * `strokeWidth` prop does win — but only if every call site remembers to pass
 * it. Routing all of them through this wrapper means there is no call site
 * that can forget, and no second number to keep in sync with the first.
 *
 * `absoluteStrokeWidth` is the part that actually makes the strokes match.
 * Every icon is drawn on a 24 grid but rendered at six different sizes here —
 * 24 for the marks and the logo, 20 in the tab bar, 18 on the header buttons,
 * 14 for the row counts, 16–19 in the status bar. A plain `strokeWidth={1.5}`
 * is 1.5 *user units*, which the viewBox then scales: 1.5px at size 24, but
 * 1.25px at 20 and 0.88px at 14. The counts would have come out visibly
 * thinner than the marks beside them. `absoluteStrokeWidth` pre-divides by the
 * scale factor, so 1.5 means 1.5 rendered pixels at every size.
 *
 * Server component: no hooks, no client directives.
 */

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

/** Hugeicons' own drawing weight. One number, one place. */
export const STROKE = 1.5;

export default function Icon({
  icon,
  size = 24,
  className = "",
}: {
  icon: IconSvgElement;
  size?: number;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={STROKE}
      absoluteStrokeWidth
      className={className}
    />
  );
}
