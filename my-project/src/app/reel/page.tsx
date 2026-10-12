import { ReelHero } from "@/components/sections/ReelHero/ReelHero";

/**
 * The hero now owns the gallery band the ring resolves into, because the
 * cards travel between the two and have to share one coordinate space. The
 * page just needs something below it, so the hand-off has somewhere to end.
 */
export default function ReelPage() {
  return (
    <div className="min-h-dvh bg-[#080808] text-[#f5f5f5]">
      <ReelHero preset="spotlight" />

      <section className="mx-auto w-full px-[7vw] py-32">
        <p className="max-w-[34rem] text-[17px] leading-[1.55] text-[#f5f5f5]/60">
          Briefed on Monday, cut and delivered inside two weeks. Launch films,
          feature tours and onboarding for software companies.
        </p>
      </section>
    </div>
  );
}
