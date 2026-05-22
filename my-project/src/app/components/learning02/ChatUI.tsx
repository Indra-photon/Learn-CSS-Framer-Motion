"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
} from "@hugeicons/core-free-icons";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const RADIUS = 80;

const arcItems = [
  { icon: Camera01Icon,     label: "Photo",  angle: -55 },
  { icon: Video01Icon,      label: "Video",  angle: -18 },
  { icon: File01Icon,       label: "File",   angle:  18 },
  { icon: Attachment01Icon, label: "Attach", angle:  55 },
];

const menuItems = [
  { icon: ImageAdd01Icon,  label: "Create image" },
  { icon: Idea01Icon,      label: "Thinking" },
  { icon: Telescope01Icon, label: "Deep research" },
  { icon: Globe02Icon,     label: "Web search" },
];

const MOCK_PHRASES = [
  "What's the best way to learn machine learning from scratch?",
  "Help me write a professional email to reschedule a meeting...",
  "Explain the difference between REST and GraphQL APIs.",
  "What are the most effective UI animation principles?",
];

// Bar configs: maxHeight in px, animation duration in s
const WAVEFORM_BARS = [
  { maxH: 5,  dur: 0.55 },
  { maxH: 13, dur: 0.70 },
  { maxH: 17, dur: 0.50 },
  { maxH: 9,  dur: 0.80 },
  { maxH: 15, dur: 0.62 },
  { maxH: 7,  dur: 0.68 },
  { maxH: 12, dur: 0.55 },
];

function WaveformBars() {
  return (
    <div className="flex items-center gap-[2.5px] h-5">
      {WAVEFORM_BARS.map(({ maxH, dur }, i) => (
        <motion.span
          key={i}
          className="w-[2.5px] rounded-full bg-rose-500 block"
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

export default function ChatUI() {
  const [input, setInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState("");

  const typewriterText = useTypewriter(currentPhrase);

  const toggleRecording = () => {
    if (!isRecording) {
      const phrase = MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
      setCurrentPhrase(phrase);
      setPlusOpen(false);
      setMenuOpen(false);
    } else {
      setCurrentPhrase("");
    }
    setIsRecording((v) => !v);
  };

  return (
    <div
      className="min-h-screen bg-stone-300 flex flex-col items-center justify-center px-6"
      onClick={() => { setPlusOpen(false); setMenuOpen(false); }}
    >
      {/* Heading dims while recording */}
      <motion.h1
        animate={{ opacity: isRecording ? 0.35 : 1 }}
        transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
        className="text-stone-700 text-4xl font-light tracking-tight mb-14"
      >
        Ready when you are.
      </motion.h1>

      <div className="w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>

        {/* ── Sparkle pills ───────────────────────────────────────────────── */}
        <div className="absolute top-full right-4 flex items-start gap-2 pt-1.5 pointer-events-none">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              animate={{
                y: menuOpen ? 0 : "-130%",
                opacity: menuOpen ? 1 : 0,
              }}
              transition={{
                duration: 0.38,
                delay: menuOpen ? (menuItems.length - 1 - i) * 0.06 : i * 0.04,
                ease: EASE_OUT_QUART,
              }}
              onClick={() => setMenuOpen(false)}
              className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 text-white text-xs font-medium whitespace-nowrap shadow-md hover:bg-stone-700 transition-colors"
            >
              <HugeiconsIcon icon={item.icon} size={14} strokeWidth={1.5} color="white" />
              {item.label}
            </motion.button>
          ))}
        </div>

        {/* ── Voice transcript box ────────────────────────────────────────── */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ y: "-110%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "-110%", opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.38, ease: EASE_OUT_QUART }}
              className="absolute top-full left-0 right-0 pt-1.5 z-0"
            >
              <div className="bg-stone-800/90 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-start gap-3">

                {/* Typewriter text */}
                <p className="text-white/90 text-sm leading-relaxed flex-1 min-h-[20px]">
                  {typewriterText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="inline-block w-[2px] h-[14px] bg-white/70 ml-[2px] align-middle rounded-full"
                  />
                </p>

                {/* Use transcript button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.2, ease: EASE_OUT_QUART }}
                  onClick={() => {
                    setInput(currentPhrase);
                    setIsRecording(false);
                    setCurrentPhrase("");
                  }}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} size={14} strokeWidth={2} color="white" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input bar ───────────────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center gap-3 bg-stone-100 rounded-full px-5 py-3.5">

          {/* Plus button + arc menu */}
          <motion.div
            animate={{ opacity: isRecording ? 0.35 : 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            className="relative flex-shrink-0"
          >
            {plusOpen && (
              <div className="fixed inset-0 z-10" onClick={() => setPlusOpen(false)} />
            )}

            {arcItems.map((item, i) => {
              const pos = arcPosition(item.angle);
              return (
                <motion.button
                  key={item.label}
                  className="absolute z-20 flex flex-col items-center gap-1.5"
                  style={{ top: "50%", left: "50%", marginLeft: -22, marginTop: -22 }}
                  animate={{
                    x: plusOpen ? pos.x : 0,
                    y: plusOpen ? pos.y : 0,
                    scale: plusOpen ? 1 : 0,
                    opacity: plusOpen ? 1 : 0,
                    filter: plusOpen ? "blur(0px)" : "blur(4px)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28, delay: plusOpen ? i * 0.015 : 0 }}
                  onClick={() => setPlusOpen(false)}
                >
                  <div className="w-11 h-11 rounded-full bg-stone-200 border border-stone-300 shadow-sm flex items-center justify-center hover:bg-stone-300 transition-colors">
                    <HugeiconsIcon icon={item.icon} size={19} strokeWidth={1.6} color="#57534e" />
                  </div>
                </motion.button>
              );
            })}

            <motion.button
              animate={{ rotate: plusOpen ? 45 : 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
              onClick={(e) => { e.stopPropagation(); setPlusOpen((v) => !v); }}
              className="relative z-20 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
            >
              <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={1.8} />
            </motion.button>
          </motion.div>

          {/* Text input — dims while recording */}
          <motion.input
            animate={{ opacity: isRecording ? 0.35 : 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Our AI is ready to help. Ask it anything..."
            disabled={isRecording}
            className="flex-1 bg-transparent text-stone-700 placeholder-stone-400 focus:placeholder-stone-300 transition-colors duration-150 ease-out text-base outline-none min-w-0"
          />

          {/* Right actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0">

            {/* Mic → waveform toggle */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); toggleRecording(); }}
              className="flex items-center justify-center transition-colors"
              animate={{ scale: isRecording ? 1.05 : 1 }}
              transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="waveform"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_QUART }}
                  >
                    <WaveformBars />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_QUART }}
                    className="text-stone-500 hover:text-stone-700"
                  >
                    <HugeiconsIcon icon={Mic01Icon} size={20} strokeWidth={1.8} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Sparkles — dims while recording */}
            <motion.button
              animate={{
                rotate: menuOpen ? 20 : 0,
                scale: menuOpen ? 1.15 : 1,
                opacity: isRecording ? 0.35 : 1,
              }}
              transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
              onClick={(e) => { e.stopPropagation(); if (!isRecording) setMenuOpen((v) => !v); }}
              className="text-stone-500 hover:text-stone-800 transition-colors"
            >
              <HugeiconsIcon icon={SparklesIcon} size={20} strokeWidth={1.8} />
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
}
