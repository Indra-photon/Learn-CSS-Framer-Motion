/* Formwise sign-in: copy, the fake workspace directory, and every motion
 * value from the Figma motion spec (531:568), so the choreography can be
 * read top to bottom without opening the components.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MOTION STORYBOARD — success path
 *
 *  email → password   280ms  the whole email panel leaves left (200ms), the
 *                            whole password panel enters from the right:
 *                            4px blur + 24px slide, nothing morphs across;
 *                            the parent springs to the new panel's height
 *  password → signing 150ms  same panel stays; button label → spinner,
 *                            butterfly 70% → 100% and trembles
 *  signing → success  ~1.2s  request resolves; success panel slides in,
 *                            wings beat 3×, butterfly rises and fades
 *  Change / Not you?         same motion, mirrored: slides in from the left
 *
 *  reduced motion     everything is instant: no slide, no fade, no height
 *                     spring, static spinner, the butterfly never moves
 * ───────────────────────────────────────────────────────────────────────── */

/* Entering and exiting: fast start, long settle. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/* Already on screen and changing shape: accelerate, then brake. */
export const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const;

export const DURATION = {
  enter: 0.28, // UI stays under 300ms
  exit: 0.2, // exits ~20% faster than enters
  press: 0.15, // button label swap — micro-interaction
  flight: 1.1, // butterfly take-off: rare, once per sign-in, allowed to be special
};

/* Height follows content with a spring so a second click mid-transition
 * retargets from the current height instead of restarting. */
export const HEIGHT_SPRING = {
  type: "spring",
  duration: 0.3,
  bounce: 0,
} as const;

export const SLIDE_PX = 24;

export const SIGN_IN_MS = 1200; // how long the fake request takes

export type Step =
  | "email"
  | "google"
  | "password"
  | "signing"
  | "success"
  | "returning";

export type Method = "google" | "password";

/* Depth of each step in the flow. Moving deeper slides forward (from the
 * right), moving shallower slides back, so direction is derived, never
 * passed around by hand. */
const DEPTH: Record<Step, number> = {
  email: 0,
  returning: 0,
  google: 1,
  password: 1,
  signing: 2,
  success: 3,
};

export const directionOf = (from: Step, to: Step) =>
  DEPTH[to] >= DEPTH[from] ? 1 : -1;

/* Domains the demo "recognises". Anything else falls back to a password,
 * named after the domain, so every email still has a path. */
const DIRECTORY: Record<string, { org: string; method: Method }> = {
  "northwind.co": { org: "Northwind", method: "google" },
  "acme.studio": { org: "Acme Studio", method: "password" },
};

export function resolveWorkspace(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const known = DIRECTORY[domain];
  if (known) return known;
  const label = domain.split(".")[0] ?? "";
  return {
    org: label.charAt(0).toUpperCase() + label.slice(1),
    method: "password" as Method,
  };
}

export function firstName(email: string) {
  const local = email.split("@")[0]?.split(/[._-]/)[0] ?? "";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* The demo signs in with any password except this one, so the error state
 * can be reviewed without a backend. */
export const DEMO_WRONG_PASSWORD = "wrong-password";

export const PANEL: Record<
  Step,
  { pager: string; caption: string; opacity: number }
> = {
  email: { pager: "01 / 03", caption: "Waiting for your email", opacity: 0.35 },
  google: { pager: "02 / 03", caption: "Found your workspace", opacity: 0.7 },
  password: { pager: "02 / 03", caption: "Almost there", opacity: 0.7 },
  signing: { pager: "03 / 03", caption: "Taking flight", opacity: 1 },
  success: { pager: "03 / 03", caption: "Welcome in", opacity: 1 },
  returning: {
    pager: "01 / 02",
    caption: "Good to see you again",
    opacity: 1,
  },
};

export const ERROR_CAPTION = "Let’s try that again";

export const COPY = {
  email: {
    title: "Sign in to Formwise",
    sub: "Use your work email. We’ll find the fastest way in.",
  },
  google: (org: string) => ({
    title: "One more step",
    sub: `${org} signs in with Google Workspace.`,
  }),
  password: (org: string) => ({
    title: "Enter your password",
    sub: `Signing in to ${org}.`,
  }),
  success: (email: string, org: string) => ({
    title: `You’re in, ${firstName(email)}`,
    sub: `Opening ${org}…`,
  }),
  returning: (email: string) => ({
    title: `Welcome back, ${firstName(email)}`,
    sub: "Pick up right where you left off.",
  }),
  errors: {
    email: "Enter your work email, like name@company.com.",
    passwordEmpty: "Enter your password.",
    passwordWrong: "Wrong password. Try again or reset your password.",
  },
};

export const REMEMBER_KEY = "formwise:last-account";
