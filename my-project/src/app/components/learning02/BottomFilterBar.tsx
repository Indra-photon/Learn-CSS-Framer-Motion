"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  User02Icon,
  Briefcase01Icon,
  BookOpen01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

const NAV_ITEMS = [
  { label: "Home", icon: Home01Icon },
  { label: "About", icon: User02Icon },
  { label: "Projects", icon: Briefcase01Icon },
  { label: "Blogs", icon: BookOpen01Icon },
];

const SETTINGS_ROWS = [
  [
    { label: "Notifications", wide: false },
    { label: "Appearance", wide: false },
    { label: "Language & Region", wide: true },
  ],
  [
    { label: "Account", wide: false },
    { label: "Privacy & Security", wide: true },
    { label: "Connected Apps", wide: false },
  ],
  [
    { label: "Storage", wide: false },
    { label: "Help & Support", wide: false },
  ],
];

export default function BottomFilterBar() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [active, setActive] = React.useState("Home");

  const handleSelect = (label: string) => {
    setActive(label);
    setIsExpanded(false);
  };

  const activeItem = NAV_ITEMS.find((i) => i.label === active)!;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5e5ea]">
      {/* Phone frame */}
      <div
        className="relative h-[620px] w-[340px] overflow-hidden rounded-[48px]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Status bar */}
        <div className="absolute top-0 right-0 left-0 z-30 flex h-10 items-center justify-between px-8">
          <span className="text-xs font-semibold text-white antialiased">
            9:41
          </span>
          <div className="flex items-center gap-1">
            <div className="flex h-2.5 w-4 items-center rounded-sm border border-white/40 p-[1.5px]">
              <div className="h-full w-1/2 rounded-[1px] bg-white/40" />
            </div>
          </div>
        </div>

        {/* Settings page background — light */}
        <div className="absolute inset-0 overflow-hidden bg-[#f2f2f7] px-5 pt-14 pb-28">
          {/* Page title */}
          <div className="mb-6 h-7 w-24 rounded-lg bg-black/10" />

          {/* Profile card */}
          <div className="mb-5 flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <div className="h-11 w-11 flex-shrink-0 rounded-full bg-black/10" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-28 rounded-full bg-black/15" />
              <div className="h-2.5 w-20 rounded-full bg-black/07" />
            </div>
            <div className="ml-auto h-4 w-4 rounded-full bg-black/10" />
          </div>

          {/* Section groups */}
          {SETTINGS_ROWS.map((group, gi) => (
            <div key={gi} className="mb-3 overflow-hidden rounded-2xl bg-white">
              {group.map((row, ri) => (
                <div key={ri}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="h-7 w-7 flex-shrink-0 rounded-lg bg-black/[0.07]" />
                    <div
                      className="h-2.5 rounded-full bg-black/[0.12]"
                      style={{ width: row.wide ? "52%" : "38%" }}
                    />
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-2 w-8 rounded-full bg-black/[0.07]" />
                      <div className="h-3 w-3 rounded-full bg-black/[0.06]" />
                    </div>
                  </div>
                  {ri < group.length - 1 && (
                    <div className="ml-[60px] h-px bg-black/[0.06]" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Blur overlay */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={() => setIsExpanded(false)}
              className="absolute inset-0 z-10"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background: "rgba(200,200,210,0.3)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Collapsed pill — always in DOM */}
        <motion.div
          layoutId="nav-bar"
          layout
          onClick={() => setIsExpanded(true)}
          transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          style={{
            borderRadius: 28,
            width: isExpanded ? "calc(100% - 32px)" : "calc(100% - 128px)",
            pointerEvents: isExpanded ? "none" : "auto",
          }}
          className="absolute right-0 bottom-5 left-0 z-20 mx-auto flex h-12 cursor-pointer items-center gap-2 bg-black px-4 shadow-2xl select-none"
        >
          <motion.div layoutId="nav-active-icon" className="flex-shrink-0">
            <HugeiconsIcon
              icon={activeItem.icon}
              size={18}
              color="white"
              strokeWidth={2}
            />
          </motion.div>

          <motion.span
            layoutId="nav-active-label"
            className="text-sm font-medium text-white antialiased"
          >
            {active}
          </motion.span>

          <div className="flex-1" />

          <motion.div layoutId="nav-chevron">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 4L6 8L10 4"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Expanded card */}
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.div
              layoutId="nav-bar"
              key="expanded"
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              style={{
                borderRadius: 22,
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.6)",
              }}
              className="absolute right-4 bottom-5 left-4 z-20 overflow-hidden bg-[#0e0e0e]"
            >
              <motion.div
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.2, ease: "easeOut", delay: 0.08 }}
              >
                {/* Header row */}
                <div
                  className="flex h-12 cursor-pointer items-center gap-2 px-4"
                  onClick={() => setIsExpanded(false)}
                >
                  <motion.div
                    layoutId="nav-active-icon"
                    className="flex-shrink-0"
                  >
                    <HugeiconsIcon
                      icon={activeItem.icon}
                      size={18}
                      color="white"
                      strokeWidth={2}
                    />
                  </motion.div>
                  <motion.span
                    layoutId="nav-active-label"
                    className="text-sm font-medium text-white antialiased"
                  >
                    {active}
                  </motion.span>
                  <div className="flex-1" />
                  {/* <motion.div layoutId="nav-chevron" style={{ rotate: 180 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 4L6 8L10 4"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div> */}
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-white/[0.07]" />

                {/* Nav list */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.08,
                      },
                    },
                  }}
                  className="flex flex-col px-2.5 pt-2 pb-2"
                >
                  {NAV_ITEMS.map((item) => {
                    const isActive = item.label === active;
                    return (
                      <motion.button
                        key={item.label}
                        variants={{
                          hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
                          show: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: {
                              type: "spring",
                              duration: 0.38,
                              bounce: 0,
                            },
                          },
                        }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(item.label)}
                        className="group relative flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-left select-none"
                      >
                        {/* Sliding active bg */}
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 rounded-[14px] bg-white/[0.08]"
                            transition={{
                              type: "spring",
                              duration: 0.35,
                              bounce: 0.1,
                            }}
                          />
                        )}

                        {/* Icon */}
                        <span
                          className="relative transition-colors"
                          style={{
                            color: isActive
                              ? "rgba(255,255,255,1)"
                              : "rgba(255,255,255,0.25)",
                          }}
                        >
                          <HugeiconsIcon
                            icon={item.icon}
                            size={20}
                            color="currentColor"
                            strokeWidth={isActive ? 2 : 1.5}
                          />
                        </span>

                        {/* Label */}
                        <span
                          className="relative antialiased transition-colors"
                          style={{
                            fontSize: isActive ? "1.6rem" : "1.4rem",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive
                              ? "rgba(255,255,255,1)"
                              : "rgba(255,255,255,0.25)",
                            lineHeight: 1.1,
                          }}
                        >
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Divider */}
                <div className="mx-4 h-px bg-white/[0.07]" />

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.32 }}
                  className="flex items-center gap-2.5 px-4 py-3"
                >
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #3a3a3a 0%, #1c1c1c 100%)",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-[9px] font-bold tracking-wide text-white/70 antialiased">
                      IM
                    </span>
                  </div>
                  <span className="flex-1 text-sm font-medium text-white/40 antialiased">
                    Indranil Maiti
                  </span>
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    size={16}
                    color="rgba(255,255,255,0.25)"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
