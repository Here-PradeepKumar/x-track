"use client";

const ROLES = [
  {
    id: "01",
    title: "ATHLETE",
    accent: "lime",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    headline: "Race. Track. Dominate.",
    description:
      "See your live race progress as you pass each obstacle. Watch split times update in real-time, review your full results history, and explore upcoming events near you.",
    features: [
      "Live BIB tracking at every obstacle",
      "Real-time split times & leaderboard",
      "Full race history & results",
      "Explore events & categories",
      "Personal race profile",
    ],
    platform: "iOS & Android",
  },
  {
    id: "02",
    title: "VOLUNTEER",
    accent: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect
          x="3"
          y="11"
          width="18"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 11V7a5 5 0 0110 0v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
    headline: "Scan. Confirm. Move On.",
    description:
      "Tap athlete wristbands with your phone at your assigned obstacle. Checkpoints are written instantly to Firestore — no Wi-Fi required for NFC.",
    features: [
      "NFC wristband scanning",
      "Assigned obstacle view",
      "Checkpoint confirmation feed",
      "Offline-capable scanning",
      "Instant Firestore sync",
    ],
    platform: "iOS & Android (NFC required)",
  },
  {
    id: "03",
    title: "ORGANIZER",
    accent: "white",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="9"
          y="3"
          width="6"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 12h6M9 16h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    headline: "Create. Manage. Watch Live.",
    description:
      "Build events, set up obstacle milestones, import BIBs via CSV, invite volunteers, and watch a live checkpoint feed — all from your web dashboard.",
    features: [
      "Event creation & milestone setup",
      "CSV BIB bulk import",
      "Volunteer invite system",
      "Live checkpoint feed",
      "Category & weight management",
    ],
    platform: "Web Dashboard",
  },
];

const accentClasses: Record<string, { text: string; border: string; bg: string; dot: string }> = {
  lime: {
    text: "text-lime",
    border: "border-lime/20 hover:border-lime/60",
    bg: "bg-lime/5",
    dot: "bg-lime",
  },
  cyan: {
    text: "text-cyan",
    border: "border-cyan/20 hover:border-cyan/60",
    bg: "bg-cyan/5",
    dot: "bg-cyan",
  },
  white: {
    text: "text-white",
    border: "border-white/10 hover:border-white/40",
    bg: "bg-white/3",
    dot: "bg-white",
  },
};

export default function Features() {
  return (
    <section id="features" className="relative bg-bg py-24 lg:py-36 overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-block text-xs font-body font-semibold text-lime tracking-widest uppercase mb-4">
            Three Apps. One Platform.
          </span>
          <h2 className="font-display font-black text-white text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-tight">
            BUILT FOR EVERY
            <br />
            <span className="text-lime">ROLE IN THE RACE.</span>
          </h2>
          <p className="mt-4 text-on-surface-variant font-body text-lg max-w-xl">
            Athletes, volunteers, and organizers each get a dedicated app tailored to their exact workflow.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {ROLES.map((role) => {
            const ac = accentClasses[role.accent];
            return (
              <div
                key={role.id}
                className={`group relative rounded-2xl border ${ac.border} ${ac.bg} p-8 transition-all duration-300 hover:bg-surface-high`}
              >
                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-8">
                  <span className={`font-display font-black text-6xl leading-none ${ac.text} opacity-20`}>
                    {role.id}
                  </span>
                  <div className={`${ac.text} opacity-70`}>{role.icon}</div>
                </div>

                {/* Title */}
                <div className="mb-2">
                  <span className={`text-xs font-body font-bold tracking-widest uppercase ${ac.text}`}>
                    {role.title}
                  </span>
                </div>
                <h3 className="font-display font-black text-2xl text-white mb-3 leading-tight">
                  {role.headline}
                </h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-6">
                  {role.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-8">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${ac.dot}`} />
                      <span className="text-sm font-body text-on-surface-variant">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Platform badge */}
                <div className="mt-auto">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-body font-semibold ${ac.text} opacity-60 tracking-wide`}>
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {role.platform}
                  </span>
                </div>

                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${ac.bg} blur-xl`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
