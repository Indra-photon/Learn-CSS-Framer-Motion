import type { Variation } from "./variations";
import {
  TAU,
  INK,
  clamp01,
  frac,
  mulberry32,
  lazy,
  makeRK4,
  closeDrift,
  sampleFrames,
  makeField,
  laplacian,
} from "./sim";

/* ==================================================================== *
 * 01 — LORENZ, UNSTABLE PERIODIC ORBIT
 *
 * The trajectory itself never repeats — that is what the butterfly effect
 * means. But the attractor is built out of an infinite skeleton of orbits
 * that DO close. Found here by close returns on the z = 27 Poincaré section:
 * integrate, record crossings, and look for a crossing that lands back on
 * top of one two loops earlier. That pair brackets one turn of the LR orbit.
 * ==================================================================== */

const lorenzDeriv = (t: number, y: Float64Array, o: Float64Array) => {
  o[0] = 10 * (y[1] - y[0]);
  o[1] = y[0] * (28 - y[2]) - y[1];
  o[2] = y[0] * y[1] - (8 / 3) * y[2];
};

const lorenzUPO = lazy(() => {
  const step = makeRK4(3, lorenzDeriv);
  const y = Float64Array.from([1, 1, 20]);
  const dt = 0.002;
  for (let i = 0; i < 15000; i++) step(y, 0, dt); // land on the attractor

  // upward crossings of the plane z = rho - 1
  const sect: { x: number; y: number; t: number; s: Float64Array }[] = [];
  let t = 0;
  for (let i = 0; i < 900000 && sect.length < 2200; i++) {
    const pz = y[2];
    step(y, t, dt);
    t += dt;
    if (pz < 27 && y[2] >= 27)
      sect.push({ x: y[0], y: y[1], t, s: Float64Array.from(y) });
  }

  // the LR orbit: a crossing that returns to itself after two wing loops
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i + 2 < sect.length; i++) {
    const d = Math.hypot(sect[i].x - sect[i + 2].x, sect[i].y - sect[i + 2].y);
    if (d < bd) {
      bd = d;
      best = i;
    }
  }

  const T = sect[best + 2].t - sect[best].t;
  const N = 900;
  const h = T / N;
  const s = Float64Array.from(sect[best].s);
  const raw: Float64Array[] = [];
  for (let i = 0; i <= N; i++) {
    raw.push(Float64Array.from(s));
    if (i < N) step(s, 0, h);
  }
  return { frames: closeDrift(raw), T, err: bd };
});

const lorenz: Variation = {
  id: "lorenz-upo",
  name: "Lorenz orbit",
  note: "unstable periodic orbit found by close returns on the z=27 section — the one butterfly that closes",
  period: 7,
  draw(ctx, size, tau) {
    const { frames } = lorenzUPO();
    const s = size / 60;
    const px = (v: number) => size / 2 + v * s;
    const pz = (v: number) => size * 0.95 - v * s * 0.86;

    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(0.6, size * 0.0035);
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      if (i === 0) ctx.moveTo(px(f[0]), pz(f[2]));
      else ctx.lineTo(px(f[0]), pz(f[2]));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;

    // a comb of particles riding the same closed orbit, one loop apart
    const M = 26;
    const p = new Float64Array(3);
    const path = new Path2D();
    for (let k = 0; k < M; k++) {
      sampleFrames(frames, tau + k / M, p);
      const sp = Math.hypot(10 * (p[1] - p[0]), p[0] * p[1] - (8 / 3) * p[2]);
      const r = size * 0.006 + size * 0.016 * clamp01(sp / 260);
      path.moveTo(px(p[0]) + r, pz(p[2]));
      path.arc(px(p[0]), pz(p[2]), r, 0, TAU);
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ==================================================================== *
 * 02 — TALBOT CARPET
 * Energies of the diffraction orders go as n², so the phases e^{-iπn²z}
 * are all unity again at z = 2. Exact self-imaging: the only system here
 * whose periodicity is guaranteed by integers rather than by a solver.
 * ==================================================================== */

const talbotCoef = (() => {
  const M = 13;
  const c: number[] = [];
  for (let n = -M; n <= M; n++)
    c.push(n === 0 ? 0.5 : Math.sin((Math.PI * n) / 2) / (Math.PI * n));
  return { M, c };
})();

const talbot: Variation = {
  id: "talbot",
  name: "Talbot carpet",
  note: "Fresnel self-imaging of a grating · phases go as n² so z=2 revives exactly",
  period: 12,
  fps: 30,
  draw(ctx, size, tau) {
    const n = 30;
    const cell = size / n;
    const { M, c } = talbotCoef;
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      const z = frac((j / n) * 0.5 + tau) * 2; // one full Talbot distance
      for (let i = 0; i < n; i++) {
        const x = i / n;
        let re = 0;
        let im = 0;
        for (let k = -M; k <= M; k++) {
          const a = TAU * k * x - Math.PI * k * k * z;
          const w = c[k + M];
          re += w * Math.cos(a);
          im += w * Math.sin(a);
        }
        const I = clamp01((re * re + im * im) * 1.15);
        const r = cell * 0.5 * Math.pow(I, 0.75);
        if (r < 0.25) continue;
        path.rect((i + 0.5) * cell - r, (j + 0.5) * cell - r, r * 2, r * 2);
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ==================================================================== *
 * 03 — FIGURE-EIGHT CHOREOGRAPHY
 * Three equal masses on one closed curve (Chenciner & Montgomery, 2000).
 * Newtonian gravity, exactly periodic, integrated straight from the
 * published initial condition.
 * ==================================================================== */

const figure8 = lazy(() => {
  const x1 = 0.97000436;
  const y1 = -0.24308753;
  const vx = 0.93240737;
  const vy = 0.86473146;
  const T = 6.32591398;
  // state: x,y,vx,vy per body
  const y0 = Float64Array.from([
    x1, y1, vx / 2, vy / 2,
    -x1, -y1, vx / 2, vy / 2,
    0, 0, -vx, -vy,
  ]);
  const f = (t: number, s: Float64Array, o: Float64Array) => {
    for (let i = 0; i < 3; i++) {
      const b = i * 4;
      o[b] = s[b + 2];
      o[b + 1] = s[b + 3];
      let ax = 0;
      let ay = 0;
      for (let j = 0; j < 3; j++) {
        if (i === j) continue;
        const a = j * 4;
        const dx = s[a] - s[b];
        const dy = s[a + 1] - s[b + 1];
        const r = Math.max(1e-6, Math.hypot(dx, dy));
        const inv = 1 / (r * r * r);
        ax += dx * inv;
        ay += dy * inv;
      }
      o[b + 2] = ax;
      o[b + 3] = ay;
    }
  };
  const step = makeRK4(12, f);
  const N = 720;
  const h = T / N;
  const sub = 6;
  const s = Float64Array.from(y0);
  const raw: Float64Array[] = [];
  for (let i = 0; i <= N; i++) {
    raw.push(Float64Array.from(s));
    if (i < N) for (let k = 0; k < sub; k++) step(s, 0, h / sub);
  }
  return closeDrift(raw);
});

const choreography: Variation = {
  id: "figure8",
  name: "Figure-eight",
  note: "three-body choreography · Newtonian gravity that is exactly periodic by construction",
  period: 6,
  draw(ctx, size, tau) {
    const frames = figure8();
    const s = size * 0.36;
    const px = (v: number) => size / 2 + v * s;
    const py = (v: number) => size / 2 - v * s * 1.9;

    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(0.7, size * 0.004);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      if (i === 0) ctx.moveTo(px(f[0]), py(f[1]));
      else ctx.lineTo(px(f[0]), py(f[1]));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;

    const p = new Float64Array(12);
    const path = new Path2D();
    // ghosts along the shared curve, then the three bodies themselves
    for (let k = 1; k < 12; k++) {
      sampleFrames(frames, tau + k / 36, p);
      const r = size * 0.012 * (1 - k / 14);
      for (let b = 0; b < 3; b++) {
        path.moveTo(px(p[b * 4]) + r, py(p[b * 4 + 1]));
        path.arc(px(p[b * 4]), py(p[b * 4 + 1]), r, 0, TAU);
      }
    }
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = INK;
    ctx.fill(path);
    ctx.globalAlpha = 1;

    sampleFrames(frames, tau, p);
    const body = new Path2D();
    for (let b = 0; b < 3; b++) {
      const r = size * 0.028;
      body.moveTo(px(p[b * 4]) + r, py(p[b * 4 + 1]));
      body.arc(px(p[b * 4]), py(p[b * 4 + 1]), r, 0, TAU);
    }
    ctx.fill(body);
  },
};

/* ==================================================================== *
 * 04 — TROCHOIDS, CHARGE IN CROSSED E AND B
 * Drift plus gyration. Curtate below k=1, cycloid at k=1, prolate above:
 * the loops that appear past k=1 are the particle briefly moving backwards.
 * One gyration advances the drift by exactly one spatial period.
 * ==================================================================== */

const trochoid: Variation = {
  id: "trochoid",
  name: "Trochoids",
  note: "E×B drift + gyration · curtate → cycloid → prolate down the rows",
  period: 9,
  draw(ctx, size, tau) {
    const rows = 9;
    const a = size / 3.2; // drift per radian
    const gap = size / rows;
    ctx.strokeStyle = INK;
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(0.8, size * 0.005);

    const path = new Path2D();
    for (let r = 0; r < rows; r++) {
      const k = 0.25 + (r / (rows - 1)) * 1.85; // gyroradius / drift
      const b = a * k;
      const cy = (r + 0.5) * gap;
      const th0 = TAU * tau;
      const N = 220;
      const span = TAU * 3.4;
      for (let i = 0; i <= N; i++) {
        const th = th0 + (i / N) * span - span / 2;
        const x = a * (th - th0) - b * Math.sin(th) + size / 2;
        const y = cy - b * Math.cos(th) * 0.42;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
    }
    ctx.stroke(path);
  },
};

/* ==================================================================== *
 * 05 — FPU–TSINGOU RECURRENCE
 * A nonlinear spring chain that refuses to thermalise: energy leaves mode 1,
 * wanders the spectrum, and comes back. The recurrence time isn't assumed
 * here — it's found by watching mode-1 energy and taking its first revival.
 * ==================================================================== */

const fpu = lazy(() => {
  const N = 32;
  const alpha = 0.25;
  const dt = 0.05;
  const u = new Float64Array(N + 1);
  const v = new Float64Array(N + 1);
  for (let i = 1; i < N; i++) u[i] = Math.sin((Math.PI * i) / N);

  const acc = (u: Float64Array, o: Float64Array) => {
    for (let i = 1; i < N; i++) {
      const dR = u[i + 1] - u[i];
      const dL = u[i] - u[i - 1];
      o[i] = dR - dL + alpha * (dR * dR - dL * dL);
    }
  };
  const a = new Float64Array(N + 1);
  acc(u, a);

  const mode1 = (u: Float64Array) => {
    let s = 0;
    for (let i = 1; i < N; i++) s += u[i] * Math.sin((Math.PI * i) / N);
    return (s * 2) / N;
  };

  const snaps: Float64Array[] = [];
  const energy: number[] = [];
  const steps = 8000;
  const every = 4;
  for (let s = 0; s < steps; s++) {
    for (let i = 1; i < N; i++) {
      v[i] += 0.5 * dt * a[i];
      u[i] += dt * v[i];
    }
    acc(u, a);
    for (let i = 1; i < N; i++) v[i] += 0.5 * dt * a[i];
    if (s % every === 0) {
      snaps.push(Float64Array.from(u));
      energy.push(Math.abs(mode1(u)));
    }
  }

  // first revival: drop out of mode 1, then come back to a local maximum
  let lo = 0;
  for (let i = 20; i < energy.length; i++) {
    if (energy[i] < energy[lo]) lo = i;
    if (i > 200 && energy[i] > 0.5) break;
  }
  let rev = lo;
  let bestE = 0;
  for (let i = lo; i < energy.length; i++) {
    if (energy[i] > bestE) {
      bestE = energy[i];
      rev = i;
    }
    if (energy[i] < bestE * 0.7 && i > rev + 30) break;
  }
  return { snaps: snaps.slice(0, Math.max(60, rev)), N };
});

const fpuRecurrence: Variation = {
  id: "fpu",
  name: "FPU recurrence",
  note: "nonlinear spring chain · energy leaves mode 1 and returns · revival found, not assumed",
  period: 10,
  draw(ctx, size, tau) {
    const { snaps, N } = fpu();
    const rows = 34;
    const cw = size / (N - 1);
    const rh = size / rows;
    const path = new Path2D();
    for (let r = 0; r < rows; r++) {
      const idx =
        Math.floor(frac(tau + (r / rows) * 0.35) * snaps.length) % snaps.length;
      const u = snaps[idx];
      const y = (r + 0.5) * rh;
      for (let i = 1; i < N; i++) {
        const m = clamp01(Math.abs(u[i]) * 0.85);
        const h = rh * 0.46 * m;
        const w = cw * 0.34;
        if (h < 0.3) continue;
        path.rect((i - 0.5) * cw - w / 2, y - h, w, h * 2);
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ==================================================================== *
 * 06 — CHLADNI FIGURES
 * Nodal lines of a square plate. Two mode pairs beating against each other
 * at a 1:2 frequency ratio, so the whole superposition closes in one loop.
 * Sand collects where the displacement vanishes.
 * ==================================================================== */

const chladni: Variation = {
  id: "chladni",
  name: "Chladni",
  note: "plate modes at a 1:2 ratio · sand collects on the nodal lines",
  period: 11,
  draw(ctx, size, tau) {
    const n = 46;
    const cell = size / n;
    // three mode pairs in quadrature — a plain 1:2 pair would make the
    // half-loop a mirror of the start and quietly halve the piece
    const A = Math.cos(TAU * tau);
    const B = Math.sin(TAU * tau);
    const C = 0.7 * Math.cos(TAU * 2 * tau);
    const mode = (x: number, y: number, m: number, k: number) =>
      Math.cos(m * Math.PI * x) * Math.cos(k * Math.PI * y) -
      Math.cos(k * Math.PI * x) * Math.cos(m * Math.PI * y);

    const path = new Path2D();
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) / n;
        const y = (j + 0.5) / n;
        const w =
          A * mode(x, y, 3, 6) + B * mode(x, y, 2, 5) + C * mode(x, y, 1, 4);
        const s = Math.exp(-(w * w) / 0.018); // sand density
        const r = cell * 0.62 * s;
        if (r < 0.22) continue;
        path.moveTo((i + 0.5) * cell + r, (j + 0.5) * cell);
        path.arc((i + 0.5) * cell, (j + 0.5) * cell, r, 0, TAU);
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ==================================================================== *
 * 07 — KURAMOTO
 * A lattice of phase oscillators with nearest-neighbour coupling. Coupling
 * is swept up and back down over the loop, so the field locks into order and
 * then falls apart again. Natural frequencies are whole numbers per loop, and
 * the residual phase drift is spread out linearly, so the cycle closes.
 * ==================================================================== */

const kuramoto = lazy(() => {
  const n = 20;
  const M = n * n;
  const rnd = mulberry32(7);
  const w = new Float64Array(M);
  const th = new Float64Array(M);
  for (let i = 0; i < M; i++) {
    w[i] = TAU * (1 + Math.floor(rnd() * 3)); // whole turns per loop
    th[i] = rnd() * TAU;
  }
  const K = (t: number) => 9 * (1 - Math.cos(TAU * frac(t))) * 0.5;

  const sub = 10;
  const framesN = 140;
  const dt = 1 / (framesN * sub);
  const stepAll = (t: number) => {
    const k = K(t);
    const d = new Float64Array(M);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        let s = 0;
        s += Math.sin(th[y * n + ((x + 1) % n)] - th[i]);
        s += Math.sin(th[y * n + ((x - 1 + n) % n)] - th[i]);
        s += Math.sin(th[((y + 1) % n) * n + x] - th[i]);
        s += Math.sin(th[((y - 1 + n) % n) * n + x] - th[i]);
        d[i] = w[i] + (k / 4) * s;
      }
    }
    for (let i = 0; i < M; i++) th[i] += d[i] * dt;
  };

  let t = 0;
  for (let s = 0; s < framesN * sub * 4; s++, t += dt) stepAll(t); // settle

  const start = Float64Array.from(th);
  const frames: Float64Array[] = [];
  for (let f = 0; f < framesN; f++) {
    frames.push(Float64Array.from(th));
    for (let s = 0; s < sub; s++, t += dt) stepAll(t);
  }
  // land exactly a whole number of turns from where it started
  const end = th;
  const out = frames.map((fr, i) => {
    const g = new Float64Array(M);
    for (let j = 0; j < M; j++) {
      const turns = Math.round((end[j] - start[j]) / TAU);
      const resid = end[j] - start[j] - turns * TAU;
      g[j] = fr[j] - (i / framesN) * resid;
    }
    return g;
  });
  return { frames: out, n, M };
});

const sync: Variation = {
  id: "kuramoto",
  name: "Kuramoto",
  note: "coupled phase oscillators · coupling swept up and back · order emerges then dissolves",
  period: 9,
  draw(ctx, size, tau) {
    const { frames, n, M } = kuramoto();
    const th = new Float64Array(M);
    sampleFrames(frames, tau, th);
    const cell = size / n;
    const L = cell * 0.38;
    const path = new Path2D();
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const a = th[y * n + x];
        const cx = (x + 0.5) * cell;
        const cy = (y + 0.5) * cell;
        path.moveTo(cx - L * Math.cos(a), cy - L * Math.sin(a));
        path.lineTo(cx + L * Math.cos(a), cy + L * Math.sin(a));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.2;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/* ==================================================================== *
 * 08 — VON KÁRMÁN VORTEX STREET
 * The classical analytic solution: two infinite rows of point vortices at
 * the stable spacing h/a = 0.281. An infinite row sums in closed form to a
 * cotangent, so no CFD is needed. The street self-advects; over one loop it
 * translates by exactly one spacing and the field maps onto itself.
 * ==================================================================== */

const karman: Variation = {
  id: "karman",
  name: "Kármán street",
  note: "two infinite vortex rows at h/a = 0.281 · closed-form cot sum · advects one spacing per loop",
  period: 7,
  draw(ctx, size, tau) {
    const n = 26;
    const cell = size / n;
    const a = size * 0.46; // row spacing
    const h = a * 0.281; // the stability ratio
    const G = 1;
    const shift = a * tau;

    // u - iv = (G / 2ia) cot(pi (z - z0) / a), summed over the two rows
    const row = (
      px: number,
      py: number,
      x0: number,
      y0: number,
      g: number,
      out: [number, number]
    ) => {
      const rx = (Math.PI * (px - x0)) / a;
      const ry = (Math.PI * (py - y0)) / a;
      const den = Math.cosh(2 * ry) - Math.cos(2 * rx);
      if (Math.abs(den) < 1e-4) return;
      const cr = Math.sin(2 * rx) / den;
      const ci = -Math.sinh(2 * ry) / den;
      // multiply by g/(2ia): (a + ib)/i = b - ia
      const k = g / (2 * a);
      out[0] += k * ci;
      out[1] += -k * cr;
    };

    const path = new Path2D();
    const uv: [number, number] = [0, 0];
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const px = (i + 0.5) * cell;
        const py = (j + 0.5) * cell;
        uv[0] = 0;
        uv[1] = 0;
        row(px, py, shift, size / 2 - h / 2, G, uv);
        row(px, py, shift + a / 2, size / 2 + h / 2, -G, uv);
        const sp = Math.hypot(uv[0], uv[1]);
        const ang = Math.atan2(uv[1], uv[0]);
        const L = cell * 0.46 * clamp01(Math.log1p(sp * 240) / 5.5);
        if (L < 0.4) continue;
        path.moveTo(px - L * Math.cos(ang), py - L * Math.sin(ang));
        path.lineTo(px + L * Math.cos(ang), py + L * Math.sin(ang));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.17;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/* ==================================================================== *
 * 09 — FARADAY WAVES
 * Shake a fluid layer at frequency 2 and it answers at 1 — the subharmonic
 * response. That is the Mathieu equation on the boundary of its first
 * instability tongue, found here by bisecting until the Floquet multiplier
 * hits −1. The envelope then has exactly twice the drive period.
 * ==================================================================== */

const faraday = lazy(() => {
  const eps = 0.35;
  const drive = Math.PI; // forcing period for cos(2t)
  const f = (delta: number) => {
    const g = (t: number, y: Float64Array, o: Float64Array) => {
      o[0] = y[1];
      o[1] = -(delta - 2 * eps * Math.cos(2 * t)) * y[0];
    };
    const step = makeRK4(2, g);
    const cols: Float64Array[] = [
      Float64Array.from([1, 0]),
      Float64Array.from([0, 1]),
    ];
    const dt = drive / 4000;
    for (const c of cols) for (let i = 0; i < 4000; i++) step(c, i * dt, dt);
    return { M: [cols[0][0], cols[1][0], cols[0][1], cols[1][1]], cols };
  };

  // bisect for trace = -2: the subharmonic tongue boundary
  let lo = 0.5;
  let hi = 1.4;
  const tr = (d: number) => {
    const { M } = f(d);
    return M[0] + M[3] + 2;
  };
  let a = tr(lo);
  let step = 0.02;
  let found = false;
  for (let d = lo + step; d <= hi; d += step) {
    const b = tr(d);
    if (a * b < 0) {
      lo = d - step;
      hi = d;
      found = true;
      break;
    }
    a = b;
  }
  if (found) {
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (tr(lo) * tr(mid) <= 0) hi = mid;
      else lo = mid;
    }
  }
  const delta = (lo + hi) / 2;

  // eigenvector of the monodromy for eigenvalue -1 → a 2-period solution
  const { M } = f(delta);
  let v0 = M[1];
  let v1 = -1 - M[0];
  if (Math.hypot(v0, v1) < 1e-9) {
    v0 = -1 - M[3];
    v1 = M[2];
  }
  const nrm = Math.hypot(v0, v1) || 1;
  const y = Float64Array.from([v0 / nrm, v1 / nrm]);

  const g = (t: number, s: Float64Array, o: Float64Array) => {
    o[0] = s[1];
    o[1] = -(delta - 2 * eps * Math.cos(2 * t)) * s[0];
  };
  const stepper = makeRK4(2, g);
  const N = 480;
  const dt = (2 * drive) / N;
  const raw: Float64Array[] = [];
  for (let i = 0; i <= N; i++) {
    raw.push(Float64Array.from(y));
    if (i < N) stepper(y, i * dt, dt);
  }
  const env = closeDrift(raw);
  let max = 1e-9;
  let peak = 0;
  for (let i = 0; i < env.length; i++) {
    const m = Math.abs(env[i][0]);
    if (m > max) {
      max = m;
      peak = i;
    }
  }
  // start the loop at maximum displacement rather than at a node
  const rolled = env.slice(peak).concat(env.slice(0, peak));
  return { env: rolled, max, delta };
});

const faradayWaves: Variation = {
  id: "faraday",
  name: "Faraday waves",
  note: "parametric drive at 2ω, fluid answers at ω · Mathieu tongue boundary, Floquet multiplier −1",
  period: 6,
  draw(ctx, size, tau) {
    const { env, max } = faraday();
    const s = new Float64Array(2);
    sampleFrames(env, tau, s);
    const A = s[0] / max;

    const n = 34;
    const cell = size / n;
    const k = Math.PI * 5;
    const path = new Path2D();
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) / n;
        const y = (j + 0.5) / n;
        const eta =
          A * (Math.cos(k * x) + Math.cos(k * y)) * 0.5 +
          A * A * 0.35 * Math.cos(k * (x + y) * 0.7);
        const r = cell * 0.52 * clamp01(Math.abs(eta) * 1.4);
        if (r < 0.25) continue;
        if (eta > 0) {
          path.moveTo((i + 0.5) * cell + r, (j + 0.5) * cell);
          path.arc((i + 0.5) * cell, (j + 0.5) * cell, r, 0, TAU);
        } else {
          path.rect((i + 0.5) * cell - r, (j + 0.5) * cell - r, r * 2, r * 2);
        }
      }
    }
    ctx.fillStyle = INK;
    ctx.fill(path);
  },
};

/* ==================================================================== *
 * 10 — BZ / EXCITABLE MEDIUM
 * Barkley's model, a real reaction-diffusion integration on a broken
 * wavefront, which curls into a rigidly rotating spiral. It warms up live —
 * you watch the transient — and once the rotation period is measured at a
 * probe cell, one period is captured and looped from then on.
 * ==================================================================== */

const bzSim = (() => {
  const nx = 84;
  const ny = 84;
  const M = nx * ny;
  let u: Float64Array | null = null;
  let v: Float64Array = new Float64Array(0);
  let lap: Float64Array = new Float64Array(0);
  const a = 0.75;
  const b = 0.01;
  const eps = 0.02;
  const dx = 1;
  const dt = 0.05;
  const probe: number[] = [];
  let phase: "warm" | "capture" | "loop" = "warm";
  let frames: Uint8Array[] = [];
  let steps = 0;
  let capStart = 0;
  let periodSteps = 0;
  let stride = 1;
  let wanted = 72;
  let field: ReturnType<typeof makeField> | null = null;

  const init = () => {
    u = new Float64Array(M);
    v = new Float64Array(M);
    lap = new Float64Array(M);
    for (let y = 0; y < ny; y++)
      for (let x = 0; x < nx; x++) {
        const i = y * nx + x;
        u[i] = x > nx / 2 ? 1 : 0;
        v[i] = y > ny / 2 ? a / 2 : 0;
      }
    field = makeField(nx, ny);
  };

  const advance = (count: number) => {
    const inv2 = 1 / (dx * dx);
    for (let s = 0; s < count; s++) {
      laplacian(u!, lap, nx, ny, inv2);
      for (let i = 0; i < M; i++) {
        const uu = u![i];
        const th = (v[i] + b) / a;
        u![i] = uu + dt * ((uu * (1 - uu) * (uu - th)) / eps + lap[i]);
        v[i] = v[i] + dt * (uu - v[i]);
      }
      steps++;
      probe.push(u![(ny >> 2) * nx + (nx >> 2)]);
    }
  };

  const snapshot = () => {
    const f = new Uint8Array(M);
    for (let i = 0; i < M; i++) f[i] = clamp01(u![i]) * 255;
    return f;
  };

  /** rising-edge period of the probe series, in steps */
  const measure = () => {
    const th = 0.4;
    const edges: number[] = [];
    for (let i = probe.length - 1; i > 1 && edges.length < 3; i--)
      if (probe[i - 1] < th && probe[i] >= th) edges.push(i);
    if (edges.length < 2) return 0;
    return edges[0] - edges[1];
  };

  return {
    tick(ctx: CanvasRenderingContext2D, size: number, tau: number) {
      if (!u) init();
      if (phase === "warm") {
        advance(90);
        if (steps > 12000) {
          const p = measure();
          if (p > 30 && p < 400) {
            periodSteps = p;
            // capture must span the WHOLE period, or the loop jumps
            stride = Math.max(1, Math.round(p / 72));
            wanted = Math.round(p / stride);
            phase = "capture";
            capStart = steps;
            frames = [];
          } else if (steps > 30000) {
            periodSteps = 80;
            stride = 1;
            wanted = 80;
            phase = "capture";
            capStart = steps;
            frames = [];
          }
        }
      } else if (phase === "capture") {
        frames.push(snapshot());
        advance(stride);
        if (frames.length >= wanted) phase = "loop";
      }

      if (phase === "loop" && frames.length > 2) {
        const idx = Math.floor(frac(tau) * frames.length) % frames.length;
        const f = frames[idx];
        field!.set((x, y) => f[y * nx + x] / 255);
      } else {
        field!.set((x, y) => clamp01(u![y * nx + x]));
      }
      field!.blit(ctx, size, true);
    },
  };
})();

const excitable: Variation = {
  id: "bz",
  name: "Spiral wave",
  note: "Barkley excitable medium · warms up live, then locks to its measured rotation period",
  period: 5,
  fps: 30,
  draw(ctx, size, tau) {
    bzSim.tick(ctx, size, tau);
  },
};

/* ==================================================================== *
 * 11 — DUFFING, PERIOD DOUBLING
 * ẍ + δẋ − x + x³ = γcos(ωt) across a sweep of drive amplitude. Each tile
 * settles, then its stroboscopic period is measured: 1, 2 or 4 drive periods
 * closes inside a four-period loop, so those tiles animate. Tiles that never
 * close are chaotic — those get their Poincaré section drawn instead, frozen,
 * which is seamless for the honest reason that it isn't moving.
 * ==================================================================== */

const duffing = lazy(() => {
  const w = 1.2;
  const drive = TAU / w;
  const tiles: {
    gamma: number;
    orbit: Float32Array | null;
    section: Float32Array | null;
  }[] = [];
  const n = 6;
  for (let t = 0; t < n * n; t++) {
    // window chosen to sit on the cascade: 1 → 2 → 4 → 8 → chaos
    const gamma = 0.24 + (t / (n * n - 1)) * 0.065;
    const f = (tt: number, y: Float64Array, o: Float64Array) => {
      o[0] = y[1];
      o[1] = -0.3 * y[1] + y[0] - y[0] * y[0] * y[0] + gamma * Math.cos(w * tt);
    };
    const step = makeRK4(2, f);
    const y = Float64Array.from([0.5, 0]);
    const spp = 220;
    const h = drive / spp;
    let time = 0;
    for (let p = 0; p < 120; p++)
      for (let i = 0; i < spp; i++, time += h) step(y, time, h);

    // stroboscopic points
    const strobe: number[] = [];
    const yy = Float64Array.from(y);
    let tt = time;
    for (let p = 0; p < 64; p++) {
      strobe.push(yy[0], yy[1]);
      for (let i = 0; i < spp; i++, tt += h) step(yy, tt, h);
    }
    const d = (k: number) =>
      Math.hypot(strobe[0] - strobe[k * 2], strobe[1] - strobe[k * 2 + 1]);
    // 1, 2, 4 and 8 all divide the eight-drive-period loop, so they close
    const per = [1, 2, 4, 8].find((k) => d(k) < 0.02);

    if (per) {
      const frames = 240;
      const s = Float64Array.from(y);
      const orbit = new Float32Array(frames * 2);
      const hh = (8 * drive) / frames;
      const subN = Math.max(1, Math.round(spp / (frames / 8)));
      let t2 = time;
      for (let i = 0; i < frames; i++) {
        orbit[i * 2] = s[0];
        orbit[i * 2 + 1] = s[1];
        for (let k = 0; k < subN; k++, t2 += hh / subN) step(s, t2, hh / subN);
      }
      tiles.push({ gamma, orbit, section: null });
    } else {
      const sec = new Float32Array(strobe.length);
      sec.set(strobe);
      tiles.push({ gamma, orbit: null, section: sec });
    }
  }
  return { tiles, n };
});

const duffingCascade: Variation = {
  id: "duffing",
  name: "Duffing cascade",
  note: "drive amplitude swept across the grid · locked tiles animate, chaotic ones show a frozen Poincaré section",
  period: 8,
  draw(ctx, size, tau) {
    const { tiles, n } = duffing();
    const cell = size / n;
    const sx = cell * 0.3;
    const sy = cell * 0.17;

    ctx.lineWidth = Math.max(0.5, size * 0.002);
    ctx.strokeStyle = INK;
    const trace = new Path2D();
    const dots = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const tile = tiles[j * n + i];
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        if (tile.orbit) {
          const o = tile.orbit;
          const N = o.length / 2;
          for (let k = 0; k <= N; k++) {
            const x = cx + o[(k % N) * 2] * sx;
            const y = cy - o[(k % N) * 2 + 1] * sy;
            if (k === 0) trace.moveTo(x, y);
            else trace.lineTo(x, y);
          }
          const idx = Math.floor(frac(tau) * N) % N;
          const r = cell * 0.075;
          dots.moveTo(cx + o[idx * 2] * sx + r, cy - o[idx * 2 + 1] * sy);
          dots.arc(cx + o[idx * 2] * sx, cy - o[idx * 2 + 1] * sy, r, 0, TAU);
        } else if (tile.section) {
          const s = tile.section;
          const r = cell * 0.028;
          for (let k = 0; k < s.length / 2; k++) {
            dots.moveTo(cx + s[k * 2] * sx + r, cy - s[k * 2 + 1] * sy);
            dots.arc(cx + s[k * 2] * sx, cy - s[k * 2 + 1] * sy, r, 0, TAU);
          }
        }
      }
    }
    ctx.globalAlpha = 0.35;
    ctx.stroke(trace);
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK;
    ctx.fill(dots);
  },
};

/* ==================================================================== *
 * 12 — ROTATING DIPOLE FIELD
 * B ∝ [3(m·r̂)r̂ − m] / r³ for two counter-rotating dipoles. Each tile's bar
 * is the local field direction. Turn the magnets once and the field is
 * identical — the loop is closed by the geometry, not by a solver.
 * ==================================================================== */

const dipole: Variation = {
  id: "dipole",
  name: "Dipole field",
  note: "two counter-rotating magnetic dipoles · every bar is the local B direction",
  period: 10,
  draw(ctx, size, tau) {
    const n = 24;
    const cell = size / n;
    const a = TAU * tau;
    // one turn against two: equal and opposite rates would just flip the whole
    // field at the halfway point, and undirected bars can't tell the difference
    const poles = [
      { x: size * 0.32, y: size * 0.38, mx: Math.cos(a), my: Math.sin(a) },
      {
        x: size * 0.68,
        y: size * 0.64,
        mx: Math.cos(-2 * a),
        my: Math.sin(-2 * a),
      },
    ];
    const path = new Path2D();
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const px = (i + 0.5) * cell;
        const py = (j + 0.5) * cell;
        let bx = 0;
        let by = 0;
        for (const p of poles) {
          const dx = (px - p.x) / size;
          const dy = (py - p.y) / size;
          const r = Math.max(0.04, Math.hypot(dx, dy));
          const rx = dx / r;
          const ry = dy / r;
          const mr = p.mx * rx + p.my * ry;
          const k = 1 / (r * r * r);
          bx += k * (3 * mr * rx - p.mx);
          by += k * (3 * mr * ry - p.my);
        }
        const ang = Math.atan2(by, bx);
        const mag = Math.hypot(bx, by);
        const L = cell * 0.46 * clamp01(0.25 + Math.log1p(mag) / 6);
        path.moveTo(px - L * Math.cos(ang), py - L * Math.sin(ang));
        path.lineTo(px + L * Math.cos(ang), py + L * Math.sin(ang));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.19;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/* ==================================================================== *
 * 13 — LORENZ, SLICED
 * The chaos problem dodged entirely: time never advances. A plane cuts the
 * Lorenz flow and rotates once about the z axis; each tile reads the flow
 * direction where the plane passes through it. The loop closes because the
 * plane came back, not because the system did.
 * ==================================================================== */

const lorenzSlice: Variation = {
  id: "lorenz-slice",
  name: "Lorenz slice",
  note: "the flow field, not the trajectory · a cutting plane orbits once so the loop closes without time advancing",
  period: 13,
  draw(ctx, size, tau) {
    const n = 26;
    const cell = size / n;
    const phi = TAU * tau;
    const cf = Math.cos(phi);
    const sf = Math.sin(phi);
    const S = 46;
    const d = new Float64Array(3);
    const s = new Float64Array(3);
    const path = new Path2D();

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const p = ((i + 0.5) / n - 0.5) * S;
        // the plane also bobs: Lorenz is symmetric under (x,y,z)→(−x,−y,z), so
        // a pure half turn would reproduce the frame exactly on undirected bars
        const q = (0.5 - (j + 0.5) / n) * S + 25 + 7 * (1 - Math.cos(phi));
        s[0] = p * cf;
        s[1] = p * sf;
        s[2] = q;
        lorenzDeriv(0, s, d);
        // project the 3-vector back onto the plane's own basis
        const vp = d[0] * cf + d[1] * sf;
        const vq = d[2];
        const ang = Math.atan2(-vq, vp);
        const mag = Math.hypot(vp, vq);
        const L = cell * 0.46 * clamp01(0.2 + Math.log1p(mag) / 6);
        const cx = (i + 0.5) * cell;
        const cy = (j + 0.5) * cell;
        path.moveTo(cx - L * Math.cos(ang), cy - L * Math.sin(ang));
        path.lineTo(cx + L * Math.cos(ang), cy + L * Math.sin(ang));
      }
    }
    ctx.lineCap = "round";
    ctx.lineWidth = cell * 0.18;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
  },
};

/* ==================================================================== *
 * 14 — CAUSTICS
 * The bright ribs on the floor of a swimming pool. In the paraxial limit the
 * light map is x ↦ x − d∇h, so intensity goes as 1/|det(I − d·H)| where H is
 * the surface Hessian. Infinities on that determinant are the caustics —
 * folds and cusps of catastrophe theory. Whole-numbered wave frequencies loop.
 * ==================================================================== */

const causticField = lazy(() => makeField(150, 150));

const caustics: Variation = {
  id: "caustics",
  name: "Caustics",
  note: "refraction through a wavy surface · intensity = 1/|det(I − d·H)| · folds and cusps",
  period: 14,
  fps: 30,
  draw(ctx, size, tau) {
    const f = causticField();
    const waves = [
      { ax: 4.1, ay: 1.3, a: 0.020, n: 1 },
      { ax: -1.7, ay: 3.6, a: 0.017, n: -1 },
      { ax: 2.6, ay: -3.1, a: 0.013, n: 2 },
      { ax: 5.3, ay: 4.4, a: 0.008, n: -2 },
    ];
    const depth = 0.05; // pool depth in units of the surface's own wavelength
    f.set((px, py) => {
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
      const det =
        (1 - depth * hxx) * (1 - depth * hyy) - depth * depth * hxy * hxy;
      const I = 1 / Math.max(0.05, Math.abs(det)); // → ∞ on the caustic
      return clamp01((I - 0.8) * 0.35);
    });
    f.blit(ctx, size, true);
  },
};

/* ==================================================================== *
 * 15 — RAYLEIGH–BÉNARD ROLLS
 * Lorenz's equations are a three-mode truncation of convection between hot
 * and cold plates, so the periodic orbit from #1 can be pushed back through
 * that truncation to recover the actual temperature field:
 *   θ ∝ √2·Y·cos(πax)sin(πz) − Z·sin(2πz)
 * Convection rolls that are exactly periodic because the orbit is.
 * ==================================================================== */

const rbField = lazy(() => makeField(140, 140));

const convection: Variation = {
  id: "rayleigh-benard",
  name: "Bénard rolls",
  note: "Lorenz run backwards through its own derivation · the convection field the equations came from",
  period: 7,
  fps: 30,
  draw(ctx, size, tau) {
    const { frames } = lorenzUPO();
    const st = new Float64Array(3);
    sampleFrames(frames, tau, st);
    const X = st[0] / 12;
    const Y = st[1] / 14;
    const Z = (st[2] - 24) / 12;
    const a = 1 / Math.SQRT2;
    const f = rbField();
    f.set((px, py) => {
      const x = (px / f.w) * 3;
      const z = py / f.h;
      const theta =
        Math.SQRT2 * Y * Math.cos(Math.PI * a * x * 2) * Math.sin(Math.PI * z) -
        Z * Math.sin(2 * Math.PI * z);
      const psi =
        Math.SQRT2 * X * Math.sin(Math.PI * a * x * 2) * Math.sin(Math.PI * z);
      // temperature as tone, streamfunction as contour lines through it
      const tone = clamp01(0.5 + theta * 0.55);
      const lines = Math.abs(Math.sin(psi * 7)) < 0.14 ? 0.55 : 0;
      return clamp01(tone * 0.85 + lines);
    });
    f.blit(ctx, size, true);
  },
};

/* ==================================================================== *
 * 16 — ISING, THROUGH CRITICALITY
 * Metropolis on a periodic lattice, temperature ramped from hot to cold
 * through Tc. This is the one system here that genuinely cannot close — it
 * is stochastic, and nothing returns it to its initial microstate. So the
 * ramp is played forward and then backward: a palindrome is seamless by
 * construction, and heating looks like cooling run in reverse anyway.
 * ==================================================================== */

const ising = lazy(() => {
  const L = 72;
  const M = L * L;
  const rnd = mulberry32(11);
  const s = new Int8Array(M);
  for (let i = 0; i < M; i++) s[i] = rnd() < 0.5 ? -1 : 1;
  const Tc = 2 / Math.log(1 + Math.SQRT2);

  const sweep = (T: number, passes: number) => {
    const exps = [Math.exp(-4 / T), Math.exp(-8 / T)];
    for (let p = 0; p < passes * M; p++) {
      const i = (rnd() * M) | 0;
      const x = i % L;
      const y = (i / L) | 0;
      const nb =
        s[y * L + ((x + 1) % L)] +
        s[y * L + ((x - 1 + L) % L)] +
        s[((y + 1) % L) * L + x] +
        s[((y - 1 + L) % L) * L + x];
      const dE = 2 * s[i] * nb;
      if (dE <= 0) s[i] = -s[i];
      else {
        const p2 = dE === 4 ? exps[0] : exps[1];
        if (rnd() < p2) s[i] = -s[i];
      }
    }
  };

  const N = 110;
  const temp = (t: number) => Tc + 0.9 - 1.8 * t; // hot → cold, straight ramp
  for (let i = 0; i < 40; i++) sweep(temp(0), 1); // equilibrate hot

  const frames: Uint8Array[] = [];
  for (let i = 0; i < N; i++) {
    sweep(temp(i / N), 2);
    const f = new Uint8Array(M);
    for (let k = 0; k < M; k++) f[k] = s[k] > 0 ? 1 : 0;
    frames.push(f);
  }
  return { frames, L };
});

const isingField = lazy(() => makeField(72, 72));

const criticality: Variation = {
  id: "ising",
  name: "Ising",
  note: "Metropolis quenched through Tc · the one system that cannot close, so it runs as a palindrome",
  period: 12,
  fps: 30,
  draw(ctx, size, tau) {
    const { frames, L } = ising();
    const N = frames.length;
    // ping-pong: cool, then the same quench played backwards
    const pos = (1 - Math.abs(2 * frac(tau) - 1)) * (N - 1);
    const i0 = Math.floor(pos);
    const i1 = Math.min(N - 1, i0 + 1);
    const w = pos - i0;
    const a = frames[i0];
    const b = frames[i1];
    const f = isingField();
    f.set((px, py) => {
      const i = py * L + px;
      return a[i] * (1 - w) + b[i] * w;
    });
    f.blit(ctx, size, false);
  },
};

export const PHYSICS: Variation[] = [
  lorenz,
  talbot,
  choreography,
  trochoid,
  fpuRecurrence,
  chladni,
  sync,
  karman,
  faradayWaves,
  excitable,
  duffingCascade,
  dipole,
  lorenzSlice,
  caustics,
  convection,
  criticality,
];
