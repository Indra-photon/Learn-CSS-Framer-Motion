"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

import { GlyphLine } from "./GlyphLine";
import { arcPlacer, type CurveFactory } from "./engine";

/* ── GRAVITY ──────────────────────────────────────────────────────────
 * Curve: a CATENARY under a point load. A chain pinned at both ends and
 * pulled down at one point hangs as two catenary arcs meeting at the
 * load — steep at the supports, flat at the bottom, with a real kink
 * where your finger is. Normalised so it reaches the grab depth at the
 * load and exactly zero at both supports:
 *
 *     y(t) = depth · (cosh k − cosh kt) ∕ (cosh k − 1),  t = |x−xg| ∕ span
 *
 * Placement is BY ARC LENGTH, which here is not a stylistic choice but
 * the physics: a chain is inextensible, so pulling it down has to pull
 * its ends inward. The word narrows as it sags, on its own.
 *
 * Interaction: DRAG. Not a trigger, not a scrub — a grab. The line hangs
 * off the pointer for as long as you hold it and swings back when you
 * let go. Nothing plays; you are holding the thing. */

const MAX_SAG = 190;
/** Catenary tightness. Higher = more rope-like, lower = more elastic. */
const K = 1.9;

export function VariantGravity() {
  const lineRef = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [held, setHeld] = useState(false);

  /* Two inputs: where the chain is being pulled, and how far down. */
  const grabX = useMotionValue(0);
  const depth = useMotionValue(0);

  const readPointer = useCallback(
    (event: React.PointerEvent) => {
      const box = lineRef.current?.getBoundingClientRect();
      if (!box) return;
      grabX.set(((event.clientX - box.left) / box.width) * 2 - 1);
      depth.set(
        Math.max(0, Math.min(MAX_SAG, event.clientY - (box.top + box.height / 2))),
      );
    },
    [grabX, depth],
  );

  const onDown = (event: React.PointerEvent) => {
    if (reduce) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
    readPointer(event);
  };

  const onMove = (event: React.PointerEvent) => {
    if (!held) return;
    readPointer(event);
  };

  const release = () => {
    if (!held) return;
    setHeld(false);
    /* A released chain swings past level before settling — that overshoot
     * is the only reason it reads as weight rather than as a slider
     * returning to zero. */
    animate(depth, 0, { type: "spring", visualDuration: 0.75, bounce: 0.55 });
  };

  const curve: CurveFactory = useMemo(
    () => (_, half) => {
      const xg = grabX.get() * half;
      const sag = depth.get();
      const cosh = Math.cosh(K);

      return arcPlacer((x) => {
        const support = x < xg ? -half : half;
        const span = support - xg || 1;
        const t = Math.min(1, Math.abs((x - xg) / span));
        return (sag * (cosh - Math.cosh(K * t))) / (cosh - 1);
        /* Tilt damped to 0.7: a real chain is genuinely near-vertical at
         * its supports, and glyphs sitting truly tangent hit 46°. The
         * lean has to survive being read. */
      }, half, 0.7);
    },
    [grabX, depth],
  );

  return (
    <div className="ct-scene">
      <article className="ct-card ct-card--gravity">
        <p className="ct-eyebrow">
          <span className="ct-dot" /> Pull quote · inextensible
        </p>

        <h1
          ref={lineRef}
          className="ct-headline ct-headline--gravity"
          data-held={held ? "" : undefined}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <GlyphLine
            text="Hang this sentence"
            value={depth}
            also={[grabX]}
            curve={curve}
          />
        </h1>

        <p className="ct-copy">
          Grab the words and pull. The chain is inextensible, so the harder
          you drag the more the ends draw inward — the sentence gets
          physically shorter as it sags, because its length is conserved
          along the curve rather than across the page.
        </p>

        <p className="ct-hint">{held ? "holding" : "Drag the headline down"}</p>
      </article>
    </div>
  );
}
