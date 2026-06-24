"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Loading01Icon,
  Tick01Icon,
  ZapIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import "./DatabaseMigrationWizard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModelId = "llama-8b" | "llama-70b" | "mistral-7b" | "phi-3";
type DatasetSource = "jsonl" | "huggingface" | "s3";
type BatchSize = 4 | 8 | 16 | 32;
type InstanceType = "spot" | "on-demand" | "reserved";
type GpuId = "a100" | "h100" | "v100" | "t4";
type SubmitPhase = "idle" | "queued" | "training" | "done";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Model", "Dataset", "Hyperparams", "Compute", "Submit"];

const MODELS: {
  id: ModelId;
  name: string;
  family: string;
  params: number;
  paramLabel: string;
  contextK: number;
  costPerHr: number;
}[] = [
  { id: "llama-8b",  name: "Llama-3.1-8B",   family: "Meta",      params: 8000,  paramLabel: "8B",   contextK: 128, costPerHr: 0.10 },
  { id: "llama-70b", name: "Llama-3.1-70B",   family: "Meta",      params: 70000, paramLabel: "70B",  contextK: 128, costPerHr: 0.60 },
  { id: "mistral-7b",name: "Mistral-7B",       family: "Mistral",   params: 7000,  paramLabel: "7B",   contextK: 32,  costPerHr: 0.08 },
  { id: "phi-3",     name: "Phi-3-mini",       family: "Microsoft", params: 3800,  paramLabel: "3.8B", contextK: 128, costPerHr: 0.06 },
];

const DATASET_SOURCES: { id: DatasetSource; label: string; sublabel: string }[] = [
  { id: "jsonl",       label: "JSONL File",      sublabel: "Upload .jsonl directly" },
  { id: "huggingface", label: "HuggingFace",     sublabel: "Pull from Hub dataset" },
  { id: "s3",          label: "S3 Bucket",        sublabel: "Stream from object store" },
];

const LR_STEPS = [1e-5, 3e-5, 5e-5, 1e-4, 3e-4, 5e-4];
const LR_LABELS = ["1e-5", "3e-5", "5e-5", "1e-4", "3e-4", "5e-4"];
const BATCH_SIZES: BatchSize[] = [4, 8, 16, 32];

const INSTANCE_TYPES: { id: InstanceType; label: string; desc: string; discount: string }[] = [
  { id: "spot",      label: "Spot",      desc: "Can be interrupted",  discount: "~70% off" },
  { id: "on-demand", label: "On-demand", desc: "Always available",    discount: "Standard" },
  { id: "reserved",  label: "Reserved",  desc: "Guaranteed capacity", discount: "~20% off" },
];

const GPUS: {
  id: GpuId;
  name: string;
  vram: number;
  pricePerHr: number;
  avail: "high" | "medium" | "low";
}[] = [
  { id: "a100", name: "A100", vram: 80, pricePerHr: 2.10, avail: "medium" },
  { id: "h100", name: "H100", vram: 80, pricePerHr: 3.80, avail: "low" },
  { id: "v100", name: "V100", vram: 32, pricePerHr: 1.20, avail: "high" },
  { id: "t4",   name: "T4",   vram: 16, pricePerHr: 0.50, avail: "high" },
];

const AVAIL_COLOR = {
  high:   "bg-emerald-400",
  medium: "bg-amber-400",
  low:    "bg-red-400",
};

// Loss curve path — realistic exponential decay shape, normalized 0-1 x/y
// SVG viewBox 0 0 200 60, y=0 top (high loss), y=60 bottom (low loss)
const LOSS_CURVE_D =
  "M0,6 C10,6 18,10 28,20 C38,30 45,42 60,48 C75,53 90,55 110,56.5 C130,57.5 155,58 200,58.5";

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants = {
  initial: (dir: number) => ({ x: `${110 * dir}%`, opacity: 0 }),
  active:  { x: "0%", opacity: 1 },
  exit:    (dir: number) => ({ x: `${-110 * dir}%`, opacity: 0 }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};

const fadeScaleUp = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, duration: 0.35, bounce: 0 },
  },
};

const ICON_ANIM = {
  initial:    { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate:    { opacity: 1, scale: 1,    filter: "blur(0px)" },
  exit:       { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring" as const, duration: 0.3, bounce: 0 },
};

// ─── CSS helpers (same as sibling components) ─────────────────────────────────

function swapText(el: HTMLElement, newText: string) {
  el.classList.add("is-exit");
  setTimeout(() => {
    el.textContent = newText;
    el.classList.remove("is-exit");
    el.classList.add("is-enter-start");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.remove("is-enter-start")),
    );
  }, 150);
}

// ─── AnimatedNumber ───────────────────────────────────────────────────────────

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const groupRef = useRef<HTMLSpanElement>(null);
  const prevRef  = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (value === prevRef.current) return;
    prevRef.current = value;
    const el = groupRef.current;
    if (!el) return;
    el.classList.remove("is-animating");
    void el.offsetHeight;
    el.classList.add("is-animating");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => el.classList.remove("is-animating"), 700);
  }, [value]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const str = value.toLocaleString();
  return (
    <span ref={groupRef} className={`t-digit-group tabular-nums${className ? ` ${className}` : ""}`}>
      {str.split("").map((ch, i) => (
        <span key={i} className="t-digit" data-stagger={String(Math.min(i, 2))}>{ch}</span>
      ))}
    </span>
  );
}

// ─── PulsingRing ──────────────────────────────────────────────────────────────

function PulsingRing({ color = "bg-stone-300" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <motion.span
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        className={`absolute inline-flex h-full w-full rounded-full ${color}`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

// ─── Step 0: Base Model ───────────────────────────────────────────────────────

function BaseModelStep({
  selected,
  setSelected,
}: {
  selected: ModelId;
  setSelected: (id: ModelId) => void;
}) {
  const model = MODELS.find((m) => m.id === selected)!;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeScaleUp}>
        <h2 className="text-[15px] font-semibold text-stone-900">Base Model</h2>
        <p className="mt-1 text-sm text-stone-500">Choose the foundation for your fine-tuning run.</p>
      </motion.div>

      {/* Vertical radio list with layoutId sliding pill */}
      <motion.div variants={fadeScaleUp} className="relative space-y-1">
        {MODELS.map((m) => {
          const isActive = m.id === selected;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className="relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left"
            >
              {/* Sliding pill background */}
              {isActive && (
                <motion.div
                  layoutId="model-pill"
                  className="absolute inset-0 rounded-xl border border-stone-300 bg-stone-50"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              {/* Row content */}
              <div className="relative flex flex-1 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white">
                  <span className="text-[10px] font-bold text-stone-600">{m.paramLabel}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${isActive ? "text-stone-900" : "text-stone-600"}`}>
                    {m.name}
                  </p>
                  <p className="text-[10px] text-stone-400">{m.family}</p>
                </div>
                <span className={`text-[10px] font-medium tabular-nums ${isActive ? "text-stone-700" : "text-stone-400"}`}>
                  {m.contextK}K ctx
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Live stat row — three AnimatedNumbers tick on switch */}
      <motion.div
        variants={fadeScaleUp}
        className="grid grid-cols-3 divide-x divide-stone-100 rounded-xl border border-stone-100 bg-stone-50"
      >
        <div className="flex flex-col items-center py-3">
          <p className="text-[10px] text-stone-400">Parameters</p>
          <p className="mt-0.5 text-sm font-bold text-stone-800">
            <AnimatedNumber value={model.params} />M
          </p>
        </div>
        <div className="flex flex-col items-center py-3">
          <p className="text-[10px] text-stone-400">Context</p>
          <p className="mt-0.5 text-sm font-bold text-stone-800">
            <AnimatedNumber value={model.contextK} />K
          </p>
        </div>
        <div className="flex flex-col items-center py-3">
          <p className="text-[10px] text-stone-400">Base cost</p>
          <p className="mt-0.5 text-sm font-bold text-stone-800">
            $<AnimatedNumber value={Math.round(model.costPerHr * 100)} />
            <span className="text-[10px] font-normal text-stone-400">/hr</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 1: Dataset ──────────────────────────────────────────────────────────

function DatasetStep({
  source,
  setSource,
  splitPct,
  setSplitPct,
  totalSamples,
}: {
  source: DatasetSource;
  setSource: (s: DatasetSource) => void;
  splitPct: number;
  setSplitPct: (v: number) => void;
  totalSamples: number;
}) {
  const trainCount = Math.round(totalSamples * (splitPct / 100));
  const valCount   = totalSamples - trainCount;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeScaleUp}>
        <h2 className="text-[15px] font-semibold text-stone-900">Dataset</h2>
        <p className="mt-1 text-sm text-stone-500">Configure your training data source and split.</p>
      </motion.div>

      {/* Source type pills */}
      <motion.div variants={fadeScaleUp} className="flex gap-1.5">
        {DATASET_SOURCES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSource(s.id)}
            className={[
              "flex flex-1 flex-col rounded-xl border px-2.5 py-2.5 text-left",
              "transition-[background-color,border-color,color] duration-150",
              source === s.id
                ? "border-stone-400 bg-stone-900 text-stone-50"
                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white",
            ].join(" ")}
          >
            <span className="text-xs font-semibold">{s.label}</span>
            <span className={`mt-0.5 text-[10px] leading-snug ${source === s.id ? "text-stone-400" : "text-stone-400"}`}>
              {s.sublabel}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Train/val split slider */}
      <motion.div variants={fadeScaleUp} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-600">Train / val split</label>
          <span className="text-xs font-semibold text-stone-700 tabular-nums">
            <AnimatedNumber value={splitPct} />% / <AnimatedNumber value={100 - splitPct} />%
          </span>
        </div>
        <input
          type="range"
          min={70}
          max={95}
          step={5}
          value={splitPct}
          onChange={(e) => setSplitPct(Number(e.target.value))}
          className="w-full accent-stone-800"
        />
        {/* Dual split bar */}
        <div className="flex h-2 overflow-hidden rounded-full">
          <motion.div
            animate={{ width: `${splitPct}%` }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="bg-stone-800"
          />
          <div className="flex-1 bg-stone-200" />
        </div>
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>70 / 30</span>
          <span>95 / 5</span>
        </div>
      </motion.div>

      {/* Dual counters */}
      <motion.div
        variants={fadeScaleUp}
        className="grid grid-cols-2 divide-x divide-stone-100 rounded-xl border border-stone-100 bg-stone-50"
      >
        <div className="flex flex-col items-center py-3">
          <p className="text-[10px] text-stone-400">Train samples</p>
          <p className="mt-0.5 text-sm font-bold text-stone-800">
            <AnimatedNumber value={trainCount} />
          </p>
        </div>
        <div className="flex flex-col items-center py-3">
          <p className="text-[10px] text-stone-400">Val samples</p>
          <p className="mt-0.5 text-sm font-bold text-stone-500">
            <AnimatedNumber value={valCount} />
          </p>
        </div>
      </motion.div>

      {/* Data quality bars */}
      <motion.div variants={fadeScaleUp} className="space-y-2.5">
        {[
          { label: "Completeness", pct: 94 },
          { label: "Avg token length", pct: 68 },
        ].map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex justify-between">
              <span className="text-[10px] text-stone-500">{bar.label}</span>
              <span className="text-[10px] font-semibold text-stone-700">{bar.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: "spring", duration: 0.7, bounce: 0, delay: 0.15 }}
                style={{ originX: 0, width: `${bar.pct}%` }}
                className="h-full rounded-full bg-stone-700"
              />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Step 2: Hyperparameters ──────────────────────────────────────────────────

function HyperparamsStep({
  lrIdx,
  setLrIdx,
  epochs,
  setEpochs,
  batchSize,
  setBatchSize,
  trainSamples,
  modelCostPerHr,
}: {
  lrIdx: number;
  setLrIdx: (v: number) => void;
  epochs: number;
  setEpochs: (v: number) => void;
  batchSize: BatchSize;
  setBatchSize: (v: BatchSize) => void;
  trainSamples: number;
  modelCostPerHr: number;
}) {
  const lrLabelRef = useRef<HTMLSpanElement>(null);
  const prevLrIdx  = useRef(lrIdx);

  useEffect(() => {
    if (lrIdx === prevLrIdx.current) return;
    prevLrIdx.current = lrIdx;
    if (lrLabelRef.current) swapText(lrLabelRef.current, LR_LABELS[lrIdx]);
  }, [lrIdx]);

  const stepsPerEpoch   = Math.ceil(trainSamples / batchSize);
  const totalSteps      = stepsPerEpoch * epochs;
  const estHours        = Math.round((totalSteps * 0.05) / 60 * 10) / 10;
  const estCost         = Math.round(estHours * modelCostPerHr * 100) / 100;
  const estHoursCents   = Math.round(estHours * 10);
  const estCostCents    = Math.round(estCost * 100);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeScaleUp}>
        <h2 className="text-[15px] font-semibold text-stone-900">Hyperparameters</h2>
        <p className="mt-1 text-sm text-stone-500">Tune training dynamics. Estimates update live.</p>
      </motion.div>

      {/* Learning rate — log scale with text-swap notation */}
      <motion.div variants={fadeScaleUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-600">Learning rate</label>
          <span className="text-xs font-semibold text-stone-800">
            <span ref={lrLabelRef} className="t-text-swap font-mono">{LR_LABELS[lrIdx]}</span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={LR_STEPS.length - 1}
          step={1}
          value={lrIdx}
          onChange={(e) => setLrIdx(Number(e.target.value))}
          className="w-full accent-stone-800"
        />
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>1e-5</span><span>5e-4</span>
        </div>
      </motion.div>

      {/* Epochs */}
      <motion.div variants={fadeScaleUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-600">Epochs</label>
          <span className="text-xs font-semibold text-stone-800 tabular-nums">
            <AnimatedNumber value={epochs} />
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={epochs}
          onChange={(e) => setEpochs(Number(e.target.value))}
          className="w-full accent-stone-800"
        />
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>1</span><span>10</span>
        </div>
      </motion.div>

      {/* Batch size — segmented buttons with layoutId pill */}
      <motion.div variants={fadeScaleUp} className="space-y-2">
        <label className="text-xs font-medium text-stone-600">Batch size</label>
        <div className="relative flex gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
          {BATCH_SIZES.map((bs) => (
            <button
              key={bs}
              onClick={() => setBatchSize(bs)}
              className="relative flex-1 rounded-lg py-1.5 text-xs font-semibold"
            >
              {batchSize === bs && (
                <motion.div
                  layoutId="batch-pill"
                  className="absolute inset-0 rounded-lg border border-stone-300 bg-white shadow-sm"
                  transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
                />
              )}
              <span className={`relative ${batchSize === bs ? "text-stone-800" : "text-stone-400"}`}>
                {bs}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Live estimates — both tick together */}
      <motion.div
        variants={fadeScaleUp}
        className="rounded-xl border border-stone-100 bg-stone-50 p-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">Estimates</p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Total steps</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              <AnimatedNumber value={totalSteps} />
            </span>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Training time</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              ~<AnimatedNumber value={estHoursCents} />
              <span className="font-normal text-stone-400"> hrs</span>
            </span>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Estimated cost</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              ~$<AnimatedNumber value={estCostCents} />
              <span className="font-normal text-stone-400">¢</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 3: Compute Budget ───────────────────────────────────────────────────

function ComputeStep({
  instanceType,
  setInstanceType,
  gpu,
  setGpu,
}: {
  instanceType: InstanceType;
  setInstanceType: (t: InstanceType) => void;
  gpu: GpuId;
  setGpu: (g: GpuId) => void;
}) {
  const selectedGpu = GPUS.find((g) => g.id === gpu)!;
  const discountMap: Record<InstanceType, number> = { spot: 0.30, "on-demand": 1.0, reserved: 0.80 };
  const effectivePrice = selectedGpu.pricePerHr * discountMap[instanceType];
  const effectiveCents = Math.round(effectivePrice * 100);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeScaleUp}>
        <h2 className="text-[15px] font-semibold text-stone-900">Compute Budget</h2>
        <p className="mt-1 text-sm text-stone-500">Select instance type and GPU hardware.</p>
      </motion.div>

      {/* Instance type — conflict-strategy buttons */}
      <motion.div variants={fadeScaleUp} className="flex gap-1.5">
        {INSTANCE_TYPES.map((it) => (
          <button
            key={it.id}
            onClick={() => setInstanceType(it.id)}
            className={[
              "flex flex-1 flex-col rounded-xl border px-2.5 py-2.5 text-left",
              "transition-[background-color,border-color,color] duration-150",
              instanceType === it.id
                ? "border-stone-400 bg-stone-900 text-stone-50"
                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white",
            ].join(" ")}
          >
            <span className="text-xs font-semibold">{it.label}</span>
            <span className={`mt-0.5 text-[10px] ${instanceType === it.id ? "text-stone-400" : "text-stone-400"}`}>
              {it.discount}
            </span>
          </button>
        ))}
      </motion.div>

      {/* GPU grid — 2×2 with pulsing availability dot */}
      <motion.div variants={fadeScaleUp} className="grid grid-cols-2 gap-2">
        {GPUS.map((g) => {
          const isActive = g.id === gpu;
          return (
            <button
              key={g.id}
              onClick={() => setGpu(g.id)}
              className={[
                "flex flex-col gap-2.5 rounded-xl border p-3 text-left",
                "transition-[background-color,border-color] duration-150",
                isActive
                  ? "border-stone-400 bg-stone-50"
                  : "border-stone-100 bg-white hover:border-stone-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-800">{g.name}</p>
                  <p className="text-[10px] text-stone-400">{g.vram}GB VRAM</p>
                </div>
                <PulsingRing color={AVAIL_COLOR[g.avail]} />
              </div>
              <p className="text-xs font-semibold text-stone-700">
                ${g.pricePerHr.toFixed(2)}
                <span className="font-normal text-stone-400">/hr</span>
              </p>
              {/* Active dot */}
              <motion.div
                animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="h-1.5 w-1.5 self-end rounded-full bg-stone-500"
              />
            </button>
          );
        })}
      </motion.div>

      {/* Effective price */}
      <motion.div
        variants={fadeScaleUp}
        className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
      >
        <span className="text-xs text-stone-500">Effective price</span>
        <span className="text-sm font-bold text-stone-800 tabular-nums">
          $<AnimatedNumber value={effectiveCents} />
          <span className="text-xs font-normal text-stone-400">¢/hr</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 4: Submit ───────────────────────────────────────────────────────────

const INITIAL_QUEUE = 4;
const TOTAL_STEPS_MOCK = 120;
const INITIAL_LOSS = 241;
const FINAL_LOSS = 28;

function SubmitStep({
  modelName,
  gpuName,
  epochs,
}: {
  modelName: string;
  gpuName: string;
  epochs: number;
}) {
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [queuePos, setQueuePos] = useState(INITIAL_QUEUE);
  const [step, setStep] = useState(0);
  const [lossCents, setLossCents] = useState(INITIAL_LOSS);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const start = () => {
    if (phase !== "idle") return;
    setPhase("queued");

    let pos = INITIAL_QUEUE;
    const countdown = () => {
      pos--;
      setQueuePos(pos);
      if (pos > 1) {
        timerRef.current = setTimeout(countdown, 900);
      } else {
        timerRef.current = setTimeout(() => {
          setPhase("training");
          runTraining();
        }, 700);
      }
    };
    timerRef.current = setTimeout(countdown, 900);
  };

  const runTraining = () => {
    let s = 0;
    const tick = () => {
      s++;
      setStep(s);
      const progress = s / TOTAL_STEPS_MOCK;
      setPathProgress(progress);
      const loss = Math.round(INITIAL_LOSS - (INITIAL_LOSS - FINAL_LOSS) * Math.pow(progress, 0.35));
      setLossCents(loss);
      setCurrentEpoch(Math.ceil(progress * epochs));

      if (s < TOTAL_STEPS_MOCK) {
        timerRef.current = setTimeout(tick, 60);
      } else {
        setPhase("done");
      }
    };
    timerRef.current = setTimeout(tick, 60);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const epochProgress = currentEpoch > 0 ? ((step % (TOTAL_STEPS_MOCK / epochs)) / (TOTAL_STEPS_MOCK / epochs)) : 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeScaleUp}>
        <h2 className="text-[15px] font-semibold text-stone-900">
          {phase === "done" ? "Training Complete" : "Submit Job"}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {phase === "idle"    && "Review and launch your fine-tuning run."}
          {phase === "queued"  && "Job queued — waiting for GPU allocation."}
          {phase === "training"&& "Training in progress. Loss is decreasing."}
          {phase === "done"    && "Model checkpoint saved and ready to deploy."}
        </p>
      </motion.div>

      {/* Summary — only shown before start */}
      {phase === "idle" && (
        <motion.div variants={fadeScaleUp} className="rounded-xl border border-stone-100 bg-stone-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">Summary</p>
          <div className="mt-3 space-y-2">
            {[
              ["Model",  modelName],
              ["GPU",    gpuName],
              ["Epochs", String(epochs)],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-stone-500">{label}</span>
                  <span className="font-mono text-xs font-medium text-stone-700">{value}</span>
                </div>
                <div className="mt-2 h-px bg-stone-100 last:hidden" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Phase A — Queue countdown */}
      <AnimatePresence>
        {phase === "queued" && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              Position in queue
            </p>
            {/* Sonar ring + number */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 2.6], opacity: [0.25, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute h-16 w-16 rounded-full bg-stone-300"
              />
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.15, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                className="absolute h-16 w-16 rounded-full bg-stone-400"
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-stone-300 bg-white">
                <span className="text-2xl font-black text-stone-800 tabular-nums">
                  #{queuePos}
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400">Acquiring GPU — hang tight</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase B — Training */}
      <AnimatePresence>
        {(phase === "training" || phase === "done") && (
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="space-y-3"
          >
            {/* Step + Loss counters */}
            <div className="grid grid-cols-2 divide-x divide-stone-100 rounded-xl border border-stone-100 bg-stone-50">
              <div className="flex flex-col items-center py-3">
                <p className="text-[10px] text-stone-400">Step</p>
                <p className="mt-0.5 text-sm font-bold text-stone-800">
                  <AnimatedNumber value={step} /> / {TOTAL_STEPS_MOCK}
                </p>
              </div>
              <div className="flex flex-col items-center py-3">
                <p className="text-[10px] text-stone-400">Loss</p>
                <p className="mt-0.5 text-sm font-bold text-stone-800">
                  0.<AnimatedNumber value={lossCents} />
                </p>
              </div>
            </div>

            {/* Epoch progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500">
                  Epoch <AnimatedNumber value={Math.min(currentEpoch, epochs)} /> of {epochs}
                </span>
                {phase === "done" && (
                  <span className="text-[10px] font-semibold text-emerald-600">Complete</span>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                <motion.div
                  animate={{ scaleX: phase === "done" ? 1 : epochProgress }}
                  transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                  style={{ originX: 0 }}
                  className="h-full rounded-full bg-stone-800"
                />
              </div>
            </div>

            {/* SVG loss curve */}
            <div className="overflow-hidden rounded-xl border border-stone-100 bg-stone-50 p-3">
              <p className="mb-2 text-[10px] text-stone-400">Training loss</p>
              <svg
                viewBox="0 0 200 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[16, 32, 48].map((y) => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#e7e5e4" strokeWidth="0.5" />
                ))}
                {/* Loss curve — drawn progressively via clipPath */}
                <defs>
                  <clipPath id="curve-clip">
                    <rect x="0" y="0" width={200 * pathProgress} height="64" />
                  </clipPath>
                </defs>
                {/* Background full curve (faint) */}
                <path d={LOSS_CURVE_D} stroke="#e7e5e4" strokeWidth="1.5" fill="none" />
                {/* Animated foreground curve */}
                <path
                  d={LOSS_CURVE_D}
                  stroke="#1c1917"
                  strokeWidth="1.5"
                  fill="none"
                  clipPath="url(#curve-clip)"
                />
                {/* Moving dot at curve head */}
                {phase === "training" && (
                  <motion.circle
                    r="2.5"
                    fill="#1c1917"
                    animate={{ cx: 200 * pathProgress }}
                    transition={{ duration: 0.06, ease: "linear" }}
                    cy={6 + (58.5 - 6) * Math.pow(pathProgress, 0.35)}
                  />
                )}
              </svg>
            </div>

            {/* Done success check */}
            {phase === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                className="flex flex-col items-center gap-3 py-1"
              >
                <span className="t-success-check" data-state="in" style={{ width: 40, height: 40 }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
                    <path d="M12 21l6 6 10-12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-xs font-medium text-emerald-600">Checkpoint saved — ready to deploy</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {phase === "idle" && (
        <motion.div variants={fadeScaleUp}>
          <button
            onClick={start}
            className={[
              "flex h-9 w-full items-center justify-center gap-2 rounded-xl",
              "bg-stone-900 text-sm font-semibold text-stone-50",
              "transition-[background-color] duration-150 hover:bg-stone-800 active:scale-[0.96]",
            ].join(" ")}
          >
            <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2.5} color="currentColor" />
            Submit Fine-Tuning Job
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FineTuningLauncher() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection]     = useState(1);
  const [ref, bounds]                 = useMeasure();

  // Step 0
  const [modelId, setModelId] = useState<ModelId>("llama-8b");

  // Step 1
  const [dataSource, setDataSource] = useState<DatasetSource>("jsonl");
  const [splitPct, setSplitPct]     = useState(80);
  const TOTAL_SAMPLES               = 24000;

  // Step 2
  const [lrIdx, setLrIdx]         = useState(1);
  const [epochs, setEpochs]       = useState(3);
  const [batchSize, setBatchSize] = useState<BatchSize>(8);

  // Step 3
  const [instanceType, setInstanceType] = useState<InstanceType>("on-demand");
  const [gpu, setGpu]                   = useState<GpuId>("a100");

  const selectedModel = MODELS.find((m) => m.id === modelId)!;
  const selectedGpu   = GPUS.find((g) => g.id === gpu)!;
  const trainSamples  = Math.round(TOTAL_SAMPLES * (splitPct / 100));

  const canProceed = currentStep !== 4;

  const goNext = () => { setDirection(1);  setCurrentStep((p) => p + 1); };
  const goBack = () => { setDirection(-1); setCurrentStep((p) => p - 1); };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <BaseModelStep selected={modelId} setSelected={setModelId} />;
      case 1:
        return (
          <DatasetStep
            source={dataSource}
            setSource={setDataSource}
            splitPct={splitPct}
            setSplitPct={setSplitPct}
            totalSamples={TOTAL_SAMPLES}
          />
        );
      case 2:
        return (
          <HyperparamsStep
            lrIdx={lrIdx}
            setLrIdx={setLrIdx}
            epochs={epochs}
            setEpochs={setEpochs}
            batchSize={batchSize}
            setBatchSize={setBatchSize}
            trainSamples={trainSamples}
            modelCostPerHr={selectedModel.costPerHr}
          />
        );
      case 3:
        return (
          <ComputeStep
            instanceType={instanceType}
            setInstanceType={setInstanceType}
            gpu={gpu}
            setGpu={setGpu}
          />
        );
      case 4:
        return (
          <SubmitStep
            modelName={selectedModel.name}
            gpuName={selectedGpu.name}
            epochs={epochs}
          />
        );
    }
  }, [
    currentStep, modelId, dataSource, splitPct, lrIdx, epochs,
    batchSize, instanceType, gpu, trainSamples, selectedModel, selectedGpu,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-stone-100 p-4 antialiased">
      <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
        <div className="w-full max-w-[460px] overflow-hidden rounded-3xl bg-stone-200/60 p-2 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_8px_20px_-4px_rgba(0,0,0,0.08)]">
          <motion.div
            animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
            className="overflow-hidden rounded-2xl bg-white"
          >
            <div ref={ref}>
              {/* Progress */}
              <div className="px-6 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-stone-400">
                    Step {currentStep + 1} of {STEPS.length}
                  </p>
                  <p className="text-[11px] font-semibold text-stone-700">{STEPS[currentStep]}</p>
                </div>
                <div className="flex gap-1">
                  {STEPS.map((_, i) => {
                    const isDone   = i < currentStep;
                    const isActive = i === currentStep;
                    return (
                      <div key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
                        <motion.div
                          animate={{ scaleX: isDone || isActive ? 1 : 0 }}
                          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                          style={{ originX: 0 }}
                          className={`absolute inset-0 rounded-full ${isDone ? "bg-stone-800" : "bg-stone-400"}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step content */}
              <div className="relative overflow-hidden p-6">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.div
                    key={currentStep}
                    variants={slideVariants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    custom={direction}
                  >
                    {stepContent}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between rounded-b-2xl bg-stone-50 px-4 py-4">
                <motion.button
                  onClick={goBack}
                  disabled={currentStep === 0}
                  whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: currentStep === 0 ? 1 : 0.96 }}
                  className={[
                    "flex h-9 items-center gap-1.5 rounded-xl px-4",
                    "border border-stone-200 bg-white text-sm font-medium text-stone-500",
                    "transition-[background-color,border-color,color] duration-150",
                    "hover:border-stone-300 hover:text-stone-800",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                  ].join(" ")}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2.5} color="currentColor" />
                  Back
                </motion.button>

                {currentStep < 4 && (
                  <motion.button
                    onClick={goNext}
                    disabled={!canProceed}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={[
                      "flex h-9 items-center gap-1.5 rounded-xl pr-3.5 pl-4",
                      "bg-stone-900 text-sm font-semibold text-stone-50",
                      "transition-[background-color,opacity] duration-150 hover:bg-stone-800",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                    ].join(" ")}
                  >
                    Continue
                    <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2.5} color="currentColor" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </MotionConfig>
    </div>
  );
}
