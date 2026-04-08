const COLS = [
  {
    head: "Platform",
    links: [["Athlete App","#apps"],["Volunteer App","#apps"],["Web Dashboard","#apps"],["How It Works","#process"]],
  },
  {
    head: "Tech",
    links: [["Firebase","#"],["NFC Scanning","#"],["Real-Time Sync","#"],["TypeScript","#"]],
  },
  {
    head: "Company",
    links: [["About","#"],["Contact","#"],["Privacy","#"],["Terms","#"]],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink-2 border-t border-rule">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <a href="#" className="inline-block mb-5">
              <span className="font-display text-xl text-white tracking-[0.12em]">
                X—<span className="text-lime">TRACK</span>
              </span>
            </a>
            <p className="text-sm font-body text-mist leading-relaxed mb-6 max-w-[200px]">
              NFC-powered race management for obstacle course events.
            </p>
            {/* Socials */}
            <div className="flex gap-2.5">
              {["GitHub","Twitter","Instagram"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="w-8 h-8 rounded-full bg-ink-3 border border-rule flex items-center justify-center text-mist hover:text-lime hover:border-lime/30 transition-colors duration-200"
                >
                  <span className="text-[9px] font-body font-bold">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.head}>
              <p className="text-[10px] font-body font-bold text-lime tracking-[0.18em] uppercase mb-5">{c.head}</p>
              <ul className="space-y-3">
                {c.links.map(([l, h]) => (
                  <li key={l}>
                    <a href={h} className="text-sm font-body text-mist hover:text-white transition-colors duration-150">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-body text-mist/40">© 2026 X-Track. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-[11px] font-body text-mist/40">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
