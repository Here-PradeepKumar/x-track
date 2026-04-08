const TECH = [
  { label: "Firebase", sub: "Firestore · Auth · Functions · Storage" },
  { label: "Expo / React Native", sub: "iOS & Android" },
  { label: "Next.js 14", sub: "App Router · Server Actions" },
  { label: "NFC", sub: "react-native-nfc-manager" },
  { label: "TypeScript", sub: "End-to-end typed" },
  { label: "Tailwind CSS", sub: "Web dashboard styling" },
];

export default function TechStack() {
  return (
    <section className="relative bg-surface py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-sm">
            <span className="inline-block text-xs font-body font-semibold text-lime tracking-widest uppercase mb-3">
              Built to Scale
            </span>
            <h2 className="font-display font-black text-white text-4xl lg:text-5xl leading-tight">
              PRODUCTION-GRADE<br />
              <span className="text-lime">STACK.</span>
            </h2>
            <p className="mt-3 text-on-surface-variant font-body text-sm leading-relaxed">
              Every piece is chosen for reliability at race day scale — real-time sync with Firebase, native NFC, and a shared TypeScript monorepo.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TECH.map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-outline/20 bg-bg p-4 hover:border-lime/30 transition-colors duration-200 group"
              >
                <p className="font-display font-bold text-white text-base group-hover:text-lime transition-colors duration-200">
                  {t.label}
                </p>
                <p className="mt-1 text-xs font-body text-on-surface-variant">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
