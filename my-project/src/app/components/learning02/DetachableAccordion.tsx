"use client";

import React from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  GridViewIcon,
  Cursor01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";

const ITEMS = [
  {
    id: "user-research",
    icon: Search01Icon,
    label: "User Research",
    description:
      "Understanding user needs, behaviors, and motivations through methods like interviews, surveys, and usability testing.",
  },
  {
    id: "info-arch",
    icon: GridViewIcon,
    label: "Information Architecture",
    description:
      "Organizing and structuring content so users can find what they need intuitively and navigate with confidence.",
  },
  {
    id: "interaction",
    icon: Cursor01Icon,
    label: "Interaction Design",
    description:
      "Crafting meaningful, responsive interactions between users and products — from micro-animations to full user flows.",
  },
  {
    id: "ux-optim",
    icon: Analytics01Icon,
    label: "UX Optimization",
    description:
      "Using analytics, heuristics, and iterative testing to continuously improve the quality of the user experience.",
  },
];

const SPRING = { type: "spring", duration: 0.45, bounce: 0.25 } as const;

function IconBox({ icon }: { icon: typeof Search01Icon }) {
  return (
    <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-stone-100 text-stone-800">
      <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={SPRING}
      className="flex-shrink-0"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export default function DetachableAccordion() {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const selectedIndex = ITEMS.findIndex((i) => i.id === openId);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebebee]">
      <LayoutGroup id="accordion">
        <div className="w-[420px]">
          <AnimatePresence mode="popLayout">
            {ITEMS.map((item, index) => {
              const isOpen = item.id === openId;
              const isFirst = index === 0;
              const isLast = index === ITEMS.length - 1;
              const isJustAfterSelected =
                selectedIndex >= 0 && index === selectedIndex + 1;
              const isJustBeforeSelected =
                selectedIndex >= 0 && index === selectedIndex - 1;

              if (isOpen) {
                return (
                  <motion.div
                    key={`${item.id}-expanded`}
                    layoutId={`card-${item.id}`}
                    layout
                    transition={{
                      ease: [0.215, 0.61, 0.355, 1],
                      duration: 0.12,
                    }}
                    style={{
                      borderRadius: 20,
                      marginTop: !isFirst ? 12 : 0,
                      marginBottom: !isLast ? 12 : 0,
                      boxShadow: "0 4px 20px 0 rgba(0,0,0,0.10)",
                    }}
                    className="cursor-pointer overflow-hidden bg-white select-none"
                    onClick={() => toggle(item.id)}
                  >
                    <div className="flex items-center gap-4 px-5 pt-5 pb-3">
                      <motion.div
                        layoutId={`icon-${item.id}`}
                        transition={SPRING}
                      >
                        <IconBox icon={item.icon} />
                      </motion.div>
                      <motion.span
                        layoutId={`label-${item.id}`}
                        transition={SPRING}
                        className="flex-1 text-[17px] font-semibold text-gray-900 antialiased"
                      >
                        {item.label}
                      </motion.span>
                      <AnimatePresence>
                        {isOpen ? (
                          <motion.span
                            key={`chevron-${isOpen}`}
                            layoutId={`chevron-${item.id}-${isOpen}`}
                            initial={{ opacity: 0, filter: "blur(4px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(4px)" }}
                          >
                            <ChevronIcon open={true} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key={`chevron-${isOpen}`}
                            layoutId={`chevron-${item.id}-${isOpen}`}
                            initial={{ opacity: 0, filter: "blur(4px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(4px)" }}
                          >
                            <ChevronIcon open={false} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.p
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        transition: {
                          duration: 0.15,
                          ease: "easeOut",
                          delay: 0.05,
                        },
                      }}
                      exit={{
                        opacity: 0,
                        filter: "blur(2px)",
                        transition: { duration: 0.05, ease: "easeIn" },
                      }}
                      className="px-5 pb-5 text-sm leading-relaxed antialiased"
                    >
                      {item.description}
                    </motion.p>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={`${item.id}-collapsed`}
                  layoutId={`card-${item.id}`}
                  layout
                  transition={SPRING}
                  style={{
                    borderTopLeftRadius:
                      isFirst || isJustAfterSelected ? 20 : 0,
                    borderTopRightRadius:
                      isFirst || isJustAfterSelected ? 20 : 0,
                    borderBottomLeftRadius:
                      isLast || isJustBeforeSelected ? 20 : 0,
                    borderBottomRightRadius:
                      isLast || isJustBeforeSelected ? 20 : 0,
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)",
                  }}
                  className={`cursor-pointer overflow-hidden bg-white select-none ${
                    !isLast && !isJustBeforeSelected
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                  onClick={() => toggle(item.id)}
                >
                  <div className="flex items-center gap-4 px-5 py-[14px]">
                    <motion.div
                      layoutId={`icon-${item.id}`}
                      transition={SPRING}
                    >
                      <IconBox icon={item.icon} />
                    </motion.div>
                    <motion.span
                      layoutId={`label-${item.id}`}
                      transition={SPRING}
                      className="flex-1 text-[15px] font-medium text-gray-800 antialiased"
                    >
                      {item.label}
                    </motion.span>
                    <AnimatePresence>
                      {isOpen ? (
                        <motion.span
                          key={`chevron-${isOpen}`}
                          layoutId={`chevron-${item.id}-${isOpen}`}
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(4px)" }}
                        >
                          <ChevronIcon open={true} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key={`chevron-${isOpen}`}
                          layoutId={`chevron-${item.id}-${isOpen}`}
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(4px)" }}
                        >
                          <ChevronIcon open={false} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
