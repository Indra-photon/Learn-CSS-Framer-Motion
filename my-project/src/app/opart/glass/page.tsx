"use client";

import Link from "next/link";
import SvgLoop from "../../components/opart/SvgLoop";
import { GLASS } from "../../components/opart/glass";

export default function GlassPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-14 text-neutral-100">
      <header className="mx-auto mb-12 max-w-6xl">
        <h1 className="text-2xl font-medium tracking-tight">Glass</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Twelve loops built from SVG filter primitives — no shaders and no
          canvas. Underneath most of them is one idea: a copy of the backdrop
          run through <code className="text-neutral-300">feDisplacementMap</code>
          , where the choice of map decides what kind of glass it is. A blurred
          alpha isolated to the rim gives a lens; stitched turbulence gives
          poured glass; three maps at different strengths give dispersion.
          Colours are still built in OKLCH.
        </p>
        <div className="mt-3 flex gap-4 text-xs text-neutral-500">
          <Link href="/opart/color" className="underline underline-offset-4 hover:text-neutral-200">
            ← Colour loops
          </Link>
          <Link href="/opart" className="underline underline-offset-4 hover:text-neutral-200">
            Shape loops
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {GLASS.map((v, i) => (
          <figure key={v.id} className="min-w-0">
            <div className="overflow-hidden rounded-md ring-1 ring-white/10">
              <SvgLoop v={v} />
            </div>
            <figcaption className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-neutral-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] font-medium leading-tight">
                  {v.name}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                {v.note}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
