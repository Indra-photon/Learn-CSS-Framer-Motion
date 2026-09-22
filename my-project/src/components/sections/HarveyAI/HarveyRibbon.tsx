"use client";

/* Harvey ribbon — a WebGL port of the Figma "Harvey Ribbon Wash" shader
 * (fill, id 16905aa4…). One curved band from the top-right corner sweeping
 * down behind the hero frame: three folded sub-bands in brand tints, fbm-
 * warped for the silk look, sheen striations, a fade toward the bottom, and
 * fine grain. Stripe-style in construction, Harvey in colour and restraint.
 *
 * Runtime: plain WebGL1, one fullscreen triangle, ~40 lines of GLSL. Motion is
 * three slow out-of-phase cycles (sway, breathe, sheen travel) over a drifting
 * fold noise — never a visible loop; static (single frame) under
 * prefers-reduced-motion; paused when scrolled out of view; DPR capped at 1.5.
 * Falls back to the SVG version if WebGL is unavailable.
 *
 * Two variants: `ribbon` (the Hero A band, a port of the Figma shader) and
 * `lines` (a fan of thin rays converging off the top-right corner, Hero 02).
 *
 * Colours mirror the Harvey tokens (sRGB, since GLSL can't read CSS vars):
 *   highlight  brand/ui-active  oklch(0.86 0.028 185) → #C6D8D5
 *   brand      brand/solid      oklch(0.38 0.04 185)  → #284945
 *   mid        brand/border-hover oklch(0.48 0.04 185) → #5F817E
 * If those tokens move, update the three vec3s below. */

import { useEffect, useRef, useState, type ReactNode } from "react";

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 uv;
uniform float uAspect, uTime, uOpacity, uMode;
uniform vec3 uA, uB, uC;

float hash21(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 s = f*f*(3.0-2.0*f);
  float a = hash21(i), b = hash21(i+vec2(1.0,0.0)), c = hash21(i+vec2(0.0,1.0)), d = hash21(i+vec2(1.0,1.0));
  return mix(mix(a,b,s.x), mix(c,d,s.x), s.y); }
float fbm(vec2 p){ float v = 0.0, amp = 0.5; for(int k=0;k<4;k++){ v += amp*vnoise(p); p = p*2.03 + vec2(1.7,9.2); amp *= 0.5; } return v; }
float band(float d, float w, float edge){ float x = abs(d)/max(w,1e-4); float e0 = mix(0.92,0.25,edge); return 1.0 - smoothstep(e0, 1.0, x); }

vec4 ribbonField(vec2 uv){
  /* controls — same defaults as the Figma layer */
  float widthPct = 0.20, flow = 0.8, startX = 0.98, endX = 0.60;
  float grain = 0.05, fade = 0.85, spread = 0.7, edge = 0.4, sheen = 0.3;

  /* motion — three slow, out-of-phase cycles so nothing visibly loops:
     sway  the bend of the centreline (±0.05, ~19 s)
     breathe  the band width (±6%, ~13 s)
     travel  the sheen striations sliding along the length (~30 s)
     plus the fold noise drifting underneath. */
  float sway    = sin(uTime * 0.33) * 0.05;
  float breathe = 1.0 + sin(uTime * 0.47 + 1.3) * 0.06;
  float travel  = uTime * 0.21;
  float bend    = 0.08 + sway;
  widthPct     *= breathe;

  vec2 p = vec2(uv.x * uAspect, uv.y);
  float y = uv.y;
  float ease = y*y*(3.0-2.0*y);
  float cx = mix(startX, endX, ease) * uAspect + bend * sin(y*3.14159265) * uAspect;

  float t = uTime * 0.04;                       /* fold drift */
  float n1 = fbm(vec2(y*2.2 + 0.7 + t, 0.35)) - 0.5;
  float n2 = fbm(vec2(y*5.0 + 3.1 - t*0.7, 1.7)) - 0.5;
  float n3 = fbm(vec2(y*3.4 + 7.9 + t*0.5, 4.2)) - 0.5;

  float w = widthPct * uAspect;
  float d = (p.x - cx) + n1 * flow * w * 0.9;

  float b1 = band(d, w*0.60, edge);
  float b2 = band(d - spread*w + n2*flow*w*0.5, w*0.36, edge);
  float b3 = band(d + spread*w*0.9 - n3*flow*w*0.4, w*0.44, edge);
  float sum = max(b1+b2+b3, 1e-3);

  vec3 col = (uA*b1 + uB*b2 + uC*b3) / sum;
  float a = clamp(b1*0.95 + b2*0.9 + b3*0.75, 0.0, 1.0);

  float st = 0.5 + 0.5*sin((d/max(w,1e-4))*9.0 + n1*7.0 + y*4.0 - travel);
  col = mix(col, uA, st * sheen * a);

  a *= mix(1.0, 1.0 - fade, ease);
  col += (hash21(uv*vec2(1931.0,1087.0)) - 0.5) * grain;
  a *= uOpacity;
  return vec4(clamp(col, 0.0, 1.0) * a, a); /* premultiplied for the page */
}
/* lines — a bundle of thin rays fanning out of a convergence point just off
 * the top-right corner. Working in polar space around that point means the
 * rays converge naturally (spacing → 0 at the node) and spread as they
 * travel; a quadratic bend curves them and the fan is windowed so it reads as
 * a bundle, not a starburst. */
vec4 linesField(vec2 uv){
  float aspect = uAspect;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 C = vec2(0.965 * aspect, 0.015);   /* node just inside the corner */
  vec2 q = p - C;
  float r = length(q);
  float th = atan(q.y, q.x);

  float bend = 0.34 + 0.04 * sin(uTime * 0.21);
  float drift = uTime * 0.004;
  float a = th + bend * r * r + drift;

  float spacing = 0.055;
  float n = a / spacing;
  float idx = floor(n + 0.5);
  float d = abs(fract(n + 0.5) - 0.5) * spacing;
  float sd = d * r;
  float w = 0.0013 + 0.0011 * hash21(vec2(idx, 3.0));
  float ray = 1.0 - smoothstep(w * 0.4, w * 1.7, sd);

  float dir = 2.30 + 0.03 * sin(uTime * 0.17);
  float wedge = 1.0 - smoothstep(0.24, 0.44, abs(a - dir));

  float near = smoothstep(0.012, 0.13, r);  /* let the bundle pinch, not blow out */
  float far = 1.0 - smoothstep(0.72, 1.40, r);

  float bright = 0.5 + 0.5 * hash21(vec2(idx, 9.0));
  float alpha = ray * wedge * near * far * bright;

  /* hold the rays off the headline so the copy stays the entry point */
  float copy = length((uv - vec2(0.24, 0.40)) * vec2(aspect * 0.62, 1.0));
  alpha *= mix(0.18, 1.0, smoothstep(0.10, 0.58, copy));

  vec3 col = mix(uC, uB, clamp(r * 0.85, 0.0, 1.0));
  col = mix(col, uA, 0.22 * hash21(vec2(idx, 17.0)));
  alpha *= uOpacity;
  return vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}

void main(){
  gl_FragColor = uMode < 0.5 ? ribbonField(uv) : linesField(uv);
}
`;

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];

export default function HarveyRibbon({
  intensity = 0.55,
  variant = "ribbon",
  className = "",
  fallback,
}: {
  intensity?: number;
  /** ribbon = the Hero A band · lines = the fanned rays (Hero 02) */
  variant?: "ribbon" | "lines";
  className?: string;
  /** rendered instead of the canvas when WebGL is unavailable */
  fallback?: ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      setFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* one triangle covering clip space */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform3fv(u("uA"), hex("#C6D8D5"));
    gl.uniform3fv(u("uB"), hex("#284945"));
    gl.uniform3fv(u("uC"), hex("#5F817E"));
    gl.uniform1f(u("uOpacity"), intensity);
    gl.uniform1f(u("uMode"), variant === "lines" ? 1 : 0);
    const uAspect = u("uAspect");
    const uTime = u("uTime");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform1f(uAspect, w / Math.max(h, 1));
      }
    };

    const frame = () => {
      resize();
      gl.uniform1f(uTime, reduced ? 0 : (performance.now() - start) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced && visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      if (reduced) frame();
    });
    ro.observe(canvas);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [intensity, variant]);

  if (failed) return <>{fallback}</>;
  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 size-full ${className}`} aria-hidden />;
}
