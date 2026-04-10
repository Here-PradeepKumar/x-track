"use client";
import { useEffect, useState } from "react";

const WORDS = ["EVERY BIB.", "EVERY SPLIT.", "EVERY SECOND."];

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-ink overflow-hidden flex flex-col">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-lime/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan/[0.04] rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-lime/[0.02] rounded-full blur-[200px]" />
      </div>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "160px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center pt-20">
        <div className="max-w-screen-xl mx-auto px-6 xl:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center min-h-[calc(100vh-80px)]">

            {/* Left — text */}
            <div className="flex flex-col justify-center py-16 lg:py-0">
              {/* Live pill */}
              {/* Main headline */}
              <div className="space-y-0">
                <h1 className="font-display text-white leading-[0.9] tracking-[0.02em]">
                  <span className="block text-[clamp(64px,10vw,140px)]">X—TRACK</span>
                </h1>
                <div className="h-[clamp(56px,9vw,124px)] flex items-center overflow-hidden">
                  <span
                    className="font-display text-lime leading-[0.9] tracking-[0.02em] text-[clamp(52px,8.5vw,116px)] transition-all duration-350"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(16px)",
                    }}
                  >
                    {WORDS[idx]}
                  </span>
                </div>
              </div>

              <p className="mt-8 text-mist font-body text-lg leading-relaxed max-w-md">
                NFC-powered BIB scanning meets real-time Firestore sync. Athletes track their race live. Volunteers scan at obstacles. Organizers manage everything from the web.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#download"
                  className="px-8 py-4 bg-lime text-ink font-body font-bold text-sm rounded-full hover:bg-lime-dim transition-colors duration-150 active:scale-95"
                >
                  Download the App
                </a>
                <a
                  href="https://x-track-iota.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-lime/60 text-lime font-body font-semibold text-sm rounded-full hover:bg-lime/10 transition-colors duration-200"
                >
                  Organiser Dashboard →
                </a>
                <a
                  href="#process"
                  className="px-8 py-4 border border-rule text-white font-body font-semibold text-sm rounded-full hover:border-lime/50 hover:text-lime transition-colors duration-200"
                >
                  How It Works
                </a>
              </div>

              {/* Metric row */}
              <div className="mt-14 flex gap-10">
                {[
                  ["NFC", "Tap Technology"],
                  ["3", "Native Apps"],
                  ["Live", "Firebase Sync"],
                ].map(([val, lbl]) => (
                  <div key={lbl} className="flex flex-col gap-0.5">
                    <span className="font-display text-[28px] text-lime leading-none tracking-wide">{val}</span>
                    <span className="text-[11px] font-body text-mist uppercase tracking-widest">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — phone mockup */}
            <div className="hidden lg:flex items-center justify-center relative">
              {/* Glow behind phone */}
              <div className="absolute w-72 h-72 bg-lime/10 rounded-full blur-[80px]" />

              {/* Phone shell */}
              <div className="relative w-[300px] rounded-[40px] bg-ink-2 border border-rule/60 shadow-2xl shadow-black overflow-hidden">
                {/* Notch */}
                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-24 h-1.5 bg-ink-4 rounded-full" />
                </div>

                {/* App content */}
                <div className="px-5 pb-8">
                  {/* Status bar */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-body text-mist">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-lime rounded-full animate-pulse" />
                      <span className="text-[10px] font-body font-bold text-lime">LIVE</span>
                    </div>
                  </div>

                  {/* Race header */}
                  <div className="mb-4 pb-4 border-b border-rule">
                    <p className="text-[9px] font-body text-mist uppercase tracking-widest mb-0.5">URBAN BEAST 2026</p>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-white text-2xl tracking-wide">MY RACE</p>
                      <div className="text-right">
                        <p className="text-[9px] font-body text-mist">BIB</p>
                        <p className="font-display text-lime text-3xl leading-none">042</p>
                      </div>
                    </div>
                  </div>

                  {/* Current split */}
                  <div className="mb-4 p-3 rounded-2xl bg-lime/10 border border-lime/20">
                    <p className="text-[9px] font-body text-lime/70 uppercase tracking-widest mb-1">Current Obstacle</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-body font-semibold text-white">Mud Gauntlet #4</p>
                      <p className="font-display text-lime text-base tracking-wide">14:32</p>
                    </div>
                    <div className="mt-2 h-0.5 bg-rule rounded-full overflow-hidden">
                      <div className="h-full bg-lime rounded-full" style={{ width: "62%" }} />
                    </div>
                    <p className="mt-1 text-[9px] font-body text-mist">8 of 13 obstacles completed</p>
                  </div>

                  {/* Mini leaderboard */}
                  <p className="text-[9px] font-body font-semibold text-mist uppercase tracking-widest mb-2">Category Standings</p>
                  {[
                    { pos: 1, name: "Alex Rivera", bib: "042", t: "14:32", me: true },
                    { pos: 2, name: "Jordan Pierce", bib: "117", t: "14:55", me: false },
                    { pos: 3, name: "Sam Chen", bib: "008", t: "15:10", me: false },
                  ].map((r) => (
                    <div
                      key={r.bib}
                      className={`flex items-center gap-2.5 py-2 px-2.5 rounded-xl mb-1 ${r.me ? "bg-lime/10 border border-lime/15" : ""}`}
                    >
                      <span className={`w-4 h-4 rounded-full text-[9px] font-display flex items-center justify-center flex-shrink-0 ${r.pos === 1 ? "bg-lime text-ink" : "bg-ink-4 text-mist"}`}>
                        {r.pos}
                      </span>
                      <span className={`flex-1 text-[10px] font-body ${r.me ? "text-lime font-semibold" : "text-white"}`}>{r.name}</span>
                      <span className="text-[10px] font-display text-mist tabular-nums">{r.t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-8 -right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-3 border border-rule text-[11px] font-body font-semibold text-cyan shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                Firebase live
              </div>
              <div className="absolute bottom-16 -left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-3 border border-rule text-[11px] font-body font-semibold text-lime shadow-lg">
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 5a4.243 4.243 0 000 6M11 5a4.243 4.243 0 010 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                NFC tap
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-body text-mist uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-mist to-transparent" />
        </div>
      </div>
    </section>
  );
}
