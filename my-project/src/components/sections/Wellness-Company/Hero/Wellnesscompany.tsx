/**
 * The Wellness Company — hero, "cream paper with one flower on it"
 *
 * Structural premise: the page is a single sheet of warm paper and there is
 * exactly ONE object on it — the photograph, which is not framed but
 * dissolved into the sheet (see `.bloom` in ./wellness-hero.css). Nothing
 * here is a card: no panel, no border box, no drop shadow. The only filled
 * shapes are the pills, and they are filled because they are actions.
 *
 * Type does the work. The headline is the serif, set large, with its second
 * clause dropped to a faint tone so one sentence reads as two beats. All the
 * supporting text is the sans at one size.
 *
 * Colour comes from section 4 of ./wellness-hero.css (--paper / --ink /
 * --ink-muted / --ink-faint), which resolve onto the yellow+stone roles the
 * /color-scale skill generated in section 1 of that file.
 */
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Menu01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";

import "./wellness-hero.css";

const NAV = ["Belief", "Products", "Team"];

/* The product table. Ordered, numbered and ruled — the one place in the block
   where the eye is meant to compare rather than read. */
const PRODUCTS = [
  {
    name: "GoPolar",
    category: "Cold + heat",
    note: "Understand cold plunge and sauna sessions, and the recovery patterns around them.",
  },
  {
    name: "SunSeek",
    category: "Sun + rhythm",
    note: "Build a healthier relationship with sunlight, time outdoors, and your daily rhythm.",
  },
  {
    name: "Posture AI",
    category: "Movement + posture",
    note: "See how you move, understand everyday strain, and build greater confidence in your body.",
  },
];

/* The layout margin, shared by the three bands (header, copy, table) so they
   sit on one pair of edges. max() keeps the margin from landing inside a
   landscape notch — safe-area insets are physical geometry, so physical
   left/right are the correct properties here. */
const GUTTER =
  "pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] md:pl-[max(3rem,env(safe-area-inset-left))] md:pr-[max(3rem,env(safe-area-inset-right))]";

/* Focus ring, identical on every interactive element in the block. */
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

/* The filled pill, used twice — header and hero — so the surface is written
   once. Its gradient and elevation live in `.pill-brand` (section 5 of the
   CSS); the shape is Tailwind's. Padding is deliberately NOT here: the two
   call sites are different sizes, and a size baked into the shared const
   means two conflicting `px-*` on one element, resolved by stylesheet order
   rather than by intent. */
const PILL_SOLID = "pill-brand inline-flex items-center rounded-[9px]";

export default function WellnessCompany() {
  return (
    <section className="wellness-hero relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-[var(--paper)]">
      <header
        className={`relative z-10 w-full py-[clamp(1rem,2.2vh,1.5rem)] ${GUTTER}`}
      >
        {/* Two groups. The wordmark leads; the nav and the action travel
            together on the trailing edge, one 32px gap between them, so the
            header reads as identity on one side and business on the other.
            Everything in it is `type-button-16` — the same step the hero
            buttons use, which retires the 14px size from the block. */}
        {/* Baseline, not centre. The wordmark is 30px serif and the nav is
            16px sans; centring their boxes aligns the middles and leaves the
            baselines ~5px apart, which is the misalignment you see. Aligning
            on the baseline puts every word in the header on one line, and the
            pill — whose baseline is its own label's — ends up with equal air
            above and below that line. Only from lg: below it the row is the
            wordmark and an icon button, which has no baseline to share. */}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 lg:items-baseline">
          <a
            href="#top"
            className={`type-wordmark inline-flex shrink-0 items-center rounded-full text-[var(--ink)] ${FOCUS}`}
          >
            The Wellness Company
          </a>

          <div className="flex flex-1 items-center justify-end gap-8 lg:items-baseline">
            <nav className="hidden min-w-0 items-baseline gap-8 lg:flex">
              {NAV.map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`type-button-16 rounded-full text-[var(--ink)] transition-colors hover:text-[var(--ink-muted)] ${FOCUS}`}
                >
                  {item}
                </a>
              ))}
            </nav>

            <a
              href="sms:+16284687855"
              className={`type-button-16 hidden px-5 py-3 lg:inline-flex ${PILL_SOLID} ${FOCUS}`}
            >
              Text us
            </a>

            <button
              type="button"
              className={`rounded-full p-1 text-[var(--ink)] lg:hidden ${FOCUS}`}
            >
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon
                icon={Menu01Icon}
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`relative z-10 flex w-full items-start pt-[clamp(0.5rem,2vh,2rem)] pb-[clamp(1rem,2.5vh,2rem)] ${GUTTER}`}
      >
        <div className="mx-auto w-full max-w-7xl pt-10 lg:pt-16">
          {/* The copy is a column, not a band: uncapped, a second line of deck
              would run 100+ characters across the sheet and under the photo. */}
          <div className="w-full max-w-[560px]">
            <h1 className="enter type-hero text-[var(--ink)] [--rise:12px]">
              Live better, feel sharper.
              {/* <span className="text-[var(--ink-faint)]">feel sharper.</span> */}
            </h1>

            <p className="enter type-copy-18 mt-5 max-w-full text-pretty text-[var(--ink-muted)] [--enter-delay:120ms] [--rise:10px]">
              Three tools that read your cold, your sunlight and your movement,
              and turn them into patterns you can act on.
            </p>

            <div className="enter mt-7 flex flex-wrap items-center gap-3 [--enter-delay:240ms] [--rise:8px]">
              {/* The real action. It opens the visitor's Messages app, and the
                label has to say so rather than borrow the nav's wording. */}
              <a
                href="sms:+16284687855"
                className={`type-button-16 gap-3 px-3 py-2 ${PILL_SOLID} ${FOCUS}`}
              >
                Text us to begin
                {/* The badge is the ink box the gold face is missing — it says
                    the link opens Messages, and it mirrors the secondary
                    button's badge so the pair reads as one family. Concentric,
                    exactly: outer 12px minus 8px of padding is an inner 4px.
                    It was 6px, which is the rule broken by two pixels — enough
                    that the corners visibly disagree at this size. */}
                <span className="pill-badge flex size-8 items-center justify-center rounded-[6px]">
                  <HugeiconsIcon
                    icon={Message01Icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
              </a>

              {/* <button
                className={`type-button-16 relative m-0 box-border inline-block transform-gpu cursor-pointer touch-manipulation appearance-none overflow-visible rounded-[12px] border-0 border-b-4 border-transparent px-[19px] py-[13px] text-center align-middle text-[15px] leading-5 font-bold tracking-[0.8px] whitespace-nowrap text-white uppercase transition-[filter] duration-200 outline-none select-none after:absolute after:inset-0 after:-bottom-1 after:z-[-1] after:rounded-[12px] after:border-0 after:border-b-4 after:border-transparent after:bg-[#1CB0F6] after:content-[''] hover:brightness-110 active:pb-[10px] disabled:cursor-auto ${PILL_SOLID} ${FOCUS}`}
              >
                Book a free call
              </button> */}
              <a
                href="#how"
                className={`chip-brand type-button-16 group inline-flex items-center gap-3 rounded-[9px] px-3 py-2 text-[var(--ink)] ${FOCUS}`}
              >
                How we work
                <span className="chip-badge flex size-8 items-center justify-center rounded-[6px]">
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="badge-icon"
                  />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The photograph sits behind everything and is masked, not cropped, so
          it has no edge of its own. It runs to the viewport edge rather than
          to the max-w-6xl measure — held to the measure it had a right edge to
          hide, and no ramp wide enough to hide it looked like anything but a
          faded photo.

          From lg up it is absolute and fills the trailing half — `end`, not
          `right`, so the composition mirrors with the writing direction; the
          mask ramp and the crop mirror with it (see `[dir="rtl"] .bloom`).
          Below lg it stays in the flow, as a band between the copy and the
          product table: at 768-1023 the 520px copy column is wider than the
          paper left beside a 48% photo, so the headline would have run under
          the petals. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative -z-10 h-[40vh] w-full lg:absolute lg:inset-y-0 lg:end-0 lg:h-full lg:w-[48%]"
      >
        <img
          src="/Images/wellness-bloom.png"
          alt=""
          className="bloom enter-photo h-full w-full object-cover object-[62%_45%] lg:object-[52%_50%]"
        />
      </div>

      {/* The product table. Three tracks on desktop — name, category,
          description — and a hairline above each row, so the rules do the
          grouping and nothing needs a box. The 01/02/03 rail is gone: at 12px
          in --ink-faint it was too quiet to be read as an index and too
          present to be nothing, so it was only texture. `mt-auto` pushes the
          table to the foot of the sheet. */}
      <div
        className={`relative z-10 mt-auto w-full pt-[clamp(2rem,5vh,3.5rem)] pb-[max(clamp(1.5rem,4vh,3.5rem),env(safe-area-inset-bottom))] ${GUTTER}`}
      >
        {/* A veil of paper across the band. The photograph's own mask fades it
            by the foot of the sheet, but the table sits IN that fade, so the
            description column was reading against petals. This paints the
            ground back over the picture exactly where the rules begin —
            transparent at the top edge, full paper by the first row — so the
            image blends out instead of being cropped by text. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-[1] h-full bg-gradient-to-b from-transparent via-[var(--paper)] via-35% to-[var(--paper)]"
        />

        <div className="enter-block mx-auto w-full max-w-7xl">
          {PRODUCTS.map((product) => (
            <a
              key={product.name}
              href="#products"
              className={`product-row group bg-am grid grid-cols-1 items-start gap-x-8 gap-y-2 py-[clamp(1.1rem,3.2vh,2.2rem)] lg:grid-cols-[minmax(0,0.55fr)_minmax(9rem,max-content)_minmax(0,1.35fr)] lg:items-baseline ${FOCUS}`}
            >
              <span className="product-name type-product flex items-center gap-3 text-[var(--ink)]">
                {product.name}
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="product-arrow mt-2 shrink-0"
                />
              </span>

              {/* Right-aligned so the label's trailing edge lands on the rail
                  the description column starts from: the category and the
                  sentence it labels now share one vertical guide, instead of
                  the label floating in the middle of its own track. */}
              <span className="type-eyebrow text-[var(--ink)]">
                {product.category}
              </span>

              <span className="type-copy-18 text-pretty text-[var(--ink-muted)]">
                {product.note}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
