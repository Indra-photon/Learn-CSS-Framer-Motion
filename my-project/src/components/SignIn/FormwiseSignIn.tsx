"use client";

/* Formwise — email-first adaptive sign-in.
 *
 * The form proves the product's claim ("forms that adapt to every answer"):
 * it asks one question, then shows only the method that fits the email's
 * workspace. Built from the Figma flow (529:568 – 529:817) and the success
 * path motion spec (530:568); every timing lives in content.ts.
 *
 * Styling is Tailwind only. The Ember palette is set once as CSS variables
 * on the root and read through the `bg-(--fw-*)` shorthand, so no global CSS
 * is involved. Values are the contrast-checked ones from the audit:
 * muted text #57534e (6.7:1 on cream), input edge #8f8984 (3.0:1), error text
 * #c10007 (5.7:1; the Figma #e7000b only reaches 4.2:1 for 13px text).
 *
 * Motion model — one thing moves at a time:
 *   Each step is a complete, self-contained panel (headline, fields, button,
 *   link). Steps only share data (email, workspace, error), never elements,
 *   so nothing morphs across a step change. One AnimatePresence swaps whole
 *   panels with the headline's motion: 4px blur + a 24px slide in the
 *   direction of travel, 280ms in / 200ms out. A parent measures the panel
 *   that is showing and springs to its height.
 *   Inside a panel, only local changes animate: a hint opening, the button
 *   label swapping to "Signing in…". `signing` keeps the panel that started
 *   it, so the button never remounts mid-request. */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

import { ButterflyPanel } from "./ButterflyPanel";
import { MeasuredHeight } from "./MeasuredHeight";
import {
  COPY,
  DEMO_WRONG_PASSWORD,
  DURATION,
  EASE_IN_OUT,
  EASE_OUT,
  REMEMBER_KEY,
  SIGN_IN_MS,
  SLIDE_PX,
  directionOf,
  firstName,
  isEmail,
  resolveWorkspace,
  type Method,
  type Step,
} from "./content";

/* ─── tokens & type roles ─────────────────────────────────────────────── */

const TOKENS = {
  "--fw-surface": "#f4f0e8",
  "--fw-field": "#ffffff",
  "--fw-ink": "#0c0a09",
  "--fw-ink-raised": "#2e2b28", // top of the primary button's gradient
  "--fw-muted": "#57534e",
  "--fw-edge": "#8f8984",
  "--fw-hairline": "#e7e5e4",
  "--fw-danger": "#c10007",
  "--fw-danger-edge": "#e7000b",
  "--fw-brand": "#ff5f1f",
  "--fw-panel": "#12110f",
  "--fw-panel-fg": "rgb(237 230 216 / 0.7)",
  "--fw-panel-fg-strong": "rgb(237 230 216 / 0.92)",
} as CSSProperties;

const tDisplay =
  "text-[32px] leading-[1.1] font-medium tracking-[-0.03em] text-balance sm:text-[40px]";
const tBody16 = "text-[16px] leading-6";
const tBody14 = "text-[14px] leading-5";
const tLabel = "text-[14px] leading-5 font-medium";
const tCaption = "text-[13px] leading-5";
const tMono =
  "font-(family-name:--font-geist-mono) text-[12px] leading-4 tracking-[0.06em] uppercase";

const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--fw-ink)";
const linkCls = cn(
  tLabel,
  "w-fit rounded-sm underline decoration-from-font underline-offset-4",
  focusRing,
);
/* Inputs keep a 3:1 edge and get a 2px ink edge on focus, drawn as border +
 * an inset outline so nothing shifts. No shadows on fields. */
const fieldBox =
  "flex h-12 items-center gap-2 rounded-xl border bg-(--fw-field) transition-[border-color] duration-150 focus-within:outline-1 focus-within:-outline-offset-2";
const fieldOk =
  "border-(--fw-edge) focus-within:border-(--fw-ink) focus-within:outline-(--fw-ink)";
const fieldBad =
  "border-(--fw-danger-edge) focus-within:border-(--fw-danger-edge) focus-within:outline-(--fw-danger-edge)";
const inputCls = cn(
  tBody16,
  "h-full min-w-0 flex-1 bg-transparent caret-(--fw-brand) outline-none placeholder:text-(--fw-muted)/70",
);

/* ─── motion ──────────────────────────────────────────────────────────── */

const INSTANT: Transition = { duration: 0 };
const enterT: Transition = { duration: DURATION.enter, ease: EASE_OUT };
const exitT: Transition = { duration: DURATION.exit, ease: EASE_OUT };
const morphT: Transition = { duration: DURATION.enter, ease: EASE_IN_OUT };

type Custom = { dir: number; reduce: boolean };

/* The one step transition. Forward enters from the right and leaves left,
 * back mirrors it; the 4px blur bridges the overlap so the two panels read
 * as one surface changing. The leaving panel stops taking clicks at once. */
const panel: Variants = {
  enter: ({ dir, reduce }: Custom) =>
    reduce
      ? { opacity: 1, x: 0 }
      : { opacity: 0, x: dir * SLIDE_PX, filter: "blur(4px)" },
  center: ({ reduce }: Custom) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: reduce ? INSTANT : enterT,
  }),
  exit: ({ dir, reduce }: Custom) => ({
    pointerEvents: "none",
    ...(reduce
      ? { opacity: 0, transition: INSTANT }
      : {
          opacity: 0,
          x: -dir * SLIDE_PX,
          filter: "blur(4px)",
          transition: exitT,
        }),
  }),
};

/* Height reveal for things that appear inside a panel (hints), so the
 * button below glides instead of jumping. Clips only while moving. */
function Collapse({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{
        height: "auto",
        opacity: 1,
        transitionEnd: { overflow: "visible" },
      }}
      exit={{ height: 0, opacity: 0, overflow: "hidden" }}
      transition={reduce ? INSTANT : morphT}
    >
      {children}
    </motion.div>
  );
}

/* ─── component ───────────────────────────────────────────────────────── */

type ErrorKey = keyof typeof COPY.errors;
type Remembered = { email: string; method: Method };
type Phase = Exclude<Step, "signing">;

export function FormwiseSignIn() {
  const reduce = useReducedMotion() ?? false;
  const [step, setStep] = useState<Step>("email");
  const [dir, setDir] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [via, setVia] = useState<Method>("password");
  const [error, setError] = useState<ErrorKey | null>(null);
  const [remembered, setRemembered] = useState<Remembered | null>(null);
  const [ready, setReady] = useState(false);

  const stepRef = useRef<Step>(step);
  stepRef.current = step;
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const focusOnStep = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { org } = resolveWorkspace(email);
  const phase: Phase = step === "signing" ? via : step;
  const busy = step === "signing";
  const custom: Custom = { dir, reduce };

  /* A returning visitor skips the email step. Read after mount: storage does
   * not exist on the server, and the form fades in once this has settled. */
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(REMEMBER_KEY) ?? "null",
      ) as Remembered | null;
      if (saved && isEmail(saved.email)) {
        setRemembered(saved);
        setEmail(saved.email);
        setStep("returning");
      }
    } catch {
      /* private mode or blocked storage: start fresh */
    }
    setReady(true);
    return () => clearTimeout(timer.current);
  }, []);

  /* Move focus to whatever the new step asks for — only after the user
   * acted, never on first load. */
  useEffect(() => {
    if (!focusOnStep.current) return;
    focusOnStep.current = false;
    const id = requestAnimationFrame(() => {
      if (step === "email") emailRef.current?.focus();
      else if (step === "password") passwordRef.current?.focus();
      else if (step === "google" || step === "returning")
        primaryRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [step]);

  const go = (next: Step, moveFocus = true) => {
    setDir(directionOf(stepRef.current, next));
    focusOnStep.current = moveFocus;
    setStep(next);
  };

  const fail = (key: ErrorKey, field: "email" | "password") => {
    setError(key);
    (field === "email" ? emailRef : passwordRef).current?.focus();
  };

  const signIn = (method: Method) => {
    setVia(method);
    setError(null);
    go("signing", false);
    timer.current = setTimeout(() => {
      if (method === "password" && password === DEMO_WRONG_PASSWORD) {
        setPassword("");
        setError("passwordWrong");
        go("password");
        return;
      }
      try {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, method }));
      } catch {
        /* remembering is a convenience, not a requirement */
      }
      setRemembered({ email, method });
      go("success", false);
    }, SIGN_IN_MS);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (step === "email") {
      const value = email.trim();
      if (!isEmail(value)) return fail("email", "email");
      setEmail(value);
      setError(null);
      const { method } = resolveWorkspace(value);
      setVia(method);
      go(method === "google" ? "google" : "password");
    } else if (step === "password") {
      if (!password) return fail("passwordEmpty", "password");
      signIn("password");
    } else if (step === "google") {
      signIn("google");
    } else if (step === "returning" && remembered) {
      if (remembered.method === "google") signIn("google");
      else go("password");
    }
  };

  const changeAccount = () => {
    setPassword("");
    setError(null);
    go("email");
  };

  const forgetAccount = () => {
    try {
      localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* nothing to forget */
    }
    setRemembered(null);
    setEmail("");
    changeAccount();
  };

  const clearError = () => error && setError(null);

  const status = busy
    ? "Signing in…"
    : step === "success"
      ? `Signed in. Opening ${org}…`
      : "";

  /* One panel per step. Each is complete on its own; only data flows in. */
  const panels: Record<Phase, ReactNode> = {
    email: (
      <>
        <Intro {...COPY.email} />
        <EmailField
          inputRef={emailRef}
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearError();
          }}
          error={error === "email" ? COPY.errors.email : null}
        />
        <PrimaryButton buttonRef={primaryRef} label="Continue" trailing />
        <SecondaryLink>Use a passkey instead</SecondaryLink>
      </>
    ),
    google: (
      <>
        <Intro {...COPY.google(org)} />
        <AccountRow email={email} action="Change" onAction={changeAccount} />
        <PrimaryButton
          buttonRef={primaryRef}
          busy={busy}
          label="Continue with Google"
          leading={<GoogleMark />}
        />
        <SecondaryLink hidden={busy}>
          Email me a sign-in code instead
        </SecondaryLink>
      </>
    ),
    password: (
      <>
        <Intro {...COPY.password(org)} />
        <AccountRow email={email} action="Change" onAction={changeAccount} />
        <PasswordField
          inputRef={passwordRef}
          email={email}
          value={password}
          busy={busy}
          onChange={(v) => {
            setPassword(v);
            clearError();
          }}
          error={
            error === "passwordEmpty" || error === "passwordWrong"
              ? error
              : null
          }
        />
        <PrimaryButton
          buttonRef={primaryRef}
          busy={busy}
          label="Sign in"
          trailing
        />
        <SecondaryLink hidden={busy}>Email me a code instead</SecondaryLink>
      </>
    ),
    returning: (
      <>
        <Intro {...COPY.returning(email)} />
        <AccountRow
          email={email}
          name={firstName(email)}
          action="Not you?"
          onAction={forgetAccount}
        />
        {remembered?.method === "google" ? (
          <PrimaryButton
            buttonRef={primaryRef}
            busy={busy}
            label="Continue with Google"
            leading={<GoogleMark />}
            tag="Last used"
          />
        ) : (
          <PrimaryButton buttonRef={primaryRef} label="Continue" trailing />
        )}
      </>
    ),
    success: (
      <>
        <Intro {...COPY.success(email, org)} />
        <motion.button
          type="button"
          onClick={() => go("returning")}
          className={cn(linkCls, "text-(--fw-muted)")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            ...(reduce ? INSTANT : enterT),
            delay: reduce ? 0 : DURATION.flight + 0.3,
          }}
        >
          Back to sign in
        </motion.button>
      </>
    ),
  };

  return (
    <MotionConfig reducedMotion="user" transition={reduce ? INSTANT : enterT}>
      <div
        style={TOKENS}
        className="flex min-h-dvh gap-6 bg-(--fw-surface) font-(family-name:--font-geist-sans) text-(--fw-ink) [-webkit-tap-highlight-color:transparent] sm:p-6"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-12 px-4 py-6 sm:px-10 lg:px-14 lg:py-8">
          <Header />

          {/* Pinned near the top rather than centered: the top edge never
              moves, so only the bottom grows or shrinks between steps.
              A div, not a <section>: globals.css styles every bare section
              as a centered 100vh grid (the CornerShape02 demo), unlayered,
              so it beats these utilities and re-centers the form. */}
          <div className="flex flex-1 justify-center pt-[6vh] lg:pt-[14vh]">
            <motion.div
              className="w-full max-w-[400px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0 }}
            >
              <form noValidate onSubmit={onSubmit}>
                <p role="status" className="sr-only">
                  {status}
                </p>

                {/* The mother div: measures the panel on screen and springs
                    to its height. The leaving panel is popped out of flow,
                    so only the arriving one is measured. */}
                <MeasuredHeight>
                  <div className="relative">
                    <AnimatePresence
                      mode="popLayout"
                      initial={false}
                      custom={custom}
                    >
                      <motion.div
                        key={phase}
                        custom={custom}
                        variants={panel}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex flex-col gap-4 will-change-transform"
                      >
                        {panels[phase]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </MeasuredHeight>
              </form>
            </motion.div>
          </div>

          <Footer />
        </div>

        <ButterflyPanel step={step} hasError={error === "passwordWrong"} />
      </div>
    </MotionConfig>
  );
}

/* ─── pieces ──────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="flex items-center justify-between gap-4">
      <a
        href="/formwise/signin"
        className={cn("flex items-center gap-2.5 rounded-md", focusRing)}
      >
        <span aria-hidden className="grid grid-cols-2 gap-1">
          <span className="size-2.5 rounded-[2px] bg-(--fw-brand)" />
          <span className="size-2.5 rounded-[2px] bg-(--fw-brand)" />
          <span className="size-2.5 rounded-[2px] bg-(--fw-ink)" />
          <span className="size-2.5 rounded-[2px] bg-(--fw-ink)" />
        </span>
        <span className="text-[18px] leading-6 font-semibold tracking-[-0.02em]">
          Formwise
        </span>
      </a>
      <p className={cn(tBody14, "flex gap-1.5 text-(--fw-muted)")}>
        <span className="hidden sm:inline">New to Formwise?</span>
        <a
          href="#"
          className={cn(
            tLabel,
            "rounded-sm text-(--fw-ink) underline-offset-4 hover:underline",
            focusRing,
          )}
        >
          Create an account
        </a>
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer
      className={cn(
        tMono,
        "flex flex-wrap items-center justify-between gap-4 text-(--fw-muted)",
      )}
    >
      <span>© 2026 Formwise Inc.</span>
      <nav aria-label="Legal" className="flex gap-6">
        {["Privacy", "Terms", "Status"].map((l) => (
          <a
            key={l}
            href="#"
            className={cn(
              "rounded-sm underline-offset-4 hover:text-(--fw-ink) hover:underline",
              focusRing,
            )}
          >
            {l}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function Intro({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <h1 className={tDisplay}>{title}</h1>
      <p className={cn(tBody16, "text-pretty text-(--fw-muted)")}>{sub}</p>
    </div>
  );
}

function EmailField({
  inputRef,
  value,
  onChange,
  error,
}: {
  inputRef: Ref<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  const id = useId();
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className={cn(tLabel, "mb-2")}>
        Work email
      </label>
      <div className={cn(fieldBox, "px-4", error ? fieldBad : fieldOk)}>
        <input
          ref={inputRef}
          id={id}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="name@company.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputCls}
        />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <Collapse key="error">
            <ErrorHint id={`${id}-error`}>{error}</ErrorHint>
          </Collapse>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordField({
  inputRef,
  email,
  value,
  busy,
  onChange,
  error,
}: {
  inputRef: Ref<HTMLInputElement>;
  email: string;
  value: string;
  busy: boolean;
  onChange: (v: string) => void;
  error: "passwordEmpty" | "passwordWrong" | null;
}) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const [caps, setCaps] = useState(false);
  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) =>
    setCaps(e.getModifierState("CapsLock"));
  const hintId = error ? `${id}-error` : caps ? `${id}-caps` : undefined;

  return (
    <div className="flex flex-col">
      {/* Lets password managers pair the saved password with this account. */}
      <input
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor={id} className={tLabel}>
          Password
        </label>
        <a href="#" className={linkCls}>
          Forgot password?
        </a>
      </div>
      <div className={cn(fieldBox, "pr-1 pl-4", error ? fieldBad : fieldOk)}>
        <input
          ref={inputRef}
          id={id}
          name="password"
          type={reveal ? "text" : "password"}
          autoComplete="current-password"
          value={value}
          readOnly={busy}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={checkCaps}
          onKeyUp={checkCaps}
          onBlur={() => setCaps(false)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hintId}
          className={cn(inputCls, !reveal && value && "tracking-[0.1em]")}
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          aria-label={reveal ? "Hide password" : "Show password"}
          aria-controls={id}
          className={cn(
            tLabel,
            "h-10 rounded-lg px-3 text-(--fw-muted) hover:text-(--fw-ink)",
            focusRing,
          )}
        >
          {reveal ? "Hide" : "Show"}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {error ? (
          <Collapse key="error">
            <ErrorHint id={`${id}-error`}>
              {error === "passwordWrong" ? (
                <>
                  Wrong password. Try again or{" "}
                  <a
                    href="#"
                    className="rounded-sm underline underline-offset-4"
                  >
                    reset your password
                  </a>
                  .
                </>
              ) : (
                COPY.errors.passwordEmpty
              )}
            </ErrorHint>
          </Collapse>
        ) : caps ? (
          <Collapse key="caps">
            <p
              id={`${id}-caps`}
              className={cn(
                tCaption,
                "flex items-center gap-2 pt-2 text-(--fw-muted)",
              )}
            >
              <span className="grid size-[18px] place-items-center rounded-[4px] border border-(--fw-muted)">
                <HugeiconsIcon
                  icon={ArrowUp02Icon}
                  size={12}
                  strokeWidth={1.5}
                />
              </span>
              Caps Lock is on
            </p>
          </Collapse>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AccountRow({
  email,
  name,
  action,
  onAction,
}: {
  email: string;
  name?: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-(--fw-hairline) bg-(--fw-field) pr-4 pl-2",
        name ? "h-14" : "h-12",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-lg bg-(--fw-surface)",
          name ? "size-10" : "size-8",
        )}
      >
        <HugeiconsIcon
          icon={name ? UserIcon : Mail01Icon}
          size={name ? 22 : 18}
          strokeWidth={1.5}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        {name && <span className={tLabel}>{name}</span>}
        <span
          className={cn(
            tBody14,
            "truncate",
            name ? "text-(--fw-muted)" : "text-(--fw-ink)",
          )}
          title={email}
        >
          {email}
        </span>
      </span>
      <button
        type="button"
        onClick={onAction}
        className={cn(linkCls, "shrink-0 text-(--fw-muted)")}
        aria-label={`${action} — signed in as ${email}`}
      >
        {action}
      </button>
    </div>
  );
}

/* The label (keyed by its text) swaps vertically in 150ms, so "Sign in" →
 * "Signing in…" reads as one control changing state. */
function PrimaryButton({
  label,
  buttonRef,
  busy = false,
  leading,
  trailing = false,
  tag,
}: {
  label: string;
  buttonRef?: Ref<HTMLButtonElement>;
  busy?: boolean;
  leading?: ReactNode;
  trailing?: boolean;
  tag?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <button
      ref={buttonRef}
      type="submit"
      aria-disabled={busy || undefined}
      className={cn(
        tLabel,
        "relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-b from-(--fw-ink-raised) to-(--fw-ink) text-white",
        /* Inset glow, plus the contact and lift shadows. They share one
         * arbitrary value because Tailwind's shadow slot is a single
         * box-shadow layer: split them and the lift disappears. */
        "shadow-[inset_0_0_10px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(12_10_9/0.2),0_6px_14px_-4px_rgb(12_10_9/0.18)]",
        /* Inner bezel: a 1px white line sitting 2px inside an ink edge.
         * The ink offset band paints over the ring's outer 2px. */
        "ring ring-white/20 ring-offset-2 ring-offset-(--fw-ink) ring-inset",
        "hover:shadow-[inset_0_0_20px_0_rgb(255_255_255/0.4),0_1px_2px_rgb(12_10_9/0.2),0_6px_14px_-4px_rgb(12_10_9/0.18)] hover:ring-white/40",
        "transition-[box-shadow,scale] duration-200 ease-out",
        busy ? "cursor-progress" : "motion-safe:active:scale-[0.97]",
        focusRing,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={busy ? "busy" : label}
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={
            reduce ? INSTANT : { duration: DURATION.press, ease: EASE_OUT }
          }
        >
          {busy ? (
            <>
              <Spinner />
              Signing in…
            </>
          ) : (
            <>
              {leading}
              {label}
              {trailing && (
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                />
              )}
            </>
          )}
        </motion.span>
      </AnimatePresence>
      {tag && !busy && (
        <span
          className={cn(
            tCaption,
            "absolute right-3 rounded-full bg-white/15 px-2 font-normal",
          )}
        >
          {tag}
        </span>
      )}
    </button>
  );
}

/* Constant motion is the one place linear belongs. Under reduced motion the
 * ring holds still; the "Signing in…" label carries the state. */
function Spinner() {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.span
      aria-hidden
      className="size-4 rounded-full border-2 border-white/25 border-t-white"
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* Fades out while a request runs but keeps its space, so the panel's
 * height never changes mid sign-in. */
function SecondaryLink({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.button
      type="button"
      className={linkCls}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1 }}
      style={{ pointerEvents: hidden ? "none" : undefined }}
      transition={reduce ? INSTANT : exitT}
    >
      {children}
    </motion.button>
  );
}

function ErrorHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      className={cn(tCaption, "flex items-start gap-2 pt-2 text-(--fw-danger)")}
    >
      <HugeiconsIcon
        icon={AlertCircleIcon}
        size={16}
        strokeWidth={1.75}
        className="mt-0.5 shrink-0"
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}

function GoogleMark() {
  return (
    <span
      aria-hidden
      className="grid size-6 place-items-center rounded-md bg-white"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </span>
  );
}
