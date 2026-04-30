"use client";

import React from "react";
import {
  IconWallet,
  IconPlus,
  IconX,
  IconCreditCardRefund,
  IconCheck,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import useMeasure from "react-use-measure";

// ============================================================
// Flow: collapsed → expanded (select card + cash) → loading → success → collapsed
//
// States:
//   "collapsed"  — wallet row + Add Card button
//   "expanded"   — payment method, card selection, cash, submit
//   "loading"    — 3D stacked cards rotating with perspective
//   "success"    — checkmark + "Card Added Successfully"
//
// Architecture (layoutId approach):
//   Shared elements (icon, info) live OUTSIDE AnimatePresence.
//   State-specific content swaps INSIDE AnimatePresence.
// ============================================================

type ViewState = "collapsed" | "expanded" | "loading" | "success";

const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94] as const;
const TRANSITION = { duration: 0.25, ease: EASE_OUT_QUAD } as const;

function WalletAddCard() {
  const [viewState, setViewState] = React.useState<ViewState>("collapsed");
  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(
    null,
  );
  const [walletBalance, setWalletBalance] = React.useState(1900);
  const [elementRef, bounds] = useMeasure();

  const cards = [
    { id: "visa", name: "Visa", number: "123456789012" },
    { id: "master", name: "Mastercard", number: "234567890123" },
  ];

  const handleAddCard = () => {
    if (!selectedCard || !selectedAmount) return;
    setViewState("loading");

    setTimeout(() => {
      setViewState("success");
      setWalletBalance((prev) => prev + selectedAmount);
    }, 1500);

    setTimeout(() => {
      setViewState("collapsed");
      setSelectedCard(null);
      setSelectedAmount(null);
    }, 3800);
  };

  const isExpanded =
    viewState === "expanded" ||
    viewState === "loading" ||
    viewState === "success";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        initial={false}
        animate={{ height: bounds.height || "auto" }}
        transition={TRANSITION}
        className="max-w-[420px] min-w-[420px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
      >
        <div ref={elementRef} className="p-4">
          {/* ── Top row: always mounted shared elements ── */}
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex items-center">
              <motion.div
                layout
                layoutId="card-icon"
                transition={TRANSITION}
                className="flex flex-col items-center justify-center rounded-xl bg-neutral-100 p-3"
              >
                <IconWallet className="text-gray-500" size={36} />
              </motion.div>

              <motion.div
                layout
                layoutId="card-info"
                transition={TRANSITION}
                className="ml-5 flex flex-col items-start justify-center"
              >
                <motion.h2
                  layoutId="card-title"
                  className={`font-semibold text-gray-400 ${!isExpanded ? "text-sm" : ""}`}
                >
                  Wallet
                </motion.h2>
                <motion.p
                  layoutId="card-balance"
                  className="text-2xl font-bold text-gray-800"
                >
                  $ {walletBalance.toLocaleString()}
                </motion.p>
              </motion.div>
            </div>

            {/* Right side button: Add Card ↔ Close */}
            <AnimatePresence mode="wait" initial={false}>
              {viewState === "collapsed" ? (
                <motion.div
                  key="add-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                  onClick={() => setViewState("expanded")}
                  className="flex cursor-pointer flex-row items-center justify-center gap-1.5 rounded-full bg-neutral-800 px-5 py-2.5 active:scale-[0.97]"
                >
                  <IconPlus className="text-gray-200" size={20} />
                  <span className="text-sm font-semibold text-gray-200">
                    Add Card
                  </span>
                </motion.div>
              ) : viewState === "expanded" ? (
                <motion.button
                  key="close-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                  onClick={() => {
                    setViewState("collapsed");
                    setSelectedCard(null);
                    setSelectedAmount(null);
                  }}
                  className="flex items-center justify-center rounded-full border border-gray-200 p-2 transition-colors hover:bg-gray-50"
                >
                  <IconX className="text-gray-400" size={20} />
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

          {/* ── State-specific content ── */}
          <AnimatePresence mode="wait" initial={false}>
            {viewState === "expanded" && (
              <motion.div
                key="expanded-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
                className="mt-4 w-full border-t border-gray-100 pt-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Payment Method
                  </p>
                  <span className="flex flex-row items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500">
                    <IconCreditCardRefund size={14} />
                    Add New
                  </span>
                </div>

                {/* Card Selection */}
                <div className="mt-3 space-y-2">
                  {cards.map((card) => (
                    <motion.div
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                        selectedCard === card.id
                          ? "border-neutral-800 bg-neutral-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                            selectedCard === card.id
                              ? "border-neutral-800 bg-neutral-800"
                              : "border-gray-300"
                          }`}
                        >
                          <AnimatePresence>
                            {selectedCard === card.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{
                                  type: "spring",
                                  duration: 0.25,
                                  bounce: 0.4,
                                }}
                                className="h-2 w-2 rounded-full bg-white"
                              />
                            )}
                          </AnimatePresence>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {"•".repeat(8)}
                          {card.number.slice(-4)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {card.name}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Cash Section */}
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-gray-800">
                    Amount
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 100, 1000].map((amount) => (
                      <motion.button
                        key={amount}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedAmount(amount)}
                        className={`rounded-xl border px-4 py-3 transition-colors ${
                          selectedAmount === amount
                            ? "border-neutral-800 bg-neutral-800 text-white"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`text-sm font-bold ${selectedAmount === amount ? "text-white" : "text-gray-800"}`}
                        >
                          ${amount}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleAddCard}
                  whileTap={
                    selectedCard && selectedAmount ? { scale: 0.97 } : {}
                  }
                  className={`mt-5 flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded-full py-3 transition-colors ${
                    selectedCard && selectedAmount
                      ? "bg-neutral-800 text-white"
                      : "cursor-not-allowed bg-neutral-200 text-neutral-400"
                  }`}
                >
                  <IconPlus
                    size={18}
                    className={
                      selectedCard && selectedAmount
                        ? "text-white"
                        : "text-neutral-400"
                    }
                  />
                  <span className="text-sm font-semibold">Add Card</span>
                </motion.button>
              </motion.div>
            )}

            {viewState === "loading" && (
              <motion.div
                key="loading-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
                className="mt-4 flex w-full flex-col items-center border-t border-gray-100 py-8"
              >
                {/* Card swipe area — overflow hidden to clip card exit */}
                <div
                  className="relative flex h-36 w-full items-center justify-center overflow-hidden"
                  style={{ perspective: "800px" }}
                >
                  <motion.div
                    className="rounded-xl shadow-xl"
                    style={{
                      width: 170,
                      height: 105,
                      transformStyle: "preserve-3d",
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    }}
                    // Phase 1 (0-30%): Enters from top-left corner, tilted
                    // Phase 2 (30-55%): Settles in center, straightens
                    // Phase 3 (55-100%): Swipes out right, fades during swipe
                    animate={{
                      y: [-60, 0, 0, 0, 0],
                      x: [-140, 0, 0, 180, 320],
                      rotateZ: [-15, -6, 0, 2, 4],
                      rotateX: [18, 10, 5, 2, 0],
                      scale: [0.8, 1, 1, 0.97, 0.95],
                      opacity: [0, 1, 1, 0.6, 0],
                    }}
                    transition={{
                      duration: 1.4,
                      times: [0, 0.3, 0.55, 0.78, 1],
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    {/* Card chip */}
                    <div className="absolute left-4 top-4 h-5 w-7 rounded-sm bg-amber-300/70">
                      <div className="ml-1 mt-1.5 h-0.5 w-5 rounded-full bg-amber-400/50" />
                      <div className="ml-1 mt-0.5 h-0.5 w-5 rounded-full bg-amber-400/30" />
                    </div>
                    {/* Contactless icon — pulses during settle phase */}
                    <div className="absolute right-4 top-4 flex flex-col items-center gap-0.5">
                      {[8, 6, 4].map((w, i) => (
                        <motion.div
                          key={i}
                          className="rounded-full border border-white/30"
                          style={{ width: w, height: w * 0.5 }}
                          animate={{ opacity: [0, 0, 0.7, 0] }}
                          transition={{
                            duration: 1.4,
                            times: [0, 0.32, 0.5, 0.6],
                            delay: i * 0.08,
                          }}
                        />
                      ))}
                    </div>
                    {/* Magnetic stripe */}
                    <div className="absolute left-0 right-0 top-[54px] h-6 bg-neutral-900/40" />
                    {/* Card number dots */}
                    <div className="absolute bottom-4 left-4 flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1 w-5 rounded-full bg-white/20"
                        />
                      ))}
                      <div className="h-1 w-5 rounded-full bg-white/35" />
                    </div>
                    {/* Card logo */}
                    <div className="absolute bottom-3 right-4 flex">
                      <div className="h-4 w-4 rounded-full bg-red-500/50" />
                      <div className="-ml-1.5 h-4 w-4 rounded-full bg-orange-400/50" />
                    </div>

                    {/* Glow sweep — left to right during swipe phase */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                      }}
                      animate={{ opacity: [0, 0, 0.8, 0] }}
                      transition={{
                        duration: 1.4,
                        times: [0, 0.5, 0.7, 0.9],
                      }}
                    />
                  </motion.div>
                </div>

                {/* Loading text + progress */}
                <div className="mt-3 flex flex-col items-center gap-2">
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="text-sm font-medium text-gray-500"
                  >
                    Verifying payment
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      ...
                    </motion.span>
                  </motion.p>
                  <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-neutral-800"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: 1.3,
                        ease: [0.23, 1, 0.32, 1],
                        delay: 0.15,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {viewState === "success" && (
              <motion.div
                key="success-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT_QUAD }}
                className="mt-4 flex w-full flex-col items-center border-t border-gray-100 py-10"
              >
                {/* Success checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    duration: 0.5,
                    bounce: 0.35,
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      bounce: 0.5,
                      delay: 0.15,
                    }}
                  >
                    <IconCheck className="text-emerald-600" size={32} />
                  </motion.div>
                </motion.div>

                {/* Success text */}
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.2,
                    ease: EASE_OUT_QUAD,
                  }}
                  className="mt-4 text-base font-semibold text-gray-800"
                >
                  Card Added Successfully
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.2 }}
                  className="mt-1 text-sm text-gray-400"
                >
                  +${selectedAmount?.toLocaleString()} added to wallet
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default WalletAddCard;
