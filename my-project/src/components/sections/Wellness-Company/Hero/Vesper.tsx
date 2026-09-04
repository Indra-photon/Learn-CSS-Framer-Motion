/**
 * Vesper — contemplative dusk hero
 * React + TailwindCSS
 *
 * SETUP:
 *  - Place the dusk image at:  /Images/vesper-dusk.png
 *  - Font: Inter (add via Google Fonts or your app's font setup)
 */
export default function Vesper() {
  return (
    <div className="min-h-screen w-full bg-[#c4c9dd] py-6 font-sans antialiased sm:py-11">
      <div className="mx-auto max-w-[640px] px-5">
        {/* atmospheric dusk card */}
        <section className="relative h-[430px] overflow-hidden rounded-sm">
          <img
            src="/Images/vesper-dusk.png"
            alt="A lone figure walking a glowing ridge at dusk"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* fade the base of the image into the page */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#c4c9dd] to-transparent" />
          <h1 className="relative z-10 pt-7 text-center text-[46px] font-medium tracking-[0.3em] text-[#f7f4ff]/90 drop-shadow-[0_3px_30px_rgba(50,45,90,0.4)]">
            Vesper
          </h1>
        </section>

        {/* manifesto */}
        <section className="mx-auto mt-11 max-w-[560px]">
          <h2 className="text-[clamp(26px,4vw,34px)] font-medium tracking-tight text-[#3a3d49]">
            A calmer, clearer path to growth
          </h2>
          <p className="mt-5 text-[15.5px] leading-[1.72] text-[#6a6d78]">
            Most of us don&rsquo;t need more motivation — we need a way of
            working that actually fits how we&rsquo;re wired.{" "}
            <b className="font-semibold text-[#3a3d49]">
              The Method On-Demand Course
            </b>{" "}
            is a self-paced introduction to a whole-system framework for
            sustainable transformation. It&rsquo;s designed to help you see your
            patterns more clearly, align your actions with what truly matters,
            and translate insight into grounded, repeatable practice — without
            pressure or overwhelm.
          </p>
        </section>

        <div className="mx-auto my-11 h-px max-w-[560px] bg-[#5a5a78]/20" />

        {/* what's included */}
        <section className="mx-auto max-w-[560px]">
          <h3 className="mb-5 text-2xl font-medium text-[#3a3d49]">
            What&rsquo;s included
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card
              className="from-[#f0a15e] via-[#d97b45] to-[#7f8a72]"
              label="7 structured, insightful modules"
            />
            <Card
              className="from-[#2f3340] to-[#20242e]"
              label="On-demand video lessons (self-paced)"
            />
            <Card
              className="from-[#e6a074] via-[#b97f6a] to-[#6f6a86]"
              label="Practical worksheets and prompts"
            />
            <Card
              className="from-[#3b3652] to-[#141220]"
              center
              label={
                <span className="font-semibold tracking-[0.06em]">
                  THE METHOD
                  <br />
                  <span className="font-normal tracking-normal opacity-85">
                    Lifetime access
                  </span>
                </span>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({
  className,
  label,
  center = false,
}: {
  className: string;
  label: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={`relative flex aspect-[16/11] overflow-hidden rounded-2xl bg-gradient-to-br shadow-[0_14px_34px_rgba(60,60,90,0.16)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <span
        className={`relative z-10 p-4 text-[13.5px] leading-snug font-medium text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] ${
          center ? "m-auto text-center" : "mt-auto"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
