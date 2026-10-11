import type { Reel } from "./reel-geometry";

/**
 * Showcase artwork, hot-linked from Pexels.
 *
 * Pexels photos are free to use commercially and need no attribution, and
 * the CDN serves a one-year cache. Requested cropped 16:9 at 640px wide,
 * which covers a 2x export of the 300px crest card without pulling more than
 * it needs — `next/image` re-encodes from here, so this is the source size,
 * not the served one.
 */
const pexels = (id: string): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop`;

export const REELS: Reel[] = (
  [
    ["414860", "Plasma globe", "Helix", "Product launch", "0:48", "#a46cff"],
    ["3109807", "Violet marble", "Quanta", "Brand film", "1:12", "#8f7bff"],
    [
      "2156881",
      "Teal and purple abstract",
      "Northwind",
      "Feature tour",
      "0:36",
      "#2fd3c4",
    ],
    [
      "2832382",
      "Multicoloured swirl",
      "Pallet",
      "Series A film",
      "2:04",
      "#ff7a3d",
    ],
    ["1252890", "The Milky Way", "Orbit", "Keynote open", "0:22", "#6ea8ff"],
    ["3617500", "Aurora over a lake", "Lumen", "Onboarding", "1:30", "#3ee6a0"],
    [
      "1323550",
      "Pastel sunset ridges",
      "Ridgeline",
      "Explainer",
      "0:54",
      "#ff9d6b",
    ],
    [
      "3680219",
      "A silhouette at sunset",
      "Solo",
      "Founder story",
      "1:48",
      "#ff7b5c",
    ],
    ["1707215", "Towers at night", "Monolith", "Case study", "1:06", "#ffb03a"],
    [
      "1133957",
      "A hummingbird at a hibiscus",
      "Colibri",
      "Motion ident",
      "0:14",
      "#ff5d7a",
    ],
    [
      "2422915",
      "Dolphins underwater",
      "Pod",
      "Culture film",
      "2:20",
      "#35b8ff",
    ],
    ["1366919", "A snow peak", "Summit", "Conference reel", "0:42", "#bcd9ff"],
  ] as const
).map(([id, alt, label, caption, duration, accent]) => ({
  accent,
  alt,
  caption,
  duration,
  label,
  src: pexels(id),
}));

export const COPY = {
  eyebrow: "Product video, as a service",
  /** Runs wrapped in asterisks are set in the display serif, in italic. */
  headline: "Your product,\n*launched* with *videos*",
  ctaNote: "Kickoff this week · fixed price per reel",
  primaryCta: "Book a meeting",
  subhead:
    "A standing video team for software companies. Launch films, feature tours and onboarding — briefed on Monday, cut and delivered inside two weeks.",
};

/**
 * One number, not three.
 *
 * Turnaround is the only claim here a buyer cannot get from an agency, so it
 * carries the whole proof on its own and earns the second-largest type on the
 * page. Three small facts competing at 20px said less.
 */
export const PROOF = {
  label: "Brief to final cut, every reel",
  suffix: " days",
  value: 12,
};

export const NAV = ["Work", "Process", "Pricing", "Studio"];
