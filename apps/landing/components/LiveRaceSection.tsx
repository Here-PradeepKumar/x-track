"use client";

import { useEffect, useState } from "react";

const ATHLETES = [
  { bib: "042", name: "Alex Rivera", time: "00:14:32", obstacle: "Mud Gauntlet", pos: 1 },
  { bib: "117", name: "Jordan Pierce", time: "00:14:55", obstacle: "Rope Climb", pos: 2 },
  { bib: "008", name: "Sam Chen", time: "00:15:10", obstacle: "Wall Jump", pos: 3 },
  { bib: "201", name: "Taylor Brooks", time: "00:15:44", obstacle: "Monkey Bars", pos: 4 },
  { bib: "089", name: "Morgan Lee", time: "00:16:01", obstacle: "Water Crawl", pos: 5 },
];

const FEED = [
  { bib: "042", name: "Alex Rivera", milestone: "Rope Climb #5", time: "14:32.441" },
  { bib: "117", name: "Jordan Pierce", milestone: "Mud Gauntlet #4", time: "14:45.103" },
  { bib: "008", name: "Sam Chen", milestone: "Rope Climb #5", time: "15:02.887" },
  { bib: "201", name: "Taylor Brooks", milestone: "Wall Jump #3", time: "15:28.552" },
  { bib: "089", name: "Morgan Lee", milestone: "Mud Gauntlet #4", time: "15:57.219" },
  { bib: "055", name: "Casey Ortiz", milestone: "Start Line", time: "16:03.774" },
];

export default function LiveRaceSection() {
  const [tick, setTick] = useState(0);
  const [feedItems, setFeedItems] = useState(FEED.slice(0, 3));

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      setFeedItems((prev) => {
        const next = [...prev];
        const nextItem = FEED[Math.floor(Math.random() * FEED.length)];
        next.unshift({ ...nextItem, time: `${Math.floor(Math.random() * 20 + 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}.${Math.floor(Math.random() * 999).toString().padStart(3, "0")}` });
        return next.slice(0, 5);
      });
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="athletes" className="relative bg-bg py-24 lg:py-36 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />

      {/* BG glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[700px] h-[700px] bg-cyan/4 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-block text-xs font-body font-semibold text-cyan tracking-widest uppercase mb-4">
              Live Race Intelligence
            </span>
            <h2 className="font-display font-black text-white text-[clamp(40px,5.5vw,72px)] leading-[0.95] tracking-tight mb-4">
              WATCH YOUR
              <br />
              RACE UNFOLD
              <br />
              <span className="text-cyan">IN REAL-TIME.</span>
            </h2>
            <p className="text-on-surface-variant font-body text-lg leading-relaxed mb-8 max-w-md">
              Every NFC tap at an obstacle fires a Firestore trigger that updates your race state in milliseconds. Athletes see their splits as they happen — no refresh needed.
            </p>

            <ul className="space-y-4">
              {[
                ["Live split times at every obstacle", "cyan"],
                ["Position tracking vs. category field", "cyan"],
                ["Automatic finish time calculation", "cyan"],
                ["Full race replay after the event", "white"],
              ].map(([text, color]) => (
                <li key={text as string} className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color === "cyan" ? "bg-cyan" : "bg-white/40"}`} />
                  <span className="text-sm font-body text-on-surface-variant">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: mock UI */}
          <div className="relative">
            {/* Phone frame */}
            <div className="mx-auto max-w-[360px] rounded-[32px] border border-outline/40 bg-surface overflow-hidden shadow-2xl shadow-black/60">
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <span className="text-xs font-body text-on-surface-variant">9:41</span>
                <div className="flex gap-1 items-center">
                  <span className="w-1 h-1 rounded-full bg-lime animate-pulse" />
                  <span className="text-xs font-body text-lime font-semibold">LIVE</span>
                </div>
              </div>

              {/* App header */}
              <div className="px-6 pb-4 border-b border-outline/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-on-surface-variant uppercase tracking-widest">URBAN BEAST 2026</p>
                    <p className="font-display font-bold text-white text-xl">MY RACE</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-body text-on-surface-variant">BIB</p>
                    <p className="font-display font-black text-lime text-2xl">042</p>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="px-6 py-4">
                <p className="text-xs font-body font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                  Category Standings
                </p>
                <div className="space-y-2">
                  {ATHLETES.map((a) => (
                    <div
                      key={a.bib}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                        a.bib === "042"
                          ? "bg-lime/10 border border-lime/20"
                          : "bg-surface-high/50"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0 ${
                          a.pos === 1
                            ? "bg-lime text-bg"
                            : "bg-surface-highest text-on-surface-variant"
                        }`}
                      >
                        {a.pos}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-body font-semibold truncate ${a.bib === "042" ? "text-lime" : "text-white"}`}>
                          {a.name}
                        </p>
                        <p className="text-[10px] font-body text-on-surface-variant">{a.obstacle}</p>
                      </div>
                      <span className="text-xs font-display font-bold text-on-surface-variant tabular-nums">
                        {a.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live feed */}
              <div className="px-6 pb-6">
                <p className="text-xs font-body font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                  Live Checkpoint Feed
                </p>
                <div className="space-y-2 overflow-hidden">
                  {feedItems.slice(0, 4).map((f, i) => (
                    <div
                      key={`${f.bib}-${f.time}-${i}`}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        i === 0 ? "bg-lime/5 border border-lime/15 animate-fade-up" : "opacity-60"
                      }`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className="text-[10px] font-display font-black text-lime/70 w-8 flex-shrink-0">
                        #{f.bib}
                      </span>
                      <span className="text-[10px] font-body text-on-surface-variant flex-1 truncate">
                        {f.name} · {f.milestone}
                      </span>
                      <span className="text-[10px] font-display text-on-surface-variant tabular-nums">
                        {f.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating NFC badge */}
            <div className="absolute -bottom-4 -right-4 lg:right-0 flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-cyan/30 shadow-lg shadow-black/40">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-cyan flex-shrink-0">
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 6a5.657 5.657 0 000 8M14 6a5.657 5.657 0 010 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-body font-semibold text-cyan whitespace-nowrap">
                NFC tap → instant update
              </span>
            </div>

            {/* Floating glow dot */}
            <div className="absolute -top-4 -left-4 lg:left-0 flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-lime/30 shadow-lg shadow-black/40">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse flex-shrink-0" />
              <span className="text-xs font-body font-semibold text-lime whitespace-nowrap">
                Firebase real-time
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
