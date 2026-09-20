"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

type Experiment = {
  id: string;
  title: string;
  traditional: string;
  mathematical: string;
};

const experiments: Experiment[] = [
  {
    id: "stagger-vs-phase",
    title: "Stagger vs Phase",
    traditional: "Sequential delay",
    mathematical: "Phase-shifted sine",
  },
  {
    id: "ease-vs-sine",
    title: "Ease vs Sine",
    traditional: "Ease in-out",
    mathematical: "Sine mapping",
  },
  {
    id: "spring-vs-damped",
    title: "Spring vs Damped Wave",
    traditional: "Spring",
    mathematical: "Sine × decay",
  },
  {
    id: "fade-vs-sine-opacity",
    title: "Fade vs Sine Opacity",
    traditional: "Opacity tween",
    mathematical: "sin(πt)",
  },
  {
    id: "scale-vs-wave",
    title: "Scale vs Wave",
    traditional: "Scale easing",
    mathematical: "Mapped sine",
  },
  {
    id: "cascade-vs-wave",
    title: "Cascade vs Traveling Wave",
    traditional: "Delayed Y",
    mathematical: "sin(t + index)",
  },
  {
    id: "reveal-vs-cycle",
    title: "Reveal vs Cycle",
    traditional: "Sequential reveal",
    mathematical: "Periodic mapping",
  },
  {
    id: "bounce-vs-abs-sine",
    title: "Bounce vs Absolute Sine",
    traditional: "Bounce easing",
    mathematical: "|sin(t)|",
  },
  {
    id: "elastic-vs-oscillation",
    title: "Elastic vs Oscillation",
    traditional: "Elastic",
    mathematical: "Decay × oscillation",
  },
  {
    id: "random-vs-noise",
    title: "Random Delay vs Deterministic Offset",
    traditional: "Random delay",
    mathematical: "Hash-based offset",
  },
  {
    id: "timeline-vs-index",
    title: "Timeline vs Index Mapping",
    traditional: "Timeline stagger",
    mathematical: "Normalized index",
  },
  {
    id: "multi-vs-scalar",
    title: "Multiple Tweens vs One Scalar",
    traditional: "Independent properties",
    mathematical: "One t → many properties",
  },
];

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  const t = clamp((value - inMin) / (inMax - inMin));
  return lerp(outMin, outMax, t);
};

const smoothStep = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

const easeInOut = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

const hash = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function Card({
  index,
  total,
  experiment,
  side,
  t,
}: {
  index: number;
  total: number;
  experiment: Experiment;
  side: "traditional" | "math";
  t: number;
}) {
  const normalizedIndex = total <= 1 ? 0 : index / (total - 1);

  /*
   * ---------------------------------------------------------
   * TRADITIONAL SIDE
   * ---------------------------------------------------------
   */

  if (side === "traditional") {
    const delay = normalizedIndex * 0.08;

    let animate: Record<string, number> = {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
    };

    let initial: Record<string, number> = {
      opacity: 0,
      y: 24,
      scale: 0.92,
      rotate: 0,
    };

    let transition: Record<string, any> = {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1],
    };

    switch (experiment.id) {
      case "stagger-vs-phase":
        animate = { opacity: 1, y: 0 };
        initial = { opacity: 0, y: 30 };
        transition = {
          duration: 0.6,
          delay,
          ease: [0.22, 1, 0.36, 1],
        };
        break;

      case "ease-vs-sine":
        animate = { opacity: 1, y: 0 };
        initial = { opacity: 0, y: 50 };
        transition = {
          duration: 0.8,
          ease: "easeInOut",
        };
        break;

      case "spring-vs-damped":
        animate = { opacity: 1, y: 0 };
        initial = { opacity: 0, y: 70 };
        transition = {
          type: "spring",
          stiffness: 180,
          damping: 12,
          delay: index * 0.025,
        };
        break;

      case "fade-vs-sine-opacity":
        animate = { opacity: 1 };
        initial = { opacity: 0 };
        transition = {
          duration: 0.8,
          delay,
        };
        break;

      case "scale-vs-wave":
        animate = { opacity: 1, scale: 1 };
        initial = { opacity: 0, scale: 0.65 };
        transition = {
          duration: 0.65,
          delay,
          ease: [0.34, 1.56, 0.64, 1],
        };
        break;

      case "cascade-vs-wave":
        animate = { opacity: 1, y: 0 };
        initial = { opacity: 0, y: 45 };
        transition = {
          duration: 0.7,
          delay: index * 0.07,
          ease: "easeOut",
        };
        break;

      case "reveal-vs-cycle":
        animate = { opacity: 1, x: 0 };
        initial = { opacity: 0, x: -40 };
        transition = {
          duration: 0.55,
          delay: index * 0.1,
          ease: "easeOut",
        };
        break;

      case "bounce-vs-abs-sine":
        animate = { opacity: 1, y: 0 };
        initial = { opacity: 0, y: -60 };
        transition = {
          duration: 1,
          delay,
          ease: [0.68, -0.55, 0.27, 1.55],
        };
        break;

      case "elastic-vs-oscillation":
        animate = { opacity: 1, x: 0 };
        initial = { opacity: 0, x: 80 };
        transition = {
          type: "spring",
          stiffness: 250,
          damping: 8,
          delay: index * 0.025,
        };
        break;

      case "random-vs-noise":
        animate = { opacity: 1, y: 0 };
        initial = { opacity: 0, y: 40 };
        transition = {
          duration: 0.7,
          delay: hash(index + 42) * 0.5,
          ease: "easeOut",
        };
        break;

      case "timeline-vs-index":
        animate = { opacity: 1, x: 0 };
        initial = { opacity: 0, x: 50 };
        transition = {
          duration: 0.65,
          delay: index * 0.075,
          ease: [0.16, 1, 0.3, 1],
        };
        break;

      case "multi-vs-scalar":
        animate = {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
        };
        initial = {
          opacity: 0,
          y: 40,
          scale: 0.8,
          rotate: -8,
        };
        transition = {
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        };
        break;
    }

    return (
      <motion.div
        className="h-20 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
        initial={initial}
        animate={animate}
        transition={transition}
      >
        <div className="flex h-full items-center justify-between">
          <div>
            <div className="text-xs text-white/40">CARD</div>
            <div className="font-mono text-sm">
              {String(index + 1).padStart(2, "0")}
            </div>
          </div>

          <div className="h-2 w-2 rounded-full bg-white/60" />
        </div>
      </motion.div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MATHEMATICAL SIDE
   * ---------------------------------------------------------
   */

  let x = 0;
  let y = 0;
  let opacity = 1;
  let scale = 1;
  let rotate = 0;

  switch (experiment.id) {
    /*
     * 1. Traditional stagger:
     *    delay = index * stagger
     *
     * Mathematical:
     *    phase = index * phaseOffset
     *    y = sin(time + phase)
     */
    case "stagger-vs-phase": {
      const phase = normalizedIndex * Math.PI * 1.8;
      const wave = Math.sin(t * Math.PI * 2 - phase);

      y = wave * 18;
      opacity = mapRange(wave, -1, 1, 0.45, 1);

      break;
    }

    /*
     * 2. EaseInOut vs sine.
     */
    case "ease-vs-sine": {
      const sine = (1 - Math.cos(t * Math.PI)) / 2;

      y = lerp(40, 0, sine);
      opacity = sine;

      break;
    }

    /*
     * 3. Spring vs damped sine.
     *
     * oscillation × exponential decay
     */
    case "spring-vs-damped": {
      const time = t * 5;
      const decay = Math.exp(-time * 0.65);
      const wave = Math.sin(time * Math.PI * 3);

      y = wave * decay * 45 + mapRange(t, 0, 1, 40, 0);

      opacity = mapRange(t, 0, 0.15, 0, 1);

      break;
    }

    /*
     * 4. Opacity using sin(πt)
     */
    case "fade-vs-sine-opacity": {
      const sine = Math.sin(Math.PI * t);

      opacity = sine;
      y = mapRange(sine, 0, 1, 10, 0);

      break;
    }

    /*
     * 5. Scale generated from sine.
     */
    case "scale-vs-wave": {
      const wave = Math.sin(Math.PI * t);

      scale = mapRange(wave, 0, 1, 0.7, 1);
      opacity = wave;

      break;
    }

    /*
     * 6. Cards become points on a traveling wave.
     */
    case "cascade-vs-wave": {
      const phase = t * Math.PI * 2 - normalizedIndex * Math.PI * 3;

      const wave = Math.sin(phase);

      y = wave * 22;
      scale = mapRange(wave, -1, 1, 0.85, 1.05);

      break;
    }

    /*
     * 7. Instead of a one-shot reveal,
     *    every card has a periodic cycle.
     */
    case "reveal-vs-cycle": {
      const phase = t * Math.PI * 2 + normalizedIndex * Math.PI * 2;

      const cycle = (Math.sin(phase) + 1) / 2;

      opacity = mapRange(cycle, 0, 1, 0.25, 1);
      y = mapRange(cycle, 0, 1, 20, -5);

      break;
    }

    /*
     * 8. Bounce approximation using |sin|.
     */
    case "bounce-vs-abs-sine": {
      const bounce = Math.abs(
        Math.sin(t * Math.PI * 3 + normalizedIndex * 0.3),
      );

      y = mapRange(bounce, 0, 1, 0, -30);
      scale = mapRange(bounce, 0, 1, 0.9, 1);

      break;
    }

    /*
     * 9. Elastic:
     *
     * sin(frequency * t) × decay
     */
    case "elastic-vs-oscillation": {
      const time = t * 6;
      const decay = Math.exp(-time * 0.45);
      const oscillation = Math.sin(time * Math.PI * 4);

      x = oscillation * decay * 45 * (1 - normalizedIndex * 0.3);

      opacity = mapRange(t, 0, 0.2, 0, 1);

      break;
    }

    /*
     * 10. Deterministic "randomness".
     */
    case "random-vs-noise": {
      const offset = hash(index + 10);

      const phase = t * Math.PI * 2 + offset * Math.PI * 2;

      const wave = Math.sin(phase);

      y = wave * 14;
      rotate = wave * 3;
      opacity = mapRange(wave, -1, 1, 0.55, 1);

      break;
    }

    /*
     * 11. Normalize index into [0,1]
     *     and use it as another dimension.
     */
    case "timeline-vs-index": {
      const localT = clamp(t * 1.5 - normalizedIndex * 0.75);

      const eased = smoothStep(localT);

      x = mapRange(eased, 0, 1, 50, 0);
      opacity = eased;
      scale = mapRange(eased, 0, 1, 0.8, 1);

      break;
    }

    /*
     * 12. One scalar drives everything.
     */
    case "multi-vs-scalar": {
      const phase = t * Math.PI * 2 + normalizedIndex * Math.PI * 1.5;

      const wave = Math.sin(phase);
      const normalized = (wave + 1) / 2;

      y = mapRange(normalized, 0, 1, 20, -20);
      scale = mapRange(normalized, 0, 1, 0.8, 1.05);
      opacity = mapRange(normalized, 0, 1, 0.4, 1);
      rotate = mapRange(normalized, 0, 1, -4, 4);

      break;
    }
  }

  return (
    <div
      className="h-20 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
      style={{
        opacity,
        transform: `
          translate3d(${x}px, ${y}px, 0)
          scale(${scale})
          rotate(${rotate}deg)
        `,
      }}
    >
      <div className="flex h-full items-center justify-between">
        <div>
          <div className="text-xs text-white/40">CARD</div>
          <div className="font-mono text-sm">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        <div className="h-2 w-2 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

function Playground({
  experiment,
  count,
  t,
}: {
  experiment: Experiment;
  count: number;
  t: number;
}) {
  const cards = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count],
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-lg font-medium">{experiment.title}</h2>

        <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-white/40">Traditional</span>
            <div className="mt-1 text-white/80">{experiment.traditional}</div>
          </div>

          <div>
            <span className="text-white/40">Mathematical</span>
            <div className="mt-1 text-white/80">{experiment.mathematical}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/10">
        <div className="space-y-2 bg-[#090909] p-4">
          {cards.map((index) => (
            <Card
              key={index}
              index={index}
              total={count}
              experiment={experiment}
              side="traditional"
              t={t}
            />
          ))}
        </div>

        <div className="space-y-2 bg-[#0d0d0d] p-4">
          {cards.map((index) => (
            <Card
              key={index}
              index={index}
              total={count}
              experiment={experiment}
              side="math"
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AnimationMathLab() {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const [count, setCount] = useState(8);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const delta = (now - previous) / 1000;
      previous = now;

      setT((value) => {
        const next = value + delta * 0.35 * speed;
        return next % 1;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs tracking-[0.25em] text-white/40 uppercase">
            Animation / Mathematics
          </div>

          <h1 className="max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
            Easing functions vs
            <br />
            mathematical mapping.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/50">
            The same visual problems approached in two different ways:
            traditional animation primitives on the left, mathematical functions
            and normalized values on the right.
          </p>
        </header>

        {/* Controls */}
        <div className="sticky top-4 z-20 mb-8 rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_1fr] md:items-center">
            <button
              onClick={() => setPlaying((v) => !v)}
              className="rounded-xl border border-white/10 px-5 py-2 text-sm transition hover:bg-white/10"
            >
              {playing ? "Pause" : "Play"}
            </button>

            <label className="block">
              <div className="mb-2 flex justify-between text-xs text-white/40">
                <span>Progress</span>
                <span className="font-mono">{t.toFixed(3)}</span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <label className="block">
              <div className="mb-2 flex justify-between text-xs text-white/40">
                <span>Speed</span>
                <span className="font-mono">{speed.toFixed(1)}×</span>
              </div>

              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-white/40">Cards</span>

            {[4, 8, 12, 20].map((value) => (
              <button
                key={value}
                onClick={() => setCount(value)}
                className={`rounded-lg px-3 py-1 text-xs ${
                  count === value
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="mb-1 text-xs tracking-wider text-white/30 uppercase">
              Left
            </div>
            <div className="text-sm">Traditional animation</div>
            <div className="mt-1 text-xs text-white/40">
              Tween · easing · stagger · spring
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <div className="mb-1 text-xs tracking-wider text-white/30 uppercase">
              Right
            </div>
            <div className="text-sm">Mathematical animation</div>
            <div className="mt-1 text-xs text-white/40">
              mapRange · lerp · sin · cos · phase · decay
            </div>
          </div>
        </div>

        {/* Experiments */}
        <div className="space-y-8">
          {experiments.map((experiment) => (
            <Playground
              key={experiment.id}
              experiment={experiment}
              count={count}
              t={t}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="font-mono text-xs text-white/30">01</div>
              <h3 className="mt-2 text-sm">Normalize</h3>
              <p className="mt-2 text-xs leading-5 text-white/40">
                Convert arbitrary values into a predictable 0 → 1 domain.
              </p>
            </div>

            <div>
              <div className="font-mono text-xs text-white/30">02</div>
              <h3 className="mt-2 text-sm">Transform</h3>
              <p className="mt-2 text-xs leading-5 text-white/40">
                Feed the normalized value through a mathematical function.
              </p>
            </div>

            <div>
              <div className="font-mono text-xs text-white/30">03</div>
              <h3 className="mt-2 text-sm">Map</h3>
              <p className="mt-2 text-xs leading-5 text-white/40">
                Map the resulting value into position, scale, opacity or
                rotation.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
