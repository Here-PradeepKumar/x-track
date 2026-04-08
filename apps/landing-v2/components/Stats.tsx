// INVERTED SECTION — lime background, dark text. Shocking contrast vs rest of page.
const NUMBERS = [
  { val: "3", unit: "Apps", desc: "Athlete · Volunteer · Organizer" },
  { val: "6", unit: "Cloud Functions", desc: "Firebase triggers & invites" },
  { val: "∞", unit: "Checkpoints", desc: "Immutable NFC scan records" },
  { val: "0ms", unit: "Polling", desc: "Pure Firestore real-time" },
];

export default function Stats() {
  return (
    <section id="platform" className="bg-lime">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-12 py-20 lg:py-28">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-16 pb-8 border-b border-ink/15">
          <div>
            <span className="text-[11px] font-body font-bold text-ink/50 tracking-[0.2em] uppercase block mb-3">
              What is X-Track?
            </span>
            <h2 className="font-display text-ink text-[clamp(40px,6vw,80px)] leading-[0.92] tracking-[0.02em]">
              OCR RACE MANAGEMENT,<br />REBUILT FROM SCRATCH.
            </h2>
          </div>
          <p className="text-ink/60 font-body text-base leading-relaxed max-w-sm lg:text-right lg:pb-1">
            Volunteers with NFC phones tap athlete wristbands at each obstacle. Athletes see their split times update live. Organizers watch everything from the dashboard.
          </p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {NUMBERS.map((s, i) => (
            <div
              key={s.unit}
              className={`py-8 pr-8 ${i !== 0 ? "border-l border-ink/15 pl-8" : ""}`}
            >
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-[clamp(48px,6vw,72px)] text-ink leading-none">
                  {s.val}
                </span>
              </div>
              <p className="font-body font-bold text-sm text-ink mb-0.5">{s.unit}</p>
              <p className="font-body text-xs text-ink/50 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
