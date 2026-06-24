"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  UserGroupIcon,
  CreditCardIcon,
  Settings01Icon,
  HelpCircleIcon,
  Logout01Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons";

const MENU_GROUP_1 = [
  {
    label: "Profile",
    icon: CheckmarkBadge01Icon,
    badge: null,
    active: true,
  },
  {
    label: "Community",
    icon: UserGroupIcon,
    badge: (
      <span className="flex size-5 items-center justify-center rounded-full border border-black/15 text-[10px] font-semibold text-black/50">
        +
      </span>
    ),
    active: false,
  },
  {
    label: "Subscription",
    icon: CreditCardIcon,
    badge: (
      <span className="flex items-center gap-0.5 rounded-full bg-green-400 px-2 py-0.5 text-[10px] font-bold text-black">
        <HugeiconsIcon
          icon={FlashIcon}
          size={10}
          color="black"
          strokeWidth={2.5}
        />
        PRO
      </span>
    ),
    active: false,
  },
  {
    label: "Settings",
    icon: Settings01Icon,
    badge: null,
    active: false,
  },
];

const MENU_GROUP_2 = [
  {
    label: "Help center",
    icon: HelpCircleIcon,
    badge: null,
    active: false,
  },
  {
    label: "Sign out",
    icon: Logout01Icon,
    badge: null,
    active: false,
  },
];

const SPRING = { type: "spring", duration: 0.5, bounce: 0.25 } as const;

function GradientRing() {
  return (
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background:
          "conic-gradient(from 0deg, #f97316, #ec4899, #a855f7, #3b82f6, #f97316)",
        padding: 2.5,
        borderRadius: "50%",
      }}
    >
      <div className="h-full w-full rounded-full bg-white" />
    </div>
  );
}

function Avatar({ size }: { size: number }) {
  return (
    <div
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="flex flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300"
    >
      {/* Blob character approximation */}
      <svg viewBox="0 0 60 60" width={size * 0.8} height={size * 0.8}>
        <ellipse cx="30" cy="34" rx="18" ry="16" fill="#5b7be9" />
        <ellipse cx="30" cy="20" rx="14" ry="14" fill="#6b8ef0" />
        {/* Eyes */}
        <circle cx="24" cy="20" r="3.5" fill="white" />
        <circle cx="36" cy="20" r="3.5" fill="white" />
        <circle cx="25" cy="21" r="1.8" fill="#1a1a2e" />
        <circle cx="37" cy="21" r="1.8" fill="#1a1a2e" />
        {/* Mouth */}
        <ellipse cx="30" cy="29" rx="5" ry="3" fill="#f87171" />
      </svg>
    </div>
  );
}

function MenuRow({
  item,
  delay,
}: {
  item: (typeof MENU_GROUP_1)[0] | (typeof MENU_GROUP_2)[0];
  delay: number;
}) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { type: "spring", duration: 0.35, bounce: 0 },
        },
      }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors select-none ${
        item.active ? "bg-black/[0.06]" : "hover:bg-black/[0.04]"
      }`}
    >
      <span className="flex-shrink-0 text-black/50">
        <HugeiconsIcon
          icon={item.icon}
          size={18}
          color="currentColor"
          strokeWidth={1.6}
        />
      </span>
      <span className="flex-1 text-[15px] font-medium text-black/85 antialiased">
        {item.label}
      </span>
      {item.badge}
    </motion.button>
  );
}

export default function ProfileCard() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      {/* Phone frame */}
      <div className="relative h-[680px] w-[390px] overflow-hidden rounded-[32px] border border-white/10 bg-[#f2f2f7]">
        {/* Page content */}
        <div className="absolute inset-0 px-6 pt-12">
          <div className="mt-8">
            <p className="text-xs font-semibold tracking-widest text-black/30 uppercase antialiased">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-black antialiased">
              Good morning,
            </h1>
            <h1 className="text-2xl font-bold tracking-tight text-black antialiased">
              Sophie ✦
            </h1>
          </div>

          {/* Placeholder cards */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="h-24 rounded-2xl bg-white/80 shadow-sm" />
            <div className="flex gap-3">
              <div className="h-20 flex-1 rounded-2xl bg-white/80 shadow-sm" />
              <div className="h-20 flex-1 rounded-2xl bg-white/80 shadow-sm" />
            </div>
            <div className="h-32 rounded-2xl bg-white/80 shadow-sm" />
          </div>
        </div>

        {/* Dismiss overlay — scoped inside phone frame */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 z-10"
            />
          )}
        </AnimatePresence>

        {/* Avatar trigger — top-right of status bar */}
        <div className="absolute top-3 right-5 z-20">
          <motion.div
            layoutId="profile-card"
            onClick={() => setIsOpen(true)}
            transition={SPRING}
            style={{
              borderRadius: 20,
              pointerEvents: isOpen ? "none" : "auto",
            }}
            className="cursor-pointer"
          >
            {/* Matches expanded state structure exactly — same container, ring, inset */}
            <div style={{ width: 40, height: 40, position: "relative" }}>
              {/* <GradientRing /> */}
              <motion.div
                layoutId="profile-avatar"
                transition={SPRING}
                className="absolute inset-[2px] overflow-hidden rounded-full"
              >
                <Avatar size={36} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Expanded profile card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              layoutId="profile-card"
              key="profile-card-expanded"
              onClick={() => setIsOpen(false)}
              transition={SPRING}
              style={{ borderRadius: 20 }}
              className="absolute top-3 right-5 z-20 w-[310px] cursor-pointer bg-white shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
            >
              {/* Avatar — direct child of profile-card, outside fade wrapper */}
              <div
                className="absolute top-4 right-4 cursor-pointer"
                style={{ width: 48, height: 48 }}
              >
                {/* <GradientRing /> */}
                <motion.div
                  layoutId="profile-avatar"
                  transition={SPRING}
                  className="absolute inset-[3px] overflow-hidden rounded-full"
                >
                  <Avatar size={42} />
                </motion.div>
              </div>

              {/* Fade wrapper — text + menu only, no avatar */}
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
              >
                {/* Header text — pr-16 reserves space for the avatar */}
                <div className="px-4 pt-4 pr-16 pb-3">
                  <p className="text-[16px] font-bold tracking-tight text-black antialiased">
                    Sophie Bennett
                  </p>
                  <p className="mt-0.5 text-xs text-black/40 antialiased">
                    sophie@ui.live
                  </p>
                </div>

                <div className="mx-1 h-px bg-black/[0.06]" />

                {/* Group 1 */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.15,
                      },
                    },
                  }}
                  className="flex flex-col p-2"
                >
                  {MENU_GROUP_1.map((item) => (
                    <MenuRow key={item.label} item={item} delay={0} />
                  ))}
                </motion.div>

                <div className="mx-1 h-px bg-black/[0.06]" />

                {/* Group 2 */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.35,
                      },
                    },
                  }}
                  className="flex flex-col p-2"
                >
                  {MENU_GROUP_2.map((item) => (
                    <MenuRow key={item.label} item={item} delay={0} />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
