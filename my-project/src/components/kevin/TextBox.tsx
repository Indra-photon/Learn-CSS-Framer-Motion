import { useMemo, useState } from "react";

const PAD_Y = 10;
const PAD_X = 24;

export default function OpticalPaddingDemo() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const [swapFont, setSwapFont] = useState(false);
  const [trimBox, setTrimBox] = useState(false);
  const [metricBox, setMetricBox] = useState(false);

  const buttonStyle = useMemo(
    () => ({
      padding: `${PAD_Y}px ${PAD_X}px`,
      fontFamily: swapFont
        ? "system-ui, ui-sans-serif, sans-serif"
        : "Georgia, Cambria, 'Times New Roman', serif",
      fontSize: "20px",
      lineHeight: 1.2,
      textBox: trimBox ? "trim-both cap alphabetic" : "normal",
      textBoxTrim: trimBox ? "trim-both" : "none",
      textBoxEdge: trimBox ? "cap alphabetic" : "auto",
      outline: metricBox ? "1px dashed #38bdf8" : "none",
    }),
    [swapFont, trimBox, metricBox],
  );

  const toggles = [
    {
      id: "top",
      label: "Top band",
      on: showTop,
      set: setShowTop,
      accent: "accent-amber-400",
    },
    {
      id: "bottom",
      label: "Bottom band",
      on: showBottom,
      set: setShowBottom,
      accent: "accent-emerald-400",
    },
    {
      id: "values",
      label: "Show values",
      on: showValues,
      set: setShowValues,
      accent: "accent-zinc-300",
    },
    {
      id: "font",
      label: "Swap font",
      on: swapFont,
      set: setSwapFont,
      accent: "accent-indigo-400",
    },
    {
      id: "trim",
      label: "text-box trim",
      on: trimBox,
      set: setTrimBox,
      accent: "accent-fuchsia-400",
    },
    {
      id: "metrics",
      label: "Metric box",
      on: metricBox,
      set: setMetricBox,
      accent: "accent-sky-400",
    },
  ];

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-5 text-slate-100 shadow-2xl">
      <div className="relative grid min-h-[220px] place-items-center overflow-hidden rounded-xl bg-sky-50 p-10">
        <button
          type="button"
          className="relative isolate rounded-lg bg-[oklch(48.8%_0.243_264.376)] font-semibold tracking-wide text-white"
          style={buttonStyle}
        >
          {showTop && (
            <span
              className="pointer-events-none absolute inset-x-0 top-0 bg-blue-200"
              style={{ height: PAD_Y }}
            />
          )}
          {showBottom && (
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-emerald-400/45"
              style={{ height: PAD_Y }}
            />
          )}
          <span
            className="relative z-10"
            style={{ outline: metricBox ? "1px solid #f472b6" : "none" }}
          >
            Check Out
          </span>
        </button>
      </div>

      {showValues && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <div className="rounded-lg bg-amber-400/15 px-2 py-2 text-amber-200">
            top {PAD_Y}px
          </div>
          <div className="rounded-lg bg-zinc-800 px-2 py-2 text-zinc-300">
            inline {PAD_X}px
          </div>
          <div className="rounded-lg bg-emerald-400/15 px-2 py-2 text-emerald-200">
            bottom {PAD_Y}px
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {toggles.map((t) => (
          <label
            key={t.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:border-zinc-700"
          >
            <input
              type="checkbox"
              checked={t.on}
              onChange={() => t.set((v) => !v)}
              className={t.accent}
            />
            {t.label}
          </label>
        ))}
      </div>
    </div>
  );
}
