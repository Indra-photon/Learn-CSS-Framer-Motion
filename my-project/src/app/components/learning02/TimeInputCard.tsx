"use client";

import React from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

const SPRING = { type: "spring", duration: 0.4, bounce: 0.05 } as const;
const ICON_SPRING = { type: "spring", duration: 0.25, bounce: 0 } as const;
const BG = "#f0f0f4";

export default function TimeInputCard() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [hours, setHours] = React.useState("1");
  const [minutes, setMinutes] = React.useState("30");

  const hoursRef = React.useRef<HTMLInputElement>(null);
  const minutesRef = React.useRef<HTMLInputElement>(null);

  const handleConfirm = () => setIsEditing(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <MotionConfig transition={SPRING}>
        <LayoutGroup id="time-input-card">
          <AnimatePresence mode="popLayout">
            {!isEditing ? (
              // ── Collapsed ──────────────────────────────────────
              <motion.div
                key="collapsed"
                className="flex cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <motion.div
                  layoutId="hr-card"
                  style={{ background: BG, borderRadius: "20px 0 0 20px" }}
                  className="flex items-center gap-1.5 py-4 pr-3 pl-6"
                >
                  <motion.span
                    layoutId="hr-value"
                    className="text-[26px] leading-none font-bold text-gray-900 tabular-nums"
                  >
                    {hours || "0"}
                  </motion.span>
                  <motion.span
                    layoutId="hr-label"
                    className="text-[17px] leading-none font-medium text-gray-400"
                  >
                    Hr.
                  </motion.span>
                </motion.div>

                <motion.div
                  layoutId="min-card"
                  style={{ background: BG, borderRadius: 0 }}
                  className="flex items-center gap-1.5 px-3 py-4"
                >
                  <motion.span
                    layoutId="min-value"
                    className="text-[26px] leading-none font-bold text-gray-900 tabular-nums"
                  >
                    {minutes || "0"}
                  </motion.span>
                  <motion.span
                    layoutId="min-label"
                    className="text-[17px] leading-none font-medium text-gray-400"
                  >
                    Min.
                  </motion.span>
                </motion.div>

                <motion.div
                  layoutId="action"
                  style={{ background: BG, borderRadius: "0 20px 20px 0" }}
                  className="flex items-center justify-center px-5 py-4"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key="pencil"
                      initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                      transition={ICON_SPRING}
                      className="flex items-center"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={18} color="#9ca3af" strokeWidth={1.5} />
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              // ── Expanded ───────────────────────────────────────
              <motion.div
                key="expanded"
                className="flex gap-3"
              >
                <motion.div
                  layoutId="hr-card"
                  style={{ borderRadius: 20, background: BG }}
                  className="flex items-center gap-2 px-6 py-5"
                  onClick={() => hoursRef.current?.focus()}
                >
                  <motion.input
                    layoutId="hr-value"
                    ref={hoursRef}
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={hours}
                    onChange={(e) =>
                      setHours(e.target.value.replace(/\D/g, "").slice(0, 2))
                    }
                    className="w-9 bg-transparent text-[26px] leading-none font-bold text-gray-900 tabular-nums outline-none"
                  />
                  <motion.span
                    layoutId="hr-label"
                    className="text-[17px] leading-none font-medium text-gray-400"
                  >
                    Hr.
                  </motion.span>
                </motion.div>

                <motion.div
                  layoutId="min-card"
                  style={{ borderRadius: 20, background: BG }}
                  className="flex items-center gap-2 px-6 py-5"
                  onClick={() => minutesRef.current?.focus()}
                >
                  <motion.input
                    layoutId="min-value"
                    ref={minutesRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={minutes}
                    onChange={(e) =>
                      setMinutes(e.target.value.replace(/\D/g, "").slice(0, 2))
                    }
                    className="w-9 bg-transparent text-[26px] leading-none font-bold text-gray-900 tabular-nums outline-none"
                  />
                  <motion.span
                    layoutId="min-label"
                    className="text-[17px] leading-none font-medium text-gray-400"
                  >
                    Min.
                  </motion.span>
                </motion.div>

                <motion.div
                  layoutId="action"
                  style={{ borderRadius: 20, background: BG }}
                  className="flex w-[72px] cursor-pointer items-center justify-center self-stretch"
                  onClick={handleConfirm}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key="tick"
                      initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                      transition={ICON_SPRING}
                      className="flex items-center"
                    >
                      <HugeiconsIcon icon={Tick01Icon} size={20} color="#111827" strokeWidth={2.5} />
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}
