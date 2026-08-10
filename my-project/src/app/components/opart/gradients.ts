import type { Variation } from "./variations";
import { TAU, clamp01, frac, lazy, mulberry32 } from "./sim";
import {
  makeRGBField,
  makeLut,
  fillLut,
  fillCyclicLut,
  oklchToSrgb,
  oklabToLinear,
  linearToOklab,
  srgbDecode,
  srgbEncode,
  spectrumToLinear,
  planck,
  BAYER8,
  type Lut,
} from "./color";

const byte = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
/** sRGB triple (0..1) → css */
const rgb = (c: Float64Array) =>
  `rgb(${byte(c[0])} ${byte(c[1])} ${byte(c[2])})`;
/** linear triple → css */
const rgbLinear = (c: Float64Array) =>
  `rgb(${byte(srgbEncode(c[0]))} ${byte(srgbEncode(c[1]))} ${byte(
    srgbEncode(c[2])
  )})`;

/* Shared scratch — these run once per pixel, so nothing allocates in here. */
const c3 = new Float64Array(3);
const c3b = new Float64Array(3);
const lab = new Float64Array(3);

/* ==================================================================== *
 * 01 — CONIC
 * A full hue revolution as a conic gradient, with stops placed in OKLCH so
 * the wheel keeps an even lightness instead of bulging at yellow and
 * collapsing at blue the way an HSL wheel does.
 * ==================================================================== */

type ConicCapable = CanvasRenderingContext2D & {
  createConicGradient?: (a: number, x: number, y: number) => CanvasGradient;
};

const conic: Variation = {
  id: "conic",
  name: "Conic",
  note: "hue revolution with stops placed in OKLCH · even lightness all the way round",
  period: 12,
  draw(ctx, size, tau) {
    const cx = size / 2;
    const cy = size / 2;
    const a = TAU * tau;
    const stops = 24;
    const cc = ctx as ConicCapable;

    if (cc.createConicGradient) {
      const g = cc.createConicGradient(a, cx, cy);
      for (let i = 0; i <= stops; i++) {
        const t = i / stops;
        oklchToSrgb(0.68, 0.15, t * TAU, c3);
        g.addColorStop(t, rgb(c3));
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    } else {
      // wedge fallback for engines without conic gradients
      for (let i = 0; i < stops; i++) {
        oklchToSrgb(0.68, 0.15, (i / stops) * TAU, c3);
        ctx.fillStyle = rgb(c3);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, size, a + (i / stops) * TAU, a + ((i + 1) / stops) * TAU);
        ctx.fill();
      }
    }

    // a lightness sheen, drawn as a radial ramp rather than a flat overlay
    const r = ctx.createRadialGradient(
      cx + Math.cos(-a) * size * 0.18,
      cy + Math.sin(-a) * size * 0.18,
      0,
      cx,
      cy,
      size * 0.72
    );
    r.addColorStop(0, "rgba(255,255,255,0.55)");
    r.addColorStop(0.55, "rgba(255,255,255,0.05)");
    r.addColorStop(1, "rgba(0,0,0,0.30)");
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, size, size);
  },
};

/* ==================================================================== *
 * 02 — MESH
 * Six colour sources on closed Lissajous orbits, blended per pixel by
 * inverse-square weights — in OKLab, so where two of them overlap you get
 * the colour between them and not the muddy average of their coordinates.
 * ==================================================================== */

const meshField = lazy(() => makeRGBField(140, 140));

const mesh: Variation = {
  id: "mesh",
  name: "Mesh",
  note: "six sources on closed orbits, weighted per pixel · blended in OKLab, not sRGB",
  period: 16,
  fps: 30,
  draw(ctx, size, tau) {
    const f = meshField();
    const n = 6;
    const px: number[] = [];
    const py: number[] = [];
    const cl: Float64Array[] = [];
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const fx = 1 + (i % 3);
      const fy = 1 + ((i + 2) % 3);
      px.push(0.5 + 0.34 * Math.cos(TAU * (fx * tau + p)));
      py.push(0.5 + 0.34 * Math.sin(TAU * (fy * tau + p * 1.7)));
      const L = 0.55 + 0.22 * Math.sin(TAU * (p + tau));
      const c = new Float64Array(3);
      oklchToSrgb(L, 0.16, TAU * (p + 0.12 * Math.sin(TAU * tau)), c);
      // keep the source colours in OKLab; the mixing happens there
      linearToOklab(srgbDecode(c[0]), srgbDecode(c[1]), srgbDecode(c[2]), c3b);
      cl.push(Float64Array.from(c3b));
    }

    f.set((x, y, out) => {
      const u = x / f.w;
      const v = y / f.h;
      let wsum = 0;
      let L = 0;
      let A = 0;
      let B = 0;
      for (let i = 0; i < n; i++) {
        const dx = u - px[i];
        const dy = v - py[i];
        const w = 1 / (dx * dx + dy * dy + 0.012);
        wsum += w;
        L += cl[i][0] * w;
        A += cl[i][1] * w;
        B += cl[i][2] * w;
      }
      oklabToLinear(L / wsum, A / wsum, B / wsum, out);
    });
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 03 — BANDING
 * The same shallow ramp quantised two ways. Left: rounded straight to the
 * bit depth, which is where the staircase comes from. Right: an ordered
 * Bayer offset added before the same rounding. Nothing else differs, and
 * the depth is dropped to 6 bits so the effect is visible this small.
 * ==================================================================== */

const bandField = lazy(() => makeRGBField(132, 132));

const banding: Variation = {
  id: "banding",
  name: "Banding",
  note: "identical ramp, quantised to 6 bits · left rounded, right dithered first",
  period: 14,
  fps: 30,
  draw(ctx, size, tau) {
    const f = bandField();
    const a = TAU * tau;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const levels = 64;
    oklchToSrgb(0.30, 0.09, 4.6, c3);
    oklchToSrgb(0.52, 0.11, 5.6, c3b);
    const r0 = srgbDecode(c3[0]);
    const g0 = srgbDecode(c3[1]);
    const b0 = srgbDecode(c3[2]);
    const r1 = srgbDecode(c3b[0]);
    const g1 = srgbDecode(c3b[1]);
    const b1 = srgbDecode(c3b[2]);

    f.set(
      (x, y, out) => {
        const u = (x / f.w - 0.5) * ca + (y / f.h - 0.5) * sa + 0.5;
        const t = clamp01(u);
        const dither = x > f.w / 2 ? BAYER8[(y & 7) * 8 + (x & 7)] : 0;
        const q = (v: number) => {
          const e = srgbEncode(v) * (levels - 1) + dither;
          return srgbDecode(Math.round(e) / (levels - 1));
        };
        out[0] = q(r0 + (r1 - r0) * t);
        out[1] = q(g0 + (g1 - g0) * t);
        out[2] = q(b0 + (b1 - b0) * t);
      },
      false // the writer's own dither would spoil the comparison
    );
    f.blit(ctx, size, false);

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();
  },
};

/* ==================================================================== *
 * 04 — SPACES
 * One pair of endpoint colours, three interpolations. sRGB darkens and
 * veers through grey in the middle; OKLab holds lightness; OKLCH walks the
 * hue circle and stays saturated the whole way. The endpoints rotate once
 * per loop so every hue pair gets its turn.
 * ==================================================================== */

const spaceField = lazy(() => makeRGBField(132, 132));

const spaces: Variation = {
  id: "spaces",
  name: "Spaces",
  note: "one colour pair, three interpolations · sRGB, OKLab, OKLCH from top to bottom",
  period: 15,
  fps: 30,
  draw(ctx, size, tau) {
    const f = spaceField();
    const h0 = TAU * tau;
    const h1 = h0 + 2.4;
    oklchToSrgb(0.62, 0.17, h0, c3);
    oklchToSrgb(0.62, 0.17, h1, c3b);
    const A = Float64Array.from(c3);
    const B = Float64Array.from(c3b);
    const Alab = new Float64Array(3);
    const Blab = new Float64Array(3);
    linearToOklab(srgbDecode(A[0]), srgbDecode(A[1]), srgbDecode(A[2]), Alab);
    linearToOklab(srgbDecode(B[0]), srgbDecode(B[1]), srgbDecode(B[2]), Blab);

    f.set((x, y, out) => {
      const t = x / (f.w - 1);
      const band = Math.floor((y / f.h) * 3);
      if (band === 0) {
        // the wrong one: lerping gamma-encoded channels
        out[0] = srgbDecode(A[0] + (B[0] - A[0]) * t);
        out[1] = srgbDecode(A[1] + (B[1] - A[1]) * t);
        out[2] = srgbDecode(A[2] + (B[2] - A[2]) * t);
      } else if (band === 1) {
        oklabToLinear(
          Alab[0] + (Blab[0] - Alab[0]) * t,
          Alab[1] + (Blab[1] - Alab[1]) * t,
          Alab[2] + (Blab[2] - Alab[2]) * t,
          out
        );
      } else {
        oklchToSrgb(0.62, 0.17, h0 + (h1 - h0) * t, c3);
        out[0] = srgbDecode(c3[0]);
        out[1] = srgbDecode(c3[1]);
        out[2] = srgbDecode(c3[2]);
      }
    });
    f.blit(ctx, size, false);
  },
};

/* ==================================================================== *
 * 05 — THIN FILM
 * Soap-bubble iridescence. Two-beam interference gives a reflectance of
 * sin²(2πnd/λ), so a film thickness picks out and cancels wavelengths; that
 * whole spectrum is then pushed through the CIE observer. The colour is
 * computed from the physics, not sampled from a photo.
 * ==================================================================== */

const filmLut = lazy(() => {
  const lut = makeLut();
  fillLut(lut, (t, o) => {
    const d = 90 + t * 1250; // film thickness, nm
    spectrumToLinear((nm) => {
      const p = Math.sin((TAU * 1.33 * d) / nm);
      return p * p;
    }, o);
    const k = 1.75;
    o[0] = srgbEncode(clamp01(o[0] * k));
    o[1] = srgbEncode(clamp01(o[1] * k));
    o[2] = srgbEncode(clamp01(o[2] * k));
  });
  return lut;
});

const filmField = lazy(() => makeRGBField(140, 140));

const thinFilm: Variation = {
  id: "thin-film",
  name: "Thin film",
  note: "soap-film interference sin²(2πnd/λ) integrated through the CIE observer",
  period: 13,
  fps: 30,
  draw(ctx, size, tau) {
    const f = filmField();
    const lut = filmLut();
    f.setLut((x, y) => {
      const u = x / f.w;
      const v = y / f.h;
      // gravity drains the film: thin at the top, thick at the bottom
      let d = 0.18 + v * 0.55;
      d += 0.1 * Math.sin(TAU * (2.1 * u + 1.4 * v - tau));
      d += 0.07 * Math.sin(TAU * (3.4 * v - 1.7 * u + 2 * tau));
      d += 0.05 * Math.sin(TAU * (1.3 * (u + v) + tau));
      return d;
    }, lut);
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 06 — NEWTON'S RINGS
 * The same interference, but the thickness comes from geometry: a sphere
 * resting on a flat gives an air gap of r²/2R, so the fringes are circles
 * that crowd together as you move out. The contact point orbits.
 * ==================================================================== */

const ringField = lazy(() => makeRGBField(140, 140));

const newtonRings: Variation = {
  id: "newton",
  name: "Newton's rings",
  note: "air gap r²/2R under a sphere · same spectral interference, circular fringes",
  period: 10,
  fps: 30,
  draw(ctx, size, tau) {
    const f = ringField();
    const lut = filmLut();
    const cx = 0.5 + 0.16 * Math.cos(TAU * tau);
    const cy = 0.5 + 0.16 * Math.sin(TAU * tau);
    const R = 1.9 + 0.55 * Math.sin(TAU * 2 * tau); // curvature breathes
    f.setLut((x, y) => {
      const dx = x / f.w - cx;
      const dy = y / f.h - cy;
      const r2 = dx * dx + dy * dy;
      return clamp01((r2 * R) / 0.36);
    }, lut);
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 07 — PRISM
 * Cauchy's dispersion, n(λ) = A + B/λ², fanned out one wavelength at a
 * time and composited additively — which is how light actually recombines.
 * Forty-eight monochromatic beams, each its own true spectral colour.
 * ==================================================================== */

const spectralBeams = lazy(() => {
  const out: { nm: number; css: string; dev: number }[] = [];
  const o = new Float64Array(3);
  for (let i = 0; i < 48; i++) {
    const nm = 400 + (i / 47) * 300;
    spectrumToLinear((l) => Math.exp(-((l - nm) ** 2) / (2 * 9 * 9)), o);
    const m = Math.max(o[0], o[1], o[2], 1e-6);
    const r = srgbEncode(clamp01(o[0] / m));
    const g = srgbEncode(clamp01(o[1] / m));
    const b = srgbEncode(clamp01(o[2] / m));
    const um = nm / 1000;
    const n = 1.5 + 0.0042 / (um * um); // Cauchy
    out.push({
      nm,
      css: `rgb(${(r * 255) | 0} ${(g * 255) | 0} ${(b * 255) | 0})`,
      dev: n,
    });
  }
  return out;
});

const prism: Variation = {
  id: "prism",
  name: "Prism",
  note: "Cauchy dispersion n(λ)=A+B/λ² · 48 monochromatic beams composited additively",
  period: 9,
  draw(ctx, size, tau) {
    const beams = spectralBeams();
    ctx.fillStyle = "#07070c";
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "lighter";

    const ox = size * 0.22;
    const oy = size * 0.5;
    const tilt = 0.55 + 0.34 * Math.sin(TAU * tau);
    const nMid = 1.517;

    for (const b of beams) {
      // deviation through a thin prism, referenced to the middle of the band
      const ang = (b.dev - nMid) * 5.6 * tilt + 0.12 * Math.sin(TAU * tau);
      const g = ctx.createLinearGradient(ox, oy, size * 1.1, oy + ang * size);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.12, b.css);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = g;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = size * 0.055;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(size * 1.1, oy + ang * size);
      ctx.stroke();
    }

    // the white beam going in
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = size * 0.035;
    const inG = ctx.createLinearGradient(0, oy - size * 0.28, ox, oy);
    inG.addColorStop(0, "rgba(255,255,255,0)");
    inG.addColorStop(1, "rgba(255,255,255,0.85)");
    ctx.strokeStyle = inG;
    ctx.beginPath();
    ctx.moveTo(0, oy - size * 0.28);
    ctx.lineTo(ox, oy);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  },
};

/* ==================================================================== *
 * 08 — BLACKBODY
 * Planck's law sampled from 1200 K to 12000 K and pushed through the CIE
 * observer: the real colour of a hot thing, including the fact that "warm"
 * light is the cold end of the scale.
 * ==================================================================== */

const bbLut = lazy(() => {
  const lut = makeLut();
  fillLut(lut, (t, o) => {
    const T = 1200 + t * 10800;
    spectrumToLinear((nm) => planck(nm, T), o);
    const m = Math.max(o[0], o[1], o[2], 1e-9);
    // normalise chromaticity, then re-apply a perceptual brightness ramp
    const b = 0.25 + 0.75 * Math.pow(t, 0.45);
    o[0] = srgbEncode(clamp01((o[0] / m) * b));
    o[1] = srgbEncode(clamp01((o[1] / m) * b));
    o[2] = srgbEncode(clamp01((o[2] / m) * b));
  });
  return lut;
});

const bbField = lazy(() => makeRGBField(140, 140));

const blackbody: Variation = {
  id: "blackbody",
  name: "Blackbody",
  note: "Planck's law from 1200 K to 12000 K · the actual colour of temperature",
  period: 11,
  fps: 30,
  draw(ctx, size, tau) {
    const f = bbField();
    const lut = bbLut();
    f.setLut((x, y) => {
      const u = x / f.w - 0.5;
      const v = y / f.h - 0.5;
      const r = Math.hypot(u, v);
      const a = Math.atan2(v, u);
      let T = 0.72 - r * 1.15;
      T += 0.13 * Math.sin(TAU * (tau - r * 2.2));
      T += 0.07 * Math.sin(3 * a + TAU * 2 * tau);
      return T;
    }, lut);
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 09 — AURORA
 * Not an arbitrary green. The colours are the emission lines themselves —
 * atomic oxygen at 557.7 nm and 630.0 nm, ionised nitrogen at 427.8 nm —
 * converted individually, then stacked additively the way real curtains
 * overlap along the line of sight.
 * ==================================================================== */

const auroraLines = lazy(() => {
  const line = (nm: number) => {
    const o = new Float64Array(3);
    spectrumToLinear((l) => Math.exp(-((l - nm) ** 2) / (2 * 6 * 6)), o);
    const m = Math.max(o[0], o[1], o[2], 1e-6);
    return [o[0] / m, o[1] / m, o[2] / m] as const;
  };
  return { green: line(557.7), red: line(630.0), blue: line(427.8) };
});

const auroraField = lazy(() => makeRGBField(140, 140));

const aurora: Variation = {
  id: "aurora",
  name: "Aurora",
  note: "oxygen at 557.7 and 630.0 nm, nitrogen at 427.8 nm · the real emission lines, stacked additively",
  period: 18,
  fps: 30,
  draw(ctx, size, tau) {
    const f = auroraField();
    const { green, red, blue } = auroraLines();
    const rnd = mulberry32(3);
    const curtains: { x: number; w: number; p: number; k: number }[] = [];
    for (let i = 0; i < 7; i++)
      curtains.push({
        x: rnd(),
        w: 0.05 + rnd() * 0.09,
        p: rnd(),
        k: 1 + Math.floor(rnd() * 3),
      });

    f.set((px, py, out) => {
      const u = px / f.w;
      const v = py / f.h;
      out[0] = 0.015;
      out[1] = 0.018;
      out[2] = 0.035;
      for (const c of curtains) {
        // the curtain folds: a vertical sheet displaced sideways
        const sway =
          0.055 * Math.sin(TAU * (c.k * tau + c.p + v * 1.6)) +
          0.03 * Math.sin(TAU * (2 * tau + v * 2.7 + c.p));
        const d = Math.abs(u - (c.x + sway));
        const across = Math.exp(-(d * d) / (2 * c.w * c.w));
        if (across < 0.004) continue;
        // altitude sorts the emission: red high, green mid, blue in the skirt
        const gA = across * Math.exp(-Math.pow((v - 0.62) / 0.3, 2)) * 1.15;
        const rA = across * Math.exp(-Math.pow((v - 0.16) / 0.34, 2)) * 0.42;
        const bA = across * Math.exp(-Math.pow((v - 0.93) / 0.16, 2)) * 0.5;
        const flick = 0.75 + 0.25 * Math.sin(TAU * (3 * tau + c.p * 5));
        out[0] += (green[0] * gA + red[0] * rA + blue[0] * bA) * flick;
        out[1] += (green[1] * gA + red[1] * rA + blue[1] * bA) * flick;
        out[2] += (green[2] * gA + red[2] * rA + blue[2] * bA) * flick;
      }
    });
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 10 — DOPPLER
 * Circular wavefronts from a source moving in a circle. Each arc is
 * coloured by the shift its own direction sees: λ′ = λ(1 − v·n̂/c), pushed
 * through the observer. Blue where the source ran into its own wave, red
 * where it ran away.
 * ==================================================================== */

const dopplerLut = lazy(() => {
  const lut = makeLut();
  fillLut(lut, (t, o) => {
    const nm = 430 + t * 240;
    spectrumToLinear((l) => Math.exp(-((l - nm) ** 2) / (2 * 14 * 14)), o);
    const m = Math.max(o[0], o[1], o[2], 1e-6);
    o[0] = srgbEncode(clamp01((o[0] / m) * 0.95));
    o[1] = srgbEncode(clamp01((o[1] / m) * 0.95));
    o[2] = srgbEncode(clamp01((o[2] / m) * 0.95));
  });
  return lut;
});

const dopplerLutCss = (lut: Lut, t: number) => {
  const i = Math.round(clamp01(t) * 255) * 3;
  return `rgb(${lut[i]} ${lut[i + 1]} ${lut[i + 2]})`;
};

const doppler: Variation = {
  id: "doppler",
  name: "Doppler",
  note: "wavefronts from an orbiting source · each arc coloured by λ′ = λ(1 − v·n̂/c)",
  period: 8,
  draw(ctx, size, tau) {
    ctx.fillStyle = "#0a0a10";
    ctx.fillRect(0, 0, size, size);
    const lut = dopplerLut();
    const cx = size / 2;
    const cy = size / 2;
    const orbit = size * 0.17;
    const beta = 0.42; // source speed as a fraction of the wave speed
    const N = 22;
    const arcs = 26;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = Math.max(1, size * 0.007);

    for (let k = 1; k <= N; k++) {
      const age = k / N;
      const te = tau - age;
      const ea = TAU * te;
      const sx = cx + orbit * Math.cos(ea);
      const sy = cy + orbit * Math.sin(ea);
      const vx = -Math.sin(ea);
      const vy = Math.cos(ea);
      const rad = age * size * 0.62;
      ctx.globalAlpha = 0.55 * (1 - age) + 0.06;
      for (let i = 0; i < arcs; i++) {
        const a0 = (i / arcs) * TAU;
        const a1 = ((i + 1) / arcs) * TAU;
        const am = (a0 + a1) / 2;
        // outward normal of this arc against the source velocity
        const shift = beta * (vx * Math.cos(am) + vy * Math.sin(am));
        ctx.strokeStyle = dopplerLutCss(lut, 0.5 + shift * 1.15);
        ctx.beginPath();
        ctx.arc(sx, sy, rad, a0, a1 + 0.02);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  },
};

/* ==================================================================== *
 * 11 — PLASMA
 * Summed sines through a cyclic OKLCH ramp. The palette is a closed loop in
 * hue AND in lightness, so the field has no visible seam where the ramp
 * wraps — the usual failure of a rainbow palette.
 * ==================================================================== */

const plasmaField = lazy(() => makeRGBField(132, 132));
const plasmaLut = lazy(() => makeLut());

const plasma: Variation = {
  id: "plasma",
  name: "Plasma",
  note: "summed sines through a cyclic OKLCH ramp · closed in hue and lightness, so no wrap seam",
  period: 12,
  fps: 30,
  draw(ctx, size, tau) {
    const f = plasmaField();
    const lut = plasmaLut();
    fillCyclicLut(lut, TAU * tau, TAU, 0.6, 0.22, 0.13);
    f.setLut((x, y) => {
      const u = x / f.w;
      const v = y / f.h;
      const s =
        Math.sin(TAU * (1.4 * u + tau)) +
        Math.sin(TAU * (1.9 * v - tau)) +
        Math.sin(TAU * (1.1 * (u + v) + 2 * tau)) +
        Math.sin(TAU * (2.3 * Math.hypot(u - 0.5, v - 0.5) - tau));
      return frac(s / 8 + 0.5);
    }, lut);
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 12 — HALFTONE
 * A duotone ramp resolved into dots. The dot area carries the value and the
 * ink colour is interpolated in OKLab across eight bins, so it stays one
 * batched fill per bin instead of a state change per dot.
 * ==================================================================== */

const halftone: Variation = {
  id: "halftone",
  name: "Halftone",
  note: "dot area carries the value, ink interpolated in OKLab · eight bins, eight fills",
  period: 10,
  draw(ctx, size, tau) {
    // paper first, as a real gradient rather than flat white
    oklchToSrgb(0.95, 0.035, 1.4 + TAU * tau, c3);
    oklchToSrgb(0.88, 0.05, 4.2 + TAU * tau, c3b);
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, rgb(c3));
    bg.addColorStop(1, rgb(c3b));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const bins = 8;
    const paths: Path2D[] = [];
    for (let i = 0; i < bins; i++) paths.push(new Path2D());

    const n = 30;
    const cell = size / n;
    const ang = TAU * tau + 0.4;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);

    for (let j = -4; j < n + 4; j++) {
      for (let i = -4; i < n + 4; i++) {
        // rotate the screen, not the image
        const gx = (i + 0.5 - n / 2) * cell;
        const gy = (j + 0.5 - n / 2) * cell;
        const x = size / 2 + gx * ca - gy * sa;
        const y = size / 2 + gx * sa + gy * ca;
        if (x < -cell || x > size + cell || y < -cell || y > size + cell)
          continue;
        const u = x / size;
        const v = y / size;
        const val = clamp01(
          0.5 +
            0.32 * Math.sin(TAU * (1.3 * u + 0.7 * v - tau)) +
            0.2 * Math.sin(TAU * (2.1 * v + tau))
        );
        const r = cell * 0.72 * Math.sqrt(val);
        if (r < 0.2) continue;
        const b = Math.min(bins - 1, (val * bins) | 0);
        paths[b].moveTo(x + r, y);
        paths[b].arc(x, y, r, 0, TAU);
      }
    }

    const A = new Float64Array(3);
    const B = new Float64Array(3);
    oklchToSrgb(0.42, 0.16, 4.9, c3);
    linearToOklab(srgbDecode(c3[0]), srgbDecode(c3[1]), srgbDecode(c3[2]), A);
    oklchToSrgb(0.66, 0.19, 0.7, c3b);
    linearToOklab(srgbDecode(c3b[0]), srgbDecode(c3b[1]), srgbDecode(c3b[2]), B);

    for (let i = 0; i < bins; i++) {
      const t = i / (bins - 1);
      oklabToLinear(
        A[0] + (B[0] - A[0]) * t,
        A[1] + (B[1] - A[1]) * t,
        A[2] + (B[2] - A[2]) * t,
        lab
      );
      ctx.fillStyle = rgbLinear(lab);
      ctx.fill(paths[i]);
    }
  },
};

/* ==================================================================== *
 * 13 — SPECTRAL CAUSTICS
 * The pool-floor caustic again, but solved once per wavelength. Water is
 * dispersive, so each colour focuses at a slightly different depth and the
 * ribs separate into spectra at their edges — which is exactly what the
 * bright lines look like in life.
 * ==================================================================== */

const causticBands = lazy(() => {
  const out: { d: number; r: number; g: number; b: number }[] = [];
  const o = new Float64Array(3);
  const N = 7;
  for (let i = 0; i < N; i++) {
    const nm = 420 + (i / (N - 1)) * 250;
    spectrumToLinear((l) => Math.exp(-((l - nm) ** 2) / (2 * 22 * 22)), o);
    const um = nm / 1000;
    const n = 1.324 + 0.0032 / (um * um); // water, Cauchy
    // water's real dispersion is under 1% across the visible band; the focal
    // spread is amplified here so the fringes read at this size
    const spread = 1 + 14 * (n / 1.333 - 1);
    out.push({ d: 0.05 * spread, r: o[0] / N, g: o[1] / N, b: o[2] / N });
  }
  return out;
});

const spectralField = lazy(() => makeRGBField(130, 130));

const spectralCaustics: Variation = {
  id: "spectral-caustics",
  name: "Spectral caustics",
  note: "the caustic solved once per wavelength · dispersion (amplified) splits the ribs into spectra",
  period: 14,
  fps: 30,
  draw(ctx, size, tau) {
    const f = spectralField();
    const bands = causticBands();
    const waves = [
      { ax: 4.1, ay: 1.3, a: 0.02, n: 1 },
      { ax: -1.7, ay: 3.6, a: 0.017, n: -1 },
      { ax: 2.6, ay: -3.1, a: 0.013, n: 2 },
      { ax: 5.3, ay: 4.4, a: 0.008, n: -2 },
    ];
    f.set((px, py, out) => {
      const x = px / f.w;
      const y = py / f.h;
      let hxx = 0;
      let hyy = 0;
      let hxy = 0;
      for (const w of waves) {
        const k = TAU * (w.ax * x + w.ay * y - w.n * tau);
        const s = -w.a * Math.sin(k) * TAU * TAU;
        hxx += s * w.ax * w.ax;
        hyy += s * w.ay * w.ay;
        hxy += s * w.ax * w.ay;
      }
      out[0] = 0.02;
      out[1] = 0.05;
      out[2] = 0.09;
      for (const b of bands) {
        const det =
          (1 - b.d * hxx) * (1 - b.d * hyy) - b.d * b.d * hxy * hxy;
        const I = Math.min(6, 1 / Math.max(0.05, Math.abs(det)));
        out[0] += b.r * I * 0.5;
        out[1] += b.g * I * 0.5;
        out[2] += b.b * I * 0.5;
      }
    });
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 14 — THERMAL WAVES
 * Periodically heated points in a conducting plate. The diffusion equation
 * under sinusoidal forcing has a closed periodic solution — a wave that
 * decays and lags by the same length, the thermal skin depth — so this is
 * an exact solution rather than a stepped simulation.
 * ==================================================================== */

const thermalField = lazy(() => makeRGBField(140, 140));
const thermalLut = lazy(() => {
  const lut = makeLut();
  fillLut(lut, (t, o) => {
    // a sequential ramp built in OKLCH: dark blue → magenta → warm white
    const L = 0.12 + 0.82 * Math.pow(t, 0.85);
    const C = 0.16 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.03;
    const h = 4.9 - 1.9 * t;
    oklchToSrgb(L, C, h, o);
  });
  return lut;
});

const thermal: Variation = {
  id: "thermal",
  name: "Thermal waves",
  note: "diffusion under periodic heating · decay length equals lag length, solved in closed form",
  period: 9,
  fps: 30,
  draw(ctx, size, tau) {
    const f = thermalField();
    const lut = thermalLut();
    const src = [
      { x: 0.28, y: 0.3, n: 1, d: 0.16 },
      { x: 0.74, y: 0.36, n: 2, d: 0.12 },
      { x: 0.5, y: 0.78, n: 1, d: 0.2 },
      { x: 0.16, y: 0.72, n: 3, d: 0.1 },
    ];
    f.setLut((px, py) => {
      const x = px / f.w;
      const y = py / f.h;
      let T = 0.18;
      for (const s of src) {
        const r = Math.hypot(x - s.x, y - s.y);
        const k = r / s.d; // same coefficient decays and delays
        T += 0.55 * Math.exp(-k) * Math.cos(TAU * s.n * tau - k);
      }
      return T;
    }, lut);
    f.blit(ctx, size);
  },
};

/* ==================================================================== *
 * 15 — BLOOM
 * Light adds. Six emitters at their own colour temperatures, each drawn as
 * a radial falloff and composited with `lighter`, so overlaps climb toward
 * white the way exposure does instead of muddying like paint.
 * ==================================================================== */

const bloom: Variation = {
  id: "bloom",
  name: "Bloom",
  note: "six emitters at their own colour temperatures, composited with `lighter`",
  period: 11,
  draw(ctx, size, tau) {
    ctx.fillStyle = "#08080e";
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "lighter";
    const lut = bbLut();
    const rnd = mulberry32(5);

    for (let i = 0; i < 6; i++) {
      const p = rnd();
      const fx = 1 + Math.floor(rnd() * 3);
      const fy = 1 + Math.floor(rnd() * 3);
      const x = size * (0.5 + 0.3 * Math.cos(TAU * (fx * tau + p)));
      const y = size * (0.5 + 0.3 * Math.sin(TAU * (fy * tau + p * 2.1)));
      const R = size * (0.22 + 0.14 * Math.sin(TAU * (tau + p)));
      const t = clamp01(0.18 + 0.7 * p + 0.12 * Math.sin(TAU * (2 * tau + p)));
      const i3 = Math.round(t * 255) * 3;
      const col = `${lut[i3]},${lut[i3 + 1]},${lut[i3 + 2]}`;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      // smooth falloff: three stops, because two banks up in the middle
      g.addColorStop(0, `rgba(${col},0.95)`);
      g.addColorStop(0.35, `rgba(${col},0.35)`);
      g.addColorStop(0.7, `rgba(${col},0.08)`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  },
};

export const GRADIENTS: Variation[] = [
  conic,
  mesh,
  banding,
  spaces,
  thinFilm,
  newtonRings,
  prism,
  blackbody,
  aurora,
  doppler,
  plasma,
  halftone,
  spectralCaustics,
  thermal,
  bloom,
];
