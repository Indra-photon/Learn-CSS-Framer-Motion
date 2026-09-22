/* Harvey hero — variant 02, "Offset". Mintlify's composition in Harvey's
 * language: an announcement rail, a narrow column of copy held to the left
 * half, and the product frame floating bottom-right, oversized and bleeding
 * off two edges so the page reads as a window onto something larger. The
 * background is the same shader in `lines` mode — a bundle of rays converging
 * off the top-right corner, masked away from the headline.
 *
 * Everything below the layout is variant 01b: the same Dashboard (focus on),
 * the same tokens, glyph tiles, badges and button recipes, imported rather
 * than copied so the two heroes can never drift.
 *
 * Deliberately not in Figma or Paper — this is a code-only exploration. */

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  PlayCircleIcon,
} from "@hugeicons/core-free-icons";

import HarveyRibbon from "./HarveyRibbon";
import { Dashboard, Glyph, I, NAV, RISK, t14, t14m } from "./HarveyHero01";

/* the 1px hairline ring, as a shadow — no borders anywhere in this block */
const ring = "shadow-[0_0_0_1px_var(--harvey-hairline)]";

/* Announcement rail. The restructure plan demoted "Harvey II" from a
 * full-bleed section to a bar; this is that bar. */
function Announcement() {
  return (
    <div
      className={`relative flex items-center justify-center gap-3 py-2.5 ${t14}`}
    >
      <span
        className={`${t14m} rounded-harvey-control text-harvey-brand-text-high bg-harvey-brand-ui px-2 py-0.5`}
      >
        New
      </span>
      <span className="text-harvey-gray-text-high">
        Harvey II — smarter agents, more complex work
      </span>
      <a
        href="#"
        className={`${t14m} text-harvey-brand-text-high flex items-center gap-1`}
      >
        Read the announcement
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={14}
          strokeWidth={1.5}
          aria-hidden
        />
      </a>
    </div>
  );
}

function Nav() {
  return (
    <header className="shadow-harvey-rule-b relative flex h-[72px] items-center justify-between px-16">
      <a href="#" className="type-heading-24 type-serif">
        Harvey
      </a>
      <nav className="hidden items-center gap-8 lg:flex">
        {NAV.map((item) => (
          <a
            key={item}
            href="#"
            className="type-button-14 hover:text-harvey-brand-text-high"
          >
            {item}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-6">
        <a href="#" className="type-button-14">
          Sign in
        </a>
        <a
          href="#"
          className="type-button-14 rounded-harvey-control btn-primary text-harvey-brand-on-solid flex h-10 items-center px-4"
        >
          Request a demo
        </a>
      </div>
    </header>
  );
}

/* Mintlify opens with a live-metric pill above the headline. Ours carries the
 * number that matters to this buyer, so the first thing read is peer proof. */
function StatPill() {
  return (
    <a
      href="#"
      className={`${t14} rounded-harvey-control bg-harvey-canvas inline-flex h-8 w-max items-center gap-2 pr-2 pl-3 ${ring}`}
    >
      <span className="text-harvey-gray-text-low">
        Am Law 100 firms on Harvey
      </span>
      <span className={`${t14m} text-harvey-gray-text-high`}>75+</span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={14}
        strokeWidth={1.5}
        className="text-harvey-gray-text-low"
        aria-hidden
      />
    </a>
  );
}

export default function HarveyHero02() {
  return (
    <section className="harvey harvey-section bg-harvey-ground text-harvey-gray-text-high relative isolate min-h-[1040px] overflow-hidden">
      {/* <HarveyRibbon variant="lines" intensity={0.6} fallback={null} /> */}

      {/* ground wash — in Hero A the bezel's green lip closed the composition
          at the bottom; here the frame bleeds off-screen so that lip is
          cropped away. The brand tint moves to the section instead, filling
          the empty lower-left quadrant the copy leaves behind. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[560px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--harvey-texture) 10%, transparent) 100%)",
        }}
      />

      {/* <Announcement /> */}
      <Nav />

      {/* copy — held to the left half so the frame can own the right */}
      <div className="relative flex max-w-[720px] flex-col items-start gap-6 px-16 pt-20">
        <StatPill />

        {/* the display token is tuned for a full-width lane; in a half-width
            column it wraps to four lines, so this variant caps it */}
        <h1 className="type-heading-display text-[64px] leading-[1.05] text-balance">
          Build a Frontier Legal Organization
        </h1>

        <p className="type-copy-20 text-harvey-gray-text-low max-w-[500px]">
          One platform for{" "}
          <span className="text-harvey-gray-text-high">
            agents, documents and your team,
          </span>{" "}
          so every matter moves faster without leaving your standards behind.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <a
            href="#"
            className="type-button-16 rounded-harvey-control btn-primary text-harvey-brand-on-solid flex h-12 items-center gap-2 pr-5 pl-[21px] whitespace-nowrap"
          >
            Request a demo
            <span className="rounded-harvey-control flex size-6 items-center justify-center bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={14}
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          </a>
          <a
            href="#"
            className="type-button-16 rounded-harvey-control btn-ghost flex h-12 items-center gap-2 pr-[21px] pl-5 whitespace-nowrap"
          >
            <Glyph icon={PlayCircleIcon} tone="muted" kinded={false} />
            Watch the walkthrough
            <span
              className={`${t14} text-harvey-gray-text-low rounded-harvey-control bg-harvey-gray-ui px-1.5 leading-5`}
            >
              2:04
            </span>
          </a>
        </div>

        <p className={`${t14} text-harvey-gray-text-low`}>
          A 30-minute call on your own practice area. No deck, no commitment.
        </p>

        <ul className="text-harvey-gray-text-low flex flex-nowrap items-center gap-6 pt-2 whitespace-nowrap">
          {RISK.map(({ icon: Icon, label, fill }) => (
            <li key={label} className={`${t14m} flex items-center gap-2`}>
              <Glyph icon={Icon} fill={fill} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* the product, oversized and bleeding off the right and bottom edges —
          the page is a window onto a bigger tool, not a framed screenshot */}
      {/* 45%, not 42%: the two risk reducers need 568px of lane and 42% left
          only 541px, clipping the second. A 3% nudge is cheaper than editing
          the shared RISK labels, which Hero A also renders. */}
      <div className="pointer-events-none absolute top-[360px] left-[45%] w-[1240px]">
        <div
          className="rounded-[16px] p-1 shadow-[0_1px_2px_rgba(20,16,8,0.06),0_12px_24px_-8px_rgba(20,16,8,0.08),0_32px_64px_-16px_color-mix(in_oklab,var(--harvey-brand-solid)_18%,transparent)]"
          style={{
            background:
              /* Hero A showed this gradient as a green lip on the bezel's bottom ring.
               Here the frame runs ~1500px tall and only its top ~45% is on
               screen, so a stop at 45% never renders. Compressed to 38% and
               tilted 190° so the green lands on the visible left ring. */
            "linear-gradient(190deg, #fff 0%, #fff 8%, var(--harvey-brand-solid) 38%)",
          }}
        >
          <Dashboard focus />
        </div>
      </div>
    </section>
  );
}
