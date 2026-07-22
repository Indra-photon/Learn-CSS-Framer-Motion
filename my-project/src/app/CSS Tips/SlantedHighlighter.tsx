import React from "react";

/* Shared SVG filters. Turbulence displacement roughens the ink/stroke so the
   marks look hand-made; the text itself is always drawn crisp on top. */
function MarkerFilters() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {/* Gentle organic wobble for edges. */}
        <filter id="marker-wobble" x="-15%" y="-40%" width="130%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.025"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={6}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Roughen for hand-drawn strokes (circle + scribble). */}
        <filter id="marker-scribble" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves={2}
            seed={11}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={4}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Wet ink: big displacement + a touch of blur = feathered bleed. */}
        <filter id="marker-wet" x="-40%" y="-80%" width="180%" height="260%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.02"
            numOctaves={3}
            seed={4}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={16}
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feGaussianBlur in="disp" stdDeviation={0.6} />
        </filter>
      </defs>
    </svg>
  );
}

/* Shared demo cell: label on top, the highlighted phrase below. */
function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-semibold">{children}</p>
    </div>
  );
}

/* 1. Translucent — text reads THROUGH the ink via multiply. */
function TranslucentHighlighter() {
  return (
    <Demo label="Translucent">
      <span className="hl hl--translucent">the lazy dog</span>
    </Demo>
  );
}

/* 2. Wobbly — organic hand-drawn edges via turbulence displacement. */
function WobblyHighlighter() {
  return (
    <Demo label="Wobbly">
      <span className="hl hl--wobbly">the lazy dog</span>
    </Demo>
  );
}

/* 3. Human imperfect — a hand-drawn double-loop circle that draws on. */
function ImperfectHighlighter() {
  return (
    <Demo label="Human imperfect">
      <span className="circled">
        the lazy dog
        <svg
          className="circled__mark"
          viewBox="0 0 300 120"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            pathLength={1}
            d="M24 70
               C10 34 120 14 196 18
               C270 22 300 46 274 70
               C246 96 128 104 58 88
               C10 76 6 38 46 22
               C124 2 262 10 290 46
               C304 64 288 80 244 86"
            filter="url(#marker-scribble)"
          />
        </svg>
      </span>
    </Demo>
  );
}

/* 4. Scribble fill — a zig-zag hatch that draws on, like coloring it in. */
function ScribbleFillHighlighter() {
  return (
    <Demo label="Scribble fill">
      <span className="scribbled">
        the lazy dog
        <svg
          className="scribbled__mark"
          viewBox="0 0 300 120"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            pathLength={1}
            d="M12 92 L44 30 L76 92 L108 30 L140 92 L172 30
               L204 92 L236 30 L268 92 L292 46"
            filter="url(#marker-scribble)"
          />
        </svg>
      </span>
    </Demo>
  );
}

/* 8. Wet ink bleed — soft, blotchy, feathered like ink soaking into paper. */
function WetInkHighlighter() {
  return (
    <Demo label="Wet ink">
      <span className="hl hl--wet">the lazy dog</span>
    </Demo>
  );
}

export {
  MarkerFilters,
  TranslucentHighlighter,
  WobblyHighlighter,
  ImperfectHighlighter,
  ScribbleFillHighlighter,
  WetInkHighlighter,
};
