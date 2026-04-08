const STEPS = [
  {
    num: "01",
    title: "Organizer Creates the Event",
    description:
      "Log into the X-Track web dashboard. Create your race, define obstacle milestones, set categories with weights, and import athletes via CSV BIB list.",
    tag: "Web Dashboard",
    tagColor: "text-white/60",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Volunteers Get Their Station",
    description:
      "Organizer sends invite links to each volunteer. They download the X-Track Volunteer app, accept the invite, and see their assigned obstacle — ready to scan.",
    tag: "Volunteer App",
    tagColor: "text-cyan",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <path d="M16 4a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Athletes Register & Race",
    description:
      "Athletes download the X-Track app, sign in with their phone, and claim their BIB number. Their NFC wristband is linked — ready for the race to begin.",
    tag: "Athlete App",
    tagColor: "text-lime",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <path d="M20 4l-12 14h9l-3 10 12-14h-9l3-10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "NFC Tap → Live Update",
    description:
      "As athletes pass each obstacle, the volunteer taps their wristband. A checkpoint is written to Firestore instantly. The athlete sees their time update live — milliseconds later.",
    tag: "Real-Time",
    tagColor: "text-lime",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10a8.485 8.485 0 000 12M22 10a8.485 8.485 0 010 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6.686 6.686a13.435 13.435 0 000 18.628M25.314 6.686a13.435 13.435 0 010 18.628" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-bg py-24 lg:py-36 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />

      {/* Lime glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-lime/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="mb-16 lg:mb-24 grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <span className="inline-block text-xs font-body font-semibold text-lime tracking-widest uppercase mb-4">
              The X-Track Flow
            </span>
            <h2 className="font-display font-black text-white text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-tight">
              FROM SETUP
              <br />
              <span className="text-lime">TO FINISH LINE.</span>
            </h2>
          </div>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed">
            Four steps from race creation to real-time results. Everything connects through Firebase — zero polling, pure real-time.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="hidden lg:block absolute left-[calc(50%-0.5px)] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-outline/40 to-transparent" />

          <div className="space-y-8 lg:space-y-0">
            {STEPS.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={step.num}
                  className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center ${
                    isEven ? "" : "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
                  }`}
                >
                  {/* Text side */}
                  <div className={`mb-6 lg:mb-0 ${isEven ? "lg:text-right" : ""}`}>
                    <div className={`flex items-center gap-3 mb-4 ${isEven ? "lg:justify-end" : ""}`}>
                      <span className={`text-xs font-body font-bold tracking-widest uppercase ${step.tagColor}`}>
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-3xl text-white leading-tight mb-3">
                      {step.title}
                    </h3>
                    <p className="text-on-surface-variant font-body leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Card side */}
                  <div className={`relative flex ${isEven ? "lg:justify-start" : "lg:justify-end"}`}>
                    {/* Center dot (desktop) */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-bg border border-lime/40 items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                    </div>

                    <div className="w-full max-w-sm rounded-2xl border border-outline/30 bg-surface p-6 flex flex-col gap-4 hover:border-lime/30 transition-colors duration-300">
                      <div className="flex items-start justify-between">
                        <span className="font-display font-black text-5xl text-lime/20 leading-none">
                          {step.num}
                        </span>
                        <div className="text-on-surface-variant">{step.icon}</div>
                      </div>
                      <div>
                        <p className="text-xs font-body font-semibold text-on-surface-variant uppercase tracking-widest">
                          Step {step.num}
                        </p>
                        <p className="mt-1 font-display font-bold text-lg text-white leading-snug">
                          {step.title}
                        </p>
                      </div>
                      {/* Progress bar */}
                      <div className="h-0.5 w-full bg-outline/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lime rounded-full"
                          style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
