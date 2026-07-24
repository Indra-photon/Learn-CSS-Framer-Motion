"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React from "react";

const THEMES = [
  { id: "brand", label: "Brand", dots: ["#2f6bff", "#4f8bff", "#1f4fd8"] },
  { id: "indigo", label: "Indigo", dots: ["#4f46e5", "#6366f1", "#3730a3"] },
  { id: "yellow", label: "Yellow", dots: ["#eab308", "#facc15", "#ca8a04"] },
  { id: "pink", label: "Pink", dots: ["#ec4899", "#f472b6", "#db2777"] },
  { id: "rose", label: "Rose", dots: ["#f43f5e", "#fb7185", "#e11d48"] },
];

// ease-out-cubic: content is entering/exiting, so it should feel instant then settle
const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

// Apple-style spring config: perceptual duration + bounce, rather than mass/stiffness/damping.
// The shell grows (bigger element, longer travel) so expand is slower; collapse is ~30% faster.
const EXPAND_SPRING = { type: "spring", duration: 0.4, bounce: 0.16 } as const;
const COLLAPSE_SPRING = { type: "spring", duration: 0.28, bounce: 0 } as const;

// Content crossfade: enter reads at full length, exit is ~25% faster so it clears the morph.
const CONTENT_IN = { duration: 0.2, ease: EASE_OUT } as const;
const CONTENT_OUT = { duration: 0.15, ease: EASE_OUT } as const;

const SHELL_ID = "theme-morph-shell";

function Dots({ colors, size = 18 }: { colors: string[]; size?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      {colors.map((c, i) => (
        <span
          key={c + i}
          style={{
            width: size,
            height: size,
            borderRadius: 999,
            background: c,
            marginLeft: i === 0 ? 0 : -size * 0.28,
            boxShadow: "0 0 0 2px #171717",
          }}
        />
      ))}
    </span>
  );
}

function ThemeMorphMenu() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [selected, setSelected] = React.useState(THEMES[0]);
  const reduceMotion = useReducedMotion();

  const shellTransition = reduceMotion
    ? { duration: 0 }
    : isExpanded
      ? EXPAND_SPRING
      : COLLAPSE_SPRING;
  const contentIn = reduceMotion ? { duration: 0 } : CONTENT_IN;
  const contentOut = reduceMotion ? { duration: 0 } : CONTENT_OUT;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-neutral-100">
      {/* ---------- COLLAPSED ---------- */}
      <AnimatePresence mode="popLayout">
        {!isExpanded && (
          <motion.div
            key="collapsed"
            layoutId={SHELL_ID}
            onClick={() => setIsExpanded(true)}
            role="button"
            transition={shellTransition}
            style={{
              borderRadius: 34,
              background: "#171717",
              border: "1px solid #2a2a2a",
              padding: "16px 26px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              color: "#f5f5f5",
              cursor: "pointer",
              userSelect: "none",
              overflow: "hidden",
              boxShadow: "0 18px 40px -18px rgba(0,0,0,0.6)",
            }}
          >
            <motion.div
              layout="position"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: contentOut }}
              transition={contentIn}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                fontSize: 16,
              }}
            >
              <span>Geist</span>
              <Divider />
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Spinner paused={!!reduceMotion} />
                <span>Process</span>
              </span>
              <Divider />
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: selected.dots[0],
                  }}
                />
                <span>{selected.label}</span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- EXPANDED ---------- */}
      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            key="expanded"
            layoutId={SHELL_ID}
            transition={shellTransition}
            style={{
              borderRadius: 34,
              background: "#171717",
              border: "1px solid #2a2a2a",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 300,
              color: "#f5f5f5",
              overflow: "hidden",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.65)",
            }}
          >
            <motion.div
              layout="position"
              initial={{ opacity: 0, filter: "blur(6px)", scale: 0.96 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{
                opacity: 0,
                filter: "blur(6px)",
                scale: 0.96,
                transition: contentOut,
              }}
              transition={{ ...contentIn, delay: reduceMotion ? 0 : 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {THEMES.map((theme) => {
                const isActive = theme.id === selected.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelected(theme);
                      setIsExpanded(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "12px 14px",
                      borderRadius: 20,
                      background: isActive ? "#242424" : "transparent",
                      border: isActive
                        ? "1px solid #333"
                        : "1px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Dots colors={theme.dots} />
                    <span style={{ fontSize: 17, flex: 1 }}>{theme.label}</span>
                    {isActive && (
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: theme.dots[0],
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: 2,
        height: 26,
        borderRadius: 999,
        backgroundImage:
          "repeating-linear-gradient(#4a4a4a 0 2px, transparent 2px 6px)",
      }}
    />
  );
}

function Spinner({ paused }: { paused?: boolean }) {
  return (
    <motion.span
      animate={paused ? undefined : { rotate: 360 }}
      // linear is correct here: constant-speed rotation, not an interaction
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        border: "2px solid #333",
        borderTopColor: "#2f6bff",
        display: "inline-block",
      }}
    />
  );
}

export default ThemeMorphMenu;
