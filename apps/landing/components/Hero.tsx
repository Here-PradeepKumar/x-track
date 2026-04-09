"use client";

import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  "LIVE RACE TRACKING",
  "BIB MANAGEMENT",
  "NFC CHECKPOINT SCANNING",
  "REAL-TIME SPLIT TIMES",
  "OBSTACLE COURSE RACING",
  "ATHLETE RESULTS",
  "VOLUNTEER COORDINATION",
  "EVENT MANAGEMENT",
];

const STATS = [
  { value: "∞", label: "Checkpoints Tracked" },
  { value: "3", label: "Platforms" },
  { value: "NFC", label: "Scan Technology" },
  { value: "LIVE", label: "Real-Time Updates" },
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(202, 253, 0, ${p.alpha})`;
        ctx.fill();
      });

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(202, 253, 0, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-bg flex flex-col overflow-hidden">
      {/* Particle canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-lime/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan/5 blur-[100px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-12 max-w-7xl mx-auto w-full pt-28 pb-8">
        <div className="max-w-4xl">
          {/* Badge */}

          {/* Main headline */}
          <h1 className="font-display font-black text-white leading-[0.92] tracking-tight mb-6">
            <span className="block text-[clamp(60px,11vw,148px)] text-white">
              TRACK
            </span>
            <span className="block text-[clamp(60px,11vw,148px)] text-lime leading-[0.95]">
              EVERY BIB.
            </span>
            <span className="block text-[clamp(36px,6.5vw,88px)] text-on-surface-variant leading-[1.1] mt-2">
              EVERY OBSTACLE.
            </span>
            <span className="block text-[clamp(36px,6.5vw,88px)] text-on-surface-variant leading-[1.1]">
              EVERY SECOND.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl font-body text-on-surface-variant max-w-xl leading-relaxed">
            X-Track powers obstacle course races with NFC BIB scanning,
            real-time athlete tracking, and a complete volunteer coordination
            system — all in one platform.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <a
              href="#download"
              className="group relative px-8 py-4 bg-lime text-bg text-base font-body font-bold rounded-full overflow-hidden hover:bg-lime-dim transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Download the App</span>
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-outline/60 text-white text-base font-body font-semibold rounded-full hover:border-lime/60 hover:text-lime transition-all duration-200"
            >
              See How It Works
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-display font-black text-3xl text-lime tracking-tight">
                  {s.value}
                </span>
                <span className="text-xs font-body text-on-surface-variant tracking-wide uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticker tape */}
      <div className="relative z-10 border-t border-outline/30 overflow-hidden py-3 bg-bg/80 backdrop-blur-sm">
        <div className="flex whitespace-nowrap animate-ticker-left">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 mx-6 text-xs font-body font-semibold tracking-widest uppercase text-on-surface-variant"
            >
              <span className="w-1 h-1 rounded-full bg-lime flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
