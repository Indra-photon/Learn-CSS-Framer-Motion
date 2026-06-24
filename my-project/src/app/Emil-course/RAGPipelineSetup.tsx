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
  Analytics01Icon,
  ConnectIcon,
  DashboardCircleIcon,
} from "@hugeicons/core-free-icons";
import "./DatabaseMigrationWizard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmbeddingModel = "openai-small" | "openai-large" | "cohere" | "bge-m3";
type ChunkStrategy = "fixed" | "semantic" | "recursive";
type DataSourceId = "s3" | "github" | "notion" | "postgres" | "local";
type SourceStatus = "pending" | "indexing" | "done";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Model", "Chunking", "Config", "Sources", "Index"];

const EMBEDDING_MODELS: {
  id: EmbeddingModel;
  name: string;
  provider: string;
  dims: number;
  costPer1M: string;
  speed: "Fast" | "Balanced" | "Accurate";
  speedColor: string;
  desc: string;
}[] = [
  {
    id: "openai-small",
    name: "text-embedding-3-small",
    provider: "OpenAI",
    dims: 1536,
    costPer1M: "$0.02",
    speed: "Fast",
    speedColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
    desc: "Best for most use cases. High throughput and low cost — good default.",
  },
  {
    id: "openai-large",
    name: "text-embedding-3-large",
    provider: "OpenAI",
    dims: 3072,
    costPer1M: "$0.13",
    speed: "Accurate",
    speedColor: "text-violet-600 bg-violet-50 border-violet-200",
    desc: "Maximum semantic accuracy. Best for complex reasoning tasks.",
  },
  {
    id: "cohere",
    name: "embed-v3.0",
    provider: "Cohere",
    dims: 1024,
    costPer1M: "$0.10",
    speed: "Balanced",
    speedColor: "text-amber-600 bg-amber-50 border-amber-200",
    desc: "Strong multilingual support with int8 compression built in.",
  },
  {
    id: "bge-m3",
    name: "BGE-M3",
    provider: "BAAI",
    dims: 1024,
    costPer1M: "Free",
    speed: "Balanced",
    speedColor: "text-amber-600 bg-amber-50 border-amber-200",
    desc: "Open-source, runs locally. No API key or egress cost needed.",
  },
];

const CHUNK_STRATEGIES: {
  id: ChunkStrategy;
  label: string;
  desc: string;
  detail: string;
}[] = [
  {
    id: "fixed",
    label: "Fixed",
    desc: "Split by token count",
    detail:
      "Deterministic and fast. Splits at exactly N tokens. Best for structured documents and tables.",
  },
  {
    id: "semantic",
    label: "Semantic",
    desc: "Split by meaning",
    detail:
      "Groups semantically related sentences using cosine similarity. Best for long-form prose.",
  },
  {
    id: "recursive",
    label: "Recursive",
    desc: "Split by hierarchy",
    detail:
      "Tries paragraphs → sentences → words in sequence. Most flexible for mixed document types.",
  },
];

const DATA_SOURCES: {
  id: DataSourceId;
  label: string;
  sublabel: string;
  docCount: number;
  icon: typeof ZapIcon;
}[] = [
  {
    id: "s3",
    label: "S3 Bucket",
    sublabel: "docs.company.com",
    docCount: 12400,
    icon: SparklesIcon,
  },
  {
    id: "github",
    label: "GitHub Repo",
    sublabel: "org/knowledge-base",
    docCount: 3280,
    icon: ConnectIcon,
  },
  {
    id: "notion",
    label: "Notion Workspace",
    sublabel: "Team Wiki",
    docCount: 891,
    icon: DashboardCircleIcon,
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    sublabel: "prod.db / articles",
    docCount: 48200,
    icon: Analytics01Icon,
  },
  {
    id: "local",
    label: "Local Files",
    sublabel: "/uploads/docs",
    docCount: 240,
    icon: ZapIcon,
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants = {
  initial: (dir: number) => ({ x: `${110 * dir}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: `${-110 * dir}%`, opacity: 0 }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const fadeBlurUp = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, duration: 0.4, bounce: 0 },
  },
};

const ICON_ANIM = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring" as const, duration: 0.3, bounce: 0 },
};

// ─── CSS animation helpers ────────────────────────────────────────────────────

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

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const groupRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    <span
      ref={groupRef}
      className={`t-digit-group tabular-nums${className ? ` ${className}` : ""}`}
    >
      {str.split("").map((ch, i) => (
        <span key={i} className="t-digit" data-stagger={String(Math.min(i, 2))}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// ─── Step 0: Embedding Model ──────────────────────────────────────────────────

function EmbeddingModelStep({
  selected,
  setSelected,
}: {
  selected: EmbeddingModel;
  setSelected: (m: EmbeddingModel) => void;
}) {
  const descRef = useRef<HTMLParagraphElement>(null);
  const prevSelected = useRef(selected);

  useEffect(() => {
    if (selected === prevSelected.current) return;
    prevSelected.current = selected;
    if (descRef.current) {
      const m = EMBEDDING_MODELS.find((x) => x.id === selected);
      if (m) swapText(descRef.current, m.desc);
    }
  }, [selected]);

  const model = EMBEDDING_MODELS.find((m) => m.id === selected)!;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          Embedding Model
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Defines how documents are converted to vectors.
        </p>
      </motion.div>

      {/* Model grid */}
      <motion.div variants={fadeBlurUp} className="grid grid-cols-2 gap-2">
        {EMBEDDING_MODELS.map((m) => {
          const isActive = m.id === selected;
          return (
            <motion.button
              key={m.id}
              onClick={() => setSelected(m.id)}
              whileTap={{ scale: 0.97 }}
              className={[
                "flex flex-col gap-2 rounded-xl border p-3 text-left",
                "transition-[background-color,border-color] duration-150",
                isActive
                  ? "border-stone-400 bg-stone-50"
                  : "border-stone-100 bg-white hover:border-stone-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-[11px] font-semibold text-stone-800 leading-snug">
                    {m.name}
                  </p>
                  <p className="text-[10px] text-stone-400">{m.provider}</p>
                </div>
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${m.speedColor}`}
                >
                  {m.speed}
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] text-stone-400">Dims</p>
                  <p className="text-xs font-semibold text-stone-700 tabular-nums">
                    {m.dims.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-400">Cost / 1M</p>
                  <p className="text-xs font-semibold text-stone-700">{m.costPer1M}</p>
                </div>
              </div>

              {/* Active dot */}
              <motion.div
                animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="h-1.5 w-1.5 self-end rounded-full bg-stone-500"
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Description — text swaps on model change */}
      <motion.div
        variants={fadeBlurUp}
        className="rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3"
      >
        <p
          ref={descRef}
          className="t-text-swap text-xs leading-relaxed text-stone-500"
        >
          {model.desc}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 1: Chunking Strategy ────────────────────────────────────────────────

function ChunkingStep({
  strategy,
  setStrategy,
  chunkSize,
  setChunkSize,
  overlap,
  setOverlap,
}: {
  strategy: ChunkStrategy;
  setStrategy: (s: ChunkStrategy) => void;
  chunkSize: number;
  setChunkSize: (v: number) => void;
  overlap: number;
  setOverlap: (v: number) => void;
}) {
  const detailRef = useRef<HTMLParagraphElement>(null);
  const prevStrategy = useRef(strategy);

  useEffect(() => {
    if (strategy === prevStrategy.current) return;
    prevStrategy.current = strategy;
    if (detailRef.current) {
      const s = CHUNK_STRATEGIES.find((x) => x.id === strategy);
      if (s) swapText(detailRef.current, s.detail);
    }
  }, [strategy]);

  const current = CHUNK_STRATEGIES.find((s) => s.id === strategy)!;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          Chunking Strategy
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          How documents are split before embedding.
        </p>
      </motion.div>

      {/* Strategy buttons */}
      <motion.div variants={fadeBlurUp} className="flex gap-1.5">
        {CHUNK_STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id)}
            className={[
              "flex flex-1 flex-col rounded-xl border px-2.5 py-2.5 text-left",
              "transition-[background-color,border-color,color] duration-150",
              strategy === s.id
                ? "border-stone-400 bg-stone-900 text-stone-50"
                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white",
            ].join(" ")}
          >
            <span className="text-xs font-semibold">{s.label}</span>
            <span
              className={`mt-0.5 text-[10px] leading-snug ${strategy === s.id ? "text-stone-400" : "text-stone-400"}`}
            >
              {s.desc}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Detail — swaps on strategy change */}
      <motion.div
        variants={fadeBlurUp}
        className="rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3"
      >
        <p ref={detailRef} className="t-text-swap text-xs leading-relaxed text-stone-500">
          {current.detail}
        </p>
      </motion.div>

      {/* Sliders */}
      <motion.div variants={fadeBlurUp} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-600">Chunk size</label>
            <span className="text-xs font-semibold text-stone-800 tabular-nums">
              <AnimatedNumber value={chunkSize} /> tokens
            </span>
          </div>
          <input
            type="range"
            min={64}
            max={2048}
            step={64}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="w-full accent-stone-800"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>64</span>
            <span>2 048</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-600">Overlap</label>
            <span className="text-xs font-semibold text-stone-800 tabular-nums">
              <AnimatedNumber value={overlap} /> tokens
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={512}
            step={16}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            className="w-full accent-stone-800"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>0</span>
            <span>512</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 2: Index Configuration ─────────────────────────────────────────────

function IndexConfigStep({
  chunkSize,
  overlap,
  topK,
  setTopK,
  totalDocs,
  dims,
}: {
  chunkSize: number;
  overlap: number;
  topK: number;
  setTopK: (v: number) => void;
  totalDocs: number;
  dims: number;
}) {
  const avgChunks = Math.max(1, 1500 / chunkSize) * (1 + overlap / chunkSize);
  const estimatedVectors = Math.round(totalDocs * avgChunks);
  const indexSizeMB = Math.round((estimatedVectors * dims * 4) / (1024 * 1024));
  const latencyMs = Math.round(10 + (topK / 100) * 30 + (dims / 3072) * 15);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          Index Configuration
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Tune retrieval precision and query performance.
        </p>
      </motion.div>

      {/* Top-K slider */}
      <motion.div variants={fadeBlurUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-600">Top-K results</label>
          <span className="text-xs font-semibold text-stone-800 tabular-nums">
            <AnimatedNumber value={topK} />
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="w-full accent-stone-800"
        />
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>1</span>
          <span>100</span>
        </div>
      </motion.div>

      {/* Estimates card — all three numbers tick live */}
      <motion.div
        variants={fadeBlurUp}
        className="rounded-xl border border-stone-100 bg-stone-50 p-4"
      >
        <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
          Estimates
        </p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Total vectors</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              <AnimatedNumber value={estimatedVectors} />
            </span>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Index size</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              ~<AnimatedNumber value={indexSizeMB} /> MB
            </span>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Query latency</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              ~<AnimatedNumber value={latencyMs} />ms
            </span>
          </div>
        </div>
      </motion.div>

      {/* Vector dims badge — updates if model changes */}
      <motion.div
        variants={fadeBlurUp}
        className="flex items-center justify-between rounded-xl border border-stone-100 bg-white px-3.5 py-3"
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          Vector dims
        </span>
        <span className="text-xs font-semibold text-stone-700 tabular-nums">
          <AnimatedNumber value={dims} />
        </span>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 3: Data Sources ─────────────────────────────────────────────────────

function DataSourceStep({
  selectedSources,
  toggleSource,
}: {
  selectedSources: Set<DataSourceId>;
  toggleSource: (id: DataSourceId) => void;
}) {
  const [digitsReady, setDigitsReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDigitsReady(true), 120);
    return () => clearTimeout(timerRef.current);
  }, []);

  const totalDocs = DATA_SOURCES.filter((s) => selectedSources.has(s.id)).reduce(
    (acc, s) => acc + s.docCount,
    0,
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          Data Sources
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Select sources to include in the pipeline.
        </p>
      </motion.div>

      {/* Source list */}
      <motion.div variants={fadeBlurUp} className="space-y-1.5">
        {DATA_SOURCES.map((src) => {
          const checked = selectedSources.has(src.id);
          return (
            <button
              key={src.id}
              onClick={() => toggleSource(src.id)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left",
                "transition-[background-color,border-color] duration-150",
                checked
                  ? "border-stone-300 bg-stone-50"
                  : "border-stone-100 bg-white hover:border-stone-200",
              ].join(" ")}
            >
              {/* Checkbox */}
              <motion.div
                animate={{
                  backgroundColor: checked ? "#1c1917" : "#fff",
                  borderColor: checked ? "#1c1917" : "#d6d3d1",
                }}
                transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
              >
                <AnimatePresence initial={false}>
                  {checked && (
                    <motion.span
                      key="chk"
                      {...ICON_ANIM}
                      className="flex items-center"
                    >
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        size={9}
                        strokeWidth={3}
                        color="white"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Source icon */}
              <span className="flex shrink-0 items-center text-stone-400">
                <HugeiconsIcon
                  icon={src.icon}
                  size={14}
                  strokeWidth={2}
                  color="currentColor"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-stone-700">{src.label}</p>
                <p className="truncate text-[10px] text-stone-400">{src.sublabel}</p>
              </div>

              <span className="shrink-0 text-xs text-stone-400 tabular-nums">
                {digitsReady ? <AnimatedNumber value={src.docCount} /> : "—"}{" "}
                <span className="text-stone-300">docs</span>
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Total counter — springs in when sources selected */}
      <AnimatePresence>
        {selectedSources.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 4, height: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-stone-500">
              <span className="font-semibold text-stone-700 tabular-nums">
                <AnimatedNumber value={totalDocs} />
              </span>{" "}
              total documents from{" "}
              <span className="font-semibold text-stone-700">{selectedSources.size}</span>{" "}
              source{selectedSources.size > 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Step 4: Index (Execute) ──────────────────────────────────────────────────

function IndexStep({
  selectedSources,
  totalDocs,
  embeddingModel,
  dims,
}: {
  selectedSources: Set<DataSourceId>;
  totalDocs: number;
  embeddingModel: EmbeddingModel;
  dims: number;
}) {
  const sources = DATA_SOURCES.filter((s) => selectedSources.has(s.id));
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, SourceStatus>>(
    Object.fromEntries(sources.map((s) => [s.id, "pending"])),
  );
  const [vectorsIndexed, setVectorsIndexed] = useState(0);
  const activeTextRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const modelInfo = EMBEDDING_MODELS.find((m) => m.id === embeddingModel)!;
  const totalVectors = Math.round(totalDocs * 1.8);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);

    let indexed = 0;
    let srcIdx = 0;

    const runSource = () => {
      if (srcIdx >= sources.length) {
        setDone(true);
        return;
      }
      const src = sources[srcIdx];
      setSourceStatuses((prev) => ({ ...prev, [src.id]: "indexing" }));
      if (activeTextRef.current) swapText(activeTextRef.current, src.label);

      const numTicks = 10;
      const vectorsForSrc = Math.round(src.docCount * 1.8);
      const tickVectors = Math.ceil(vectorsForSrc / numTicks);
      let left = vectorsForSrc;

      const tick = () => {
        const chunk = Math.min(tickVectors, left);
        left -= chunk;
        indexed += chunk;
        setVectorsIndexed(indexed);

        if (left > 0) {
          timerRef.current = setTimeout(tick, 380);
        } else {
          setSourceStatuses((prev) => ({ ...prev, [src.id]: "done" }));
          srcIdx++;
          timerRef.current = setTimeout(runSource, 280);
        }
      };
      timerRef.current = setTimeout(tick, 380);
    };

    runSource();
  }, [started, sources]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          {done ? "Pipeline Ready" : "Build Index"}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {done
            ? "Your vector index is live and ready to query."
            : "Embedding and indexing all selected documents."}
        </p>
      </motion.div>

      {/* Pre-start summary */}
      {!started && (
        <motion.div
          variants={fadeBlurUp}
          className="rounded-xl border border-stone-100 bg-stone-50 p-4"
        >
          <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
            Summary
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Model</span>
              <span className="font-mono text-xs font-medium text-stone-700">
                {modelInfo.name}
              </span>
            </div>
            <div className="h-px bg-stone-100" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Dimensions</span>
              <span className="text-xs font-medium text-stone-700 tabular-nums">
                {dims.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-stone-100" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Sources</span>
              <span className="text-xs font-medium text-stone-700">{sources.length}</span>
            </div>
            <div className="h-px bg-stone-100" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Est. vectors</span>
              <span className="text-xs font-medium text-stone-700 tabular-nums">
                ~{totalVectors.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live progress */}
      {started && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          className="space-y-3"
        >
          {/* Vector counter */}
          <div className="flex items-baseline justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
            <span className="text-xs text-stone-500">Vectors indexed</span>
            <span className="text-sm font-bold text-stone-800">
              <AnimatedNumber value={vectorsIndexed} />
              <span className="ml-1 text-xs font-normal text-stone-400">
                / ~{totalVectors.toLocaleString()}
              </span>
            </span>
          </div>

          {/* Active source text swap */}
          {!done && (
            <div className="flex items-center gap-2 px-0.5">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 0.85 }}
                className="flex shrink-0 items-center text-stone-500"
              >
                <HugeiconsIcon
                  icon={Loading01Icon}
                  size={12}
                  strokeWidth={2.5}
                  color="currentColor"
                />
              </motion.span>
              <span className="text-xs text-stone-500">
                Embedding{" "}
                <span
                  ref={activeTextRef}
                  className="t-text-swap font-medium text-stone-700"
                >
                  —
                </span>
              </span>
            </div>
          )}

          {/* Per-source status list */}
          <div className="space-y-1">
            {sources.map((src) => {
              const st = sourceStatuses[src.id];
              return (
                <div
                  key={src.id}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white px-3 py-2"
                >
                  {/* t-icon-swap: pending/indexing(a) → done(b) */}
                  <span
                    className="t-icon-swap shrink-0"
                    data-state={st === "done" ? "b" : "a"}
                  >
                    <span
                      className="t-icon flex items-center text-stone-300"
                      data-icon="a"
                    >
                      {st === "indexing" ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 0.85,
                          }}
                          className="flex items-center text-amber-400"
                        >
                          <HugeiconsIcon
                            icon={Loading01Icon}
                            size={13}
                            strokeWidth={2.5}
                            color="currentColor"
                          />
                        </motion.span>
                      ) : (
                        <span className="h-3 w-3 rounded-full border-2 border-stone-200" />
                      )}
                    </span>
                    <span
                      className="t-icon flex items-center text-emerald-500"
                      data-icon="b"
                    >
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        size={13}
                        strokeWidth={2.5}
                        color="currentColor"
                      />
                    </span>
                  </span>

                  <span
                    className={[
                      "flex-1 text-xs",
                      st === "done"
                        ? "text-stone-400 line-through"
                        : st === "indexing"
                          ? "font-semibold text-stone-800"
                          : "text-stone-500",
                    ].join(" ")}
                  >
                    {src.label}
                  </span>

                  <span className="shrink-0 text-[10px] text-stone-400 tabular-nums">
                    {src.docCount.toLocaleString()} docs
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Success check */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          className="flex flex-col items-center gap-3 py-2"
        >
          <span
            className="t-success-check"
            data-state="in"
            style={{ width: 40, height: 40 }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="#f0fdf4"
                stroke="#bbf7d0"
                strokeWidth="2"
              />
              <path
                d="M12 21l6 6 10-12"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="text-xs font-medium text-emerald-600">
            Index built — ready to query
          </p>
        </motion.div>
      )}

      {/* Start button */}
      {!started && (
        <motion.div variants={fadeBlurUp}>
          <button
            onClick={start}
            className={[
              "flex h-9 w-full items-center justify-center gap-2 rounded-xl",
              "bg-stone-900 text-sm font-semibold text-stone-50",
              "transition-[background-color] duration-150 hover:bg-stone-800",
              "active:scale-[0.96]",
            ].join(" ")}
          >
            <HugeiconsIcon icon={ZapIcon} size={13} strokeWidth={2.5} color="currentColor" />
            Build Index
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RAGPipelineSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

  // Step 0 — model
  const [embeddingModel, setEmbeddingModel] = useState<EmbeddingModel>("openai-small");

  // Step 1 — chunking
  const [strategy, setStrategy] = useState<ChunkStrategy>("fixed");
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(64);

  // Step 2 — config
  const [topK, setTopK] = useState(10);

  // Step 3 — sources
  const [selectedSources, setSelectedSources] = useState<Set<DataSourceId>>(
    new Set(["s3", "github"]),
  );

  const toggleSource = useCallback((id: DataSourceId) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectedModel = EMBEDDING_MODELS.find((m) => m.id === embeddingModel)!;
  const dims = selectedModel.dims;

  const totalDocs = useMemo(
    () =>
      DATA_SOURCES.filter((s) => selectedSources.has(s.id)).reduce(
        (acc, s) => acc + s.docCount,
        0,
      ),
    [selectedSources],
  );

  const canProceed = useMemo(() => {
    if (currentStep === 3) return selectedSources.size > 0;
    return true;
  }, [currentStep, selectedSources]);

  const goNext = () => {
    setDirection(1);
    setCurrentStep((p) => p + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setCurrentStep((p) => p - 1);
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <EmbeddingModelStep
            selected={embeddingModel}
            setSelected={setEmbeddingModel}
          />
        );
      case 1:
        return (
          <ChunkingStep
            strategy={strategy}
            setStrategy={setStrategy}
            chunkSize={chunkSize}
            setChunkSize={setChunkSize}
            overlap={overlap}
            setOverlap={setOverlap}
          />
        );
      case 2:
        return (
          <IndexConfigStep
            chunkSize={chunkSize}
            overlap={overlap}
            topK={topK}
            setTopK={setTopK}
            totalDocs={totalDocs}
            dims={dims}
          />
        );
      case 3:
        return (
          <DataSourceStep
            selectedSources={selectedSources}
            toggleSource={toggleSource}
          />
        );
      case 4:
        return (
          <IndexStep
            selectedSources={selectedSources}
            totalDocs={totalDocs}
            embeddingModel={embeddingModel}
            dims={dims}
          />
        );
    }
  }, [
    currentStep,
    embeddingModel,
    strategy,
    chunkSize,
    overlap,
    topK,
    selectedSources,
    totalDocs,
    dims,
    toggleSource,
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
              {/* ── Step progress ─────────────────────────────────────────── */}
              <div className="px-6 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-stone-400">
                    Step {currentStep + 1} of {STEPS.length}
                  </p>
                  <p className="text-[11px] font-semibold text-stone-700">
                    {STEPS[currentStep]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {STEPS.map((_, i) => {
                    const isDone = i < currentStep;
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

              {/* ── Step content ──────────────────────────────────────────── */}
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

              {/* ── Footer ────────────────────────────────────────────────── */}
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
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={13}
                    strokeWidth={2.5}
                    color="currentColor"
                  />
                  Back
                </motion.button>

                {currentStep < 4 && (
                  <motion.button
                    onClick={goNext}
                    disabled={!canProceed}
                    whileHover={{ scale: canProceed ? 1.02 : 1 }}
                    whileTap={{ scale: canProceed ? 0.96 : 1 }}
                    className={[
                      "flex h-9 items-center gap-1.5 rounded-xl pr-3.5 pl-4",
                      "bg-stone-900 text-sm font-semibold text-stone-50",
                      "transition-[background-color,opacity] duration-150 hover:bg-stone-800",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                    ].join(" ")}
                  >
                    Continue
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={13}
                      strokeWidth={2.5}
                      color="currentColor"
                    />
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
