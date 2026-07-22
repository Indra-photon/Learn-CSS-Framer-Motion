"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Transition } from "motion/react";

export const EASING_PRESETS = [
  "linear",
  "easeIn",
  "easeOut",
  "easeInOut",
  "circIn",
  "circOut",
  "backOut",
  "anticipate",
] as const;

export type EasingPresetName = (typeof EASING_PRESETS)[number];

export type CubicBezier = [number, number, number, number];

export type TransitionConfig =
  | { mode: "spring"; stiffness: number; damping: number; mass: number }
  | { mode: "tween"; duration: number; ease: EasingPresetName | CubicBezier };

const DEFAULT_CONFIG: TransitionConfig = {
  mode: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

interface TransitionConfigContextValue {
  config: TransitionConfig;
  setConfig: (config: TransitionConfig) => void;
  transition: Transition;
  /** Increments each time "Trigger flip" is pressed; clocks watch this to force-advance one tick. */
  flipSignal: number;
  triggerFlip: () => void;
}

const TransitionConfigContext = createContext<TransitionConfigContextValue | null>(null);

export function transitionFromConfig(config: TransitionConfig): Transition {
  if (config.mode === "spring") {
    return {
      type: "spring",
      stiffness: config.stiffness,
      damping: config.damping,
      mass: config.mass,
    };
  }
  return {
    type: "tween",
    duration: config.duration,
    ease: config.ease,
  };
}

export function TransitionConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TransitionConfig>(DEFAULT_CONFIG);
  const [flipSignal, setFlipSignal] = useState(0);

  const value = useMemo<TransitionConfigContextValue>(
    () => ({
      config,
      setConfig,
      transition: transitionFromConfig(config),
      flipSignal,
      triggerFlip: () => setFlipSignal((n) => n + 1),
    }),
    [config, flipSignal],
  );

  return (
    <TransitionConfigContext.Provider value={value}>{children}</TransitionConfigContext.Provider>
  );
}

export function useTransitionConfig() {
  const ctx = useContext(TransitionConfigContext);
  if (!ctx) {
    throw new Error("useTransitionConfig must be used within a TransitionConfigProvider");
  }
  return ctx;
}
