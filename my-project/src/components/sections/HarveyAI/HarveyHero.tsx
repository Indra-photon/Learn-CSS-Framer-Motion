/* Harvey hero — announcement bar, nav, serif headline, and the Command Center
 * mock sitting on a painted, grainy backdrop. Tokens come from harvey.css
 * (registered via globals.css so its @theme utilities exist). */

import HarveyDashboard from "./HarveyDashboard";

const NAV = [
  { label: "Platform", menu: true },
  { label: "Solutions", menu: true },
  { label: "Customers" },
  { label: "Security" },
  { label: "Resources", menu: true },
  { label: "Company", menu: true },
];

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 6.5l3 3 3-3" />
    </svg>
  );
}

/* The backdrop: a slate wash with a pale brushstroke sweeping across the top,
 * then a turbulence filter laid over the whole thing so it reads as paper
 * grain rather than a flat gradient. All in one SVG so it scales with the
 * band and costs nothing at runtime. */
function PaintedBackdrop() {
  return (
    <svg
      className="absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1600 800"
      aria-hidden
    >
      <defs>
        <linearGradient id="harvey-wash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.42 0.012 240)" />
          <stop offset="0.55" stopColor="oklch(0.36 0.012 230)" />
          <stop offset="1" stopColor="oklch(0.3 0.01 220)" />
        </linearGradient>
        <radialGradient id="harvey-stroke" cx="0.42" cy="0.12" r="0.75">
          <stop offset="0" stopColor="oklch(0.86 0.012 220)" />
          <stop offset="0.45" stopColor="oklch(0.78 0.014 225)" stopOpacity="0.9" />
          <stop offset="0.75" stopColor="oklch(0.6 0.014 230)" stopOpacity="0.35" />
          <stop offset="1" stopColor="oklch(0.42 0.012 240)" stopOpacity="0" />
        </radialGradient>
        <filter id="harvey-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
          />
        </filter>
        <filter id="harvey-edge" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="90" />
        </filter>
      </defs>
      <rect width="1600" height="800" fill="url(#harvey-wash)" />
      <ellipse
        cx="620"
        cy="60"
        rx="900"
        ry="330"
        fill="url(#harvey-stroke)"
        filter="url(#harvey-edge)"
      />
      <rect
        width="1600"
        height="800"
        filter="url(#harvey-grain)"
        style={{ mixBlendMode: "overlay" }}
        opacity="0.8"
      />
    </svg>
  );
}

export default function HarveyHero() {
  return (
    <section className="harvey harvey-section min-h-screen bg-harvey-canvas text-harvey-gray-text-high">
      {/* announcement */}
      <div className="dark flex items-center justify-center gap-3 bg-harvey-gray-bg-subtle px-4 py-3 text-harvey-gray-text-high">
        <p className="type-label-14 text-center">
          We Raised $550M at a $15.5B Valuation to Help Legal Teams Own Their
          Intelligence{" "}
          <a href="#" className="ml-2 underline-offset-4 hover:underline">
            Learn more
          </a>
        </p>
      </div>

      {/* nav */}
      <header className="mx-auto flex max-w-[1880px] items-center justify-between px-6 py-5 lg:px-11">
        <a href="#" className="type-heading-32 type-serif">
          Harvey
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href="#"
              className="type-label-16 flex items-center gap-1.5 rounded-md px-3 py-2 text-harvey-gray-text-high hover:bg-harvey-gray-ui"
            >
              {item.label}
              {item.menu && <Chevron className="size-3.5 text-harvey-gray-text-low" />}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="#"
            className="type-button-16 hidden h-10 items-center gap-1.5 rounded-md bg-harvey-canvas px-4 shadow-harvey-border hover:bg-harvey-gray-ui sm:flex"
          >
            Login
            <Chevron className="size-3.5 text-harvey-gray-text-low" />
          </a>
          <a
            href="#"
            className="type-button-16 flex h-10 items-center rounded-md bg-harvey-gray-text-high px-4 text-harvey-canvas hover:bg-harvey-gray-text-low"
          >
            Request a Demo
          </a>
        </div>
      </header>

      {/* headline */}
      <div className="mx-auto grid max-w-[1880px] gap-10 px-6 pt-6 pb-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:px-11 lg:pt-8 lg:pb-20 xl:pl-40 xl:pr-52">
        <h1 className="type-heading-display text-balance text-harvey-gray-text-high">
          Build a Frontier Legal Organization
        </h1>

        <div className="max-w-[620px]">
          <p className="type-copy-24 text-harvey-gray-text-low">
            The world&rsquo;s top law firms and in-house legal teams trust Harvey
            with their highest-stakes work.
          </p>
          <a
            href="#"
            className="type-button-16 mt-9 inline-flex h-14 items-center rounded-md bg-harvey-gray-text-high px-6 text-harvey-canvas hover:bg-harvey-gray-text-low"
          >
            Request a Demo
          </a>
        </div>
      </div>

      {/* product band */}
      <div className="mx-auto max-w-[1880px] px-6 pb-6 lg:px-11">
        <div className="relative isolate h-[520px] overflow-hidden rounded-xl md:h-[640px] lg:h-[700px]">
          <PaintedBackdrop />
          <div className="absolute inset-x-6 top-16 md:inset-x-12 md:top-20 lg:left-[9%] lg:right-[9%] lg:top-[90px]">
            <HarveyDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
