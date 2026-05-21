// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import useMeasure from "react-use-measure";
// import { HugeiconsIcon } from "@hugeicons/react";
// import {
//   ChatGptIcon,
//   AiBrain01Icon,
//   AiChipIcon,
//   GoogleGeminiIcon,
//   AiNetworkIcon,
// } from "@hugeicons/core-free-icons";
// import { BarChart } from "@/components/charts/bar-chart";
// import { Bar } from "@/components/charts/bar";
// import { Gauge } from "@/components/charts/gauge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface Benchmark {
//   name: string;
//   score: number;
// }

// type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>> | object;

// interface Model {
//   rank: number;
//   name: string;
//   company: string;
//   color: string;
//   icon: IconType;
//   benchmarks: Benchmark[];
//   output: string;
//   latency: string;
//   vendor: string;
// }

// const BENCHMARKS = ["SWE-bench", "GPQA", "AIME 2025", "MMLU-Pro"] as const;
// type BenchmarkKey = (typeof BENCHMARKS)[number];

// const models: Model[] = [
//   {
//     rank: 1,
//     name: "GPT-5.5",
//     company: "OpenAI",
//     color: "#4ade80",
//     icon: ChatGptIcon,
//     benchmarks: [
//       { name: "SWE-bench", score: 88.7 },
//       { name: "GPQA", score: 90.2 },
//       { name: "AIME 2025", score: 96.1 },
//       { name: "MMLU-Pro", score: 89.0 },
//     ],
//     output: "$25.00/M",
//     latency: "0.8s",
//     vendor: "OpenAI",
//   },
//   {
//     rank: 2,
//     name: "Claude Opus 4.7",
//     company: "Anthropic",
//     color: "#f59e0b",
//     icon: AiBrain01Icon,
//     benchmarks: [
//       { name: "SWE-bench", score: 87.6 },
//       { name: "GPQA", score: 89.1 },
//       { name: "AIME 2025", score: 95.3 },
//       { name: "MMLU-Pro", score: 88.4 },
//     ],
//     output: "$20.00/M",
//     latency: "0.9s",
//     vendor: "Anthropic",
//   },
//   {
//     rank: 3,
//     name: "Grok 4",
//     company: "xAI",
//     color: "#f43f5e",
//     icon: AiChipIcon,
//     benchmarks: [
//       { name: "SWE-bench", score: 83.4 },
//       { name: "GPQA", score: 87.5 },
//       { name: "AIME 2025", score: 94.6 },
//       { name: "MMLU-Pro", score: 84.1 },
//     ],
//     output: "$15.00/M",
//     latency: "1.0s",
//     vendor: "xAI",
//   },
//   {
//     rank: 4,
//     name: "Gemini 3 Pro",
//     company: "Google",
//     color: "#3b82f6",
//     icon: GoogleGeminiIcon,
//     benchmarks: [
//       { name: "SWE-bench", score: 80.6 },
//       { name: "GPQA", score: 84.2 },
//       { name: "AIME 2025", score: 91.0 },
//       { name: "MMLU-Pro", score: 81.7 },
//     ],
//     output: "$10.00/M",
//     latency: "1.2s",
//     vendor: "Google",
//   },
//   {
//     rank: 5,
//     name: "DeepSeek V3.1",
//     company: "DeepSeek",
//     color: "#a855f7",
//     icon: AiNetworkIcon,
//     benchmarks: [
//       { name: "SWE-bench", score: 76.2 },
//       { name: "GPQA", score: 79.4 },
//       { name: "AIME 2025", score: 88.3 },
//       { name: "MMLU-Pro", score: 77.9 },
//     ],
//     output: "$2.00/M",
//     latency: "1.5s",
//     vendor: "DeepSeek",
//   },
// ];

// const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
// const HEIGHT_TRANSITION = { duration: 0.35, ease: EASE_OUT_QUART } as const;
// const FADE_TRANSITION = { duration: 0.25, ease: EASE_OUT_QUART } as const;

// function getScore(model: Model, benchmark: BenchmarkKey) {
//   return model.benchmarks.find((b) => b.name === benchmark)?.score ?? 0;
// }

// function AnimatedScore({ score }: { score: number }) {
//   return (
//     <div className="flex-shrink-0 flex items-baseline gap-0.5">
//       <div className="relative overflow-hidden">
//         <AnimatePresence mode="popLayout" initial={false}>
//           <motion.span
//             key={score}
//             initial={{ y: 14, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -14, opacity: 0 }}
//             transition={{ duration: 0.22, ease: EASE_OUT_QUART }}
//             className="block text-xl font-bold text-gray-900 tabular-nums"
//           >
//             {score}
//           </motion.span>
//         </AnimatePresence>
//       </div>
//       <span className="text-sm text-gray-400">%</span>
//     </div>
//   );
// }

// function ProgressBar({
//   score,
//   color,
// }: {
//   score: number;
//   color: string;
// }) {
//   return (
//     <div className="relative h-2 w-full rounded-full overflow-hidden bg-gray-200">
//       <motion.div
//         className="absolute left-0 top-0 h-full rounded-full"
//         animate={{ width: `${score}%` }}
//         transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
//         style={{ backgroundColor: color }}
//       />
//     </div>
//   );
// }

// function BenchmarkBar({ bench, color }: { bench: Benchmark; color: string }) {
//   const barData = [
//     {
//       name: bench.name,
//       score: bench.score,
//       rest: parseFloat((100 - bench.score).toFixed(1)),
//     },
//   ];

//   return (
//     <div className="flex items-center gap-2">
//       <span className="w-16 flex-shrink-0 text-[10px] text-gray-500 text-right leading-tight">
//         {bench.name}
//       </span>
//       <div className="flex-1 h-2.5 rounded-full overflow-hidden">
//         <BarChart
//           data={barData}
//           xDataKey="name"
//           orientation="horizontal"
//           stacked={true}
//           margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
//           barGap={0}
//           animationDuration={700}
//           aspectRatio="auto"
//           className="h-full"
//         >
//           <Bar dataKey="score" fill={color} lineCap="butt" />
//           <Bar dataKey="rest" fill="#e5e7eb" lineCap="butt" />
//         </BarChart>
//       </div>
//       <span className="w-8 flex-shrink-0 text-[10px] font-semibold text-gray-700">
//         {bench.score}
//       </span>
//     </div>
//   );
// }

// function ModelRow({
//   model,
//   isOpen,
//   onToggle,
//   selectedBenchmark,
// }: {
//   model: Model;
//   isOpen: boolean;
//   onToggle: () => void;
//   selectedBenchmark: BenchmarkKey;
// }) {
//   const [innerRef, bounds] = useMeasure();
//   const score = getScore(model, selectedBenchmark);

//   return (
//     <div className="border-b border-dashed border-gray-200 last:border-0">
//       <button
//         onClick={onToggle}
//         className="w-full text-left px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
//       >
//         {/* AI icon badge */}
//         <div
//           className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
//           style={{ backgroundColor: `${model.color}22` }}
//         >
//           <HugeiconsIcon
//             icon={model.icon as Parameters<typeof HugeiconsIcon>[0]["icon"]}
//             size={20}
//             color={model.color}
//             strokeWidth={1.8}
//           />
//         </div>

//         {/* Name + company */}
//         <div className="w-36 flex-shrink-0">
//           <div className="text-base font-semibold text-gray-900">{model.name}</div>
//           <div className="text-sm text-gray-400">{model.company}</div>
//         </div>

//         {/* Animated progress bar */}
//         <div className="flex-1 px-4">
//           <ProgressBar score={score} color={model.color} />
//         </div>

//         {/* Animated score number */}
//         <AnimatedScore score={score} />

//         {/* Chevron */}
//         <motion.svg
//           animate={{ rotate: isOpen ? 180 : 0 }}
//           transition={HEIGHT_TRANSITION}
//           className="flex-shrink-0 w-4 h-4 text-gray-400"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </motion.svg>
//       </button>

//       {/* Animated height wrapper */}
//       <motion.div
//         initial={false}
//         animate={{ height: isOpen ? bounds.height : 0 }}
//         transition={HEIGHT_TRANSITION}
//         className="overflow-hidden"
//       >
//         <div ref={innerRef} className="px-4 pb-4">
//           <AnimatePresence initial={false}>
//             {isOpen && (
//               <motion.div
//                 key="expanded"
//                 initial={{ opacity: 0, y: 6 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -4 }}
//                 transition={FADE_TRANSITION}
//               >
//                 {/* Benchmark bars (left) + Gauge (top-right) */}
//                 <div className="flex items-start gap-3 mb-4">
//                   <div className="flex-1 space-y-2.5 pt-1">
//                     <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                       Benchmark Profile
//                     </p>
//                     {model.benchmarks.map((bench, i) => (
//                       <motion.div
//                         key={bench.name}
//                         initial={{ opacity: 0, x: -8 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: i * 0.06, ...FADE_TRANSITION }}
//                       >
//                         <BenchmarkBar bench={bench} color={model.color} />
//                       </motion.div>
//                     ))}
//                   </div>

//                   <div className="flex-shrink-0">
//                     <Gauge
//                       value={score}
//                       centerValue={score}
//                       suffix="%"
//                       defaultLabel="Score"
//                       activeFill={model.color}
//                       inactiveFill="#e5e7eb"
//                       inactiveFillOpacity={1}
//                       totalNotches={28}
//                       notchCornerRadius={2}
//                       width={148}
//                       height={122}
//                     />
//                   </div>
//                 </div>

//                 {/* Stats row */}
//                 <div className="border-t border-dashed border-gray-200 pt-4 grid grid-cols-3 gap-4">
//                   {[
//                     { label: "Output", value: model.output },
//                     { label: "Latency", value: model.latency },
//                     { label: "Vendor", value: model.vendor },
//                   ].map(({ label, value }) => (
//                     <div key={label}>
//                       <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
//                         {label}
//                       </div>
//                       <div className="text-sm font-semibold text-gray-800">{value}</div>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// export default function AILLMLeaderBoard() {
//   const [openId, setOpenId] = useState<number | null>(null);
//   const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkKey>("SWE-bench");

//   const toggle = (rank: number) => {
//     setOpenId((prev) => (prev === rank ? null : rank));
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
//       <div className="w-full max-w-md rounded-3xl bg-stone-200">
//         <div>
//           {/* Header */}
//           <div className="px-5 pt-5 pb-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <h1 className="text-xl font-bold text-gray-900">LLM Leaderboard</h1>
//             </div>

//             {/* Benchmark selector */}
//             <Select
//               value={selectedBenchmark}
//               onValueChange={(v) => setSelectedBenchmark(v as BenchmarkKey)}
//             >
//               <SelectTrigger
//                 className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 data-[size=default]:h-auto gap-1.5 shadow-none focus-visible:ring-0 focus-visible:border-gray-300"
//               >
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent
//                 position="popper"
//                 className="rounded-2xl bg-white border border-gray-100 shadow-lg min-w-[160px]"
//               >
//                 {BENCHMARKS.map((b) => (
//                   <SelectItem
//                     key={b}
//                     value={b}
//                     className="text-sm text-gray-700 rounded-xl cursor-pointer"
//                   >
//                     {b}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* List card */}
//           <div className="mx-3 mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
//             {models.map((model) => (
//               <ModelRow
//                 key={model.rank}
//                 model={model}
//                 isOpen={openId === model.rank}
//                 onToggle={() => toggle(model.rank)}
//                 selectedBenchmark={selectedBenchmark}
//               />
//             ))}
//           </div>

//           {/* Footer */}
//           <div className="px-5 pb-5 text-center text-sm text-gray-400">
//             Tap a model for breakdown · switch benchmark to re-rank
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import useMeasure from "react-use-measure";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChatGptIcon,
  AiBrain01Icon,
  AiChipIcon,
  GoogleGeminiIcon,
  AiNetworkIcon,
} from "@hugeicons/core-free-icons";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Gauge } from "@/components/charts/gauge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Benchmark {
  name: string;
  score: number;
}

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>> | object;

interface Model {
  rank: number;
  name: string;
  company: string;
  color: string;
  icon: IconType;
  benchmarks: Benchmark[];
  output: string;
  latency: string;
  vendor: string;
}

const BENCHMARKS = ["SWE-bench", "GPQA", "AIME 2025", "MMLU-Pro"] as const;
type BenchmarkKey = (typeof BENCHMARKS)[number];

const models: Model[] = [
  {
    rank: 1,
    name: "GPT-5.5",
    company: "OpenAI",
    color: "#4ade80",
    icon: ChatGptIcon,
    benchmarks: [
      { name: "SWE-bench", score: 88.7 },
      { name: "GPQA", score: 90.2 },
      { name: "AIME 2025", score: 96.1 },
      { name: "MMLU-Pro", score: 89.0 },
    ],
    output: "$25.00/M",
    latency: "0.8s",
    vendor: "OpenAI",
  },
  {
    rank: 2,
    name: "Claude Opus 4.7",
    company: "Anthropic",
    color: "#f59e0b",
    icon: AiBrain01Icon,
    benchmarks: [
      { name: "SWE-bench", score: 87.6 },
      { name: "GPQA", score: 89.1 },
      { name: "AIME 2025", score: 95.3 },
      { name: "MMLU-Pro", score: 88.4 },
    ],
    output: "$20.00/M",
    latency: "0.9s",
    vendor: "Anthropic",
  },
  {
    rank: 3,
    name: "Grok 4",
    company: "xAI",
    color: "#f43f5e",
    icon: AiChipIcon,
    benchmarks: [
      { name: "SWE-bench", score: 83.4 },
      { name: "GPQA", score: 87.5 },
      { name: "AIME 2025", score: 94.6 },
      { name: "MMLU-Pro", score: 84.1 },
    ],
    output: "$15.00/M",
    latency: "1.0s",
    vendor: "xAI",
  },
  {
    rank: 4,
    name: "Gemini 3 Pro",
    company: "Google",
    color: "#3b82f6",
    icon: GoogleGeminiIcon,
    benchmarks: [
      { name: "SWE-bench", score: 80.6 },
      { name: "GPQA", score: 84.2 },
      { name: "AIME 2025", score: 91.0 },
      { name: "MMLU-Pro", score: 81.7 },
    ],
    output: "$10.00/M",
    latency: "1.2s",
    vendor: "Google",
  },
  {
    rank: 5,
    name: "DeepSeek V3.1",
    company: "DeepSeek",
    color: "#a855f7",
    icon: AiNetworkIcon,
    benchmarks: [
      { name: "SWE-bench", score: 76.2 },
      { name: "GPQA", score: 79.4 },
      { name: "AIME 2025", score: 88.3 },
      { name: "MMLU-Pro", score: 77.9 },
    ],
    output: "$2.00/M",
    latency: "1.5s",
    vendor: "DeepSeek",
  },
];

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const HEIGHT_TRANSITION = { duration: 0.35, ease: EASE_OUT_QUART } as const;
const FADE_TRANSITION = { duration: 0.25, ease: EASE_OUT_QUART } as const;

function getScore(model: Model, benchmark: BenchmarkKey) {
  return model.benchmarks.find((b) => b.name === benchmark)?.score ?? 0;
}

function AnimatedScore({ score }: { score: number }) {
  return (
    <div className="flex-shrink-0 flex items-baseline gap-0.5">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={score}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT_QUART }}
            className="block text-xl font-bold text-gray-900 tabular-nums"
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-sm text-gray-400">%</span>
    </div>
  );
}

function ProgressBar({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  return (
    <div className="relative h-2 w-full rounded-full overflow-hidden bg-gray-200">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function BenchmarkBar({ bench, color }: { bench: Benchmark; color: string }) {
  const barData = [
    {
      name: bench.name,
      score: bench.score,
      rest: parseFloat((100 - bench.score).toFixed(1)),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 flex-shrink-0 text-[10px] text-gray-500 text-right leading-tight">
        {bench.name}
      </span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden">
        <BarChart
          data={barData}
          xDataKey="name"
          orientation="horizontal"
          stacked={true}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barGap={0}
          animationDuration={700}
          aspectRatio="auto"
          className="h-full"
        >
          <Bar dataKey="score" fill={color} lineCap="butt" />
          <Bar dataKey="rest" fill="#e5e7eb" lineCap="butt" />
        </BarChart>
      </div>
      <span className="w-8 flex-shrink-0 text-[10px] font-semibold text-gray-700">
        {bench.score}
      </span>
    </div>
  );
}

function ModelRow({
  model,
  isOpen,
  onToggle,
  selectedBenchmark,
  onBoundsChange,
}: {
  model: Model;
  isOpen: boolean;
  onToggle: () => void;
  selectedBenchmark: BenchmarkKey;
  onBoundsChange: (rank: number, height: number) => void;
}) {
  const [innerRef, bounds] = useMeasure();
  const score = getScore(model, selectedBenchmark);

  useEffect(() => {
    onBoundsChange(model.rank, bounds.height);
  }, [bounds.height, model.rank, onBoundsChange]);

  return (
    <motion.div initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: EASE_OUT_QUART }} layoutId={`model-${model.rank}`} layout className="border-b border-dashed border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        {/* AI icon badge */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${model.color}22` }}
        >
          <HugeiconsIcon
            icon={model.icon as Parameters<typeof HugeiconsIcon>[0]["icon"]}
            size={20}
            color={model.color}
            strokeWidth={1.8}
          />
        </div>

        {/* Name + company */}
        <div className="w-36 flex-shrink-0">
          <div className="text-base font-semibold text-gray-900">{model.name}</div>
          <div className="text-sm text-gray-400">{model.company}</div>
        </div>

        {/* Animated progress bar */}
        <div className="flex-1 px-4">
          <ProgressBar score={score} color={model.color} />
        </div>

        {/* Animated score number */}
        <AnimatedScore score={score} />

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={HEIGHT_TRANSITION}
          className="flex-shrink-0 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Animated height wrapper */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? bounds.height : 0 }}
        transition={HEIGHT_TRANSITION}
        className="overflow-hidden"
      >
        <div ref={innerRef} className="px-4 pb-4">
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={FADE_TRANSITION}
              >
                {/* Benchmark bars (left) + Gauge (top-right) */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1 space-y-2.5 pt-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Benchmark Profile
                    </p>
                    {model.benchmarks.map((bench, i) => (
                      <motion.div
                        key={bench.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, ...FADE_TRANSITION }}
                      >
                        <BenchmarkBar bench={bench} color={model.color} />
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex-shrink-0">
                    <Gauge
                      value={score}
                      centerValue={score}
                      suffix="%"
                      defaultLabel="Score"
                      activeFill={model.color}
                      inactiveFill="#e5e7eb"
                      inactiveFillOpacity={1}
                      totalNotches={28}
                      notchCornerRadius={2}
                      width={148}
                      height={122}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="border-t border-dashed border-gray-200 pt-4 grid grid-cols-3 gap-4">
                  {[
                    { label: "Output", value: model.output },
                    { label: "Latency", value: model.latency },
                    { label: "Vendor", value: model.vendor },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {label}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModelCard({
  model,
  onExpand,
  selectedBenchmark,
  isReturning,
}: {
  model: Model;
  onExpand: () => void;
  selectedBenchmark: BenchmarkKey;
  isReturning: boolean;
}) {
  const score = getScore(model, selectedBenchmark);

  return (
    // Outer: shared with ModelRow for list↔card morph
    <motion.div
      layoutId={`model-${model.rank}`}
      layout
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ width: "calc(50% - 6px)" }}
      onClick={onExpand}
      whileTap={{ scale: 0.97 }}
      initial={isReturning ? false : { opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
    >
      {/* Inner: shared with ExpandedCardOverlay for expand morph */}
      <motion.div layoutId={`model-card-${model.rank}`}>
        <div className="p-3">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${model.color}22` }}
            >
              <HugeiconsIcon
                icon={model.icon as Parameters<typeof HugeiconsIcon>[0]["icon"]}
                size={20}
                color={model.color}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <div className="text-base font-semibold text-gray-900">{model.name}</div>
              <div className="text-sm text-gray-400">{model.company}</div>
            </div>
          </div>

          <div className="mb-2">
            <AnimatedScore score={score} />
          </div>

          <ProgressBar score={score} color={model.color} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExpandedCardOverlay({
  model,
  selectedBenchmark,
  onClose,
}: {
  model: Model;
  selectedBenchmark: BenchmarkKey;
  onClose: () => void;
}) {
  const score = getScore(model, selectedBenchmark);

  return (
    <motion.div
      layoutId={`model-card-${model.rank}`}
      transition={HEIGHT_TRANSITION}
      className="absolute inset-0 z-20 bg-white rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: model.color }} />

      {/* Header row — mirrors list view row layout */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-4">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${model.color}22` }}
        >
          <HugeiconsIcon
            icon={model.icon as Parameters<typeof HugeiconsIcon>[0]["icon"]}
            size={20}
            color={model.color}
            strokeWidth={1.8}
          />
        </div>
        <div className="w-36 flex-shrink-0">
          <div className="text-base font-semibold text-gray-900">{model.name}</div>
          <div className="text-sm text-gray-400">{model.company}</div>
        </div>
        <div className="flex-1" />
        <AnimatedScore score={score} />
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Detail content — fades in after morph starts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.12 }}
        className="px-4 pb-4"
      >
        {/* Benchmark bars + Gauge */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 space-y-2.5 pt-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Benchmark Profile
            </p>
            {model.benchmarks.map((bench, i) => (
              <motion.div
                key={bench.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.06, ...FADE_TRANSITION }}
              >
                <BenchmarkBar bench={bench} color={model.color} />
              </motion.div>
            ))}
          </div>
          <div className="flex-shrink-0">
            <Gauge
              value={score}
              centerValue={score}
              suffix="%"
              defaultLabel="Score"
              activeFill={model.color}
              inactiveFill="#e5e7eb"
              inactiveFillOpacity={1}
              totalNotches={28}
              notchCornerRadius={2}
              width={148}
              height={122}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-dashed border-gray-200 pt-4 grid grid-cols-3 gap-4">
          {[
            { label: "Output", value: model.output },
            { label: "Latency", value: model.latency },
            { label: "Vendor", value: model.vendor },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {label}
              </div>
              <div className="text-sm font-semibold text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AILLMLeaderBoard() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkKey>("SWE-bench");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [expandedCardRank, setExpandedCardRank] = useState<number | null>(null);
  const [returningCardRank, setReturningCardRank] = useState<number | null>(null);
  const [contentRef, contentBounds] = useMeasure();

  // Clear the returning flag after the morph completes
  useEffect(() => {
    if (returningCardRank === null) return;
    const t = setTimeout(() => setReturningCardRank(null), 400);
    return () => clearTimeout(t);
  }, [returningCardRank]);

  const closeExpandedCard = useCallback(() => {
    setReturningCardRank(expandedCardRank);
    setExpandedCardRank(null);
  }, [expandedCardRank]);
  const [rowBoundsHeights, setRowBoundsHeights] = useState<Record<number, number>>({});
  const [collapsedHeight, setCollapsedHeight] = useState(0);

  // Snapshot the outer height whenever no row is expanded — this is our stable base
  useEffect(() => {
    if (openId === null && contentBounds.height > 0) {
      setCollapsedHeight(contentBounds.height);
    }
  }, [openId, contentBounds.height]);

  const handleBoundsChange = useCallback((rank: number, height: number) => {
    setRowBoundsHeights((prev) =>
      prev[rank] === height ? prev : { ...prev, [rank]: height }
    );
  }, []);

  // Final target height built from static parts — never a moving target
  const outerTargetHeight =
    openId !== null && collapsedHeight > 0
      ? collapsedHeight + (rowBoundsHeights[openId] ?? 0)
      : collapsedHeight > 0
      ? collapsedHeight
      : contentBounds.height || undefined;

  const toggle = (rank: number) => {
    setOpenId((prev) => (prev === rank ? null : rank));
  };

  const switchView = (mode: "list" | "card") => {
    setOpenId(null);
    setExpandedCardRank(null);
    setReturningCardRank(null);
    setViewMode(mode);
  };

  return (
    <LayoutGroup id="leaderboard">
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <motion.div
          layout
          animate={{ height: outerTargetHeight ?? "auto" }}
          transition={HEIGHT_TRANSITION}
          className="w-full max-w-md rounded-3xl bg-stone-200 overflow-hidden"
        >
          <div ref={contentRef}>
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold text-gray-900 mr-auto">LLM Leaderboard</h1>

              {/* View toggle — layoutId slides the indicator between buttons */}
              <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full p-1">
                <button
                  onClick={() => switchView("list")}
                  className={`relative p-1.5 rounded-full transition-colors ${
                    viewMode === "list" ? "text-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                  aria-label="List view"
                >
                  {viewMode === "list" && (
                    <motion.div
                      layoutId="toggle-indicator"
                      className="absolute inset-0 bg-gray-900 rounded-full"
                      transition={HEIGHT_TRANSITION}
                    />
                  )}
                  <svg className="relative w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => switchView("card")}
                  className={`relative p-1.5 rounded-full transition-colors ${
                    viewMode === "card" ? "text-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                  aria-label="Card view"
                >
                  {viewMode === "card" && (
                    <motion.div
                      layoutId="toggle-indicator"
                      className="absolute inset-0 bg-gray-900 rounded-full"
                      transition={HEIGHT_TRANSITION}
                    />
                  )}
                  <svg className="relative w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>

              {/* Benchmark selector */}
              <Select
                value={selectedBenchmark}
                onValueChange={(v) => setSelectedBenchmark(v as BenchmarkKey)}
              >
                <SelectTrigger className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 data-[size=default]:h-auto gap-1.5 shadow-none focus-visible:ring-0 focus-visible:border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="rounded-2xl bg-white border border-gray-100 shadow-lg min-w-[160px]"
                >
                  {BENCHMARKS.map((b) => (
                    <SelectItem
                      key={b}
                      value={b}
                      className="text-sm text-gray-700 rounded-xl cursor-pointer"
                    >
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content — layoutId on both containers so the white card morphs between views */}
            {viewMode === "list" ? (
              <motion.div
                layoutId="content-container"
                layout
                className="mx-3 mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {models.map((model) => (
                  <ModelRow
                    key={model.rank}
                    model={model}
                    isOpen={openId === model.rank}
                    onToggle={() => toggle(model.rank)}
                    selectedBenchmark={selectedBenchmark}
                    onBoundsChange={handleBoundsChange}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                layoutId="content-container"
                layout
                className="mx-3 mb-3 bg-white rounded-2xl border border-gray-100 relative"
              >
                {/* Card grid: 2-2-1 via flex-wrap + justify-center */}
                <div className="flex flex-wrap gap-3 justify-center p-3">
                  <AnimatePresence mode="popLayout">
                    {models
                      .filter((m) => m.rank !== expandedCardRank)
                      .map((model) => (
                        <ModelCard
                          key={model.rank}
                          model={model}
                          onExpand={() => setExpandedCardRank(model.rank)}
                          selectedBenchmark={selectedBenchmark}
                          isReturning={returningCardRank === model.rank}
                        />
                      ))}
                  </AnimatePresence>
                </div>

                {/* Backdrop */}
                <AnimatePresence>
                  {expandedCardRank !== null && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl z-10"
                      style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={FADE_TRANSITION}
                      onClick={closeExpandedCard}
                    />
                  )}
                </AnimatePresence>

                {/* Expanded overlay — layoutId morphs from the clicked card */}
                <AnimatePresence>
                  {expandedCardRank !== null && (
                    <ExpandedCardOverlay
                      model={models.find((m) => m.rank === expandedCardRank)!}
                      selectedBenchmark={selectedBenchmark}
                      onClose={closeExpandedCard}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="px-5 pb-5 text-center text-sm text-gray-400"
            >
              {viewMode === "list"
                ? "Tap a model for breakdown · switch benchmark to re-rank"
                : "Tap a card to expand · tap outside to close"}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}