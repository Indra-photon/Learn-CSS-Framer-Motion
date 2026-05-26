"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet01Icon,
  Key01Icon,
  Download03Icon,
  TelegramIcon,
  EyeIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Bitcoin03Icon,
} from "@hugeicons/core-free-icons";

type Step = 0 | 1 | 2;

const spring = { type: "spring" as const, stiffness: 260, damping: 26 };

const steps = [
  {
    title: "A better way to login",
    description:
      "With modern apps, your wallet can be used as an easy way to login, instead of having to remember a password.",
  },
  {
    title: "For your assets",
    description:
      "Wallets let you send, receive, store, and interact with digital assets like NFTs and other Ethereum tokens.",
  },
  {
    title: "Explore the web3",
    description:
      "Your wallet is an essential utility that lets you explore and participate in the fast evolving world of web3.",
  },
];

export default function AboutWallets() {
  const [step, setStep] = useState<Step>(0);

  const next = () => setStep((s) => (((s as number) + 1) % 3) as Step);
  const prev = () => setStep((s) => (((s as number) - 1 + 3) % 3) as Step);

  const fadeT = { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const };

  const getStepVisual = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            layoutId="outside-wrapper-div"
            key="step-assets"
            className="absolute inset-0 flex items-center justify-center"
          >
            <AnimatePresence>
              <motion.div
                className="-mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full"
                style={{
                  background: "#6C62FF",
                  transformOrigin: "right center",
                }}
                initial={{ scale: 0, opacity: 0, rotate: 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 90 }}
                transition={{ ...spring, delay: 0.12 }}
              >
                <HugeiconsIcon icon={Download03Icon} size={26} color="white" />
              </motion.div>
            </AnimatePresence>

            <motion.div
              layoutId="wallet-div-step-0"
              className="z-10 flex h-[90px] w-[90px] items-center justify-center bg-gray-900"
              style={{ borderRadius: "105px" }}
              transition={{ ...spring }}
            >
              <motion.div
                layoutId="wallet-icon"
                transition={{ ...spring, duration: 0.18, delay: 0.12 }}
              >
                <HugeiconsIcon icon={Wallet01Icon} size={56} color="white" />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              <motion.div
                className="-ml-3 flex h-[60px] w-[60px] items-center justify-center rounded-full"
                style={{
                  background: "#3DA9FF",
                  transformOrigin: "left center",
                }}
                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: -90 }}
                transition={{ ...spring, delay: 0.12 }}
              >
                <HugeiconsIcon icon={TelegramIcon} size={26} color="white" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            layoutId="outside-wrapper-div"
            key="step-login"
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* pill — plain div, no opacity, stays visible while children animate */}
            <motion.div
              layoutId="wallet-div-step-0"
              className="z-10 flex w-3/4 items-center gap-2 bg-stone-100 px-4 py-2.5"
              style={{ borderRadius: "18px" }}
              transition={{ ...spring }}
            >
              <motion.div layoutId="wallet-icon">
                <HugeiconsIcon
                  icon={Wallet01Icon}
                  size={20}
                  className="text-stone-800"
                />
              </motion.div>
              {/* text — fades independently */}
              <motion.span
                className="text-[16px] font-medium tracking-wide text-stone-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeT}
              >
                0x8dA6 ···· 6045
              </motion.span>
            </motion.div>

            {/* key — fades independently */}
            <AnimatePresence>
              <motion.div
                className="absolute top-10 right-5 z-30"
                initial={{
                  scale: 0.5,
                  opacity: 0,
                  filter: "blur(3px)",
                  rotate: 120,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                  rotate: 1,
                }}
                exit={{
                  scale: 0.5,
                  opacity: 0,
                  filter: "blur(3px)",
                  rotate: 120,
                }}
                transition={{ ...spring, duration: 0.15, delay: 0.18 }}
                style={{ transformOrigin: "top center" }}
                layoutId="icon-telegram"
              >
                <HugeiconsIcon icon={Key01Icon} size={85} color="#c8c8c8" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            layoutId="outside-wrapper-div"
            key="step-web3"
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              layoutId="wallet-div-step-0"
              className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden bg-stone-100"
              style={{ borderRadius: "105px" }}
              transition={{ ...spring }}
            >
              <motion.div layoutId="wallet-icon">
                <HugeiconsIcon
                  icon={Bitcoin03Icon}
                  size={56}
                  color="text-stone-100"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e8ea]">
      <motion.div
        layout
        transition={spring}
        className="flex h-[520px] w-[350px] flex-col justify-between overflow-visible rounded-[28px] bg-neutral-200 p-2 shadow-xl select-none"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-1 pt-5 pb-2">
          <button
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300 text-stone-900 transition-colors hover:text-gray-600"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          </button>
          <span className="text-[18px] font-semibold tracking-[-0.01em] text-gray-800">
            About Wallets
          </span>
          <button
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300 text-stone-900 transition-colors hover:text-gray-600"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </button>
        </div>

        {/* ── Visual area ── */}
        <motion.div
          layout
          transition={spring}
          className="rounded-2xl bg-white p-3"
        >
          <div className="relative flex h-44 items-center justify-center overflow-visible">
            {getStepVisual()}
          </div>

          {/* ── Text ── */}
          <div className="min-h-[96px] px-6 pt-1 pb-3 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <h2 className="mb-1.5 text-[28px] font-semibold tracking-[-0.01em] text-gray-900">
                  {steps[step].title}
                </h2>
                <p className="text-[16px] tracking-tight text-pretty text-gray-700">
                  {steps[step].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Progress dots ── */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[0, 1, 2].map((i) => (
              <motion.button
                key={i}
                onClick={() => setStep(i as Step)}
                className="cursor-pointer rounded-full bg-gray-300"
                animate={{
                  width: step === i ? 18 : 6,
                  backgroundColor: step === i ? "#3a3a3a" : "#d1d1d1",
                }}
                style={{ height: 6 }}
                transition={spring}
              />
            ))}
          </div>

          {/* ── Learn More ── */}
          <div className="px-4 pt-3 pb-4">
            <button
              onClick={next}
              className="flex w-full items-center justify-center gap-1 rounded-2xl bg-neutral-200 py-3.5 text-[16px] font-medium text-gray-800 transition-all hover:bg-gray-200 active:scale-[0.98]"
            >
              Learn More
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence, LayoutGroup } from "motion/react";
// import { HugeiconsIcon } from "@hugeicons/react";
// import {
//   Wallet01Icon,
//   Key01Icon,
//   Download03Icon,
//   TelegramIcon,
//   EyeIcon,
//   ArrowLeft01Icon,
//   Cancel01Icon,
// } from "@hugeicons/core-free-icons";

// type Step = 0 | 1 | 2;

// const spring = { type: "spring" as const, duration: 0.5, bounce: 0.15 };

// const steps = [
//   {
//     title: "A better way to login",
//     description:
//       "With modern apps, your wallet can be used as an easy way to login, instead of having to remember a password.",
//   },
//   {
//     title: "For your assets",
//     description:
//       "Wallets let you send, receive, store, and interact with digital assets like NFTs and other Ethereum tokens.",
//   },
//   {
//     title: "Explore the web3",
//     description:
//       "Your wallet is an essential utility that lets you explore and participate in the fast evolving world of web3.",
//   },
// ];

// function GlobeLines() {
//   return (
//     <svg
//       viewBox="0 0 112 112"
//       className="absolute inset-0 h-full w-full"
//       fill="none"
//     >
//       <ellipse
//         cx="56"
//         cy="56"
//         rx="30"
//         ry="54"
//         stroke="rgba(255,255,255,0.28)"
//         strokeWidth="1.5"
//       />
//       <ellipse
//         cx="56"
//         cy="56"
//         rx="12"
//         ry="54"
//         stroke="rgba(255,255,255,0.18)"
//         strokeWidth="1.5"
//       />
//       <ellipse
//         cx="56"
//         cy="38"
//         rx="50"
//         ry="13"
//         stroke="rgba(255,255,255,0.22)"
//         strokeWidth="1.5"
//       />
//       <ellipse
//         cx="56"
//         cy="74"
//         rx="50"
//         ry="13"
//         stroke="rgba(255,255,255,0.22)"
//         strokeWidth="1.5"
//       />
//       <circle
//         cx="56"
//         cy="56"
//         r="54"
//         stroke="rgba(255,255,255,0.15)"
//         strokeWidth="1.5"
//       />
//     </svg>
//   );
// }

// export default function AboutWallets() {
//   const [step, setStep] = useState<Step>(0);

//   const next = () => setStep((s) => (((s as number) + 1) % 3) as Step);
//   const prev = () => setStep((s) => (((s as number) - 1 + 3) % 3) as Step);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-[#e8e8ea]">
//       <motion.div
//         layout
//         transition={spring}
//         className="flex h-[520px] w-[350px] flex-col justify-between overflow-visible rounded-[28px] bg-neutral-200 p-2 shadow-xl select-none"
//       >
//         {/* ── Header ── */}
//         <div className="flex items-center justify-between px-1 pt-5 pb-2">
//           <button
//             onClick={prev}
//             className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300 text-stone-900 transition-colors hover:text-gray-600"
//           >
//             <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
//           </button>
//           <span className="text-[18px] font-semibold tracking-[-0.01em] text-gray-800">
//             About Wallets
//           </span>
//           <button className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300 text-stone-900 transition-colors hover:text-gray-600">
//             <HugeiconsIcon icon={Cancel01Icon} size={18} />
//           </button>
//         </div>

//         {/* ── Visual area ── */}
//         <motion.div
//           layout
//           transition={spring}
//           className="rounded-2xl bg-white p-3"
//         >
//           <div className="relative flex h-44 items-center justify-center overflow-visible rounded-xl">
//             <LayoutGroup id="wallet-card">
//               <AnimatePresence mode="popLayout">
//                 {/* ── State 0: Login ── */}
//                 {step === 0 && (
//                   <motion.div
//                     key="step-login"
//                     className="absolute inset-0 flex items-center justify-center"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
//                   >
//                     {/* address pill — fades with parent */}
//                     <div className="z-10 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
//                       {/* wallet icon — layoutId: wallet-icon, moves across states */}
//                       <motion.div layoutId="wallet-icon" transition={spring}>
//                         <HugeiconsIcon
//                           icon={Wallet01Icon}
//                           size={15}
//                           color="#888"
//                         />
//                       </motion.div>
//                       <span className="text-[13px] font-medium tracking-wide text-gray-600">
//                         0x8dA6 ···· 6045
//                       </span>
//                     </div>

//                     {/* key — fades with parent, rotation in animate */}
//                     <motion.div
//                       className="absolute top-4 right-6"
//                       initial={{ rotate: 0 }}
//                       animate={{ rotate: 30 }}
//                       exit={{ rotate: 0 }}
//                       transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
//                     >
//                       <HugeiconsIcon
//                         icon={Key01Icon}
//                         size={76}
//                         color="#c8c8c8"
//                       />
//                     </motion.div>
//                   </motion.div>
//                 )}

//                 {/* ── State 1: Assets ── */}
//                 {step === 1 && (
//                   <motion.div
//                     key="step-assets"
//                     className="absolute inset-0 flex items-center justify-center"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
//                   >
//                     {/* download — fades with parent, no layoutId */}
//                     <div
//                       className="-mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full"
//                       style={{ background: "#6C62FF" }}
//                     >
//                       <HugeiconsIcon
//                         icon={Download03Icon}
//                         size={26}
//                         color="white"
//                       />
//                     </div>

//                     {/* dark circle — fades with parent */}
//                     <div className="z-10 flex h-[90px] w-[90px] items-center justify-center rounded-full bg-gray-900">
//                       {/* wallet icon — layoutId: wallet-icon, moves across states */}
//                       <motion.div layoutId="wallet-icon" transition={spring}>
//                         <HugeiconsIcon
//                           icon={Wallet01Icon}
//                           size={56}
//                           color="white"
//                         />
//                       </motion.div>
//                     </div>

//                     {/* send — fades with parent, no layoutId */}
//                     <div
//                       className="-ml-3 flex h-[60px] w-[60px] items-center justify-center rounded-full"
//                       style={{ background: "#3DA9FF" }}
//                     >
//                       <HugeiconsIcon
//                         icon={TelegramIcon}
//                         size={26}
//                         color="white"
//                       />
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* ── State 2: Web3 ── */}
//                 {step === 2 && (
//                   <motion.div
//                     key="step-web3"
//                     className="absolute inset-0 flex items-center justify-center"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
//                   >
//                     <div className="relative">
//                       {/* globe — fades with parent, no layoutId */}
//                       <div
//                         className="relative h-[112px] w-[112px] overflow-hidden rounded-full"
//                         style={{
//                           background:
//                             "linear-gradient(150deg, #8B5CF6 0%, #60A5FA 100%)",
//                         }}
//                       >
//                         <GlobeLines />
//                       </div>

//                       {/* eye badge — fades with parent, no layoutId */}
//                       <div className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md">
//                         <HugeiconsIcon icon={EyeIcon} size={17} color="#333" />
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </LayoutGroup>
//           </div>

//           {/* ── Text ── */}
//           <div className="min-h-[96px] px-6 pt-1 pb-3 text-center">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={step}
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
//               >
//                 <h2 className="mb-1.5 text-[28px] font-semibold tracking-[-0.01em] text-gray-900">
//                   {steps[step].title}
//                 </h2>
//                 <p className="text-[16px] tracking-tight text-pretty text-gray-400">
//                   {steps[step].description}
//                 </p>
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           {/* ── Progress dots ── */}
//           <div className="flex items-center justify-center gap-1.5 py-2">
//             {[0, 1, 2].map((i) => (
//               <motion.button
//                 key={i}
//                 onClick={() => setStep(i as Step)}
//                 className="cursor-pointer rounded-full bg-gray-300"
//                 animate={{
//                   width: step === i ? 18 : 6,
//                   backgroundColor: step === i ? "#3a3a3a" : "#d1d1d1",
//                 }}
//                 style={{ height: 6 }}
//                 transition={{
//                   width: spring,
//                   backgroundColor: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
//                 }}
//               />
//             ))}
//           </div>

//           {/* ── Learn More ── */}
//           <div className="px-4 pt-3 pb-4">
//             <button
//               onClick={next}
//               className="flex w-full items-center justify-center gap-1 rounded-2xl bg-neutral-200 py-3.5 text-[16px] font-medium text-gray-800 transition-all hover:bg-gray-200 active:scale-[0.98]"
//             >
//               Learn More
//               <svg
//                 width="13"
//                 height="13"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M9 18l6-6-6-6" />
//               </svg>
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }
