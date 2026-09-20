"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mapRange = (
  value: number,
  from: [number, number],
  to: [number, number],
) => {
  const normalized = clamp((value - from[0]) / (from[1] - from[0]));

  return to[0] + (to[1] - to[0]) * normalized;
};

export default function MotionComparison() {
  const [isMath, setIsMath] = useState(true);
  const [t, setT] = useState(0);
  const [run, setRun] = useState(0);
  const frameRef = useRef<number | null>(null);

  const minScale = 0.35;
  const maxScale = 1.35;
  const travel = 170;

  useEffect(() => {
    const duration = 3000;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      setT(progress);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [run]);

  /*
   * CSS / default motion
   *
   * These are simply normal transform values changing
   * over the animation's progress.
   */
  const cssPosition = t;
  const cssX = mapRange(cssPosition, [0, 1], [-travel, travel]);

  // Scale down → up → down using two normal CSS-style phases.
  const cssScaleProgress = t <= 0.5 ? t * 2 : 2 - t * 2;

  const cssScale = mapRange(cssScaleProgress, [0, 1], [minScale, maxScale]);

  /*
   * Mathematical motion
   *
   * sin() controls the scale.
   * cos() creates a smooth position curve.
   */
  const mathScaleProgress = Math.sin(Math.PI * t);

  const mathScale = mapRange(mathScaleProgress, [0, 1], [minScale, maxScale]);

  const mathPosition = (1 - Math.cos(Math.PI * t)) / 2;

  const mathX = mapRange(mathPosition, [0, 1], [-travel, travel]);

  const scale = isMath ? mathScale : cssScale;
  const x = isMath ? mathX : cssX;

  const restart = () => {
    setT(0);
    setRun((value) => value + 1);
  };

  const toggleMode = () => {
    setIsMath((value) => !value);
    setT(0);
    setRun((value) => value + 1);
  };

  return (
    <main
      className="min-h-screen bg-white px-5 py-10 text-[#111]"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[480px]">
        <div className="overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] font-medium">Motion comparison</span>

            <button
              onClick={toggleMode}
              className="flex items-center rounded-full border border-black/[0.08] bg-[#f5f5f5] p-0.5 text-[11px] font-medium"
            >
              <span
                className={`rounded-full px-3 py-1.5 transition ${
                  isMath ? "bg-black text-white" : "text-[#777]"
                }`}
              >
                Math
              </span>

              <span
                className={`rounded-full px-3 py-1.5 transition ${
                  !isMath ? "bg-black text-white" : "text-[#777]"
                }`}
              >
                CSS
              </span>
            </button>
          </div>

          {/* Function */}
          <div className="border-y border-black/[0.06] bg-[#fafafa] px-4 py-3">
            <div className="mb-1 text-[10px] tracking-[0.08em] text-[#888] uppercase">
              {isMath ? "Function-driven" : "Default transform"}
            </div>

            <div className="font-mono text-[12px] text-[#222]">
              {isMath ? (
                <>
                  <div>scale = sin(πt)</div>
                  <div>x = (1 − cos(πt)) / 2</div>
                </>
              ) : (
                <>
                  <div>scale = transform: scale(...)</div>
                  <div>x = transform: translateX(...)</div>
                </>
              )}
            </div>
          </div>

          {/* Animation */}
          <div className="relative flex h-[260px] items-center justify-center overflow-hidden bg-[#f1f1f1]">
            {/* center guide */}
            <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-black/[0.06]" />

            {/* baseline */}
            <div className="absolute right-8 bottom-[48px] left-8 h-px bg-black/[0.08]" />

            <div
              className="relative z-10 flex h-[100px] w-[100px] items-center justify-center rounded-[18px] bg-black shadow-[0_12px_25px_rgba(0,0,0,0.12)]"
              style={{
                transform: `translateX(${x}px) scale(${scale})`,
                willChange: "transform",
              }}
            >
              <div className="h-9 w-9 rounded-full bg-white" />
            </div>

            {/* endpoints */}
            <span className="absolute bottom-6 left-4 text-[10px] text-[#999]">
              LEFT
            </span>

            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#999]">
              CENTER
            </span>

            <span className="absolute right-4 bottom-6 text-[10px] text-[#999]">
              RIGHT
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-mono text-[11px] text-[#888]">
              t = {t.toFixed(2)}
            </span>

            <button
              onClick={restart}
              className="rounded-full bg-black px-4 py-2 text-[11px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
