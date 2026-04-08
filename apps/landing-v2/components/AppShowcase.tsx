// Three full-width alternating panels — each app gets half the screen
const APPS = [
  {
    id: "athlete",
    tag: "ATHLETE APP",
    tagColor: "text-lime",
    headline: "YOUR RACE,\nLIVE.",
    sub: "Track your position at every obstacle the moment your wristband is tapped. Live split times, category standings, and a full race history — all in your pocket.",
    features: [
      "Live BIB tracking at every obstacle",
      "Real-time split times & positions",
      "Full race history & results gallery",
      "Explore & register for events",
    ],
    platform: "iOS & Android",
    reverse: false,
    accent: "#cafd00",
    visual: (
      <div className="relative flex items-center justify-center py-12 px-8">
        <div className="absolute w-64 h-64 bg-lime/10 rounded-full blur-[80px]" />
        {/* BIG BIB NUMBER */}
        <div className="relative">
          <div className="w-52 h-64 rounded-3xl bg-ink-3 border border-rule flex flex-col items-center justify-center gap-3 shadow-2xl">
            <span className="text-[9px] font-body font-bold text-mist uppercase tracking-[0.2em]">URBAN BEAST 2026</span>
            <span className="font-display text-lime text-[96px] leading-none">042</span>
            <span className="text-[9px] font-body font-bold text-mist uppercase tracking-widest">ELITE MALE</span>
            <div className="mt-2 w-28 h-8 bg-ink-4 rounded-lg flex items-center justify-center">
              {/* barcode lines */}
              <div className="flex gap-[2px] items-end h-5">
                {[3,5,2,6,3,4,5,2,4,3,6,2,5,3,4].map((h, i) => (
                  <div key={i} className="bg-mist/40 rounded-[1px]" style={{ width: 2, height: `${h * 3}px` }} />
                ))}
              </div>
            </div>
          </div>
          {/* Floating split badge */}
          <div className="absolute -top-3 -right-6 bg-lime text-ink text-[10px] font-body font-black px-2.5 py-1 rounded-full shadow-lg">
            #1 IN CATEGORY
          </div>
          <div className="absolute -bottom-2 -left-6 bg-ink-3 border border-rule text-white text-[10px] font-body font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-lime rounded-full animate-pulse" />
            14:32 SPLIT
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "volunteer",
    tag: "VOLUNTEER APP",
    tagColor: "text-cyan",
    headline: "TAP.\nCONFIRM.\nMOVE ON.",
    sub: "One tap of an NFC wristband writes an immutable checkpoint to Firestore. No internet required for the tap itself. No lag, no bottleneck at the obstacle.",
    features: [
      "NFC wristband scanning",
      "Assigned obstacle & event view",
      "Instant checkpoint confirmation",
      "Works offline — syncs when connected",
    ],
    platform: "iOS & Android (NFC required)",
    reverse: true,
    accent: "#00eefc",
    visual: (
      <div className="relative flex items-center justify-center py-12 px-8">
        <div className="absolute w-64 h-64 bg-cyan/8 rounded-full blur-[80px]" />
        <div className="relative w-56">
          {/* Volunteer screen */}
          <div className="w-full rounded-3xl bg-ink-3 border border-rule p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[8px] font-body text-mist uppercase tracking-widest">MY STATION</p>
                <p className="font-display text-white text-lg tracking-wide">ROPE CLIMB</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-cyan">
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4.5 4.5a4.95 4.95 0 000 7M11.5 4.5a4.95 4.95 0 010 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Scan area */}
            <div className="relative rounded-2xl bg-ink-4 border border-dashed border-cyan/30 h-28 flex flex-col items-center justify-center gap-2 mb-4">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 text-cyan/50">
                <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M18 18h4M22 18v4M18 22h2M22 22v4M18 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-[9px] font-body text-mist">Hold near wristband</p>
            </div>

            {/* Recent scans */}
            <p className="text-[8px] font-body font-bold text-mist uppercase tracking-widest mb-2">Recent</p>
            {[{bib:"042",name:"A. Rivera",t:"14:32"},{bib:"117",name:"J. Pierce",t:"14:55"}].map(s => (
              <div key={s.bib} className="flex items-center gap-2 py-1.5">
                <span className="text-[9px] font-display text-cyan w-8">#{s.bib}</span>
                <span className="flex-1 text-[9px] font-body text-white">{s.name}</span>
                <span className="text-[9px] font-display text-mist">{s.t}</span>
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-cyan flex-shrink-0">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>

          {/* Floating tap badge */}
          <div className="absolute -top-2 -left-8 flex items-center gap-1.5 px-3 py-1.5 bg-cyan text-ink text-[10px] font-body font-black rounded-full shadow-lg">
            NFC TAP ✓
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "organizer",
    tag: "WEB DASHBOARD",
    tagColor: "text-white/60",
    headline: "CREATE.\nMANAGE.\nWATCH LIVE.",
    sub: "Build events, configure obstacle milestones, bulk-import BIBs from CSV, invite volunteers via link, and watch a real-time checkpoint feed — all from the browser.",
    features: [
      "Event & milestone creation",
      "CSV BIB bulk import",
      "Volunteer invite system",
      "Live checkpoint feed",
      "Category weight configuration",
    ],
    platform: "Web — any browser",
    reverse: false,
    accent: "#ffffff",
    visual: (
      <div className="relative flex items-center justify-center py-8 px-4">
        <div className="absolute w-64 h-40 bg-white/3 rounded-full blur-[80px]" />
        {/* Dashboard mockup */}
        <div className="relative w-full max-w-[340px] rounded-2xl bg-ink-2 border border-rule shadow-2xl overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-ink-3 border-b border-rule">
            <span className="w-2.5 h-2.5 rounded-full bg-rule" />
            <span className="w-2.5 h-2.5 rounded-full bg-rule" />
            <span className="w-2.5 h-2.5 rounded-full bg-rule" />
            <div className="flex-1 mx-3 px-3 py-1 rounded bg-ink-4 text-[9px] font-body text-mist/50">
              app.xtrack.io/organizer
            </div>
          </div>
          {/* Dashboard content */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[8px] font-body text-mist uppercase tracking-widest">Event</p>
                <p className="font-display text-white text-sm tracking-wide">URBAN BEAST 2026</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-lime/15 text-lime text-[8px] font-body font-bold">LIVE</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[["248","Athletes"],["13","Obstacles"],["1,847","Checkpoints"]].map(([v,l]) => (
                <div key={l} className="bg-ink-3 rounded-xl p-2.5 text-center">
                  <p className="font-display text-white text-lg leading-none">{v}</p>
                  <p className="text-[8px] font-body text-mist mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            {/* Live feed */}
            <p className="text-[8px] font-body font-bold text-mist uppercase tracking-widest mb-2">Live Feed</p>
            {[
              {bib:"042",name:"A. Rivera",milestone:"Mud Gauntlet",t:"14:32"},
              {bib:"117",name:"J. Pierce",milestone:"Rope Climb",t:"14:55"},
              {bib:"008",name:"S. Chen",milestone:"Rope Climb",t:"15:10"},
            ].map((e,i) => (
              <div key={e.bib} className={`flex items-center gap-2 py-1.5 border-b border-rule/50 ${i === 0 ? "opacity-100" : "opacity-50"}`}>
                <span className="text-[8px] font-display text-mist w-7">#{e.bib}</span>
                <span className="flex-1 text-[8px] font-body text-white truncate">{e.name} · {e.milestone}</span>
                <span className="text-[8px] font-display text-mist tabular-nums">{e.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export default function AppShowcase() {
  return (
    <section id="apps" className="bg-ink">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-12 pt-20 pb-4">
        <span className="text-[11px] font-body font-bold text-lime tracking-[0.2em] uppercase">Three Apps. One Platform.</span>
        <h2 className="font-display text-white text-[clamp(40px,5.5vw,72px)] leading-[0.92] tracking-[0.02em] mt-3 mb-16">
          BUILT FOR EVERY<br /><span className="text-lime">ROLE IN THE RACE.</span>
        </h2>
      </div>

      {APPS.map((app, i) => (
        <div
          key={app.id}
          className={`border-t border-rule ${i === APPS.length - 1 ? "border-b" : ""}`}
        >
          <div className="max-w-screen-xl mx-auto px-6 xl:px-12">
            <div className={`grid lg:grid-cols-2 items-center gap-0 ${app.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>

              {/* Text panel */}
              <div className={`py-16 lg:py-20 ${app.reverse ? "lg:pl-16" : "lg:pr-16"}`}>
                <span className={`text-[11px] font-body font-bold tracking-[0.2em] uppercase mb-4 block ${app.tagColor}`}>
                  {app.tag}
                </span>
                <h3
                  className="font-display text-white text-[clamp(42px,5vw,68px)] leading-[0.92] tracking-[0.02em] mb-6 whitespace-pre-line"
                  style={{ color: i === 0 ? undefined : undefined }}
                >
                  {app.headline}
                </h3>
                <p className="text-mist font-body text-base leading-relaxed mb-8 max-w-md">
                  {app.sub}
                </p>
                <ul className="space-y-3 mb-8">
                  {app.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: app.accent }}>
                        <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-body text-mist">{f}</span>
                    </li>
                  ))}
                </ul>
                <span className="text-[11px] font-body text-mist/50 uppercase tracking-widest">
                  {app.platform}
                </span>
              </div>

              {/* Visual panel */}
              <div className={`hidden lg:block border-rule ${app.reverse ? "border-r" : "border-l"} bg-ink-2/40`}>
                {app.visual}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
