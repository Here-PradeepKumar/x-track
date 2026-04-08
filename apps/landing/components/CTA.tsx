export default function CTA() {
  return (
    <section id="download" className="relative bg-bg py-28 lg:py-40 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[500px] bg-lime/5 rounded-full blur-[140px]" />
      </div>

      {/* Radial lines */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.5) 80px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <span className="inline-block text-xs font-body font-semibold text-lime tracking-widest uppercase mb-6">
          Get Started Today
        </span>

        <h2 className="font-display font-black text-white leading-[0.92] tracking-tight text-[clamp(48px,9vw,120px)] mb-4">
          RACE DAY
          <br />
          <span className="text-lime">STARTS HERE.</span>
        </h2>

        <p className="text-on-surface-variant font-body text-xl max-w-lg mx-auto leading-relaxed mb-12">
          Whether you're an athlete chasing your PR, a volunteer powering your community, or an organizer building the next legendary race — X-Track is your platform.
        </p>

        {/* App download buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* App Store */}
          <a
            href="#"
            className="group flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-lime/40 hover:bg-lime/5 transition-all duration-200 min-w-[200px]"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white flex-shrink-0" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.77M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <p className="text-xs font-body text-on-surface-variant">Download on the</p>
              <p className="text-sm font-body font-bold text-white group-hover:text-lime transition-colors">App Store</p>
            </div>
          </a>

          {/* Google Play */}
          <a
            href="#"
            className="group flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-cyan/40 hover:bg-cyan/5 transition-all duration-200 min-w-[200px]"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white flex-shrink-0" fill="currentColor">
              <path d="M3.18 23.76c.34.19.73.19 1.08 0l11.37-6.54-2.45-2.45-9.95 8.98-.05.01zM.75 1.43C.28 1.79 0 2.37 0 3.14v17.72c0 .77.28 1.35.75 1.71l.09.09 9.93-9.93v-.23L.84 1.34l-.09.09zM19.67 9.88l-2.47-1.43-2.74 2.74 2.74 2.73 2.48-1.43c.71-.41.71-1.21-.01-1.61zM3.18.24l11.37 6.55-2.45 2.44L2.09.23l1.09.01z" />
            </svg>
            <div className="text-left">
              <p className="text-xs font-body text-on-surface-variant">Get it on</p>
              <p className="text-sm font-body font-bold text-white group-hover:text-cyan transition-colors">Google Play</p>
            </div>
          </a>

          {/* Web Dashboard */}
          <a
            href="#"
            className="group flex items-center gap-3 px-6 py-4 bg-lime/10 border border-lime/30 rounded-2xl hover:bg-lime/20 transition-all duration-200 min-w-[200px]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-lime flex-shrink-0">
              <rect x="3" y="3" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="text-left">
              <p className="text-xs font-body text-lime/70">For Organizers</p>
              <p className="text-sm font-body font-bold text-lime">Web Dashboard</p>
            </div>
          </a>
        </div>

        {/* Superadmin note */}
        <p className="text-xs font-body text-on-surface-variant/60">
          Organizer access is invite-only · Contact us to onboard your race
        </p>
      </div>
    </section>
  );
}
