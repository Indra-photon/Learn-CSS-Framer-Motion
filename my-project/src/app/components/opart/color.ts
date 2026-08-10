/**
 * Colour engine for the gradient loops.
 *
 * Two convictions run through all of it:
 *
 * 1. Mix in OKLab, never in sRGB. Averaging gamma-encoded channels is a
 *    numerical accident, not a colour operation — it drags every crossfade
 *    through a dead grey and bends hues on the way.
 * 2. Quantising to 8 bits is where gradients go to die. Every ramp here is
 *    computed in float and dithered on the way down, so wide shallow washes
 *    stay smooth instead of banding into stripes.
 *
 * Where a piece claims a physical colour — a soap film, a hot filament, an
 * aurora — the spectrum is built first and converted through the CIE
 * observer, rather than being eyeballed from a hex code.
 */

/* ---------------------------------------------------------------- sRGB */

export const srgbEncode = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

export const srgbDecode = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/* --------------------------------------------------------------- OKLab */

/** OKLab → linear sRGB (Ottosson). */
export function oklabToLinear(
  L: number,
  a: number,
  b: number,
  out: Float64Array
) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  out[0] = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  out[1] = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  out[2] = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
}

/** linear sRGB → OKLab. */
export function linearToOklab(
  r: number,
  g: number,
  b: number,
  out: Float64Array
) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  out[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  out[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  out[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
}

const _rgb = new Float64Array(3);

const inGamut = (v: Float64Array, eps = 0.0005) =>
  v[0] >= -eps && v[0] <= 1 + eps &&
  v[1] >= -eps && v[1] <= 1 + eps &&
  v[2] >= -eps && v[2] <= 1 + eps;

/**
 * OKLCH → sRGB, holding lightness and hue and giving up chroma when the
 * colour falls outside the display. Clipping channels instead would shift
 * the hue, which is exactly what you notice.
 */
export function oklchToSrgb(
  L: number,
  C: number,
  h: number,
  out: Float64Array
) {
  const cosh = Math.cos(h);
  const sinh = Math.sin(h);
  oklabToLinear(L, C * cosh, C * sinh, _rgb);
  if (!inGamut(_rgb)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      oklabToLinear(L, mid * cosh, mid * sinh, _rgb);
      if (inGamut(_rgb)) lo = mid;
      else hi = mid;
    }
    oklabToLinear(L, lo * cosh, lo * sinh, _rgb);
  }
  out[0] = srgbEncode(Math.min(1, Math.max(0, _rgb[0])));
  out[1] = srgbEncode(Math.min(1, Math.max(0, _rgb[1])));
  out[2] = srgbEncode(Math.min(1, Math.max(0, _rgb[2])));
}

export function oklchCss(L: number, C: number, h: number) {
  oklchToSrgb(L, C, h, _out3);
  return `rgb(${(_out3[0] * 255) | 0} ${(_out3[1] * 255) | 0} ${
    (_out3[2] * 255) | 0
  })`;
}
const _out3 = new Float64Array(3);

/* ------------------------------------------------------- CIE spectral */

/** Piecewise Gaussian used by the analytic CMF fits. */
const pg = (x: number, mu: number, s1: number, s2: number) => {
  const t = (x - mu) * (x < mu ? 1 / s1 : 1 / s2);
  return Math.exp(-0.5 * t * t);
};

/**
 * CIE 1931 colour matching functions, multi-lobe analytic fit
 * (Wyman, Sloan & Shirley). Accurate enough to render a spectrum honestly
 * without shipping a table of tristimulus samples.
 */
export function cieXYZ(nm: number, out: Float64Array) {
  out[0] =
    1.056 * pg(nm, 599.8, 37.9, 31.0) +
    0.362 * pg(nm, 442.0, 16.0, 26.7) -
    0.065 * pg(nm, 501.1, 20.4, 26.2);
  out[1] = 0.821 * pg(nm, 568.8, 46.9, 40.5) + 0.286 * pg(nm, 530.9, 16.3, 31.1);
  out[2] = 1.217 * pg(nm, 437.0, 11.8, 36.0) + 0.681 * pg(nm, 459.0, 26.0, 13.8);
}

const _xyz = new Float64Array(3);

/** Integrate a spectral power distribution into linear sRGB. */
export function spectrumToLinear(
  S: (nm: number) => number,
  out: Float64Array,
  lo = 390,
  hi = 730,
  step = 8
) {
  let X = 0;
  let Y = 0;
  let Z = 0;
  let norm = 0;
  for (let nm = lo; nm <= hi; nm += step) {
    const s = S(nm);
    cieXYZ(nm, _xyz);
    X += s * _xyz[0];
    Y += s * _xyz[1];
    Z += s * _xyz[2];
    norm += _xyz[1];
  }
  X /= norm;
  Y /= norm;
  Z /= norm;
  out[0] = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  out[1] = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  out[2] = 0.0557 * X - 0.204 * Y + 1.057 * Z;
}

/** Planck's law, per unit wavelength, in arbitrary units. */
export function planck(nm: number, T: number) {
  const l = nm * 1e-9;
  const c1 = 3.7418e-16;
  const c2 = 1.4388e-2;
  return c1 / (Math.pow(l, 5) * (Math.exp(c2 / (l * T)) - 1));
}

/* ------------------------------------------------------------ palettes */

export type Lut = Uint8ClampedArray;

/** 256-entry sRGB lookup, rebuilt per frame when the palette animates. */
export function makeLut(): Lut {
  return new Uint8ClampedArray(256 * 3);
}

export function fillLut(lut: Lut, fn: (t: number, out: Float64Array) => void) {
  const o = new Float64Array(3);
  for (let i = 0; i < 256; i++) {
    fn(i / 255, o);
    lut[i * 3] = o[0] * 255;
    lut[i * 3 + 1] = o[1] * 255;
    lut[i * 3 + 2] = o[2] * 255;
  }
}

/** Cyclic OKLCH ramp — L and C ride the hue so it never flattens out. */
export function fillCyclicLut(
  lut: Lut,
  hue0: number,
  span = Math.PI * 2,
  L0 = 0.62,
  Lamp = 0.2,
  C = 0.14
) {
  fillLut(lut, (t, o) => {
    const h = hue0 + t * span;
    const L = L0 + Lamp * Math.sin(t * Math.PI * 2);
    oklchToSrgb(L, C, h, o);
  });
}

/* ------------------------------------------------------------ dithering */

/** Ordered Bayer 8×8, normalised to (−0.5, 0.5]. */
export const BAYER8 = (() => {
  const n = 8;
  const m = new Float64Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      let v = 0;
      let mask = n >> 1;
      let bit = 0;
      while (mask) {
        const bx = (x & mask) ? 1 : 0;
        const by = (y & mask) ? 1 : 0;
        v |= ((by ^ bx) << (2 * bit)) | (by << (2 * bit + 1));
        mask >>= 1;
        bit++;
      }
      m[y * n + x] = v / (n * n) - 0.5;
    }
  return m;
})();

/* --------------------------------------------------------- RGB raster */

/**
 * Offscreen RGB field. Everything is computed in float and quantised once,
 * here, with an ordered dither — the difference between a clean wash and a
 * staircase of bands is entirely in this last step.
 */
export function makeRGBField(w: number, h: number) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  const img = c.createImageData(w, h);
  const d = img.data;
  const tmp = new Float64Array(3);

  const flush = () => c.putImageData(img, 0, 0);

  return {
    w,
    h,
    /** fn writes LINEAR rgb; encoding and dithering happen here. */
    set(fn: (x: number, y: number, out: Float64Array) => void, dither = true) {
      let p = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          fn(x, y, tmp);
          const n = dither ? BAYER8[(y & 7) * 8 + (x & 7)] : 0;
          d[p] = srgbEncode(tmp[0]) * 255 + n;
          d[p + 1] = srgbEncode(tmp[1]) * 255 + n;
          d[p + 2] = srgbEncode(tmp[2]) * 255 + n;
          d[p + 3] = 255;
          p += 4;
        }
      }
      flush();
    },
    /** fn returns 0..1 into a palette; interpolated, then dithered. */
    setLut(fn: (x: number, y: number) => number, lut: Lut, dither = true) {
      let p = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let v = fn(x, y);
          v = v < 0 ? 0 : v > 1 ? 1 : v;
          const t = v * 254.999;
          const i0 = t | 0;
          const f = t - i0;
          const a = i0 * 3;
          const b = a + 3;
          const n = dither ? BAYER8[(y & 7) * 8 + (x & 7)] : 0;
          d[p] = lut[a] + (lut[b] - lut[a]) * f + n;
          d[p + 1] = lut[a + 1] + (lut[b + 1] - lut[a + 1]) * f + n;
          d[p + 2] = lut[a + 2] + (lut[b + 2] - lut[a + 2]) * f + n;
          d[p + 3] = 255;
          p += 4;
        }
      }
      flush();
    },
    blit(ctx: CanvasRenderingContext2D, size: number, smooth = true) {
      ctx.imageSmoothingEnabled = smooth;
      ctx.drawImage(cv, 0, 0, size, size);
    },
  };
}
