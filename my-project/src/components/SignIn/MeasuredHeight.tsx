"use client";

/* Animates its own height to whatever its content measures.
 *
 * AnimatePresence mode="popLayout" pulls the exiting step out of flow the
 * moment the next one mounts, so the content's height changes in a single
 * frame. This box measures the content with react-use-measure and springs to
 * the new height, so everything after it in the flow glides instead of
 * jumping.
 *
 * The height is a spring motion value written straight to style, not an
 * `animate` target: an animate target that already equals the DOM value
 * (an empty box measuring 0) is never written, which leaves the box at
 * `auto` and lets the next content pop open in one frame. Here the first
 * measurement jumps (nothing to animate from), every later one springs, and
 * under reduced motion every change jumps.
 *
 * `clip` hides whatever is outside the animating height on the y axis only
 * (x stays visible for the slide). Use it where content leaves while the box
 * shrinks; the 4px pad keeps focus rings at the top edge visible. Without
 * `clip`, nothing is cut: focus rings and shadows stay intact. */

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/utils";

import { HEIGHT_SPRING } from "./content";

export function MeasuredHeight({
  children,
  clip = false,
  className,
}: {
  children: ReactNode;
  clip?: boolean;
  className?: string;
}) {
  const [ref, bounds] = useMeasure();
  const reduce = useReducedMotion() ?? false;
  // react-use-measure reports a zero-width box until it has measured once.
  const measured = bounds.width > 0;
  const height = useSpring(0, {
    visualDuration: HEIGHT_SPRING.duration,
    bounce: HEIGHT_SPRING.bounce,
  });
  const first = useRef(true);

  // Layout effect: the value must be right before the first measured paint.
  useLayoutEffect(() => {
    if (!measured) return;
    if (first.current || reduce) {
      height.jump(bounds.height);
      first.current = false;
    } else {
      height.set(bounds.height);
    }
  }, [bounds.height, measured, reduce, height]);

  return (
    <motion.div
      className={cn(clip && "-mt-1 [overflow-y:clip]", className)}
      style={{ height: measured ? height : undefined }}
    >
      <div ref={ref} className={cn(clip && "pt-1")}>
        {children}
      </div>
    </motion.div>
  );
}
