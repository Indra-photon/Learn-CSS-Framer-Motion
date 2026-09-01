"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";

import { GlyphLine } from "./GlyphLine";
import { transversePlacer, wakeField, type CurveFactory, type Pulse } from "./engine";

/* ── WAKE ─────────────────────────────────────────────────────────────
 * Curve: TRAVELLING waves, not a standing one. Every pointer move drops a
 * pulse, and each pulse runs outward in both directions at a fixed speed,
 * decaying as it goes and INVERTING each time it reflects off an end —
 * which is what a wave does at a fixed boundary, and what makes the
 * bounce-back read as real rather than as the pulse turning around.
 * Pulses superpose, so crossing wakes cancel and reinforce.
 *
 * Interaction: PASSIVE PROXIMITY. You do not click, hold, or scroll —
 * you simply move across it and it responds, the way water does.
 *
 * Application: this one is not a hero. It is a NAV ROW — the case where
 * a curve has to survive being a functional, hoverable, clickable piece
 * of interface rather than a display moment. */

const SPEED = 520; // px per second — slow enough to watch it travel
const LIFE = 1.8; // seconds
const AMPLITUDE = 22;
const WIDTH = 58; // px, pulse half-width
const SEED_GAP = 26; // px of pointer travel between pulses
const MAX_PULSES = 14;

export function VariantWake() {
  const rowRef = useRef<HTMLElement>(null);
  const pulses = useRef<Pulse[]>([]);
  const lastSeed = useRef(0);
  /* THE time base. useAnimationFrame counts from when the hook mounted,
   * not from page load, so pulses must be stamped with the same clock
   * they are later measured against. */
  const frameTime = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const [live, setLive] = useState(false);

  /* A clock, not a progress value: the shape is a function of absolute
   * time because several pulses of different ages coexist. */
  const clock = useMotionValue(0);

  useAnimationFrame((t) => {
    const now = t / 1000;
    frameTime.current = now;
    /* Retire dead pulses. With none left the clock stops being written,
     * so every glyph subscription goes quiet and nothing repaints — the
     * frame callback keeps running but does no work. */
    pulses.current = pulses.current.filter((p) => now - p.born < LIFE);
    if (pulses.current.length) clock.set(now);
    else if (live) setLive(false);
  });

  const seed = useCallback((x: number) => {
    pulses.current = [
      ...pulses.current.slice(-MAX_PULSES + 1),
      { x0: x, born: frameTime.current },
    ];
    setLive(true);
  }, []);

  /* Drop one on arrival, so the idea is visible before anyone thinks to
   * sweep across it. Replay re-mounts and shows it again. */
  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => seed(0), 500);
    return () => clearTimeout(id);
  }, [reduce, seed]);

  const onMove = useCallback(
    (event: React.PointerEvent) => {
      if (reduce) return;
      const box = rowRef.current?.getBoundingClientRect();
      if (!box) return;

      const x = event.clientX - box.left - box.width / 2;
      if (Math.abs(x - lastSeed.current) < SEED_GAP) return;

      lastSeed.current = x;
      seed(x);
    },
    [reduce, seed],
  );

  const curve: CurveFactory = useMemo(
    () => (now, half) =>
      transversePlacer(
        wakeField(pulses.current, now, half, {
          speed: SPEED,
          life: LIFE,
          amplitude: AMPLITUDE,
          width: WIDTH,
        }),
        half,
        0.6,
      ),
    [],
  );

  return (
    <div className="ct-scene">
      <article className="ct-card ct-card--wake">
        <p className="ct-eyebrow">
          <span className="ct-dot" /> Navigation · travelling wave
        </p>

        <nav
          ref={rowRef}
          className="ct-nav"
          onPointerMove={onMove}
          aria-label="Studio navigation"
        >
          <span className="ct-nav-line" aria-hidden="true">
            <GlyphLine
              text="Work    Studio    Journal    Contact"
              value={clock}
              curve={curve}
            />
          </span>

          {/* The real, unwarped links sit underneath for anything that is
              not a mouse: keyboard, screen reader, touch. */}
          <span className="ct-nav-real">
            {["Work", "Studio", "Journal", "Contact"].map((item) => (
              <a key={item} href="#" className="ct-nav-link">
                {item}
              </a>
            ))}
          </span>
        </nav>

        <p className="ct-copy">
          Move across the row. Each pass drops a pulse that runs outward at
          a fixed speed and flips its sign every time it bounces off an end,
          so the wakes you leave interfere with each other. It settles to
          nothing on its own and stops computing when it does.
        </p>

        <p className="ct-hint">
          {live ? `${pulses.current.length} pulses in the water` : "Sweep across the row"}
        </p>
      </article>
    </div>
  );
}
