"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { SectionOrbit } from "./SectionOrbit";
import { SectionRiver } from "./SectionRiver";
import { SectionTerrain } from "./SectionTerrain";
import { SectionFlip } from "./SectionFlip";

import "./sections.css";
import "../curve-type/picker.css";

/* River reads scroll position, so it needs the page to be scrollable —
 * a section that exactly fills the viewport freezes its input. */
const VARIANTS = [
  { name: "Orbit", Component: SectionOrbit, scroll: false },
  { name: "River", Component: SectionRiver, scroll: true },
  { name: "Terrain", Component: SectionTerrain, scroll: false },
  { name: "Flip", Component: SectionFlip, scroll: false },
];

export default function CurveSectionPrototypes() {
  const [current, setCurrent] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [ready, setReady] = useState(false);

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const highlightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const param = parseInt(
      new URLSearchParams(window.location.search).get("v") ?? "",
      10,
    );
    if (param >= 1 && param <= VARIANTS.length) setCurrent(param - 1);
  }, []);

  const moveHighlight = useCallback(() => {
    const el = itemRefs.current[current];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [current]);

  useLayoutEffect(() => {
    moveHighlight();
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const select = useCallback((index: number) => {
    if (index < 0 || index >= VARIANTS.length) return;
    setCurrent(index);
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(index + 1));
    window.history.replaceState(null, "", url);
  }, []);

  const replay = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
          target.isContentEditable)
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) select(num - 1);
      else if (e.key === "ArrowRight") select((current + 1) % VARIANTS.length);
      else if (e.key === "ArrowLeft")
        select((current - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === "r" || e.key === "R") replay();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, select, replay]);

  const { Component: Active, scroll } = VARIANTS[current];

  return (
    <div className="cs-stage">
      {scroll ? <div className="cs-runway" /> : null}
      <Active key={`${current}-${nonce}`} />
      {scroll ? <div className="cs-runway" /> : null}

      <nav
        className="proto-picker"
        aria-label="Prototype variants"
        {...(ready ? { "data-ready": "" } : {})}
      >
        <span className="proto-picker-highlight" ref={highlightRef} aria-hidden="true" />
        {VARIANTS.map((variant, i) => (
          <button
            key={variant.name}
            className="proto-picker-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => select(i)}
            {...(i === current
              ? { "data-active": "", "aria-current": "true" as const }
              : {})}
          >
            {variant.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          className="proto-picker-item proto-picker-replay"
          onClick={replay}
          aria-label="Replay animation (R)"
        >
          ↻
        </button>
      </nav>
    </div>
  );
}
