const STEPS = [
  {
    num: "01",
    title: "Organizer Creates the Event",
    description:
      "Log into the X-Track web dashboard. Create your race, define obstacle milestones, set categories with weights, and import athletes via CSV BIB list.",
    tag: "Web Dashboard",
    tagColor: "text-white/50",
    accentBar: "bg-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Volunteers Get Their Station",
    description:
      "Organizer sends invite links to each volunteer. They download the Volunteer app, accept the invite, and see their assigned obstacle — ready to scan.",
    tag: "Volunteer App",
    tagColor: "text-cyan",
    accentBar: "bg-cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M12 4a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Athletes Register & Race",
    description:
      "Athletes download the X-Track app, sign in with their phone, and claim their BIB number. Their NFC wristband is linked — race day ready.",
    tag: "Athlete App",
    tagColor: "text-lime",
    accentBar: "bg-lime",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "NFC Tap → Live Update",
    description:
      "As athletes pass each obstacle, the volunteer taps their wristband. A checkpoint writes to Firestore instantly — the athlete sees their split update milliseconds later.",
    tag: "Real-Time",
    tagColor: "text-lime",
    accentBar: "bg-lime",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8a5.657 5.657 0 000 8M16 8a5.657 5.657 0 010 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5.172 5.172a10 10 0 000 14.142M18.828 5.172a10 10 0 010 14.142" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-bg py-24 lg:py-36">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-20 flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-24">
          <div className="flex-shrink-0">
            <span className="inline-block text-xs font-body font-semibold text-lime tracking-widest uppercase mb-4">
              The X-Track Flow
            </span>
            <h2 className="font-display text-white text-[clamp(44px,6vw,80px)] leading-none tracking-wide">
              FROM SETUP
              <br />
              <span className="text-lime">TO FINISH LINE.</span>
            </h2>
          </div>
          <p className="text-on-surface-variant font-body text-base leading-relaxed max-w-sm lg:pb-2">
            Four steps from race creation to real-time results. Everything connects through Firebase — zero polling, pure real-time.
          </p>
        </div>

        {/* Step rows */}
        <div>
          {STEPS.map((step, i) => (
            <div key={step.num}>
              {/* Divider */}
              <div className="h-px bg-outline/25" />

              <div className="group grid grid-cols-[56px_1fr] lg:grid-cols-[80px_240px_1fr_auto] items-center gap-6 lg:gap-12 py-8 lg:py-10 hover:bg-white/[0.02] transition-colors duration-200 -mx-6 lg:-mx-12 px-6 lg:px-12">
                {/* Step number */}
                <span className="font-display text-4xl lg:text-5xl leading-none text-outline/60 group-hover:text-lime/30 transition-colors duration-300 tabular-nums">
                  {step.num}
                </span>

                {/* Tag + title (stacked on mobile, side by side on desktop) */}
                <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`text-on-surface-variant group-hover:text-white/60 transition-colors ${step.tagColor.replace("text-", "text-")}`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-body font-semibold tracking-widest uppercase ${step.tagColor}`}>
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-white text-xl lg:text-2xl leading-tight tracking-wide">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="col-span-2 lg:col-span-1 text-sm font-body text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>

                {/* Progress indicator — desktop only */}
                <div className="hidden lg:flex flex-col items-end gap-2 flex-shrink-0 w-24">
                  <span className="text-[10px] font-body text-on-surface-variant/40 uppercase tracking-widest">
                    {i + 1} / {STEPS.length}
                  </span>
                  <div className="w-full h-0.5 bg-outline/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${step.accentBar}`}
                      style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Final divider */}
          <div className="h-px bg-outline/25" />
        </div>
      </div>
    </section>
  );
}
