"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Share01Icon,
  Delete01Icon,
  NewTwitterIcon,
  InstagramIcon,
  FacebookIcon,
  Linkedin01Icon,
  Cancel01Icon,
  FloppyDiskIcon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;

const OUTER_R = 14;
const PAD = 5;
const INNER_R = OUTER_R - PAD; // 9

const PILL_SHADOW = "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.08)";

type View = "default" | "share" | "delete";

const VIEW_WIDTH: Record<View, number> = {
  default: 260,
  share: 260,
  delete: 260,
};

const VIEW_HEIGHT: Record<View, number> = {
  default: 50,
  share: 46,
  delete: 85,
};

const SOCIAL = [
  { icon: NewTwitterIcon, label: "Twitter" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: FacebookIcon, label: "Facebook" },
  { icon: Linkedin01Icon, label: "LinkedIn" },
];

export default function InlineOverflow() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("default");

  const open = () => {
    setView("default");
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-stone-100"
      onClick={close}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* ── Popup ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="popup"
              initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
                duration: 0.1,
              }}
              style={{
                transformOrigin: "right bottom",
                borderRadius: OUTER_R,
                boxShadow: PILL_SHADOW,
                background: "rgba(231,229,228,1)",
              }}
              className="absolute right-0 bottom-full z-20 mb-2 overflow-hidden"
            >
              {/* Width + height transition between views */}
              <motion.div
                initial={{
                  width: VIEW_WIDTH.default,
                  height: VIEW_HEIGHT.default,
                }}
                animate={{ width: VIEW_WIDTH[view], height: VIEW_HEIGHT[view] }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="overflow-hidden"
              >
                <div style={{ padding: PAD }}>
                  <AnimatePresence mode="wait">
                    {/* Default — Share + Delete */}
                    {view === "default" && (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.15, ease: EASE_OUT_QUART }}
                        className="flex gap-2"
                      >
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setView("share")}
                          style={{ borderRadius: INNER_R }}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-white"
                        >
                          <HugeiconsIcon
                            icon={Share01Icon}
                            size={14}
                            strokeWidth={1.6}
                            color="#57534e"
                          />
                          Share
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setView("delete")}
                          style={{ borderRadius: INNER_R }}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-stone-100 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                        >
                          <HugeiconsIcon
                            icon={Delete01Icon}
                            size={14}
                            strokeWidth={1.6}
                            color="rgb(239 68 68)"
                          />
                          Delete
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Share — social icons + close */}
                    {view === "share" && (
                      <motion.div
                        key="share"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="flex items-center gap-2"
                      >
                        {SOCIAL.map((item, i) => (
                          <motion.button
                            key={item.label}
                            initial={{ opacity: 0, filter: "blur(6px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{
                              duration: 0.16,
                              ease: EASE_OUT_QUART,
                              delay: i * 0.03,
                            }}
                            whileTap={{ scale: 0.96 }}
                            className="flex flex-1 cursor-pointer items-center justify-center bg-stone-100 py-2.5 transition-colors hover:bg-white"
                            style={{ borderRadius: INNER_R }}
                          >
                            <HugeiconsIcon
                              icon={item.icon}
                              size={14}
                              strokeWidth={1.5}
                              color="#57534e"
                            />
                          </motion.button>
                        ))}

                        {/* Close — visually distinct: darker bg, pill shape */}
                        <motion.button
                          initial={{ opacity: 0, filter: "blur(6px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{
                            duration: 0.16,
                            ease: EASE_OUT_QUART,
                            delay: SOCIAL.length * 0.03,
                          }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setView("default")}
                          className="flex cursor-pointer items-center justify-center bg-stone-300 px-2.5 py-2 transition-colors hover:bg-stone-400"
                          style={{ borderRadius: 20 }}
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={10}
                            strokeWidth={2.2}
                            color="#57534e"
                          />
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Delete — confirmation */}
                    {view === "delete" && (
                      <motion.div
                        key="delete"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.15, ease: EASE_OUT_QUART }}
                        className="flex flex-col gap-2"
                      >
                        <p className="px-1 pt-1 text-sm font-medium text-stone-600 antialiased">
                          Are you sure?
                        </p>
                        <div className="flex gap-2">
                          <motion.button
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.08,
                              duration: 0.18,
                              ease: EASE_OUT_QUART,
                            }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setView("default")}
                            style={{ borderRadius: INNER_R }}
                            className="flex-1 cursor-pointer bg-stone-100 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-white"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.12,
                              duration: 0.18,
                              ease: EASE_OUT_QUART,
                            }}
                            whileTap={{ scale: 0.96 }}
                            onClick={close}
                            style={{ borderRadius: INNER_R }}
                            className="flex-1 cursor-pointer bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toolbar pill ── */}
        <div
          className="relative z-10 flex items-center gap-2"
          style={{
            borderRadius: OUTER_R,
            padding: PAD,
            background: "rgba(231,229,228,1)",
            boxShadow: PILL_SHADOW,
          }}
        >
          <button
            style={{ borderRadius: INNER_R }}
            className="flex cursor-pointer items-center gap-1.5 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-white active:scale-[0.96]"
          >
            <HugeiconsIcon
              icon={FloppyDiskIcon}
              size={14}
              strokeWidth={1.6}
              color="#57534e"
            />
            Save
          </button>
          <button
            style={{ borderRadius: INNER_R }}
            className="flex cursor-pointer items-center gap-1.5 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-white active:scale-[0.96]"
          >
            <HugeiconsIcon
              icon={Copy01Icon}
              size={14}
              strokeWidth={1.6}
              color="#57534e"
            />
            Copy
          </button>
          <button
            onClick={isOpen ? close : open}
            style={{ borderRadius: INNER_R }}
            className="cursor-pointer bg-stone-100 px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-white hover:text-stone-800"
          >
            More actions
          </button>
        </div>
      </div>
    </div>
  );
}
