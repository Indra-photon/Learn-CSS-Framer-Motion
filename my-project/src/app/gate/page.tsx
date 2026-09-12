import ProfileGateDials from "@/components/blocks/ProfileGateDials";

/* The tuning route. /approve renders the same block with no panel and no
 * dialkit in its bundle; this page exists purely to turn the dials. */
export default function GateTuningPage() {
  return (
    <div className="min-h-dvh bg-[#f6f5f3] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-title mb-2 tracking-tight text-[#0b0b0b]/70">
          Profile gate · flight tuning
        </h1>
        <p className="text-caption mb-6 max-w-[62ch] text-[#0b0b0b]/45">
          Turn on <strong>showPath</strong> to plot both trajectories over the stage, then
          press <strong>Fly / return</strong> to run the leg you are tuning. When it feels
          right, <strong>Copy flight</strong> and paste the result over DEFAULT_FLIGHT in
          ProfileGate.tsx.
        </p>

        <div className="h-[700px] overflow-hidden rounded-3xl border border-black/[0.07]">
          <ProfileGateDials />
        </div>
      </div>
    </div>
  );
}
