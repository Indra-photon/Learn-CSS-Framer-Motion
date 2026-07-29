"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Shared tokens                                                              */
/*                                                                            */
/*  Each variant below uses a DIFFERENT animation technique (noted inline):    */
/*   1  scale + opacity fade             7  spring scale settle (iOS)          */
/*   2  filter blur focus-in            9  clip-path vertical unroll           */
/*   4  spring overshoot slam          10  clip-path center curtain            */
/* -------------------------------------------------------------------------- */

type VariantProps = { trigger?: ReactNode };

/** Popup positioning box. `group` lets inner wrappers react to state attrs. */
const box =
  "group fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2";

/** Backdrop: plain opacity fade (shared — the popups carry the character). */
function fade(bg: string) {
  return `fixed inset-0 z-40 ${bg} transition-opacity duration-300 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0`;
}

/** Spring-ish overshoot easing (back-out). */
const spring = "[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]";

/* -------------------------------------------------------------------------- */
/*  Variant 1 — clip-path circular IRIS reveal                                 */
/* -------------------------------------------------------------------------- */

function Variant1({ trigger }: VariantProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700">
        {trigger ?? "variant-1"}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={fade("bg-black/30 backdrop-blur-[2px]")} />
        <AlertDialog.Popup
          className={`${box} rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl transition-all duration-200 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0`}
        >
          <AlertDialog.Title className="text-lg font-semibold text-neutral-900">
            Discard changes?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-neutral-500">
            Your edits haven&apos;t been saved. If you leave now, everything you
            typed will be lost.
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100">
              Keep editing
            </AlertDialog.Close>
            <AlertDialog.Close className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700">
              Discard
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant 2 — filter BLUR focus-in                                          */
/* -------------------------------------------------------------------------- */

function Variant2({ trigger }: VariantProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20">
        {trigger ?? "variant-2"}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={fade("bg-slate-950/50 backdrop-blur-md")} />
        <AlertDialog.Popup
          className={`${box} overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl [transition:filter_400ms_ease,opacity_400ms_ease] [filter:blur(0px)] data-[starting-style]:opacity-0 data-[starting-style]:[filter:blur(16px)] data-[ending-style]:opacity-0 data-[ending-style]:[filter:blur(16px)]`}
        >
          <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-sky-500/30 blur-3xl" />
          <AlertDialog.Title className="relative text-lg font-semibold text-white">
            End your session?
          </AlertDialog.Title>
          <AlertDialog.Description className="relative mt-2 text-sm leading-relaxed text-white/70">
            You&apos;ll be signed out on this device and any unsaved drafts will
            stay in the cloud.
          </AlertDialog.Description>
          <div className="relative mt-6 flex justify-end gap-3">
            <AlertDialog.Close className="rounded-full px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 transition hover:bg-white/10">
              Stay
            </AlertDialog.Close>
            <AlertDialog.Close className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90">
              Sign out
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant 4 — spring OVERSHOOT slam (back-out easing, drops + bounces)       */
/* -------------------------------------------------------------------------- */

function Variant4({ trigger }: VariantProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="border-[3px] border-black bg-yellow-300 px-4 py-2 text-sm font-black uppercase tracking-tight text-black shadow-[4px_4px_0_0_#000] transition active:translate-x-1 active:translate-y-1 active:shadow-none">
        {trigger ?? "variant-4"}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={fade("bg-black/50")} />
        <AlertDialog.Popup
          className={`${box} transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0`}
        >
          <div
            className={`border-[3px] border-black bg-[#f5f0e8] p-6 shadow-[8px_8px_0_0_#000] [transition:transform_500ms] ${spring} group-data-[starting-style]:[transform:scale(0.4)_translateY(-40px)] group-data-[ending-style]:[transform:scale(0.9)]`}
          >
            <AlertDialog.Title className="text-xl font-black uppercase text-black">
              Are you sure?!
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm font-semibold text-black/70">
              Once you hit that button there&apos;s no going back. No takesies
              backsies.
            </AlertDialog.Description>
            <div className="mt-6 flex gap-3">
              <AlertDialog.Close className="flex-1 border-[3px] border-black bg-white px-4 py-2 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] transition active:translate-x-1 active:translate-y-1 active:shadow-none">
                Nope
              </AlertDialog.Close>
              <AlertDialog.Close className="flex-1 border-[3px] border-black bg-lime-400 px-4 py-2 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] transition active:translate-x-1 active:translate-y-1 active:shadow-none">
                Do it!
              </AlertDialog.Close>
            </div>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant 7 — spring SCALE settle (iOS zoom-in with overshoot)               */
/* -------------------------------------------------------------------------- */

function Variant7({ trigger }: VariantProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
        {trigger ?? "variant-7"}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={fade("bg-black/40")} />
        <AlertDialog.Popup className="group fixed left-1/2 top-1/2 z-50 w-[270px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0">
          <div
            className={`overflow-hidden rounded-[14px] bg-white/80 text-center shadow-xl backdrop-blur-xl [transition:transform_350ms] ${spring} group-data-[starting-style]:[transform:scale(1.18)] group-data-[ending-style]:[transform:scale(0.92)]`}
          >
            <div className="px-4 pt-5 pb-4">
              <AlertDialog.Title className="text-[17px] font-semibold text-neutral-900">
                Allow Location Access
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-1 text-[13px] leading-snug text-neutral-600">
                This lets the app show nearby results while you use it.
              </AlertDialog.Description>
            </div>
            <div className="flex flex-col divide-y divide-neutral-300/70 border-t border-neutral-300/70 text-[17px] text-blue-500">
              <AlertDialog.Close className="py-2.5 transition active:bg-black/5">
                Don&apos;t Allow
              </AlertDialog.Close>
              <AlertDialog.Close className="py-2.5 font-semibold transition active:bg-black/5">
                Allow
              </AlertDialog.Close>
            </div>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant 9 — clip-path VERTICAL unroll (opens from center line, CRT-style)  */
/* -------------------------------------------------------------------------- */

function Variant9({ trigger }: VariantProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="rounded-sm border border-green-500/50 bg-black px-4 py-2 font-mono text-sm text-green-400 transition hover:bg-green-500/10">
        {trigger ?? "variant-9"}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={fade("bg-black/80")} />
        <AlertDialog.Popup
          className={`${box} overflow-hidden rounded-md border border-green-500/40 bg-[#0a0f0a] font-mono shadow-[0_0_40px_-10px] shadow-green-500/40 [transition:clip-path_350ms_cubic-bezier(0.76,0,0.24,1),opacity_150ms] [clip-path:inset(0_0_0_0)] data-[starting-style]:opacity-40 data-[starting-style]:[clip-path:inset(50%_0_50%_0)] data-[ending-style]:opacity-40 data-[ending-style]:[clip-path:inset(50%_0_50%_0)]`}
        >
          <div className="flex items-center gap-2 border-b border-green-500/20 px-4 py-2 text-xs text-green-500/60">
            <span className="size-2.5 rounded-full bg-red-500/70" />
            <span className="size-2.5 rounded-full bg-yellow-500/70" />
            <span className="size-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2">root@system: ~/danger</span>
          </div>
          <div className="p-5">
            <AlertDialog.Title className="text-sm text-green-400">
              <span className="text-green-600">$</span> sudo rm -rf /production
              <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-green-400" />
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-xs leading-relaxed text-green-500/60">
              <span className="text-red-400">[WARN]</span> This operation will
              wipe 1,204 records. Type-safe confirmation required.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2 text-xs">
              <AlertDialog.Close className="rounded-sm border border-green-500/30 px-3 py-1.5 text-green-400 transition hover:bg-green-500/10">
                [esc] abort
              </AlertDialog.Close>
              <AlertDialog.Close className="rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-red-400 transition hover:bg-red-500/20">
                [y] execute
              </AlertDialog.Close>
            </div>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant 10 — clip-path CENTER curtain (opens horizontally from middle)      */
/* -------------------------------------------------------------------------- */

function Variant10({ trigger }: VariantProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="border border-neutral-900 px-5 py-2 text-sm tracking-wide text-neutral-900 transition hover:bg-neutral-900 hover:text-white">
        {trigger ?? "variant-10"}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={fade("bg-stone-900/30")} />
        <AlertDialog.Popup
          className={`${box} border border-stone-300 bg-[#faf8f4] p-8 shadow-2xl [transition:clip-path_600ms_cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(0_0_0_0)] data-[starting-style]:[clip-path:inset(0_50%_0_50%)] data-[ending-style]:[clip-path:inset(0_50%_0_50%)]`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
            Confirmation
          </p>
          <AlertDialog.Title className="mt-3 font-serif text-2xl leading-tight text-stone-900">
            Cancel your subscription?
          </AlertDialog.Title>
          <div className="my-4 h-px w-12 bg-stone-300" />
          <AlertDialog.Description className="font-serif text-[15px] leading-relaxed text-stone-600">
            Your access continues until the end of the billing period. After
            that, premium features will no longer be available.
          </AlertDialog.Description>
          <div className="mt-7 flex items-center justify-between">
            <AlertDialog.Close className="text-sm tracking-wide text-stone-500 underline-offset-4 transition hover:text-stone-900 hover:underline">
              Never mind
            </AlertDialog.Close>
            <AlertDialog.Close className="bg-stone-900 px-5 py-2 text-sm tracking-wide text-white transition hover:bg-stone-700">
              Confirm cancellation
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  Showcase                                                                    */
/* -------------------------------------------------------------------------- */

const VARIANTS = [
  { n: 1, Component: Variant1 },
  { n: 2, Component: Variant2 },
  { n: 4, Component: Variant4 },
  { n: 7, Component: Variant7 },
  { n: 9, Component: Variant9 },
  { n: 10, Component: Variant10 },
];

export default function AlertDialogVariants() {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Alert Dialog — variants
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Base UI · each uses a different animation technique
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
        {VARIANTS.map(({ n, Component }) => (
          <Component key={n} trigger={`variant-${n}`} />
        ))}
      </div>
    </div>
  );
}

export { Variant1, Variant2, Variant4, Variant7, Variant9, Variant10 };
