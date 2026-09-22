/* Harvey hero — variant 03, "Choose Your Path". The Figma Hero D composition
 * built in code: claim on the left, two role cards on the right, the product
 * frame cropped below.
 *
 * The cards carry real copy from Harvey's own solution pages
 * (/solutions/law-firms and /solutions/in-house) rather than invented
 * marketing: each card's title, three outcomes, proof number and use-case list
 * are theirs, compressed to card length.
 *
 * Conversion argument: on every other variant segmentation happens late, after
 * the value is made. Here it *is* the hero — the reader self-identifies in one
 * glance, reads three outcomes in their own vocabulary, sees the number that
 * matters to their seat, and takes a CTA already routed to their segment. Two
 * small decisions instead of one big one.
 *
 * Second pass: the two role cards are now one window with a segmented control
 * (HarveyPathPanel) — see that file for why. The lane they gave back goes to
 * the claim, which is the frame the whole page hangs on and was the weakest of
 * the three columns at 460px / 52px.
 *
 * Design system is variant 01b throughout: Dashboard, Glyph, tokens, button
 * recipes and glyph tiles are imported, not copied. Code-only — no Figma. */

import { Dashboard, Glyph, NAV, RISK, t14, t14m } from "./HarveyHero01";
import HarveyPathPanel from "./HarveyPathPanel";

/* ─── pieces ────────────────────────────────────────────────────────────── */

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

/* ─── hero ──────────────────────────────────────────────────────────────── */

export default function HarveyHero03() {
  return (
    <section className="harvey harvey-section bg-harvey-ground text-harvey-gray-text-high relative isolate overflow-hidden">
      <Nav />

      {/* justify-between, not a fixed grid: the panel is pinned to the right
          edge and the claim takes everything left of it, so the gap between
          them is the widest piece of white space on the screen. */}
      <div className="relative flex items-center justify-between gap-16 px-16 pt-14 pb-2">
        {/* claim — the frame the page hangs on, so it now out-ranks the panel:
            full lane, display type, and the only serif on the screen. */}
        <div className="flex max-w-[748px] flex-col items-start gap-7">
          <p className="type-eyebrow-13">
            Built for firms and legal departments
          </p>

          {/* bigger and heavier than the token default — at 400 the serif read
              as a quiet caption next to the panel's ruled card; 500 gives the
              claim the weight the composition needs without leaving the
              family. */}
          <h1 className="type-heading-display text-[clamp(56px,5.6vw,80px)] leading-[1.02] font-medium text-balance">
            Build a Frontier Legal Organization
          </h1>

          <p className="type-copy-20 text-harvey-gray-text-low">
            Whether you run a practice group or a legal department, Harvey fits
            the way you already work — and gives you the governance you need to
            let agents in.
          </p>

          <p className={`${t14} text-harvey-gray-text-low`}>
            A 30-minute call on your own practice area. No deck, no commitment.
          </p>

          <ul className="text-harvey-gray-text-low flex flex-wrap items-center gap-x-8 gap-y-3 pt-1">
            {RISK.map(({ icon: Icon, label, fill }) => (
              <li key={label} className={`${t14m} flex items-center gap-2`}>
                <Glyph icon={Icon} fill={fill} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* one window, two datasets — the choice lives in its segmented
            control, so the reader answers "which am I?" in one click instead
            of reading 120 words of near-identical card copy */}
        <HarveyPathPanel />
      </div>

      {/* the product, cropped at the fold — proof that both doors lead somewhere real */}
      <div className="relative mt-16 px-16 pb-16">
        <div
          className="rounded-[16px] p-1 shadow-[0_1px_2px_rgba(20,16,8,0.06),0_12px_24px_-8px_rgba(20,16,8,0.08),0_32px_64px_-16px_color-mix(in_oklab,var(--harvey-brand-solid)_18%,transparent)]"
          style={{
            background:
              "linear-gradient(180deg, #fff 0%, #fff 45%, var(--harvey-brand-solid) 100%)",
          }}
        >
          <Dashboard focus />
        </div>
      </div>

      {/* ground wash, closing the composition under the cropped frame */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--harvey-texture) 10%, transparent) 100%)",
        }}
      />
    </section>
  );
}
