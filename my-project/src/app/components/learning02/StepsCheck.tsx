"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  RadioButtonIcon,
  GitBranchIcon,
  TerminalIcon,
  NpmIcon,
  Bug01Icon,
  Typescript01Icon,
  PlayCircleIcon,
  Layers01Icon,
  CloudUploadIcon,
} from "@hugeicons/core-free-icons";

import type { IconSvgElement } from "@hugeicons/react";

type StepStatus = "done" | "running" | "pending";

interface Step {
  id: number;
  label: string;
  status: StepStatus;
  duration?: string;
  icon: IconSvgElement;
}

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "Install dependencies", status: "pending", icon: NpmIcon },
  { id: 2, label: "Lint · ESLint", status: "pending", icon: Bug01Icon },
  {
    id: 3,
    label: "Type-check · tsc",
    status: "pending",
    icon: Typescript01Icon,
  },
  { id: 4, label: "Run test suite", status: "pending", icon: PlayCircleIcon },
  { id: 5, label: "Build · Next.js", status: "pending", icon: Layers01Icon },
  {
    id: 6,
    label: "Deploy to production",
    status: "pending",
    icon: CloudUploadIcon,
  },
];

const STEP_DURATIONS = ["2.1s", "4.8s", "6.3s", "12.4s", "...", ""];
const STEP_DELAYS = [800, 1200, 900, 1400, 1600, 0];

const TERMINAL_LINES = [
  "▶  next build",
  "   Linting and checking validity of types ...",
  "   Creating an optimized production build ...",
  "✓  Compiled successfully",
  "   Route (app)          Size     First Load JS",
  "   ○  /                 4.2 kB        102 kB",
];

function StepRow({ step }: { step: Step }) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        step.status === "running" ? "bg-green-50" : ""
      }`}
    >
      {/* Status icon */}
      <span className="flex-shrink-0">
        {step.status === "done" && (
          <motion.span
            initial={{ opacity: 0, rotate: 80, filter: "blur(10px)" }}
            animate={{ opacity: 1, rotate: 0, filter: "blur(0px)" }}
            transition={{
              opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            }}
            className="block"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#16a34a" />
              <path
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        )}
        {step.status === "running" && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="block text-green-500"
          >
            <HugeiconsIcon icon={Loading03Icon} size={20} />
          </motion.span>
        )}
        {step.status === "pending" && (
          <HugeiconsIcon
            icon={RadioButtonIcon}
            size={20}
            className="text-gray-300"
          />
        )}
      </span>

      {/* Step-specific icon */}
      <span className="flex-shrink-0">
        <HugeiconsIcon
          icon={step.icon}
          size={16}
          className={
            step.status === "pending"
              ? "text-gray-300"
              : step.status === "running"
                ? "text-green-500"
                : "text-gray-400"
          }
        />
      </span>

      {/* Label */}
      <span
        className={`flex-1 text-sm font-medium ${
          step.status === "pending" ? "text-gray-400" : "text-gray-800"
        } ${step.status === "running" ? "font-semibold" : ""}`}
      >
        {step.label}
      </span>

      {/* Duration */}
      <span className="text-xs text-gray-400 tabular-nums">
        {step.status === "done"
          ? step.duration
          : step.status === "running"
            ? "···"
            : "·"}
      </span>
    </motion.div>
  );
}

export default function StepsCheck() {
  const [deployed, setDeployed] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [elapsed, setElapsed] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [overallStatus, setOverallStatus] = useState<
    "idle" | "running" | "done"
  >("idle");

  useEffect(() => {
    if (overallStatus !== "running") return;
    const interval = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(interval);
  }, [overallStatus]);

  useEffect(() => {
    if (!deployed) return;

    setOverallStatus("running");
    let cumulativeDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEP_DELAYS.forEach((delay, index) => {
      cumulativeDelay += delay;

      timers.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s) =>
              s.id === index + 1 ? { ...s, status: "running" } : s,
            ),
          );
          if (index === 4) {
            TERMINAL_LINES.forEach((line, li) => {
              timers.push(
                setTimeout(() => {
                  setTerminalLines((prev) => [...prev, line]);
                }, li * 500),
              );
            });
          }
        }, cumulativeDelay),
      );

      timers.push(
        setTimeout(
          () => {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === index + 1
                  ? {
                      ...s,
                      status: index < 4 ? "done" : s.status,
                      duration: STEP_DURATIONS[index],
                    }
                  : s,
              ),
            );
            if (index === INITIAL_STEPS.length - 1) {
              setOverallStatus("done");
            }
          },
          cumulativeDelay + (index < 4 ? 400 : 0),
        ),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [deployed]);

  const handleDeploy = () => {
    setDeployed(true);
    setSteps(INITIAL_STEPS);
    setElapsed(0);
    setTerminalLines([]);
    setOverallStatus("idle");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <motion.div
        layoutId="deploy-shell"
        onClick={!deployed ? handleDeploy : undefined}
        whileTap={!deployed ? { scale: 0.98 } : {}}
        style={{ borderRadius: deployed ? 24 : 16 }}
        className={
          deployed
            ? "w-[460px] cursor-default overflow-hidden border-1 border-stone-600 bg-white shadow-2xl"
            : "cursor-pointer bg-gray-900 shadow-lg"
        }
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <motion.div
          key="btn"
          layoutId="deploy-shell-closestate-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2.5 px-5 py-3"
        >
          <HugeiconsIcon
            icon={GitBranchIcon}
            size={20}
            className="text-white"
          />
          <span className="text-base font-semibold text-white">
            Run Pipeline
          </span>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {deployed ? (
            <motion.div
              key="panel"
              variants={{
                hidden: { opacity: 0, scale: 0.96 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                },
                exit: {
                  opacity: 0,
                  scale: 0.96,
                  transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className=""
            >
              {/* Header */}
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">
                      CI / CD
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-0.5 text-sm text-gray-500">
                      <HugeiconsIcon icon={GitBranchIcon} size={12} />
                      main
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    {overallStatus === "running"
                      ? "Running"
                      : overallStatus === "done"
                        ? "Passed"
                        : "Starting"}
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        overallStatus === "running"
                          ? "bg-green-500"
                          : overallStatus === "done"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(steps.filter((s) => s.status === "done").length / steps.length) * 100}%`,
                    }}
                    transition={{ ease: "easeOut", duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="mx-3 mt-4 rounded-xl bg-gray-50 p-2">
                <div className="space-y-0.5">
                  {steps.map((step) => (
                    <StepRow key={step.id} step={step} />
                  ))}
                </div>
              </div>

              {/* Terminal */}
              <AnimatePresence>
                {terminalLines.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mx-5 mt-3 overflow-hidden rounded-xl bg-gray-100 px-4 py-3"
                  >
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <HugeiconsIcon icon={TerminalIcon} size={14} />
                      <span className="text-xs font-medium">Build output</span>
                    </div>
                    {terminalLines.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        className="font-mono text-sm text-gray-600"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-2 flex items-center justify-between px-6 py-4">
                <span className="text-sm text-gray-400 tabular-nums">
                  {elapsed.toFixed(2)}s
                </span>
                <span className="text-sm text-gray-400">
                  {overallStatus === "running"
                    ? "Executing..."
                    : overallStatus === "done"
                      ? "All checks passed"
                      : "Starting..."}
                </span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
