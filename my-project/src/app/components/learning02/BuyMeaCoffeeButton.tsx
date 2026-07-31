"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  QrCodeIcon,
  CreditCardIcon,
  Apple01Icon,
  AmazonIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  SquareLock01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Add01Icon,
  Wallet01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";

const AMOUNT = "$5.00";

// A step is either one of the payment methods or the connect-wallet screen.
type MethodStep = "qr" | "card" | "apple" | "amazon";
type Step = MethodStep | "connect-wallet";
type Status = "idle" | "loading" | "success";

const METHODS: { id: MethodStep; label: string; icon: typeof QrCodeIcon }[] = [
  { id: "qr", label: "QR code", icon: QrCodeIcon },
  { id: "card", label: "Card", icon: CreditCardIcon },
  { id: "apple", label: "Apple Pay", icon: Apple01Icon },
  { id: "amazon", label: "Amazon Pay", icon: AmazonIcon },
];

// ─── Theme-morph-style shell timing (mirrors ThemeMorphMenu) ───────────────────
const SHELL_ID = "buy-coffee-shell";
// ease-out-cubic: content is entering/exiting, so it should feel instant then settle.
const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
// Apple-style springs: the shell grows (bigger, longer travel) so expand is slower
// with a touch of life; collapse is ~30% faster with no bounce.
const EXPAND_SPRING = { type: "spring", duration: 0.25, bounce: 0.05 } as const;
const COLLAPSE_SPRING = { type: "spring", duration: 0.2, bounce: 0 } as const;
// Content crossfade for the open morph.
const CONTENT_IN = { duration: 0.18, type: "spring", bounce: 0.1 } as const;
const CONTENT_OUT = { duration: 0.15, type: "spring", bounce: 0.1 } as const;

// Step enter/exit — the same scale + blur crossfade the method panels used.
const STEP_INITIAL = { opacity: 0, scale: 0.96, filter: "blur(4px)" } as const;
const STEP_ANIMATE = {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
  transition: { type: "spring", duration: 0.18, bounce: 0 },
} as const;
const STEP_EXIT = {
  opacity: 0,
  scale: 0.96,
  filter: "blur(4px)",
  transition: { duration: 0.12, ease: "easeOut" },
} as const;

// Wallets shown on the Connect Wallet screen. Brand marks are approximated with
// coloured tiles + emoji (no external assets).
const WALLETS: {
  id: string;
  name: string;
  emoji?: string;
  bg: string;
  badge?: string;
  icon?: typeof QrCodeIcon;
}[] = [
  { id: "metamask", name: "MetaMask", emoji: "🦊", bg: "#ffffff" },
  { id: "base", name: "Base", bg: "#0000ff" },
  { id: "phantom", name: "Phantom", emoji: "👻", bg: "#ab9ff2" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈", bg: "#174299" },
  {
    id: "other",
    name: "Other Wallets",
    bg: "#000000",
    badge: "350+",
    icon: MoreHorizontalIcon,
  },
];

// ─── Small shared pieces ──────────────────────────────────────────────────────

function Spinner({
  size = 20,
  color = "rgba(255,255,255,0.65)",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <>
      <style>{`
        @keyframes bmc-spinner-fade {
          0%   { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
      <div style={{ width: size, height: size, position: "relative" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "-3.9%",
              left: "-10%",
              width: "24%",
              height: "8%",
              borderRadius: 6,
              background: color,
              transform: `rotate(${i * 30}deg) translate(146%)`,
              animation: `bmc-spinner-fade 1.2s linear infinite`,
              animationDelay: `${-1.2 + i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-wide text-[#8e8e93] uppercase">
        {label}
      </span>
      <input
        placeholder={placeholder}
        className="h-10 rounded-lg border border-[#2c2c2e] bg-[#111113] px-3 text-sm text-white transition-colors outline-none placeholder:text-[#5a5a5f] focus:border-[#2090ff]"
      />
    </label>
  );
}

function IconButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: typeof QrCodeIcon;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-[#2c2c2e] text-[#8e8e93] transition-colors hover:bg-white/10 hover:text-white"
    >
      <HugeiconsIcon icon={icon} size={16} />
    </button>
  );
}

// The method-selector row. The active pill morphs via the shared layoutId.
function MethodTabs({
  current,
  onSelect,
}: {
  current: MethodStep;
  onSelect: (m: MethodStep) => void;
}) {
  return (
    <div className="flex gap-2">
      {METHODS.map((m) => {
        const selected = m.id === current;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            aria-label={m.label}
            aria-pressed={selected}
            className="relative flex h-12 flex-1 items-center justify-center rounded-xl border border-[#2c2c2e] bg-[#111113] transition-colors hover:bg-[#1a1a1c]"
          >
            {selected && (
              <motion.div
                layoutId="method-highlight"
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                className="absolute inset-0 rounded-xl"
              />
            )}
            <HugeiconsIcon
              icon={m.icon}
              size={20}
              className={
                selected ? "relative text-white" : "relative text-[#8e8e93]"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

// The pay button — every payment step renders one, all sharing layoutId
// "pay-action" so it morphs across steps and across idle → loading → success.
function PayButton({
  status,
  label,
  onPay,
}: {
  status: Status;
  label: string;
  onPay: () => void;
}) {
  return (
    <div className="mt-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "idle" && (
          <motion.button
            key="idle-action"
            layoutId="pay-action"
            onClick={onPay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.18 }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2090ff] text-sm font-semibold text-white transition-colors hover:bg-[#1a7fe0]"
          >
            <HugeiconsIcon icon={SquareLock01Icon} size={15} />
            {label}
          </motion.button>
        )}

        {status === "loading" && (
          <motion.div
            key="loading-action"
            layoutId="pay-action"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#2090ff] text-sm font-semibold text-white"
          >
            <Spinner size={16} color="rgba(255,255,255,0.9)" />
            Processing payment…
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success-action"
            layoutId="pay-action"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-xl bg-[#2090ff] py-4 text-white"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={26}
              className="text-white"
            />
            <p className="text-sm font-semibold">Payment received!</p>
            <p className="text-xs text-white/80">Thanks for the coffee ☕</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Divider + "Connect Wallet" button. The button shares layoutId "wallet-action"
// with the "Create a New Wallet" button on the connect-wallet step.
function ConnectWalletCta({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="mt-4">
      {/* layout so the divider glides to its new position when the panel above
          resizes on method switch — matching the layoutId buttons. */}
      <motion.div
        layout="position"
        transition={{ type: "spring", bounce: 0, duration: 0.18 }}
        className="flex items-center gap-3"
      >
        <span className="h-px flex-1 bg-[#2c2c2e]" />
        <span className="text-xs font-medium text-[#8e8e93]">OR</span>
        <span className="h-px flex-1 bg-[#2c2c2e]" />
      </motion.div>
      <motion.button
        layoutId="wallet-action"
        onClick={onConnect}
        transition={{ type: "spring", bounce: 0, duration: 0.18 }}
        style={{ borderRadius: 12 }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 border border-[#2c2c2e] bg-[#151517] text-sm font-semibold text-white transition-colors hover:bg-[#1a1a1c]"
      >
        <HugeiconsIcon icon={Wallet01Icon} size={16} />
        Connect Wallet
      </motion.button>
    </div>
  );
}

// ─── Method panels — only the panel changes between methods ───────────────────

function QrPanel() {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center gap-4">
      <div className="rounded-2xl bg-white p-3">
        <Image
          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://buymeacoffee.com&bgcolor=ffffff&color=000000&margin=0"
          alt="Payment QR code"
          width={168}
          height={168}
          className="rounded-lg"
          unoptimized
        />
      </div>
      <p className="text-sm text-[#8e8e93]">
        Scan with any payments app to pay {AMOUNT}
      </p>
    </div>
  );
}

function CardPanel() {
  return (
    <div className="flex min-h-[160px] flex-col justify-center gap-3.5 px-1">
      <Field label="Card number" placeholder="1234 5678 9012 3456" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Expiry" placeholder="MM / YY" />
        <Field label="CVC" placeholder="123" />
      </div>
    </div>
  );
}

function ApplePanel() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-4">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-[#2c2c2e] bg-[#111113]">
        <HugeiconsIcon icon={Apple01Icon} size={30} className="text-white" />
      </div>
      <div className="w-full rounded-xl border border-[#2c2c2e] bg-[#111113] px-3.5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8e8e93]">Apple Card</span>
          <span className="text-sm font-medium text-white">•••• 4242</span>
        </div>
      </div>
      <p className="text-center text-sm text-[#8e8e93]">
        Double-click the side button to pay {AMOUNT}.
      </p>
    </div>
  );
}

function AmazonPanel() {
  return (
    <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-[#2c2c2e] bg-[#111113]">
        <HugeiconsIcon icon={AmazonIcon} size={30} className="text-white" />
      </div>
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-[#2c2c2e] bg-[#111113] px-3.5 py-2.5">
          <span className="text-sm text-[#8e8e93]">Account</span>
          <span className="text-sm font-medium text-white">indra@acme.com</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#2c2c2e] bg-[#111113] px-3.5 py-2.5">
          <span className="text-sm text-[#8e8e93]">Gift card balance</span>
          <span className="text-sm font-medium text-white">$12.40</span>
        </div>
      </div>
      <p className="text-center text-sm text-[#8e8e93]">
        Pay {AMOUNT} with your Amazon account.
      </p>
    </div>
  );
}

// The one place that changes between methods.
function MethodPanel({ method }: { method: MethodStep }) {
  switch (method) {
    case "qr":
      return <QrPanel />;
    case "card":
      return <CardPanel />;
    case "apple":
      return <ApplePanel />;
    case "amazon":
      return <AmazonPanel />;
    default:
      return null;
  }
}

// ─── Payment screen — ONE component for all four methods, so the header, tabs,
//     pay button, and connect-wallet CTA are the same persistent DOM across
//     methods (they never re-mount). Only the panel crossfades. ───────────────

type PaymentStepProps = {
  status: Status;
  onSelect: (m: MethodStep) => void;
  onPay: () => void;
  onConnect: () => void;
  onClose: () => void;
};

function PaymentScreen({
  method,
  status,
  onSelect,
  onPay,
  onConnect,
  onClose,
}: PaymentStepProps & { method: MethodStep }) {
  const label = method === "qr" ? `Pay ${AMOUNT} manually` : `Pay ${AMOUNT}`;
  return (
    <>
      {/* Header — fixed across methods */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Buy me a coffee</h2>
          <p className="mt-0.5 text-sm text-[#8e8e93]">Support with {AMOUNT}</p>
        </div>
        <IconButton onClick={onClose} label="Close" icon={Cancel01Icon} />
      </div>

      {/* Tabs + panel — only while idle. Tabs are fixed; only the panel swaps. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "idle" && (
          <motion.div
            key="method-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", bounce: 0, duration: 0.18 }}
            className="flex flex-col"
          >
            <MethodTabs current={method} onSelect={onSelect} />
            <div className="relative mt-4">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={method}
                  initial={STEP_INITIAL}
                  animate={STEP_ANIMATE}
                  exit={STEP_EXIT}
                >
                  <MethodPanel method={method} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay button — fixed (persists through idle → loading → success) */}
      <PayButton status={status} label={label} onPay={onPay} />

      {/* Divider + Connect Wallet — fixed, only while idle */}
      <AnimatePresence initial={false}>
        {status === "idle" && (
          <motion.div
            key="connect-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <ConnectWalletCta onConnect={onConnect} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ConnectWalletScreen({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header — back / title / close */}
      <div className="mb-4 flex items-center justify-between">
        <IconButton onClick={onBack} label="Back" icon={ArrowLeft01Icon} />
        <h2 className="text-lg font-semibold text-white">Connect Wallet</h2>
        <IconButton onClick={onClose} label="Close" icon={Cancel01Icon} />
      </div>

      {/* Wallet list */}
      <div className="flex flex-col gap-2">
        {WALLETS.map((w) => (
          <button
            key={w.id}
            className="flex items-center gap-3 rounded-xl border border-[#2c2c2e] bg-[#151517] px-3 py-2.5 text-left transition-colors hover:bg-[#1a1a1c]"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg leading-none"
              style={{ background: w.bg }}
            >
              {w.icon ? (
                <HugeiconsIcon icon={w.icon} size={18} className="text-white" />
              ) : (
                w.emoji
              )}
            </span>
            <span className="flex-1 text-[15px] font-semibold text-white">
              {w.name}
            </span>
            {w.badge && (
              <span className="rounded-full bg-[#2c2c2e] px-2 py-0.5 text-xs font-medium text-[#8e8e93]">
                {w.badge}
              </span>
            )}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              className="text-[#5a5a5f]"
            />
          </button>
        ))}
      </div>

      {/* Create a new wallet — morphs from the Connect Wallet button */}
      <motion.button
        layoutId="wallet-action"
        transition={{ type: "spring", bounce: 0, duration: 0.18 }}
        style={{ borderRadius: 9999 }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 bg-[#2090ff] text-sm font-semibold text-white transition-colors hover:bg-[#1a7fe0]"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        Create a New Wallet
      </motion.button>
    </>
  );
}

// Routes a step to its screen. All payment methods route to the SAME
// PaymentScreen (only the `method` prop differs), so its chrome never re-mounts.
const DialogContent = ({
  step,
  status,
  onSelect,
  onPay,
  onConnect,
  onBack,
  onClose,
}: {
  step: Step;
  status: Status;
  onSelect: (m: MethodStep) => void;
  onPay: () => void;
  onConnect: () => void;
  onBack: () => void;
  onClose: () => void;
}) => {
  if (step === "connect-wallet") {
    return <ConnectWalletScreen onBack={onBack} onClose={onClose} />;
  }
  return (
    <PaymentScreen
      method={step}
      status={status}
      onSelect={onSelect}
      onPay={onPay}
      onConnect={onConnect}
      onClose={onClose}
    />
  );
};

function BuyMeaCoffeeButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("qr");
  const [status, setStatus] = React.useState<Status>("idle");
  // offsetSize uses offsetHeight (layout height) so the measurement isn't thrown
  // off by the scale transform Framer applies during the card's open morph.
  const [bodyRef, { height }] = useMeasure({ offsetSize: true });
  const shouldReduceMotion = useReducedMotion();
  // Gate the body height tween until the card's open morph finishes.
  const [opened, setOpened] = React.useState(false);
  // Which payment step to return to from the wallet screen.
  const prevPayStep = React.useRef<MethodStep>("qr");

  const shellTransition = shouldReduceMotion
    ? { duration: 0 }
    : isOpen
      ? EXPAND_SPRING
      : COLLAPSE_SPRING;
  const contentIn = shouldReduceMotion ? { duration: 0 } : CONTENT_IN;
  const contentOut = shouldReduceMotion ? { duration: 0 } : CONTENT_OUT;

  const selectMethod = (m: MethodStep) => setStep(m);
  const goToWallet = () => {
    if (step !== "connect-wallet") prevPayStep.current = step;
    setStep("connect-wallet");
  };
  const goBack = () => setStep(prevPayStep.current);

  const close = () => {
    setIsOpen(false);
    setOpened(false);
    setTimeout(() => {
      setStep("qr");
      setStatus("idle");
    }, 300);
  };

  const handlePay = () => {
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1500);
    setTimeout(close, 3200);
  };

  return (
    <div className="flex h-screen items-center justify-center">
      {/* ---------- COLLAPSED (button) ---------- */}
      <AnimatePresence mode="popLayout">
        {!isOpen && (
          <motion.div
            key="collapsed"
            layoutId={SHELL_ID}
            role="button"
            onClick={() => setIsOpen(true)}
            transition={shellTransition}
            style={{ borderRadius: 10 }}
            className="flex h-9 cursor-pointer items-center gap-2 overflow-hidden border border-[#2c2c2e] bg-[#1c1c1e] px-3 text-sm font-medium text-white shadow-md select-none"
          >
            <motion.div
              layout="position"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: contentOut }}
              transition={contentIn}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <HugeiconsIcon icon={CreditCardIcon} size={16} />
              <span>Buy me a coffee</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- EXPANDED (card) ---------- */}
      <AnimatePresence mode="popLayout">
        {isOpen && (
          <motion.div
            key="expanded"
            layoutId={SHELL_ID}
            transition={shellTransition}
            onLayoutAnimationComplete={() => setOpened(true)}
            style={{ borderRadius: 20 }}
            className="w-[340px] overflow-hidden border border-[#2c2c2e] bg-[#1c1c1e] p-5 shadow-2xl"
          >
            {/* Content comes in with the open morph (layout="position" keeps it
                from distorting; it blurs + scales in). */}
            <motion.div
              layout="position"
              initial={{ opacity: 0, filter: "blur(6px)", scale: 0.98 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{
                opacity: 0,
                filter: "blur(6px)",
                scale: 0.98,
                transition: contentOut,
              }}
              transition={contentIn}
            >
              {/* Body height animates to fit whichever step/status is shown */}
              <motion.div
                animate={{
                  height:
                    shouldReduceMotion || !opened ? "auto" : height || "auto",
                }}
                transition={{ type: "spring", duration: 0.18, bounce: 0 }}
                className="overflow-hidden"
              >
                {/* relative so the outgoing (popLayout → absolute) step sits over
                    the incoming one while they crossfade */}
                <div ref={bodyRef} className="relative">
                  {/* Keyed by screen, not by method — so switching payment
                      methods keeps the same PaymentScreen mounted (fixed header /
                      tabs / pay button / connect CTA) and only the panel swaps. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={step === "connect-wallet" ? "wallet" : "pay"}
                      initial={STEP_INITIAL}
                      animate={STEP_ANIMATE}
                      exit={STEP_EXIT}
                      className="w-full"
                    >
                      <DialogContent
                        step={step}
                        status={status}
                        onSelect={selectMethod}
                        onPay={handlePay}
                        onConnect={goToWallet}
                        onBack={goBack}
                        onClose={close}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BuyMeaCoffeeButton;
