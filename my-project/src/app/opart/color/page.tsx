"use client";

import Link from "next/link";
import OpCanvas from "../../components/opart/OpCanvas";
import { GRADIENTS } from "../../components/opart/gradients";

export default function ColorPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-14 text-neutral-100">
      <header className="mx-auto mb-12 max-w-6xl">
        <h1 className="text-2xl font-medium tracking-tight">Colour loops</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Fifteen gradients, no shaders — every pixel is computed on the CPU and
          composited with plain canvas 2D. Two rules hold throughout: mixing
          happens in OKLab so no crossfade dies in a grey middle, and every ramp
          is dithered on the way down to 8 bits so wide washes do not band. Where
          a colour claims to be physical, the spectrum is built first and
          converted through the CIE observer.
        </p>
        <Link
          href="/opart"
          className="mt-3 inline-block text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-200"
        >
          ← Shape loops
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {GRADIENTS.map((v, i) => (
          <figure key={v.id} className="min-w-0">
            <div className="overflow-hidden rounded-md ring-1 ring-white/10">
              <OpCanvas
                draw={v.draw}
                period={v.period}
                fps={v.fps}
                label={v.name}
              />
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
