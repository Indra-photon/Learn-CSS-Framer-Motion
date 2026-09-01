"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/* Signal extraction schematic. Each tick is one article off the wire; the ~20%
 * that survive the noise filter are the blue ones. The selection is a fixed
 * formula rather than random so the server and the client agree on the field. */
const TICKS = 384;
const isSignal = (i: number) => (i * 37) % 100 < 20;

/* The sweep is the whole point of this graphic, so it has to run when the panel
 * is actually being looked at — on page load it would be over before anyone
 * scrolled down to it, and a visitor would only ever meet the finished state.
 *
 * Three states, and the order matters:
 *   idle   server render, and the resting state for no-JS or reduced-motion —
 *          already filtered, because that is the truthful end state
 *   armed  motion is allowed and the field is not in view yet: show the raw,
 *          unfiltered intake
 *   run    in view: sweep the noise back, once, and stay there
 *
 * This is the only client component in the block; everything around it stays
 * server-rendered. */
export default function SignalField() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "run">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setState("armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("run");
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-akta-signal={state === "idle" ? undefined : state}
      className="flex flex-wrap gap-x-[5px] gap-y-2.5 p-5"
      aria-hidden="true"
    >
      {Array.from({ length: TICKS }, (_, i) => (
        <span
          key={i}
          style={{ "--akta-i": i } as CSSProperties}
          className={
            isSignal(i)
              ? "tick bg-akta-brand-solid h-7 w-px"
              : "akta-tick akta-tick-noise bg-akta-gray-text-high h-7 w-px"
          }
        />
      ))}
    </div>
  );
}
