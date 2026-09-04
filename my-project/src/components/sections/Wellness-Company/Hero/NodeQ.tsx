/**
 * NodeQ — enterprise dev-tool hero with an organic counterpoint
 * React + TailwindCSS
 *
 * The tulip photo on the right is veiled by crisp vertical glass slats that
 * alternate frosted / clear — a legible "venetian blind" device.
 *
 * SETUP:
 *  - Place the tulip image at:  /Images/nodeq-tulip.png
 *  - Font: Inter
 */
const NAV = ["Adapter", "Flows", "Catalog", "Hub"];
const SLATS = 9;

export default function NodeQ() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#cfcfcf] p-4 font-sans antialiased sm:p-10">
      <div className="relative min-h-[640px] w-full max-w-[1180px] overflow-hidden rounded-[18px] bg-white shadow-[0_40px_90px_rgba(0,0,0,0.22)]">
        {/* floating glass nav */}
        <nav className="absolute inset-x-5 top-5 z-20 flex items-center justify-between rounded-[14px] border border-black/[0.06] bg-white/70 px-[18px] py-3 backdrop-blur-md">
          <span className="text-base font-extrabold tracking-wide text-[#111]">
            NODEQ
          </span>
          <div className="flex gap-[26px]">
            {NAV.map((n) => (
              <a
                key={n}
                href="#"
                className="text-sm text-[#444] transition-colors hover:text-[#111]"
              >
                {n}
              </a>
            ))}
          </div>
          <a
            href="#"
            className="rounded-lg bg-[#f26a1b] px-4 py-[9px] text-sm font-semibold text-white"
          >
            Log in ↗
          </a>
        </nav>

        <div className="grid min-h-[640px] grid-cols-1 md:grid-cols-2">
          {/* left copy */}
          <div className="flex max-w-[580px] flex-col justify-center px-6 pt-[150px] pb-14 sm:px-12">
            <span className="mb-6 self-start rounded-lg border border-black/[0.12] px-2.5 py-[5px] text-[12.5px] text-[#555]">
              Trusted by 500+ global enterprises
            </span>
            <h1 className="text-[clamp(36px,4.6vw,62px)] leading-none font-extrabold tracking-[-0.025em]">
              <span className="text-[#adadad]">
                Your agents figure it out once.{" "}
              </span>
              <span className="text-[#0e0e0e]">Then it just runs.</span>
            </h1>
            <p className="my-6 max-w-[440px] text-[15.5px] leading-relaxed text-[#5a5a5a]">
              Rote&trade; is a CLI that watches your agent work, crystallizes
              the pattern into deterministic code, and ships it — no LLM at
              runtime, no token costs, no drift. Your team&rsquo;s forty scripts
              become one system.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="rounded-xl bg-[#efe9e2] px-[22px] py-[13px] text-[15px] text-[#222]"
              >
                Request a demo
              </a>
              <a
                href="#"
                className="rounded-xl bg-[#f26a1b] px-[22px] py-[13px] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(242,106,27,0.32)]"
              >
                Book a demo ↗
              </a>
            </div>
          </div>

          {/* right: tulip behind vertical glass slats */}
          <div className="relative hidden overflow-hidden border-l border-black/[0.04] md:block">
            <img
              src="/Images/nodeq-tulip.png"
              alt="A single orange tulip"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* vertical glass slats */}
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${SLATS}, 1fr)` }}
            >
              {Array.from({ length: SLATS }).map((_, i) => (
                <div
                  key={i}
                  className={
                    i % 2
                      ? "bg-white/[0.22] backdrop-blur-[11px] backdrop-saturate-150"
                      : "backdrop-blur-[0.4px]"
                  }
                  style={{
                    boxShadow:
                      "inset 1.5px 0 0 rgba(255,255,255,0.6), inset -1px 0 0 rgba(0,0,0,0.05)",
                  }}
                />
              ))}
            </div>
            {/* diagonal sheen */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.35)_0%,transparent_34%)]" />
            {/* feather left edge into the white page */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
