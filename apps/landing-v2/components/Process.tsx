const STEPS = [
  {
    n: "01",
    app: "Web Dashboard",
    appColor: "text-white/50",
    title: "Organizer creates the race",
    body: "Log into the web dashboard. Define the event, set obstacle milestones, configure categories with weights, and bulk-import BIBs from CSV.",
  },
  {
    n: "02",
    app: "Volunteer App",
    appColor: "text-cyan",
    title: "Volunteers get assigned to obstacles",
    body: "Organizer sends invite links. Volunteers download the app, accept the invite, and see their assigned obstacle. One phone. One job.",
  },
  {
    n: "03",
    app: "Athlete App",
    appColor: "text-lime",
    title: "Athletes link their BIB wristband",
    body: "Athletes sign in with their phone, claim their BIB number, and register their NFC wristband. They're in the system and race-ready.",
  },
  {
    n: "04",
    app: "Real-Time",
    appColor: "text-lime",
    title: "NFC tap → split time → live update",
    body: "Volunteer taps wristband. A Firestore checkpoint is written. A Cloud Function updates the athlete's race doc. The athlete sees their time — milliseconds later.",
  },
];

export default function Process() {
  return (
    <section id="process" className="bg-ink-2 py-24 lg:py-36">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-12">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 items-end mb-16 lg:mb-20">
          <div>
            <span className="text-[11px] font-body font-bold text-lime tracking-[0.2em] uppercase block mb-4">
              The X-Track Flow
            </span>
            <h2 className="font-display text-white text-[clamp(42px,6vw,80px)] leading-[0.92] tracking-[0.02em]">
              SETUP TO<br /><span className="text-lime">FINISH LINE.</span>
            </h2>
          </div>
          <p className="text-mist font-body leading-relaxed max-w-sm lg:pb-2">
            Four steps. Zero polling. Every checkpoint flows through Firebase in real-time — from the volunteer's phone to the athlete's screen.
          </p>
        </div>

        {/* Table */}
        <div className="border-t border-rule">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="group border-b border-rule grid grid-cols-[48px_1fr] lg:grid-cols-[64px_200px_1fr_120px] items-start gap-6 lg:gap-12 py-8 hover:bg-white/[0.018] transition-colors duration-200 cursor-default"
            >
              {/* Number */}
              <span className="font-display text-3xl lg:text-4xl text-rule group-hover:text-lime/20 transition-colors duration-300 leading-none pt-1 tabular-nums">
                {s.n}
              </span>

              {/* App label + Title */}
              <div className="col-span-1">
                <span className={`text-[10px] font-body font-bold tracking-[0.18em] uppercase mb-1.5 block ${s.appColor}`}>
                  {s.app}
                </span>
                <h3 className="font-display text-white text-lg lg:text-xl tracking-wide leading-tight">
                  {s.title}
                </h3>
              </div>

              {/* Body */}
              <p className="col-span-2 lg:col-span-1 text-sm font-body text-mist leading-relaxed">
                {s.body}
              </p>

              {/* Progress — desktop */}
              <div className="hidden lg:flex flex-col justify-center gap-1.5">
                <span className="text-[10px] font-body text-mist/30 tabular-nums">{i + 1}/{STEPS.length}</span>
                <div className="w-full h-px bg-rule overflow-hidden rounded-full">
                  <div
                    className="h-full bg-lime rounded-full transition-all"
                    style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
