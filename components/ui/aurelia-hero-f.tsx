"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };

type Props = {
  className?: string;
  brand?: string;
  titleStart?: string;
  titleEnd?: string;
  paragraph?: string;
  tagline?: string;
  navLinks?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  reelLabel?: string;
  reelMeta?: string;
  onReelClick?: () => void;
  frameCode?: string;
  coordinates?: string;
  studioNote?: string;
  exploreLabel?: string;
  exploreHref?: string;
};

const DEFAULT_NAV: NavLink[] = [
  { label: "Films", href: "#aurelia-films" },
  { label: "Crew", href: "#aurelia-crew" },
  { label: "Journal", href: "#aurelia-journal" },
];

/* ---------------------------------- math ---------------------------------- */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const hash1 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
const noise1 = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash1(i) * (1 - u) + hash1(i + 1) * u;
};
const fbm = (x: number) => {
  let v = 0;
  let a = 0.5;
  let f = 1;
  let n = 0;
  for (let o = 0; o < 4; o++) {
    v += a * noise1(x * f + o * 19.19);
    n += a;
    a *= 0.5;
    f *= 2.07;
  }
  return v / n;
};
const ridged = (x: number) => {
  let v = 0;
  let a = 0.6;
  let f = 1;
  let n = 0;
  for (let o = 0; o < 5; o++) {
    const r = 1 - Math.abs(noise1(x * f + o * 31.7) * 2 - 1);
    v += a * r * r;
    n += a;
    a *= 0.48;
    f *= 2.13;
  }
  return v / n;
};
const mulberry32 = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* -------------------------------- landscape ------------------------------- */

type Layer = {
  base: number;
  amp: number;
  freq: number;
  speed: number;
  ridged: boolean;
  lo: number;
  hi: number;
  top: string;
  bottom: string;
  mist: number;
  par: number;
  seed: number;
};

const LAYERS: Layer[] = [
  { base: 0.665, amp: 0.25, freq: 0.85, speed: 0.0022, ridged: true, lo: 0.3, hi: 0.82, top: "#7d5266", bottom: "#583a52", mist: 0.2, par: 0.012, seed: 1.7 },
  { base: 0.735, amp: 0.23, freq: 1.15, speed: 0.0055, ridged: true, lo: 0.28, hi: 0.82, top: "#4b3150", bottom: "#33223f", mist: 0.15, par: 0.028, seed: 6.3 },
  { base: 0.815, amp: 0.19, freq: 1.55, speed: 0.011, ridged: true, lo: 0.26, hi: 0.84, top: "#2b1f39", bottom: "#1c1528", mist: 0.11, par: 0.05, seed: 12.9 },
  { base: 0.9, amp: 0.15, freq: 2.0, speed: 0.024, ridged: false, lo: 0.22, hi: 0.8, top: "#171221", bottom: "#0f0b16", mist: 0.06, par: 0.07, seed: 21.4 },
  { base: 0.99, amp: 0.13, freq: 2.6, speed: 0.05, ridged: false, lo: 0.2, hi: 0.82, top: "#0a0810", bottom: "#050409", mist: 0, par: 0.08, seed: 33.8 },
];

function createGrainCanvas(size = 128) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = ((Math.random() + Math.random()) / 2) * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function createMistSprite() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d");
  if (!g) return c;
  g.setTransform(1, 0, 0, 0.25, 0, 0);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(246, 206, 180, 1)");
  grad.addColorStop(0.45, "rgba(240, 190, 165, 0.45)");
  grad.addColorStop(1, "rgba(240, 190, 165, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return c;
}

function LandscapeCanvas({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const rand = mulberry32(7331);
    const stars = Array.from({ length: 160 }, () => ({
      x: rand(),
      y: Math.pow(rand(), 1.5) * 0.52,
      r: rand() > 0.92 ? 1.6 : 1,
      a: 0.25 + rand() * 0.65,
      sp: 0.3 + rand() * 1.1,
      ph: rand() * Math.PI * 2,
    }));
    const birds = Array.from({ length: 5 }, () => ({
      dx: (rand() - 0.5) * 0.12,
      dy: (rand() - 0.5) * 0.05,
      ph: rand() * Math.PI * 2,
      s: 0.7 + rand() * 0.5,
    }));
    const drifts = LAYERS.map(() =>
      Array.from({ length: 3 }, () => ({ x: rand(), s: 0.7 + rand() * 0.6, v: rand() })),
    );

    const grain = createGrainCanvas();
    const grainPattern = ctx.createPattern(grain, "repeat");
    const mist = createMistSprite();

    let w = 1;
    let h = 1;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let gx = 0;
    let gy = 0;
    let frame = 0;
    const t0 = performance.now();

    const draw = (time: number) => {
      const t = time + 48;
      const p = reduced ? 0 : progress.get();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.68);
      sky.addColorStop(0, "#05061a");
      sky.addColorStop(0.32, "#12142e");
      sky.addColorStop(0.58, "#352444");
      sky.addColorStop(0.78, "#7f4c5c");
      sky.addColorStop(0.92, "#cf8a66");
      sky.addColorStop(1, "#eeb27c");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // stars
      ctx.fillStyle = "#fff4e6";
      for (const s of stars) {
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = s.a * tw * (1 - s.y / 0.52) * 0.8;
        ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // sun + glow
      const sunX = w * (w > h ? 0.64 : 0.6);
      const sunY = h * (0.46 + Math.sin(t * 0.02) * 0.006) + p * h * 0.02;
      const sunR = Math.max(9, h * 0.034);
      const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.55);
      glow.addColorStop(0, "rgba(255, 214, 166, 0.5)");
      glow.addColorStop(0.08, "rgba(247, 176, 120, 0.28)");
      glow.addColorStop(0.3, "rgba(200, 110, 100, 0.1)");
      glow.addColorStop(1, "rgba(120, 60, 90, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "#ffe2bd";
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // anamorphic streak
      const fx = clamp01(sunX / w);
      const flare = ctx.createLinearGradient(0, 0, w, 0);
      flare.addColorStop(0, "rgba(255, 190, 140, 0)");
      flare.addColorStop(Math.max(0, fx - 0.32), "rgba(255, 190, 140, 0)");
      flare.addColorStop(fx, "rgba(255, 214, 170, 0.32)");
      flare.addColorStop(Math.min(1, fx + 0.32), "rgba(255, 190, 140, 0)");
      flare.addColorStop(1, "rgba(255, 190, 140, 0)");
      ctx.fillStyle = flare;
      ctx.fillRect(0, sunY - 0.75, w, 1.5);

      // birds
      ctx.strokeStyle = "rgba(24, 16, 28, 0.8)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const cx = (((t * 0.0085 + 0.32) % 1.4) - 0.2) * w;
      const cy = h * (0.3 + Math.sin(t * 0.07) * 0.012) + p * h * 0.01;
      for (const b of birds) {
        const size = h * 0.0085 * b.s;
        const bx = cx + b.dx * h;
        const by = cy + b.dy * h + Math.sin(t * 0.5 + b.ph) * h * 0.003;
        const f = reduced ? 0.5 : Math.sin(t * 4 + b.ph);
        ctx.lineWidth = Math.max(1, size * 0.2);
        ctx.beginPath();
        ctx.moveTo(bx - size, by - size * 0.45 * f);
        ctx.quadraticCurveTo(bx - size * 0.45, by - size * 0.2, bx, by + size * 0.12);
        ctx.quadraticCurveTo(bx + size * 0.45, by - size * 0.2, bx + size, by - size * 0.45 * f);
        ctx.stroke();
      }

      // ridges
      const step = Math.max(3, w / 260);
      for (let i = 0; i < LAYERS.length; i++) {
        const L = LAYERS[i];
        const baseY = h * L.base + L.par * p * h;
        const amp = h * L.amp;
        const off = L.seed * 10 + t * L.speed;

        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + step; x += step) {
          const u = (x / h) * L.freq + off;
          const n = L.ridged ? ridged(u) : fbm(u);
          const s = clamp01((n - L.lo) / (L.hi - L.lo));
          ctx.lineTo(x, baseY - amp * s);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const fill = ctx.createLinearGradient(0, baseY - amp, 0, Math.min(h, baseY + h * 0.1));
        fill.addColorStop(0, L.top);
        fill.addColorStop(1, L.bottom);
        ctx.fillStyle = fill;
        ctx.fill();

        if (i === 0) {
          ctx.globalCompositeOperation = "screen";
          const haze = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.4);
          haze.addColorStop(0, "rgba(255, 196, 150, 0.26)");
          haze.addColorStop(1, "rgba(255, 196, 150, 0)");
          ctx.fillStyle = haze;
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = "source-over";
        }

        if (L.mist > 0) {
          const my = baseY - amp * 0.12;
          const band = ctx.createLinearGradient(0, my - h * 0.09, 0, my + h * 0.06);
          band.addColorStop(0, "rgba(236, 186, 160, 0)");
          band.addColorStop(0.6, `rgba(236, 186, 160, ${L.mist})`);
          band.addColorStop(1, "rgba(236, 186, 160, 0)");
          ctx.fillStyle = band;
          ctx.fillRect(0, my - h * 0.09, w, h * 0.15);

          const layerPx = (L.speed / L.freq) * h;
          for (const m of drifts[i]) {
            const sw = w * 0.55 * m.s;
            const sh = h * 0.1;
            const span = w + sw;
            const pos = (m.x * span + t * layerPx * (0.9 + m.v * 0.5)) % span;
            const mx = w - pos;
            ctx.globalAlpha = L.mist * 1.1 * m.s;
            ctx.drawImage(mist, mx, my - sh * 0.5, sw, sh);
          }
          ctx.globalAlpha = 1;
        }
      }

      // film grain
      if (grainPattern) {
        if (!reduced && frame++ % 4 === 0) {
          gx = Math.random() * 128;
          gy = Math.random() * 128;
        }
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.09;
        ctx.translate(gx, gy);
        ctx.fillStyle = grainPattern;
        ctx.fillRect(-gx, -gy, w, h);
        ctx.restore();
      }
    };

    const resize = () => {
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2_400_000 / (w * h)));
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      draw(reduced ? 0 : (performance.now() - t0) / 1000);
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduced && visible) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resize());
      ro.observe(canvas);
    }
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) start();
        else stop();
      });
      io.observe(canvas);
    }
    start();

    return () => {
      stop();
      ro?.disconnect();
      io?.disconnect();
    };
  }, [progress, reduced]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Slow animated landscape of layered mountains at dusk"
      className="block h-full w-full"
    />
  );
}

/* --------------------------------- words ---------------------------------- */

function RevealWord({
  word,
  index,
  total,
  progress,
  reduced,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = index / total;
  const end = Math.min(1, start + 1.6 / total);
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  return <motion.span style={{ opacity: reduced ? 1 : opacity }}>{word}</motion.span>;
}

/* ---------------------------------- hero ---------------------------------- */

export function AureliaHero({
  className,
  brand = "Aurelia",
  titleStart = "Stories from",
  titleEnd = "the edge of the map",
  paragraph = "Twelve films. Six continents. One crew that never stops moving.",
  tagline = "A travel film studio. Documentaries and brand films, shot on location since 2014.",
  navLinks = DEFAULT_NAV,
  ctaLabel = "Start a project",
  ctaHref = "#aurelia-contact",
  reelLabel = "Watch the reel",
  reelMeta = "Showreel 2025 · 04:12",
  onReelClick = () => {},
  frameCode = "AUR—012",
  coordinates = "64°08′N 21°56′W",
  studioNote = "Est. 2014 · Lisbon & Reykjavík",
  exploreLabel = "Explore the films",
  exploreHref = "#aurelia-work",
}: Props) {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced === true;

  const heroRef = useRef<HTMLElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 32,
    mass: 0.5,
    restDelta: 0.0002,
  });

  // panel growth
  const grow = useTransform(progress, (v) => smooth(0, 0.62, v));
  const clipPath = useTransform(grow, (g) => {
    const k = (1 - g).toFixed(4);
    return `inset(calc(var(--iy) * ${k}) calc(var(--ix) * ${k}) round ${(18 * (1 - g)).toFixed(2)}px)`;
  });
  const frameY = useTransform(grow, (g) => `calc(var(--iy) * ${(1 - g).toFixed(4)})`);
  const frameX = useTransform(grow, (g) => `calc(var(--ix) * ${(1 - g).toFixed(4)})`);
  const radius = useTransform(grow, (g) => `${(18 * (1 - g)).toFixed(2)}px`);
  const outerRadius = useTransform(grow, (g) => `${(18 * (1 - g) + 8).toFixed(2)}px`);
  const innerScale = useTransform(grow, (g) => (reduced ? 1 : 1.16 - 0.16 * g));
  const frameLineOpacity = useTransform(progress, [0.42, 0.6], [1, 0]);
  const haloOpacity = useTransform(progress, [0, 0.45], [1, 0]);
  const labelOpacity = useTransform(progress, [0.22, 0.42], [0, 1]);
  const padTop = useTransform(grow, (g) => `${(12 + g * 72).toFixed(1)}px`);
  const padX = useTransform(grow, (g) => `${(12 + g * 16).toFixed(1)}px`);
  const padBottom = useTransform(grow, (g) => `${(12 + g * 20).toFixed(1)}px`);

  // title split
  const titleT = useTransform(progress, (v) => easeOut(clamp01(v / 0.5)));
  const titleAX = useTransform(titleT, (t) => `${(-22 * t).toFixed(3)}vw`);
  const titleBX = useTransform(titleT, (t) => `${(22 * t).toFixed(3)}vw`);
  const titleAY = useTransform(titleT, (t) => `${(-3 * t).toFixed(3)}vh`);
  const titleBY = useTransform(titleT, (t) => `${(3 * t).toFixed(3)}vh`);
  const titleOpacity = useTransform(progress, [0, 0.34], [1, 0]);
  const titleFilter = useTransform(progress, (v) =>
    reduced || v < 0.004 ? "none" : `blur(${(clamp01(v / 0.34) * 10).toFixed(2)}px)`,
  );

  // supporting layers
  const metaOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const endOpacity = useTransform(progress, [0.62, 0.76], [0, 1]);
  const endY = useTransform(progress, (v) => (reduced ? 0 : 24 * (1 - smooth(0.62, 0.8, v))));
  const endVisibility = useTransform(endOpacity, (o) => (o > 0.02 ? "visible" : "hidden"));
  const bottomFade = useTransform(progress, [0.8, 1], [0, 1]);

  // paragraph reveal
  const { scrollYProgress: paraProgress } = useScroll({
    target: paraRef,
    offset: ["start 0.85", "end 0.55"],
  });
  const words = useMemo(() => paragraph.split(/\s+/).filter(Boolean), [paragraph]);

  // running timecode
  useEffect(() => {
    const el = tcRef.current;
    if (!el) return;
    const pad = (n: number) => String(n).padStart(2, "0");
    const format = (frames: number) => {
      const ff = frames % 24;
      const total = Math.floor(frames / 24);
      return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}:${pad(ff)}`;
    };
    const baseFrames = (4 * 60 + 12) * 24;
    if (reduced) {
      el.textContent = format(baseFrames + 8);
      return;
    }
    let raf = 0;
    let last = -1;
    const t0 = performance.now();
    const tick = (now: number) => {
      const f = baseFrames + Math.floor(((now - t0) / 1000) * 24);
      if (f !== last) {
        last = f;
        el.textContent = format(f);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a46c]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a]";

  return (
    <div
      className={cn(
        "relative isolate w-full overflow-x-clip bg-[#07070a] text-[#f3ece2] antialiased",
        className,
      )}
    >
      <section
        ref={heroRef}
        aria-label={`${brand} — ${titleStart} ${titleEnd}`}
        className="relative h-[300svh]"
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden [--ax:0vw] [--ix:5vw] [--iy:25svh] md:[--ax:-4vw] md:[--ix:13vw] md:[--iy:23svh] lg:[--ax:-6vw] lg:[--ix:23vw] lg:[--iy:22svh]">
          {/* ambient backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 55%, rgba(231,164,108,0.09), transparent 70%)",
            }}
          />

          {/* media panel */}
          <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden">
            <motion.div style={{ scale: innerScale }} className="absolute inset-0">
              <LandscapeCanvas progress={progress} reduced={reduced} />
            </motion.div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(5,4,10,0.65) 100%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, rgba(5,5,10,0.55), transparent 22%)",
              }}
            />

            <motion.div
              style={{ opacity: endOpacity, y: endY, visibility: endVisibility }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/70 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] md:text-[11px]">
                {reelMeta}
              </p>
              <button
                id="aurelia-reel-button"
                type="button"
                onClick={onReelClick}
                className={cn(
                  "group mt-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/25 py-2 pl-2 pr-5 text-sm text-[#f3ece2] backdrop-blur-md transition-colors hover:border-white/50 hover:bg-black/35",
                  focusRing,
                )}
              >
                <span className="grid size-9 place-items-center rounded-full bg-[#f3ece2] text-[#0b0a10] transition-transform duration-300 group-hover:scale-105">
                  <Play className="size-3.5 translate-x-px fill-current" aria-hidden />
                </span>
                {reelLabel}
              </button>
            </motion.div>

            <motion.div
              aria-hidden
              style={{
                opacity: bottomFade,
                background: "linear-gradient(to bottom, transparent 45%, #07070a 100%)",
              }}
              className="pointer-events-none absolute inset-0 z-20"
            />
          </motion.div>

          {/* frame / viewfinder */}
          <motion.div
            aria-hidden
            style={{ top: frameY, bottom: frameY, left: frameX, right: frameX }}
            className="pointer-events-none absolute z-10"
          >
            <motion.div
              style={{ opacity: haloOpacity, borderRadius: radius }}
              className="absolute inset-0 shadow-[0_40px_160px_-20px_rgba(231,164,108,0.32)]"
            />
            <motion.div style={{ opacity: frameLineOpacity }} className="absolute inset-0">
              <motion.div
                style={{ borderRadius: radius }}
                className="absolute inset-0 border border-white/20"
              />
              <motion.div
                style={{ borderRadius: outerRadius }}
                className="absolute -inset-2 border border-white/[0.07]"
              />
            </motion.div>

            <motion.div
              style={{
                paddingTop: padTop,
                paddingBottom: padBottom,
                paddingLeft: padX,
                paddingRight: padX,
              }}
              className="absolute inset-0"
            >
              <div className="relative h-full w-full">
                <span className="absolute left-0 top-0 size-3 border-l border-t border-white/60" />
                <span className="absolute right-0 top-0 size-3 border-r border-t border-white/60" />
                <span className="absolute bottom-0 left-0 size-3 border-b border-l border-white/60" />
                <span className="absolute bottom-0 right-0 size-3 border-b border-r border-white/60" />

                <motion.div
                  style={{ opacity: labelOpacity }}
                  className="absolute inset-0 flex flex-col justify-between p-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] sm:text-[10px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#e5654b] motion-safe:animate-pulse" />
                      Rec · {frameCode}
                    </span>
                    <span className="text-right">{coordinates}</span>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <span ref={tcRef} className="tabular-nums">
                      00:04:12:00
                    </span>
                    <span className="hidden sm:inline">24 fps · 2.39:1</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* split title */}
          <h1 className="pointer-events-none absolute inset-0 z-20 font-serif text-[length:clamp(2.25rem,min(6.6vw,12svh),8.5rem)] font-normal leading-[0.92] tracking-[-0.035em]">
            <span
              className="absolute block w-max translate-y-[38%]"
              style={{
                left: "calc(var(--ix) + var(--ax))",
                bottom: "calc(100% - var(--iy))",
                maxWidth: "calc(100vw - 2.5rem)",
              }}
            >
              <motion.span
                className="block"
                style={{
                  x: titleAX,
                  y: titleAY,
                  opacity: titleOpacity,
                  filter: titleFilter,
                  textShadow: "0 2px 30px rgba(0,0,0,0.35)",
                }}
              >
                {titleStart}
              </motion.span>
            </span>{" "}
            <span
              className="absolute block w-max -translate-y-[38%] text-right"
              style={{
                right: "calc(var(--ix) + var(--ax))",
                top: "calc(100% - var(--iy))",
                maxWidth: "calc(100vw - 2.5rem)",
              }}
            >
              <motion.span
                className="block italic text-[#ecd0ac]"
                style={{
                  x: titleBX,
                  y: titleBY,
                  opacity: titleOpacity,
                  filter: titleFilter,
                  textShadow: "0 2px 30px rgba(0,0,0,0.35)",
                }}
              >
                {titleEnd}
              </motion.span>
            </span>
          </h1>

          {/* header */}
          <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-7">
            <a
              id="aurelia-home"
              href="#"
              className={cn("rounded-sm font-serif text-xl tracking-[0.01em] md:text-2xl", focusRing)}
            >
              {brand}
              <span className="text-[#e7a46c]">.</span>
            </a>
            <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  id={`aurelia-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  href={link.href}
                  className={cn(
                    "rounded-sm text-[13px] tracking-wide text-white/65 transition-colors hover:text-white",
                    focusRing,
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              id="aurelia-cta"
              href={ctaHref}
              className={cn(
                "shrink-0 rounded-full border border-white/20 bg-white/[0.04] px-4 py-2 text-[13px] text-[#f3ece2] backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10",
                focusRing,
              )}
            >
              {ctaLabel}
            </a>
          </header>

          {/* bottom meta + scroll cue */}
          <motion.div
            style={{ opacity: metaOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-5 pb-6 md:px-10 md:pb-8"
          >
            <p className="max-w-[15rem] text-xs leading-relaxed text-white/55 md:max-w-xs md:text-sm">
              {tagline}
            </p>
            <div
              aria-hidden
              className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50"
            >
              <span>Scroll</span>
              <span className="relative block h-10 w-px overflow-hidden bg-white/15">
                <motion.span
                  className="absolute inset-x-0 top-0 block h-1/2 bg-white/70"
                  initial={false}
                  animate={reduced ? { y: "50%" } : { y: ["-100%", "200%"] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                  }
                />
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* continuation */}
      <section
        id="aurelia-films"
        aria-label="About the studio"
        className="relative px-5 pb-28 pt-24 md:px-10 md:pb-40 md:pt-36"
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.35em] text-white/45 md:mb-14">
            (01) — The studio
          </p>
          <p
            ref={paraRef}
            className="max-w-5xl text-balance font-serif text-[length:clamp(1.85rem,4.8vw,4.25rem)] leading-[1.08] tracking-[-0.02em]"
          >
            {words.map((word, i) => (
              <React.Fragment key={`${word}-${i}`}>
                <RevealWord
                  word={word}
                  index={i}
                  total={words.length}
                  progress={paraProgress}
                  reduced={reduced}
                />
                {i < words.length - 1 ? " " : null}
              </React.Fragment>
            ))}
          </p>
          <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between md:mt-20">
            <p className="text-sm text-white/50">{studioNote}</p>
            <a
              id="aurelia-explore-films"
              href={exploreHref}
              className={cn(
                "group inline-flex w-fit items-center gap-2 rounded-sm text-sm text-[#f3ece2] transition-colors hover:text-[#ecd0ac]",
                focusRing,
              )}
            >
              {exploreLabel}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AureliaHero;
