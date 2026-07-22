"use client";

import { useState } from "react";
import { EASING_PRESETS, useTransitionConfig, type CubicBezier } from "./TransitionConfigContext";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-200">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-neutral-700 accent-emerald-400"
      />
    </label>
  );
}

export default function EasingControlBar() {
  const { config, setConfig, triggerFlip } = useTransitionConfig();
  const [bezier, setBezier] = useState<CubicBezier>(
    Array.isArray(config.mode === "tween" ? config.ease : null)
      ? (config as { ease: CubicBezier }).ease
      : [0.25, 0.1, 0.25, 1],
  );

  const mode = config.mode;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-full border border-white/10">
          {(["spring", "tween"] as const).map((m) => (
            <button
              key={m}
              onClick={() =>
                setConfig(
                  m === "spring"
                    ? { mode: "spring", stiffness: 300, damping: 30, mass: 1 }
                    : { mode: "tween", duration: 0.3, ease: "easeOut" },
                )
              }
              className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-emerald-400 text-neutral-900"
                  : "bg-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={triggerFlip}
          className="ml-2 rounded-full bg-neutral-700 px-3 py-1 text-xs font-medium text-neutral-100 hover:bg-neutral-600"
        >
          Trigger flip
        </button>
      </div>

      {config.mode === "spring" ? (
        <div className="flex gap-4">
          <Slider
            label="Stiffness"
            value={config.stiffness}
            min={50}
            max={1000}
            step={10}
            onChange={(v) => setConfig({ ...config, stiffness: v })}
          />
          <Slider
            label="Damping"
            value={config.damping}
            min={5}
            max={100}
            step={1}
            onChange={(v) => setConfig({ ...config, damping: v })}
          />
          <Slider
            label="Mass"
            value={config.mass}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(v) => setConfig({ ...config, mass: v })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Slider
            label="Duration (s)"
            value={config.duration}
            min={0.05}
            max={1}
            step={0.01}
            onChange={(v) => setConfig({ ...config, duration: v })}
          />

          <div className="flex flex-wrap gap-1.5">
            {EASING_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setConfig({ ...config, ease: preset })}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  config.ease === preset
                    ? "bg-emerald-400 text-neutral-900"
                    : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>cubic-bezier(</span>
            {bezier.map((n, i) => (
              <input
                key={i}
                type="number"
                step={0.01}
                value={n}
                onChange={(e) => {
                  const next = [...bezier] as CubicBezier;
                  next[i] = Number(e.target.value);
                  setBezier(next);
                  setConfig({ ...config, ease: next });
                }}
                className="w-14 rounded border border-white/10 bg-neutral-800 px-1 py-0.5 text-center text-neutral-100"
              />
            ))}
            <span>)</span>
          </div>
        </div>
      )}
    </div>
  );
}
