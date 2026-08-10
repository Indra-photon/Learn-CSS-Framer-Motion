"use client";

import Link from "next/link";
import OpCanvas from "../components/opart/OpCanvas";
import { VARIATIONS, type Variation } from "../components/opart/variations";
import { PHYSICS } from "../components/opart/physics";

function Card({ v, index }: { v: Variation; index: number }) {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-md bg-white ring-1 ring-black/5">
        <OpCanvas
          draw={v.draw}
          period={v.period}
          fps={v.fps}
          label={v.name}
        />
      </div>
      <figcaption className="mt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] text-neutral-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[13px] font-medium leading-tight">{v.name}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
          {v.note}
        </p>
      </figcaption>
    </figure>
  );
}

export default function OpArtPage() {
  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-14 text-neutral-900">
      <header className="mx-auto mb-12 max-w-6xl">
        <h1 className="text-2xl font-medium tracking-tight">
          Loops from real systems
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Sixteen physical systems, every one solved rather than faked — and ten
          purely functional loops below them. A chaotic system never returns to
          its initial state, so each of these closes for one of three reasons:
          it is genuinely periodic, it is driven onto a limit cycle, or the loop
          runs through parameter space while time stands still.
        </p>
        <Link
          href="/opart/weave"
          className="mt-3 inline-block text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
        >
          Weave (the half-plane one) →
        </Link>
      </header>

      <section className="mx-auto mb-16 max-w-6xl">
        <h2 className="mb-5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Physics
        </h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {PHYSICS.map((v, i) => (
            <Card key={v.id} v={v} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl">
        <h2 className="mb-5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Functions
        </h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {VARIATIONS.map((v, i) => (
            <Card key={v.id} v={v} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
