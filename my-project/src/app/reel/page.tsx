import { ReelHero } from "@/components/sections/ReelHero/ReelHero";
import { REELS } from "@/components/sections/ReelHero/content";

/**
 * The hero hands the ring off to the scroll on its way out, so the page needs
 * something below it for that to be visible at all. This is the landing side
 * of the hand-off: the same reels, at rest, in a grid.
 */
export default function ReelPage() {
  return (
    <div className="min-h-dvh bg-[#080808] text-[#f5f5f5]">
      <ReelHero preset="spotlight" />

      <section className="mx-auto w-full px-[7vw] py-28">
        <h2 className="text-[13px] leading-none font-medium tracking-[0.2em] text-[#f5f5f5]/60 uppercase">
          Selected work
        </h2>

        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {REELS.map((reel) => (
            <li key={reel.src} className="flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden rounded-[4px] bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={reel.alt ?? ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={reel.src}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] leading-none font-medium tracking-[-0.01em]">
                  {reel.label}
                </span>
                <span
                  className="text-[11px] leading-none font-medium tracking-[0.14em] uppercase"
                  style={{ color: reel.accent }}
                >
                  {reel.caption} · {reel.duration}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
