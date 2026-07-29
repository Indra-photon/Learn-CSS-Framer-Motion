"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Mic01Icon,
  Camera01Icon,
  Video01Icon,
  File01Icon,
  Attachment01Icon,
  SparklesIcon,
  ImageAdd01Icon,
  Idea01Icon,
  Telescope01Icon,
  Globe02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Tick02Icon,
  MessageQuestionIcon,
  TaskDaily01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
// transitions-dev signature ease (panel-reveal / dropdown / etc.)
const EASE_PANEL = [0.22, 1, 0.36, 1] as const;
const RADIUS = 80;

// ─── Morph timing (mirrors the ThemeMorphMenu reference) ─────────────────────
// Apple-style perceptual spring: shell grows on expand (slower), snaps on collapse.
const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const EXPAND_SPRING: Transition = {
  type: "spring",
  duration: 0.3,
  bounce: 0.16,
};
const COLLAPSE_SPRING: Transition = {
  type: "spring",
  duration: 0.22,
  bounce: 0,
};
const CONTENT_IN: Transition = { duration: 0.2, ease: EASE_OUT };
const CONTENT_OUT: Transition = { duration: 0.15, ease: EASE_OUT };

const arcItems = [
  { icon: Camera01Icon, label: "Photo", angle: -55 },
  { icon: Video01Icon, label: "Video", angle: -18 },
  { icon: File01Icon, label: "File", angle: 18 },
  { icon: Attachment01Icon, label: "Attach", angle: 55 },
];

const menuItems = [
  { icon: ImageAdd01Icon, label: "Create image" },
  { icon: Idea01Icon, label: "Thinking" },
  { icon: Telescope01Icon, label: "Deep research" },
  { icon: Globe02Icon, label: "Web search" },
];

const CHAT_MODES = [
  {
    id: "ask",
    label: "Ask",
    icon: MessageQuestionIcon,
    desc: "Answer questions about anything",
  },
  {
    id: "plan",
    label: "Plan",
    icon: TaskDaily01Icon,
    desc: "Draft an approach before acting",
  },
  {
    id: "build",
    label: "Build",
    icon: SourceCodeIcon,
    desc: "Write and edit code end to end",
  },
] as const;

const MODELS = [
  {
    id: "kimi",
    label: "Kimi K3",
    tier: "High",
    color: "oklch(0.21 0.034 264.665)",
  },
  {
    id: "gpt-terra",
    label: "GPT-5.6 Terra",
    tier: "Medium",
    color: "oklch(0.627 0.12 164.9)",
  },
  {
    id: "gpt-sol",
    label: "GPT-5.6 Sol",
    tier: "Medium",
    color: "oklch(0.627 0.12 164.9)",
  },
  {
    id: "sonnet",
    label: "Sonnet 5",
    tier: "High",
    color: "oklch(0.673 0.131 41)",
  },
  {
    id: "opus",
    label: "Opus 4.8",
    tier: "High",
    color: "oklch(0.673 0.131 41)",
  },
  {
    id: "fable",
    label: "Fable 5",
    tier: "High",
    color: "oklch(0.673 0.131 41)",
  },
] as const;

type ChatMode = (typeof CHAT_MODES)[number];
type Model = (typeof MODELS)[number];

const MOCK_PHRASES = [
  "What's the best way to learn machine learning from scratch?",
  "Help me write a professional email to reschedule a meeting...",
  "Explain the difference between REST and GraphQL APIs.",
  "What are the most effective UI animation principles?",
];

// Bar configs: maxHeight in px, animation duration in s
const WAVEFORM_BARS = [
  { maxH: 5, dur: 0.55 },
  { maxH: 13, dur: 0.7 },
  { maxH: 17, dur: 0.5 },
  { maxH: 9, dur: 0.8 },
  { maxH: 15, dur: 0.62 },
  { maxH: 7, dur: 0.68 },
  { maxH: 12, dur: 0.55 },
];

function WaveformBars() {
  return (
    <div className="flex h-5 items-center gap-[2.5px]">
      {WAVEFORM_BARS.map(({ maxH, dur }, i) => (
        <motion.span
          key={i}
          className="block w-[2.5px] rounded-full bg-rose-500"
          animate={{ height: [maxH * 0.25, maxH, maxH * 0.25] }}
          transition={{
            duration: dur,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
          }}
          style={{ minHeight: 3 }}
        />
      ))}
    </div>
  );
}

function useTypewriter(text: string, speed = 42) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return displayed;
}

function arcPosition(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: RADIUS * Math.sin(rad), y: -RADIUS * Math.cos(rad) };
}

/**
 * MorphMenu — a control that morphs between a collapsed pill and an expanded
 * panel using a single shared `layoutId`. Both states are the same dark shell,
 * so the layout animation reads as pure shape growth, not a crossfade.
 * Anchored bottom-left of a fixed-height wrapper, so the panel opens upward.
 */
function MorphMenu({
  layoutId,
  isOpen,
  onOpen,
  onClose,
  reduceMotion,
  collapsed,
  expanded,
  panelWidth,
}: {
  layoutId: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  reduceMotion: boolean | null;
  collapsed: React.ReactNode;
  expanded: React.ReactNode;
  panelWidth: number;
}) {
  const shellTransition = reduceMotion
    ? { duration: 0 }
    : isOpen
      ? EXPAND_SPRING
      : COLLAPSE_SPRING;
  const contentIn = reduceMotion ? { duration: 0 } : CONTENT_IN;
  const contentOut = reduceMotion ? { duration: 0 } : CONTENT_OUT;

  return (
    <div className="relative inline-flex flex-shrink-0">
      {/* Full-screen catcher: any outside click collapses the menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}

      {/* Invisible sizer: keeps the wrapper at the collapsed pill's width so
          sibling controls don't shift when the panel opens (panel + pill are
          both out of normal flow). */}
      <div
        aria-hidden
        className="pointer-events-none inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium whitespace-nowrap opacity-0 select-none"
      >
        {collapsed}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          strokeWidth={2}
          color="currentColor"
        />
      </div>

      {/* ── Collapsed pill ─────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout" initial={false}>
        {!isOpen && (
          <motion.button
            key="collapsed"
            layoutId={layoutId}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            whileTap={{ scale: 0.96 }}
            transition={shellTransition}
            style={{ overflow: "hidden", borderRadius: 12 }}
            className="absolute inset-y-0 left-0 inline-flex items-center gap-2 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-100 select-none"
          >
            <motion.span
              layout="position"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: contentOut }}
              transition={contentIn}
              className="flex items-center gap-1.5"
            >
              {collapsed}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={12}
                strokeWidth={2}
                color="currentColor"
                className="mt-0.5 flex-shrink-0"
              />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Expanded panel ─────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isOpen && (
          <motion.div
            key="expanded"
            layoutId={layoutId}
            transition={shellTransition}
            onClick={(e) => e.stopPropagation()}
            style={{ width: panelWidth, overflow: "hidden", borderRadius: 14 }}
            className="absolute bottom-0 left-0 z-50 bg-stone-900 p-1.5 ring-1 ring-white/10"
          >
            <motion.div
              layout="position"
              initial={{ opacity: 0.97, filter: "blur(4px)", scale: 0.97 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{
                opacity: 0,
                filter: "blur(4px)",
                scale: 0.97,
                transition: contentOut,
              }}
              transition={contentIn}
            >
              {expanded}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatUI() {
  const [input, setInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [selectedTool, setSelectedTool] = useState<
    (typeof menuItems)[number] | null
  >(null);

  // Morph-dropdown state
  const [openMenu, setOpenMenu] = useState<"mode" | "model" | null>(null);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(CHAT_MODES[2]); // Build
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);

  const reduceMotion = useReducedMotion();
  const typewriterText = useTypewriter(currentPhrase);

  const closeAll = () => {
    setPlusOpen(false);
    setMenuOpen(false);
    setOpenMenu(null);
  };

  const openMorph = (which: "mode" | "model") => {
    setPlusOpen(false);
    setMenuOpen(false);
    setOpenMenu(which);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const phrase =
        MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
      setCurrentPhrase(phrase);
      closeAll();
    } else {
      setCurrentPhrase("");
    }
    setIsRecording((v) => !v);
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-stone-300 px-6"
      onClick={closeAll}
    >
      {/* Heading dims while recording */}
      <motion.h1
        animate={{ opacity: isRecording ? 0.35 : 1 }}
        transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
        className="mb-14 text-4xl font-light tracking-tight text-balance text-stone-700"
      >
        Ready when you are.
      </motion.h1>

      <div
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sparkle pills ───────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute top-full right-4 flex items-start gap-2 pt-1.5">
          {menuItems.map((item, i) => {
            const active = selectedTool?.label === item.label;
            return (
              <motion.button
                key={item.label}
                animate={{
                  y: menuOpen ? 0 : "-130%",
                  opacity: menuOpen ? 1 : 0,
                  filter: menuOpen ? "blur(0px)" : "blur(2px)",
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        // panel-reveal: faster close than open, 2px cross-blur,
                        // transitions-dev signature ease.
                        duration: menuOpen ? 0.4 : 0.35,
                        delay: menuOpen
                          ? (menuItems.length - 1 - i) * 0.06
                          : i * 0.04,
                        ease: EASE_PANEL,
                      }
                }
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedTool((prev) =>
                    prev?.label === item.label ? null : item,
                  );
                  setMenuOpen(false);
                }}
                className={`pointer-events-auto flex items-center gap-2 rounded-[12px] px-3.5 py-2 text-xs font-medium whitespace-nowrap shadow-md transition-colors ${
                  active
                    ? "bg-rose-500 text-white"
                    : "bg-stone-800 text-white hover:bg-stone-700"
                }`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={14}
                  strokeWidth={1.5}
                  color="white"
                />
                {item.label}
              </motion.button>
            );
          })}
        </div>

        {/* ── Voice transcript box ────────────────────────────────────────── */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ y: "-110%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "-110%", opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.38, ease: EASE_OUT_QUART }}
              className="absolute top-full right-0 left-0 z-0 pt-1.5"
            >
              <div className="flex items-start gap-3 rounded-2xl bg-stone-800/90 px-5 py-4 backdrop-blur-sm">
                {/* Typewriter text */}
                <p className="min-h-[20px] flex-1 text-sm leading-relaxed text-pretty text-white/90">
                  {typewriterText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="ml-[2px] inline-block h-[14px] w-[2px] rounded-full bg-white/70 align-middle"
                  />
                </p>

                {/* Use transcript button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.2,
                    ease: EASE_OUT_QUART,
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setInput(currentPhrase);
                    setIsRecording(false);
                    setCurrentPhrase("");
                  }}
                  className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-white/25"
                >
                  <HugeiconsIcon
                    icon={ArrowUp01Icon}
                    size={14}
                    strokeWidth={2}
                    color="white"
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input bar (two rows) ────────────────────────────────────────── */}
        <div className="relative z-10 rounded-[14px] bg-stone-100 px-4 pt-3.5 pb-3 shadow-sm">
          {/* Row 1 — text input */}
          <motion.input
            animate={{ opacity: isRecording ? 0.35 : 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setOpenMenu(null)}
            placeholder="Our AI is ready to help. Ask it anything..."
            disabled={isRecording}
            className="w-full bg-transparent px-1.5 pb-2.5 text-base text-stone-700 placeholder-stone-400 transition-colors duration-150 ease-out outline-none focus:placeholder-stone-300"
          />

          {/* Row 2 — controls */}
          <div className="flex items-center gap-2 select-none">
            {/* Plus button + arc menu */}
            <motion.div
              animate={{ opacity: isRecording ? 0.35 : 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center"
            >
              {plusOpen && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPlusOpen(false)}
                />
              )}

              {arcItems.map((item, i) => {
                const pos = arcPosition(item.angle);
                return (
                  <motion.button
                    key={item.label}
                    className="absolute z-20 flex flex-col items-center gap-1.5"
                    style={{
                      top: "50%",
                      left: "50%",
                      marginLeft: -22,
                      marginTop: -22,
                    }}
                    animate={{
                      x: plusOpen ? pos.x : 0,
                      y: plusOpen ? pos.y : 0,
                      scale: plusOpen ? 1 : 0,
                      opacity: plusOpen ? 1 : 0,
                      filter: plusOpen ? "blur(0px)" : "blur(4px)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                      delay: plusOpen ? i * 0.015 : 0,
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPlusOpen(false)}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] transition-colors hover:bg-stone-300">
                      <HugeiconsIcon
                        icon={item.icon}
                        size={19}
                        strokeWidth={1.6}
                        color="oklch(0.444 0.011 73.639)"
                      />
                    </div>
                  </motion.button>
                );
              })}

              <motion.button
                animate={{ rotate: plusOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  setMenuOpen(false);
                  setPlusOpen((v) => !v);
                }}
                className="relative z-20 flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors before:absolute before:-inset-0.5 before:content-[''] hover:bg-stone-200 hover:text-stone-800"
              >
                <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={1.8} />
              </motion.button>
            </motion.div>

            {/* Mode dropdown — Ask / Plan / Build */}
            <motion.div
              animate={{ opacity: isRecording ? 0.35 : 1 }}
              transition={{ duration: 0.22, ease: EASE_OUT_QUART }}
            >
              <MorphMenu
                layoutId="chat-mode-shell"
                isOpen={openMenu === "mode"}
                onOpen={() => !isRecording && openMorph("mode")}
                onClose={() => setOpenMenu(null)}
                reduceMotion={reduceMotion}
                panelWidth={230}
                collapsed={
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={selectedMode.icon}
                      size={14}
                      strokeWidth={1.5}
                      color="currentColor"
                    />
                    {selectedMode.label}
                  </span>
                }
                expanded={
                  <div className="flex flex-col gap-1">
                    {CHAT_MODES.map((mode) => {
                      const active = mode.id === selectedMode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectedMode(mode);
                            setOpenMenu(null);
                          }}
                          className={`flex flex-col gap-1.5 rounded-[18px] px-3 py-2 text-left transition-[background-color,transform] select-none active:scale-[0.96] ${
                            active ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-sm font-medium text-stone-100">
                            <span className="flex-shrink-0 text-stone-300">
                              <HugeiconsIcon
                                icon={mode.icon}
                                size={14}
                                strokeWidth={1.8}
                                color="currentColor"
                              />
                            </span>
                            {mode.label}
                            {active && (
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={15}
                                strokeWidth={2.2}
                                color="oklch(0.97 0.001 106.424)"
                                className="ml-auto"
                              />
                            )}
                          </span>
                          <span className="text-xs text-pretty text-stone-400">
                            {mode.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                }
              />
            </motion.div>

            {/* Model dropdown */}
            <motion.div
              animate={{ opacity: isRecording ? 0.35 : 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            >
              <MorphMenu
                layoutId="chat-model-shell"
                isOpen={openMenu === "model"}
                onOpen={() => !isRecording && openMorph("model")}
                onClose={() => setOpenMenu(null)}
                reduceMotion={reduceMotion}
                panelWidth={280}
                collapsed={<span>{selectedModel.label}</span>}
                expanded={
                  <div className="flex flex-col">
                    {/* Model list */}
                    <div className="max-h-60 overflow-y-auto">
                      {MODELS.map((model) => {
                        const active = selectedModel.id === model.id;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-[22px] px-3 py-2 text-left transition-[background-color,transform] select-none hover:bg-white/5 active:scale-[0.96]"
                          >
                            <span
                              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{ background: model.color }}
                            >
                              {model.label[0]}
                            </span>
                            <span className="flex-1 text-sm text-stone-100">
                              {model.label}{" "}
                              <span className="text-stone-400">
                                {model.tier}
                              </span>
                            </span>
                            {active && (
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={16}
                                strokeWidth={2.2}
                                color="oklch(0.97 0.001 106.424)"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                }
              />
            </motion.div>

            {/* Right actions */}
            <div className="ml-auto flex flex-shrink-0 items-center gap-2.5">
              {/* Sparkles — dims while recording */}
              <motion.button
                animate={{
                  rotate: menuOpen ? 20 : 0,
                  scale: menuOpen ? 1.15 : 1,
                  opacity: isRecording ? 0.35 : 1,
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isRecording) {
                    setOpenMenu(null);
                    setPlusOpen(false);
                    setMenuOpen((v) => !v);
                  }
                }}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors before:absolute before:-inset-0.5 before:content-[''] ${
                  selectedTool
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "text-stone-500 hover:bg-stone-200 hover:text-stone-800"
                }`}
                title={selectedTool ? selectedTool.label : "Tools"}
              >
                {/* Icon swap — transitions-dev icon-swap: stacked cross-fade,
                    200ms ease-in-out, 2px blur, start scale 0.25. popLayout
                    pulls the outgoing icon out of flow so both overlap. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={selectedTool?.label ?? "sparkles"}
                    initial={{ opacity: 0, scale: 0.25, filter: "blur(2px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.25, filter: "blur(2px)" }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.2, ease: "easeInOut" }
                    }
                    className="flex items-center justify-center"
                  >
                    <HugeiconsIcon
                      icon={selectedTool ? selectedTool.icon : SparklesIcon}
                      size={20}
                      strokeWidth={1.8}
                      color="currentColor"
                    />
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {/* Mic → waveform toggle */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRecording();
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors before:absolute before:-inset-0.5 before:content-[''] hover:bg-stone-200"
                animate={{ scale: isRecording ? 1.05 : 1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {isRecording ? (
                    <motion.div
                      key="waveform"
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(2px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.25, filter: "blur(2px)" }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.2, ease: "easeInOut" }
                      }
                    >
                      <WaveformBars />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(2px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.25, filter: "blur(2px)" }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.2, ease: "easeInOut" }
                      }
                      className="text-stone-500 hover:text-stone-700"
                    >
                      <HugeiconsIcon
                        icon={Mic01Icon}
                        size={20}
                        strokeWidth={1.8}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
