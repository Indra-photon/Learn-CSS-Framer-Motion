"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Chamfered corners, cut on opposite diagonals.
 *
 * Cutting all four reads as a stop sign; cutting top-left and bottom-right
 * gives the shape a direction, which is what makes it look drawn rather than
 * rounded-off. The cut is the same 45° on both, so the two edges stay
 * parallel and the button reads as a machined part.
 */
const chamfer = (size: number): string =>
  `polygon(${size}px 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%, 0 ${size}px)`;

interface BevelButtonProps {
  children: ReactNode;
  className?: string;
  href: string;
  /** Depth of the corner cut, in pixels. */
  bevel?: number;
  /** The stage colour. The face is light, so the label is cut out of it. */
  ink: string;
}

/**
 * The call to action.
 *
 * A pill with a flat fill is the default SaaS button and reads as a component
 * someone installed. This is built from three stacked layers instead:
 *
 *   edge   the full shape, carrying a light-to-dark diagonal gradient
 *   face   inset 1.5px, carrying its own vertical gradient
 *   label  unclipped, so the type is never cut by the chamfer
 *
 * That layering is what produces a real bevel. A `border` cannot do it —
 * `clip-path` cuts the border along with the box, so the chamfered corners
 * would lose their outline. Insetting a second clipped layer leaves exactly
 * 1.5px of the edge gradient showing all the way around, including along the
 * diagonals, and because the edge runs light at the top-left to dark at the
 * bottom-right it reads as a lit edge rather than as a stroke.
 *
 * The drop shadow is a `filter`, not a `box-shadow`: a box-shadow is clipped
 * away with everything else, while `drop-shadow` follows the chamfered
 * silhouette.
 */
export const BevelButton = ({
  bevel = 13,
  children,
  className,
  href,
  ink,
}: BevelButtonProps) => (
  <a
    className={cn(
      "group relative inline-flex items-center justify-center",
      "px-8 py-4 text-[15px] leading-none font-medium tracking-[-0.01em]",
      "transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0",
      // The outline sits on the unclipped anchor: anything painted inside is
      // cut by the chamfer, focus rings included.
      "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white",
      className,
    )}
    href={href}
    style={{
      color: ink,
      filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.5))",
    }}
  >
    {/* edge */}
    <span
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #c9c9c9 46%, #6c6c6c 100%)",
        clipPath: chamfer(bevel),
      }}
    />

    {/* face */}
    <span
      aria-hidden
      className="absolute inset-[1.5px] transition-[filter] duration-200 ease-out group-hover:brightness-[1.06]"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #f0f0f0 42%, #d2d2d2 100%)",
        clipPath: chamfer(bevel - 2),
      }}
    />

    <span className="relative">{children}</span>
  </a>
);
