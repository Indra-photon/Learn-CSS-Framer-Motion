"use client";

/* Gallery for the twelve orbital loaders. Two controls: ground (light/dark)
 * because loaders live on both, and size, because a loader that sings at
 * 48px can fall apart at 16px — every variant should survive both. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LOADERS,
  CometLoader,
  DiffuseLoader,
  AtomLoader,
  EclipseLoader,
} from "./Loaders";
import { SIZES } from "./sizes";


type Size = (typeof SIZES)[number];

export default function LoaderGallery({
  initialDark = true,
  initialSize = 96,
}: {
  initialDark?: boolean;
  initialSize?: Size;
}) {
  const [dark, setDark] = useState(initialDark);
  const [size, setSize] = useState<Size>(initialSize);

  return (
    <div
      className={cn(
        "min-h-dvh px-6 py-12 transition-colors duration-300 sm:px-10",
        dark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900",
      )}
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-50">
              loaders / orbital
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Fourteen ways to wait
            </h1>
            <p className="mt-2 max-w-md text-sm opacity-60">
              Small 3D orbital scenes: tilted planes in preserve-3d, gradient
              spheres that face the camera, trails that foreshorten, Kepler
              easing. Pure CSS, composited properties only.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Segmented
              value={size}
              options={SIZES.map((s) => ({ value: s, label: `${s}` }))}
              onChange={setSize}
              dark={dark}
            />
            <Segmented
              value={dark ? "dark" : "light"}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
              onChange={(v) => setDark(v === "dark")}
              dark={dark}
            />
          </div>
        </header>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LOADERS.map(({ id, name, note, Component }, i) => (
            <li
              key={id}
              className={cn(
                "flex flex-col rounded-2xl border p-5",
                dark
                  ? "border-neutral-800 bg-neutral-900/60"
                  : "border-neutral-200 bg-white",
              )}
            >
              <div className="flex h-44 items-center justify-center">
                <Component size={size} label={`${name} loader`} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-[11px] tabular-nums opacity-40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed opacity-55">{note}</p>
            </li>
          ))}
        </ul>

        {/* div, not section: globals.css gives every <section> a 100vh centred grid. */}
        <div className="mt-16 border-t border-current/10 pt-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-50">
            In context
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <InlineDemo dark={dark} label="Thinking…">
              <CometLoader size={20} />
            </InlineDemo>
            <InlineDemo dark={dark} label="Indexing 1,204 files">
              <DiffuseLoader size={20} />
            </InlineDemo>
            <InlineDemo dark={dark} label="Running agent">
              <AtomLoader size={20} />
            </InlineDemo>
            <InlineDemo dark={dark} label="Syncing">
              <EclipseLoader size={20} />
            </InlineDemo>
          </div>
        </div>
      </div>
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  dark,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  dark: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "flex rounded-full border p-0.5",
        dark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white",
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs tabular-nums transition-colors",
              on
                ? dark
                  ? "bg-neutral-100 text-neutral-900"
                  : "bg-neutral-900 text-neutral-50"
                : "opacity-60 hover:opacity-100",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function InlineDemo({
  dark,
  label,
  children,
}: {
  dark: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-3 text-sm",
        dark ? "border-neutral-800 bg-neutral-900/60" : "border-neutral-200 bg-white",
      )}
    >
      {children}
      <span className="opacity-80">{label}</span>
    </div>
  );
}
