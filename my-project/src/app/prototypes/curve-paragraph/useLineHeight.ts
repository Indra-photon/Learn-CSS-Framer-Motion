"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* Several effects in this round need each line's vertical position inside
 * the block — a glyph flying to a single point has to know how far its
 * line sits from that point. Every line shares a line-height, so one
 * measurement of the column gives all of them. */
export function useLineHeight(lines: number) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(40);

  useLayoutEffect(() => {
    const measure = () => {
      const el = columnRef.current;
      if (!el || !lines) return;
      setLineHeight(el.offsetHeight / lines);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (columnRef.current) observer.observe(columnRef.current);
    return () => observer.disconnect();
  }, [lines]);

  /** Vertical offset of a line from the centre of the block, in px. */
  const offsetOf = (index: number) => (index - (lines - 1) / 2) * lineHeight;

  return { columnRef, lineHeight, offsetOf };
}
