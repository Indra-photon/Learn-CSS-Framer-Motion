"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  User02Icon,
  BookOpen01Icon,
  GridIcon,
  PenTool01Icon,
  CodeIcon,
  Film01Icon,
  BrainIcon,
  ColorsIcon,
  CubeIcon,
  Notebook01Icon,
  Certificate01Icon,
  Mail01Icon,
  FileEditIcon,
  Medal01Icon,
  Calendar01Icon,
  ArtboardIcon,
  CodeSimpleIcon,
  FlowerIcon,
  Airplane01Icon,
  Layers01Icon,
  BulbIcon,
  PencilRulerIcon,
  Login01Icon,
  LockPasswordIcon,
  EyeIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import useMeasure from "react-use-measure";

const NAV_ITEMS = [
  {
    label: "Work",
    icon: Briefcase01Icon,
    isForm: false,
    subs: [
      { label: "All", icon: GridIcon },
      { label: "Design", icon: PenTool01Icon },
      { label: "Dev", icon: CodeIcon },
      { label: "Motion", icon: Film01Icon },
      { label: "Research", icon: BrainIcon },
      { label: "Branding", icon: ColorsIcon },
      { label: "3D", icon: CubeIcon },
    ],
  },
  {
    label: "About",
    icon: User02Icon,
    isForm: false,
    subs: [
      { label: "Story", icon: Notebook01Icon },
      { label: "Skills", icon: Certificate01Icon },
      { label: "Contact", icon: Mail01Icon },
      { label: "Resume", icon: FileEditIcon },
      { label: "Awards", icon: Medal01Icon },
      { label: "Timeline", icon: Calendar01Icon },
    ],
  },
  {
    label: "Journal",
    icon: BookOpen01Icon,
    isForm: false,
    subs: [
      { label: "All", icon: GridIcon },
      { label: "Design", icon: ArtboardIcon },
      { label: "Code", icon: CodeSimpleIcon },
      { label: "Life", icon: FlowerIcon },
      { label: "Travel", icon: Airplane01Icon },
      { label: "Process", icon: Layers01Icon },
      { label: "Insights", icon: BulbIcon },
      { label: "Tools", icon: PencilRulerIcon },
    ],
  },
  {
    label: "Login",
    icon: Login01Icon,
    isForm: true,
    subs: [],
  },
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
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [activeSub, setActiveSub] = React.useState<string>("All");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [subRef, { height: subHeight }] = useMeasure();

  const handleTabClick = (label: string) => {
    if (activeTab === label) {
      setActiveTab(null);
    } else {
      setActiveTab(label);
      const item = NAV_ITEMS.find((i) => i.label === label);
      if (item && !item.isForm && item.subs.length > 0)
        setActiveSub(item.subs[0].label);
    }
  };

  const currentItem = NAV_ITEMS.find((i) => i.label === activeTab);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5e5ea]">
      {/* Phone frame */}
      <div
        className="relative h-[620px] w-[340px] overflow-hidden rounded-[20px]"
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

        {/* Page background */}
        <div className="absolute inset-0 overflow-hidden bg-[#f2f2f7] px-5 pt-14 pb-28">
          <div className="mb-6 h-7 w-24 rounded-lg bg-black/10" />
          <div className="mb-5 flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <div className="h-11 w-11 flex-shrink-0 rounded-full bg-black/10" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-28 rounded-full bg-black/15" />
              <div className="h-2.5 w-20 rounded-full bg-black/[0.07]" />
            </div>
            <div className="ml-auto h-4 w-4 rounded-full bg-black/10" />
          </div>
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
        <AnimatePresence initial={false}>
          {activeTab && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={() => setActiveTab(null)}
              className="absolute inset-0 z-10"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background: "rgba(200,200,210,0.3)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Morphing pill */}
        <motion.div
          layout
          transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
          style={{
            borderRadius: 17,
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.6)",
          }}
          className="absolute right-4 bottom-5 left-4 z-20 overflow-hidden bg-[#0e0e0e]"
        >
          {/* Submenu area — height driven by useMeasure, renders above tab row */}
          <motion.div
            animate={{ height: activeTab ? subHeight : 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            }
            style={{ overflow: "hidden" }}
          >
            <div ref={subRef}>
              <AnimatePresence initial={false} mode="popLayout">
                {currentItem && !currentItem.isForm && (
                  <motion.div
                    key={currentItem.label}
                    initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{
                      opacity: 0,
                      filter: "blur(2px)",
                      transition: prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.12, ease: [0.22, 1, 0.36, 1] },
                    }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="px-3 pt-3 pb-3"
                  >
                    <div className="flex flex-wrap gap-2">
                      {currentItem.subs.map((sub) => {
                        const isSubActive = activeSub === sub.label;
                        return (
                          <motion.button
                            key={sub.label}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setActiveSub(sub.label)}
                            className="flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 antialiased transition-[background-color,color] duration-150 select-none"
                            style={{
                              background: isSubActive
                                ? "rgba(255,255,255,0.14)"
                                : "rgba(255,255,255,0.05)",
                              color: isSubActive
                                ? "rgba(255,255,255,1)"
                                : "rgba(255,255,255,0.7)",
                            }}
                          >
                            <HugeiconsIcon
                              icon={sub.icon}
                              size={11}
                              color="currentColor"
                              strokeWidth={isSubActive ? 2 : 1.5}
                            />
                            <span
                              className="text-[11px]"
                              style={{ fontWeight: isSubActive ? 600 : 400 }}
                            >
                              {sub.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {currentItem?.isForm && (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, filter: "blur(2px)", y: 8 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{
                      opacity: 0,
                      filter: "blur(2px)",
                      transition: prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.1, ease: [0.22, 1, 0.36, 1] },
                    }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="flex flex-col gap-2.5 px-3 pt-3 pb-3"
                  >
                    {/* Email field */}
                    <div
                      className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-[box-shadow] duration-150 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <HugeiconsIcon
                        icon={Mail01Icon}
                        size={14}
                        color="rgba(255,255,255,0.7)"
                        strokeWidth={1.5}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent text-[12px] text-white antialiased outline-none placeholder:text-white/30"
                      />
                    </div>

                    {/* Password field */}
                    <div
                      className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-[box-shadow] duration-150 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <HugeiconsIcon
                        icon={LockPasswordIcon}
                        size={14}
                        color="rgba(255,255,255,0.7)"
                        strokeWidth={1.5}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-transparent text-[12px] text-white antialiased outline-none placeholder:text-white/30"
                      />
                      {/* Eye icon — contextual icon animation */}
                      <motion.button
                        onClick={() => setShowPassword((p) => !p)}
                        className="relative flex h-8 w-8 cursor-pointer items-center justify-center select-none"
                        whileTap={{ scale: 0.96 }}
                      >
                        <AnimatePresence initial={false} mode="popLayout">
                          <motion.span
                            key={showPassword ? "hide" : "show"}
                            initial={{
                              opacity: 0,
                              scale: 0.25,
                              filter: "blur(2px)",
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              filter: "blur(0px)",
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.25,
                              filter: "blur(2px)",
                            }}
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : { duration: 0.2, ease: "easeInOut" }
                            }
                            className="flex items-center justify-center"
                          >
                            <HugeiconsIcon
                              icon={showPassword ? ViewOffIcon : EyeIcon}
                              size={14}
                              color="rgba(255,255,255,0.7)"
                              strokeWidth={1.5}
                            />
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </div>

                    {/* Sign in button */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full cursor-pointer rounded-lg py-3 text-[12px] font-semibold text-black antialiased transition-[opacity] duration-150 select-none hover:opacity-90"
                      style={{ background: "rgba(255,255,255,0.92)" }}
                    >
                      Sign in
                    </motion.button>

                    {/* Forgot password */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full cursor-pointer py-1 text-center text-[11px] text-white/30 antialiased transition-[color] duration-150 select-none hover:text-white/50"
                    >
                      Forgot password?
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mx-4 h-px bg-white/[0.07]" />
            </div>
          </motion.div>

          {/* Tab row — always visible, anchored at bottom */}
          <div className="flex h-14 items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleTabClick(item.label)}
                  whileTap={{ scale: 0.96 }}
                  className="relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-2 select-none"
                >
                  {/* {isActive && (
                    <motion.div
                      layoutId="tab-active-bg"
                      className="absolute inset-1 rounded-2xl bg-white/[0.08]"
                      transition={{
                        type: "spring",
                        duration: 0.35,
                        bounce: 0,
                      }}
                    />
                  )} */}
                  <span
                    className="relative transition-[color] duration-150"
                    style={{
                      color: isActive ? "white" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      size={17}
                      color="currentColor"
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </span>
                  <span
                    className="relative text-[10px] antialiased transition-[color,font-weight] duration-150"
                    style={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "white" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
