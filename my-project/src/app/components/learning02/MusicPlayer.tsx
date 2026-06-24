"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  PauseIcon,
  PreviousIcon,
  NextIcon,
  HeartAddIcon,
  HeartCheckIcon,
  ShuffleIcon,
  RepeatIcon,
  MusicNote01Icon,
} from "@hugeicons/core-free-icons";

const TRACKS = [
  { title: "Blinding Lights",  artist: "The Weeknd",    duration: "3:20", durationSec: 200, img: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
  { title: "As It Was",        artist: "Harry Styles",  duration: "2:37", durationSec: 157, img: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
  { title: "Stay",             artist: "The Kid LAROI", duration: "2:21", durationSec: 141, img: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
  { title: "Levitating",       artist: "Dua Lipa",      duration: "3:23", durationSec: 203, img: "https://images.pexels.com/photos/3944154/pexels-photo-3944154.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
  { title: "Peaches",          artist: "Justin Bieber", duration: "3:18", durationSec: 198, img: "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"  },
  { title: "Good 4 U",         artist: "Olivia Rodrigo",duration: "2:58", durationSec: 178, img: "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
  { title: "Montero",          artist: "Lil Nas X",     duration: "2:18", durationSec: 138, img: "https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
  { title: "drivers license",  artist: "Olivia Rodrigo",duration: "4:02", durationSec: 242, img: "https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop" },
];

const ROW_HEIGHT = 56;
const ACTIVE_ROW = 2;
const INDICATOR_OFFSET = 18;

const padded = [
  ...Array(ACTIVE_ROW).fill(null),
  ...TRACKS,
  ...Array(ACTIVE_ROW).fill(null),
];

// same slide mechanic as OnboardingStepIndicator
const slideVariants = {
  initial: (dir: number) => ({ x: `${60 * dir}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit:   (dir: number) => ({ x: `${-60 * dir}%`, opacity: 0 }),
};

export default function MusicPlayer() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTrack, setActiveTrack] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const track = TRACKS[activeTrack];
  const isLiked = liked.has(activeTrack);
  const yOffset = -activeTrack * ROW_HEIGHT;
  const easing = [0.645, 0.045, 0.355, 1] as const;

  // Progress ticker — restarts cleanly when track or play state changes
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!isPlaying) return;
    const increment = 100 / (track.durationSec * 10); // 10 ticks/sec
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setDirection(1);
          setActiveTrack((t) => (t + 1) % TRACKS.length);
          return 0;
        }
        return p + increment;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, activeTrack]);

  const goNext = () => {
    setDirection(1);
    setActiveTrack((t) => (t + 1) % TRACKS.length);
    setProgress(0);
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveTrack((t) => (t - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const toggleLike = () =>
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(activeTrack) ? next.delete(activeTrack) : next.add(activeTrack);
      return next;
    });

  // Current time display
  const currentSec = Math.floor((progress / 100) * track.durationSec);
  const currentTime = `${Math.floor(currentSec / 60)}:${String(currentSec % 60).padStart(2, "0")}`;

  const scrollTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "tween" as const, ease: easing, duration: 0.5 };

  const labelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "tween" as const, ease: easing, duration: 0.5 };

  return (
    // Showcase backdrop
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-8 font-sans">

      {/* Card shell — rounded-2xl (16px) + p-2 (8px) → inner rounded-lg (8px) */}
      <div className="relative flex h-[500px] w-[760px] overflow-hidden rounded-2xl bg-zinc-800 p-2 shadow-2xl">
        <div className="flex h-full w-full gap-2">

          {/* ── Left: Queue Ticker ── */}
          <aside className="flex w-56 shrink-0 flex-col rounded-lg bg-zinc-950 py-6">
            <div className="mb-5 px-6">
              <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                Queue
              </p>
            </div>

            {/* Ticker */}
            <div className="relative overflow-hidden" style={{ height: ROW_HEIGHT * 5 }}>

              {/* Fixed red bar indicator — never moves */}
              <div
                className="pointer-events-none absolute left-6 z-10 flex items-center"
                style={{ top: ACTIVE_ROW * ROW_HEIGHT, height: ROW_HEIGHT }}
              >
                <div className="h-4 w-0.5 rounded-full bg-[#FF2D55]" />
              </div>

              {/* Scrolling track list */}
              <motion.div
                animate={{ y: yOffset }}
                transition={scrollTransition}
                className="absolute top-0 left-6 w-full"
              >
                {padded.map((t, i) => {
                  if (!t) return <div key={`pad-${i}`} style={{ height: ROW_HEIGHT }} />;

                  const trackIndex = i - ACTIVE_ROW;
                  const isActive = trackIndex === activeTrack;
                  const isPast = trackIndex < activeTrack;

                  return (
                    <div
                      key={`track-${trackIndex}`}
                      className="flex items-center"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/*
                        Inactive tracks: x=0, sit directly under the red bar.
                        Active track: slides right by INDICATOR_OFFSET to clear the bar.
                      */}
                      <motion.div
                        animate={{
                          x: isActive ? INDICATOR_OFFSET : 0,
                          opacity: isActive ? 1 : isPast ? 0.18 : 0.32,
                        }}
                        transition={labelTransition}
                        className="flex flex-col gap-0.5 pr-4"
                      >
                        <motion.span
                          animate={{ color: isActive ? "#FF2D55" : "#52525b" }}
                          transition={labelTransition}
                          className="font-mono text-[9px] tracking-widest"
                        >
                          {String(trackIndex + 1).padStart(2, "0")}
                        </motion.span>
                        <motion.span
                          animate={{
                            color: isActive ? "#ffffff" : "#71717a",
                            fontWeight: isActive ? 600 : 400,
                          }}
                          transition={labelTransition}
                          className="text-[13px] leading-tight whitespace-nowrap"
                        >
                          {t.title}
                        </motion.span>
                        <motion.span
                          animate={{ color: isActive ? "#a1a1aa" : "#3f3f46" }}
                          transition={labelTransition}
                          className="text-[10px] leading-tight whitespace-nowrap"
                        >
                          {t.artist}
                        </motion.span>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </aside>

          {/* ── Right: Now Playing Panel ── */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg bg-zinc-900">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTrack}
                variants={slideVariants}
                initial="initial"
                animate="active"
                exit="exit"
                custom={direction}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "tween", ease: easing, duration: 0.35 }
                }
                className="flex h-full flex-col"
              >
                {/* Album art */}
                <div className="relative flex-1 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={track.img}
                    alt={track.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Gradient overlay — bottom fade for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                  {/* Subtle music note watermark */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={MusicNote01Icon}
                      size={80}
                      strokeWidth={1}
                      color="rgba(255,255,255,0.04)"
                    />
                  </div>
                </div>

                {/* Track info + controls */}
                <div className="flex flex-col gap-3 p-5">

                  {/* Title + like */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[17px] font-bold leading-tight text-white">
                        {track.title}
                      </h2>
                      <p className="mt-0.5 text-[12px] text-zinc-500">{track.artist}</p>
                    </div>

                    <motion.button
                      onClick={toggleLike}
                      whileTap={{ scale: 0.78 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.4 }}
                      className="mt-0.5 cursor-pointer transition-colors duration-150"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isLiked ? (
                          <motion.span
                            key="liked"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.25, bounce: 0.4 }}
                            className="flex items-center text-[#FF2D55]"
                          >
                            <HugeiconsIcon icon={HeartCheckIcon} size={20} strokeWidth={2} color="currentColor" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="not-liked"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.25, bounce: 0 }}
                            className="flex items-center text-zinc-600 hover:text-zinc-400"
                          >
                            <HugeiconsIcon icon={HeartAddIcon} size={20} strokeWidth={2} color="currentColor" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-1 overflow-hidden rounded-full bg-zinc-700/60">
                      <motion.div
                        className="h-full rounded-full bg-[#FF2D55]"
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] tabular-nums text-zinc-600">{currentTime}</span>
                      <span className="text-[10px] tabular-nums text-zinc-600">{track.duration}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">

                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                      className="cursor-pointer text-zinc-600 transition-colors duration-150 hover:text-zinc-400"
                    >
                      <HugeiconsIcon icon={ShuffleIcon} size={16} strokeWidth={2} color="currentColor" />
                    </motion.button>

                    <motion.button
                      onClick={goPrev}
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                      className="cursor-pointer text-zinc-300 transition-colors duration-150 hover:text-white"
                    >
                      <HugeiconsIcon icon={PreviousIcon} size={24} strokeWidth={2} color="currentColor" />
                    </motion.button>

                    {/* Play / Pause */}
                    <motion.button
                      onClick={() => setIsPlaying((p) => !p)}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg transition-colors duration-150 hover:bg-zinc-200"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isPlaying ? (
                          <motion.span
                            key="pause"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                            className="flex items-center"
                          >
                            <HugeiconsIcon icon={PauseIcon} size={20} strokeWidth={2.5} color="currentColor" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="play"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                            className="flex items-center"
                          >
                            <HugeiconsIcon icon={PlayIcon} size={20} strokeWidth={2.5} color="currentColor" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      onClick={goNext}
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                      className="cursor-pointer text-zinc-300 transition-colors duration-150 hover:text-white"
                    >
                      <HugeiconsIcon icon={NextIcon} size={24} strokeWidth={2} color="currentColor" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                      className="cursor-pointer text-zinc-600 transition-colors duration-150 hover:text-zinc-400"
                    >
                      <HugeiconsIcon icon={RepeatIcon} size={16} strokeWidth={2} color="currentColor" />
                    </motion.button>

                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
